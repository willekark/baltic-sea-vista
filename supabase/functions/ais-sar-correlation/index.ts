import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * AIS-SAR Correlation Engine
 * Matches SAR detections with AIS positions using spatiotemporal correlation
 * Implements production-grade geospatial matching with Haversine distance
 */

interface SARDetection {
  id: string;
  scene_id: string;
  acq_time: string;
  lat: number;
  lon: number;
  est_length_m: number;
  rcs_db: number;
  confidence: number;
}

interface AISPosition {
  mmsi: number;
  ts: string;
  lat: number;
  lon: number;
  sog: number;
  vessel_type: string;
  vessel_name: string;
  draught: number;
}

interface CorrelationResult {
  detection_id: string;
  matched_mmsi: number | null;
  match_distance_m: number | null;
  match_confidence: number;
  alert_type: string | null;
  alert_priority: number;
  summary: string;
  details: any;
}

/**
 * Haversine distance calculation (meters)
 * @param lat1 Latitude of point 1 (degrees)
 * @param lon1 Longitude of point 1 (degrees)
 * @param lat2 Latitude of point 2 (degrees)
 * @param lon2 Longitude of point 2 (degrees)
 * @returns Distance in meters
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Estimate vessel length from AIS vessel type and draught
 */
function estimateVesselLength(vesselType: string, draught: number): number {
  const typeLengths: Record<string, number> = {
    'Tanker': 150,
    'Cargo': 120,
    'Container': 180,
    'Passenger': 100,
    'Fishing': 40,
    'Tug': 30,
  };
  
  const baseLength = typeLengths[vesselType] || 80;
  // Draught correlates with size
  const draughtFactor = draught > 0 ? (1 + (draught - 8) * 0.1) : 1;
  
  return baseLength * draughtFactor;
}

/**
 * Correlate a single SAR detection with AIS positions
 */
