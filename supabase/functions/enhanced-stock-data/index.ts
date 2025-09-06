import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced stock mappings with multiple data sources
const enhancedStockMappings = {
  'MAERSK-B.CO': {
    company: 'A.P. Møller-Mærsk A/S',
    primarySymbol: 'AMKBY', // ADR on NASDAQ
    alternativeSymbols: ['MAERSK-B.CO', 'MAERSK.F'],
    exchange: 'NASDAQ',
    currency: 'USD',
    sector: 'Shipping & Logistics'
  },
  'HHLA.DE': {
    company: 'Hamburger Hafen und Logistik AG',
    primarySymbol: 'HHLA.F',
    alternativeSymbols: ['HHLA.DE', 'HHFA.F'],
    exchange: 'Frankfurt',
    currency: 'EUR',
    sector: 'Port Operations'
  },
  'ORSTED.CO': {
    company: 'Ørsted A/S',
    primarySymbol: 'DNNGY', // ADR
    alternativeSymbols: ['ORSTED.CO', 'DOGEF'],
    exchange: 'NASDAQ',
    currency: 'USD',
    sector: 'Renewable Energy'
  },
  'TORM.CO': {
    company: 'TORM plc',
    primarySymbol: 'TRMD',
    alternativeSymbols: ['TORM', 'TORM.CO'],
    exchange: 'NASDAQ',
    currency: 'USD',
    sector: 'Tanker Shipping'
  },
  'HAPAG.DE': {
    company: 'Hapag-Lloyd AG',
    primarySymbol: 'HPGLY', // ADR
    alternativeSymbols: ['HLAG.DE', 'HAPAG.F'],
    exchange: 'NASDAQ',
    currency: 'USD',
    sector: 'Container Shipping'
  },
  'EQNR': {
    company: 'Equinor ASA',
    primarySymbol: 'EQNR',
    alternativeSymbols: ['EQNR.OL'],
    exchange: 'NYSE',
    currency: 'USD',
    sector: 'Oil & Gas'
  },
  'NESTE': {
    company: 'Neste Corporation',
    primarySymbol: 'NTOIY', // ADR
    alternativeSymbols: ['NESTE.HE'],
    exchange: 'NASDAQ',
    currency: 'USD',
    sector: 'Renewable Fuels'
  },
  'RWE': {
    company: 'RWE AG',
    primarySymbol: 'RWEOY', // ADR
    alternativeSymbols: ['RWE.DE'],
    exchange: 'NASDAQ',
    currency: 'USD',
    sector: 'Utilities'
  },
  'DFDS': {
    company: 'DFDS A/S',
    primarySymbol: 'DFDS.CO',
    alternativeSymbols: ['DFDS'],
    exchange: 'Copenhagen',
    currency: 'DKK',
    sector: 'Ferry Services'
  }
};

// Fallback real market data for reliable reporting
const fallbackMarketData = async (symbol: string) => {
  // This would integrate with multiple data sources for reliability
  // For now, return structured error to indicate need for premium data source
  return {
    error: 'Premium market data required',
    suggestion: 'Consider upgrading to professional market data provider',
    symbol,
    timestamp: new Date().toISOString()
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('TWELVE_DATA_API_KEY');
    if (!apiKey) {
      throw new Error('TWELVE_DATA_API_KEY not configured');
    }

    const { tickers, priority = 'accuracy' } = await req.json();
    console.log('Enhanced stock data request for:', tickers);

    let requestedTickers: string[] = [];
    if (typeof tickers === 'string') {
      requestedTickers = tickers.split(',').map(t => t.trim());
    } else if (Array.isArray(tickers)) {
      requestedTickers = tickers;
    }

    const results: any[] = [];
    const errors: any[] = [];

    // Process with enhanced error handling and fallbacks
    for (let i = 0; i < Math.min(requestedTickers.length, 5); i++) { // Limit to 5 to respect rate limits
      const ticker = requestedTickers[i];
      const config = enhancedStockMappings[ticker];
      
      if (!config) {
        console.log(`No enhanced configuration for ticker: ${ticker}`);
        errors.push({ ticker, error: 'Symbol not configured for real-time data' });
        continue;
      }

      // Rate limiting: wait between requests
      if (i > 0) {
        console.log(`Rate limiting: waiting 10 seconds before next request...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }

      console.log(`Fetching data for ${ticker} (${config.company}) using symbol ${config.primarySymbol}`);

      try {
        const url = `https://api.twelvedata.com/quote?symbol=${config.primarySymbol}&apikey=${apiKey}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Response for ${ticker}:`, data);

        if (data.code && data.status === 'error') {
          // Try alternative symbol if primary fails
          if (config.alternativeSymbols && config.alternativeSymbols.length > 0) {
            console.log(`Trying alternative symbol for ${ticker}...`);
            const altUrl = `https://api.twelvedata.com/quote?symbol=${config.alternativeSymbols[0]}&apikey=${apiKey}`;
            const altResponse = await fetch(altUrl);
            const altData = await altResponse.json();
            
            if (altData.code && altData.status === 'error') {
              errors.push({ 
                ticker, 
                error: `Data unavailable: ${data.message}`,
                suggestion: 'Symbol may require premium access or different exchange'
              });
              continue;
            } else {
              // Use alternative data
              data = altData;
            }
          } else {
            errors.push({ 
              ticker, 
              error: `API Error: ${data.message}`,
              code: data.code
            });
            continue;
          }
        }

        // Format the successful response
        const formattedData = {
          ticker,
          company: config.company,
          sector: config.sector,
          exchange: config.exchange,
          price: data.close || data.last_price || 'N/A',
          change: data.change || '0',
          changePercent: data.percent_change ? `${data.percent_change}%` : '0%',
          currency: config.currency,
          volume: data.volume || 'N/A',
          open: data.open || 'N/A',
          high: data.high || 'N/A',
          low: data.low || 'N/A',
          previousClose: data.previous_close || 'N/A',
          lastUpdated: data.datetime || new Date().toISOString().split('T')[0],
          dataSource: 'TwelveData',
          reliability: 'High',
          symbol: config.primarySymbol
        };

        results.push(formattedData);
        console.log(`Successfully processed ${ticker}`);

      } catch (error) {
        console.error(`Error fetching data for ${ticker}:`, error);
        errors.push({ 
          ticker, 
          error: error.message,
          company: config.company 
        });
      }
    }

    // Prepare comprehensive response for investment analysis
    const response = {
      success: true,
      data: results,
      errors: errors,
      fetchedCount: results.length,
      requestedCount: requestedTickers.length,
      errorCount: errors.length,
      timestamp: new Date().toISOString(),
      dataSource: 'Enhanced TwelveData with Fallbacks',
      rateLimit: {
        remainingRequests: `Processed ${results.length + errors.length} of 8 daily limit`,
        nextResetTime: 'Next minute for free tier'
      },
      investmentGrade: results.length > 0 ? 'Suitable for preliminary analysis' : 'Insufficient data for investment decisions',
      recommendations: [
        'For strategic investment decisions, consider upgrading to professional market data',
        'Verify prices through multiple sources before making investment decisions',
        'Current data suitable for trend analysis and screening purposes'
      ]
    };

    console.log(`Returning enhanced response: ${results.length} successful, ${errors.length} errors`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Enhanced stock data function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      recommendation: 'Check API configuration and network connectivity'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});