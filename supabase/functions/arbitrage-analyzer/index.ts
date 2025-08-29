import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ArbitrageAnalysisRequest {
  analysisType: 'full' | 'specific';
  opportunityTypes?: string[];
  vesselSpecs?: {
    type: string;
    dwt: number;
    iceClass: boolean;
  };
  currentLocation?: {
    lat: number;
    lng: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Arbitrage analyzer function called');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        fallback: 'Using simplified arbitrage analysis'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const requestData: ArbitrageAnalysisRequest = await req.json();

    console.log('Analysis request:', requestData);

    // Fetch all relevant data for arbitrage analysis
    const [
      cargoFlowsResult,
      backhaulResult, 
      fuelPricesResult,
      congestionResult,
      aisResult,
      co2Result
    ] = await Promise.all([
      supabase.from('cargo_flows').select('*').limit(100),
      supabase.from('backhaul_opportunities').select('*').limit(50),
      supabase.from('fuel_prices').select('*').order('price_date', { ascending: false }).limit(200),
      supabase.from('port_congestion').select('*').order('timestamp', { ascending: false }).limit(100),
      supabase.from('ais_tracking').select('*').limit(200),
      supabase.from('co2_emissions').select('*').limit(100)
    ]);

    const marketData = {
      cargoFlows: cargoFlowsResult.data || [],
      backhaulOpportunities: backhaulResult.data || [],
      fuelPrices: fuelPricesResult.data || [],
      portCongestion: congestionResult.data || [],
      aisData: aisResult.data || [],
      emissions: co2Result.data || []
    };

    // Generate AI-powered arbitrage opportunities
    const opportunities = await analyzeArbitrageOpportunities(marketData, requestData, openaiApiKey);

    // Store opportunities in database for tracking
    if (opportunities.length > 0) {
      await supabase.from('arbitrage_opportunities').insert(
        opportunities.map(opp => ({
          ...opp,
          created_at: new Date().toISOString(),
          data_sources: ['cargo_flows', 'fuel_prices', 'port_congestion', 'ais_tracking']
        }))
      );
    }

    return new Response(JSON.stringify({
      opportunities,
      summary: {
        totalOpportunities: opportunities.length,
        totalPotentialValue: opportunities.reduce((sum, o) => sum + (o.potential_savings_eur || 0) + (o.potential_revenue_eur || 0), 0),
        urgentOpportunities: opportunities.filter(o => o.time_sensitivity === 'urgent').length,
        highValueOpportunities: opportunities.filter(o => (o.potential_savings_eur || 0) > 50000).length
      },
      metadata: {
        analysisType: requestData.analysisType,
        dataPoints: Object.values(marketData).reduce((sum, arr) => sum + arr.length, 0),
        generatedAt: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in arbitrage analyzer:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallbackOpportunities: generateFallbackOpportunities()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeArbitrageOpportunities(marketData: any, request: ArbitrageAnalysisRequest, apiKey: string) {
  const opportunities = [];

  // 1. Freight Rate Arbitrage Analysis
  opportunities.push(...await analyzeFreightRateArbitrage(marketData.cargoFlows, apiKey));

  // 2. Backhaul Cargo Arbitrage
  opportunities.push(...await analyzeBackhaulArbitrage(marketData.backhaulOpportunities, apiKey));

  // 3. Fuel Bunkering Arbitrage
  opportunities.push(...await analyzeFuelArbitrage(marketData.fuelPrices, apiKey));

  // 4. Carbon Credit/ETS Arbitrage
  opportunities.push(...await analyzeCarbonArbitrage(marketData.emissions, marketData.aisData, apiKey));

  // 5. Commodity Flow Arbitrage
  opportunities.push(...await analyzeCommodityFlowArbitrage(marketData.cargoFlows, apiKey));

  // 6. Ice Season Arbitrage
  opportunities.push(...await analyzeIceSeasonArbitrage(marketData.aisData, apiKey));

  // 7. Port Congestion Arbitrage
  opportunities.push(...await analyzePortCongestionArbitrage(marketData.portCongestion, apiKey));

  // 8. Regulatory Arbitrage
  opportunities.push(...await analyzeRegulatoryArbitrage(marketData.cargoFlows, apiKey));

  // 9. Storage/Floating Arbitrage
  opportunities.push(...await analyzeStorageArbitrage(marketData.cargoFlows, apiKey));

  return opportunities.sort((a, b) => 
    (b.potential_savings_eur + b.potential_revenue_eur) - (a.potential_savings_eur + a.potential_revenue_eur)
  );
}

async function analyzeFreightRateArbitrage(cargoFlows: any[], apiKey: string) {
  if (cargoFlows.length < 2) return [];

  // Group by route and analyze rate differences
  const routes = {};
  cargoFlows.forEach(flow => {
    const route = `${flow.origin_region}-${flow.destination_region}`;
    if (!routes[route]) routes[route] = [];
    routes[route].push(flow);
  });

  const opportunities = [];
  const routeKeys = Object.keys(routes);

  for (let i = 0; i < routeKeys.length; i++) {
    for (let j = i + 1; j < routeKeys.length; j++) {
      const route1 = routes[routeKeys[i]];
      const route2 = routes[routeKeys[j]];
      
      const avgRate1 = route1.reduce((sum, f) => sum + (f.rate_per_ton || 0), 0) / route1.length;
      const avgRate2 = route2.reduce((sum, f) => sum + (f.rate_per_ton || 0), 0) / route2.length;
      
      if (Math.abs(avgRate1 - avgRate2) > 50) { // Significant rate difference
        const higherRoute = avgRate1 > avgRate2 ? routeKeys[i] : routeKeys[j];
        const lowerRoute = avgRate1 > avgRate2 ? routeKeys[j] : routeKeys[i];
        const rateDiff = Math.abs(avgRate1 - avgRate2);
        
        opportunities.push({
          opportunity_type: 'freight_rate_arbitrage',
          title: `Route Rate Arbitrage: ${higherRoute} vs ${lowerRoute}`,
          description: `Deploy vessels to ${higherRoute} (€${Math.max(avgRate1, avgRate2).toFixed(2)}/ton) instead of ${lowerRoute} (€${Math.min(avgRate1, avgRate2).toFixed(2)}/ton)`,
          potential_savings_eur: rateDiff * 5000, // Assume 5000 tons typical cargo
          potential_revenue_eur: 0,
          probability_score: 85,
          time_sensitivity: 'high',
          implementation_complexity: 'simple',
          origin_port: higherRoute.split('-')[0],
          destination_port: higherRoute.split('-')[1],
          current_rate_per_ton: Math.min(avgRate1, avgRate2),
          arbitrage_rate_per_ton: Math.max(avgRate1, avgRate2),
          risk_level: 'medium',
          risk_factors: ['Market volatility', 'Vessel availability'],
          mitigation_strategies: ['Real-time rate monitoring', 'Flexible chartering'],
          confidence_level: 80,
          valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    }
  }

  return opportunities.slice(0, 3); // Top 3 opportunities
}

async function analyzeBackhaulArbitrage(backhaulOpps: any[], apiKey: string) {
  const opportunities = [];

  backhaulOpps.forEach(opp => {
    if (opp.rate_per_ton && opp.rate_per_ton > 10) { // Profitable backhaul
      opportunities.push({
        opportunity_type: 'backhaul_cargo_arbitrage',
        title: `Backhaul Opportunity: ${opp.port_origin} to ${opp.port_destination}`,
        description: `Secure ${opp.cargo_type} backhaul cargo at €${opp.rate_per_ton}/ton instead of sailing empty`,
        potential_savings_eur: 0,
        potential_revenue_eur: (opp.rate_per_ton || 0) * (opp.volume_tons || 1000),
        probability_score: opp.opportunity_score || 70,
        time_sensitivity: opp.booking_urgency || 'medium',
        implementation_complexity: 'moderate',
        origin_port: opp.port_origin,
        destination_port: opp.port_destination,
        arbitrage_rate_per_ton: opp.rate_per_ton,
        vessel_type_required: opp.vessel_type_required,
        risk_level: 'low',
        risk_factors: ['Cargo availability'],
        mitigation_strategies: ['Multiple cargo options', 'Flexible timing'],
        confidence_level: 75,
        valid_until: opp.valid_until || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  });

  return opportunities.slice(0, 5); // Top 5 backhaul opportunities
}

async function analyzeFuelArbitrage(fuelPrices: any[], apiKey: string) {
  if (fuelPrices.length < 2) return [];

  // Group by fuel type and find price differences
  const fuelTypes = ['HFO', 'MGO', 'LSFO', 'VLSFO'];
  const opportunities = [];

  fuelTypes.forEach(fuelType => {
    const prices = fuelPrices.filter(p => p.fuel_type === fuelType);
    if (prices.length < 2) return;

    prices.sort((a, b) => a.price_per_tonne - b.price_per_tonne);
    const cheapest = prices[0];
    const mostExpensive = prices[prices.length - 1];
    const priceDiff = mostExpensive.price_per_tonne - cheapest.price_per_tonne;

    if (priceDiff > 100) { // Significant price difference
      opportunities.push({
        opportunity_type: 'fuel_bunkering_arbitrage',
        title: `Fuel Arbitrage: ${cheapest.port_name} vs ${mostExpensive.port_name}`,
        description: `Bunker ${fuelType} in ${cheapest.port_name} (€${cheapest.price_per_tonne}/ton) vs ${mostExpensive.port_name} (€${mostExpensive.price_per_tonne}/ton)`,
        potential_savings_eur: priceDiff * 1500, // Assume 1500 tons typical bunker
        potential_revenue_eur: 0,
        probability_score: 90,
        time_sensitivity: 'high',
        implementation_complexity: 'simple',
        origin_port: cheapest.port_name,
        fuel_cost_difference_per_tonne: priceDiff,
        risk_level: 'low',
        risk_factors: ['Price volatility', 'Fuel availability'],
        mitigation_strategies: ['Price hedging', 'Multiple supplier options'],
        confidence_level: 85,
        valid_until: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  });

  return opportunities.slice(0, 3);
}

async function analyzeCarbonArbitrage(emissions: any[], aisData: any[], apiKey: string) {
  const opportunities = [];
  const currentEtsPrice = 85; // €85/ton CO2 (approximate current price)

  // Analyze vessels with high emissions for optimization potential
  const vesselEmissions = {};
  emissions.forEach(e => {
    if (!vesselEmissions[e.vessel_id]) vesselEmissions[e.vessel_id] = [];
    vesselEmissions[e.vessel_id].push(e.value);
  });

  Object.entries(vesselEmissions).forEach(([vesselId, emissionValues]: [string, number[]]) => {
    const avgEmissions = emissionValues.reduce((sum, val) => sum + val, 0) / emissionValues.length;
    
    if (avgEmissions > 50) { // High-emission vessel
      const potentialReduction = avgEmissions * 0.15; // 15% reduction potential
      const savingsEur = potentialReduction * currentEtsPrice;
      
      opportunities.push({
        opportunity_type: 'carbon_credit_arbitrage',
        title: `ETS Cost Reduction for High-Emission Vessel`,
        description: `Optimize routing and operations to reduce CO2 emissions by 15% and save on EU ETS costs`,
        potential_savings_eur: savingsEur * 30, // Monthly savings
        potential_revenue_eur: 0,
        probability_score: 75,
        time_sensitivity: 'medium',
        implementation_complexity: 'moderate',
        carbon_cost_savings_eur: savingsEur,
        vessel_type_required: 'Any',
        risk_level: 'low',
        risk_factors: ['ETS price changes', 'Operational constraints'],
        mitigation_strategies: ['Speed optimization', 'Weather routing', 'Port optimization'],
        confidence_level: 70,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  });

  return opportunities.slice(0, 2);
}

async function analyzeCommodityFlowArbitrage(cargoFlows: any[], apiKey: string) {
  const opportunities = [];
  const currentMonth = new Date().getMonth();
  
  // Seasonal commodity analysis
  const seasonalCommodities = {
    'grain': { peakMonths: [8, 9, 10], multiplier: 1.4 },
    'fertilizer': { peakMonths: [2, 3, 4], multiplier: 1.3 },
    'timber': { peakMonths: [4, 5, 6], multiplier: 1.2 }
  };

  Object.entries(seasonalCommodities).forEach(([commodity, data]) => {
    if (data.peakMonths.includes(currentMonth)) {
      const relevantFlows = cargoFlows.filter(f => 
        f.cargo_type?.toLowerCase().includes(commodity) || 
        f.commodity_group?.toLowerCase().includes(commodity)
      );

      if (relevantFlows.length > 0) {
        const avgRate = relevantFlows.reduce((sum, f) => sum + (f.rate_per_ton || 0), 0) / relevantFlows.length;
        const projectedRate = avgRate * data.multiplier;

        opportunities.push({
          opportunity_type: 'commodity_flow_arbitrage',
          title: `Seasonal ${commodity.charAt(0).toUpperCase() + commodity.slice(1)} Arbitrage`,
          description: `Peak season for ${commodity} - position vessels early for premium rates`,
          potential_savings_eur: 0,
          potential_revenue_eur: (projectedRate - avgRate) * 8000, // 8000 tons typical
          probability_score: 80,
          time_sensitivity: 'high',
          implementation_complexity: 'moderate',
          current_rate_per_ton: avgRate,
          arbitrage_rate_per_ton: projectedRate,
          seasonal_factor: data.multiplier,
          vessel_type_required: 'Bulk carrier',
          risk_level: 'medium',
          risk_factors: ['Weather delays', 'Harvest variations'],
          mitigation_strategies: ['Early positioning', 'Flexible contracts'],
          confidence_level: 75,
          valid_until: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    }
  });

  return opportunities;
}

async function analyzeIceSeasonArbitrage(aisData: any[], apiKey: string) {
  const opportunities = [];
  const currentMonth = new Date().getMonth();
  
  // Ice season typically December-March in Baltic
  if (currentMonth >= 11 || currentMonth <= 2) {
    opportunities.push({
      opportunity_type: 'ice_season_arbitrage',
      title: 'Ice Class Vessel Premium Opportunity',
      description: 'Deploy ice-class vessels to Baltic ports for premium winter rates while competitors cannot access',
      potential_savings_eur: 0,
      potential_revenue_eur: 85000, // Premium for ice class access
      probability_score: 85,
      time_sensitivity: 'urgent',
      implementation_complexity: 'complex',
      ice_class_required: true,
      vessel_type_required: 'Ice class',
      affected_regions: ['Northern Baltic', 'Gulf of Bothnia', 'Gulf of Finland'],
      risk_level: 'medium',
      risk_factors: ['Ice conditions', 'Icebreaker availability'],
      mitigation_strategies: ['Ice routing services', 'Icebreaker escort coordination'],
      confidence_level: 80,
      valid_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  return opportunities;
}

async function analyzePortCongestionArbitrage(congestionData: any[], apiKey: string) {
  const opportunities = [];

  // Find ports with high congestion vs alternatives
  const congestedPorts = congestionData.filter(p => 
    p.congestion_level === 'heavy' || p.congestion_level === 'severe'
  );

  congestedPorts.forEach(port => {
    if (port.average_waiting_time_hours > 24) {
      const dailyVesselCost = 25000; // €25k/day typical vessel cost
      const savingsDays = port.average_waiting_time_hours / 24;
      
      opportunities.push({
        opportunity_type: 'port_congestion_arbitrage',
        title: `Avoid Congestion at ${port.port_name}`,
        description: `Route to alternative ports to avoid ${port.average_waiting_time_hours}h delays at ${port.port_name}`,
        potential_savings_eur: savingsDays * dailyVesselCost,
        potential_revenue_eur: 0,
        probability_score: 90,
        time_sensitivity: 'urgent',
        implementation_complexity: 'moderate',
        origin_port: port.port_name,
        alternative_route: 'Alternative Baltic ports',
        risk_level: 'low',
        risk_factors: ['Alternative port capacity'],
        mitigation_strategies: ['Multi-port options', 'Real-time monitoring'],
        confidence_level: 85,
        valid_until: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  });

  return opportunities.slice(0, 3);
}

async function analyzeRegulatoryArbitrage(cargoFlows: any[], apiKey: string) {
  const opportunities = [];

  // Analyze environmental compliance differences
  opportunities.push({
    opportunity_type: 'regulatory_arbitrage',
    title: 'Green Corridor Compliance Advantage',
    description: 'Leverage green fuel compliance for access to preferred shipping corridors and reduced fees',
    potential_savings_eur: 45000,
    potential_revenue_eur: 35000,
    probability_score: 70,
    time_sensitivity: 'medium',
    implementation_complexity: 'complex',
    vessel_type_required: 'Green fuel capable',
    risk_level: 'medium',
    risk_factors: ['Regulatory changes', 'Compliance costs'],
    mitigation_strategies: ['Early compliance adoption', 'Green fuel infrastructure'],
    confidence_level: 65,
    valid_until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
  });

  return opportunities;
}

async function analyzeStorageArbitrage(cargoFlows: any[], apiKey: string) {
  const opportunities = [];

  // Floating storage opportunities during price spikes
  const oilFlows = cargoFlows.filter(f => 
    f.cargo_type?.toLowerCase().includes('oil') || 
    f.commodity_group?.toLowerCase().includes('petroleum')
  );

  if (oilFlows.length > 0) {
    opportunities.push({
      opportunity_type: 'storage_floating_arbitrage',
      title: 'Floating Storage During Price Volatility',
      description: 'Use vessel as floating storage during oil price spikes - hold cargo for 1-2 weeks for premium',
      potential_savings_eur: 0,
      potential_revenue_eur: 180000, // Storage premium
      probability_score: 60,
      time_sensitivity: 'medium',
      implementation_complexity: 'complex',
      vessel_type_required: 'Tanker',
      risk_level: 'high',
      risk_factors: ['Price volatility', 'Storage regulations', 'Market timing'],
      mitigation_strategies: ['Market analysis', 'Flexible contracts', 'Risk hedging'],
      confidence_level: 55,
      valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  return opportunities;
}

function generateFallbackOpportunities() {
  return [
    {
      opportunity_type: 'freight_rate_arbitrage',
      title: 'Baltic-Med vs Baltic-UK Rate Differential',
      description: 'Redeploy handysize vessels from Baltic-Med (€14k/day) to Baltic-Turkey route (€19k/day)',
      potential_savings_eur: 150000,
      potential_revenue_eur: 0,
      probability_score: 85,
      time_sensitivity: 'high'
    },
    {
      opportunity_type: 'fuel_bunkering_arbitrage', 
      title: 'Riga vs Helsinki Bunker Price Advantage',
      description: 'Refuel in Riga instead of Helsinki - save €45/tonne on bunker fuel',
      potential_savings_eur: 67500,
      potential_revenue_eur: 0,
      probability_score: 90,
      time_sensitivity: 'urgent'
    },
    {
      opportunity_type: 'backhaul_cargo_arbitrage',
      title: 'Salt Backhaul from Baltic Ports',
      description: 'Secure low-margin salt cargo for return voyage instead of ballast',
      potential_savings_eur: 0,
      potential_revenue_eur: 45000,
      probability_score: 75,
      time_sensitivity: 'medium'
    }
  ];
}