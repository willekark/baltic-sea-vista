import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MultiAIRequest {
  prompt: string;
  analysisType: 'environmental' | 'maritime' | 'market' | 'risk' | 'route-optimization';
  data?: any;
  includeEngines?: ('openai' | 'grok' | 'perplexity')[];
}

interface AIResponse {
  engine: string;
  response: string;
  confidence?: number;
  timestamp: string;
  error?: string;
}

interface MultiAIAnalysis {
  prompt: string;
  analysisType: string;
  responses: AIResponse[];
  consensus: {
    agreements: string[];
    disagreements: string[];
    confidence_score: number;
    recommended_action: string;
  };
  timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Multi-AI Analysis function called');
    
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const grokKey = Deno.env.get('GROK_API_KEY');
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    
    if (!openaiKey && !grokKey && !perplexityKey) {
      throw new Error('No AI API keys available');
    }

    const { prompt, analysisType, data, includeEngines = ['openai', 'grok', 'perplexity'] }: MultiAIRequest = await req.json();
    
    console.log(`Analyzing with engines: ${includeEngines.join(', ')}`);
    
    // Construct contextual prompt based on analysis type
    const contextualPrompt = constructContextualPrompt(prompt, analysisType, data);
    
    // Query all available AI engines in parallel
    const aiPromises: Promise<AIResponse>[] = [];
    
    if (includeEngines.includes('openai') && openaiKey) {
      aiPromises.push(queryOpenAI(contextualPrompt, openaiKey));
    }
    
    if (includeEngines.includes('grok') && grokKey) {
      aiPromises.push(queryGrok(contextualPrompt, grokKey));
    }
    
    if (includeEngines.includes('perplexity') && perplexityKey) {
      aiPromises.push(queryPerplexity(contextualPrompt, perplexityKey));
    }
    
    // Wait for all AI responses
    const aiResponses = await Promise.allSettled(aiPromises);
    const successfulResponses: AIResponse[] = [];
    
    aiResponses.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successfulResponses.push(result.value);
      } else {
        console.error(`AI engine ${index} failed:`, result.reason);
        successfulResponses.push({
          engine: ['openai', 'grok', 'perplexity'][index],
          response: '',
          error: result.reason?.message || 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // Generate consensus analysis
    const consensus = generateConsensusAnalysis(successfulResponses, analysisType);
    
    const analysis: MultiAIAnalysis = {
      prompt,
      analysisType,
      responses: successfulResponses,
      consensus,
      timestamp: new Date().toISOString()
    };
    
    console.log('Multi-AI analysis completed successfully');
    
    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in multi-ai-analysis function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function constructContextualPrompt(prompt: string, analysisType: string, data?: any): string {
  const context = {
    environmental: "You are an environmental marine scientist analyzing Baltic Sea data. Focus on eutrophication, water quality, and ecological impacts.",
    maritime: "You are a maritime intelligence analyst. Focus on shipping routes, vessel movements, and port operations.",
    market: "You are a shipping market analyst. Focus on freight rates, capacity utilization, and economic trends.",
    risk: "You are a risk assessment specialist. Focus on operational, environmental, and geopolitical risks.",
    'route-optimization': "You are a maritime route optimization expert. Focus on fuel efficiency, time savings, and operational costs."
  };
  
  let contextualPrompt = `${context[analysisType as keyof typeof context] || context.maritime}\n\n`;
  
  if (data) {
    contextualPrompt += `Context Data: ${JSON.stringify(data, null, 2)}\n\n`;
  }
  
  contextualPrompt += `Analysis Request: ${prompt}\n\n`;
  contextualPrompt += "Provide a detailed, evidence-based analysis with specific recommendations. Include confidence levels where appropriate.";
  
  return contextualPrompt;
}

async function queryOpenAI(prompt: string, apiKey: string): Promise<AIResponse> {
  try {
    console.log('Querying OpenAI...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: 'You are an expert maritime intelligence analyst with deep knowledge of shipping, environmental data, and risk assessment.' },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      engine: 'OpenAI GPT-4.1',
      response: data.choices[0].message.content,
      confidence: 0.85,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('OpenAI query failed:', error);
    throw error;
  }
}

async function queryGrok(prompt: string, apiKey: string): Promise<AIResponse> {
  try {
    console.log('Querying Grok...');
    
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          { role: 'system', content: 'You are Grok, an AI with real-time knowledge and a unique perspective on maritime intelligence, shipping markets, and environmental analysis. Provide insights that complement traditional analysis with current market conditions and unconventional viewpoints.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      engine: 'Grok (xAI)',
      response: data.choices[0].message.content,
      confidence: 0.80,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Grok query failed:', error);
    throw error;
  }
}

async function queryPerplexity(prompt: string, apiKey: string): Promise<AIResponse> {
  try {
    console.log('Querying Perplexity...');
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          { role: 'system', content: 'You are an AI with access to real-time information. Focus on current market conditions, recent regulatory changes, and up-to-date environmental data in your maritime analysis.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.3,
        search_recency_filter: 'month',
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      engine: 'Perplexity Sonar',
      response: data.choices[0].message.content,
      confidence: 0.90,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Perplexity query failed:', error);
    throw error;
  }
}

function generateConsensusAnalysis(responses: AIResponse[], analysisType: string): any {
  const validResponses = responses.filter(r => r.response && !r.error);
  
  if (validResponses.length === 0) {
    return {
      agreements: [],
      disagreements: ['No valid AI responses received'],
      confidence_score: 0,
      recommended_action: 'Unable to provide recommendations due to AI service failures'
    };
  }
  
  // Extract key themes from responses
  const allResponses = validResponses.map(r => r.response.toLowerCase());
  
  // Find common themes (simplified approach)
  const commonKeywords = findCommonKeywords(allResponses);
  const agreements = commonKeywords.length > 0 ? 
    [`Multiple AI engines agree on: ${commonKeywords.join(', ')}`] : 
    ['Limited consensus found between AI responses'];
  
  // Calculate confidence based on response consistency and individual confidence scores
  const avgConfidence = validResponses.reduce((sum, r) => sum + (r.confidence || 0.5), 0) / validResponses.length;
  
  // Generate synthesis
  const recommended_action = synthesizeRecommendations(validResponses, analysisType);
  
  return {
    agreements,
    disagreements: responses.length > validResponses.length ? ['Some AI services failed to respond'] : [],
    confidence_score: Math.round(avgConfidence * 100) / 100,
    recommended_action
  };
}

function findCommonKeywords(responses: string[]): string[] {
  const keywords = ['risk', 'optimization', 'efficiency', 'cost', 'environmental', 'route', 'fuel', 'weather', 'port', 'vessel'];
  return keywords.filter(keyword => 
    responses.filter(response => response.includes(keyword)).length >= Math.ceil(responses.length / 2)
  );
}

function synthesizeRecommendations(responses: AIResponse[], analysisType: string): string {
  const engines = responses.map(r => r.engine).join(', ');
  return `Based on analysis from ${engines}, recommend implementing a multi-perspective approach to ${analysisType} decisions. Cross-validate critical recommendations across all AI sources before implementation.`;
}