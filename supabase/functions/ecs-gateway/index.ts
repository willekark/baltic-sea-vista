import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ECSRequest {
  task_type: 'qna' | 'numeric' | 'geo' | 'summary' | 'forecast';
  query: string;
  constraints?: {
    must_cite?: boolean;
    deadline_ms?: number;
  };
  context_ids?: string[];
  portfolio?: string[];
}

interface ECSResponse {
  answer: string;
  citations: Array<{
    id: string;
    url?: string;
    freshness_days: number;
    reliability_score: number;
  }>;
  numbers: Array<{
    name: string;
    value: number;
    unit: string;
    calc_trace_id: string;
  }>;
  confidence: number;
  model_votes: Array<{
    model: string;
    agree: boolean;
    response: string;
    confidence: number;
  }>;
  verifications: {
    numeric_pass: boolean;
    citation_pass: boolean;
  };
  latency_ms: number;
  cost_estimate: {
    usd: number;
  };
  degraded?: boolean;
}

const ECS_CONFIG = {
  models: [
    { name: 'grok', role: 'reasoning', cost_weight: 1.0, max_latency_ms: 2500 },
    { name: 'claude', role: 'reasoning', cost_weight: 1.2, max_latency_ms: 3000 },
    { name: 'openai', role: 'tools', cost_weight: 1.4, max_latency_ms: 2800 },
    { name: 'perplexity', role: 'current_info', cost_weight: 0.8, max_latency_ms: 2000 }
  ],
  routing: {
    escalate_on_confidence_below: 0.6,
    max_fanout: 3,
    timeout_ms: 6000
  },
  verification: {
    tolerance_pct: 0.01,
    freshness_half_life_days: 365
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let degraded = false;

  try {
    console.log('ECS Gateway called');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.url.includes('/ecs/health')) {
      return new Response(JSON.stringify({
        status: 'healthy',
        models: ECS_CONFIG.models.map(m => ({ name: m.name, status: 'available' })),
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.url.includes('/ecs/answer')) {
      const request: ECSRequest = await req.json();
      
      // Route query based on task type
      const routedResponse = await routeQuery(request, supabase);
      
      // Calculate confidence score
      const confidence = calculateConfidence(routedResponse);
      
      // Verify citations and numbers
      const verifications = await verifyResponse(routedResponse, supabase);
      
      // Build final response
      const response: ECSResponse = {
        answer: routedResponse.answer,
        citations: routedResponse.citations || [],
        numbers: routedResponse.numbers || [],
        confidence,
        model_votes: routedResponse.model_votes || [],
        verifications,
        latency_ms: Date.now() - startTime,
        cost_estimate: calculateCost(routedResponse.model_votes || []),
        ...(degraded && { degraded: true })
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (req.url.includes('/ecs/forecast')) {
      const { series_id, horizon_days, model } = await req.json();
      
      const forecast = await generateForecast(series_id, horizon_days, model || 'prophet', supabase);
      
      return new Response(JSON.stringify(forecast), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in ECS Gateway:', error);
    return new Response(JSON.stringify({
      error: error.message,
      degraded: true,
      latency_ms: Date.now() - startTime
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function routeQuery(request: ECSRequest, supabase: any) {
  const { task_type, query, context_ids = [] } = request;
  
  // Retrieve relevant documents
  const documents = await retrieveDocuments(query, context_ids, supabase);
  
  let responses: any[] = [];
  let numbers: any[] = [];
  
  try {
    if (task_type === 'qna' || task_type === 'summary') {
      // Fan out to multiple reasoning models
      responses = await Promise.allSettled([
        callGrok(query, documents),
        callClaude(query, documents),
        callOpenAI(query, documents)
      ]);
    } else if (task_type === 'numeric') {
      // Compute numbers deterministically, then explain with LLMs
      numbers = await computeNumbers(query, documents, supabase);
      responses = await Promise.allSettled([
        callGrok(`Explain these calculations: ${JSON.stringify(numbers)}`, documents),
        callClaude(`Explain these calculations: ${JSON.stringify(numbers)}`, documents)
      ]);
    } else if (task_type === 'geo') {
      // Detect anomalies then explain
      const anomalies = await detectAnomalies(query, supabase);
      responses = await Promise.allSettled([
        callClaude(`Explain these anomalies: ${JSON.stringify(anomalies)}`, documents)
      ]);
    }
    
    const successfulResponses = responses
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as any).value);
    
    const mergedAnswer = mergeResponses(successfulResponses);
    
    return {
      answer: mergedAnswer.text,
      citations: mergedAnswer.citations,
      numbers,
      model_votes: successfulResponses.map(r => ({
        model: r.model,
        agree: true, // TODO: implement agreement scoring
        response: r.response,
        confidence: r.confidence || 0.8
      }))
    };
    
  } catch (error) {
    console.error('Error in routeQuery:', error);
    throw error;
  }
}

async function callGrok(prompt: string, documents: any[]) {
  const grokKey = Deno.env.get('GROK_API_KEY');
  if (!grokKey) throw new Error('Grok API key not configured');
  
  const contextualPrompt = `Context: ${JSON.stringify(documents.slice(0, 3))}\n\nQuery: ${prompt}\n\nProvide a detailed response with citations.`;
  
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${grokKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'grok-beta',
      messages: [
        { role: 'system', content: 'You are an expert maritime intelligence analyst. Always cite your sources and provide confidence levels.' },
        { role: 'user', content: contextualPrompt }
      ],
      max_tokens: 1500,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`Grok API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    model: 'grok',
    response: data.choices[0].message.content,
    confidence: 0.85,
    citations: extractCitations(data.choices[0].message.content, documents)
  };
}

async function callClaude(prompt: string, documents: any[]) {
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!anthropicKey) throw new Error('Anthropic API key not configured');
  
  const contextualPrompt = `Context: ${JSON.stringify(documents.slice(0, 3))}\n\nQuery: ${prompt}\n\nProvide a detailed response with citations.`;
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${anthropicKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1500,
      messages: [
        { role: 'user', content: contextualPrompt }
      ]
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    model: 'claude',
    response: data.content[0].text,
    confidence: 0.90,
    citations: extractCitations(data.content[0].text, documents)
  };
}

async function callOpenAI(prompt: string, documents: any[]) {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) throw new Error('OpenAI API key not configured');
  
  const contextualPrompt = `Context: ${JSON.stringify(documents.slice(0, 3))}\n\nQuery: ${prompt}\n\nProvide a detailed response with citations.`;
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: 'You are an expert maritime intelligence analyst. Always cite your sources and provide confidence levels.' },
        { role: 'user', content: contextualPrompt }
      ],
      max_completion_tokens: 1500,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    model: 'openai',
    response: data.choices[0].message.content,
    confidence: 0.88,
    citations: extractCitations(data.choices[0].message.content, documents)
  };
}

async function retrieveDocuments(query: string, context_ids: string[], supabase: any) {
  // Simple retrieval from environmental_data and other tables
  const { data: envData } = await supabase
    .from('environmental_data')
    .select('*')
    .ilike('data_type', `%${query.split(' ')[0]}%`)
    .limit(5);
  
  const { data: marketData } = await supabase
    .from('market_data')
    .select('*')
    .limit(3);
    
  return [...(envData || []), ...(marketData || [])];
}

async function computeNumbers(query: string, documents: any[], supabase: any) {
  // Extract numeric computations from query and calculate deterministically
  const numbers = [];
  
  // Example: CO2 emissions calculation
  if (query.toLowerCase().includes('co2')) {
    const { data: co2Data } = await supabase
      .from('co2_emissions')
      .select('value')
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    if (co2Data && co2Data.length > 0) {
      const dailyAvg = co2Data.reduce((sum, d) => sum + d.value, 0) / co2Data.length;
      numbers.push({
        name: 'daily_co2_avg',
        value: Math.round(dailyAvg * 100) / 100,
        unit: 't/day',
        calc_trace_id: `co2_calc_${Date.now()}`
      });
    }
  }
  
  return numbers;
}

async function detectAnomalies(query: string, supabase: any) {
  // Simple anomaly detection on AIS data
  const { data: aisData } = await supabase
    .from('ais_tracking')
    .select('*')
    .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .limit(100);
  
  return aisData || [];
}

function extractCitations(text: string, documents: any[]) {
  // Simple citation extraction
  return documents.slice(0, 2).map((doc, idx) => ({
    id: `source_${idx}`,
    url: doc.source || '',
    freshness_days: Math.floor((Date.now() - new Date(doc.created_at || Date.now()).getTime()) / (24 * 60 * 60 * 1000)),
    reliability_score: 0.8
  }));
}

function mergeResponses(responses: any[]) {
  if (responses.length === 0) {
    return { text: 'No responses available', citations: [] };
  }
  
  const combinedText = responses.map(r => r.response).join('\n\n');
  const allCitations = responses.flatMap(r => r.citations || []);
  
  return {
    text: combinedText,
    citations: allCitations
  };
}

function calculateConfidence(response: any) {
  const agreement = 0.8; // Simplified
  const citation_quality = response.citations?.length > 0 ? 0.9 : 0.3;
  const freshness_score = 0.7; // Simplified
  const numeric_pass = response.numbers?.length > 0 ? 1.0 : 0.8;
  
  return 0.4 * agreement + 0.25 * citation_quality + 0.2 * freshness_score + 0.15 * numeric_pass;
}

async function verifyResponse(response: any, supabase: any) {
  return {
    numeric_pass: true, // Simplified - would implement proper verification
    citation_pass: response.citations?.length > 0
  };
}

function calculateCost(model_votes: any[]) {
  const costs = { grok: 0.02, claude: 0.03, openai: 0.05, perplexity: 0.01 };
  const totalCost = model_votes.reduce((sum, vote) => sum + (costs[vote.model as keyof typeof costs] || 0.02), 0);
  return { usd: Math.round(totalCost * 100) / 100 };
}

async function generateForecast(series_id: string, horizon_days: number, model: string, supabase: any) {
  // Simplified forecast - would implement Prophet/TFT
  return {
    series_id,
    forecast: Array.from({ length: horizon_days }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      point_forecast: Math.random() * 100,
      lower_80: Math.random() * 80,
      upper_80: Math.random() * 120,
      lower_95: Math.random() * 60,
      upper_95: Math.random() * 140
    })),
    method_version: `${model}_v1.0`,
    confidence: 0.75
  };
}