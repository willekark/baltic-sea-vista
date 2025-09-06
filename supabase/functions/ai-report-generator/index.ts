import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportRequest {
  report_type: 'executive' | 'technical' | 'environmental' | 'financial' | 'operational' | 'comprehensive';
  time_range?: 'realtime' | '24h' | '7d' | '30d';
  data_sources: string[];
  format: 'structured' | 'narrative' | 'executive_summary';
  include_charts?: boolean;
  include_predictions?: boolean;
  stakeholder_level: 'executive' | 'operational' | 'technical';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const request: ReportRequest = await req.json();
    console.log('Generating AI-powered report:', request);

    // Gather all relevant data
    const dataCollection = await gatherReportData(request, supabase);
    
    // Generate report using AI orchestrator
    const reportContent = await generateReportWithAI(request, dataCollection, supabase);
    
    // Generate visual elements if requested
    const visualElements = request.include_charts ? 
      await generateVisualElements(dataCollection, request.report_type) : null;
    
    // Generate predictions if requested
    const predictions = request.include_predictions ? 
      await generatePredictions(dataCollection, supabase) : null;

    const finalReport = {
      success: true,
      report: {
        metadata: {
          type: request.report_type,
          generated_at: new Date().toISOString(),
          data_sources: request.data_sources,
          stakeholder_level: request.stakeholder_level,
          ai_models_used: ['claude', 'openai']
        },
        content: reportContent,
        visual_elements: visualElements,
        predictions: predictions,
        executive_summary: await generateExecutiveSummary(reportContent, supabase),
        recommendations: await generateRecommendations(reportContent, request.report_type, supabase)
      }
    };

    return new Response(JSON.stringify(finalReport), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Report generation error:', error);
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

async function gatherReportData(request: ReportRequest, supabase: any) {
  const dataCollection: any = {};
  
  const dataPromises = request.data_sources.map(async (source) => {
    switch (source) {
      case 'maritime':
        const { data: maritime } = await supabase.functions.invoke('fetch-baltic-marine-data', {
          body: { basin: 'baltic_proper', depth: 'surface', timeMode: 'nowcast' }
        });
        return { source: 'maritime', data: maritime };
        
      case 'financial':
        const { data: financial } = await supabase.functions.invoke('enhanced-stock-data', {
          body: { symbols: ['AMKBY', 'DNNGY', 'EQNR', 'NOV'], priority: 'accuracy' }
        });
        return { source: 'financial', data: financial };
        
      case 'environmental':
        const { data: environmental } = await supabase.functions.invoke('get-dashboard-data');
        return { source: 'environmental', data: environmental };
        
      case 'intelligence':
        const { data: intelligence } = await supabase.functions.invoke('integrated-shipping-intelligence', {
          body: { analysis_type: 'comprehensive' }
        });
        return { source: 'intelligence', data: intelligence };
        
      case 'shadow-fleet':
        const { data: shadowFleet } = await supabase.functions.invoke('shadow-fleet-analysis', {
          body: { region: 'baltic', time_range: request.time_range || '24h' }
        });
        return { source: 'shadow-fleet', data: shadowFleet };
        
      default:
        return { source, data: null };
    }
  });

  const results = await Promise.allSettled(dataPromises);
  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value.data) {
      dataCollection[result.value.source] = result.value.data;
    }
  });

  return dataCollection;
}

async function generateReportWithAI(request: ReportRequest, data: any, supabase: any) {
  const prompt = buildReportPrompt(request, data);
  
  const { data: aiResponse } = await supabase.functions.invoke('ai-orchestrator', {
    body: {
      prompt,
      context: data,
      task_type: 'report',
      data_source: 'mixed',
      require_consensus: true,
      models: ['both'],
      priority: 'accuracy'
    }
  });

  if (!aiResponse?.success) {
    throw new Error('AI report generation failed');
  }

  return {
    claude_analysis: aiResponse.responses.claude?.content,
    openai_analysis: aiResponse.responses.openai?.content,
    consensus_report: aiResponse.consensus?.final_recommendation,
    confidence_score: aiResponse.consensus?.confidence || 0.5
  };
}

function buildReportPrompt(request: ReportRequest, data: any): string {
  const basePrompt = `Generate a comprehensive ${request.report_type} report for ${request.stakeholder_level} stakeholders covering the Baltic Sea maritime intelligence platform.`;
  
  const dataDescription = Object.keys(data).map(source => 
    `- ${source}: ${data[source] ? 'Available' : 'Not available'}`
  ).join('\n');

  const formatInstructions = {
    structured: "Use clear sections with headers, bullet points, and data tables where appropriate.",
    narrative: "Present as a flowing narrative with insights woven throughout the story.",
    executive_summary: "Focus on key findings, critical metrics, and actionable insights in brief format."
  };

  const stakeholderFocus = {
    executive: "Focus on strategic implications, ROI, and high-level decision support.",
    operational: "Include tactical recommendations, process improvements, and operational metrics.",
    technical: "Provide detailed technical analysis, methodology explanations, and implementation details."
  };

  return `${basePrompt}

Report Requirements:
- Format: ${formatInstructions[request.format]}
- Stakeholder Focus: ${stakeholderFocus[request.stakeholder_level]}
- Time Range: ${request.time_range || 'Current'}

Available Data Sources:
${dataDescription}

Please provide:
1. Current situation analysis
2. Key performance indicators and trends
3. Risk assessments and opportunities
4. Strategic recommendations
5. Implementation priorities

Ensure cross-validation of findings across all available data sources and highlight any discrepancies or areas requiring attention.`;
}

