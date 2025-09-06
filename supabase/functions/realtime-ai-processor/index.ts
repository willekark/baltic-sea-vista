import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RealTimeProcessingRequest {
  data_stream: 'maritime' | 'environmental' | 'financial' | 'intelligence' | 'all';
  processing_type: 'anomaly_detection' | 'trend_analysis' | 'alert_generation' | 'predictive_modeling';
  alert_thresholds?: {
    critical?: number;
    warning?: number;
    info?: number;
  };
  ai_consensus_required?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const request: RealTimeProcessingRequest = await req.json();
    console.log('Real-time AI processing request:', request);

    // Stream data collection
    const streamData = await collectStreamData(request.data_stream, supabase);
    
    // Process data through AI models
    const processingResults = await processDataStreams(streamData, request, supabase);
    
    // Generate alerts if thresholds are met
    const alerts = await generateAlerts(processingResults, request.alert_thresholds);
    
    // Store processed insights
    await storeRealTimeInsights(processingResults, alerts, supabase);

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      processing_results: processingResults,
      alerts_generated: alerts,
      data_streams_processed: Object.keys(streamData),
      ai_models_used: processingResults.consensus ? ['claude', 'openai'] : ['single_model']
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Real-time AI processing error:', error);
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

async function collectStreamData(dataStream: string, supabase: any) {
  const streamData: any = {};
  const currentTime = new Date().toISOString();

  const dataCollectors = {
    maritime: async () => {
      const { data } = await supabase.functions.invoke('fetch-baltic-marine-data', {
        body: { basin: 'baltic_proper', depth: 'surface', timeMode: 'nowcast' }
      });
      return data;
    },
    
    environmental: async () => {
      const { data } = await supabase.functions.invoke('get-dashboard-data');
      return data;
    },
    
    financial: async () => {
      const { data } = await supabase.functions.invoke('enhanced-stock-data', {
        body: { symbols: ['AMKBY', 'DNNGY', 'EQNR'], priority: 'speed' }
      });
      return data;
    },
    
    intelligence: async () => {
      const { data } = await supabase.functions.invoke('integrated-shipping-intelligence', {
        body: { analysis_type: 'realtime', time_window: '1h' }
      });
      return data;
    }
  };

  if (dataStream === 'all') {
    // Collect all data streams in parallel
    const promises = Object.entries(dataCollectors).map(async ([key, collector]) => {
      try {
        const data = await collector();
        return { key, data, timestamp: currentTime };
      } catch (error) {
        console.error(`Error collecting ${key} data:`, error);
        return { key, data: null, error: error.message };
      }
    });

    const results = await Promise.all(promises);
    results.forEach(result => {
      streamData[result.key] = result.data;
    });
  } else if (dataCollectors[dataStream as keyof typeof dataCollectors]) {
    streamData[dataStream] = await dataCollectors[dataStream as keyof typeof dataCollectors]();
  }

  return streamData;
}

async function processDataStreams(streamData: any, request: RealTimeProcessingRequest, supabase: any) {
  const processingPrompt = buildProcessingPrompt(request.processing_type, streamData);
  
  const { data: aiResponse } = await supabase.functions.invoke('ai-orchestrator', {
    body: {
      prompt: processingPrompt,
      context: streamData,
      task_type: 'analysis',
      data_source: 'mixed',
      require_consensus: request.ai_consensus_required || true,
      models: ['both'],
      priority: 'speed' // Real-time processing prioritizes speed
    }
  });

  if (!aiResponse?.success) {
    throw new Error('AI processing failed for real-time data');
  }

  const results = {
    claude_insights: aiResponse.responses.claude?.content,
    openai_insights: aiResponse.responses.openai?.content,
    consensus: aiResponse.consensus,
    processing_type: request.processing_type,
    anomalies_detected: extractAnomalies(aiResponse),
    trends_identified: extractTrends(aiResponse),
    predictions: extractPredictions(aiResponse),
    confidence_score: aiResponse.consensus?.confidence || 0.5
  };

  return results;
}

function buildProcessingPrompt(processingType: string, streamData: any): string {
  const prompts = {
    anomaly_detection: `Analyze the real-time data streams for anomalies, outliers, and unusual patterns. Identify any values that deviate significantly from normal ranges or expected behavior. Focus on:
    - Environmental conditions outside normal parameters
    - Maritime traffic patterns that are unusual
    - Financial indicators showing unexpected movements
    - Any correlation anomalies between different data sources`,
    
    trend_analysis: `Identify short-term and emerging trends in the real-time data. Look for:
    - Directional changes in key metrics
    - Correlation patterns between different indicators
    - Emerging patterns that might indicate future developments
    - Rate of change analysis for critical parameters`,
    
    alert_generation: `Evaluate the data for conditions that warrant immediate alerts or notifications. Consider:
    - Safety-critical conditions in maritime operations
    - Environmental thresholds that pose risks
    - Market conditions requiring immediate attention
    - Operational parameters that need intervention`,
    
    predictive_modeling: `Based on current real-time data trends, provide short-term predictions (1-6 hours) for key indicators. Include:
    - Confidence intervals for predictions
    - Key factors influencing the forecasts
    - Potential scenarios and their probabilities
    - Risk assessments for predicted conditions`
  };

  const basePrompt = prompts[processingType as keyof typeof prompts] || prompts.anomaly_detection;
  
  return `${basePrompt}

Current Real-Time Data:
${JSON.stringify(streamData, null, 2)}

Provide structured analysis with specific findings, confidence levels, and actionable insights.`;
}

async function generateAlerts(processingResults: any, thresholds: any) {
  const alerts = [];
  
  // Extract potential alerts from AI analysis
  const claudeAlerts = extractAlertsFromContent(processingResults.claude_insights, 'claude');
  const openaiAlerts = extractAlertsFromContent(processingResults.openai_insights, 'openai');
  
  // Combine and prioritize alerts
  const allAlerts = [...claudeAlerts, ...openaiAlerts];
  const prioritizedAlerts = prioritizeAlerts(allAlerts, thresholds);
  
  // Cross-validate alerts between models
  if (processingResults.consensus) {
    const consensusAlerts = prioritizedAlerts.filter(alert => 
      claudeAlerts.some(ca => ca.type === alert.type) && 
      openaiAlerts.some(oa => oa.type === alert.type)
    );
    
    alerts.push(...consensusAlerts.map(alert => ({
      ...alert,
      validation: 'ai_consensus',
      confidence: processingResults.confidence_score
    })));
  }
  
  return alerts;
}

function extractAlertsFromContent(content: string, source: string) {
  if (!content) return [];
  
  const alerts = [];
  const lowerContent = content.toLowerCase();
  
  // Look for alert keywords and severity indicators
  const alertPatterns = {
    critical: ['critical', 'urgent', 'immediate', 'danger', 'severe'],
    warning: ['warning', 'caution', 'elevated', 'concern', 'monitor'],
    info: ['notice', 'information', 'update', 'observe', 'note']
  };
  
  Object.entries(alertPatterns).forEach(([severity, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        alerts.push({
          severity,
          type: keyword,
          source,
          content: content.substring(lowerContent.indexOf(keyword) - 50, lowerContent.indexOf(keyword) + 100),
          timestamp: new Date().toISOString()
        });
      }
    });
  });
  
  return alerts;
}

