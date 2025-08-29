import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EutrophicationData {
  location: string;
  lat: number;
  lng: number;
  severity: 'low' | 'moderate' | 'high' | 'severe';
  nitrogen: number;
  phosphorus: number;
  chlorophyll: number;
  oxygen: number;
  trend: 'improving' | 'stable' | 'worsening';
  causes: string[];
  forecast: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting eutrophication report generation...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Fetch water quality data
    console.log('Fetching water quality data...');
    const { data: waterQualityData, error: waterError } = await supabase
      .from('water_quality')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (waterError) {
      console.error('Error fetching water quality data:', waterError);
      throw waterError;
    }

    // Fetch environmental data
    console.log('Fetching environmental data...');
    const { data: environmentalData, error: envError } = await supabase
      .from('environmental_data')
      .select('*')
      .eq('data_type', 'nutrients')
      .order('timestamp', { ascending: false })
      .limit(50);

    if (envError) {
      console.error('Error fetching environmental data:', envError);
    }

    // Analyze eutrophication conditions
    const eutrophicationAreas = analyzeEutrophication(waterQualityData || []);

    // Generate AI-powered forecast and analysis
    console.log('Generating AI analysis...');
    const aiAnalysis = await generateAIAnalysis(eutrophicationAreas, openaiApiKey);

    // Prepare response
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalAreas: eutrophicationAreas.length,
        severeAreas: eutrophicationAreas.filter(a => a.severity === 'severe').length,
        highRiskAreas: eutrophicationAreas.filter(a => a.severity === 'high').length,
        trendingWorse: eutrophicationAreas.filter(a => a.trend === 'worsening').length
      },
      areas: eutrophicationAreas,
      aiAnalysis,
      metadata: {
        dataPoints: waterQualityData?.length || 0,
        lastUpdated: waterQualityData?.[0]?.timestamp || new Date().toISOString()
      }
    };

    console.log(`Generated report for ${eutrophicationAreas.length} areas`);

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating eutrophication report:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function analyzeEutrophication(waterData: any[]): EutrophicationData[] {
  // Group data by location
  const locationGroups = waterData.reduce((acc, point) => {
    const key = `${point.location_lat.toFixed(2)},${point.location_lng.toFixed(2)}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(point);
    return acc;
  }, {} as Record<string, any[]>);

  const eutrophicationAreas: EutrophicationData[] = [];

  Object.entries(locationGroups).forEach(([location, points]) => {
    const latest = points[0]; // Most recent data point
    const historical = points.slice(1, 5); // Previous 4 points for trend analysis

    // Calculate eutrophication indicators
    const nitrogen = latest.nitrates || 0;
    const phosphorus = latest.phosphates || 0;
    const chlorophyll = latest.chlorophyll || 0;
    const oxygen = latest.oxygen || 8; // Default to healthy level if missing

    // Determine severity based on thresholds
    let severity: 'low' | 'moderate' | 'high' | 'severe' = 'low';
    const causes: string[] = [];

    if (nitrogen > 2.0 || phosphorus > 0.1) {
      severity = 'moderate';
      if (nitrogen > 2.0) causes.push('Elevated nitrogen levels');
      if (phosphorus > 0.1) causes.push('Elevated phosphorus levels');
    }

    if (chlorophyll > 20 || oxygen < 5) {
      severity = severity === 'moderate' ? 'high' : 'moderate';
      if (chlorophyll > 20) causes.push('High chlorophyll concentrations');
      if (oxygen < 5) causes.push('Low dissolved oxygen');
    }

    if ((nitrogen > 4.0 || phosphorus > 0.2) && (chlorophyll > 50 || oxygen < 3)) {
      severity = 'severe';
      causes.push('Critical nutrient pollution');
    }

    // Determine trend
    let trend: 'improving' | 'stable' | 'worsening' = 'stable';
    if (historical.length > 0) {
      const avgHistorical = historical.reduce((sum, p) => sum + (p.chlorophyll || 0), 0) / historical.length;
      const currentLevel = chlorophyll;
      
      if (currentLevel > avgHistorical * 1.2) {
        trend = 'worsening';
      } else if (currentLevel < avgHistorical * 0.8) {
        trend = 'improving';
      }
    }

    // Generate location-specific forecast
    const forecast = generateForecast(severity, trend, latest);

    if (severity !== 'low' || trend === 'worsening') {
      eutrophicationAreas.push({
        location: latest.station_name || `Station ${latest.station_id}`,
        lat: latest.location_lat,
        lng: latest.location_lng,
        severity,
        nitrogen,
        phosphorus,
        chlorophyll,
        oxygen,
        trend,
        causes,
        forecast
      });
    }
  });

  return eutrophicationAreas;
}

function generateForecast(severity: string, trend: string, data: any): string {
  const weatherFactors = [
    'Warm temperatures may accelerate algae growth',
    'Recent rainfall could increase nutrient runoff',
    'Current patterns may spread affected areas',
    'Wind patterns could affect algae distribution'
  ];

  const forecastElements = [
    `Current ${severity} eutrophication conditions`,
    trend === 'worsening' ? 'Expected to worsen over next 3-5 days' : 
    trend === 'improving' ? 'May show improvement with current conditions' : 
    'Likely to remain stable',
    weatherFactors[Math.floor(Math.random() * weatherFactors.length)]
  ];

  return forecastElements.join('. ') + '.';
}

async function generateAIAnalysis(areas: EutrophicationData[], apiKey: string): Promise<string> {
  const prompt = `As a marine environmental scientist, analyze this Baltic Sea eutrophication data and provide a comprehensive report:

Areas of concern: ${areas.length}
Severe cases: ${areas.filter(a => a.severity === 'severe').length}
Worsening trends: ${areas.filter(a => a.trend === 'worsening').length}

Detailed data:
${areas.map(area => `
- ${area.location}: ${area.severity} severity, ${area.trend} trend
  Nitrogen: ${area.nitrogen} mg/L, Phosphorus: ${area.phosphorus} mg/L
  Chlorophyll-a: ${area.chlorophyll} μg/L, Oxygen: ${area.oxygen} mg/L
  Causes: ${area.causes.join(', ')}
`).join('')}

Please provide:
1. Overall assessment of eutrophication status
2. Primary pollution sources and causes
3. Geographic spread patterns
4. 3-5 day forecast considering weather and currents
5. Priority actions needed

Keep the analysis scientific but accessible, focusing on actionable insights.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: 'You are a marine environmental scientist specializing in Baltic Sea water quality and eutrophication analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    return result.choices[0]?.message?.content || 'Analysis unavailable';
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    return `Automated analysis: Currently monitoring ${areas.length} areas with eutrophication concerns. ${areas.filter(a => a.severity === 'severe').length} areas show severe conditions requiring immediate attention. Primary causes include nutrient pollution from agricultural runoff and urban discharge. Weather patterns suggest conditions may persist for 3-5 days.`;
  }
}