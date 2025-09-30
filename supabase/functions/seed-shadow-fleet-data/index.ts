import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Seed Shadow Fleet Demo Data
 * Creates sample AIS positions, SAR detections, and runs correlation
 * FOR DEMONSTRATION PURPOSES ONLY
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    console.log('Starting demo data seed...');
    
    // Sample AIS positions (3 vessels)
    const now = new Date();
    const aisPositions = [];
    
    // Vessel 1: Normal tanker
    const mmsi1 = 257123456;
    for (let i = 0; i < 24; i++) {
      const ts = new Date(now.getTime() - (24 - i) * 60 * 60 * 1000);
      aisPositions.push({
        mmsi: mmsi1,
        ts: ts.toISOString(),
        lat: 58.5 + (i * 0.01),
        lon: 16.2 + (i * 0.015),
        sog: 12.5 + Math.random() * 2,
        cog: 45 + Math.random() * 5,
        heading: 45,
        nav_status: 'Under way using engine',
        imo: 9381234,
        callsign: 'LAX1',
        vessel_name: 'BALTIC TRADER',
        vessel_type: 'Tanker',
        draught: 10.2,
        source: 'demo'
      });
    }
    
    // Vessel 2: Suspicious with AIS gap
    const mmsi2 = 257987654;
    for (let i = 0; i < 12; i++) { // Only 12 hours of data (gap)
      const ts = new Date(now.getTime() - (24 - i) * 60 * 60 * 1000);
      aisPositions.push({
        mmsi: mmsi2,
        ts: ts.toISOString(),
        lat: 59.2 - (i * 0.008),
        lon: 19.8 - (i * 0.012),
        sog: 8.2 + Math.random(),
        cog: 180 + Math.random() * 10,
        heading: 180,
        nav_status: 'Under way using engine',
        imo: 9412345,
        callsign: 'SHD1',
        vessel_name: 'SHADOW VESSEL',
        vessel_type: 'Tanker',
        draught: 9.8,
        source: 'demo'
      });
    }
    
    // Vessel 3: Small cargo - loitering
    const mmsi3 = 257111222;
    const loiterLat = 57.3;
    const loiterLon = 18.1;
    for (let i = 0; i < 48; i++) { // 48 hours of loitering
      const ts = new Date(now.getTime() - (48 - i) * 60 * 60 * 1000);
      aisPositions.push({
        mmsi: mmsi3,
        ts: ts.toISOString(),
        lat: loiterLat + (Math.random() - 0.5) * 0.002,
        lon: loiterLon + (Math.random() - 0.5) * 0.002,
        sog: 0.3 + Math.random() * 0.2,
        cog: Math.random() * 360,
        heading: Math.random() * 360,
        nav_status: 'At anchor',
        imo: 9512345,
        callsign: 'LTR1',
        vessel_name: 'LOITERER',
        vessel_type: 'Cargo',
        draught: 6.5,
        source: 'demo'
      });
    }
    
    console.log(`Inserting ${aisPositions.length} AIS positions...`);
    
    const { error: aisError } = await supabase
      .from('ais_positions')
      .upsert(aisPositions, { onConflict: 'mmsi,ts' });
    
    if (aisError) {
      console.error('AIS insert error:', aisError);
      throw aisError;
    }
    
    console.log('AIS positions inserted successfully');
    
    // Sample SAR detections
    const sarDetections = [
      {
        scene_id: 'S1A_20250930_1200',
        acq_time: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        lat: 58.56,
        lon: 16.34,
        est_length_m: 145,
        rcs_db: 23.1,
        confidence: 0.91
      },
      {
        scene_id: 'S1A_20250930_1200',
        acq_time: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        lat: 59.28,
        lon: 19.72,
        est_length_m: 138,
        rcs_db: 22.4,
        confidence: 0.87
      },
      {
        scene_id: 'S1B_20250930_0600',
        acq_time: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
        lat: 59.15,
        lon: 19.65,
        est_length_m: 142,
        rcs_db: 24.2,
        confidence: 0.93
      },
      {
        scene_id: 'S1B_20250930_0600',
        acq_time: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
        lat: 57.31,
        lon: 18.11,
        est_length_m: 82,
        rcs_db: 18.5,
        confidence: 0.78
      },
      // Dark detection - no matching AIS
      {
        scene_id: 'S1A_20250930_1800',
        acq_time: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        lat: 58.92,
        lon: 20.15,
        est_length_m: 156,
        rcs_db: 25.3,
        confidence: 0.95
      }
    ];
    
    console.log(`Inserting ${sarDetections.length} SAR detections...`);
    
    const { error: sarError } = await supabase
      .from('sar_detections')
      .insert(sarDetections);
    
    if (sarError) {
      console.error('SAR insert error:', sarError);
      throw sarError;
    }
    
    console.log('SAR detections inserted successfully');
    
    // Run correlation by calling the correlation function
    console.log('Running AIS-SAR correlation...');
    
    const { data: correlationResult, error: correlationError } = await supabase.functions.invoke(
      'ais-sar-correlation',
      {
        body: {
          since: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
          until: now.toISOString()
        }
      }
    );
    
    if (correlationError) {
      console.error('Correlation error:', correlationError);
    } else {
      console.log('Correlation complete:', correlationResult);
    }
    
    // Run scoring
    console.log('Running anomaly scoring...');
    
    const { data: scoringResult, error: scoringError } = await supabase.functions.invoke(
      'shadow-fleet-scoring',
      {
        body: {
          since: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
          until: now.toISOString()
        }
      }
    );
    
    if (scoringError) {
      console.error('Scoring error:', scoringError);
    } else {
      console.log('Scoring complete:', scoringResult);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demo data seeded successfully',
        data: {
          ais_positions_created: aisPositions.length,
          sar_detections_created: sarDetections.length,
          correlation_result: correlationResult,
          scoring_result: scoringResult
        },
        timestamp: now.toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Seed error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
