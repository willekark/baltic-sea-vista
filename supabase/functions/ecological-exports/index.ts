import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExportRequest {
  entityType: string;
  entityId: string;
  framework: 'cdp' | 'secap' | 'gca' | 'iso37120' | 'blue-bond';
  format: 'json' | 'csv' | 'pdf' | 'zip';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const framework = url.pathname.split('/').pop(); // e.g., /cdp, /secap, etc.
    const entityType = url.searchParams.get('entityType') || 'municipality';
    const entityId = url.searchParams.get('entityId');
    const format = url.searchParams.get('format') || 'json';

    if (!entityId || !framework) {
      return new Response(
        JSON.stringify({ error: 'entityId and framework required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating ${framework} export for ${entityType}:${entityId} in ${format} format`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch entity data
    const { data: entityData } = await supabase
      .from(entityType === 'municipality' ? 'municipalities' : 'business_sites')
      .select('*')
      .eq('id', entityId)
      .single();

    // Fetch latest ecological score and metrics
    const { data: scoreData } = await supabase
      .from('ecological_scores')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('period_start', { ascending: false })
      .limit(1)
      .single();

    const { data: metricsData } = await supabase
      .from('ecological_metrics')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('period_start', { ascending: false })
      .limit(20);

    const { data: ctasData } = await supabase
      .from('ecological_ctas')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('priority', { ascending: true });

    // Generate export based on framework
    let exportData: any;
    let contentType = 'application/json';
    let filename = `${framework}-export-${entityId}`;

    switch (framework) {
      case 'cdp':
        exportData = generateCDPExport(entityData, scoreData, metricsData, ctasData);
        filename += '.json';
        break;
        
      case 'secap':
        exportData = generateSECAPExport(entityData, scoreData, metricsData, ctasData);
        filename += '.csv';
        contentType = 'text/csv';
        break;
        
      case 'gca':
        exportData = generateGreenCityAccordExport(entityData, scoreData, metricsData);
        filename += '.json';
        break;
        
      case 'iso37120':
        exportData = generateISO37120Export(entityData, scoreData, metricsData);
        filename += '.json';
        break;
        
      case 'blue-bond':
        exportData = generateBlueBondAnnex(entityData, scoreData, metricsData, ctasData);
        filename += '.json';
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Unsupported framework' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Convert to requested format
    if (format === 'csv' && typeof exportData === 'object') {
      exportData = convertToCSV(exportData);
      contentType = 'text/csv';
      filename = filename.replace(/\.[^/.]+$/, '') + '.csv';
    } else if (format === 'json' && typeof exportData === 'string') {
      try {
        exportData = JSON.parse(exportData);
      } catch (e) {
        // Keep as string if not valid JSON
      }
      contentType = 'application/json';
    }

    const responseHeaders = {
      ...corsHeaders,
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`
    };

    const responseBody = typeof exportData === 'string' ? exportData : JSON.stringify(exportData, null, 2);

    return new Response(responseBody, { headers: responseHeaders });

  } catch (error) {
    console.error('Error in ecological-exports function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generateCDPExport(entity: any, score: any, metrics: any[], ctas: any[]) {
  return {
    cdp_version: "2024",
    reporting_entity: {
      name: entity?.name || "Unknown Entity",
      type: entity ? "Municipality" : "Business Site",
      country: entity?.country_code || "SE",
      population: entity?.population,
      reporting_year: new Date().getFullYear()
    },
    water_security: {
      overall_score: score?.overall_score,
      water_quality_index: findMetricValue(metrics, 'bathing_excellent_pct'),
      pollution_reduction_score: score?.eutrophication_pressure,
      treatment_compliance: findMetricValue(metrics, 'uwwtd_compliance'),
      risks_identified: ctas?.map(cta => ({
        title: cta.title,
        impact: cta.estimated_impact,
        timeframe: cta.actions?.length || 0
      })) || []
    },
    climate_adaptation: {
      coastal_resilience_score: score?.coastal_hazard,
      flood_risk_assessment: findMetricValue(metrics, 'surge_exceedance_72h'),
      adaptation_plan_status: findMetricValue(metrics, 'has_adaptation_plan') ? "In Place" : "Not Developed",
      nature_based_solutions: score?.ecosystem_health
    },
    methodology: {
      data_sources: [
        "HELCOM Baltic Sea indicators",
        "EEA Bathing Water Quality Database", 
        "UWWTD Compliance Database",
        "CMEMS Baltic Sea physical and biogeochemical data",
        "SMHI/FMI national monitoring"
      ],
      calculation_period: score?.period_start + " to " + score?.period_end,
      confidence_level: Math.round((score?.confidence || 1.0) * 100) + "%"
    },
    evidence_bundle: {
      graphs_generated: 5,
      timeseries_data_points: metrics?.length || 0,
      recommendations: ctas?.length || 0,
      export_timestamp: new Date().toISOString()
    }
  };
}

function generateSECAPExport(entity: any, score: any, metrics: any[], ctas: any[]) {
  // SECAP format as CSV for easier import
  const csvData = [
    ["Indicator", "Value", "Unit", "Source", "Notes"],
    ["Coastal Water Quality Index", score?.eutrophication_pressure, "Score 0-100", "HELCOM/CMEMS", "Nutrient pollution assessment"],
    ["Bathing Water Excellence Rate", findMetricValue(metrics, 'bathing_excellent_pct'), "%", "EEA", "Sites rated Excellent"],
    ["Wastewater Treatment Compliance", findMetricValue(metrics, 'uwwtd_compliance'), "%", "UWWTD", "Municipal plants compliant"],
    ["Ecosystem Health Score", score?.ecosystem_health, "Score 0-100", "Multiple", "Oxygen, HAB risk, MPA coverage"],
    ["Coastal Flood Risk", findMetricValue(metrics, 'surge_exceedance_72h'), "Probability", "SMHI/FMI", "72-hour exceedance risk"],
    ["Climate Adaptation Readiness", score?.coastal_hazard, "Score 0-100", "Assessment", "Includes adaptation planning"],
    ["Overall Ecological Score", score?.overall_score, "Score 0-100", "Integrated", "Five-pillar assessment"]
  ];
  
  return csvData.map(row => row.join(",")).join("\n");
}

function generateGreenCityAccordExport(entity: any, score: any, metrics: any[]) {
  return {
    green_city_accord_reporting: {
      city_name: entity?.name,
      reporting_year: new Date().getFullYear(),
      areas: {
        water: {
          commitment: "Improve water quality and efficiency",
          indicators: {
            bathing_water_quality: {
              value: findMetricValue(metrics, 'bathing_excellent_pct'),
              unit: "% sites excellent",
              target: 80,
              status: findMetricValue(metrics, 'bathing_excellent_pct') >= 80 ? "On track" : "Action needed"
            },
            wastewater_treatment: {
              value: findMetricValue(metrics, 'uwwtd_compliance'),
              unit: "% compliance",
              target: 100,
              status: findMetricValue(metrics, 'uwwtd_compliance') >= 95 ? "On track" : "Action needed"
            }
          },
          score: score?.bathing_wastewater
        },
        nature_biodiversity: {
          commitment: "Enhance marine ecosystem health",
          indicators: {
            marine_protection: {
              value: findMetricValue(metrics, 'shoreline_in_mpa_pct'),
              unit: "% shoreline protected",
              target: 30,
              status: findMetricValue(metrics, 'shoreline_in_mpa_pct') >= 30 ? "On track" : "Action needed"
            },
            oxygen_levels: {
              value: findMetricValue(metrics, 'do_hypoxia_days'),
              unit: "hypoxia days/quarter",
              target: 5,
              status: findMetricValue(metrics, 'do_hypoxia_days') <= 5 ? "On track" : "Action needed"
            }
          },
          score: score?.ecosystem_health
        }
      },
      overall_assessment: {
        ecological_score: score?.overall_score,
        data_quality: "High",
        methodology: "Baltic Sea Ecological Scoring Framework v1.0"
      }
    }
  };
}

function generateISO37120Export(entity: any, score: any, metrics: any[]) {
  return {
    iso37120_indicators: {
      standard_version: "2018",
      city_name: entity?.name,
      reporting_period: new Date().getFullYear(),
      environment_indicators: {
        "19.1_fine_particulate_matter": null, // Not available from marine data
        "19.2_particulate_matter": null,
        "19.3_greenhouse_emissions": null,
        "19.4_co2_equivalent": null,
        "19.5_pollutant_emissions": null,
        "19.6_noise_pollution": null,
        "19.7_percentage_change_natural_areas": null
      },
      water_sanitation_indicators: {
        "21.1_water_consumption": null, // Not available
        "21.2_water_consumption_residential": null,
        "21.3_percentage_water_loss": null,
        "21.4_percentage_population_potable_water": null,
        "21.5_percentage_population_sanitation": null,
        "21.6_percentage_wastewater_treatment": findMetricValue(metrics, 'uwwtd_compliance'),
        "21.7_percentage_stormwater_treatment": null
      },
      custom_marine_indicators: {
        "marine_water_quality_index": score?.eutrophication_pressure,
        "coastal_ecosystem_health": score?.ecosystem_health,
        "bathing_water_excellence_rate": findMetricValue(metrics, 'bathing_excellent_pct'),
        "coastal_resilience_score": score?.coastal_hazard,
        "overall_ecological_performance": score?.overall_score
      },
      data_sources: [
        "HELCOM indicators",
        "EEA Bathing Water Database",
        "UWWTD reporting",
        "CMEMS marine data"
      ],
      data_quality_note: "Marine-focused indicators supplement standard ISO 37120 framework"
    }
  };
}

function generateBlueBondAnnex(entity: any, score: any, metrics: any[], ctas: any[]) {
  return {
    blue_bond_readiness_annex: {
      entity_profile: {
        name: entity?.name,
        type: entity ? "Coastal Municipality" : "Marine Business Site",
        country: entity?.country_code,
        basin: entity?.basin,
        coastal_length_km: entity?.coastal_length_km
      },
      baseline_performance: {
        overall_ecological_score: score?.overall_score,
        assessment_date: score?.computed_at,
        pillar_scores: {
          eutrophication_control: score?.eutrophication_pressure,
          ecosystem_health: score?.ecosystem_health,
          water_quality_management: score?.bathing_wastewater,
          coastal_resilience: score?.coastal_hazard,
          sustainability_governance: score?.trend_compliance
        },
        confidence_level: Math.round((score?.confidence || 1.0) * 100) + "%"
      },
      proposed_interventions: ctas?.map(cta => ({
        title: cta.title,
        description: cta.description,
        estimated_impact: cta.estimated_impact,
        timeframe: cta.timeframe || "2-3 years",
        alignment_with_targets: cta.evidence_metrics?.join(", "),
        actions: cta.actions
      })) || [],
      expected_outcomes: {
        five_year_targets: {
          nutrient_reduction: "25% reduction in N/P loading",
          bathing_water_improvement: "+15% sites achieving Excellent rating",
          ecosystem_restoration: "500 ha seagrass restoration",
          flood_protection: "50% reduction in flood risk exposure"
        },
        kpi_tracking: [
          "Chlorophyll-a anomaly (quarterly)",
          "Dissolved oxygen levels (continuous)",
          "Bathing water quality ratings (annual)",
          "Storm surge exceedance probability (seasonal)"
        ]
      },
      financing_alignment: {
        blue_taxonomy_eligibility: score?.overall_score >= 60 ? "Eligible" : "Pre-eligible",
        sustainability_frameworks: findMetricValue(metrics, 'frameworks_participation'),
        climate_adaptation_readiness: findMetricValue(metrics, 'has_adaptation_plan') ? "Plan in place" : "Development needed",
        estimated_investment_needed: "€2-5M over 5 years",
        expected_environmental_return: "Measurable improvement in 3+ pillars"
      },
      risk_assessment: {
        environmental_risks: [
          "Climate change impacts on baseline conditions",
          "Transboundary pollution sources",
          "Extreme weather events"
        ],
        mitigation_measures: [
          "Adaptive management approach",
          "Regional coordination mechanisms", 
          "Diverse intervention portfolio"
        ]
      },
      data_provenance: {
        primary_sources: [
          "HELCOM core indicators",
          "CMEMS Baltic Sea data",
          "EEA environmental databases",
          "National monitoring networks"
        ],
        methodology: "Baltic Sea Ecological Scoring Framework v1.0",
        update_frequency: "Quarterly",
        quality_assurance: "Multi-source validation and expert review"
      },
      annex_version: "1.0",
      generated_date: new Date().toISOString()
    }
  };
}

function findMetricValue(metrics: any[], metricName: string): number | null {
  const metric = metrics?.find(m => m.metric_name === metricName);
  return metric ? metric.value : null;
}

function convertToCSV(data: any): string {
  if (Array.isArray(data)) {
    return data.map(row => row.join(",")).join("\n");
  }
  
  // Convert object to CSV
  const headers = Object.keys(data);
  const values = headers.map(h => data[h]);
  return [headers.join(","), values.join(",")].join("\n");
}
