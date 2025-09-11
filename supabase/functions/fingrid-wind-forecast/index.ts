import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FingridRaw = z.array(z.object({
  value: z.number().finite(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  time: z.string().optional()
}));

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
    const horizon = url.searchParams.get('horizon') || '48h';
    
    if (zone !== 'FI') {
      return new Response(
        JSON.stringify({ error: 'Only FI zone supported currently' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - 1); // Start 1h ago
    const endTime = new Date();
    
    if (horizon === '48h') {
      endTime.setHours(endTime.getHours() + 48);
    } else if (horizon === '24h') {
      endTime.setHours(endTime.getHours() + 24);
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const cacheKey = `fgrd:245:${startTime.toISOString()}:${endTime.toISOString()}`;
    
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
      // Fetch from Fingrid - variable 245 is wind power forecast
      const rawData = await fetchFingrid(245, startTime.toISOString(), endTime.toISOString());
      
      const forecastData = rawData.map(item => ({
        ts: normalizeTimestamp(item),
        forecast_mw: Math.round(item.value),
        source: "fingrid" as const
      }));
      
      // Cache for 5-10 minutes
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 7);
      
      await supabase
        .from('cache_entries')
        .upsert({
          key: cacheKey,
          data: forecastData,
          expires_at: expiresAt.toISOString()
        });
      
      return new Response(
        JSON.stringify(forecastData),
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