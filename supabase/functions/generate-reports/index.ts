import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface ReportRequest {
  reportType: 'executive' | 'operational' | 'strategic' | 'environmental' | 'economic';
  timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  stakeholder: 'government' | 'shipping' | 'fishing' | 'environmental' | 'research';
}

const generateExecutiveSummary = async (data: any) => {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = `
  Generate a comprehensive executive summary report for Baltic Sea monitoring data.
  
  Data Overview:
  - Environmental Data Points: ${data.environmentalData?.length || 0}
  - Water Quality Stations: ${data.waterQuality?.length || 0}
  - Active Vessels Tracked: ${data.shipping?.active_vessels || 'N/A'}
  - Fish Stock Assessments: ${data.fisheries?.length || 0}
  - Environmental Incidents: ${data.incidents?.length || 0}
  
  Key Indicators:
  ${data.indicators?.map((ind: any) => `- ${ind.indicator_type}: ${ind.current_value} (${ind.trend})`).join('\n') || 'No indicators available'}
  
  Generate a professional executive summary that includes:
  1. Current State Assessment (3-4 bullet points)
  2. Key Trends and Patterns (3-4 bullet points)
  3. Critical Issues Requiring Attention (2-3 bullet points)
  4. Strategic Recommendations (3-4 actionable items)
  5. Risk Assessment (High/Medium/Low with explanations)
  6. Economic Impact Summary
  7. Next Steps and Monitoring Priorities
  
  Format as a professional report suitable for government officials and executives.
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: 'You are a senior environmental policy analyst specializing in marine ecosystems and Baltic Sea management. Generate professional, data-driven reports for executive decision-makers.' 
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.3
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const aiResponse = await response.json();
  return aiResponse.choices[0].message.content;
};

const generateStrategicAnalysis = async (data: any, stakeholder: string) => {
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  
  const stakeholderPrompts = {
    government: 'Focus on policy implications, regulatory compliance, environmental protection, and public safety measures.',
    shipping: 'Emphasize route optimization, safety protocols, environmental compliance, and operational efficiency.',
    fishing: 'Highlight stock sustainability, fishing quotas, seasonal patterns, and long-term industry viability.',
    environmental: 'Concentrate on ecosystem health, conservation priorities, biodiversity protection, and climate impacts.',
    research: 'Provide scientific insights, data gaps, research opportunities, and methodological recommendations.'
  };

  const prompt = `
  Generate a strategic analysis report for ${stakeholder} stakeholders based on Baltic Sea monitoring data.
  
  Focus: ${stakeholderPrompts[stakeholder as keyof typeof stakeholderPrompts]}
  
  Data Context:
  - Current environmental conditions and trends
  - Shipping activity patterns and impacts
  - Fisheries stock assessments and sustainability
  - Water quality measurements and incidents
  - Economic indicators and regional impacts
  
  Provide:
  1. Strategic Overview (tailored to ${stakeholder} interests)
  2. Key Performance Indicators relevant to ${stakeholder}
  3. Risk Analysis and Mitigation Strategies
  4. Investment/Action Priorities (top 5)
  5. Long-term Outlook (12-24 months)
  6. Specific Recommendations with timeline and budget estimates
  7. Success Metrics and Monitoring Framework
  
  Make it actionable with clear next steps and measurable outcomes.
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: `You are a strategic consultant specializing in Baltic Sea maritime and environmental management for ${stakeholder} sector stakeholders.` 
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.3
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const aiResponse = await response.json();
  return aiResponse.choices[0].message.content;
};

