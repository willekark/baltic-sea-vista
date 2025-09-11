import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Zod schemas
const FingridRaw = z.array(z.object({
  value: z.number().finite(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  time: z.string().optional()
}));

const LoadRow = z.object({ 
  ts: z.string(), 
  load_mw: z.number(), 
  source: z.literal("fingrid") 
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
  
  // Add API key if available
  const apiKey = Deno.env.get('FINGRID_API_KEY');
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }
  
  let lastError: Error | null = null;
  
  // Retry with exponential backoff
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
  // Round to top of hour
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
    
    // Calculate time range
    const endTime = new Date();
    const startTime = new Date();
    
    if (range === '24h') {
      startTime.setHours(startTime.getHours() - 24);
    } else if (range === '1h') {
      startTime.setHours(startTime.getHours() - 1);
    }
    
    // Check cache first
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const cacheKey = `fgrd:192:${startTime.toISOString()}:${endTime.toISOString()}`;
    
    // Try to get from cache
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
      // Fetch from Fingrid - variable 192 is electricity consumption
      const rawData = await fetchFingrid(192, startTime.toISOString(), endTime.toISOString());
      
      const loadData = rawData.map(item => ({
        ts: normalizeTimestamp(item),
        load_mw: Math.round(item.value),
        source: "fingrid" as const
      }));
      
      // Cache for 5 minutes
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);
      
      await supabase
        .from('cache_entries')
        .upsert({
          key: cacheKey,
          data: loadData,
          expires_at: expiresAt.toISOString()
        });
      
      return new Response(
        JSON.stringify(loadData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (error) {
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
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});