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
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }

    const { stockData, analysisType = 'comprehensive' } = await req.json();
    
    if (!stockData || !Array.isArray(stockData)) {
      return new Response(
        JSON.stringify({ error: 'Stock data array is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Format stock data for analysis
    const stockSummary = stockData.map(stock => ({
      company: stock.company,
      ticker: stock.ticker,
      sector: stock.sector,
      price: stock.price,
      change: stock.change,
      changePercent: stock.changePercent,
      volume: stock.volume,
      currency: stock.currency
    }));

    const prompt = `As a senior investment analyst specializing in Baltic Sea region markets, analyze the following real-time stock data and provide strategic investment insights:

${JSON.stringify(stockSummary, null, 2)}

Please provide a ${analysisType} analysis covering:

1. **Market Overview**: Current market sentiment and trends in the Baltic Sea region
2. **Sector Analysis**: Performance evaluation by sector (shipping, energy, logistics, etc.)
3. **Individual Stock Assessment**: Key strengths and risks for each company
4. **Investment Recommendations**: Specific buy/hold/sell recommendations with rationale
5. **Risk Assessment**: Market, geopolitical, and sector-specific risks
6. **Strategic Opportunities**: Emerging trends and growth catalysts
7. **Portfolio Allocation**: Suggested weightings for a Baltic Sea focused portfolio

Format your response as structured investment-grade analysis suitable for strategic decision making. Include confidence levels for each recommendation.`;

    console.log('Sending request to Claude API...');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anthropicApiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', errorText);
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Claude API response received');

    const analysis = data.content[0].text;

    // Extract key metrics and recommendations
    const result = {
      analysis,
      summary: {
        analysisType,
        timestamp: new Date().toISOString(),
        stocksAnalyzed: stockData.length,
        totalMarketValue: stockData.reduce((sum: number, stock: any) => {
          const price = parseFloat(stock.price) || 0;
          const volume = parseInt(stock.volume) || 0;
          return sum + (price * volume);
        }, 0),
        sectors: [...new Set(stockData.map((stock: any) => stock.sector))],
        averageChange: stockData.reduce((sum: number, stock: any) => {
          return sum + (parseFloat(stock.changePercent?.replace('%', '')) || 0);
        }, 0) / stockData.length
      },
      recommendations: {
        overallSentiment: extractSentiment(analysis),
        topPicks: extractTopPicks(analysis),
        riskLevel: extractRiskLevel(analysis)
      }
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in claude-investment-analysis:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to generate Claude investment analysis'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper functions to extract key insights
function extractSentiment(analysis: string): string {
  if (analysis.toLowerCase().includes('bullish') || analysis.toLowerCase().includes('positive')) {
    return 'Bullish';
  } else if (analysis.toLowerCase().includes('bearish') || analysis.toLowerCase().includes('negative')) {
    return 'Bearish';
  }
  return 'Neutral';
}

function extractTopPicks(analysis: string): string[] {
  // Simple extraction - look for buy recommendations
  const buyMatches = analysis.match(/(?:Buy|Strong Buy|Recommended?):\s*([A-Z]{2,5})/gi);
  return buyMatches?.map(match => match.split(':')[1]?.trim()) || [];
}

function extractRiskLevel(analysis: string): string {
  if (analysis.toLowerCase().includes('high risk') || analysis.toLowerCase().includes('volatile')) {
    return 'High';
  } else if (analysis.toLowerCase().includes('low risk') || analysis.toLowerCase().includes('stable')) {
    return 'Low';
  }
  return 'Medium';
}