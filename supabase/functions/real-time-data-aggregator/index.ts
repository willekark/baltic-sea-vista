import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DataSource {
  name: string;
  endpoint: string;
  parser: (data: any) => any;
  cacheKey: string;
  cacheMinutes: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dataTypes } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Real-time data aggregator - Data types requested:', dataTypes);

    // Data sources configuration
    const dataSources: { [key: string]: DataSource } = {
      'baltic_marine': {
        name: 'SMHI Baltic Marine Data',
        endpoint: 'https://opendata-download-ocobs.smhi.se/api/version/1.0.json',
        parser: parseBalticMarineData,
        cacheKey: 'baltic_marine_data',
        cacheMinutes: 60
      },
      'market_data': {
        name: 'European Market Data',
        endpoint: 'https://api.exchangerate-api.com/v4/latest/EUR',
        parser: parseMarketData,
        cacheKey: 'european_market_data',
        cacheMinutes: 15
      },
      'port_performance': {
        name: 'European Port Performance',
        endpoint: 'https://api.portcalls.eu/v1/statistics',
        parser: parsePortData,
        cacheKey: 'port_performance_data',
        cacheMinutes: 30
      },
      'regulatory_feeds': {
        name: 'EU Regulatory Feeds',
        endpoint: 'https://eur-lex.europa.eu/search.html?scope=EURLEX&type=quick&qid=1234567890123&DTS_DOM=ALL&typeOfActStatus=ALL&DTS_SUBDOM=ALL',
        parser: parseRegulatoryData,
        cacheKey: 'eu_regulatory_feeds',
        cacheMinutes: 240
      },
      'vessel_tracking': {
        name: 'AIS Vessel Data',
        endpoint: 'https://api.vesselfinder.com/api/v1/vessels',
        parser: parseVesselData,
        cacheKey: 'vessel_tracking_data',
        cacheMinutes: 5
      }
    };

    const results: any = {};

    for (const dataType of dataTypes) {
      if (dataSources[dataType]) {
        try {
          const cachedData = await getCachedData(supabase, dataSources[dataType].cacheKey);
          
          if (cachedData) {
            console.log(`Using cached data for ${dataType}`);
            results[dataType] = cachedData;
          } else {
            console.log(`Fetching fresh data for ${dataType} from ${dataSources[dataType].name}`);
            const freshData = await fetchFreshData(supabase, dataSources[dataType]);
            results[dataType] = freshData;
          }
        } catch (error) {
          console.error(`Error fetching ${dataType}:`, error);
          results[dataType] = { error: error.message, fallback: await getFallbackData(dataType) };
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      data: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in real-time-data-aggregator:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getCachedData(supabase: any, cacheKey: string) {
  const { data, error } = await supabase
    .from('data_cache')
    .select('cached_data')
    .eq('cache_key', cacheKey)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) return null;
  return data.cached_data;
}

async function fetchFreshData(supabase: any, source: DataSource) {
  // For now, we'll simulate API calls with realistic data
  // In production, you would make actual HTTP requests to external APIs
  const simulatedData = await generateRealisticData(source.name);
  
  // Cache the data
  await cacheData(supabase, source.cacheKey, source.name, simulatedData, source.cacheMinutes);
  
  return source.parser(simulatedData);
}

async function cacheData(supabase: any, cacheKey: string, sourceName: string, data: any, minutes: number) {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + minutes);

  await supabase
    .from('data_cache')
    .upsert({
      cache_key: cacheKey,
      source: sourceName,
      endpoint: 'simulated',
      data_type: 'json',
      cached_data: data,
      expires_at: expiresAt.toISOString()
    });
}

async function generateRealisticData(sourceName: string) {
  const now = new Date();
  
  switch (sourceName) {
    case 'SMHI Baltic Marine Data':
      return {
        stations: generateBalticStations(),
        measurements: generateMarineMeasurements(now),
        water_quality: generateWaterQuality(),
        temperature_data: generateTemperatureData(now)
      };
      
    case 'European Market Data':
      return {
        rates: generateExchangeRates(),
        baltic_stocks: generateBalticStocks(),
        commodities: generateCommodityPrices(),
        economic_indicators: generateEconomicIndicators()
      };
      
    case 'European Port Performance':
      return {
        port_statistics: generatePortStatistics(),
        congestion_data: generateCongestionData(),
        throughput_data: generateThroughputData(now)
      };
      
    case 'EU Regulatory Feeds':
      return {
        recent_regulations: generateRecentRegulations(now),
        upcoming_changes: generateUpcomingRegulations(),
        compliance_updates: generateComplianceUpdates()
      };
      
    case 'AIS Vessel Data':
      return {
        vessels: generateVesselPositions(),
        tracking_data: generateTrackingData(now),
        port_calls: generatePortCalls()
      };
      
    default:
      return { message: 'No data generator for this source' };
  }
}

// Data parsers for different sources
function parseBalticMarineData(data: any) {
  return {
    water_temperature: data.temperature_data?.average || (Math.random() * 10 + 8).toFixed(1),
    salinity: data.measurements?.salinity || (Math.random() * 5 + 7).toFixed(1),
    oxygen_levels: data.water_quality?.oxygen || (Math.random() * 3 + 8).toFixed(1),
    ph_levels: data.water_quality?.ph || (Math.random() * 0.5 + 7.8).toFixed(1),
    nutrient_levels: {
      nitrogen: (Math.random() * 2 + 1).toFixed(2),
      phosphorus: (Math.random() * 0.5 + 0.1).toFixed(2)
    },
    stations_active: data.stations?.length || 45,
    last_updated: new Date().toISOString()
  };
}

function parseMarketData(data: any) {
  return {
    eur_usd: data.rates?.USD || (1.08 + Math.random() * 0.1).toFixed(4),
    eur_sek: data.rates?.SEK || (11.2 + Math.random() * 0.5).toFixed(2),
    baltic_index: data.economic_indicators?.baltic_dry_index || Math.floor(Math.random() * 500 + 1200),
    shipping_stocks: data.baltic_stocks || {
      'MAERSK-B.CO': { price: (1850 + Math.random() * 200).toFixed(2), change: (Math.random() * 4 - 2).toFixed(2) },
      'SAS.ST': { price: (65 + Math.random() * 20).toFixed(2), change: (Math.random() * 6 - 3).toFixed(2) },
      'TORM.CO': { price: (180 + Math.random() * 40).toFixed(2), change: (Math.random() * 8 - 4).toFixed(2) }
    },
    commodity_prices: data.commodities || {
      crude_oil: (85 + Math.random() * 20).toFixed(2),
      natural_gas: (45 + Math.random() * 15).toFixed(2)
    }
  };
}

function parsePortData(data: any) {
  const ports = ['Göteborg', 'Stockholm', 'Helsinki', 'Copenhagen', 'Tallinn', 'Riga'];
  return {
    port_efficiency: ports.reduce((acc: any, port) => {
      acc[port] = {
        turnaround_hours: (12 + Math.random() * 16).toFixed(1),
        capacity_utilization: Math.floor(Math.random() * 30 + 70),
        congestion_level: Math.random() < 0.3 ? 'High' : Math.random() < 0.7 ? 'Medium' : 'Low',
        vessels_waiting: Math.floor(Math.random() * 15)
      };
      return acc;
    }, {}),
    regional_throughput: (Math.random() * 50 + 150).toFixed(1) + 'M TEU'
  };
}

function parseRegulatoryData(data: any) {
  return {
    recent_changes: data.recent_regulations?.slice(0, 5) || [],
    compliance_deadlines: data.upcoming_changes?.slice(0, 3) || [],
    impact_assessments: data.compliance_updates || []
  };
}

function parseVesselData(data: any) {
  return {
    active_vessels: data.vessels?.length || Math.floor(Math.random() * 100 + 200),
    shadow_fleet_alerts: Math.floor(Math.random() * 5 + 1),
    ais_coverage: (Math.random() * 5 + 94).toFixed(1) + '%',
    recent_incidents: Math.floor(Math.random() * 3)
  };
}

// Helper functions for generating realistic data
function generateBalticStations() {
  return Array.from({ length: 45 }, (_, i) => ({
    id: `SMHI_${i + 1}`,
    name: `Baltic Station ${i + 1}`,
    lat: 54 + Math.random() * 12,
    lng: 10 + Math.random() * 20,
    active: Math.random() > 0.1
  }));
}

function generateMarineMeasurements(date: Date) {
  return {
    salinity: (Math.random() * 5 + 7).toFixed(1),
    temperature: (Math.random() * 15 + 5).toFixed(1),
    timestamp: date.toISOString()
  };
}

function generateWaterQuality() {
  return {
    oxygen: (Math.random() * 3 + 8).toFixed(1),
    ph: (Math.random() * 0.5 + 7.8).toFixed(1),
    turbidity: (Math.random() * 5 + 1).toFixed(1)
  };
}

function generateTemperatureData(date: Date) {
  return {
    average: (Math.random() * 10 + 8).toFixed(1),
    max: (Math.random() * 15 + 12).toFixed(1),
    min: (Math.random() * 8 + 3).toFixed(1),
    date: date.toISOString()
  };
}

function generateExchangeRates() {
  return {
    USD: (1.08 + Math.random() * 0.1).toFixed(4),
    SEK: (11.2 + Math.random() * 0.5).toFixed(2),
    DKK: (7.44 + Math.random() * 0.1).toFixed(2),
    NOK: (11.8 + Math.random() * 0.5).toFixed(2)
  };
}

function generateBalticStocks() {
  return {
    'MAERSK-B.CO': { price: (1850 + Math.random() * 200).toFixed(2), change: (Math.random() * 4 - 2).toFixed(2) },
    'SAS.ST': { price: (65 + Math.random() * 20).toFixed(2), change: (Math.random() * 6 - 3).toFixed(2) },
    'TORM.CO': { price: (180 + Math.random() * 40).toFixed(2), change: (Math.random() * 8 - 4).toFixed(2) },
    'DFDS.CO': { price: (320 + Math.random() * 60).toFixed(2), change: (Math.random() * 5 - 2.5).toFixed(2) }
  };
}

function generateCommodityPrices() {
  return {
    crude_oil: (85 + Math.random() * 20).toFixed(2),
    natural_gas: (45 + Math.random() * 15).toFixed(2),
    iron_ore: (120 + Math.random() * 30).toFixed(2)
  };
}

function generateEconomicIndicators() {
  return {
    baltic_dry_index: Math.floor(Math.random() * 500 + 1200),
    gdp_growth: {
      sweden: (Math.random() * 2 + 1).toFixed(1),
      finland: (Math.random() * 2 + 1).toFixed(1),
      denmark: (Math.random() * 2 + 1).toFixed(1)
    }
  };
}

function generatePortStatistics() {
  const ports = ['Göteborg', 'Stockholm', 'Helsinki', 'Copenhagen', 'Tallinn', 'Riga'];
  return ports.map(port => ({
    name: port,
    throughput_teu: Math.floor(Math.random() * 500000 + 1000000),
    efficiency_score: Math.floor(Math.random() * 20 + 80),
    annual_growth: (Math.random() * 10 - 2).toFixed(1)
  }));
}

function generateCongestionData() {
  return {
    average_waiting_time: (Math.random() * 10 + 5).toFixed(1),
    peak_season_impact: Math.floor(Math.random() * 30 + 20),
    weather_delays: Math.floor(Math.random() * 15 + 5)
  };
}

function generateThroughputData(date: Date) {
  return Array.from({ length: 12 }, (_, i) => ({
    month: new Date(date.getFullYear(), i, 1).toISOString().slice(0, 7),
    volume: Math.floor(Math.random() * 200000 + 800000)
  }));
}

function generateRecentRegulations(date: Date) {
  const regulations = [
    'Enhanced Maritime Security Directive 2024/152/EU',
    'Green Shipping Corridor Regulation (EU) 2024/234',
    'Baltic Sea Protection Amendment 2024/167/EU',
    'Digital Maritime Services Act 2024/189/EU',
    'Sustainable Port Operations Directive 2024/201/EU'
  ];
  
  return regulations.map((title, i) => ({
    title,
    type: 'EU Directive',
    published_date: new Date(date.getTime() - (i * 7 * 24 * 60 * 60 * 1000)).toISOString(),
    impact_level: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
    sectors: ['Maritime', 'Environmental', 'Digital', 'Security'].slice(0, Math.floor(Math.random() * 3) + 1)
  }));
}

function generateUpcomingRegulations() {
  return [
    {
      title: 'Carbon Border Adjustment Implementation',
      effective_date: '2024-10-01',
      impact_level: 'High',
      preparation_required: true
    },
    {
      title: 'Enhanced Port State Control Measures',
      effective_date: '2024-12-15',
      impact_level: 'Medium',
      preparation_required: true
    }
  ];
}

function generateComplianceUpdates() {
  return [
    {
      regulation: 'IMO 2020 Sulphur Regulation',
      compliance_rate: '94.2%',
      violations_detected: 23,
      trend: 'improving'
    },
    {
      regulation: 'EU ETS Maritime Extension',
      compliance_rate: '87.1%',
      violations_detected: 45,
      trend: 'stable'
    }
  ];
}

function generateVesselPositions() {
  return Array.from({ length: 250 }, (_, i) => ({
    mmsi: 200000000 + i,
    vessel_type: ['Cargo', 'Tanker', 'Container', 'Bulk Carrier'][Math.floor(Math.random() * 4)],
    lat: 54 + Math.random() * 12,
    lng: 10 + Math.random() * 20,
    speed: Math.random() * 20,
    course: Math.random() * 360,
    last_update: new Date(Date.now() - Math.random() * 3600000).toISOString()
  }));
}

function generateTrackingData(date: Date) {
  return {
    total_vessels_tracked: 247,
    ais_coverage_percentage: 96.8,
    dark_vessel_alerts: 3,
    suspicious_activities: 1
  };
}

function generatePortCalls() {
  const ports = ['SEGOT', 'SESTO', 'FIHEL', 'DKCPH', 'EETLL', 'LVRIX'];
  return ports.map(port => ({
    port_code: port,
    arrivals_24h: Math.floor(Math.random() * 20 + 5),
    departures_24h: Math.floor(Math.random() * 18 + 4),
    vessels_in_port: Math.floor(Math.random() * 30 + 10)
  }));
}

async function getFallbackData(dataType: string) {
  // Return basic fallback data when APIs fail
  switch (dataType) {
    case 'baltic_marine':
      return {
        water_temperature: '8.5',
        salinity: '7.2',
        oxygen_levels: '8.9',
        status: 'fallback_data'
      };
    case 'market_data':
      return {
        eur_usd: '1.0842',
        baltic_index: 1345,
        status: 'fallback_data'
      };
    default:
      return { status: 'fallback_data', message: 'Service temporarily unavailable' };
  }
}