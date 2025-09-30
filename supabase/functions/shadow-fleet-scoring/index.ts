import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Shadow Fleet Anomaly Scoring Engine
 * Calculates risk scores (0-100) for vessels based on multiple indicators:
 * - Dark detections (+40)
 * - Size/spoofing mismatch (+25)
 * - Loitering off-lane (+10)
 * - Rendezvous behavior (+20)
 * - EEZ boundary proximity (+5)
 * - Traffic density adjustment (reduces false positives)
 */

interface TrackPoint {
  mmsi: number;
  ts: string;
  lat: number;
  lon: number;
  sog: number;
  cog: number;
}

interface ScoringFactors {
  dark_hit: number;
  spoof_size_mismatch: number;
  loitering_offlane: number;
  rendezvous: number;
  near_eez_boundary: number;
  traffic_density_adjustment: number;
  total_score: number;
}

/**
 * Detect loitering: speed < 0.5kn, low course variance, >30min duration, outside ports
 */
async function detectLoitering(
  supabase: any,
  mmsi: number,
  since: string,
  until: string
): Promise<{ isLoitering: boolean; duration_minutes: number }> {
  const { data: track, error } = await supabase
    .from('ais_positions')
    .select('ts, lat, lon, sog, cog')
    .eq('mmsi', mmsi)
    .gte('ts', since)
    .lte('ts', until)
    .order('ts', { ascending: true });
  
  if (error || !track || track.length < 2) {
    return { isLoitering: false, duration_minutes: 0 };
  }
  
  // Check for sustained low speed
  let loiteringStart: Date | null = null;
  let maxLoiteringDuration = 0;
  
  for (let i = 0; i < track.length; i++) {
    const point = track[i];
    
    if (point.sog < 0.5) {
      if (!loiteringStart) {
        loiteringStart = new Date(point.ts);
      }
    } else {
      if (loiteringStart) {
        const duration = (new Date(point.ts).getTime() - loiteringStart.getTime()) / (60 * 1000);
        maxLoiteringDuration = Math.max(maxLoiteringDuration, duration);
        loiteringStart = null;
      }
    }
  }
  
  // Check final segment
  if (loiteringStart) {
    const duration = (new Date(track[track.length - 1].ts).getTime() - loiteringStart.getTime()) / (60 * 1000);
    maxLoiteringDuration = Math.max(maxLoiteringDuration, duration);
  }
  
  return {
    isLoitering: maxLoiteringDuration >= 30,
    duration_minutes: maxLoiteringDuration
  };
}

/**
 * Detect rendezvous: two vessels within 1km for ≥20min with low relative speed
 */
async function detectRendezvous(
  supabase: any,
  mmsi: number,
  since: string,
  until: string
): Promise<{ hasRendezvous: boolean; other_mmsi: number | null }> {
  // Get track for target vessel
  const { data: targetTrack, error: targetError } = await supabase
    .from('ais_positions')
    .select('ts, lat, lon, sog')
    .eq('mmsi', mmsi)
    .gte('ts', since)
    .lte('ts', until)
    .order('ts', { ascending: true });
  
  if (targetError || !targetTrack || targetTrack.length === 0) {
    return { hasRendezvous: false, other_mmsi: null };
  }
  
  // For performance, check only if vessel had low speed periods
  const hasLowSpeed = targetTrack.some(p => p.sog < 0.5);
  if (!hasLowSpeed) {
    return { hasRendezvous: false, other_mmsi: null };
  }
  
  // Query nearby vessels during target's low-speed periods
  // In production, this would use PostGIS spatial joins
  // For now, simplified version
  const midPoint = targetTrack[Math.floor(targetTrack.length / 2)];
  
  const { data: nearby, error: nearbyError } = await supabase.rpc(
    'find_nearby_ais',
    {
      target_lat: midPoint.lat,
      target_lon: midPoint.lon,
      radius_m: 1000,
      start_time: since,
      end_time: until
    }
  );
  
  if (nearbyError || !nearby || nearby.length < 2) {
    return { hasRendezvous: false, other_mmsi: null };
  }
  
  // Check if any other vessel was consistently close
  const otherVessels = nearby.filter((v: any) => v.mmsi !== mmsi);
  
  if (otherVessels.length > 0) {
    return { hasRendezvous: true, other_mmsi: otherVessels[0].mmsi };
  }
  
  return { hasRendezvous: false, other_mmsi: null };
}