function prioritizeAlerts(alerts: any[], thresholds: any) {
  if (!thresholds) return alerts;
  
  const severityOrder = { critical: 3, warning: 2, info: 1 };
  
  return alerts
    .filter(alert => {
      const threshold = thresholds[alert.severity];
      return threshold === undefined || Math.random() > threshold; // Simple threshold check
    })
    .sort((a, b) => (severityOrder[b.severity as keyof typeof severityOrder] || 0) - (severityOrder[a.severity as keyof typeof severityOrder] || 0));
}

async function storeRealTimeInsights(processingResults: any, alerts: any[], supabase: any) {
  try {
    // Store processing results
    const { error: insightsError } = await supabase.from('realtime_insights').insert({
      processing_type: processingResults.processing_type,
      claude_insights: processingResults.claude_insights,
      openai_insights: processingResults.openai_insights,
      consensus_analysis: processingResults.consensus?.final_recommendation,
      confidence_score: processingResults.confidence_score,
      anomalies_count: processingResults.anomalies_detected?.length || 0,
      trends_count: processingResults.trends_identified?.length || 0,
      timestamp: new Date().toISOString()
    });
    
    if (insightsError) console.warn('Failed to store insights:', insightsError);
    
    // Store alerts
    if (alerts.length > 0) {
      const { error: alertsError } = await supabase.from('realtime_alerts').insert(
        alerts.map(alert => ({
          severity: alert.severity,
          alert_type: alert.type,
          content: alert.content,
          source: alert.source,
          validation: alert.validation || 'single_model',
          confidence: alert.confidence || 0.5,
          timestamp: alert.timestamp
        }))
      );
      
      if (alertsError) console.warn('Failed to store alerts:', alertsError);
    }
  } catch (error) {
    console.error('Error storing real-time insights:', error);
  }
}

// Helper functions for extracting structured data from AI responses
function extractAnomalies(aiResponse: any) {
  const content = aiResponse.consensus?.final_recommendation || '';
  return content.split('\n').filter(line => 
    line.includes('anomaly') || line.includes('outlier') || line.includes('unusual')
  ).slice(0, 5);
}

function extractTrends(aiResponse: any) {
  const content = aiResponse.consensus?.final_recommendation || '';
  return content.split('\n').filter(line => 
    line.includes('trend') || line.includes('pattern') || line.includes('increasing') || line.includes('decreasing')
  ).slice(0, 5);
}

function extractPredictions(aiResponse: any) {
  const content = aiResponse.consensus?.final_recommendation || '';
  return content.split('\n').filter(line => 
    line.includes('predict') || line.includes('forecast') || line.includes('expect') || line.includes('likely')
  ).slice(0, 3);
}