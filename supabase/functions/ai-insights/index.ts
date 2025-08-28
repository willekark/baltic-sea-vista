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
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { data, analysisType }: AnalysisRequest = await req.json();

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

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const analysis = aiResponse.choices[0].message.content;

    console.log('AI Analysis completed for type:', analysisType);

    return new Response(JSON.stringify({ 
      analysis,
      analysisType,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-insights function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});