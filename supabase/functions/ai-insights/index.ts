import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  data: Array<{
    indicator: string;
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    status: 'excellent' | 'good' | 'warning' | 'critical';
  }>;
  analysisType: 'patterns' | 'predictions' | 'anomalies' | 'insights';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('AI Insights function called');
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured. Please add your OpenAI API key in the Supabase project settings.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data, analysisType }: AnalysisRequest = await req.json();
    console.log('Analysis request:', { analysisType, dataLength: data?.length });

    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error('Invalid or empty data provided');
      return new Response(JSON.stringify({ 
        error: 'No data provided for analysis' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompts = {
      patterns: "You are an expert marine environmental data analyst. Analyze the provided Baltic Sea monitoring data to identify patterns, correlations, and trends. Focus on environmental relationships and ecosystem health indicators.",
      predictions: "You are a predictive analytics expert for marine ecosystems. Based on current Baltic Sea data trends, provide forecasts and predictions for the next 30-90 days. Include confidence levels and key factors affecting predictions.",
      anomalies: "You are an anomaly detection specialist for marine monitoring systems. Identify unusual patterns, outliers, or concerning deviations in the Baltic Sea environmental data that might indicate ecological issues.",
      insights: "You are a marine ecosystem expert. Provide actionable insights and recommendations based on the Baltic Sea monitoring data. Focus on conservation, policy recommendations, and ecosystem management."
    };

    const userPrompt = `
    Baltic Sea Environmental Data:
    ${data.map(item => 
      `- ${item.indicator}: ${item.value} (${item.change}% change, trend: ${item.trend}, status: ${item.status})`
    ).join('\n')}

    Please provide a comprehensive analysis focusing on ${analysisType}. Structure your response with:
    1. Key findings (3-5 bullet points)
    2. Detailed analysis
    3. Specific recommendations or predictions
    4. Risk assessment if applicable

    Keep the response scientific but accessible, suitable for environmental managers and policymakers.
    `;

    console.log('Making OpenAI API request...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompts[analysisType] },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.3
      }),
    });

    console.log('OpenAI API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const aiResponse = await response.json();
    
    if (!aiResponse.choices || !aiResponse.choices[0] || !aiResponse.choices[0].message) {
      console.error('Invalid OpenAI response:', aiResponse);
      throw new Error('Invalid response from OpenAI API');
    }
    
    const analysis = aiResponse.choices[0].message.content;

    console.log('AI Analysis completed successfully for type:', analysisType);

    return new Response(JSON.stringify({ 
      analysis,
      analysisType,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-insights function:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const statusCode = errorMessage.includes('OpenAI API key not configured') ? 500 : 
                      errorMessage.includes('No data provided') ? 400 : 500;
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      timestamp: new Date().toISOString(),
      help: 'Check that your OpenAI API key is properly configured in Supabase Edge Function Secrets'
    }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});