import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIRequest {
  prompt: string;
  context?: any;
  task_type: 'analysis' | 'report' | 'forecast' | 'recommendation' | 'validation' | 'summary';
  data_source?: 'maritime' | 'environmental' | 'financial' | 'mixed';
  require_consensus?: boolean;
  models?: ('claude' | 'openai' | 'both')[];
  priority?: 'speed' | 'accuracy' | 'consensus';
}

interface AIResponse {
  success: boolean;
  responses: {
    claude?: {
      content: string;
      confidence: number;
      model: string;
      latency: number;
    };
    openai?: {
      content: string;
      confidence: number;
      model: string;
      latency: number;
    };
  };
  consensus?: {
    agreement_score: number;
    key_agreements: string[];
    key_disagreements: string[];
    final_recommendation: string;
    confidence: number;
  };
  metadata: {
    task_type: string;
    models_used: string[];
    total_latency: number;
    timestamp: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { prompt, context, task_type, data_source, require_consensus = true, models = ['both'], priority = 'accuracy' }: AIRequest = await req.json();

    console.log('AI Orchestrator request:', { task_type, data_source, models, priority });

    // Prepare enhanced context with live data if needed
    const enrichedContext = await enrichContext(context, data_source, supabase);
    
    // Route to appropriate models based on request
    const modelPromises: Promise<any>[] = [];
    const modelsToUse = models.includes('both') ? ['claude', 'openai'] : models;

    if (modelsToUse.includes('claude')) {
      modelPromises.push(callClaude(prompt, enrichedContext, task_type, priority));
    }
    
    if (modelsToUse.includes('openai')) {
      modelPromises.push(callOpenAI(prompt, enrichedContext, task_type, priority));
    }

    // Execute all model calls in parallel
    const modelResults = await Promise.allSettled(modelPromises);
    
    // Process results
    const responses: any = {};
    const errors: string[] = [];

    modelResults.forEach((result, index) => {
      const modelName = modelsToUse[index];
      if (result.status === 'fulfilled') {
        responses[modelName] = result.value;
      } else {
        errors.push(`${modelName}: ${result.reason}`);
        console.error(`Error with ${modelName}:`, result.reason);
      }
    });

    // Generate consensus if multiple models were used and consensus is required
    let consensus = null;
    if (require_consensus && Object.keys(responses).length > 1) {
      consensus = await generateConsensus(responses, task_type, prompt);
    }

    const totalLatency = Date.now() - startTime;

    const result: AIResponse = {
      success: true,
      responses,
      consensus,
      metadata: {
        task_type,
        models_used: Object.keys(responses),
        total_latency: totalLatency,
        timestamp: new Date().toISOString()
      }
    };

    // Store result for analytics if configured
    await storeAnalytics(result, supabase);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Orchestrator error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function enrichContext(context: any, dataSource: string | undefined, supabase: any) {
  if (!dataSource) return context;

  const enrichedContext = { ...context };

  try {
    switch (dataSource) {
      case 'maritime':
        // Fetch latest maritime data
        const { data: marineData } = await supabase.functions.invoke('fetch-baltic-marine-data', {
          body: { basin: 'baltic_proper', depth: 'surface', timeMode: 'nowcast' }
        });
        enrichedContext.maritime_data = marineData;
        break;
        
      case 'financial':
        // Fetch latest stock data
        const { data: stockData } = await supabase.functions.invoke('enhanced-stock-data', {
          body: { symbols: ['AMKBY', 'DNNGY', 'EQNR', 'NOV'], priority: 'accuracy' }
        });
        enrichedContext.financial_data = stockData;
        break;
        
      case 'environmental':
        // Fetch environmental indicators
        const { data: envData } = await supabase.functions.invoke('get-dashboard-data');
        enrichedContext.environmental_data = envData;
        break;
        
      case 'mixed':
        // Fetch all data types
        const [marine, financial, environmental] = await Promise.allSettled([
          supabase.functions.invoke('fetch-baltic-marine-data', {
            body: { basin: 'baltic_proper', depth: 'surface', timeMode: 'nowcast' }
          }),
          supabase.functions.invoke('enhanced-stock-data', {
            body: { symbols: ['AMKBY', 'DNNGY'], priority: 'speed' }
          }),
          supabase.functions.invoke('get-dashboard-data')
        ]);
        
        enrichedContext.mixed_data = {
          maritime: marine.status === 'fulfilled' ? marine.value.data : null,
          financial: financial.status === 'fulfilled' ? financial.value.data : null,
          environmental: environmental.status === 'fulfilled' ? environmental.value.data : null
        };
        break;
    }
  } catch (error) {
    console.error('Error enriching context:', error);
  }

  return enrichedContext;
}

async function callClaude(prompt: string, context: any, taskType: string, priority: string) {
  const startTime = Date.now();
  const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
  
  if (!anthropicApiKey) {
    throw new Error('Claude API key not configured');
  }

  const systemPrompt = getSystemPrompt(taskType, 'claude');
  const model = priority === 'speed' ? 'claude-3-5-haiku-20241022' : 'claude-3-5-sonnet-20241022';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${anthropicApiKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `${systemPrompt}\n\nUser Query: ${prompt}\n\nContext Data: ${JSON.stringify(context, null, 2)}`
        }
      ]
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const latency = Date.now() - startTime;

  return {
    content: data.content[0].text,
    confidence: calculateConfidence(data.content[0].text, taskType),
    model,
    latency
  };
}

async function callOpenAI(prompt: string, context: any, taskType: string, priority: string) {
  const startTime = Date.now();
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = getSystemPrompt(taskType, 'openai');
  const model = priority === 'speed' ? 'gpt-4o-mini' : 'gpt-4o';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `${prompt}\n\nContext: ${JSON.stringify(context, null, 2)}`
        }
      ],
      max_tokens: 4000,
      temperature: 0.7
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const latency = Date.now() - startTime;

  return {
    content: data.choices[0].message.content,
    confidence: calculateConfidence(data.choices[0].message.content, taskType),
    model,
    latency
  };
}

