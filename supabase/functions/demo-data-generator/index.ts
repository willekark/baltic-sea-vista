import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DemoDataRequest {
  scenario: 'green-bonds' | 'port-infrastructure' | 'blue-economy';
  timeframe: 'realtime' | 'historical' | 'forecast';
  metrics: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Demo data generator called');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { scenario = 'green-bonds', timeframe = 'realtime', metrics = [] }: DemoDataRequest = await req.json();

    // Generate realistic demo data based on scenario
    const demoData = await generateDemoData(scenario, timeframe, metrics, supabase);
    
    return new Response(JSON.stringify({
      success: true,
      scenario,
      timeframe,
      data: demoData,
      timestamp: new Date().toISOString(),
      market_session: 'Stockholm Exchange Open',
      data_freshness: 'Live - Updated 2 seconds ago'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in demo data generator:', error);
    return new Response(JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function generateDemoData(scenario: string, timeframe: string, metrics: string[], supabase: any) {
  const baseData = {
    market_conditions: {
      stockholm_omx: { price: 2458.32, change: +1.24, change_pct: +0.051 },
      helsinki_omx: { price: 11247.85, change: -8.42, change_pct: -0.075 },
      copenhagen_omx: { price: 1638.91, change: +3.17, change_pct: +0.194 },
      eur_sek: { rate: 11.4567, change: -0.0234, volatility: 0.087 },
      eur_dkk: { rate: 7.4598, change: +0.0012, volatility: 0.023 },
      baltic_dry_index: { value: 2847, change: +42, change_pct: +1.5 }
    },
    live_indicators: {
      timestamp: new Date().toISOString(),
      regional_gdp_growth: +2.8,
      esg_composite_score: 78.4,
      port_congestion_index: 64.2,
      green_bond_spreads: 0.85,
      infrastructure_capex: 12.7,
      innovation_index: 94.2
    }
  };

  switch (scenario) {
    case 'green-bonds':
      return {
        ...baseData,
        scenario_data: {
          green_bond_universe: {
            total_issuance_eur: '47.2B',
            ytd_growth: +18.5,
            avg_yield: 4.65,
            duration: 7.2,
            credit_quality: 'AA-',
            esg_score: 89.4
          },
          key_issuers: [
            { name: 'Stockholm Municipality', size: '€850M', yield: 4.2, rating: 'AA+', coupon: 4.125 },
            { name: 'Göteborg Green Infrastructure', size: '€425M', yield: 4.8, rating: 'AA', coupon: 4.750 },
            { name: 'Helsinki Sustainable Energy', size: '€650M', yield: 4.4, rating: 'AA+', coupon: 4.375 },
            { name: 'Copenhagen Climate Fund', size: '€320M', yield: 5.1, rating: 'AA-', coupon: 4.875 }
          ],
          performance_metrics: {
            ytd_return: +6.8,
            sharpe_ratio: 1.94,
            max_drawdown: -2.1,
            correlation_to_equity: 0.23,
            esg_improvement: +15.2
          },
          risk_factors: {
            interest_rate_sensitivity: 'Medium',
            credit_risk: 'Low',
            liquidity_risk: 'Low',
            regulatory_risk: 'Very Low',
            environmental_compliance: '98.5%'
          }
        },
        forecasts: {
          next_12_months: {
            expected_return: '5.2% - 7.1%',
            volatility: '3.8% - 5.2%',
            new_issuance: '€8.5B - €12.2B',
            spread_tightening: '-15 to -25 bps'
          }
        }
      };

    case 'port-infrastructure':
      return {
        ...baseData,
        scenario_data: {
          port_infrastructure_universe: {
            total_investment_eur: '€23.4B',
            projects_pipeline: 47,
            avg_irr: 11.2,
            payback_period: 6.8,
            automation_level: 72,
            digitalization_score: 85.3
          },
          major_projects: [
            { port: 'Göteborg', project: 'Container Terminal 5G', capex: '€450M', irr: 12.8, completion: '2026Q2' },
            { port: 'Stockholm', project: 'Automated Freight Hub', capex: '€280M', irr: 10.9, completion: '2025Q4' },
            { port: 'Helsinki', project: 'Smart Logistics Center', capex: '€380M', irr: 13.2, completion: '2026Q1' },
            { port: 'Malmö', project: 'Green Energy Integration', capex: '€195M', irr: 9.7, completion: '2025Q3' }
          ],
          operational_metrics: {
            capacity_utilization: 87.4,
            throughput_growth: +12.6,
            efficiency_improvement: +18.3,
            carbon_reduction: -22.1,
            technology_adoption: 94.7
          },
          market_dynamics: {
            trade_volume_growth: +8.2,
            container_rates: 'Rising (+15%)',
            capacity_constraints: 'Moderate',
            investment_appetite: 'Strong',
            regulatory_support: 'High'
          }
        },
        forecasts: {
          next_24_months: {
            capacity_expansion: '+35% - +50%',
            efficiency_gains: '+20% - +30%',
            revenue_growth: '+15% - +25%',
            carbon_footprint: '-30% - -40%'
          }
        }
      };

    case 'blue-economy':
      return {
        ...baseData,
        scenario_data: {
          blue_economy_universe: {
            total_market_size_eur: '€67.8B',
            growth_rate: +14.7,
            innovation_projects: 156,
            patent_applications: 1247,
            startup_funding: '€890M',
            sustainability_score: 91.2
          },
          key_sectors: [
            { sector: 'Offshore Wind', size: '€24.5B', growth: +22.4, companies: 23, score: 94 },
            { sector: 'Sustainable Aquaculture', size: '€8.9B', growth: +18.7, companies: 47, score: 87 },
            { sector: 'Marine Biotechnology', size: '€3.2B', growth: +31.2, companies: 89, score: 92 },
            { sector: 'Ocean Monitoring Tech', size: '€1.8B', growth: +28.9, companies: 34, score: 96 }
          ],
          investment_opportunities: {
            venture_capital: '€245M available',
            growth_equity: '€680M pipeline',
            infrastructure_debt: '€1.2B capacity',
            green_bonds: '€450M issuance',
            government_grants: '€120M allocation'
          },
          innovation_metrics: {
            r_and_d_intensity: 8.7,
            patent_quality_score: 89.4,
            university_partnerships: 78,
            international_collaboration: 92.1,
            commercialization_rate: 67.8
          }
        },
        forecasts: {
          next_36_months: {
            market_expansion: '+45% - +65%',
            technology_maturity: 'Accelerating',
            investment_inflows: '€2.5B - €4.1B',
            job_creation: '12,000 - 18,000 roles'
          }
        }
      };

    default:
      return baseData;
  }
}