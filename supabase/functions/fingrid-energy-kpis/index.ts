import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function fetchLatestWind() {
  const apiKey = Deno.env.get('FINGRID_API_KEY');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }
  
  try {
    // Get latest wind production (variable 181)
    const response = await fetch('https://api.fingrid.fi/v1/variable/181/events/json', { headers });
    
    if (!response.ok) {
      throw new Error(`Fingrid API error: ${response.status}`);
    }
    
    const data = await response.json();
    if (data && data.length > 0) {
      return Math.round(data[data.length - 1].value);
    }
    
    return null;
  } catch (error) {
    console.error('Failed to fetch wind data:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Check cache
    const cacheKey = 'energy:kpis:latest';
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
    
    // Fetch live wind data
    const windMW = await fetchLatestWind();
    
    const kpis = {
      avg_price_eur_mwh: 72.1, // Still mock for now
      offshore_wind_mw: windMW || 1420, // Use live FI wind as proxy
      ops_coverage_pct: 0.68, // Still mock
      green_fuel_ports: 12, // Still mock
      last_updated_utc: new Date().toISOString(),
      source_status: windMW ? "live" : "degraded"
    };
    
    // Cache for 5 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);
    
    await supabase
      .from('cache_entries')
      .upsert({
        key: cacheKey,
        data: kpis,
        expires_at: expiresAt.toISOString()
      });
    
    return new Response(
      JSON.stringify(kpis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});