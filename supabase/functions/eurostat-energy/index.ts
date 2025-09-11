import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Zod schemas
const EuMunicipalRow = z.object({
  year: z.number().int().gte(1990).lte(2100),
  sector: z.enum(["households","industry","transport","services","dh_losses"]),
  consumption_gwh: z.number().nonnegative(),
  heat_share_pct: z.number().min(0).max(100).nullable(),
  elec_share_pct: z.number().min(0).max(100).nullable(),
  source: z.literal("eurostat")
});

const EuSectorShareRow = z.object({
  year: z.number().int(),
  households_pct: z.number().min(0).max(100),
  industry_pct: z.number().min(0).max(100),
  transport_pct: z.number().min(0).max(100),
  services_pct: z.number().min(0).max(100),
  dh_losses_pct: z.number().min(0).max(100),
  source: z.literal("eurostat")
});

const Co2IntensityRow = z.object({
  year: z.number().int(),
  g_co2_per_kwh: z.number().nonnegative(),
  source: z.literal("eurostat")
});

// Sector mapping from Eurostat to our schema
const SECTOR_MAPPING: Record<string, string> = {
  'FC_EH': 'households',      // Final consumption - households
  'FC_IND': 'industry',       // Final consumption - industry
  'FC_TRA': 'transport',      // Final consumption - transport
  'FC_SCM': 'services',       // Final consumption - commercial and public services
  'DISTLOSS': 'dh_losses'     // District heating losses
};

