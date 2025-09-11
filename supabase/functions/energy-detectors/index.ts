import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function fetchFingridLatest(variableId: number) {
  const apiKey = Deno.env.get('FINGRID_API_KEY');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }
  
  try {
    // Get last 12 hours for trend analysis
    const endTime = new Date();
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - 12);
    
    const url = `https://api.fingrid.fi/v1/variable/${variableId}/events/json?start_time=${startTime.toISOString()}&end_time=${endTime.toISOString()}`;
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Fingrid API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch variable ${variableId}:`, error);
    return [];
  }
}

async function detectWindSensitivity() {
  try {
    // Get wind forecast data (variable 245)
    const forecastData = await fetchFingridLatest(245);
    
    if (forecastData.length < 12) {
      return null; // Not enough data
    }
    
    // Calculate average of last 6 hours vs next 6 hours
    const midPoint = Math.floor(forecastData.length / 2);
    const past6h = forecastData.slice(0, midPoint);
    const next6h = forecastData.slice(midPoint);
    
    const pastAvg = past6h.reduce((sum: number, item: any) => sum + item.value, 0) / past6h.length;
    const nextAvg = next6h.reduce((sum: number, item: any) => sum + item.value, 0) / next6h.length;
    
    const pctDrop = ((pastAvg - nextAvg) / pastAvg) * 100;
    
    if (pctDrop >= 25) {
      return {
        type: 'wind_sensitivity',
        entity: 'FI',
        severity: 'warning',
        summary: `Wind forecast dropping ${pctDrop.toFixed(1)}% in next 6h`,
        evidence: {
          past_avg_mw: Math.round(pastAvg),
          next_avg_mw: Math.round(nextAvg),
          drop_pct: pctDrop
        },
        action: 'Monitor price volatility as wind generation decreases',
        confidence: 0.7 // Low until prices are integrated
      };
    }
    
    return null;
  } catch (error) {
    console.error('Wind sensitivity detection failed:', error);
    return null;
  }
}

async function detectMunicipalPeakClash() {
  try {
    // Get load data (variable 192)
    const loadData = await fetchFingridLatest(192);
    
    if (loadData.length === 0) {
      return null;
    }
    
    // Check if current/next hour is in peak period (17-20 UTC)
    const now = new Date();
    const currentHour = now.getUTCHours();
    
    if (currentHour >= 17 && currentHour <= 20) {
      const latestLoad = loadData[loadData.length - 1];
      
      // Simple heuristic: if load > 10,500 MW during peak hours
      if (latestLoad.value > 10500) {
        return {
          type: 'municipal_peak_clash',
          entity: 'FI',
          severity: 'warning',
          summary: `High load ${Math.round(latestLoad.value)} MW during peak hours`,
          evidence: {
            load_mw: Math.round(latestLoad.value),
            peak_hour: currentHour,
            threshold_mw: 10500
          },
          action: 'Consider rescheduling OPS calls to off-peak hours (21-16 UTC)',
          confidence: 0.6
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Municipal peak clash detection failed:', error);
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
    
    const detections = [];
    
    // Run detectors
    const windAlert = await detectWindSensitivity();
    if (windAlert) detections.push(windAlert);
    
    const peakAlert = await detectMunicipalPeakClash();
    if (peakAlert) detections.push(peakAlert);
    
    // Store insights in database
    for (const detection of detections) {
      const { error } = await supabase
        .from('insights')
        .upsert({
          type: detection.type,
          entity: detection.entity,
          severity: detection.severity,
          summary: detection.summary,
          evidence: detection.evidence,
          action: detection.action,
          confidence: detection.confidence,
          status: 'active',
          timestamp: new Date().toISOString()
        });
      
      if (error) {
        console.error('Failed to store insight:', error);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        processed: detections.length,
        detections: detections.map(d => ({ type: d.type, severity: d.severity, summary: d.summary }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});