function getSystemPrompt(taskType: string, aiModel: string): string {
  const basePrompts = {
    analysis: "You are an expert analyst specializing in Baltic Sea maritime intelligence, environmental monitoring, and financial markets. Provide detailed, data-driven analysis with specific insights and actionable recommendations.",
    report: "You are a professional report writer creating comprehensive, structured reports for maritime and environmental intelligence. Include executive summaries, key findings, recommendations, and data visualizations descriptions.",
    forecast: "You are a forecasting specialist providing predictive analysis for maritime conditions, market trends, and environmental changes in the Baltic Sea region. Include confidence intervals and risk assessments.",
    recommendation: "You are a strategic advisor providing actionable recommendations based on maritime, environmental, and financial data. Prioritize practical, implementable solutions with clear ROI projections.",
    validation: "You are a data validation expert cross-checking information for accuracy, consistency, and reliability. Identify potential issues, anomalies, and areas requiring further investigation.",
    summary: "You are an executive briefing specialist creating concise, high-impact summaries for decision makers. Focus on key insights, critical alerts, and immediate action items."
  };

  const modelSpecific = aiModel === 'claude' 
    ? " Leverage your analytical depth and reasoning capabilities."
    : " Utilize your broad knowledge base and creative problem-solving abilities.";

  return (basePrompts[taskType as keyof typeof basePrompts] || basePrompts.analysis) + modelSpecific;
}

function calculateConfidence(content: string, taskType: string): number {
  // Simple confidence calculation based on content analysis
  let confidence = 0.5;
  
  // Check for uncertainty indicators
  const uncertaintyWords = ['might', 'could', 'possibly', 'unclear', 'uncertain'];
  const confidenceWords = ['confirmed', 'certain', 'definitive', 'proven', 'verified'];
  
  const uncertaintyCount = uncertaintyWords.reduce((count, word) => 
    count + (content.toLowerCase().split(word).length - 1), 0);
  const confidenceCount = confidenceWords.reduce((count, word) => 
    count + (content.toLowerCase().split(word).length - 1), 0);
    
  confidence += (confidenceCount * 0.1) - (uncertaintyCount * 0.1);
  
  // Adjust based on content length and structure
  if (content.length > 1000 && content.includes('data') && content.includes('analysis')) {
    confidence += 0.2;
  }
  
  return Math.max(0.1, Math.min(0.95, confidence));
}

async function generateConsensus(responses: any, taskType: string, originalPrompt: string) {
  const responseContents = Object.values(responses).map((r: any) => r.content);
  
  // Simple consensus analysis
  const agreements = findAgreements(responseContents);
  const disagreements = findDisagreements(responseContents);
  const agreementScore = agreements.length / (agreements.length + disagreements.length + 1);
  
  // Generate final recommendation
  const avgConfidence = Object.values(responses).reduce((sum: number, r: any) => sum + r.confidence, 0) / Object.keys(responses).length;
  
  return {
    agreement_score: agreementScore,
    key_agreements: agreements.slice(0, 5),
    key_disagreements: disagreements.slice(0, 3),
    final_recommendation: generateFinalRecommendation(responses, taskType),
    confidence: avgConfidence * agreementScore
  };
}

function findAgreements(contents: string[]): string[] {
  // Simple keyword matching for agreements
  const commonKeywords = ['increase', 'decrease', 'stable', 'risk', 'opportunity', 'recommend'];
  const agreements: string[] = [];
  
  for (const keyword of commonKeywords) {
    const mentionCount = contents.filter(content => 
      content.toLowerCase().includes(keyword)).length;
    if (mentionCount === contents.length) {
      agreements.push(`All models agree on ${keyword}`);
    }
  }
  
  return agreements;
}

function findDisagreements(contents: string[]): string[] {
  // Simple analysis for disagreements
  const disagreements: string[] = [];
  
  // Check for conflicting recommendations
  const hasPositive = contents.some(content => 
    content.toLowerCase().includes('buy') || content.toLowerCase().includes('positive'));
  const hasNegative = contents.some(content => 
    content.toLowerCase().includes('sell') || content.toLowerCase().includes('negative'));
  
  if (hasPositive && hasNegative) {
    disagreements.push('Conflicting buy/sell recommendations');
  }
  
  return disagreements;
}

function generateFinalRecommendation(responses: any, taskType: string): string {
  const models = Object.keys(responses);
  const avgConfidence = Object.values(responses).reduce((sum: number, r: any) => sum + r.confidence, 0) / models.length;
  
  if (avgConfidence > 0.8) {
    return `High confidence consensus recommendation based on ${models.join(' and ')} analysis.`;
  } else if (avgConfidence > 0.6) {
    return `Moderate confidence recommendation with some areas of uncertainty.`;
  } else {
    return `Low confidence recommendation requiring additional validation and data.`;
  }
}

async function storeAnalytics(result: AIResponse, supabase: any) {
  try {
    // Store analytics for performance monitoring
    const { error } = await supabase.from('ai_analytics').insert({
      task_type: result.metadata.task_type,
      models_used: result.metadata.models_used,
      total_latency: result.metadata.total_latency,
      consensus_score: result.consensus?.agreement_score || null,
      timestamp: result.metadata.timestamp
    });
    
    if (error) console.warn('Analytics storage failed:', error);
  } catch (error) {
    console.warn('Analytics storage error:', error);
  }
}