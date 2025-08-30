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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Seeding ecological data...');

    // Create sample municipalities
    const municipalities = [
      {
        id: 'stockholm',
        name: 'Stockholm Municipality',
        country_code: 'SE',
        basin: 'baltic_proper',
        population: 975551,
        coastal_length_km: 57.8,
        geometry: {
          type: 'Polygon',
          coordinates: [[[18.0686, 59.3293], [18.0686, 59.3393], [18.0786, 59.3393], [18.0786, 59.3293], [18.0686, 59.3293]]]
        }
      },
      {
        id: 'gothenburg',
        name: 'Gothenburg Municipality',
        country_code: 'SE',
        basin: 'kattegat',
        population: 583056,
        coastal_length_km: 32.4,
        geometry: {
          type: 'Polygon',
          coordinates: [[[11.9746, 57.7089], [11.9746, 57.7189], [11.9846, 57.7189], [11.9846, 57.7089], [11.9746, 57.7089]]]
        }
      },
      {
        id: 'malmo',
        name: 'Malmö Municipality',
        country_code: 'SE',
        basin: 'oresund',
        population: 347949,
        coastal_length_km: 21.3,
        geometry: {
          type: 'Polygon',
          coordinates: [[[13.0038, 55.6050], [13.0038, 55.6150], [13.0138, 55.6150], [13.0138, 55.6050], [13.0038, 55.6050]]]
        }
      },
      {
        id: 'helsinki',
        name: 'Helsinki Municipality',
        country_code: 'FI',
        basin: 'gulf_of_finland',
        population: 658864,
        coastal_length_km: 123.0,
        geometry: {
          type: 'Polygon',
          coordinates: [[[24.9384, 60.1699], [24.9384, 60.1799], [24.9484, 60.1799], [24.9484, 60.1699], [24.9384, 60.1699]]]
        }
      }
    ];

    // Upsert municipalities
    for (const municipality of municipalities) {
      const { error } = await supabase
        .from('municipalities')
        .upsert(municipality);
      
      if (error) {
        console.error('Error upserting municipality:', error);
      } else {
        console.log(`Upserted municipality: ${municipality.name}`);
      }
    }

    // Create sample bathing water sites
    const bathingSites = [
      {
        site_id: 'STO001',
        name: 'Långholmen Beach',
        municipality_id: 'stockholm',
        location_lat: 59.3169,
        location_lng: 18.0311,
        water_body_type: 'sea',
        status_2022: 'Excellent',
        status_2023: 'Excellent',
        status_2024: 'Good'
      },
      {
        site_id: 'GOT001',
        name: 'Näset Beach',
        municipality_id: 'gothenburg',
        location_lat: 57.6900,
        location_lng: 11.8543,
        water_body_type: 'sea',
        status_2022: 'Good',
        status_2023: 'Excellent',
        status_2024: 'Excellent'
      },
      {
        site_id: 'MAL001',
        name: 'Ribersborg Beach',
        municipality_id: 'malmo',
        location_lat: 55.5951,
        location_lng: 12.9543,
        water_body_type: 'sea',
        status_2022: 'Excellent',
        status_2023: 'Excellent',
        status_2024: 'Excellent'
      },
      {
        site_id: 'HEL001',
        name: 'Hietaniemi Beach',
        municipality_id: 'helsinki',
        location_lat: 60.1796,
        location_lng: 24.9161,
        water_body_type: 'sea',
        status_2022: 'Good',
        status_2023: 'Excellent',
        status_2024: 'Good'
      }
    ];

    for (const site of bathingSites) {
      const { error } = await supabase
        .from('bathing_water_sites')
        .upsert(site);
      
      if (error) {
        console.error('Error upserting bathing site:', error);
      }
    }

    // Create compliance flags for municipalities
    const complianceFlags = [
      {
        entity_id: 'stockholm',
        entity_type: 'municipality',
        cdp_participant: true,
        secap_participant: true,
        green_city_accord: true,
        iso37120_certified: false,
        has_adaptation_plan: true,
        adaptation_plan_year: 2022
      },
      {
        entity_id: 'gothenburg',
        entity_type: 'municipality',
        cdp_participant: true,
        secap_participant: false,
        green_city_accord: true,
        iso37120_certified: true,
        has_adaptation_plan: true,
        adaptation_plan_year: 2021
      },
      {
        entity_id: 'malmo',
        entity_type: 'municipality',
        cdp_participant: false,
        secap_participant: true,
        green_city_accord: false,
        iso37120_certified: false,
        has_adaptation_plan: false,
        adaptation_plan_year: null
      },
      {
        entity_id: 'helsinki',
        entity_type: 'municipality',
        cdp_participant: true,
        secap_participant: true,
        green_city_accord: true,
        iso37120_certified: true,
        has_adaptation_plan: true,
        adaptation_plan_year: 2020
      }
    ];

    for (const flags of complianceFlags) {
      const { error } = await supabase
        .from('entity_compliance_flags')
        .upsert(flags);
      
      if (error) {
        console.error('Error upserting compliance flags:', error);
      }
    }

    // Generate ecological metrics for each municipality
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;

    for (const municipality of municipalities) {
      const metrics = generateMunicipalityMetrics(municipality.id, municipality.basin);
      
      for (const metric of metrics) {
        const { error } = await supabase
          .from('ecological_metrics')
          .upsert({
            entity_type: 'municipality',
            entity_id: municipality.id,
            basin: municipality.basin,
            period_type: 'quarter',
            period_start: `${currentYear}-${(currentQuarter - 1) * 3 + 1}-01`,
            period_end: `${currentYear}-${currentQuarter * 3}-${new Date(currentYear, currentQuarter * 3, 0).getDate()}`,
            metric_name: metric.name,
            value: metric.value,
            anomaly_score: metric.anomaly || 0,
            confidence: metric.confidence || 0.8,
            data_source: metric.source,
            processing_method: metric.method || 'climatology_z_score'
          });
        
        if (error) {
          console.error('Error upserting metric:', error);
        }
      }
    }

    console.log('Ecological data seeding completed successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'Ecological data seeded successfully',
      municipalities: municipalities.length,
      bathingSites: bathingSites.length,
      complianceFlags: complianceFlags.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error seeding ecological data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function generateMunicipalityMetrics(municipalityId: string, basin: string) {
  // Generate realistic metrics based on municipality characteristics
  const baseMetrics = {
    stockholm: {
      chl_a_anomaly: 0.8,
      secchi_anomaly: -0.3,
      do_hypoxia_days: 5,
      hab_prob_summer: 0.15,
      bathing_excellent_pct: 85,
      uwwtd_compliance: 92,
      tertiary_np_flag: 1,
      surge_exceedance_72h: 0.25,
      has_adaptation_plan: 1,
      frameworks_participation: 3,
      helcom_trend_3y: 'improving'
    },
    gothenburg: {
      chl_a_anomaly: 1.2,
      secchi_anomaly: -0.7,
      do_hypoxia_days: 8,
      hab_prob_summer: 0.22,
      bathing_excellent_pct: 78,
      uwwtd_compliance: 88,
      tertiary_np_flag: 1,
      surge_exceedance_72h: 0.18,
      has_adaptation_plan: 1,
      frameworks_participation: 3,
      helcom_trend_3y: 'stable'
    },
    malmo: {
      chl_a_anomaly: 0.5,
      secchi_anomaly: 0.2,
      do_hypoxia_days: 3,
      hab_prob_summer: 0.08,
      bathing_excellent_pct: 95,
      uwwtd_compliance: 94,
      tertiary_np_flag: 1,
      surge_exceedance_72h: 0.12,
      has_adaptation_plan: 0,
      frameworks_participation: 1,
      helcom_trend_3y: 'improving'
    },
    helsinki: {
      chl_a_anomaly: 1.5,
      secchi_anomaly: -1.1,
      do_hypoxia_days: 15,
      hab_prob_summer: 0.38,
      bathing_excellent_pct: 72,
      uwwtd_compliance: 85,
      tertiary_np_flag: 0,
      surge_exceedance_72h: 0.35,
      has_adaptation_plan: 1,
      frameworks_participation: 4,
      helcom_trend_3y: 'declining'
    }
  }[municipalityId] || baseMetrics.stockholm;

  return [
    { name: 'chl_a_anomaly', value: baseMetrics.chl_a_anomaly, source: 'cmems.bgc.chla', anomaly: baseMetrics.chl_a_anomaly, confidence: 0.85 },
    { name: 'secchi_anomaly', value: baseMetrics.secchi_anomaly, source: 'derived.secchi', anomaly: baseMetrics.secchi_anomaly, confidence: 0.7 },
    { name: 'do_hypoxia_days', value: baseMetrics.do_hypoxia_days, source: 'derived.hypoxia_days_per_quarter', confidence: 0.8 },
    { name: 'hab_prob_summer', value: baseMetrics.hab_prob_summer, source: 'derived.hab_probability_jja', confidence: 0.75 },
    { name: 'bathing_excellent_pct', value: baseMetrics.bathing_excellent_pct, source: 'eea.bathing.excellent_pct', confidence: 0.95 },
    { name: 'uwwtd_compliance', value: baseMetrics.uwwtd_compliance, source: 'uwwtd.city_compliance_pct', confidence: 0.9 },
    { name: 'tertiary_np_flag', value: baseMetrics.tertiary_np_flag, source: 'uwwtd.tertiary_np', confidence: 1.0 },
    { name: 'surge_exceedance_72h', value: baseMetrics.surge_exceedance_72h, source: 'derived.surge_exceedance_probability', confidence: 0.8 },
    { name: 'has_adaptation_plan', value: baseMetrics.has_adaptation_plan, source: 'admin.flags.adaptation_plan', confidence: 1.0 },
    { name: 'frameworks_participation', value: baseMetrics.frameworks_participation, source: 'admin.flags.combined', confidence: 1.0 },
    { name: 'helcom_trend_3y', value: baseMetrics.helcom_trend_3y, source: 'derived.helcom_indicator_trend', confidence: 0.7 }
  ];
}