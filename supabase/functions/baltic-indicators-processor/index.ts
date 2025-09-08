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

interface IndicatorRequest {
  indicator_types: string[];
  region: string;
  period_start: string;
  period_end: string;
  bbox?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    console.log(`Baltic Indicators Processor: ${action}`, params);

    switch (action) {
      case 'compute_all_indicators':
        const result = await computeAllIndicators(params as IndicatorRequest);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_indicator_history':
        const history = await getIndicatorHistory(params.indicator_type, params.region, params.days || 30);
        return new Response(JSON.stringify(history), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'generate_report':
        const report = await generateIndicatorReport(params);
        return new Response(JSON.stringify(report), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'forecast_indicators':
        const forecast = await forecastIndicators(params);
        return new Response(JSON.stringify(forecast), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in Baltic indicators processor:', error);
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

async function computeAllIndicators(request: IndicatorRequest) {
  const { region, period_start, period_end, bbox } = request;
  
  console.log(`Computing indicators for ${region} from ${period_start} to ${period_end}`);

  try {
    // Get observations for the period and region
    let query = supabase
      .from('oceanographic_observations')
      .select('*')
      .gte('timestamp', period_start)
      .lte('timestamp', period_end);

    // Apply spatial filtering if bbox provided
    if (bbox) {
      query = query
        .gte('location_lat', bbox.south)
        .lte('location_lat', bbox.north)
        .gte('location_lng', bbox.west)
        .lte('location_lng', bbox.east);
    }

    const { data: observations, error } = await query;
    
    if (error) throw error;

    if (!observations || observations.length === 0) {
      return {
        success: true,
        message: 'No observations found for the specified period and region',
        indicators_computed: 0,
        period: { start: period_start, end: period_end },
        region
      };
    }

    console.log(`Found ${observations.length} observations for indicator computation`);

    const indicators = [];

    // 1. Baltic Oxygen Index (BOI)
    const oxygenObs = observations.filter(obs => obs.variable_name === 'dissolved_oxygen');
    if (oxygenObs.length > 0) {
      const avgOxygen = oxygenObs.reduce((sum, obs) => sum + obs.value, 0) / oxygenObs.length;
      const medianOxygen = calculateMedian(oxygenObs.map(obs => obs.value));
      const oxygenStd = calculateStandardDeviation(oxygenObs.map(obs => obs.value));
      
      // BOI: Normalized oxygen health (8 mg/L = optimal)
      const boi = Math.max(0, Math.min(1, avgOxygen / 8));
      
      indicators.push({
        indicator_type: 'baltic_oxygen_index',
        region,
        period_start: period_start.split('T')[0],
        period_end: period_end.split('T')[0],
        value: boi,
        confidence: calculateIndicatorConfidence(oxygenObs),
        methodology: 'Average dissolved oxygen normalized to 0-1 scale where 8 mg/L = 1.0 (optimal)',
        data_sources: ['voice_of_ocean', 'erddap'],
        metadata: {
          avg_oxygen: avgOxygen,
          median_oxygen: medianOxygen,
          std_oxygen: oxygenStd,
          observation_count: oxygenObs.length,
          min_oxygen: Math.min(...oxygenObs.map(o => o.value)),
          max_oxygen: Math.max(...oxygenObs.map(o => o.value)),
          spatial_coverage: calculateSpatialCoverage(oxygenObs)
        }
      });
    }

    // 2. Hypoxia Risk Assessment
    if (oxygenObs.length > 0) {
      const hypoxicObs = oxygenObs.filter(obs => obs.value < 2); // < 2 mg/L
      const severeHypoxicObs = oxygenObs.filter(obs => obs.value < 1); // < 1 mg/L
      const hypoxiaRisk = hypoxicObs.length / oxygenObs.length;
      
      indicators.push({
        indicator_type: 'hypoxia_risk',
        region,
        period_start: period_start.split('T')[0],
        period_end: period_end.split('T')[0],
        value: hypoxiaRisk,
        confidence: calculateIndicatorConfidence(oxygenObs),
        methodology: 'Fraction of observations with dissolved oxygen < 2 mg/L',
        data_sources: ['voice_of_ocean', 'erddap'],
        metadata: {
          hypoxic_observations: hypoxicObs.length,
          severe_hypoxic_observations: severeHypoxicObs.length,
          total_observations: oxygenObs.length,
          hypoxia_threshold: 2.0,
          severe_threshold: 1.0,
          affected_area_estimate: calculateAffectedArea(hypoxicObs),
          worst_areas: identifyWorstAreas(hypoxicObs)
        }
      });
    }

    // 3. Surface Temperature Anomaly
    const tempObs = observations.filter(obs => obs.variable_name === 'temperature');
    if (tempObs.length > 0) {
      const avgTemp = tempObs.reduce((sum, obs) => sum + obs.value, 0) / tempObs.length;
      const seasonalAverage = getSeasonalTemperatureAverage(new Date(period_start), region);
      const tempAnomaly = avgTemp - seasonalAverage;
      
      // Calculate temperature trend
      const tempTrend = calculateTemperatureTrend(tempObs);
      
      indicators.push({
        indicator_type: 'surface_temp_anomaly',
        region,
        period_start: period_start.split('T')[0],
        period_end: period_end.split('T')[0],
        value: tempAnomaly,
        confidence: calculateIndicatorConfidence(tempObs),
        methodology: 'Difference between observed and seasonal average temperature',
        data_sources: ['voice_of_ocean', 'erddap'],
        metadata: {
          observed_temp: avgTemp,
          seasonal_average: seasonalAverage,
          anomaly_magnitude: Math.abs(tempAnomaly),
          temperature_trend: tempTrend,
          observation_count: tempObs.length,
          temp_range: {
            min: Math.min(...tempObs.map(o => o.value)),
            max: Math.max(...tempObs.map(o => o.value))
          }
        }
      });
    }

    // 4. Salinity Stress Index
    const salinityObs = observations.filter(obs => obs.variable_name === 'salinity');
    if (salinityObs.length > 0) {
      const avgSalinity = salinityObs.reduce((sum, obs) => sum + obs.value, 0) / salinityObs.length;
      const optimalSalinity = getOptimalSalinity(region);
      const stressIndex = Math.abs(avgSalinity - optimalSalinity) / optimalSalinity;
      
      indicators.push({
        indicator_type: 'salinity_stress_index',
        region,
        period_start: period_start.split('T')[0],
        period_end: period_end.split('T')[0],
        value: stressIndex,
        confidence: calculateIndicatorConfidence(salinityObs),
        methodology: `Deviation from optimal salinity for ${region} (${optimalSalinity} PSU)`,
        data_sources: ['voice_of_ocean', 'erddap'],
        metadata: {
          avg_salinity: avgSalinity,
          optimal_salinity: optimalSalinity,
          deviation_psu: Math.abs(avgSalinity - optimalSalinity),
          observation_count: salinityObs.length,
          salinity_range: {
            min: Math.min(...salinityObs.map(o => o.value)),
            max: Math.max(...salinityObs.map(o => o.value))
          }
        }
      });
    }

    // 5. Chlorophyll Productivity Index
    const chlorophyllObs = observations.filter(obs => obs.variable_name === 'chlorophyll');
    if (chlorophyllObs.length > 0) {
      const avgChlorophyll = chlorophyllObs.reduce((sum, obs) => sum + obs.value, 0) / chlorophyllObs.length;
      const productivityIndex = Math.min(avgChlorophyll / 10, 1); // Normalized to 0-1, 10 µg/L = high productivity
      
      indicators.push({
        indicator_type: 'chlorophyll_productivity_index',
        region,
        period_start: period_start.split('T')[0],
        period_end: period_end.split('T')[0],
        value: productivityIndex,
        confidence: calculateIndicatorConfidence(chlorophyllObs),
        methodology: 'Chlorophyll-a concentration normalized to productivity index (10 µg/L = 1.0)',
        data_sources: ['voice_of_ocean', 'erddap'],
        metadata: {
          avg_chlorophyll: avgChlorophyll,
          observation_count: chlorophyllObs.length,
          productivity_threshold: 10.0,
          bloom_indicators: identifyBloomAreas(chlorophyllObs)
        }
      });
    }

    // 6. Ecosystem Health Composite Score
    if (indicators.length >= 3) {
      const weights = {
        'baltic_oxygen_index': 0.3,
        'hypoxia_risk': -0.25, // Negative because higher hypoxia = worse health
        'surface_temp_anomaly': -0.15, // Negative for extreme anomalies
        'salinity_stress_index': -0.2, // Negative because higher stress = worse health
        'chlorophyll_productivity_index': 0.1
      };

      let compositeScore = 0;
      let totalWeight = 0;

      indicators.forEach(indicator => {
        const weight = weights[indicator.indicator_type];
        if (weight !== undefined) {
          let adjustedValue = indicator.value;
          
          // Special handling for temperature anomaly (penalize extreme values)
          if (indicator.indicator_type === 'surface_temp_anomaly') {
            adjustedValue = Math.abs(adjustedValue) > 3 ? 1 : Math.abs(adjustedValue) / 3;
          }
          
          compositeScore += adjustedValue * Math.abs(weight) * (weight > 0 ? 1 : -1);
          totalWeight += Math.abs(weight);
        }
      });

      const ecosystemHealth = totalWeight > 0 ? Math.max(0, Math.min(1, (compositeScore / totalWeight + 1) / 2)) : 0.5;

      indicators.push({
        indicator_type: 'ecosystem_health_composite',
        region,
        period_start: period_start.split('T')[0],
        period_end: period_end.split('T')[0],
        value: ecosystemHealth,
        confidence: indicators.reduce((sum, ind) => sum + ind.confidence, 0) / indicators.length,
        methodology: 'Weighted composite of oxygen, hypoxia, temperature, salinity, and productivity indicators',
        data_sources: ['voice_of_ocean', 'erddap'],
        metadata: {
          component_indicators: indicators.length,
          composite_calculation: weights,
          raw_score: compositeScore,
          normalized_score: ecosystemHealth,
          health_category: categorizeEcosystemHealth(ecosystemHealth)
        }
      });
    }

    // Store all indicators in database
    if (indicators.length > 0) {
      const { error: insertError } = await supabase
        .from('baltic_indicators')
        .insert(indicators);

      if (insertError) {
        console.error('Error storing indicators:', insertError);
        throw insertError;
      }
    }

    return {
      success: true,
      indicators_computed: indicators.length,
      indicators,
      period: { start: period_start, end: period_end },
      region,
      observations_processed: observations.length,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error computing indicators:', error);
    throw error;
  }
}

function calculateMedian(values: number[]): number {
  const sorted = values.sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(avgSquaredDiff);
}

function calculateIndicatorConfidence(observations: any[]): number {
  if (observations.length === 0) return 0;
  
  const avgQualityScore = observations.reduce((sum, obs) => sum + (obs.confidence_score || 1), 0) / observations.length;
  const sampleSizeBonus = Math.min(observations.length / 100, 0.2);
  const temporalCoverage = assessTemporalCoverage(observations);
  
  return Math.min(avgQualityScore + sampleSizeBonus + temporalCoverage * 0.1, 1.0);
}

function assessTemporalCoverage(observations: any[]): number {
  if (observations.length < 2) return 0;
  
  const timestamps = observations.map(obs => new Date(obs.timestamp).getTime()).sort();
  const timeSpan = timestamps[timestamps.length - 1] - timestamps[0];
  const expectedSpan = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  
  return Math.min(timeSpan / expectedSpan, 1.0);
}

function calculateSpatialCoverage(observations: any[]): object {
  const locations = observations.map(obs => ({ lat: obs.location_lat, lng: obs.location_lng }));
  
  const bounds = {
    north: Math.max(...locations.map(loc => loc.lat)),
    south: Math.min(...locations.map(loc => loc.lat)),
    east: Math.max(...locations.map(loc => loc.lng)),
    west: Math.min(...locations.map(loc => loc.lng))
  };
  
  const uniqueLocations = new Set(locations.map(loc => `${loc.lat.toFixed(2)},${loc.lng.toFixed(2)}`));
  
  return {
    bounds,
    unique_locations: uniqueLocations.size,
    coverage_area_deg2: (bounds.north - bounds.south) * (bounds.east - bounds.west)
  };
}

function calculateAffectedArea(hypoxicObservations: any[]): number {
  // Simplified area calculation - in production would use proper spatial analysis
  if (hypoxicObservations.length === 0) return 0;
  
  const locations = hypoxicObservations.map(obs => ({ lat: obs.location_lat, lng: obs.location_lng }));
  const uniqueLocations = new Set(locations.map(loc => `${loc.lat.toFixed(1)},${loc.lng.toFixed(1)}`));
  
  // Rough estimate: each unique location represents ~100 km²  
  return uniqueLocations.size * 100;
}

function identifyWorstAreas(hypoxicObservations: any[]): any[] {
  // Group by approximate location and find worst oxygen levels
  const locationGroups: { [key: string]: any[] } = {};
  
  hypoxicObservations.forEach(obs => {
    const locationKey = `${obs.location_lat.toFixed(1)},${obs.location_lng.toFixed(1)}`;
    if (!locationGroups[locationKey]) locationGroups[locationKey] = [];
    locationGroups[locationKey].push(obs);
  });
  
  return Object.entries(locationGroups)
    .map(([location, obs]) => ({
      location,
      worst_oxygen: Math.min(...obs.map(o => o.value)),
      avg_oxygen: obs.reduce((sum, o) => sum + o.value, 0) / obs.length,
      observation_count: obs.length
    }))
    .sort((a, b) => a.worst_oxygen - b.worst_oxygen)
    .slice(0, 5);
}

function calculateTemperatureTrend(tempObservations: any[]): object {
  if (tempObservations.length < 2) return { trend: 'insufficient_data' };
  
  // Sort by timestamp
  const sortedObs = tempObservations.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  // Simple linear trend calculation
  const n = sortedObs.length;
  const x = sortedObs.map((_, i) => i);
  const y = sortedObs.map(obs => obs.value);
  
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return {
    trend: slope > 0.1 ? 'warming' : slope < -0.1 ? 'cooling' : 'stable',
    slope_per_period: slope,
    trend_strength: Math.abs(slope),
    r_squared: calculateRSquared(x, y, slope, intercept)
  };
}

function calculateRSquared(x: number[], y: number[], slope: number, intercept: number): number {
  const yMean = y.reduce((sum, val) => sum + val, 0) / y.length;
  const totalSumSquares = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
  const residualSumSquares = x.reduce((sum, val, i) => {
    const predicted = slope * val + intercept;
    return sum + Math.pow(y[i] - predicted, 2);
  }, 0);
  
  return 1 - (residualSumSquares / totalSumSquares);
}

function getSeasonalTemperatureAverage(date: Date, region: string): number {
  const month = date.getMonth();
  
  // Regional temperature profiles for Baltic Sea
  const profiles: { [key: string]: number[] } = {
    'baltic_sea': [2, 1, 3, 6, 12, 16, 18, 17, 13, 9, 5, 3],
    'baltic_proper': [3, 2, 4, 7, 13, 17, 19, 18, 14, 10, 6, 4],
    'bothnian_sea': [1, 0, 2, 5, 11, 15, 17, 16, 12, 8, 4, 2],
    'bothnian_bay': [0, -1, 1, 4, 10, 14, 16, 15, 11, 7, 3, 1]
  };
  
  const profile = profiles[region] || profiles['baltic_sea'];
  return profile[month];
}

function getOptimalSalinity(region: string): number {
  const optimalSalinity: { [key: string]: number } = {
    'baltic_sea': 7,
    'baltic_proper': 7,
    'bothnian_sea': 6,
    'bothnian_bay': 4,
    'danish_straits': 15
  };
  
  return optimalSalinity[region] || 7;
}

function identifyBloomAreas(chlorophyllObs: any[]): any[] {
  // Identify potential algal bloom areas (chlorophyll > 15 µg/L)
  const bloomThreshold = 15;
  const bloomObs = chlorophyllObs.filter(obs => obs.value > bloomThreshold);
  
  if (bloomObs.length === 0) return [];
  
  // Group by location
  const locationGroups: { [key: string]: any[] } = {};
  bloomObs.forEach(obs => {
    const locationKey = `${obs.location_lat.toFixed(1)},${obs.location_lng.toFixed(1)}`;
    if (!locationGroups[locationKey]) locationGroups[locationKey] = [];
    locationGroups[locationKey].push(obs);
  });
  
  return Object.entries(locationGroups)
    .map(([location, obs]) => ({
      location,
      max_chlorophyll: Math.max(...obs.map(o => o.value)),
      avg_chlorophyll: obs.reduce((sum, o) => sum + o.value, 0) / obs.length,
      observation_count: obs.length,
      bloom_intensity: Math.max(...obs.map(o => o.value)) / bloomThreshold
    }))
    .sort((a, b) => b.max_chlorophyll - a.max_chlorophyll);
}

function categorizeEcosystemHealth(score: number): string {
  if (score >= 0.8) return 'excellent';
  if (score >= 0.6) return 'good';
  if (score >= 0.4) return 'moderate';
  if (score >= 0.2) return 'poor';
  return 'critical';
}

async function getIndicatorHistory(indicatorType: string, region: string, days: number) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  
  const { data, error } = await supabase
    .from('baltic_indicators')
    .select('*')
    .eq('indicator_type', indicatorType)
    .eq('region', region)
    .gte('period_start', startDate.toISOString().split('T')[0])
    .order('period_start', { ascending: true });
  
  if (error) throw error;
  
  return {
    success: true,
    indicator_type: indicatorType,
    region,
    period_days: days,
    data: data || [],
    trend: calculateIndicatorTrend(data || [])
  };
}

function calculateIndicatorTrend(data: any[]): object {
  if (data.length < 2) return { trend: 'insufficient_data' };
  
  const values = data.map(d => d.value);
  const recent = values.slice(-Math.min(7, values.length));
  const earlier = values.slice(0, Math.min(7, values.length));
  
  const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
  const earlierAvg = earlier.reduce((sum, val) => sum + val, 0) / earlier.length;
  
  const change = recentAvg - earlierAvg;
  const changePercent = earlierAvg !== 0 ? (change / earlierAvg) * 100 : 0;
  
  return {
    trend: Math.abs(change) < 0.05 ? 'stable' : change > 0 ? 'increasing' : 'decreasing',
    change_absolute: change,
    change_percent: changePercent,
    recent_average: recentAvg,
    earlier_average: earlierAvg
  };
}

async function generateIndicatorReport(params: any) {
  const { region, period_start, period_end, format = 'json' } = params;
  
  // Get all indicators for the period
  const { data: indicators, error } = await supabase
    .from('baltic_indicators')
    .select('*')
    .eq('region', region)
    .gte('period_start', period_start)
    .lte('period_end', period_end)
    .order('indicator_type', { ascending: true });
  
  if (error) throw error;
  
  const report = {
    title: `Baltic Sea Environmental Intelligence Report - ${region}`,
    period: { start: period_start, end: period_end },
    region,
    generated_at: new Date().toISOString(),
    indicators: indicators || [],
    summary: generateReportSummary(indicators || []),
    recommendations: generateRecommendations(indicators || [])
  };
  
  return {
    success: true,
    report,
    format
  };
}

function generateReportSummary(indicators: any[]): object {
  const summary: any = {
    total_indicators: indicators.length,
    avg_confidence: indicators.length > 0 ? 
      indicators.reduce((sum, ind) => sum + ind.confidence, 0) / indicators.length : 0
  };
  
  // Categorize indicators by type
  const categories = ['oxygen', 'temperature', 'salinity', 'productivity', 'composite'];
  categories.forEach(category => {
    const categoryIndicators = indicators.filter(ind => 
      ind.indicator_type.includes(category.substring(0, 4))
    );
    
    if (categoryIndicators.length > 0) {
      summary[`${category}_status`] = {
        indicator_count: categoryIndicators.length,
        avg_value: categoryIndicators.reduce((sum, ind) => sum + ind.value, 0) / categoryIndicators.length,
        latest_update: Math.max(...categoryIndicators.map(ind => new Date(ind.computed_at).getTime()))
      };
    }
  });
  
  return summary;
}

function generateRecommendations(indicators: any[]): string[] {
  const recommendations = [];
  
  // Oxygen-based recommendations
  const oxygenIndicators = indicators.filter(ind => ind.indicator_type.includes('oxygen') || ind.indicator_type.includes('hypoxia'));
  if (oxygenIndicators.length > 0) {
    const hypoxiaRisk = oxygenIndicators.find(ind => ind.indicator_type === 'hypoxia_risk');
    if (hypoxiaRisk && hypoxiaRisk.value > 0.3) {
      recommendations.push('High hypoxia risk detected. Consider enhanced monitoring and potential management interventions.');
    }
    
    const oxygenIndex = oxygenIndicators.find(ind => ind.indicator_type === 'baltic_oxygen_index');
    if (oxygenIndex && oxygenIndex.value < 0.4) {
      recommendations.push('Low oxygen levels observed. Investigate potential sources of eutrophication.');
    }
  }
  
  // Temperature recommendations
  const tempIndicators = indicators.filter(ind => ind.indicator_type.includes('temp'));
  if (tempIndicators.length > 0) {
    const tempAnomaly = tempIndicators.find(ind => ind.indicator_type === 'surface_temp_anomaly');
    if (tempAnomaly && Math.abs(tempAnomaly.value) > 3) {
      recommendations.push(`Significant temperature anomaly detected (${tempAnomaly.value.toFixed(1)}°C). Monitor for ecosystem impacts.`);
    }
  }
  
  // Ecosystem health recommendations
  const healthIndicators = indicators.filter(ind => ind.indicator_type.includes('ecosystem_health'));
  if (healthIndicators.length > 0) {
    const health = healthIndicators[0];
    if (health.value < 0.4) {
      recommendations.push('Poor ecosystem health indicated. Comprehensive assessment and management action recommended.');
    } else if (health.value > 0.8) {
      recommendations.push('Excellent ecosystem health maintained. Continue current monitoring and protection measures.');
    }
  }
  
  if (recommendations.length === 0) {
    recommendations.push('No immediate concerns identified. Continue regular monitoring.');
  }
  
  return recommendations;
}

async function forecastIndicators(params: any) {
  // Simplified forecasting - in production would use proper time series models
  const { indicator_type, region, forecast_days = 7 } = params;
  
  // Get historical data
  const { data: history } = await getIndicatorHistory(indicator_type, region, 30);
  
  if (!history.success || history.data.length < 5) {
    return {
      success: false,
      message: 'Insufficient historical data for forecasting'
    };
  }
  
  const values = history.data.map((d: any) => d.value);
  const trend = calculateSimpleTrend(values);
  
  // Generate forecast points
  const forecasts = [];
  const baseDate = new Date();
  
  for (let i = 1; i <= forecast_days; i++) {
    const forecastDate = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
    const forecastValue = values[values.length - 1] + (trend * i);
    
    forecasts.push({
      date: forecastDate.toISOString().split('T')[0],
      forecast_value: Math.max(0, forecastValue), // Ensure non-negative
      confidence: Math.max(0.1, 0.8 - (i * 0.1)) // Decreasing confidence over time
    });
  }
  
  return {
    success: true,
    indicator_type,
    region,
    forecast_days,
    forecasts,
    methodology: 'Simple linear trend extrapolation',
    base_period: history.data.length,
    trend_strength: Math.abs(trend)
  };
}

function calculateSimpleTrend(values: number[]): number {
  if (values.length < 2) return 0;
  
  // Simple linear regression
  const n = values.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = values.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * values[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);
  
  return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
}