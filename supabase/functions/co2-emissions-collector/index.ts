import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting CO2 emissions data collection...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Baltic Sea bounding box coordinates
    const balticBounds = {
      minLat: 53.0, maxLat: 66.0,
      minLng: 9.0, maxLng: 31.0
    };

    // Collect CO2 data from multiple sources
    const emissionsData = [];

    // 1. Simulate SOCAT pCO2 data collection
    console.log('Collecting SOCAT pCO2 data...');
    const socatData = await collectSOCATData(balticBounds);
    emissionsData.push(...socatData);

    // 2. Simulate Copernicus Marine Service CO2 flux data
    console.log('Collecting Copernicus CO2 flux data...');
    const copernicusData = await collectCopernicusData(balticBounds);
    emissionsData.push(...copernicusData);

    // 3. Simulate ICOS atmospheric CO2 data
    console.log('Collecting ICOS atmospheric CO2 data...');
    const icosData = await collectICOSData(balticBounds);
    emissionsData.push(...icosData);

    // 4. Simulate satellite ship plume detection
    console.log('Detecting ship emission plumes...');
    const plumeData = await detectShipPlumes(supabase, balticBounds);
    emissionsData.push(...plumeData);

    // Insert collected data into database
    if (emissionsData.length > 0) {
      const { error: insertError } = await supabase
        .from('co2_emissions')
        .insert(emissionsData);

      if (insertError) {
        console.error('Error inserting CO2 data:', insertError);
        throw insertError;
      }

      console.log(`Inserted ${emissionsData.length} CO2 emission records`);
    }

    // Analyze emissions for anomalies
    const anomalies = await analyzeEmissionsAnomalies(supabase, emissionsData);

    return new Response(JSON.stringify({
      success: true,
      collected: emissionsData.length,
      anomalies: anomalies.length,
      sources: ['socat', 'copernicus', 'icos', 'satellite'],
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in CO2 emissions collector:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Simulate SOCAT ocean surface CO2 data collection
async function collectSOCATData(bounds: any): Promise<any[]> {
  const data = [];
  const now = new Date();
  
  // Generate sample pCO2 measurements across Baltic Sea
  for (let i = 0; i < 20; i++) {
    const lat = bounds.minLat + Math.random() * (bounds.maxLat - bounds.minLat);
    const lng = bounds.minLng + Math.random() * (bounds.maxLng - bounds.minLng);
    
    // Typical Baltic Sea pCO2 values (280-450 μatm)
    const pco2 = 280 + Math.random() * 170;
    
    data.push({
      timestamp: new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000),
      location_lat: lat,
      location_lng: lng,
      source: 'socat',
      data_type: 'pco2_water',
      value: pco2,
      unit: 'μatm',
      quality_flag: 'good',
      metadata: {
        temperature: 15 + Math.random() * 10,
        salinity: 6 + Math.random() * 4,
        measurement_depth: 0
      }
    });
  }
  
  return data;
}

// Simulate Copernicus Marine Service CO2 flux data
async function collectCopernicusData(bounds: any): Promise<any[]> {
  const data = [];
  const now = new Date();
  
  // Generate air-sea CO2 flux measurements
  for (let i = 0; i < 15; i++) {
    const lat = bounds.minLat + Math.random() * (bounds.maxLat - bounds.minLat);
    const lng = bounds.minLng + Math.random() * (bounds.maxLng - bounds.minLng);
    
    // CO2 flux values (negative = ocean absorption, positive = ocean emission)
    const flux = -2 + Math.random() * 4; // -2 to +2 mmol/m²/day
    
    data.push({
      timestamp: new Date(now.getTime() - Math.random() * 12 * 60 * 60 * 1000),
      location_lat: lat,
      location_lng: lng,
      source: 'copernicus',
      data_type: 'co2_flux',
      value: flux,
      unit: 'mmol/m²/day',
      quality_flag: 'good',
      metadata: {
        wind_speed: 5 + Math.random() * 10,
        sea_surface_temperature: 12 + Math.random() * 8,
        modeled: true
      }
    });
  }
  
  return data;
}

// Simulate ICOS atmospheric CO2 monitoring stations
async function collectICOSData(bounds: any): Promise<any[]> {
  const data = [];
  const now = new Date();
  
  // Simulate data from ICOS stations in Nordic region
  const stations = [
    { name: 'Baltic_North', lat: 59.5, lng: 18.5 },
    { name: 'Helsinki_Urban', lat: 60.2, lng: 24.9 },
    { name: 'Riga_Coastal', lat: 56.9, lng: 24.1 },
    { name: 'Copenhagen_Marine', lat: 55.7, lng: 12.6 }
  ];
  
  for (const station of stations) {
    // Background CO2 (~420 ppm) with urban/shipping influence
    const baseCO2 = 420 + Math.random() * 20; // 420-440 ppm
    
    data.push({
      timestamp: new Date(now.getTime() - Math.random() * 6 * 60 * 60 * 1000),
      location_lat: station.lat,
      location_lng: station.lng,
      source: 'icos',
      data_type: 'atmospheric_co2',
      value: baseCO2,
      unit: 'ppm',
      quality_flag: 'good',
      metadata: {
        station_name: station.name,
        measurement_height: 30 + Math.random() * 70,
        wind_direction: Math.random() * 360,
        wind_speed: 3 + Math.random() * 8
      }
    });
  }
  
  return data;
}

// Simulate satellite detection of ship emission plumes
async function detectShipPlumes(supabase: any, bounds: any): Promise<any[]> {
  const data = [];
  const now = new Date();
  
  // Get recent vessel positions for plume correlation
  const { data: vessels } = await supabase
    .from('ais_tracking')
    .select('*, vessels(*)')
    .gte('timestamp', new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString())
    .not('vessels', 'is', null);

  if (!vessels || vessels.length === 0) {
    return data;
  }

  // Simulate plume detection for some vessels
  const plumeVessels = vessels.slice(0, Math.min(8, vessels.length));
  
  for (const vessel of plumeVessels) {
    if (!vessel.vessels) continue;
    
    // Estimate emissions based on vessel type and speed
    let expectedEmissions = 0;
    const speed = vessel.speed || 0;
    
    switch (vessel.vessels.vessel_type?.toLowerCase()) {
      case 'tanker':
        expectedEmissions = 150 + speed * 20; // kg CO2/hour
        break;
      case 'container':
        expectedEmissions = 200 + speed * 25;
        break;
      case 'bulk':
        expectedEmissions = 120 + speed * 18;
        break;
      default:
        expectedEmissions = 80 + speed * 15;
    }
    
    // Add some variability and potential anomalies
    const actualEmissions = expectedEmissions * (0.7 + Math.random() * 0.8);
    
    data.push({
      timestamp: vessel.timestamp,
      location_lat: vessel.location_lat,
      location_lng: vessel.location_lng,
      source: 'satellite',
      data_type: 'ship_plume',
      value: actualEmissions,
      unit: 'kg_co2_per_hour',
      quality_flag: 'good',
      vessel_id: vessel.vessel_id,
      metadata: {
        vessel_name: vessel.vessels.vessel_name,
        vessel_type: vessel.vessels.vessel_type,
        imo_number: vessel.vessels.imo_number,
        speed_knots: speed,
        expected_emissions: expectedEmissions,
        deviation_percent: ((actualEmissions - expectedEmissions) / expectedEmissions * 100).toFixed(2),
        detection_confidence: 0.75 + Math.random() * 0.2
      }
    });
  }
  
  return data;
}

// Analyze emissions data for anomalies that could indicate shadow fleet activity
async function analyzeEmissionsAnomalies(supabase: any, emissionsData: any[]): Promise<any[]> {
  const anomalies = [];
  
  // 1. Detect ships with emissions significantly different from expected
  const shipPlumes = emissionsData.filter(d => d.data_type === 'ship_plume');
  
  for (const plume of shipPlumes) {
    const expected = plume.metadata.expected_emissions;
    const actual = plume.value;
    const deviation = Math.abs((actual - expected) / expected * 100);
    
    if (deviation > 30) { // >30% deviation from expected
      const severity = deviation > 60 ? 'critical' : deviation > 45 ? 'high' : 'medium';
      
      anomalies.push({
        vessel_id: plume.vessel_id,
        anomaly_type: actual > expected ? 'excess_emissions' : 'under_emissions',
        location_lat: plume.location_lat,
        location_lng: plume.location_lng,
        severity,
        expected_emissions: expected,
        actual_emissions: actual,
        deviation_percent: deviation,
        analysis_data: {
          vessel_name: plume.metadata.vessel_name,
          vessel_type: plume.metadata.vessel_type,
          imo_number: plume.metadata.imo_number,
          timestamp: plume.timestamp,
          potential_causes: actual > expected ? 
            ['Unreported cargo', 'Engine tampering', 'False vessel specifications'] :
            ['AIS spoofing', 'Underreported activity', 'Emissions hiding technology']
        }
      });
    }
  }
  
  // 2. Detect atmospheric CO2 spikes in shipping lanes without corresponding AIS activity
  const atmosphericData = emissionsData.filter(d => d.data_type === 'atmospheric_co2');
  
  for (const reading of atmosphericData) {
    if (reading.value > 440) { // Elevated CO2 levels
      // Check for nearby vessels in AIS data
      const { data: nearbyVessels } = await supabase
        .from('ais_tracking')
        .select('*')
        .gte('timestamp', new Date(new Date(reading.timestamp).getTime() - 2 * 60 * 60 * 1000).toISOString())
        .lte('timestamp', new Date(new Date(reading.timestamp).getTime() + 2 * 60 * 60 * 1000).toISOString());
      
      // Calculate if any vessels were in the area (within 10km)
      const hasNearbyTraffic = nearbyVessels?.some(vessel => {
        const distance = calculateDistance(
          reading.location_lat, reading.location_lng,
          vessel.location_lat, vessel.location_lng
        );
        return distance < 10; // Within 10km
      });
      
      if (!hasNearbyTraffic) {
        anomalies.push({
          vessel_id: null,
          anomaly_type: 'dark_zone_emissions',
          location_lat: reading.location_lat,
          location_lng: reading.location_lng,
          severity: 'high',
          expected_emissions: 420, // Background CO2
          actual_emissions: reading.value,
          deviation_percent: ((reading.value - 420) / 420 * 100),
          analysis_data: {
            station_name: reading.metadata.station_name,
            timestamp: reading.timestamp,
            potential_explanation: 'Elevated CO2 without corresponding AIS activity - possible dark vessel',
            wind_conditions: {
              speed: reading.metadata.wind_speed,
              direction: reading.metadata.wind_direction
            }
          }
        });
      }
    }
  }
  
  // Insert anomalies into database
  if (anomalies.length > 0) {
    const { error } = await supabase
      .from('emissions_anomalies')
      .insert(anomalies);
      
    if (error) {
      console.error('Error inserting emissions anomalies:', error);
    } else {
      console.log(`Detected ${anomalies.length} emissions anomalies`);
    }
  }
  
  return anomalies;
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