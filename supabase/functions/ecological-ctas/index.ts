import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CTARule {
  id: string;
  priority: number;
  when: {
    conditions: Array<{
      metric: string;
      operator: string;
      value: any;
    }>;
    logic?: 'AND' | 'OR';
  };
  then: {
    title: string;
    description: string;
    estimated_impact: string;
    actions: string[];
    evidence_metrics: string[];
    timeframe: string;
  };
}

interface GeneratedCTA {
  title: string;
  description: string;
  priority: number;
  estimatedImpact: string;
  triggeredByMetrics: string[];
  triggerRules: any;
  actions: string[];
  evidenceMetrics: string[];
  timeframe: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const entityType = url.searchParams.get('entityType') || 'municipality';
    const entityId = url.searchParams.get('entityId');

    if (!entityId) {
      return new Response(
        JSON.stringify({ error: 'entityId parameter required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating CTAs for ${entityType}:${entityId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current period
    const now = new Date();
    const year = now.getFullYear();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = quarter * 3;
    const periodStart = `${year}-${startMonth.toString().padStart(2, '0')}-01`;
    const periodEnd = `${year}-${endMonth.toString().padStart(2, '0')}-${new Date(year, endMonth, 0).getDate()}`;

    // Fetch latest ecological metrics
    console.log('Fetching ecological metrics for CTA generation...');
    const { data: metricsData, error: metricsError } = await supabase
      .from('ecological_metrics')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .gte('period_start', periodStart)
      .lte('period_end', periodEnd);

    if (metricsError) {
      console.error('Error fetching metrics:', metricsError);
    }

    // Generate mock metrics if none exist
    const metrics = metricsData?.length ? metricsData : generateMockMetrics();
    
    // Convert to metric map for easy lookup
    const metricMap = metrics.reduce((acc: any, m: any) => {
      acc[m.metric_name] = m.value;
      return acc;
    }, {});

    // Load CTA rules and evaluate them
    const rules = getCTARules();
    const generatedCTAs: GeneratedCTA[] = [];

    for (const rule of rules) {
      if (evaluateRule(rule, metricMap)) {
        generatedCTAs.push({
          title: rule.then.title,
          description: rule.then.description,
          priority: rule.priority,
          estimatedImpact: rule.then.estimated_impact,
          triggeredByMetrics: rule.when.conditions.map(c => c.metric),
          triggerRules: rule.when,
          actions: rule.then.actions,
          evidenceMetrics: rule.then.evidence_metrics,
          timeframe: rule.then.timeframe
        });
      }
    }

    // Sort by priority (1 = highest)
    generatedCTAs.sort((a, b) => a.priority - b.priority);

    // Store CTAs in database
    for (const cta of generatedCTAs) {
      await supabase
        .from('ecological_ctas')
        .upsert({
          entity_type: entityType,
          entity_id: entityId,
          period_start: periodStart,
          period_end: periodEnd,
          title: cta.title,
          description: cta.description,
          priority: cta.priority,
          estimated_impact: cta.estimatedImpact,
          triggered_by_metrics: cta.triggeredByMetrics,
          trigger_rules: cta.triggerRules,
          actions: cta.actions,
          evidence_metrics: cta.evidenceMetrics
        });
    }

    return new Response(JSON.stringify({
      success: true,
      data: generatedCTAs,
      metadata: {
        entityType,
        entityId,
        period: { start: periodStart, end: periodEnd },
        rulesEvaluated: rules.length,
        ctasGenerated: generatedCTAs.length,
        generatedAt: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in ecological-ctas function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generateMockMetrics() {
  return [
    { metric_name: 'chl_a_anomaly', value: 1.8 }, // High - triggers nutrient reduction
    { metric_name: 'secchi_anomaly', value: -1.2 }, // Poor clarity
    { metric_name: 'do_hypoxia_days', value: 12 }, // High - triggers oxygen restoration
    { metric_name: 'hab_prob_summer', value: 0.35 }, // Moderate HAB risk
    { metric_name: 'bathing_excellent_pct', value: 45 }, // Low - triggers bathing water improvement
    { metric_name: 'uwwtd_compliance', value: 75 }, // Below optimal
    { metric_name: 'tertiary_np_flag', value: 0 }, // No tertiary treatment
    { metric_name: 'surge_exceedance_72h', value: 0.45 }, // High flood risk
    { metric_name: 'has_adaptation_plan', value: 0 }, // No adaptation plan
    { metric_name: 'frameworks_participation', value: 1 }, // Low participation
    { metric_name: 'helcom_trend_3y', value: 'stable' }
  ];
}

function getCTARules(): CTARule[] {
  return [
    {
      id: "reduce_nutrient_loads",
      priority: 1,
      when: {
        conditions: [
          { metric: "chl_a_anomaly", operator: ">", value: 1.5 },
          { metric: "secchi_anomaly", operator: "<", value: -1.0 }
        ],
        logic: "OR"
      },
      then: {
        title: "Reduce Nutrient Loads",
        description: "High chlorophyll and poor water clarity indicate excess nutrients",
        estimated_impact: "High",
        actions: [
          "Upgrade municipal WWTP with tertiary N/P removal; apply for national grants",
          "Construct treatment wetlands and stormwater retention basins",
          "Strengthen agricultural buffer strips and runoff management in catchment",
          "Implement smart stormwater controls to reduce CSO events"
        ],
        evidence_metrics: ["uwwtd_compliance", "bathing_excellent_pct", "nutrient_proxy"],
        timeframe: "2-5 years"
      }
    },
    {
      id: "restore_oxygen_levels",
      priority: 1,
      when: {
        conditions: [
          { metric: "do_hypoxia_days", operator: ">", value: 10 }
        ]
      },
      then: {
        title: "Restore Coastal Habitats & Cut Oxygen Demand",
        description: "Frequent hypoxia events threaten marine ecosystems",
        estimated_impact: "High",
        actions: [
          "Seagrass restoration and blue-carbon projects",
          "Reduce organic loading from wastewater and runoff",
          "Create oxygen-boosting coastal wetlands",
          "Monitor and manage algal bloom hotspots"
        ],
        evidence_metrics: ["do_hypoxia_days", "hab_prob_summer"],
        timeframe: "3-7 years"
      }
    },
    {
      id: "improve_wastewater_treatment",
      priority: 2,
      when: {
        conditions: [
          { metric: "uwwtd_compliance", operator: "<", value: 80 },
          { metric: "tertiary_np_flag", operator: "=", value: 0 }
        ],
        logic: "OR"
      },
      then: {
        title: "Upgrade Wastewater Treatment",
        description: "Non-compliant or inadequate wastewater treatment",
        estimated_impact: "Medium",
        actions: [
          "Retrofit existing plants with advanced nutrient removal",
          "Regular maintenance and compliance monitoring",
          "Consider regional plant consolidation for efficiency",
          "Implement source separation for industrial discharges"
        ],
        evidence_metrics: ["uwwtd_compliance", "tertiary_np_flag", "bathing_excellent_pct"],
        timeframe: "1-3 years"
      }
    },
    {
      id: "enhance_bathing_water_quality",
      priority: 2,
      when: {
        conditions: [
          { metric: "bathing_excellent_pct", operator: "<", value: 60 }
        ]
      },
      then: {
        title: "Enhance Bathing Water Quality",
        description: "Too few bathing sites achieve 'Excellent' rating",
        estimated_impact: "Medium",
        actions: [
          "Identify and control pollution sources near bathing areas",
          "Install UV disinfection or other advanced treatment",
          "Improve stormwater management in coastal catchments",
          "Regular monitoring and public communication"
        ],
        evidence_metrics: ["bathing_excellent_pct", "uwwtd_compliance"],
        timeframe: "1-2 years"
      }
    },
    {
      id: "coastal_resilience_planning",
      priority: 1,
      when: {
        conditions: [
          { metric: "surge_exceedance_72h", operator: ">", value: 0.4 },
          { metric: "has_adaptation_plan", operator: "=", value: 0 }
        ],
        logic: "AND"
      },
      then: {
        title: "Develop Coastal Resilience Strategy",
        description: "High flood risk without adaptation planning",
        estimated_impact: "High",
        actions: [
          "Develop municipal climate adaptation plan",
          "Nature-based solutions: dunes, berms, floodable parks",
          "Early-warning systems linked to surge forecasts",
          "Zoning restrictions in flood-prone areas"
        ],
        evidence_metrics: ["surge_exceedance_72h", "has_adaptation_plan"],
        timeframe: "1-2 years"
      }
    },
    {
      id: "join_sustainability_frameworks",
      priority: 3,
      when: {
        conditions: [
          { metric: "frameworks_participation", operator: "<", value: 2 }
        ]
      },
      then: {
        title: "Join International Sustainability Frameworks",
        description: "Limited participation in global sustainability initiatives",
        estimated_impact: "Low",
        actions: [
          "Join CDP Cities program for climate reporting",
          "Develop SECAP (Sustainable Energy & Climate Action Plan)",
          "Sign EU Green City Accord",
          "Pursue ISO 37120 sustainable city certification"
        ],
        evidence_metrics: ["frameworks_participation"],
        timeframe: "0.5-1 year"
      }
    }
  ];
}

function evaluateRule(rule: CTARule, metricMap: Record<string, any>): boolean {
  const results = rule.when.conditions.map(condition => {
    const metricValue = metricMap[condition.metric];
    if (metricValue === undefined) return false;
    
    switch (condition.operator) {
      case '>':
        return metricValue > condition.value;
      case '<':
        return metricValue < condition.value;
      case '=':
        return metricValue === condition.value;
      case '>=':
        return metricValue >= condition.value;
      case '<=':
        return metricValue <= condition.value;
      default:
        return false;
    }
  });
  
  if (rule.when.logic === 'OR') {
    return results.some(r => r);
  } else {
    return results.every(r => r);
  }
}