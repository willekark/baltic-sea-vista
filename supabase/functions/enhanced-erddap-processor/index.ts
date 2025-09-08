import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ERDDAPQuery {
  dataset_id: string;
  variables: string[];
  time_range: {
    start: string;
    end: string;
  };
  bbox?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  depth_range?: {
    min: number;
    max: number;
  };
}

interface QualityAssessment {
  overall_score: number;
  completeness_score: number;
  accuracy_score: number;
  temporal_continuity_score: number;
  spatial_coverage_score: number;
  quality_flags: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    console.log(`ERDDAP Processor Action: ${action}`, params);

    switch (action) {
      case 'ingest_data':
        const result = await ingestERDDAPData(params as ERDDAPQuery);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'assess_quality':
        const assessment = await assessDataQuality(params.dataset_id, params.period_start, params.period_end);
        return new Response(JSON.stringify(assessment), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'compute_indicators':
        const indicators = await computeBalticIndicators(params.region, params.period_start, params.period_end);
        return new Response(JSON.stringify(indicators), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_timeseries':
        const timeseries = await getTimeseries(params);
        return new Response(JSON.stringify(timeseries), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'trigger_alerts':
        const alerts = await processAlerts(params);
        return new Response(JSON.stringify(alerts), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in enhanced ERDDAP processor:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function ingestERDDAPData(query: ERDDAPQuery) {
  const baseUrl = 'https://erddap.observations.voiceoftheocean.org/erddap';
  
  // Default Baltic Sea bounding box
  const bbox = query.bbox || {
    north: 66,
    south: 53,
    east: 30,
    west: 9
  };

  try {
    // Construct ERDDAP tabledap query
    const variables = query.variables.join(',');
    const erdddapUrl = `${baseUrl}/tabledap/${query.dataset_id}.csv?${variables}` +
      `&time>=${query.time_range.start}&time<=${query.time_range.end}` +
      `&latitude>=${bbox.south}&latitude<=${bbox.north}` +
      `&longitude>=${bbox.west}&longitude<=${bbox.east}` +
      `&orderBy("time")`;

    console.log('Fetching ERDDAP data from:', erdddapUrl);

    const response = await fetch(erdddapUrl, {
      headers: {
        'User-Agent': 'Baltic-Intelligence-Hub/1.0'
      },
      signal: AbortSignal.timeout(30000) // 30s timeout
    });

    if (!response.ok) {
      throw new Error(`ERDDAP request failed: ${response.status} ${response.statusText}`);
    }

    const csvData = await response.text();
    const observations = parseERDDAPCSV(csvData, query.dataset_id);

    // Store observations in database
    const stored = await storeObservations(observations);
    
    // Update dataset metadata
    await updateDatasetMetadata(query.dataset_id, observations.length);

    return {
      success: true,
      dataset_id: query.dataset_id,
      observations_ingested: observations.length,
      stored_records: stored,
      query_url: erdddapUrl,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('ERDDAP ingestion error:', error);
    throw error;
  }
}

function parseERDDAPCSV(csvData: string, datasetId: string) {
  const lines = csvData.split('\n');
  if (lines.length < 2) return [];

  // Skip first line (headers), get column names from second line
  const headers = lines[1].split(',').map(h => h.trim());
  const observations = [];

  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',');
    if (values.length !== headers.length) continue;

    const row: Record<string, any> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx]?.replace(/"/g, '') || null;
    });

    // Convert to standardized observation format
    if (row.time && row.latitude && row.longitude) {
      // Process each variable in the row
      ['temperature', 'salinity', 'dissolved_oxygen', 'chlorophyll', 'turbidity'].forEach(variable => {
        if (row[variable] && row[variable] !== 'NaN' && row[variable] !== '') {
          observations.push({
            dataset_id: datasetId,
            timestamp: new Date(row.time).toISOString(),
            location_lat: parseFloat(row.latitude),
            location_lng: parseFloat(row.longitude),
            variable_name: variable,
            value: parseFloat(row[variable]),
            unit: getVariableUnit(variable),
            depth_m: row.depth ? parseFloat(row.depth) : 0,
            platform_id: row.platform_id || datasetId.split('_')[1],
            mission_id: row.mission_id || datasetId.split('_')[2],
            quality_flag: assessDataPoint(variable, parseFloat(row[variable])),
            confidence_score: calculateConfidence(variable, parseFloat(row[variable])),
            source: 'voice_of_ocean',
            metadata: {
              original_row: row,
              ingestion_time: new Date().toISOString()
            }
          });
        }
      });
    }
  }

  return observations;
}

function getVariableUnit(variable: string): string {
  const units: Record<string, string> = {
    'temperature': '°C',
    'salinity': 'PSU',
    'dissolved_oxygen': 'mg/L',
    'chlorophyll': 'µg/L',
    'turbidity': 'NTU',
    'depth': 'm'
  };
  return units[variable] || '';
}

function assessDataPoint(variable: string, value: number): string {
  // Quality assessment based on typical Baltic Sea ranges
  const ranges: Record<string, {min: number, max: number}> = {
    'temperature': {min: -2, max: 25},
    'salinity': {min: 0, max: 35},
    'dissolved_oxygen': {min: 0, max: 15},
    'chlorophyll': {min: 0, max: 100},
    'turbidity': {min: 0, max: 50}
  };

  const range = ranges[variable];
  if (!range) return 'unknown';
  
  if (value < range.min || value > range.max) return 'questionable';
  return 'good';
}

function calculateConfidence(variable: string, value: number): number {
  // Simple confidence based on value reasonableness
  const quality = assessDataPoint(variable, value);
  switch (quality) {
    case 'good': return 1.0;
    case 'questionable': return 0.5;
    default: return 0.1;
  }
}

async function storeObservations(observations: any[]) {
  if (observations.length === 0) return 0;

  try {
    // Insert observations in batches to avoid timeout
    const batchSize = 1000;
    let stored = 0;

    for (let i = 0; i < observations.length; i += batchSize) {
      const batch = observations.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('oceanographic_observations')
        .insert(batch)
        .select('id');

      if (error) {
        console.error('Database insert error:', error);
        // Continue with next batch on conflict errors
        if (!error.message.includes('duplicate key')) {
          throw error;
        }
      } else {
        stored += data?.length || 0;
      }
    }

    return stored;
  } catch (error) {
    console.error('Error storing observations:', error);
    throw error;
  }
}

async function updateDatasetMetadata(datasetId: string, newObservations: number) {
  const { error } = await supabase
    .from('erddap_datasets')
    .upsert({
      dataset_id: datasetId,
      last_updated: new Date().toISOString(),
      // Would be populated by separate catalog crawler
      title: `Dataset ${datasetId}`,
      institution: 'Voice of the Ocean Foundation'
    });

  if (error) {
    console.error('Error updating dataset metadata:', error);
  }
}

async function assessDataQuality(datasetId: string, periodStart: string, periodEnd: string): Promise<QualityAssessment> {
  try {
    // Get observations for the period
    const { data: observations, error } = await supabase
      .from('oceanographic_observations')
      .select('*')
      .eq('dataset_id', datasetId)
      .gte('timestamp', periodStart)
      .lte('timestamp', periodEnd);

    if (error) throw error;

    if (!observations || observations.length === 0) {
      return {
        overall_score: 0,
        completeness_score: 0,
        accuracy_score: 0,
        temporal_continuity_score: 0,
        spatial_coverage_score: 0,
        quality_flags: { no_data: true }
      };
    }

    // Calculate quality metrics
    const totalExpectedPoints = calculateExpectedDataPoints(periodStart, periodEnd);
    const completenessScore = Math.min(observations.length / totalExpectedPoints, 1.0);

    const goodQualityPoints = observations.filter(obs => obs.quality_flag === 'good').length;
    const accuracyScore = goodQualityPoints / observations.length;

    const temporalContinuityScore = assessTemporalContinuity(observations);
    const spatialCoverageScore = assessSpatialCoverage(observations);

    const overallScore = (completenessScore + accuracyScore + temporalContinuityScore + spatialCoverageScore) / 4;

    const assessment: QualityAssessment = {
      overall_score: overallScore,
      completeness_score: completenessScore,
      accuracy_score: accuracyScore,
      temporal_continuity_score: temporalContinuityScore,
      spatial_coverage_score: spatialCoverageScore,
      quality_flags: {
        total_points: observations.length,
        expected_points: totalExpectedPoints,
        good_quality_points: goodQualityPoints,
        assessment_period: { start: periodStart, end: periodEnd }
      }
    };

    // Store assessment
    await supabase
      .from('data_quality_assessments')
      .insert({
        dataset_id: datasetId,
        assessment_period_start: periodStart,
        assessment_period_end: periodEnd,
        ...assessment,
        assessment_details: assessment.quality_flags
      });

    return assessment;

  } catch (error) {
    console.error('Quality assessment error:', error);
    throw error;
  }
}

function calculateExpectedDataPoints(startTime: string, endTime: string): number {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const hours = Math.abs(end.getTime() - start.getTime()) / 36e5;
  return Math.floor(hours); // Expect ~1 observation per hour
}

function assessTemporalContinuity(observations: any[]): number {
  if (observations.length < 2) return 0;
  
  const sortedObs = observations.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  let gaps = 0;
  for (let i = 1; i < sortedObs.length; i++) {
    const timeDiff = new Date(sortedObs[i].timestamp).getTime() - 
                    new Date(sortedObs[i-1].timestamp).getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff > 6) gaps++; // Gap if more than 6 hours between observations
  }
  
  return Math.max(0, 1 - (gaps / sortedObs.length));
}

function assessSpatialCoverage(observations: any[]): number {
  if (observations.length === 0) return 0;
  
  const uniqueLocations = new Set(
    observations.map(obs => `${obs.location_lat.toFixed(2)},${obs.location_lng.toFixed(2)}`)
  );
  
  // Score based on spatial diversity (more locations = better coverage)
  return Math.min(uniqueLocations.size / 100, 1.0);
}

async function computeBalticIndicators(region: string, periodStart: string, periodEnd: string) {
  try {
    console.log(`Computing Baltic indicators for ${region} from ${periodStart} to ${periodEnd}`);

    // Get relevant observations
    const { data: observations, error } = await supabase
      .from('oceanographic_observations')
      .select('*')
      .gte('timestamp', periodStart)
      .lte('timestamp', periodEnd)
      .in('variable_name', ['dissolved_oxygen', 'temperature', 'salinity']);

    if (error) throw error;

    const indicators = [];

    // Baltic Oxygen Index (BOI)
    const oxygenObs = observations?.filter(obs => obs.variable_name === 'dissolved_oxygen') || [];
    if (oxygenObs.length > 0) {
      const avgOxygen = oxygenObs.reduce((sum, obs) => sum + obs.value, 0) / oxygenObs.length;
      const boi = Math.max(0, Math.min(1, avgOxygen / 8)); // Normalized to 0-1 scale
      
      indicators.push({
        indicator_type: 'baltic_oxygen_index',
        region,
        period_start: periodStart.split('T')[0],
        period_end: periodEnd.split('T')[0],
        value: boi,
        confidence: calculateIndicatorConfidence(oxygenObs),
        methodology: 'Average dissolved oxygen normalized to 0-1 scale (8 mg/L = 1.0)',
        data_sources: ['voice_of_ocean'],
        metadata: {
          avg_oxygen: avgOxygen,
          observation_count: oxygenObs.length,
          min_oxygen: Math.min(...oxygenObs.map(o => o.value)),
          max_oxygen: Math.max(...oxygenObs.map(o => o.value))
        }
      });
    }

    // Hypoxia Risk
    const hypoxicObs = oxygenObs.filter(obs => obs.value < 2);
    const hypoxiaRisk = oxygenObs.length > 0 ? hypoxicObs.length / oxygenObs.length : 0;
    
    indicators.push({
      indicator_type: 'hypoxia_risk',
      region,
      period_start: periodStart.split('T')[0],
      period_end: periodEnd.split('T')[0],
      value: hypoxiaRisk,
      confidence: calculateIndicatorConfidence(oxygenObs),
      methodology: 'Fraction of observations with dissolved oxygen < 2 mg/L',
      data_sources: ['voice_of_ocean'],
      metadata: {
        hypoxic_observations: hypoxicObs.length,
        total_observations: oxygenObs.length,
        hypoxia_threshold: 2.0
      }
    });

    // Temperature Anomaly
    const tempObs = observations?.filter(obs => obs.variable_name === 'temperature') || [];
    if (tempObs.length > 0) {
      const avgTemp = tempObs.reduce((sum, obs) => sum + obs.value, 0) / tempObs.length;
      const seasonalAverage = getSeasonalTemperatureAverage(new Date(periodStart));
      const tempAnomaly = avgTemp - seasonalAverage;
      
      indicators.push({
        indicator_type: 'surface_temp_anomaly',
        region,
        period_start: periodStart.split('T')[0],
        period_end: periodEnd.split('T')[0],
        value: tempAnomaly,
        confidence: calculateIndicatorConfidence(tempObs),
        methodology: 'Difference from seasonal average temperature',
        data_sources: ['voice_of_ocean'],
        metadata: {
          observed_temp: avgTemp,
          seasonal_average: seasonalAverage,
          observation_count: tempObs.length
        }
      });
    }

    // Salinity Stress Index
    const salinityObs = observations?.filter(obs => obs.variable_name === 'salinity') || [];
    if (salinityObs.length > 0) {
      const avgSalinity = salinityObs.reduce((sum, obs) => sum + obs.value, 0) / salinityObs.length;
      const stressIndex = Math.abs(avgSalinity - 7) / 7; // Normalized stress from optimal 7 PSU
      
      indicators.push({
        indicator_type: 'salinity_stress_index',
        region,
        period_start: periodStart.split('T')[0],
        period_end: periodEnd.split('T')[0],
        value: stressIndex,
        confidence: calculateIndicatorConfidence(salinityObs),
        methodology: 'Deviation from optimal Baltic salinity (7 PSU)',
        data_sources: ['voice_of_ocean'],
        metadata: {
          avg_salinity: avgSalinity,
          optimal_salinity: 7,
          observation_count: salinityObs.length
        }
      });
    }

    // Store indicators
    if (indicators.length > 0) {
      const { error: insertError } = await supabase
        .from('baltic_indicators')
        .insert(indicators);

      if (insertError) {
        console.error('Error storing indicators:', insertError);
      }
    }

    return {
      success: true,
      indicators_computed: indicators.length,
      indicators,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error computing Baltic indicators:', error);
    throw error;
  }
}

function calculateIndicatorConfidence(observations: any[]): number {
  if (observations.length === 0) return 0;
  
  const avgConfidence = observations.reduce((sum, obs) => sum + (obs.confidence_score || 1), 0) / observations.length;
  const sampleSizeBonus = Math.min(observations.length / 100, 0.2);
  
  return Math.min(avgConfidence + sampleSizeBonus, 1.0);
}

function getSeasonalTemperatureAverage(date: Date): number {
  const month = date.getMonth();
  // Simplified seasonal averages for Baltic Sea
  const seasonalTemps = [2, 1, 3, 6, 12, 16, 18, 17, 13, 9, 5, 3];
  return seasonalTemps[month];
}

async function getTimeseries(params: any) {
  const {
    dataset_id,
    variable_name,
    start_time,
    end_time,
    location_lat,
    location_lng,
    radius_km = 10
  } = params;

  try {
    let query = supabase
      .from('oceanographic_observations')
      .select('*')
      .gte('timestamp', start_time)
      .lte('timestamp', end_time);

    if (dataset_id) {
      query = query.eq('dataset_id', dataset_id);
    }

    if (variable_name) {
      query = query.eq('variable_name', variable_name);
    }

    // Spatial filtering (simplified - would use PostGIS in production)
    if (location_lat && location_lng) {
      const latRadius = radius_km / 111.32; // Approximate degrees
      const lngRadius = radius_km / (111.32 * Math.cos(location_lat * Math.PI / 180));
      
      query = query
        .gte('location_lat', location_lat - latRadius)
        .lte('location_lat', location_lat + latRadius)
        .gte('location_lng', location_lng - lngRadius)
        .lte('location_lng', location_lng + lngRadius);
    }

    const { data, error } = await query
      .order('timestamp', { ascending: true })
      .limit(10000);

    if (error) throw error;

    return {
      success: true,
      data: data || [],
      count: data?.length || 0,
      parameters: params,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error fetching timeseries:', error);
    throw error;
  }
}

async function processAlerts(params: any) {
  const { region = 'baltic_sea', check_thresholds = true } = params;

  try {
    const alerts = [];

    if (check_thresholds) {
      // Check for hypoxia conditions
      const { data: recentOxygen } = await supabase
        .from('oceanographic_observations')
        .select('*')
        .eq('variable_name', 'dissolved_oxygen')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .lt('value', 2);

      if (recentOxygen && recentOxygen.length > 5) {
        alerts.push({
          alert_type: 'hypoxia_risk',
          title: 'Critical Hypoxia Detected',
          description: `${recentOxygen.length} observations with dissolved oxygen < 2 mg/L in the last 24 hours`,
          severity: 'critical',
          status: 'active',
          trigger_conditions: { threshold: 2, variable: 'dissolved_oxygen', timeframe: '24h' },
          trigger_data: { observation_count: recentOxygen.length },
          affected_datasets: [...new Set(recentOxygen.map(obs => obs.dataset_id))]
        });
      }

      // Check for temperature anomalies
      const { data: recentTemp } = await supabase
        .from('oceanographic_observations')
        .select('*')
        .eq('variable_name', 'temperature')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (recentTemp && recentTemp.length > 0) {
        const avgTemp = recentTemp.reduce((sum, obs) => sum + obs.value, 0) / recentTemp.length;
        const seasonalAvg = getSeasonalTemperatureAverage(new Date());
        const anomaly = Math.abs(avgTemp - seasonalAvg);

        if (anomaly > 5) {
          alerts.push({
            alert_type: 'temperature_anomaly',
            title: 'Significant Temperature Anomaly',
            description: `Temperature deviation of ${anomaly.toFixed(1)}°C from seasonal average`,
            severity: anomaly > 8 ? 'high' : 'medium',
            status: 'active',
            trigger_conditions: { threshold: 5, variable: 'temperature', type: 'anomaly' },
            trigger_data: { anomaly_value: anomaly, observed_temp: avgTemp, seasonal_avg: seasonalAvg },
            affected_datasets: [...new Set(recentTemp.map(obs => obs.dataset_id))]
          });
        }
      }
    }

    // Store new alerts
    if (alerts.length > 0) {
      const { error } = await supabase
        .from('intelligence_alerts')
        .insert(alerts);

      if (error) {
        console.error('Error storing alerts:', error);
      }
    }

    return {
      success: true,
      new_alerts: alerts.length,
      alerts,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error processing alerts:', error);
    throw error;
  }
}