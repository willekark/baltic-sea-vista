import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0"
import { parse } from "https://deno.land/std@0.206.0/yaml/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScoringConfig {
  pillars: Record<string, { weight: number; description: string }>;
  metrics: Record<string, {
    pillar: string;
    transform: string;
    weight_in_pillar: number;
    min?: number;
    max?: number;
    [key: string]: any;
  }>;
  transforms: Record<string, any>;
}

interface EcologicalScore {
  entityType: string;
  entityId: string;
  period: { start: string; end: string };
  overallScore: number;
  pillars: Record<string, number>;
  metrics: Record<string, {
    value: number;
    anomaly?: number;
    score: number;
    confidence: number;
    lastUpdate: string;
  }>;
  confidence: number;
  trend?: 'improving' | 'stable' | 'declining';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const entityType = url.searchParams.get('entityType') || 'municipality';
    const entityId = url.searchParams.get('entityId');
    const period = url.searchParams.get('period') || 'quarter';

    if (!entityId) {
      return new Response(
        JSON.stringify({ error: 'entityId parameter required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Computing ecological score for ${entityType}:${entityId}, period:${period}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Load scoring configuration
    const config = await loadScoringConfig();
    
    // Get current period dates
    const periodDates = getCurrentPeriod(period);
    
    // Fetch metrics for the entity
    console.log('Fetching ecological metrics...');
    const { data: metricsData, error: metricsError } = await supabase
      .from('ecological_metrics')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .gte('period_start', periodDates.start)
      .lte('period_end', periodDates.end);

    if (metricsError) {
      console.error('Error fetching metrics:', metricsError);
    }

    // Generate mock data if no real data exists (for demo)
    const metrics = metricsData?.length ? metricsData : await generateMockMetrics(entityType, entityId, periodDates);
    
    // Compute scores using the configuration
    const score = await computeEcologicalScore(config, metrics, entityType, entityId, periodDates);
    
    // Store computed score in database
    await storeComputedScore(supabase, score);
    
    // Return the score
    return new Response(JSON.stringify({
      success: true,
      data: score,
      metadata: {
        configVersion: 'v1.0',
        computedAt: new Date().toISOString(),
        period: periodDates,
        metricsCount: metrics.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in ecological-scoring function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function loadScoringConfig(): Promise<ScoringConfig> {
  // In production, this would load from a YAML file in storage
  // For now, return the configuration inline
  return {
    pillars: {
      eutrophication_pressure: { weight: 0.2, description: "Nutrient pollution and water clarity" },
      ecosystem_health: { weight: 0.2, description: "Oxygen levels and biodiversity protection" },
      bathing_wastewater: { weight: 0.2, description: "Bathing water quality and UWWTD compliance" },
      coastal_hazard: { weight: 0.2, description: "Resilience to sea level rise and storms" },
      trend_compliance: { weight: 0.2, description: "Multi-year trends and framework participation" }
    },
    metrics: {
      chl_a_anomaly: {
        pillar: "eutrophication_pressure",
        transform: "zscore_to_0_100",
        weight_in_pillar: 0.4
      },
      secchi_anomaly: {
        pillar: "eutrophication_pressure", 
        transform: "zscore_to_0_100",
        weight_in_pillar: 0.3
      },
      nutrient_proxy: {
        pillar: "eutrophication_pressure",
        transform: "zscore_to_0_100", 
        weight_in_pillar: 0.3
      },
      do_hypoxia_days: {
        pillar: "ecosystem_health",
        transform: "lower_is_better_minmax",
        min: 0,
        max: 30,
        weight_in_pillar: 0.4
      },
      hab_prob_summer: {
        pillar: "ecosystem_health",
        transform: "lower_is_better_minmax",
        min: 0,
        max: 1,
        weight_in_pillar: 0.3
      },
      shoreline_in_mpa_pct: {
        pillar: "ecosystem_health",
        transform: "higher_is_better_minmax",
        min: 0,
        max: 60,
        weight_in_pillar: 0.3
      },
      bathing_excellent_pct: {
        pillar: "bathing_wastewater",
        transform: "higher_is_better_minmax",
        min: 0,
        max: 100,
        weight_in_pillar: 0.4
      },
      uwwtd_compliance: {
        pillar: "bathing_wastewater",
        transform: "higher_is_better_minmax",
        min: 0,
        max: 100,
        weight_in_pillar: 0.3
      },
      tertiary_np_flag: {
        pillar: "bathing_wastewater",
        transform: "boolean_100_or_0",
        weight_in_pillar: 0.3
      },
      surge_exceedance_72h: {
        pillar: "coastal_hazard",
        transform: "lower_is_better_minmax",
        min: 0,
        max: 1,
        weight_in_pillar: 0.6
      },
      has_adaptation_plan: {
        pillar: "coastal_hazard",
        transform: "boolean_100_or_0",
        weight_in_pillar: 0.4
      },
      helcom_trend_3y: {
        pillar: "trend_compliance",
        transform: "trend_to_score",
        weight_in_pillar: 0.6
      },
      frameworks_participation: {
        pillar: "trend_compliance",
        transform: "sum_boolean_average",
        weight_in_pillar: 0.4
      }
    },
    transforms: {
      zscore_to_0_100: { formula: "max(0, min(100, 50 - 25 * zscore))" },
      lower_is_better_minmax: { formula: "100 * (max - value) / (max - min)" },
      higher_is_better_minmax: { formula: "100 * (value - min) / (max - min)" },
      boolean_100_or_0: { formula: "value ? 100 : 0" },
      trend_to_score: { 
        mapping: { improving: 100, stable: 70, declining: 30, unknown: 50 }
      },
      sum_boolean_average: { formula: "average of boolean flags * 100" }
    }
  };
}

function getCurrentPeriod(period: string): { start: string; end: string } {
  const now = new Date();
  const year = now.getFullYear();
  
  if (period === 'year') {
    return {
      start: `${year}-01-01`,
      end: `${year}-12-31`
    };
  } else {
    // Quarter
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = quarter * 3;
    return {
      start: `${year}-${startMonth.toString().padStart(2, '0')}-01`,
      end: `${year}-${endMonth.toString().padStart(2, '0')}-${new Date(year, endMonth, 0).getDate()}`
    };
  }
}

async function generateMockMetrics(entityType: string, entityId: string, period: { start: string; end: string }) {
  // Generate realistic mock data for demonstration
  const baseMetrics = [
    { name: 'chl_a_anomaly', value: 0.8, anomaly: 0.8, confidence: 0.9 },
    { name: 'secchi_anomaly', value: -0.5, anomaly: -0.5, confidence: 0.85 },
    { name: 'nutrient_proxy', value: 1.2, anomaly: 1.2, confidence: 0.8 },
    { name: 'do_hypoxia_days', value: 8, anomaly: null, confidence: 0.95 },
    { name: 'hab_prob_summer', value: 0.25, anomaly: null, confidence: 0.9 },
    { name: 'shoreline_in_mpa_pct', value: 35, anomaly: null, confidence: 1.0 },
    { name: 'bathing_excellent_pct', value: 72, anomaly: null, confidence: 0.95 },
    { name: 'uwwtd_compliance', value: 85, anomaly: null, confidence: 1.0 },
    { name: 'tertiary_np_flag', value: 1, anomaly: null, confidence: 1.0 },
    { name: 'surge_exceedance_72h', value: 0.15, anomaly: null, confidence: 0.8 },
    { name: 'has_adaptation_plan', value: 1, anomaly: null, confidence: 1.0 },
    { name: 'helcom_trend_3y', value: 'stable', anomaly: null, confidence: 0.9 },
    { name: 'frameworks_participation', value: 2, anomaly: null, confidence: 1.0 }
  ];

  return baseMetrics.map(metric => ({
    entity_type: entityType,
    entity_id: entityId,
    metric_name: metric.name,
    period_start: period.start,
    period_end: period.end,
    value: metric.value,
    anomaly_score: metric.anomaly,
    confidence: metric.confidence,
    data_source: 'mock_demo',
    basin: 'baltic_proper',
    last_updated: new Date().toISOString()
  }));
}

async function computeEcologicalScore(
  config: ScoringConfig,
  metrics: any[],
  entityType: string,
  entityId: string,
  period: { start: string; end: string }
): Promise<EcologicalScore> {
  
  const metricMap = metrics.reduce((acc, m) => {
    acc[m.metric_name] = m;
    return acc;
  }, {} as Record<string, any>);

  const pillarScores: Record<string, number> = {};
  const metricScores: Record<string, any> = {};
  let totalConfidence = 0;
  let metricCount = 0;

  // Compute scores for each pillar
  for (const [pillarName, pillarConfig] of Object.entries(config.pillars)) {
    const pillarMetrics = Object.entries(config.metrics).filter(([_, m]) => m.pillar === pillarName);
    
    let pillarScore = 0;
    let pillarWeight = 0;
    
    for (const [metricName, metricConfig] of pillarMetrics) {
      const metricData = metricMap[metricName];
      if (!metricData) continue;
      
      const score = transformMetricValue(metricData.value, metricConfig, metricData.anomaly_score);
      metricScores[metricName] = {
        value: metricData.value,
        anomaly: metricData.anomaly_score,
        score: score,
        confidence: metricData.confidence || 1.0,
        lastUpdate: metricData.last_updated
      };
      
      pillarScore += score * metricConfig.weight_in_pillar;
      pillarWeight += metricConfig.weight_in_pillar;
      totalConfidence += metricData.confidence || 1.0;
      metricCount++;
    }
    
    pillarScores[pillarName] = pillarWeight > 0 ? pillarScore / pillarWeight : 0;
  }

  // Compute overall score
  let overallScore = 0;
  for (const [pillarName, pillarScore] of Object.entries(pillarScores)) {
    overallScore += pillarScore * config.pillars[pillarName].weight;
  }

  return {
    entityType,
    entityId,
    period,
    overallScore: Math.round(overallScore * 10) / 10,
    pillars: Object.fromEntries(
      Object.entries(pillarScores).map(([k, v]) => [k, Math.round(v * 10) / 10])
    ),
    metrics: metricScores,
    confidence: metricCount > 0 ? totalConfidence / metricCount : 1.0,
    trend: 'stable' // Would be computed from historical data
  };
}

function transformMetricValue(value: any, config: any, anomaly?: number): number {
  const transform = config.transform;
  
  switch (transform) {
    case 'zscore_to_0_100':
      const zscore = anomaly || 0;
      return Math.max(0, Math.min(100, 50 - 25 * zscore));
      
    case 'lower_is_better_minmax':
      return Math.max(0, Math.min(100, 100 * (config.max - value) / (config.max - config.min)));
      
    case 'higher_is_better_minmax':
      return Math.max(0, Math.min(100, 100 * (value - config.min) / (config.max - config.min)));
      
    case 'boolean_100_or_0':
      return value ? 100 : 0;
      
    case 'trend_to_score':
      const mapping = { improving: 100, stable: 70, declining: 30, unknown: 50 };
      return mapping[value as keyof typeof mapping] || 50;
      
    case 'sum_boolean_average':
      // Assuming value is a count of true flags out of total
      return Math.min(100, (value / 4) * 100); // 4 frameworks max
      
    default:
      return value;
  }
}

async function storeComputedScore(supabase: any, score: EcologicalScore) {
  const { error } = await supabase
    .from('ecological_scores')
    .upsert({
      entity_type: score.entityType,
      entity_id: score.entityId,
      period_type: 'quarter',
      period_start: score.period.start,
      period_end: score.period.end,
      overall_score: score.overallScore,
      eutrophication_pressure: score.pillars.eutrophication_pressure,
      ecosystem_health: score.pillars.ecosystem_health,
      bathing_wastewater: score.pillars.bathing_wastewater,
      coastal_hazard: score.pillars.coastal_hazard,
      trend_compliance: score.pillars.trend_compliance,
      confidence: score.confidence,
      config_version: 'v1.0',
      computed_at: new Date().toISOString()
    });
    
  if (error) {
    console.error('Error storing computed score:', error);
  }
}