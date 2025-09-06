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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const { tickers } = await req.json();
    console.log('AI Stock Verification called for tickers:', tickers);

    // Create a prompt for AI to get current stock prices
    const prompt = `Please provide the current stock prices and key metrics for the following Baltic Sea region companies. For each company, provide:
1. Current stock price in local currency
2. Today's change (absolute and percentage)
3. Market cap
4. Exchange
5. Last trading session info

Companies to check:
- A.P. Møller-Mærsk (MAERSK-B.CO) - Copenhagen
- Hamburger Hafen und Logistik AG (HHLA.DE) - XETRA
- Ørsted A/S (ORSTED.CO) - Copenhagen
- TORM plc (TORM.CO) - Copenhagen
- Hapag-Lloyd AG (HAPAG.DE) - XETRA

Format your response as JSON with the structure:
{
  "stocks": [
    {
      "ticker": "MAERSK-B.CO",
      "company": "A.P. Møller-Mærsk",
      "currentPrice": "12580.00",
      "currency": "DKK",
      "change": "+145.00",
      "changePercent": "+1.17%",
      "marketCap": "47.2B",
      "exchange": "Copenhagen",
      "lastUpdate": "current trading session info",
      "confidence": "high/medium/low"
    }
  ],
  "timestamp": "current timestamp",
  "note": "any relevant market notes"
}

Please ensure accuracy and indicate confidence level for each price.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a financial data analyst with access to current market information. Provide accurate, up-to-date stock prices for European companies. Always indicate your confidence level in the data accuracy.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI Response:', aiResponse);

    // Try to parse JSON from AI response
    let parsedData;
    try {
      // Extract JSON from the response (in case AI adds extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Return raw AI response if JSON parsing fails
      parsedData = {
        rawResponse: aiResponse,
        error: 'Failed to parse structured data'
      };
    }

    return new Response(JSON.stringify({ 
      success: true,
      aiVerification: parsedData,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI stock verification:', error);
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