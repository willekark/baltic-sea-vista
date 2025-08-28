import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VesselAnalysis {
  vesselId: string;
  riskScore: number;
  suspiciousActivities: string[];
  recommendations: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting shadow fleet analysis...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch recent AIS data for analysis
    const { data: aisData, error: aisError } = await supabase
      .from('ais_tracking')
      .select(`
        *,
        vessels (
          id, vessel_name, imo_number, mmsi, flag_state, 
          vessel_type, sanctions_status, risk_score
        )
      `)
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false });

    if (aisError) {
      console.error('Error fetching AIS data:', aisError);
      throw aisError;
    }

    // Analyze for dark zones (AIS gaps)
    const darkZoneAnalysis = analyzeDarkZones(aisData || []);
    
    // Analyze for suspicious behaviors
    const behaviorAnalysis = analyzeSuspiciousBehavior(aisData || []);
    
    // Check for sanctions violations
    const sanctionsAnalysis = await analyzeSanctionsViolations(supabase, aisData || []);
    
    // Detect potential STS transfers
    const stsAnalysis = detectSTSTransfers(aisData || []);
    
    // Analyze CO2 emissions anomalies
    const emissionsAnalysis = await analyzeEmissionsViolations(supabase, aisData || []);

    // Generate comprehensive report
    const analysis = {
      timestamp: new Date().toISOString(),
      summary: {
        totalVesselsAnalyzed: new Set(aisData?.map(d => d.vessel_id)).size || 0,
        darkZoneDetections: darkZoneAnalysis.length,
        suspiciousBehaviors: behaviorAnalysis.length,
        sanctionsViolations: sanctionsAnalysis.length,
        stsTransfers: stsAnalysis.length,
        emissionsAnomalies: emissionsAnalysis.length,
        highRiskVessels: getHighRiskVesselCount(aisData || [])
      },
      alerts: [
        ...darkZoneAnalysis,
        ...behaviorAnalysis,
        ...sanctionsAnalysis,
        ...stsAnalysis,
        ...emissionsAnalysis
      ],
      recommendations: generateRecommendations(darkZoneAnalysis, behaviorAnalysis, sanctionsAnalysis, stsAnalysis, emissionsAnalysis)
    };

    // Store alerts in database
    if (analysis.alerts.length > 0) {
      const alertsToInsert = analysis.alerts.map(alert => ({
        vessel_id: alert.vesselId,
        alert_type: alert.type,
        priority: alert.priority,
        title: alert.title,
        description: alert.description,
        alert_data: alert.data
      }));

      const { error: insertError } = await supabase
        .from('shadow_fleet_alerts')
        .insert(alertsToInsert);

      if (insertError) {
        console.error('Error inserting alerts:', insertError);
      } else {
        console.log(`Inserted ${alertsToInsert.length} new alerts`);
      }
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in shadow fleet analysis:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function analyzeDarkZones(aisData: any[]): any[] {
  const alerts: any[] = [];
  const vesselTracks = groupByVessel(aisData);

  Object.entries(vesselTracks).forEach(([vesselId, tracks]) => {
    const sortedTracks = tracks.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Look for gaps > 4 hours in AIS data
    for (let i = 1; i < sortedTracks.length; i++) {
      const prev = sortedTracks[i - 1];
      const current = sortedTracks[i];
      const gapHours = (new Date(current.timestamp).getTime() - new Date(prev.timestamp).getTime()) / (1000 * 60 * 60);
      
      if (gapHours > 4) {
        // Check if gap occurred in sensitive areas (near Russian ports, Kaliningrad)
        const isHighRiskArea = isInHighRiskZone(prev.location_lat, prev.location_lng) || 
                              isInHighRiskZone(current.location_lat, current.location_lng);
        
        alerts.push({
          vesselId,
          type: 'ais_dark_zone',
          priority: isHighRiskArea ? 'high' : 'medium',
          title: `AIS Dark Zone Detected - ${tracks[0].vessels?.vessel_name}`,
          description: `Vessel went dark for ${gapHours.toFixed(1)} hours between ${prev.timestamp} and ${current.timestamp}`,
          data: {
            gapDuration: gapHours,
            startLocation: { lat: prev.location_lat, lng: prev.location_lng },
            endLocation: { lat: current.location_lat, lng: current.location_lng },
            highRiskArea: isHighRiskArea,
            vesselInfo: tracks[0].vessels
          }
        });
      }
    }
  });

  return alerts;
}

function analyzeSuspiciousBehavior(aisData: any[]): any[] {
  const alerts: any[] = [];
  const vesselTracks = groupByVessel(aisData);

  Object.entries(vesselTracks).forEach(([vesselId, tracks]) => {
    // Detect loitering (low speed for extended periods)
    const loiteringPeriods = detectLoitering(tracks);
    loiteringPeriods.forEach(period => {
      alerts.push({
        vesselId,
        type: 'loitering',
        priority: 'medium',
        title: `Suspicious Loitering - ${tracks[0].vessels?.vessel_name}`,
        description: `Vessel loitering at low speed for ${period.duration} hours`,
        data: period
      });
    });

    // Detect false destinations
    const falseDest = detectFalseDestinations(tracks);
    if (falseDest) {
      alerts.push({
        vesselId,
        type: 'false_destination',
        priority: 'high',
        title: `False Destination Detected - ${tracks[0].vessels?.vessel_name}`,
        description: 'Vessel declared destination does not match actual route',
        data: falseDest
      });
    }
  });

  return alerts;
}

async function analyzeSanctionsViolations(supabase: any, aisData: any[]): Promise<any[]> {
  const alerts: any[] = [];
  
  // Get active sanctions list
  const { data: sanctions } = await supabase
    .from('sanctions_lists')
    .select('*')
    .eq('status', 'active');

  const sanctionedIMOs = new Set(sanctions?.filter(s => s.imo_number).map(s => s.imo_number));

  aisData.forEach(record => {
    if (record.vessels?.imo_number && sanctionedIMOs.has(record.vessels.imo_number)) {
      alerts.push({
        vesselId: record.vessel_id,
        type: 'sanctions_violation',
        priority: 'critical',
        title: `Sanctioned Vessel Detected - ${record.vessels.vessel_name}`,
        description: 'Vessel appears on sanctions list and is active in Baltic Sea',
        data: {
          imoNumber: record.vessels.imo_number,
          currentLocation: { lat: record.location_lat, lng: record.location_lng },
          vesselInfo: record.vessels
        }
      });
    }
  });

  return alerts;
}

function detectSTSTransfers(aisData: any[]): any[] {
  const alerts: any[] = [];
  const vesselPositions = new Map();

  // Group positions by time windows
  aisData.forEach(record => {
    const timeWindow = Math.floor(new Date(record.timestamp).getTime() / (1000 * 60 * 30)); // 30-minute windows
    if (!vesselPositions.has(timeWindow)) {
      vesselPositions.set(timeWindow, []);
    }
    vesselPositions.get(timeWindow).push(record);
  });

  // Look for vessels in close proximity with low speeds
  vesselPositions.forEach((vessels, timeWindow) => {
    for (let i = 0; i < vessels.length; i++) {
      for (let j = i + 1; j < vessels.length; j++) {
        const vessel1 = vessels[i];
        const vessel2 = vessels[j];
        
        const distance = calculateDistance(
          vessel1.location_lat, vessel1.location_lng,
          vessel2.location_lat, vessel2.location_lng
        );
        
        // If vessels are within 500m and both have low speed, potential STS
        if (distance < 0.5 && (vessel1.speed || 0) < 2 && (vessel2.speed || 0) < 2) {
          alerts.push({
            vesselId: vessel1.vessel_id,
            type: 'sts_transfer',
            priority: 'high',
            title: `Potential STS Transfer Detected`,
            description: `Two vessels in close proximity with low speeds`,
            data: {
              vessel1: vessel1.vessels,
              vessel2: vessel2.vessels,
              distance: distance,
              location: { lat: vessel1.location_lat, lng: vessel1.location_lng },
              timestamp: vessel1.timestamp
            }
          });
        }
      }
    }
  });

  return alerts;
}

// Helper functions
function groupByVessel(aisData: any[]): Record<string, any[]> {
  return aisData.reduce((acc, record) => {
    if (!acc[record.vessel_id]) acc[record.vessel_id] = [];
    acc[record.vessel_id].push(record);
    return acc;
  }, {});
}

function isInHighRiskZone(lat: number, lng: number): boolean {
  // Define high-risk areas (Russian ports, Kaliningrad, Gulf of Finland)
  const highRiskZones = [
    { name: 'Kaliningrad', minLat: 54.5, maxLat: 55.0, minLng: 19.8, maxLng: 20.8 },
    { name: 'Gulf of Finland', minLat: 59.5, maxLat: 60.5, minLng: 28.0, maxLng: 31.0 },
    { name: 'Russian Baltic Ports', minLat: 59.0, maxLat: 61.0, minLng: 27.0, maxLng: 32.0 }
  ];

  return highRiskZones.some(zone => 
    lat >= zone.minLat && lat <= zone.maxLat && 
    lng >= zone.minLng && lng <= zone.maxLng
  );
}

function detectLoitering(tracks: any[]): any[] {
  const loiteringPeriods = [];
  let currentLoiter = null;

  tracks.forEach(track => {
    if ((track.speed || 0) < 1) { // Very low speed
      if (!currentLoiter) {
        currentLoiter = {
          start: track.timestamp,
          location: { lat: track.location_lat, lng: track.location_lng },
          duration: 0
        };
      }
    } else {
      if (currentLoiter) {
        const duration = (new Date(track.timestamp).getTime() - new Date(currentLoiter.start).getTime()) / (1000 * 60 * 60);
        if (duration > 6) { // More than 6 hours of loitering
          loiteringPeriods.push({ ...currentLoiter, duration, end: track.timestamp });
        }
        currentLoiter = null;
      }
    }
  });

  return loiteringPeriods;
}

function detectFalseDestinations(tracks: any[]): any {
  // Simplified logic - check if declared destination matches general direction
  const firstTrack = tracks[0];
  const lastTrack = tracks[tracks.length - 1];
  
  if (firstTrack?.destination && tracks.length > 10) {
    // This would require more sophisticated logic with port databases
    // For now, flag if destination is declared but vessel made unexpected movements
    const totalDistance = calculateDistance(
      firstTrack.location_lat, firstTrack.location_lng,
      lastTrack.location_lat, lastTrack.location_lng
    );
    
    if (totalDistance > 200) { // Large movement suggesting potential false destination
      return {
        declaredDestination: firstTrack.destination,
        actualMovement: totalDistance,
        startLocation: { lat: firstTrack.location_lat, lng: firstTrack.location_lng },
        endLocation: { lat: lastTrack.location_lat, lng: lastTrack.location_lng }
      };
    }
  }
  
  return null;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function getHighRiskVesselCount(aisData: any[]): number {
  const riskThreshold = 50;
  return new Set(
    aisData
      .filter(d => d.vessels?.risk_score > riskThreshold)
      .map(d => d.vessel_id)
  ).size;
}

// Analyze CO2 emissions data for vessels to detect anomalies
async function analyzeEmissionsViolations(supabase: any, aisData: any[]): Promise<any[]> {
  const alerts: any[] = [];
  
  try {
    // Get recent emissions anomalies
    const { data: anomalies } = await supabase
      .from('emissions_anomalies')
      .select('*')
      .eq('status', 'active')
      .gte('detected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    if (!anomalies) return alerts;
    
    anomalies.forEach(anomaly => {
      let priority = 'medium';
      let title = '';
      let description = '';
      
      switch (anomaly.anomaly_type) {
        case 'excess_emissions':
          priority = anomaly.severity === 'critical' ? 'critical' : 'high';
          title = `Excess CO₂ Emissions Detected`;
          description = `Vessel emitting ${anomaly.deviation_percent.toFixed(1)}% more CO₂ than expected for its type and speed`;
          break;
          
        case 'under_emissions':
          priority = 'high';
          title = `Suspiciously Low CO₂ Emissions`;
          description = `Vessel emitting ${Math.abs(anomaly.deviation_percent).toFixed(1)}% less CO₂ than expected - possible AIS spoofing`;
          break;
          
        case 'dark_zone_emissions':
          priority = 'critical';
          title = `Dark Zone CO₂ Detection`;
          description = `Elevated atmospheric CO₂ detected without corresponding AIS activity - possible hidden vessel`;
          break;
      }
      
      alerts.push({
        vesselId: anomaly.vessel_id,
        type: 'emissions_anomaly',
        priority,
        title,
        description,
        data: {
          anomalyType: anomaly.anomaly_type,
          expectedEmissions: anomaly.expected_emissions,
          actualEmissions: anomaly.actual_emissions,
          deviationPercent: anomaly.deviation_percent,
          location: { lat: anomaly.location_lat, lng: anomaly.location_lng },
          analysisData: anomaly.analysis_data,
          detectedAt: anomaly.detected_at
        }
      });
    });
    
  } catch (error) {
    console.error('Error analyzing emissions violations:', error);
  }
  
  return alerts;
}

function generateRecommendations(darkZones: any[], behaviors: any[], sanctions: any[], sts: any[], emissions: any[]): string[] {
  const recommendations = [];
  
  if (darkZones.length > 0) {
    recommendations.push(`Investigate ${darkZones.length} AIS dark zone incidents for potential sanctions evasion`);
  }
  
  if (sanctions.length > 0) {
    recommendations.push(`URGENT: ${sanctions.length} sanctioned vessels detected in Baltic waters - notify authorities immediately`);
  }
  
  if (sts.length > 0) {
    recommendations.push(`Monitor ${sts.length} potential ship-to-ship transfers for illegal cargo operations`);
  }
  
  if (behaviors.length > 0) {
    recommendations.push(`Review ${behaviors.length} suspicious behavior patterns for compliance violations`);
  }
  
  if (emissions.length > 0) {
    recommendations.push(`Analyze ${emissions.length} CO₂ emissions anomalies - possible fuel underreporting or hidden vessels`);
  }
  
  if (recommendations.length === 0) {
    recommendations.push('No immediate threats detected. Continue routine monitoring.');
  }
  
  return recommendations;
}