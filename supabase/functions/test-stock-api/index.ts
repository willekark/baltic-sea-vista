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

  try {
    const apiKey = Deno.env.get('TWELVE_DATA_API_KEY');
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey?.length || 0);
    
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'TWELVE_DATA_API_KEY is not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Test with Apple (AAPL) - a guaranteed working symbol
    const testUrl = `https://api.twelvedata.com/quote?symbol=AAPL&apikey=${apiKey}`;
    console.log('Testing API with AAPL...');
    
    const response = await fetch(testUrl);
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));

    // Test with a European stock (BMW)
    const bmwUrl = `https://api.twelvedata.com/quote?symbol=BMW.DEX&apikey=${apiKey}`;
    console.log('Testing API with BMW...');
    
    const bmwResponse = await fetch(bmwUrl);
    const bmwData = await bmwResponse.json();
    console.log('BMW Response data:', JSON.stringify(bmwData, null, 2));

    return new Response(JSON.stringify({ 
      success: true, 
      apiKeyStatus: 'Found',
      applTest: data,
      bmwTest: bmwData,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Test function error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});