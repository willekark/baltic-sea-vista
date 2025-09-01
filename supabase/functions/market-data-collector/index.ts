import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Market data collector starting...');

    // Collect market data from multiple sources
    const marketData = await collectMarketData();
    
    // Store in database
    await storeMarketData(supabase, marketData);

    // Calculate investment opportunities
    const opportunities = await calculateInvestmentOpportunities(marketData);

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      market_data: marketData,
      investment_opportunities: opportunities,
      data_points_collected: Object.keys(marketData).length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in market-data-collector:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function collectMarketData() {
  console.log('Collecting real-time market data...');
  
  // Simulate real market data collection
  const now = new Date();
  const basePrice = 100;
  
  return {
    // Baltic region stocks
    nordic_stocks: {
      'MAERSK-B.CO': {
        price: (1850 + (Math.random() - 0.5) * 100).toFixed(2),
        change_percent: ((Math.random() - 0.5) * 6).toFixed(2),
        volume: Math.floor(Math.random() * 1000000 + 500000),
        market_cap: '45.2B EUR',
        sector: 'Shipping & Logistics'
      },
      'SAS.ST': {
        price: (65 + (Math.random() - 0.5) * 10).toFixed(2),
        change_percent: ((Math.random() - 0.5) * 8).toFixed(2),
        volume: Math.floor(Math.random() * 2000000 + 1000000),
        market_cap: '2.1B SEK',
        sector: 'Airlines'
      },
      'TORM.CO': {
        price: (180 + (Math.random() - 0.5) * 30).toFixed(2),
        change_percent: ((Math.random() - 0.5) * 10).toFixed(2),
        volume: Math.floor(Math.random() * 500000 + 200000),
        market_cap: '1.8B DKK',
        sector: 'Tanker Shipping'
      },
      'DFDS.CO': {
        price: (320 + (Math.random() - 0.5) * 50).toFixed(2),
        change_percent: ((Math.random() - 0.5) * 7).toFixed(2),
        volume: Math.floor(Math.random() * 300000 + 100000),
        market_cap: '3.4B DKK',
        sector: 'Ferry Operations'
      }
    },
    
    // Currency rates (real-time simulation)
    currency_rates: {
      EUR_USD: (1.08 + (Math.random() - 0.5) * 0.02).toFixed(4),
      EUR_SEK: (11.2 + (Math.random() - 0.5) * 0.3).toFixed(3),
      EUR_DKK: (7.44 + (Math.random() - 0.5) * 0.05).toFixed(3),
      EUR_NOK: (11.8 + (Math.random() - 0.5) * 0.4).toFixed(3),
      last_updated: now.toISOString()
    },
    
    // Commodity prices
    commodities: {
      crude_oil_brent: {
        price: (85 + (Math.random() - 0.5) * 8).toFixed(2),
        change_percent: ((Math.random() - 0.5) * 4).toFixed(2),
        unit: 'USD/barrel'
      },
      natural_gas_ttf: {
        price: (45 + (Math.random() - 0.5) * 6).toFixed(2),
        change_percent: ((Math.random() - 0.5) * 8).toFixed(2),
        unit: 'EUR/MWh'
      },
      iron_ore: {
        price: (120 + (Math.random() - 0.5) * 15).toFixed(2),
        change_percent: ((Math.random() - 0.5) * 5).toFixed(2),
        unit: 'USD/tonne'
      },
      carbon_credits_eu_ets: {
        price: (85 + (Math.random() - 0.5) * 10).toFixed(2),
        change_percent: ((Math.random() - 0.5) * 6).toFixed(2),
        unit: 'EUR/tonne CO2'
      }
    },
    
    // Economic indicators
    economic_indicators: {
      baltic_dry_index: Math.floor(1200 + (Math.random() - 0.5) * 400),
      sweden_gdp_growth: (2.1 + (Math.random() - 0.5) * 1.5).toFixed(1),
      finland_gdp_growth: (1.8 + (Math.random() - 0.5) * 1.2).toFixed(1),
      denmark_gdp_growth: (2.3 + (Math.random() - 0.5) * 1.4).toFixed(1),
      estonia_gdp_growth: (3.1 + (Math.random() - 0.5) * 1.8).toFixed(1),
      latvia_gdp_growth: (2.9 + (Math.random() - 0.5) * 1.6).toFixed(1),
      lithuania_gdp_growth: (2.7 + (Math.random() - 0.5) * 1.5).toFixed(1)
    },
    
    // Sector performance
    sector_performance: {
      maritime_shipping: {
        performance_ytd: (12.1 + (Math.random() - 0.5) * 8).toFixed(1),
        volatility: (15.2 + (Math.random() - 0.5) * 5).toFixed(1),
        trend: Math.random() > 0.5 ? 'bullish' : 'bearish'
      },
      green_energy: {
        performance_ytd: (18.7 + (Math.random() - 0.5) * 12).toFixed(1),
        volatility: (22.1 + (Math.random() - 0.5) * 8).toFixed(1),
        trend: 'bullish'
      },
      port_operations: {
        performance_ytd: (8.3 + (Math.random() - 0.5) * 6).toFixed(1),
        volatility: (12.4 + (Math.random() - 0.5) * 4).toFixed(1),
        trend: 'neutral'
      }
    },
    
    // Capital flows
    capital_flows: {
      fdi_inflows_eur_m: Math.floor(2800 + (Math.random() - 0.5) * 1000),
      portfolio_investment_eur_m: Math.floor(2200 + (Math.random() - 0.5) * 800),
      green_bond_issuance_eur_m: Math.floor(1500 + (Math.random() - 0.5) * 600),
      month: now.toISOString().slice(0, 7)
    },
    
    timestamp: now.toISOString()
  };
}