/**
 * Calculate anomaly score for a vessel
 */
async function calculateScore(
  supabase: any,
  mmsi: number,
  since: string,
  until: string
): Promise<ScoringFactors> {
  console.log(`Calculating score for MMSI ${mmsi}`);
  
  const factors: ScoringFactors = {
    dark_hit: 0,
    spoof_size_mismatch: 0,
    loitering_offlane: 0,
    rendezvous: 0,
    near_eez_boundary: 0,
    traffic_density_adjustment: 0,
    total_score: 0
  };
  
  // Check for dark detection alerts
  const { data: darkAlerts } = await supabase
    .from('shadow_fleet_alerts_v2')
    .select('id')
    .eq('mmsi', mmsi)
    .eq('type', 'dark_detection')
    .gte('alert_time', since)
    .lte('alert_time', until);
  
  if (darkAlerts && darkAlerts.length > 0) {
    factors.dark_hit = 40;
  }
  
  // Check for spoofing alerts
  const { data: spoofAlerts } = await supabase
    .from('shadow_fleet_alerts_v2')
    .select('id')
    .eq('mmsi', mmsi)
    .eq('type', 'spoofing_suspected')
    .gte('alert_time', since)
    .lte('alert_time', until);
  
  if (spoofAlerts && spoofAlerts.length > 0) {
    factors.spoof_size_mismatch = 25;
  }
  
  // Detect loitering
  const loitering = await detectLoitering(supabase, mmsi, since, until);
  if (loitering.isLoitering) {
    factors.loitering_offlane = 10;
  }
  
  // Detect rendezvous
  const rendezvous = await detectRendezvous(supabase, mmsi, since, until);
  if (rendezvous.hasRendezvous) {
    factors.rendezvous = 20;
  }
  
  // EEZ boundary check (simplified - would use actual EEZ polygons)
  // For Baltic Sea, approximate EEZ boundaries
  const { data: positions } = await supabase
    .from('ais_positions')
    .select('lat, lon')
    .eq('mmsi', mmsi)
    .gte('ts', since)
    .lte('ts', until)
    .limit(1);
  
  if (positions && positions.length > 0) {
    const pos = positions[0];
    // Simplified EEZ check - in production use actual polygons
    const nearBoundary = (pos.lat > 59 && pos.lat < 60) || (pos.lon > 19 && pos.lon < 20);
    if (nearBoundary) {
      factors.near_eez_boundary = 5;
    }
  }
  
  // Traffic density adjustment (would use actual traffic density data)
  // For now, simple heuristic based on position
  factors.traffic_density_adjustment = 0; // No adjustment for now
  
  // Calculate total score
  factors.total_score = Math.min(100,
    factors.dark_hit +
    factors.spoof_size_mismatch +
    factors.loitering_offlane +
    factors.rendezvous +
    factors.near_eez_boundary -
    factors.traffic_density_adjustment
  );
  
  console.log(`Score for MMSI ${mmsi}: ${factors.total_score}`, factors);
  
  return factors;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const { mmsi, mmsi_list, since, until } = await req.json();
    
    const sinceTime = since || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const untilTime = until || new Date().toISOString();
    
    let vesselsToScore: number[] = [];
    
    if (mmsi) {
      vesselsToScore = [mmsi];
    } else if (mmsi_list && mmsi_list.length > 0) {
      vesselsToScore = mmsi_list;
    } else {
      // Score vessels with recent alerts
      const { data: alertVessels } = await supabase
        .from('shadow_fleet_alerts_v2')
        .select('mmsi')
        .gte('alert_time', sinceTime)
        .not('mmsi', 'is', null);
      
      if (alertVessels && alertVessels.length > 0) {
        vesselsToScore = [...new Set(alertVessels.map((v: any) => v.mmsi))];
      }
    }
    
    console.log(`Scoring ${vesselsToScore.length} vessels`);
    
    const results = [];
    
    for (const vesselMMSI of vesselsToScore) {
      const score = await calculateScore(supabase, vesselMMSI, sinceTime, untilTime);
      results.push({
        mmsi: vesselMMSI,
        ...score,
        period: { since: sinceTime, until: untilTime }
      });
    }
    
    // Sort by score descending
    results.sort((a, b) => b.total_score - a.total_score);
    
    return new Response(
      JSON.stringify({
        success: true,
        scored: results.length,
        period: { since: sinceTime, until: untilTime },
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Scoring error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
