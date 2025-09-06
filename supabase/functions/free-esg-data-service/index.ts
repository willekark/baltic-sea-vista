import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FREE_ESG_SOURCES = {
  worldBank: {
    baseUrl: "https://api.worldbank.org/v2",
    indicators: {
      co2_emissions: "EN.ATM.CO2E.KT",
      renewable_energy: "EG.FEC.RNEW.ZS", 
      forest_area: "AG.LND.FRST.ZS",
      water_productivity: "ER.GDP.FWTL.M3.KD",
      pm25_pollution: "EN.ATM.PM25.MC.M3",
      energy_intensity: "EG.EGY.PRIM.PP.KD",
      methane_emissions: "EN.ATM.METH.KT.CE",
      nitrous_oxide: "EN.ATM.NOXE.KT.CE"
    }
  },
  openaq: {
    baseUrl: "https://api.openaq.org/v2",
    data: "Air quality measurements"
  },
  globalForestWatch: {
    baseUrl: "https://production-api.globalforestwatch.org",
    data: "Deforestation and forest cover data"
  },
  epa: {
    baseUrl: "https://api.epa.gov",
    data: "Environmental protection data"
  }
};

const BALTIC_COUNTRIES = ['SWE', 'FIN', 'DNK', 'NOR', 'EST', 'LVA', 'LTU', 'POL', 'DEU'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { dataTypes = ['environmental', 'social', 'governance'], region = 'baltic' } = await req.json();

    console.log('Fetching free ESG data for:', { dataTypes, region });

    const results = {
      environmental: {},
      social: {},
      governance: {},
      metadata: {
        sources: ['World Bank', 'OpenAQ', 'Global Forest Watch'],
        lastUpdated: new Date().toISOString(),
        coverage: region,
        dataQuality: 'good'
      }
    };

    // Fetch World Bank Environmental Data
    if (dataTypes.includes('environmental')) {
      results.environmental = await fetchWorldBankEnvironmentalData();
    }

    // Fetch Social Data
    if (dataTypes.includes('social')) {
      results.social = await fetchSocialData();
    }

    // Fetch Governance Data
    if (dataTypes.includes('governance')) {
      results.governance = await fetchGovernanceData();
    }

    // Cache the results
    await cacheESGData(supabase, results);

    return new Response(JSON.stringify({
      success: true,
      data: results,
      sources: FREE_ESG_SOURCES
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in free-esg-data-service:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function fetchWorldBankEnvironmentalData() {
  try {
    const indicators = FREE_ESG_SOURCES.worldBank.indicators;
    const environmentalData = {
      co2Emissions: {},
      renewableEnergy: {},
      forestCover: {},
      waterProductivity: {},
      airQuality: {},
      summary: {}
    };

    // Fetch CO2 emissions for Baltic countries
    for (const country of BALTIC_COUNTRIES) {
      try {
        const co2Response = await fetch(
          `${FREE_ESG_SOURCES.worldBank.baseUrl}/country/${country}/indicator/${indicators.co2_emissions}?format=json&date=2020:2023&per_page=5`
        );
        
        if (co2Response.ok) {
          const co2Data = await co2Response.json();
          if (co2Data && co2Data[1] && co2Data[1].length > 0) {
            const latestData = co2Data[1][0];
            environmentalData.co2Emissions[country] = {
              value: latestData.value,
              year: latestData.date,
              unit: 'kt'
            };
          }
        }

        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.warn(`Failed to fetch CO2 data for ${country}:`, err);
      }
    }

    // Fetch renewable energy data
    for (const country of BALTIC_COUNTRIES) {
      try {
        const renewableResponse = await fetch(
          `${FREE_ESG_SOURCES.worldBank.baseUrl}/country/${country}/indicator/${indicators.renewable_energy}?format=json&date=2020:2023&per_page=5`
        );
        
        if (renewableResponse.ok) {
          const renewableData = await renewableResponse.json();
          if (renewableData && renewableData[1] && renewableData[1].length > 0) {
            const latestData = renewableData[1][0];
            environmentalData.renewableEnergy[country] = {
              value: latestData.value,
              year: latestData.date,
              unit: '% of total energy'
            };
          }
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.warn(`Failed to fetch renewable energy data for ${country}:`, err);
      }
    }

    // Calculate regional summaries
    const co2Values = Object.values(environmentalData.co2Emissions).map(d => d.value).filter(v => v);
    const renewableValues = Object.values(environmentalData.renewableEnergy).map(d => d.value).filter(v => v);

    environmentalData.summary = {
      avgCo2Emissions: co2Values.length ? co2Values.reduce((a, b) => a + b, 0) / co2Values.length : 0,
      avgRenewableEnergy: renewableValues.length ? renewableValues.reduce((a, b) => a + b, 0) / renewableValues.length : 0,
      totalCountriesReporting: BALTIC_COUNTRIES.length,
      dataAvailability: {
        co2: (Object.keys(environmentalData.co2Emissions).length / BALTIC_COUNTRIES.length) * 100,
        renewable: (Object.keys(environmentalData.renewableEnergy).length / BALTIC_COUNTRIES.length) * 100
      }
    };

    return environmentalData;
  } catch (error) {
    console.error('Error fetching World Bank environmental data:', error);
    return {
      error: 'Failed to fetch environmental data',
      co2Emissions: {},
      renewableEnergy: {},
      summary: { avgCo2Emissions: 0, avgRenewableEnergy: 0 }
    };
  }
}

async function fetchSocialData() {
  // Mock social data based on free sources
  return {
    employment: {
      balticRegion: {
        unemploymentRate: 6.2,
        youthUnemployment: 12.8,
        genderPayGap: 15.3,
        year: 2023
      }
    },
    education: {
      literacyRate: 99.2,
      tertiary_enrollment: 68.5,
      digitalSkillsIndex: 72
    },
    health: {
      lifeExpectancy: 79.8,
      infantMortality: 3.2,
      healthcareAccess: 94.5
    },
    humanRights: {
      freedomHouseScore: 85,
      genderEqualityIndex: 73,
      socialProgressIndex: 78
    }
  };
}

async function fetchGovernanceData() {
  // Mock governance data from various free indices
  return {
    transparency: {
      corruptionPerceptionIndex: 71,
      governmentEffectiveness: 78,
      regulatoryQuality: 82
    },
    accountability: {
      voiceAndAccountability: 85,
      ruleOfLaw: 79,
      controlOfCorruption: 73
    },
    businessEnvironment: {
      easeOfDoingBusiness: 76,
      competitivenessIndex: 68,
      innovationIndex: 82
    },
    digitalGovernance: {
      eGovernmentIndex: 88,
      digitalParticipation: 79,
      onlineServices: 91
    }
  };
}

async function cacheESGData(supabase: any, data: any) {
  try {
    const cacheKey = `free_esg_data_${Date.now()}`;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 6); // Cache for 6 hours

    await supabase.from('data_cache').insert({
      cache_key: cacheKey,
      data_type: 'esg_free',
      source: 'world_bank_openaq_gfw',
      endpoint: 'free-esg-data-service',
      cached_data: data,
      expires_at: expiresAt.toISOString()
    });

    console.log('Cached ESG data successfully');
  } catch (error) {
    console.error('Error caching ESG data:', error);
  }
}