async function storeMarketData(supabase: any, marketData: any) {
  console.log('Storing market data in database...');
  
  const timestamp = new Date();
  const records = [];
  
  // Store Nordic stocks
  for (const [symbol, data] of Object.entries(marketData.nordic_stocks)) {
    records.push({
      symbol,
      exchange: 'NASDAQ Nordic',
      price: parseFloat((data as any).price),
      change_percent: parseFloat((data as any).change_percent),
      volume: (data as any).volume,
      sector: (data as any).sector,
      timestamp: timestamp.toISOString()
    });
  }
  
  // Store commodity data
  for (const [commodity, data] of Object.entries(marketData.commodities)) {
    records.push({
      symbol: commodity.toUpperCase(),
      exchange: 'COMMODITY',
      price: parseFloat((data as any).price),
      change_percent: parseFloat((data as any).change_percent),
      sector: 'Commodities',
      timestamp: timestamp.toISOString()
    });
  }
  
  if (records.length > 0) {
    const { error } = await supabase
      .from('market_data')
      .insert(records);
      
    if (error) {
      console.error('Error storing market data:', error);
    } else {
      console.log(`Stored ${records.length} market data records`);
    }
  }
}

async function calculateInvestmentOpportunities(marketData: any) {
  console.log('Calculating investment opportunities...');
  
  const opportunities = [];
  
  // Analyze shipping sector
  const shippingPerformance = marketData.sector_performance.maritime_shipping.performance_ytd;
  if (parseFloat(shippingPerformance) > 10) {
    opportunities.push({
      type: 'Equity Investment',
      sector: 'Maritime Shipping',
      recommendation: 'Strong Buy',
      rationale: `Maritime shipping sector showing exceptional performance at ${shippingPerformance}% YTD`,
      risk_level: 'Medium',
      estimated_return: '15-22%',
      investment_size: '€10-50M',
      timeline: '12-18 months'
    });
  }
  
  // Analyze green energy opportunities
  const greenEnergyPerformance = marketData.sector_performance.green_energy.performance_ytd;
  if (parseFloat(greenEnergyPerformance) > 15) {
    opportunities.push({
      type: 'Green Bond',
      sector: 'Renewable Energy',
      recommendation: 'Buy',
      rationale: `Green energy sector outperforming at ${greenEnergyPerformance}% YTD with strong regulatory support`,
      risk_level: 'Low-Medium',
      estimated_return: '6-12%',
      investment_size: '€5-25M',
      timeline: '3-7 years'
    });
  }
  
  // Analyze currency arbitrage
  const eurUsd = parseFloat(marketData.currency_rates.EUR_USD);
  const eurSek = parseFloat(marketData.currency_rates.EUR_SEK);
  
  if (eurUsd < 1.07 || eurSek > 11.5) {
    opportunities.push({
      type: 'Currency Hedge',
      sector: 'Foreign Exchange',
      recommendation: 'Hedge',
      rationale: 'Favorable EUR positioning for Nordic investments',
      risk_level: 'Low',
      estimated_return: '3-8%',
      investment_size: '€1-10M',
      timeline: '3-12 months'
    });
  }
  
  // Analyze commodity exposure
  const oilPrice = parseFloat(marketData.commodities.crude_oil_brent.price);
  const carbonPrice = parseFloat(marketData.commodities.carbon_credits_eu_ets.price);
  
  if (carbonPrice > 80 && oilPrice < 90) {
    opportunities.push({
      type: 'ESG Investment',
      sector: 'Carbon Credits & Clean Tech',
      recommendation: 'Strong Buy',
      rationale: 'High carbon prices driving clean technology adoption and investment returns',
      risk_level: 'Medium-High',
      estimated_return: '20-35%',
      investment_size: '€2-15M',
      timeline: '2-5 years'
    });
  }
  
  return opportunities;
}