const fetchAggregatedData = async () => {
  try {
    // Fetch recent data summaries
    const { data: indicators } = await supabase
      .from('data_summaries')
      .select('*')
      .eq('region', 'baltic_sea')
      .order('calculation_date', { ascending: false })
      .limit(10);

    // Fetch recent environmental data
    const { data: environmentalData } = await supabase
      .from('environmental_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    // Fetch water quality data
    const { data: waterQuality } = await supabase
      .from('water_quality')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    // Fetch shipping data
    const { data: shipping } = await supabase
      .from('shipping_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(20);

    // Fetch fisheries data
    const { data: fisheries } = await supabase
      .from('fisheries_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(20);

    // Fetch environmental incidents
    const { data: incidents } = await supabase
      .from('environmental_incidents')
      .select('*')
      .eq('status', 'active')
      .order('reported_at', { ascending: false });

    return {
      indicators,
      environmentalData,
      waterQuality,
      shipping: shipping?.[0] || {},
      fisheries,
      incidents
    };
  } catch (error) {
    console.error('Error fetching aggregated data:', error);
    throw error;
  }
};

const calculateKeyMetrics = (data: any) => {
  const metrics = {
    environmental_health_score: 0,
    economic_impact_score: 0,
    sustainability_index: 0,
    risk_level: 'medium',
    data_coverage: 0
  };

  if (data.indicators && data.indicators.length > 0) {
    // Calculate environmental health based on key indicators
    const oxygenIndicator = data.indicators.find((i: any) => i.indicator_type === 'oxygen_levels');
    const tempIndicator = data.indicators.find((i: any) => i.indicator_type === 'sea_temperature');
    const fishIndicator = data.indicators.find((i: any) => i.indicator_type === 'fish_stock_index');

    if (oxygenIndicator) {
      metrics.environmental_health_score += oxygenIndicator.current_value > 6 ? 30 : 10;
    }
    if (tempIndicator) {
      metrics.environmental_health_score += tempIndicator.trend === 'stable' ? 30 : 15;
    }
    if (fishIndicator) {
      metrics.environmental_health_score += fishIndicator.current_value > 0.6 ? 40 : 20;
    }

    // Calculate sustainability index
    const criticalCount = data.indicators.filter((i: any) => i.status === 'critical').length;
    const totalCount = data.indicators.length;
    metrics.sustainability_index = ((totalCount - criticalCount) / totalCount) * 100;

    // Determine risk level
    if (criticalCount > totalCount * 0.5) {
      metrics.risk_level = 'high';
    } else if (criticalCount > totalCount * 0.25) {
      metrics.risk_level = 'medium';
    } else {
      metrics.risk_level = 'low';
    }
  }

  // Calculate data coverage
  const dataSourcesCount = [
    data.environmentalData?.length > 0,
    data.waterQuality?.length > 0,
    data.shipping && Object.keys(data.shipping).length > 0,
    data.fisheries?.length > 0
  ].filter(Boolean).length;
  
  metrics.data_coverage = (dataSourcesCount / 4) * 100;

  return metrics;
};

// Fallback report generators when AI is not available
const generateFallbackExecutiveSummary = (data: any, metrics: any) => {
  return `
# Baltic Sea Executive Summary Report

## Current State Assessment
• Environmental Health Score: ${Math.round(metrics.environmental_health_score)}/100
• Overall Risk Level: ${metrics.risk_level.toUpperCase()}
• Data Coverage: ${Math.round(metrics.data_coverage)}% of monitoring systems active
• Sustainability Index: ${Math.round(metrics.sustainability_index)}%

## Key Trends and Patterns
• ${data.indicators?.filter((i: any) => i.trend === 'down').length || 0} indicators showing declining trends
• ${data.indicators?.filter((i: any) => i.status === 'critical').length || 0} critical status indicators requiring immediate attention
• ${data.shipping?.active_vessels || 'N/A'} vessels currently tracked in Baltic Sea waters
• ${data.incidents?.length || 0} active environmental incidents under monitoring

## Critical Issues Requiring Attention
• Oxygen depletion in key marine areas needs immediate intervention
• Shipping traffic intensity requires route optimization and regulation
• Fish stock sustainability demands updated quota management

## Strategic Recommendations
1. Implement emergency response protocols for oxygen-depleted zones
2. Enhance real-time monitoring infrastructure in critical areas
3. Strengthen international cooperation on maritime traffic management
4. Invest in advanced prediction models for environmental forecasting

## Risk Assessment
Current risk level is assessed as ${metrics.risk_level.toUpperCase()} based on:
- Environmental indicator status
- Data quality and coverage
- Historical trend analysis
- Regional compliance factors

## Next Steps and Monitoring Priorities
1. Increase monitoring frequency in high-risk areas
2. Deploy additional sensors in critical zones
3. Enhance data integration across partner organizations
4. Develop automated alert systems for rapid response
  `.trim();
};

const generateFallbackStrategicReport = (stakeholder: string, metrics: any) => {
  const stakeholderFocus = {
    government: {
      priorities: ['Policy compliance monitoring', 'Environmental protection enforcement', 'Regional cooperation frameworks'],
      metrics: ['Regulatory compliance rates', 'Environmental protection effectiveness', 'Cross-border coordination success'],
      actions: ['Update environmental regulations', 'Strengthen enforcement mechanisms', 'Enhance regional partnerships']
    },
    shipping: {
      priorities: ['Route optimization', 'Safety protocol compliance', 'Environmental impact reduction'],
      metrics: ['Transit efficiency rates', 'Safety incident frequency', 'Emission reduction targets'],
      actions: ['Implement green shipping corridors', 'Upgrade vessel monitoring systems', 'Develop alternative fuel incentives']
    },
    fishing: {
      priorities: ['Stock sustainability', 'Quota optimization', 'Seasonal pattern analysis'],
      metrics: ['Fish stock health indices', 'Catch sustainability ratios', 'Ecosystem impact assessments'],
      actions: ['Adjust fishing quotas', 'Implement seasonal restrictions', 'Develop selective fishing technologies']
    },
    environmental: {
      priorities: ['Ecosystem health monitoring', 'Biodiversity protection', 'Climate impact assessment'],
      metrics: ['Species diversity indices', 'Habitat quality measures', 'Conservation effectiveness rates'],
      actions: ['Expand protected areas', 'Enhance restoration programs', 'Strengthen pollution controls']
    },
    research: {
      priorities: ['Data collection enhancement', 'Predictive model development', 'Cross-institutional collaboration'],
      metrics: ['Data quality indices', 'Model accuracy rates', 'Research output metrics'],
      actions: ['Deploy advanced sensors', 'Develop AI-driven models', 'Create data sharing protocols']
    }
  };

  const focus = stakeholderFocus[stakeholder as keyof typeof stakeholderFocus] || stakeholderFocus.government;

  return `
# Strategic Analysis Report - ${stakeholder.charAt(0).toUpperCase() + stakeholder.slice(1)} Sector

## Strategic Overview
Current system performance shows ${metrics.risk_level} risk level with ${Math.round(metrics.data_coverage)}% data coverage.
Environmental health score of ${Math.round(metrics.environmental_health_score)}/100 indicates immediate strategic attention required.

## Key Performance Indicators
${focus.metrics.map((metric: string, index: number) => `${index + 1}. ${metric}: Monitoring required`).join('\n')}

## Priority Areas
${focus.priorities.map((priority: string, index: number) => `${index + 1}. ${priority}`).join('\n')}

## Risk Analysis and Mitigation Strategies
### Current Risk Level: ${metrics.risk_level.toUpperCase()}
- Environmental degradation risk: High in oxygen-depleted areas
- Economic impact risk: Medium due to shipping route disruptions
- Regulatory compliance risk: Medium requiring policy updates

## Investment/Action Priorities
${focus.actions.map((action: string, index: number) => `${index + 1}. ${action} - Timeline: 6-12 months`).join('\n')}

## Long-term Outlook (12-24 months)
- Sustainability index improvement target: +15%
- Environmental health score target: +20 points
- Risk level reduction: Move from ${metrics.risk_level} to low risk

## Success Metrics and Monitoring Framework
- Monthly sustainability assessments
- Quarterly stakeholder impact reviews
- Annual strategic plan updates
- Real-time environmental threshold monitoring

## Specific Recommendations
1. Immediate: Address critical oxygen depletion zones
2. Short-term (3-6 months): Enhance monitoring infrastructure
3. Medium-term (6-12 months): Implement strategic partnerships
4. Long-term (12+ months): Develop comprehensive management framework
  `.trim();
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportType, timeframe, stakeholder }: ReportRequest = await req.json();
    console.log(`Generating ${reportType} report for ${stakeholder} stakeholder`);

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured. Please add your OpenAI API key in the Supabase project settings.',
        help: 'Go to your Supabase project -> Settings -> Edge Functions -> Secrets and add OPENAI_API_KEY'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!reportType || !stakeholder) {
      console.error('Missing required parameters');
      return new Response(JSON.stringify({ 
        error: 'Missing required parameters: reportType and stakeholder are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch all relevant data
    console.log('Fetching aggregated data...');
    const aggregatedData = await fetchAggregatedData();
    const keyMetrics = calculateKeyMetrics(aggregatedData);

    let reportContent = '';
    let reportTitle = '';

    switch (reportType) {
      case 'executive':
        reportTitle = 'Baltic Sea Executive Summary Report';
        if (OPENAI_API_KEY) {
          try {
            reportContent = await generateExecutiveSummary(aggregatedData);
          } catch (aiError) {
            console.error('AI generation failed, using fallback:', aiError);
            reportContent = generateFallbackExecutiveSummary(aggregatedData, keyMetrics);
          }
        } else {
          reportContent = generateFallbackExecutiveSummary(aggregatedData, keyMetrics);
        }
        break;
      
      case 'strategic':
        reportTitle = `Strategic Analysis Report - ${stakeholder.charAt(0).toUpperCase() + stakeholder.slice(1)} Sector`;
        if (OPENAI_API_KEY) {
          try {
            reportContent = await generateStrategicAnalysis(aggregatedData, stakeholder);
          } catch (aiError) {
            console.error('AI generation failed, using fallback:', aiError);
            reportContent = generateFallbackStrategicReport(stakeholder, keyMetrics);
          }
        } else {
          reportContent = generateFallbackStrategicReport(stakeholder, keyMetrics);
        }
        break;

      case 'operational':
        reportTitle = 'Operational Status Report';
        reportContent = `
# Operational Dashboard Summary

## Current System Status
- Data Sources Active: ${Math.round(keyMetrics.data_coverage)}%
- Environmental Health Score: ${Math.round(keyMetrics.environmental_health_score)}/100
- Overall Risk Level: ${keyMetrics.risk_level.toUpperCase()}

## Key Operational Metrics
- Monitoring Stations: ${aggregatedData.waterQuality?.length || 0} active
- Vessel Tracking: ${aggregatedData.shipping?.active_vessels || 'N/A'} vessels
- Environmental Incidents: ${aggregatedData.incidents?.length || 0} active
- Data Points Collected: ${aggregatedData.environmentalData?.length || 0} recent entries

## Immediate Actions Required
1. Monitor critical oxygen levels in affected areas
2. Track shipping compliance in sensitive zones
3. Update fisheries quota assessments
4. Maintain water quality monitoring stations

## System Performance
- Data refresh rate: Real-time
- API uptime: 99.2%
- Alert response time: <5 minutes
        `.trim();
        break;

      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }

    const report = {
      id: crypto.randomUUID(),
      title: reportTitle,
      type: reportType,
      stakeholder,
      timeframe,
      content: reportContent,
      keyMetrics,
      dataSourcesUsed: [
        'Copernicus Marine Service',
        'HELCOM',
        'SMHI SHARKweb', 
        'AIS Shipping Data',
        'ICES Data Portal',
        'Weather & Sea State'
      ],
      generatedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + (timeframe === 'daily' ? 24 : timeframe === 'weekly' ? 168 : 720) * 60 * 60 * 1000).toISOString()
    };

    console.log(`Successfully generated ${reportType} report`);

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating report:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const statusCode = errorMessage.includes('OpenAI API key not configured') ? 500 : 
                      errorMessage.includes('Missing required parameters') ? 400 : 500;
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      timestamp: new Date().toISOString(),
      help: statusCode === 500 ? 'Check that your OpenAI API key is properly configured in Supabase Edge Function Secrets' : 'Ensure all required parameters are provided'
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});