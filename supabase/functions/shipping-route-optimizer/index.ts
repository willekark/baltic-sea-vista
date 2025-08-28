import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RouteOptimizationRequest {
  origin: string;
  destination: string;
  cargoType?: string;
  vesselType?: string;
  timeframe?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting shipping route optimization analysis...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let requestData: RouteOptimizationRequest = {};
    
    if (req.method === 'POST') {
      requestData = await req.json();
    }

    // Analyze current cargo flows and backhaul opportunities
    const { data: cargoFlows } = await supabase
      .from('cargo_flows')
      .select('*')
      .gte('valid_from', new Date().toISOString().split('T')[0]);

    const { data: backhaulOpportunities } = await supabase
      .from('backhaul_opportunities') 
      .select('*')
      .gte('valid_from', new Date().toISOString().split('T')[0]);

    const { data: vesselPositions } = await supabase
      .from('ais_tracking')
      .select(`
        *,
        vessels (
          vessel_name, vessel_type, gross_tonnage, flag_state
        )
      `)
      .gte('timestamp', new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString())
      .limit(50);

    // Generate comprehensive route optimization recommendations
    const optimization = await generateRouteOptimization({
      cargoFlows: cargoFlows || [],
      backhaulOpportunities: backhaulOpportunities || [],
      vesselPositions: vesselPositions || [],
      request: requestData,
      perplexityKey
    });

    return new Response(JSON.stringify(optimization), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in route optimization:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function generateRouteOptimization(context: any) {
  const { cargoFlows, backhaulOpportunities, vesselPositions, request, perplexityKey } = context;

  // Analyze current market conditions
  const marketAnalysis = analyzeMarketConditions(cargoFlows, backhaulOpportunities);
  
  // Generate ballast optimization strategies
  const ballastStrategies = generateBallastOptimization(backhaulOpportunities, vesselPositions);
  
  // Get AI-powered route recommendations
  const aiRecommendations = await getAIRouteRecommendations(
    marketAnalysis, 
    ballastStrategies, 
    request, 
    perplexityKey
  );

  return {
    timestamp: new Date().toISOString(),
    marketConditions: marketAnalysis,
    ballastOptimization: ballastStrategies,
    routeRecommendations: aiRecommendations.routes || [],
    profitOptimization: aiRecommendations.profitTips || [],
    fuelEfficiency: aiRecommendations.fuelEfficiency || [],
    weatherConsiderations: aiRecommendations.weather || [],
    portOptimization: aiRecommendations.ports || [],
    summary: aiRecommendations.summary || 'Route optimization analysis completed'
  };
}

function analyzeMarketConditions(cargoFlows: any[], backhaulOpportunities: any[]) {
  const analysis = {
    totalFlows: cargoFlows.length,
    totalBackhaulOpportunities: backhaulOpportunities.length,
    avgRatePerTon: 0,
    hotRoutes: [] as any[],
    profitableCargoTypes: [] as any[],
    seasonalFactors: [] as any[]
  };

  // Calculate average rates
  const totalVolume = cargoFlows.reduce((sum, flow) => sum + (flow.volume_tons || 0), 0);
  const totalRevenue = cargoFlows.reduce((sum, flow) => 
    sum + ((flow.volume_tons || 0) * (flow.rate_per_ton || 0)), 0);
  analysis.avgRatePerTon = totalRevenue / totalVolume || 0;

  // Identify hot routes (high volume + good rates)
  const routeStats = new Map();
  cargoFlows.forEach(flow => {
    const routeKey = `${flow.port_origin}-${flow.port_destination}`;
    if (!routeStats.has(routeKey)) {
      routeStats.set(routeKey, {
        route: routeKey,
        totalVolume: 0,
        avgRate: 0,
        frequency: 0
      });
    }
    const stats = routeStats.get(routeKey);
    stats.totalVolume += flow.volume_tons || 0;
    stats.avgRate += flow.rate_per_ton || 0;
    stats.frequency += 1;
  });

  analysis.hotRoutes = Array.from(routeStats.values())
    .map(stats => ({
      ...stats,
      avgRate: stats.avgRate / stats.frequency,
      profitScore: (stats.totalVolume * stats.avgRate) / 1000
    }))
    .sort((a, b) => b.profitScore - a.profitScore)
    .slice(0, 5);

  // Analyze cargo types by profitability
  const cargoStats = new Map();
  cargoFlows.forEach(flow => {
    if (!cargoStats.has(flow.cargo_type)) {
      cargoStats.set(flow.cargo_type, {
        type: flow.cargo_type,
        totalVolume: 0,
        avgRate: 0,
        count: 0
      });
    }
    const stats = cargoStats.get(flow.cargo_type);
    stats.totalVolume += flow.volume_tons || 0;
    stats.avgRate += flow.rate_per_ton || 0;
    stats.count += 1;
  });

  analysis.profitableCargoTypes = Array.from(cargoStats.values())
    .map(stats => ({
      ...stats,
      avgRate: stats.avgRate / stats.count
    }))
    .sort((a, b) => b.avgRate - a.avgRate)
    .slice(0, 3);

  return analysis;
}

function generateBallastOptimization(backhaulOpportunities: any[], vesselPositions: any[]) {
  const strategies = {
    availableBackhauls: backhaulOpportunities.length,
    topOpportunities: [] as any[],
    ballastReduction: {
      potential: 0,
      fuelSavings: 0,
      recommendations: [] as string[]
    },
    vesselUtilization: {
      currentUtilization: 0,
      optimizationPotential: 0
    }
  };

  // Sort backhaul opportunities by opportunity score
  strategies.topOpportunities = backhaulOpportunities
    .filter(opp => opp.opportunity_score > 60)
    .sort((a, b) => (b.opportunity_score || 0) - (a.opportunity_score || 0))
    .slice(0, 5)
    .map(opp => ({
      route: `${opp.port_origin} → ${opp.port_destination}`,
      cargoType: opp.cargo_type,
      volume: opp.volume_tons,
      rate: opp.rate_per_ton,
      score: opp.opportunity_score,
      leadTime: opp.lead_time_days,
      value: opp.total_value_eur
    }));

  // Calculate ballast optimization potential
  const totalBackhaulValue = strategies.topOpportunities.reduce(
    (sum, opp) => sum + (opp.value || 0), 0);
  strategies.ballastReduction.potential = Math.min(80, strategies.topOpportunities.length * 15);
  strategies.ballastReduction.fuelSavings = totalBackhaulValue * 0.12; // Estimated 12% fuel cost savings

  strategies.ballastReduction.recommendations = [
    'Coordinate departure times to align with backhaul cargo availability',
    'Consider partial loads for high-value cargo on return journeys',
    'Optimize ballast water management to reduce fuel consumption',
    'Use digital platforms to identify last-minute backhaul opportunities'
  ];

  return strategies;
}

async function getAIRouteRecommendations(
  marketAnalysis: any, 
  ballastStrategies: any, 
  request: any, 
  apiKey: string
) {
  const prompt = `
As a maritime logistics expert, analyze the following data and provide actionable route optimization recommendations:

MARKET CONDITIONS:
- Total cargo flows: ${marketAnalysis.totalFlows}
- Average rate per ton: €${marketAnalysis.avgRatePerTon.toFixed(2)}
- Hot routes: ${marketAnalysis.hotRoutes.map(r => r.route).join(', ')}
- Most profitable cargo: ${marketAnalysis.profitableCargoTypes.map(c => c.type).join(', ')}

BALLAST OPTIMIZATION:
- Available backhaul opportunities: ${ballastStrategies.availableBackhauls}
- Potential ballast reduction: ${ballastStrategies.ballastReduction.potential}%
- Estimated fuel savings: €${ballastStrategies.ballastReduction.fuelSavings.toFixed(0)}

REQUEST CONTEXT: ${request.origin ? `Route from ${request.origin} to ${request.destination}` : 'General optimization'}
${request.cargoType ? `Cargo type: ${request.cargoType}` : ''}

Provide specific, actionable recommendations for:
1. Route optimization (3-4 key routes with reasoning)
2. Profit maximization strategies (4-5 specific tactics)  
3. Fuel efficiency improvements (3-4 practical methods)
4. Weather and seasonal considerations (2-3 key factors)
5. Port optimization strategies (3-4 actionable tips)

Focus on practical, implementable strategies that can increase profitability by 10-25%.`;

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a maritime logistics expert specializing in shipping route optimization and profit maximization. Provide practical, data-driven recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 2000,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'month',
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '';

    // Parse AI response into structured recommendations
    return parseAIRecommendations(aiResponse);
  } catch (error) {
    console.error('Error calling Perplexity API:', error);
    return {
      routes: ['Error fetching AI recommendations'],
      profitTips: ['Unable to generate AI insights'],
      fuelEfficiency: ['API temporarily unavailable'],
      weather: ['Check weather conditions manually'],
      ports: ['Standard port optimization applies'],
      summary: 'AI recommendations temporarily unavailable'
    };
  }
}

function parseAIRecommendations(aiResponse: string) {
  // Simple parsing logic - in production, this would be more sophisticated
  const sections = {
    routes: [] as string[],
    profitTips: [] as string[],
    fuelEfficiency: [] as string[],
    weather: [] as string[],
    ports: [] as string[],
    summary: ''
  };

  const lines = aiResponse.split('\n').filter(line => line.trim());
  let currentSection = '';

  for (const line of lines) {
    if (line.toLowerCase().includes('route optimization') || line.includes('1.')) {
      currentSection = 'routes';
    } else if (line.toLowerCase().includes('profit maximization') || line.includes('2.')) {
      currentSection = 'profitTips';
    } else if (line.toLowerCase().includes('fuel efficiency') || line.includes('3.')) {
      currentSection = 'fuelEfficiency';
    } else if (line.toLowerCase().includes('weather') || line.includes('4.')) {
      currentSection = 'weather';
    } else if (line.toLowerCase().includes('port optimization') || line.includes('5.')) {
      currentSection = 'ports';
    } else if (line.startsWith('-') || line.startsWith('•') || /^\d+\./.test(line.trim())) {
      const cleanLine = line.replace(/^[-•\d\.\s]+/, '').trim();
      if (cleanLine && currentSection && sections[currentSection as keyof typeof sections]) {
        (sections[currentSection as keyof typeof sections] as string[]).push(cleanLine);
      }
    }
  }

  // Generate summary from the first few lines
  sections.summary = lines.slice(0, 3).join(' ').substring(0, 200) + '...';

  return sections;
}