async function fetchEurostat(dataset: string, params: Record<string, string>): Promise<any> {
  const baseUrl = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${dataset}`;
  const searchParams = new URLSearchParams(params);
  const url = `${baseUrl}?${searchParams.toString()}`;
  
  let lastError: Error | null = null;
  
  // Retry with exponential backoff
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`Eurostat API request (attempt ${attempt}):`, url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Eurostat API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Eurostat response received, keys:', Object.keys(data));
      return data;
    } catch (error) {
      lastError = error as Error;
      console.error(`Eurostat API attempt ${attempt} failed:`, error);
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw lastError;
}

function parseEurostatResponse(eurostatData: any, years: string[]): any[] {
  if (!eurostatData.value || !eurostatData.dimension) {
    console.log('No data in Eurostat response');
    return [];
  }

  const results: any[] = [];
  const dimensions = eurostatData.dimension;
  const values = eurostatData.value;
  
  // Get dimension indices
  const timeIndex = dimensions.time?.category?.index || {};
  const nrgBalIndex = dimensions.nrg_bal?.category?.index || {};
  const unitIndex = dimensions.unit?.category?.index || {};
  
  console.log('Parsing Eurostat dimensions:', {
    timeKeys: Object.keys(timeIndex),
    nrgBalKeys: Object.keys(nrgBalIndex),
    unitKeys: Object.keys(unitIndex)
  });
  
  // Parse each data point
  Object.entries(values).forEach(([key, value]: [string, any]) => {
    if (value === null || value === undefined) return;
    
    // Decode the multi-dimensional key
    const keyParts = key.split(':');
    if (keyParts.length < 4) return;
    
    const [geoKey, siecKey, nrgBalKey, unitKey, timeKey] = keyParts;
    
    // Map back to actual values
    const year = Object.keys(timeIndex).find(k => timeIndex[k] === parseInt(timeKey));
    const nrgBal = Object.keys(nrgBalIndex).find(k => nrgBalIndex[k] === parseInt(nrgBalKey));
    const unit = Object.keys(unitIndex).find(k => unitIndex[k] === parseInt(unitKey));
    
    if (!year || !nrgBal || !unit || !years.includes(year)) return;
    
    const sector = SECTOR_MAPPING[nrgBal];
    if (!sector) return;
    
    let consumption_gwh = parseFloat(value) || 0;
    
    // Convert KTOE to GWh if needed
    if (unit === 'KTOE') {
      consumption_gwh = consumption_gwh * 11630 / 1000;
    }
    
    if (consumption_gwh < 0) return;
    
    results.push({
      year: parseInt(year),
      sector,
      consumption_gwh: Math.round(consumption_gwh * 100) / 100, // Round to 2 decimals
      heat_share_pct: null, // Not available in Eurostat
      elec_share_pct: null, // Not available in Eurostat
      source: "eurostat"
    });
  });
  
  console.log(`Parsed ${results.length} data points from Eurostat`);
  return results;
}

function calculateSectorShares(municipalData: any[]): any[] {
  const yearGroups = municipalData.reduce((acc, item) => {
    if (!acc[item.year]) acc[item.year] = {};
    acc[item.year][item.sector] = item.consumption_gwh;
    return acc;
  }, {} as Record<number, Record<string, number>>);
  
  return Object.entries(yearGroups).map(([year, sectors]) => {
    const total = Object.values(sectors).reduce((sum: number, val: number) => sum + val, 0);
    
    if (total === 0) return null;
    
    return {
      year: parseInt(year),
      households_pct: Math.round(((sectors.households || 0) / total) * 100),
      industry_pct: Math.round(((sectors.industry || 0) / total) * 100),
      transport_pct: Math.round(((sectors.transport || 0) / total) * 100),
      services_pct: Math.round(((sectors.services || 0) / total) * 100),
      dh_losses_pct: Math.round(((sectors.dh_losses || 0) / total) * 100),
      source: "eurostat"
    };
  }).filter(Boolean);
}

function parseCo2IntensityResponse(eurostatData: any, years: string[]): any[] {
  if (!eurostatData.value || !eurostatData.dimension) {
    return [];
  }

  const results: any[] = [];
  const dimensions = eurostatData.dimension;
  const values = eurostatData.value;
  
  const timeIndex = dimensions.time?.category?.index || {};
  
  Object.entries(values).forEach(([key, value]: [string, any]) => {
    if (value === null || value === undefined) return;
    
    const keyParts = key.split(':');
    const timeKey = keyParts[keyParts.length - 1]; // Time is usually last
    
    const year = Object.keys(timeIndex).find(k => timeIndex[k] === parseInt(timeKey));
    if (!year || !years.includes(year)) return;
    
    const g_co2_per_kwh = parseFloat(value) || 0;
    if (g_co2_per_kwh < 0) return;
    
    results.push({
      year: parseInt(year),
      g_co2_per_kwh: Math.round(g_co2_per_kwh * 100) / 100,
      source: "eurostat"
    });
  });
  
  return results;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const endpoint = pathParts[pathParts.length - 1];
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Handle CO2 intensity endpoint
    if (endpoint === 'co2-intensity') {
      const country = url.searchParams.get('country') || 'EU27_2020';
      const years_param = url.searchParams.get('years') || '2019-2024';
      
      const [startYear, endYear] = years_param.split('-').map(Number);
      const years = Array.from(
        { length: endYear - startYear + 1 }, 
        (_, i) => (startYear + i).toString()
      );
      
      const cacheKey = `eurostat:co2:${country}:${years_param}`;
      
      // Try cache first
      const { data: cached } = await supabase
        .from('cache_entries')
        .select('data, expires_at')
        .eq('key', cacheKey)
        .maybeSingle();
      
      if (cached && new Date(cached.expires_at) > new Date()) {
        return new Response(
          JSON.stringify(cached.data),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      try {
        const eurostatData = await fetchEurostat('sdg_07_30', {
          geo: country,
          time: `${startYear}:${endYear}`,
          format: 'JSON'
        });
        
        const co2Data = parseCo2IntensityResponse(eurostatData, years);
        const validatedData = z.array(Co2IntensityRow).parse(co2Data);
        
        // Cache for 48 hours
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48);
        
        await supabase
          .from('cache_entries')
          .upsert({
            key: cacheKey,
            data: validatedData,
            expires_at: expiresAt.toISOString()
          });
        
        return new Response(
          JSON.stringify(validatedData),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
        
      } catch (error) {
        console.error('CO2 intensity API error:', error);
        
        // Return degraded response
        return new Response(
          JSON.stringify([]),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Handle municipal energy endpoints
    const geo_id = url.searchParams.get('geo_id') || 'EU27_2020';
    const years_param = url.searchParams.get('years') || '2019-2024';
    
    const [startYear, endYear] = years_param.split('-').map(Number);
    const years = Array.from(
      { length: endYear - startYear + 1 }, 
      (_, i) => (startYear + i).toString()
    );
    
    const cacheKey = `eurostat:municipal:${endpoint}:${geo_id}:${years_param}`;
    
    // Try cache first
    const { data: cached } = await supabase
      .from('cache_entries')
      .select('data, expires_at')
      .eq('key', cacheKey)
      .maybeSingle();
    
    if (cached && new Date(cached.expires_at) > new Date()) {
      return new Response(
        JSON.stringify(cached.data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    try {
      // Try NUTS-3 first, then fallback to NUTS-2
      let targetGeoId = geo_id;
      let eurostatData;
      
      try {
        console.log(`Trying NUTS-3 for geo_id: ${targetGeoId}`);
        eurostatData = await fetchEurostat('nrg_bal_s', {
          geo: targetGeoId,
          siec: 'TOTAL',
          nrg_bal: 'FC_EH,FC_IND,FC_TRA,FC_SCM,DISTLOSS',
          unit: 'GWH,KTOE',
          time: `${startYear}:${endYear}`,
          format: 'JSON'
        });
      } catch (nuts3Error) {
        console.log('NUTS-3 failed, trying NUTS-2 fallback');
        // Fallback to NUTS-2 (truncate last character if applicable)
        if (geo_id.length > 3) {
          targetGeoId = geo_id.substring(0, geo_id.length - 1);
          eurostatData = await fetchEurostat('nrg_bal_s', {
            geo: targetGeoId,
            siec: 'TOTAL',
            nrg_bal: 'FC_EH,FC_IND,FC_TRA,FC_SCM,DISTLOSS',
            unit: 'GWH,KTOE',
            time: `${startYear}:${endYear}`,
            format: 'JSON'
          });
        } else {
          throw nuts3Error;
        }
      }
      
      const municipalData = parseEurostatResponse(eurostatData, years);
      
      let responseData;
      
      if (endpoint === 'sector-share') {
        responseData = calculateSectorShares(municipalData);
      } else {
        responseData = municipalData;
      }
      
      // Validate response
      const schema = endpoint === 'sector-share' 
        ? z.array(EuSectorShareRow)
        : z.array(EuMunicipalRow);
        
      const validatedData = schema.parse(responseData);
      
      // Cache for 48 hours
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);
      
      await supabase
        .from('cache_entries')
        .upsert({
          key: cacheKey,
          data: validatedData,
          expires_at: expiresAt.toISOString()
        });
      
      return new Response(
        JSON.stringify(validatedData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (error) {
      console.error('Eurostat API error:', error);
      
      // Return cached data if available, mark as degraded
      if (cached) {
        const degradedData = Array.isArray(cached.data) ? cached.data.map((item: any) => ({
          ...item,
          source_status: "degraded"
        })) : [];
        
        return new Response(
          JSON.stringify(degradedData),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw error;
    }
    
  } catch (error) {
    console.error('Eurostat energy API error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});