async function generateVisualElements(data: any, reportType: string) {
  const visualElements = [];
  
  // Define key charts based on available data
  if (data.maritime) {
    visualElements.push({
      type: 'line_chart',
      title: 'Baltic Sea Environmental Conditions',
      description: 'Key maritime indicators over time',
      data_points: ['oxygen_levels', 'sea_temperature', 'wave_height'],
      chart_config: {
        x_axis: 'time',
        y_axis: 'value',
        multiple_series: true
      }
    });
  }

  if (data.financial) {
    visualElements.push({
      type: 'performance_chart',
      title: 'Baltic Investment Performance',
      description: 'Stock performance and market indicators',
      data_points: ['price_changes', 'volume', 'market_sentiment'],
      chart_config: {
        chart_type: 'candlestick',
        timeframe: 'daily'
      }
    });
  }

  if (data.intelligence) {
    visualElements.push({
      type: 'heatmap',
      title: 'Shipping Route Intensity',
      description: 'Maritime traffic patterns and optimization opportunities',
      data_points: ['route_efficiency', 'cargo_flows', 'port_utilization'],
      chart_config: {
        geographic: true,
        color_scale: 'traffic_intensity'
      }
    });
  }

  return visualElements;
}

async function generatePredictions(data: any, supabase: any) {
  const { data: predictionResponse } = await supabase.functions.invoke('ai-orchestrator', {
    body: {
      prompt: "Based on the current data trends, provide 7-day and 30-day predictions for key maritime, environmental, and financial indicators in the Baltic Sea region.",
      context: data,
      task_type: 'forecast',
      data_source: 'mixed',
      require_consensus: true,
      models: ['both'],
      priority: 'accuracy'
    }
  });

  return {
    short_term: {
      timeframe: '7 days',
      predictions: predictionResponse?.responses?.claude?.content || 'Predictions unavailable',
      confidence: predictionResponse?.consensus?.confidence || 0.5
    },
    medium_term: {
      timeframe: '30 days',
      predictions: predictionResponse?.responses?.openai?.content || 'Predictions unavailable',
      confidence: predictionResponse?.consensus?.confidence || 0.5
    }
  };
}

async function generateExecutiveSummary(reportContent: any, supabase: any) {
  const { data: summaryResponse } = await supabase.functions.invoke('ai-orchestrator', {
    body: {
      prompt: "Create a concise executive summary highlighting the most critical findings, immediate action items, and strategic implications from this comprehensive report.",
      context: reportContent,
      task_type: 'summary',
      require_consensus: true,
      models: ['both'],
      priority: 'accuracy'
    }
  });

  return {
    key_findings: extractKeyFindings(summaryResponse),
    immediate_actions: extractImmediateActions(summaryResponse),
    strategic_implications: extractStrategicImplications(summaryResponse),
    confidence_level: summaryResponse?.consensus?.confidence || 0.5
  };
}

async function generateRecommendations(reportContent: any, reportType: string, supabase: any) {
  const { data: recommendationResponse } = await supabase.functions.invoke('ai-orchestrator', {
    body: {
      prompt: `Based on this ${reportType} report analysis, provide specific, actionable recommendations with implementation priorities and expected outcomes.`,
      context: reportContent,
      task_type: 'recommendation',
      require_consensus: true,
      models: ['both'],
      priority: 'accuracy'
    }
  });

  return {
    high_priority: extractHighPriorityActions(recommendationResponse),
    medium_priority: extractMediumPriorityActions(recommendationResponse),
    long_term: extractLongTermActions(recommendationResponse),
    risk_mitigation: extractRiskMitigation(recommendationResponse),
    confidence_level: recommendationResponse?.consensus?.confidence || 0.5
  };
}

// Helper functions for extracting structured information
function extractKeyFindings(response: any): string[] {
  const content = response?.consensus?.final_recommendation || '';
  // Simple extraction - in production, use more sophisticated NLP
  return content.split('\n').filter(line => 
    line.includes('finding') || line.includes('key') || line.includes('important')
  ).slice(0, 5);
}

function extractImmediateActions(response: any): string[] {
  const content = response?.consensus?.final_recommendation || '';
  return content.split('\n').filter(line => 
    line.includes('immediate') || line.includes('urgent') || line.includes('now')
  ).slice(0, 3);
}

function extractStrategicImplications(response: any): string[] {
  const content = response?.consensus?.final_recommendation || '';
  return content.split('\n').filter(line => 
    line.includes('strategic') || line.includes('long-term') || line.includes('impact')
  ).slice(0, 3);
}

function extractHighPriorityActions(response: any): string[] {
  const content = response?.consensus?.final_recommendation || '';
  return content.split('\n').filter(line => 
    line.includes('high priority') || line.includes('critical') || line.includes('must')
  ).slice(0, 3);
}

function extractMediumPriorityActions(response: any): string[] {
  const content = response?.consensus?.final_recommendation || '';
  return content.split('\n').filter(line => 
    line.includes('medium priority') || line.includes('should') || line.includes('recommended')
  ).slice(0, 3);
}

function extractLongTermActions(response: any): string[] {
  const content = response?.consensus?.final_recommendation || '';
  return content.split('\n').filter(line => 
    line.includes('long term') || line.includes('future') || line.includes('strategic')
  ).slice(0, 3);
}

function extractRiskMitigation(response: any): string[] {
  const content = response?.consensus?.final_recommendation || '';
  return content.split('\n').filter(line => 
    line.includes('risk') || line.includes('mitigation') || line.includes('prevent')
  ).slice(0, 3);
}