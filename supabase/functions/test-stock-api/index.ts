import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Test API function started - v5');

  try {
    // Debug: Log all environment variables that start with TWELVE
    const allEnvVars = Deno.env.toObject();
    const twelveVars = Object.keys(allEnvVars).filter(key => key.includes('TWELVE'));
    console.log('Available TWELVE variables:', twelveVars);
    
    const apiKey = Deno.env.get('TWELVE_DATA_API_KEY');
    console.log('API Key status:', apiKey ? `Found (${apiKey.substring(0, 8)}...)` : 'Not found');
    
    if (!apiKey) {
      console.error('TWELVE_DATA_API_KEY not found in environment');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'API key not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Simple test with AAPL
    console.log('Making API request to Twelve Data...');
    const testUrl = `https://api.twelvedata.com/quote?symbol=AAPL&apikey=${apiKey}`;
    
    const response = await fetch(testUrl);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      console.error('HTTP error:', response.status, response.statusText);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `HTTP ${response.status}: ${response.statusText}` 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'API test successful',
      data: data,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Test function error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Function error: ${error.message}`,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});