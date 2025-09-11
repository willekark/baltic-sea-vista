import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Fingrid variable mapping for FI generation mix
const MIX_MAP_FI = {
  wind_onshore: [181],    // Wind power production
  nuclear: [188],         // Nuclear power production
  hydro: [191],          // Hydro power production
  fossil: [189],         // Thermal power (proxy for fossil)
  biomass: [],           // Not available separately
  solar: [],             // Small solar contribution, can add later
  wind_offshore: []      // Finland has minimal offshore wind
};

const FingridRaw = z.array(z.object({
  value: z.number().finite(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  time: z.string().optional()
}));

const MixRow = z.object({ 
  ts: z.string(), 
  fuel_type: z.enum(["wind_offshore","wind_onshore","solar","hydro","biomass","nuclear","fossil"]), 
  gen_mw: z.number() 
});

async function fetchFingrid(variableId: number, startTime?: string, endTime?: string) {
  const baseUrl = `https://api.fingrid.fi/v1/variable/${variableId}/events/json`;
  const params = new URLSearchParams();
  
  if (startTime) params.append('start_time', startTime);
  if (endTime) params.append('end_time', endTime);
  
  const url = params.toString() ? `${baseUrl}?${params}` : baseUrl;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  const apiKey = Deno.env.get('FINGRID_API_KEY');
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`Fingrid API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return FingridRaw.parse(data);
    } catch (error) {
      lastError = error as Error;
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw lastError;
}

function normalizeTimestamp(raw: any): string {
  const timeStr = raw.end_time || raw.time || raw.start_time;
  const date = new Date(timeStr);
  date.setMinutes(0, 0, 0);
  return date.toISOString();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url);
    const zone = url.searchParams.get('zone') || 'FI';
    const range = url.searchParams.get('range') || '24h';
    
    if (zone !== 'FI') {
      return new Response(
        JSON.stringify({ error: 'Only FI zone supported currently' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const endTime = new Date();
    const startTime = new Date();
    
    if (range === '24h') {
      startTime.setHours(startTime.getHours() - 24);
    } else if (range === '1h') {
      startTime.setHours(startTime.getHours() - 1);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const cacheKey = `fgrd:mix:${startTime.toISOString()}:${endTime.toISOString()}`;
    
    // Try cache first
    const { data: cached } = await supabase
      .from('cache_entries')
      .select('data, expires_at')
      .eq('key', cacheKey)
      .single();
    
    if (cached && new Date(cached.expires_at) > new Date()) {
      return new Response(
        JSON.stringify(cached.data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    try {
      const mixData: any[] = [];
      
      // Fetch each fuel type
      for (const [fuelType, variableIds] of Object.entries(MIX_MAP_FI)) {
        if (variableIds.length === 0) continue;
        
        for (const variableId of variableIds) {
          const rawData = await fetchFingrid(variableId, startTime.toISOString(), endTime.toISOString());
          
          for (const item of rawData) {
            mixData.push({
              ts: normalizeTimestamp(item),
              fuel_type: fuelType as any,
              gen_mw: Math.round(item.value)
            });
          }
        }
      }
      
      // Group by timestamp and fuel_type, sum if duplicates
      const grouped = new Map<string, number>();
      
      for (const item of mixData) {
        const key = `${item.ts}:${item.fuel_type}`;
        grouped.set(key, (grouped.get(key) || 0) + item.gen_mw);
      }
      
      const result = Array.from(grouped.entries()).map(([key, gen_mw]) => {
        const [ts, fuel_type] = key.split(':');
        return { ts, fuel_type, gen_mw };
      });
      
      // Cache for 5 minutes
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);
      
      await supabase
        .from('cache_entries')
        .upsert({
          key: cacheKey,
          data: result,
          expires_at: expiresAt.toISOString()
        });
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (error) {
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
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});