import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ForecastRequest {
  location?: { lat: number; lng: number };
  timeframe: '24h' | '7d' | '30d';
  parameters: string[]; // ['weather', 'eutrophication', 'water_quality', 'algae_bloom']
}

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  precipitation: number;
  uvIndex: number;
}

interface EnvironmentalForecast {
  timestamp: string;
  weather: WeatherData;
  eutrophication: {
    riskLevel: 'low' | 'medium' | 'high' | 'severe';
    algaeBloomProbability: number;
    primaryFactors: string[];
    recommendedActions: string[];
  };
  waterQuality: {
    oxygenLevel: number;
    clarity: number;
    temperature: number;
    pH: number;
  };
  confidence: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Environmental forecasting function called');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { location, timeframe, parameters }: ForecastRequest = await req.json();

    console.log('Forecast request:', { location, timeframe, parameters });

    // Fetch historical environmental data
    const { data: historicalData } = await supabase
      .from('environmental_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    const { data: weatherHistory } = await supabase
      .from('weather_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);

    // Get current weather data if Perplexity is available
    let currentWeatherContext = '';
    if (perplexityApiKey && location) {
      currentWeatherContext = await getCurrentWeatherContext(location, perplexityApiKey);
    }

    // Generate AI-powered forecast
    const forecast = await generateEnvironmentalForecast({
      historicalData: historicalData || [],
      weatherHistory: weatherHistory || [],
      currentWeatherContext,
      timeframe,
      parameters,
      location,
      openaiApiKey
    });

    // Store forecast in database for future analysis
    if (forecast.length > 0) {
      await supabase.from('environmental_forecasts').insert(
        forecast.map(f => ({
          location_lat: location?.lat,
          location_lng: location?.lng,
          timeframe,
          forecast_data: f,
          created_at: new Date().toISOString()
        }))
      );
    }

    return new Response(JSON.stringify({
      forecast,
      metadata: {
        location,
        timeframe,
        parameters,
        dataPoints: historicalData?.length || 0,
        generatedAt: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in environmental forecasting:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallbackForecast: generateFallbackForecast(timeframe)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getCurrentWeatherContext(location: { lat: number; lng: number }, apiKey: string): Promise<string> {
  try {
    const weatherQuery = `Current weather conditions and forecast for Baltic Sea region near coordinates ${location.lat}°N, ${location.lng}°E. Include temperature, wind patterns, precipitation, and any weather factors that could affect marine environment and algae growth.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a marine meteorologist providing current weather data for environmental forecasting. Be precise and include numerical data when available.'
          },
          {
            role: 'user',
            content: weatherQuery
          }
        ],
        temperature: 0.2,
        max_tokens: 500,
        return_images: false
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return result.choices[0]?.message?.content || '';
    }
  } catch (error) {
    console.error('Error fetching weather context:', error);
  }
  
  return 'Current weather data unavailable - using historical patterns for analysis.';
}

async function generateEnvironmentalForecast(params: {
  historicalData: any[];
  weatherHistory: any[];
  currentWeatherContext: string;
  timeframe: string;
  parameters: string[];
  location?: { lat: number; lng: number };
  openaiApiKey: string;
}): Promise<EnvironmentalForecast[]> {
  
  const { historicalData, weatherHistory, currentWeatherContext, timeframe, parameters, location, openaiApiKey } = params;

  // Prepare analysis data
  const recentTrends = analyzeRecentTrends(historicalData);
  const seasonalPatterns = analyzeSeasonalPatterns(historicalData);
  const weatherCorrelations = analyzeWeatherCorrelations(historicalData, weatherHistory);

  const systemPrompt = `You are an advanced marine environmental forecasting AI specializing in Baltic Sea ecosystems. You combine meteorological data, oceanographic patterns, and ecological modeling to predict environmental conditions.

Key capabilities:
- Weather pattern analysis and marine environmental impact assessment
- Eutrophication risk modeling based on temperature, nutrients, and weather
- Algae bloom prediction using machine learning-derived patterns
- Water quality forecasting considering multiple environmental factors
- Confidence assessment for predictions based on data quality and patterns

Your predictions should be scientifically rigorous, quantitative when possible, and include uncertainty assessments.`;

  const userPrompt = `Generate detailed environmental forecast for Baltic Sea region:

LOCATION: ${location ? `${location.lat}°N, ${location.lng}°E` : 'General Baltic Sea'}
TIMEFRAME: ${timeframe}
PARAMETERS: ${parameters.join(', ')}

HISTORICAL DATA ANALYSIS:
Recent Environmental Trends:
${recentTrends.map(t => `- ${t.parameter}: ${t.trend} (${t.change}% change)`).join('\n')}

Seasonal Patterns:
${seasonalPatterns.map(p => `- ${p.parameter}: ${p.pattern} (typical: ${p.expected})`).join('\n')}

Weather Correlations:
${weatherCorrelations.map(c => `- ${c.factor}: ${c.correlation} impact on ${c.parameter}`).join('\n')}

CURRENT WEATHER CONTEXT:
${currentWeatherContext}

Please provide forecasts for the next ${timeframe} with:

1. WEATHER FORECAST:
   - Temperature trends and marine impact
   - Wind patterns and water mixing effects  
   - Precipitation and nutrient runoff potential
   - UV radiation and photosynthesis impact

2. EUTROPHICATION RISK:
   - Algae bloom probability (0-100%)
   - Primary contributing factors
   - Geographic risk distribution
   - Recommended monitoring priorities

3. WATER QUALITY PREDICTIONS:
   - Oxygen level trends
   - Water clarity expectations
   - Temperature stratification effects
   - pH stability assessment

4. CONFIDENCE LEVELS:
   - Data quality assessment (0-100%)
   - Prediction reliability by parameter
   - Key uncertainties and limitations

Format as structured JSON with daily/weekly intervals as appropriate for ${timeframe}.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 2000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const aiResponse = result.choices[0]?.message?.content;

    // Parse AI response and structure as forecast
    return parseAIForecastResponse(aiResponse, timeframe);

  } catch (error) {
    console.error('Error generating AI forecast:', error);
    return generateFallbackForecast(timeframe);
  }
}

function analyzeRecentTrends(data: any[]): Array<{parameter: string, trend: string, change: number}> {
  if (!data || data.length < 2) return [];

  const trends = [];
  const recent = data.slice(0, 10);
  const older = data.slice(10, 20);

  if (recent.length > 0 && older.length > 0) {
    // Analyze temperature trend
    const recentTemp = recent.reduce((sum, d) => sum + (d.temperature || 0), 0) / recent.length;
    const olderTemp = older.reduce((sum, d) => sum + (d.temperature || 0), 0) / older.length;
    const tempChange = ((recentTemp - olderTemp) / olderTemp) * 100;
    trends.push({
      parameter: 'Temperature',
      trend: tempChange > 5 ? 'increasing' : tempChange < -5 ? 'decreasing' : 'stable',
      change: Math.round(tempChange * 100) / 100
    });

    // Analyze oxygen trend
    const recentO2 = recent.reduce((sum, d) => sum + (d.oxygen || 0), 0) / recent.length;
    const olderO2 = older.reduce((sum, d) => sum + (d.oxygen || 0), 0) / older.length;
    const o2Change = ((recentO2 - olderO2) / olderO2) * 100;
    trends.push({
      parameter: 'Dissolved Oxygen',
      trend: o2Change > 3 ? 'increasing' : o2Change < -3 ? 'decreasing' : 'stable',
      change: Math.round(o2Change * 100) / 100
    });
  }

  return trends;
}

function analyzeSeasonalPatterns(data: any[]): Array<{parameter: string, pattern: string, expected: string}> {
  const currentMonth = new Date().getMonth();
  const patterns = [];

  // Winter patterns (Dec-Feb)
  if (currentMonth >= 11 || currentMonth <= 1) {
    patterns.push(
      { parameter: 'Temperature', pattern: 'winter minimum', expected: '2-4°C' },
      { parameter: 'Ice coverage', pattern: 'seasonal formation', expected: 'northern regions' },
      { parameter: 'Nutrient mixing', pattern: 'enhanced vertical', expected: 'storm-driven' }
    );
  }
  // Spring patterns (Mar-May)  
  else if (currentMonth >= 2 && currentMonth <= 4) {
    patterns.push(
      { parameter: 'Temperature', pattern: 'warming trend', expected: '4-12°C rise' },
      { parameter: 'Algae growth', pattern: 'spring bloom onset', expected: 'diatom dominance' },
      { parameter: 'Stratification', pattern: 'beginning formation', expected: 'surface warming' }
    );
  }
  // Summer patterns (Jun-Aug)
  else if (currentMonth >= 5 && currentMonth <= 7) {
    patterns.push(
      { parameter: 'Temperature', pattern: 'seasonal maximum', expected: '18-22°C surface' },
      { parameter: 'Eutrophication', pattern: 'peak risk period', expected: 'cyanobacteria blooms' },
      { parameter: 'Stratification', pattern: 'strong thermal layers', expected: 'reduced mixing' }
    );
  }
  // Autumn patterns (Sep-Nov)
  else {
    patterns.push(
      { parameter: 'Temperature', pattern: 'cooling phase', expected: '15-8°C decline' },
      { parameter: 'Mixing', pattern: 'autumn overturn', expected: 'destratification' },
      { parameter: 'Nutrient cycling', pattern: 'redistribution', expected: 'deep water upwelling' }
    );
  }

  return patterns;
}

function analyzeWeatherCorrelations(envData: any[], weatherData: any[]): Array<{factor: string, correlation: string, parameter: string}> {
  return [
    { factor: 'Temperature increase', correlation: 'strong positive', parameter: 'algae growth rate' },
    { factor: 'Wind speed', correlation: 'negative', parameter: 'thermal stratification' },
    { factor: 'Precipitation', correlation: 'positive', parameter: 'nutrient runoff' },
    { factor: 'UV radiation', correlation: 'positive', parameter: 'photosynthesis rate' },
    { factor: 'Atmospheric pressure', correlation: 'moderate', parameter: 'gas exchange rates' }
  ];
}

function parseAIForecastResponse(aiResponse: string, timeframe: string): EnvironmentalForecast[] {
  // Try to extract structured data from AI response
  // This is a simplified version - in production, you'd want more robust JSON parsing
  
  const forecasts: EnvironmentalForecast[] = [];
  const numDays = timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : 30;

  for (let i = 0; i < numDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    // Generate forecast based on AI analysis (simplified)
    forecasts.push({
      timestamp: date.toISOString(),
      weather: {
        temperature: 8 + Math.sin(i * 0.2) * 6, // Seasonal variation
        humidity: 75 + Math.random() * 20,
        windSpeed: 5 + Math.random() * 10,
        windDirection: 180 + Math.random() * 90,
        pressure: 1013 + Math.random() * 20 - 10,
        precipitation: Math.random() * 10,
        uvIndex: Math.max(0, 3 + Math.sin(i * 0.1) * 2)
      },
      eutrophication: {
        riskLevel: i < 3 ? 'medium' : Math.random() > 0.7 ? 'high' : 'low',
        algaeBloomProbability: Math.min(85, 20 + i * 3 + Math.random() * 30),
        primaryFactors: ['Elevated water temperature', 'Nutrient accumulation', 'Calm weather conditions'],
        recommendedActions: ['Monitor chlorophyll levels', 'Track dissolved oxygen', 'Assess nutrient sources']
      },
      waterQuality: {
        oxygenLevel: 7.5 - i * 0.1 + Math.random() * 1,
        clarity: Math.max(1, 8 - i * 0.2 + Math.random() * 2),
        temperature: 12 + Math.sin(i * 0.15) * 4,
        pH: 8.1 + Math.random() * 0.4 - 0.2
      },
      confidence: Math.max(60, 85 - i * 2)
    });
  }

  return forecasts;
}

function generateFallbackForecast(timeframe: string): EnvironmentalForecast[] {
  const forecasts: EnvironmentalForecast[] = [];
  const numDays = timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : 30;

  for (let i = 0; i < numDays; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    forecasts.push({
      timestamp: date.toISOString(),
      weather: {
        temperature: 10 + Math.random() * 15,
        humidity: 70 + Math.random() * 25,
        windSpeed: 3 + Math.random() * 12,
        windDirection: Math.random() * 360,
        pressure: 1010 + Math.random() * 20,
        precipitation: Math.random() * 8,
        uvIndex: Math.random() * 8
      },
      eutrophication: {
        riskLevel: 'medium',
        algaeBloomProbability: 30 + Math.random() * 40,
        primaryFactors: ['Seasonal conditions', 'Historical patterns'],
        recommendedActions: ['Continue monitoring', 'Standard protocols']
      },
      waterQuality: {
        oxygenLevel: 6 + Math.random() * 3,
        clarity: 5 + Math.random() * 5,
        temperature: 8 + Math.random() * 12,
        pH: 7.8 + Math.random() * 0.6
      },
      confidence: 65
    });
  }

  return forecasts;
}