import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Zod schemas
const MunicipalRow = z.object({
  year: z.number().int().gte(1990).lte(2100),
  sector: z.enum(["households","industry","transport","services","dh_losses"]),
  consumption_gwh: z.number().nonnegative(),
  heat_share_pct: z.number().min(0).max(100).nullable(),
  elec_share_pct: z.number().min(0).max(100).nullable(),
  source: z.literal("scb")
});

const SectorShareRow = z.object({
  year: z.number().int(),
  households_pct: z.number().min(0).max(100),
  industry_pct: z.number().min(0).max(100),
  transport_pct: z.number().min(0).max(100),
  services_pct: z.number().min(0).max(100),
  dh_losses_pct: z.number().min(0).max(100),
  source: z.literal("scb")
});

// Sector mapping from Swedish to English
const SECTOR_MAPPING: Record<string, string> = {
  'Hushåll': 'households',
  'Industri': 'industry', 
  'Transport': 'transport',
  'Tjänster': 'services',
  'Fjärrvärmeförluster': 'dh_losses',
  'Offentlig verksamhet': 'services', // Map public services to services
  'Handel och tjänster': 'services'    // Map commercial to services
};

async function postScb(path: string, body: any): Promise<any> {
  const url = `https://api.scb.se${path}`;
  
  let lastError: Error | null = null;
  
  // Retry with exponential backoff
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        throw new Error(`SCB API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      lastError = error as Error;
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw lastError;
}

function parseScbResponse(scbData: any, years: string[]): any[] {
  if (!scbData.data || !Array.isArray(scbData.data)) {
    return [];
  }

  const results: any[] = [];
  
  // Parse SCB data structure
  scbData.data.forEach((item: any) => {
    if (!item.key || !item.values || !Array.isArray(item.key) || !Array.isArray(item.values)) {
      return;
    }
    
    // Extract year, sector, and value from SCB format
    const [regionCode, sectorSwedish, yearStr] = item.key;
    const [consumptionStr] = item.values;
    
    if (!yearStr || !sectorSwedish || !consumptionStr) return;
    
    const year = parseInt(yearStr);
    const consumption_gwh = parseFloat(consumptionStr) || 0;
    const sector = SECTOR_MAPPING[sectorSwedish];
    
    if (!sector || !years.includes(yearStr) || consumption_gwh < 0) return;
    
    // Calculate heat/elec shares (simplified heuristic)
    let heat_share_pct: number | null = null;
    let elec_share_pct: number | null = null;
    
    if (sector === 'households') {
      heat_share_pct = 63; // Typical Swedish household DH share
      elec_share_pct = 37;
    } else if (sector === 'industry') {
      heat_share_pct = 18; // Lower DH share in industry
      elec_share_pct = 82;
    } else if (sector === 'transport') {
      heat_share_pct = 0;  // Transport is mainly electricity
      elec_share_pct = 100;
    } else if (sector === 'services') {
      heat_share_pct = 45; // Mixed services
      elec_share_pct = 55;
    } else if (sector === 'dh_losses') {
      heat_share_pct = 100; // DH losses are 100% heat
      elec_share_pct = 0;
    }
    
    results.push({
      year,
      sector,
      consumption_gwh,
      heat_share_pct,
      elec_share_pct,
      source: "scb"
    });
  });
  
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
      source: "scb"
    };
  }).filter(Boolean);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url);
    const geo_id = url.searchParams.get('geo_id') || 'SE0114'; // Default to Upplands Väsby
    const years_param = url.searchParams.get('years') || '2019-2024';
    const endpoint = url.pathname.split('/').pop();
    
    // Parse years range
    const [startYear, endYear] = years_param.split('-').map(Number);
    const years = Array.from(
      { length: endYear - startYear + 1 }, 
      (_, i) => (startYear + i).toString()
    );
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const cacheKey = `scb:municipal:${endpoint}:${geo_id}:${years_param}`;
    
    // Try to get from cache
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
      // Build SCB query
      const scbQuery = {
        "query": [
          { "code": "Region", "selection": { "filter": "item", "values": [geo_id] } },
          { "code": "ContentsCode", "selection": { "filter": "item", "values": ["EN0201A01"] } },
          { "code": "Year", "selection": { "filter": "item", "values": years } }
        ],
        "response": { "format": "JSON" }
      };
      
      // Fetch from SCB
      const scbData = await postScb('/OV0104/v1/doris/en/ssd/EN/EN0201/EN0201A/EnergiBalansKommun', scbQuery);
      const municipalData = parseScbResponse(scbData, years);
      
      let responseData;
      
      if (endpoint === 'sector-share') {
        responseData = calculateSectorShares(municipalData);
      } else {
        responseData = municipalData;
      }
      
      // Validate response
      const schema = endpoint === 'sector-share' 
        ? z.array(SectorShareRow)
        : z.array(MunicipalRow);
        
      const validatedData = schema.parse(responseData);
      
      // Cache for 24 hours
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
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
      console.error('SCB API error:', error);
      
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
    console.error('Municipal energy API error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});