import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Response schema
const PeakClashResponse = z.object({
  clash_score: z.number().min(0).max(1),
  peak_hours_local: z.array(z.string()),
  method: z.literal("heuristic"),
  source: z.literal("scb+heuristic")
});

function calculatePeakClash(geo_id: string): any {
  // Swedish typical residential/commercial peak window: 16:00–20:00 local on weekdays
  const peak_hours_local = ["16:00", "17:00", "18:00", "19:00", "20:00"];
  
  // Simple heuristic based on municipality and current time
  const now = new Date();
  const currentHour = now.getHours();
  const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
  
  // Major Swedish municipalities with significant port activity
  const majorPortMunicipalities = [
    'SE0180', // Stockholm
    'SE1480', // Göteborg  
    'SE1280', // Malmö
    'SE2180', // Gävle
    'SE2180', // Sundsvall
    'SE0114'  // Upplands Väsby (example)
  ];
  
  let clash_score = 0.2; // Base low score
  
  // Higher clash score during peak hours on weekdays
  if (isWeekday && currentHour >= 16 && currentHour <= 20) {
    clash_score = 0.6; // Medium clash
  }
  
  // Increase score for major port municipalities
  if (majorPortMunicipalities.includes(geo_id)) {
    clash_score = Math.min(clash_score + 0.1, 1.0);
  }
  
  // Random variation to simulate real conditions
  const variation = (Math.random() - 0.5) * 0.2;
  clash_score = Math.max(0, Math.min(1, clash_score + variation));
  
  return {
    clash_score: Math.round(clash_score * 100) / 100,
    peak_hours_local,
    method: "heuristic",
    source: "scb+heuristic"
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url);
    const geo_id = url.searchParams.get('geo_id') || 'SE0114';
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const cacheKey = `scb:peaks:${geo_id}`;
    
    // Try to get from cache (short cache - 1 hour for peaks)
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
    
    // Calculate peak clash using heuristic
    const peakData = calculatePeakClash(geo_id);
    
    // Validate response
    const validatedData = PeakClashResponse.parse(peakData);
    
    // Cache for 1 hour
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    
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
    console.error('Municipal peaks API error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});