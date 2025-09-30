import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Shadow Fleet REST API
 * Provides unified endpoints for querying AIS tracks, SAR detections, and alerts
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    
    const url = new URL(req.url);
    const path = url.pathname.replace('/shadow-fleet-api', '');
    
    // GET /health
    if (path === '/health') {
      return new Response(
        JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // GET /v1/alerts
    if (path === '/v1/alerts') {
      const bbox = url.searchParams.get('bbox'); // format: minLon,minLat,maxLon,maxLat
      const since = url.searchParams.get('since');
      const type = url.searchParams.get('type');
      const minScore = parseInt(url.searchParams.get('min_score') || '0');
      const status = url.searchParams.get('status') || 'active';
      
      let query = supabase
        .from('shadow_fleet_alerts_v2')
        .select('*')
        .eq('status', status)
        .gte('score', minScore)
        .order('alert_time', { ascending: false })
        .limit(1000);
      
      if (since) {
        query = query.gte('alert_time', since);
      }
      
      if (type) {
        query = query.eq('type', type);
      }
      
      const { data: alerts, error } = await query;
      
      if (error) throw error;
      
      // Convert to GeoJSON
      const features = (alerts || [])
        .filter(a => a.lat && a.lon)
        .map(alert => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [alert.lon, alert.lat]
          },
          properties: {
            alert_id: alert.id,
            type: alert.type,
            score: alert.score,
            priority: alert.priority,
            mmsi: alert.mmsi,
            detection_id: alert.detection_id,
            summary: alert.summary,
            details: alert.details,
            alert_time: alert.alert_time,
            status: alert.status
          }
        }));
      
      // Apply bbox filter if provided
      let filteredFeatures = features;
      if (bbox) {
        const [minLon, minLat, maxLon, maxLat] = bbox.split(',').map(Number);
        filteredFeatures = features.filter(f => {
          const [lon, lat] = f.geometry.coordinates;
          return lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat;
        });
      }
      
      return new Response(
        JSON.stringify({
          type: 'FeatureCollection',
          features: filteredFeatures,
          metadata: {
            count: filteredFeatures.length,
            generated_at: new Date().toISOString()
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // GET /v1/vessels/{mmsi}/track
    if (path.startsWith('/v1/vessels/') && path.endsWith('/track')) {
      const mmsi = parseInt(path.split('/')[3]);
      const since = url.searchParams.get('since') || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const until = url.searchParams.get('until') || new Date().toISOString();
      
      const { data: track, error } = await supabase
        .from('ais_positions')
        .select('*')
        .eq('mmsi', mmsi)
        .gte('ts', since)
        .lte('ts', until)
        .order('ts', { ascending: true })
        .limit(10000);
      
      if (error) throw error;
      
      // Convert to GeoJSON LineString
      const coordinates = (track || []).map(p => [p.lon, p.lat]);
      
      const feature = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates
        },
        properties: {
          mmsi,
          vessel_name: track?.[0]?.vessel_name || null,
          vessel_type: track?.[0]?.vessel_type || null,
          point_count: track?.length || 0,
          first_timestamp: track?.[0]?.ts || null,
          last_timestamp: track?.[track.length - 1]?.ts || null,
          points: track?.map(p => ({
            timestamp: p.ts,
            lat: p.lat,
            lon: p.lon,
            sog: p.sog,
            cog: p.cog,
            heading: p.heading,
            nav_status: p.nav_status
          }))
        }
      };
      
      return new Response(
        JSON.stringify(feature),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // GET /v1/scenes/{scene_id}/detections
    if (path.startsWith('/v1/scenes/') && path.endsWith('/detections')) {
      const sceneId = decodeURIComponent(path.split('/')[3]);
      
      const { data: detections, error } = await supabase
        .from('sar_detections')
        .select('*')
        .eq('scene_id', sceneId);
      
      if (error) throw error;
      
      const features = (detections || []).map(d => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [d.lon, d.lat]
        },
        properties: {
          id: d.id,
          scene_id: d.scene_id,
          acq_time: d.acq_time,
          est_length_m: d.est_length_m,
          rcs_db: d.rcs_db,
          confidence: d.confidence,
          matched_mmsi: d.matched_mmsi,
          match_distance_m: d.match_distance_m,
          match_confidence: d.match_confidence
        }
      }));
      
      return new Response(
        JSON.stringify({
          type: 'FeatureCollection',
          features,
          metadata: {
            scene_id: sceneId,
            count: features.length
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // POST /ingest/ais
    if (path === '/ingest/ais' && req.method === 'POST') {
      const { positions } = await req.json();
      
      if (!positions || !Array.isArray(positions)) {
        return new Response(
          JSON.stringify({ error: 'Invalid payload: positions array required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Insert AIS positions (triggers will auto-populate geom)
      const { data, error } = await supabase
        .from('ais_positions')
        .upsert(positions, { onConflict: 'mmsi,ts' });
      
      if (error) throw error;
      
      return new Response(
        JSON.stringify({
          success: true,
          ingested: positions.length,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // POST /ingest/sar
    if (path === '/ingest/sar' && req.method === 'POST') {
      const { detections } = await req.json();
      
      if (!detections || !Array.isArray(detections)) {
        return new Response(
          JSON.stringify({ error: 'Invalid payload: detections array required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Insert SAR detections
      const { data, error } = await supabase
        .from('sar_detections')
        .insert(detections);
      
      if (error) throw error;
      
      return new Response(
        JSON.stringify({
          success: true,
          ingested: detections.length,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