async function correlateSARDetection(
  supabase: any,
  detection: SARDetection
): Promise<CorrelationResult> {
  console.log(`Correlating SAR detection ${detection.id} at (${detection.lat}, ${detection.lon})`);
  
  // Search radius: max(1km, 0.5 * estimated vessel length)
  const searchRadius = Math.max(1000, 0.5 * detection.est_length_m);
  
  // Time window: ±10 minutes from SAR acquisition
  const detectionTime = new Date(detection.acq_time);
  const startTime = new Date(detectionTime.getTime() - 10 * 60 * 1000);
  const endTime = new Date(detectionTime.getTime() + 10 * 60 * 1000);
  
  // Query AIS positions within spatiotemporal window
  // Note: Using ST_DWithin with geography type for accurate distance
  const { data: nearbyAIS, error } = await supabase.rpc(
    'find_nearby_ais',
    {
      target_lat: detection.lat,
      target_lon: detection.lon,
      radius_m: searchRadius,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString()
    }
  );
  
  if (error) {
    console.error('Error querying AIS:', error);
    throw error;
  }
  
  console.log(`Found ${nearbyAIS?.length || 0} nearby AIS positions`);
  
  if (!nearbyAIS || nearbyAIS.length === 0) {
    // DARK DETECTION - No AIS signal found
    return {
      detection_id: detection.id,
      matched_mmsi: null,
      match_distance_m: null,
      match_confidence: 0,
      alert_type: 'dark_detection',
      alert_priority: 82,
      summary: `Dark detection: ${detection.est_length_m.toFixed(0)}m vessel with no AIS signal`,
      details: {
        sar_length_m: detection.est_length_m,
        rcs_db: detection.rcs_db,
        search_radius_m: searchRadius,
        nearby_vessels: 0
      }
    };
  }
  
  // Find best match by closest distance
  let bestMatch: AISPosition | null = null;
  let bestDistance = Infinity;
  
  for (const ais of nearbyAIS) {
    const distance = haversineDistance(
      detection.lat, detection.lon,
      ais.lat, ais.lon
    );
    
    if (distance < bestDistance) {
      bestDistance = distance;
      bestMatch = ais;
    }
  }
  
  if (!bestMatch) {
    return {
      detection_id: detection.id,
      matched_mmsi: null,
      match_distance_m: null,
      match_confidence: 0,
      alert_type: 'dark_detection',
      alert_priority: 82,
      summary: 'Dark detection: No AIS match found',
      details: { search_radius_m: searchRadius }
    };
  }
  
  // Check for size mismatch (SPOOFING indicator)
  const aisEstimatedLength = estimateVesselLength(bestMatch.vessel_type, bestMatch.draught);
  const lengthDelta = Math.abs(detection.est_length_m - aisEstimatedLength);
  const lengthDeltaPercent = (lengthDelta / aisEstimatedLength) * 100;
  
  console.log(`Size check: SAR=${detection.est_length_m}m, AIS_estimate=${aisEstimatedLength}m, delta=${lengthDeltaPercent.toFixed(1)}%`);
  
  if (lengthDeltaPercent > 50) {
    // SPOOFING SUSPECTED - Size mismatch
    return {
      detection_id: detection.id,
      matched_mmsi: bestMatch.mmsi,
      match_distance_m: bestDistance,
      match_confidence: 0.3,
      alert_type: 'spoofing_suspected',
      alert_priority: 65,
      summary: `Spoofing suspected: ${lengthDeltaPercent.toFixed(0)}% size mismatch for MMSI ${bestMatch.mmsi}`,
      details: {
        sar_length_m: detection.est_length_m,
        ais_estimated_length_m: aisEstimatedLength,
        length_delta_percent: lengthDeltaPercent,
        vessel_name: bestMatch.vessel_name,
        vessel_type: bestMatch.vessel_type,
        match_distance_m: bestDistance
      }
    };
  }
  
  // BENIGN MATCH
  const matchConfidence = Math.max(0, 1 - (bestDistance / searchRadius));
  
  return {
    detection_id: detection.id,
    matched_mmsi: bestMatch.mmsi,
    match_distance_m: bestDistance,
    match_confidence: matchConfidence,
    alert_type: null,
    alert_priority: 0,
    summary: `Matched to MMSI ${bestMatch.mmsi} (${bestMatch.vessel_name})`,
    details: {
      vessel_name: bestMatch.vessel_name,
      vessel_type: bestMatch.vessel_type,
      match_distance_m: bestDistance,
      confidence: matchConfidence
    }
  };
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
    
    const { detections, since, until } = await req.json();
    
    console.log(`Starting correlation for ${detections?.length || 'all'} detections`);
    
    // If specific detections provided, use those; otherwise query recent unmatched
    let detectionsToProcess: SARDetection[];
    
    if (detections && detections.length > 0) {
      detectionsToProcess = detections;
    } else {
      // Query recent unmatched SAR detections
      const sinceTime = since || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const untilTime = until || new Date().toISOString();
      
      const { data, error } = await supabase
        .from('sar_detections')
        .select('*')
        .gte('acq_time', sinceTime)
        .lte('acq_time', untilTime)
        .is('matched_mmsi', null);
      
      if (error) throw error;
      detectionsToProcess = data || [];
    }
    
    console.log(`Processing ${detectionsToProcess.length} SAR detections`);
    
    // Process each detection
    const results: CorrelationResult[] = [];
    const alerts: any[] = [];
    
    for (const detection of detectionsToProcess) {
      const result = await correlateSARDetection(supabase, detection);
      results.push(result);
      
      // Update SAR detection with match info
      await supabase
        .from('sar_detections')
        .update({
          matched_mmsi: result.matched_mmsi,
          match_distance_m: result.match_distance_m,
          match_confidence: result.match_confidence
        })
        .eq('id', detection.id);
      
      // Create alert if anomaly detected
      if (result.alert_type) {
        const alert = {
          alert_time: new Date().toISOString(),
          type: result.alert_type,
          priority: result.alert_priority,
          mmsi: result.matched_mmsi,
          detection_id: detection.id,
          summary: result.summary,
          details: result.details,
          score: result.alert_priority,
          lat: detection.lat,
          lon: detection.lon,
          status: 'active'
        };
        
        const { error: alertError } = await supabase
          .from('shadow_fleet_alerts_v2')
          .insert(alert);
        
        if (alertError) {
          console.error('Error creating alert:', alertError);
        } else {
          alerts.push(alert);
        }
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        matches: results.filter(r => r.matched_mmsi !== null).length,
        dark_detections: results.filter(r => r.alert_type === 'dark_detection').length,
        spoofing_suspected: results.filter(r => r.alert_type === 'spoofing_suspected').length,
        alerts_created: alerts.length,
        results,
        alerts
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Correlation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
