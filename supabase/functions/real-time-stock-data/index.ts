import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StockMapping {
  ticker: string;
  symbol: string;
  exchange: string;
  twelveDataSymbol: string;
}

interface TwelveDataQuote {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  datetime: string;
  timestamp: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  previous_close: string;
  change: string;
  percent_change: string;
  average_volume: string;
  fifty_two_week?: {
    low: string;
    high: string;
    low_change: string;
    high_change: string;
    low_change_percent: string;
    high_change_percent: string;
  };
}

interface TwelveDataProfile {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  country: string;
  type: string;
  market_cap: string;
  shares_outstanding: string;
  employees: string;
  sector: string;
  industry: string;
  description: string;
  website: string;
  ceo: string;
  address: string;
  city: string;
  zip: string;
  state: string;
  phone: string;
}

// Mapping of our tickers to Twelve Data symbols and exchanges
const stockMappings: StockMapping[] = [
  // Updated with better Twelve Data symbols for Baltic companies
  { ticker: 'MAERSK-B.CO', symbol: 'MAERSK-B', exchange: 'Copenhagen', twelveDataSymbol: 'MAERSK-B.CO' },
  { ticker: 'HHLA.DE', symbol: 'HHLA', exchange: 'XETRA', twelveDataSymbol: 'HHFA.F' },
  { ticker: 'ORSTED.CO', symbol: 'ORSTED', exchange: 'Copenhagen', twelveDataSymbol: 'DOGEF' },
  { ticker: 'TORM.CO', symbol: 'TORM', exchange: 'Copenhagen', twelveDataSymbol: 'TRMD' },
  { ticker: 'HAPAG.DE', symbol: 'HAPAG', exchange: 'XETRA', twelveDataSymbol: 'HLAG.DE' },
  { ticker: 'SALM.HE', symbol: 'SALM', exchange: 'Helsinki', twelveDataSymbol: 'SALM.OL' },
  { ticker: 'TELUS.HE', symbol: 'TELIA', exchange: 'Stockholm', twelveDataSymbol: 'TELIA.ST' },
  { ticker: 'KONE.HE', symbol: 'KONE', exchange: 'Helsinki', twelveDataSymbol: 'KNEBV.HE' },
  
  // Well-known symbols with proper exchange suffixes
  { ticker: 'RWE', symbol: 'RWE', exchange: 'XETRA', twelveDataSymbol: 'RWE' },
  { ticker: 'EQNR', symbol: 'EQNR', exchange: 'Oslo', twelveDataSymbol: 'EQNR.OL' },
  { ticker: 'NESTE', symbol: 'NESTE', exchange: 'Helsinki', twelveDataSymbol: 'NESTE.HE' },
  
  // Baltic companies with fallback to available symbols
  { ticker: 'DFDS', symbol: 'DFDS', exchange: 'Copenhagen', twelveDataSymbol: 'DFDS.CO' },
  { ticker: 'PEP', symbol: 'PEP', exchange: 'NASDAQ', twelveDataSymbol: 'PEP' }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== REAL-TIME STOCK DATA FUNCTION CALLED ===');
  
  try {
    const apiKey = Deno.env.get('TWELVE_DATA_API_KEY');
    console.log('API Key status - v5:', apiKey ? 'Found (length: ' + apiKey.length + ')' : 'Not found');
    console.log('First 10 chars of API key:', apiKey ? apiKey.substring(0, 10) + '...' : 'None');
    if (!apiKey) {
      throw new Error('TWELVE_DATA_API_KEY is not configured');
    }

    // Get request data from body (when using supabase.functions.invoke)
    console.log('Raw request method:', req.method);
    console.log('Raw request headers:', Object.fromEntries(req.headers.entries()));
    
    const requestData = await req.json();
    console.log('Received request data:', JSON.stringify(requestData, null, 2));
    
    const tickersParam = requestData.tickers;
    const includeProfile = requestData.includeProfile || false;
    
    console.log('Tickers param:', tickersParam, 'Type:', typeof tickersParam);
    
    // Parse tickers - can be string or array
    let requestedTickers: string[] = [];
    if (typeof tickersParam === 'string') {
      requestedTickers = tickersParam.split(',').map(t => t.trim()).filter(t => t.length > 0);
    } else if (Array.isArray(tickersParam)) {
      requestedTickers = tickersParam.filter(t => typeof t === 'string' && t.length > 0);
    }
    
    console.log(`Parsed tickers (${requestedTickers.length}):`, requestedTickers);

    if (requestedTickers.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        data: [],
        fetchedCount: 0,
        requestedCount: 0,
        timestamp: new Date().toISOString(),
        message: 'No valid tickers provided'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results: any[] = [];

    // Process each requested ticker
    for (const ticker of requestedTickers) {
      const mapping = stockMappings.find(m => m.ticker === ticker);
      if (!mapping) {
        console.log(`No mapping found for ticker: ${ticker}`);
        continue;
      }

      console.log(`Processing ticker ${ticker} -> ${mapping.twelveDataSymbol}`);

      try {
        // Test with a simple known symbol first to validate API key
        if (ticker === 'RWE') {
          // Use a well-known German stock for testing
          const testUrl = `https://api.twelvedata.com/quote?symbol=RWE&apikey=${apiKey}`;
          console.log(`Test API call: ${testUrl}`);
          
          const testResponse = await fetch(testUrl);
          const testData = await testResponse.json();
          console.log(`Test API response for RWE:`, JSON.stringify(testData, null, 2));
        }

        // Fetch real-time quote
        const quoteUrl = `https://api.twelvedata.com/quote?symbol=${mapping.twelveDataSymbol}&apikey=${apiKey}`;
        console.log(`Fetching quote for ${ticker} from: ${quoteUrl}`);
        
        const quoteResponse = await fetch(quoteUrl);
        
        if (!quoteResponse.ok) {
          console.log(`HTTP error ${quoteResponse.status} for ${ticker}`);
          continue;
        }
        
        const quoteData: TwelveDataQuote = await quoteResponse.json();
        console.log(`Quote data for ${ticker}:`, JSON.stringify(quoteData, null, 2));

        if (quoteData && !('code' in quoteData) && !('message' in quoteData) && quoteData.symbol) {
          let profileData: TwelveDataProfile | null = null;
          
          // Optionally fetch company profile for additional data
          if (includeProfile) {
            try {
              const profileUrl = `https://api.twelvedata.com/profile?symbol=${mapping.twelveDataSymbol}&apikey=${apiKey}`;
              const profileResponse = await fetch(profileUrl);
              profileData = await profileResponse.json();
            } catch (profileError) {
              console.log(`Failed to fetch profile for ${ticker}:`, profileError);
            }
          }

          // Calculate analytical metrics (simplified versions)
          const price = parseFloat(quoteData.close);
          const change = parseFloat(quoteData.change);
          const changePercent = parseFloat(quoteData.percent_change);
          const volume = parseInt(quoteData.volume) || 0;
          const avgVolume = parseInt(quoteData.average_volume) || volume;
          
          // Format the data for our frontend
          const formattedData = {
            ticker: mapping.ticker,
            company: quoteData.name || mapping.symbol,
            exchange: mapping.exchange,
            price: quoteData.close,
            change: change > 0 ? `+${quoteData.change}` : quoteData.change,
            changePercent: changePercent > 0 ? `+${quoteData.percent_change}%` : `${quoteData.percent_change}%`,
            trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
            volume: quoteData.volume,
            avgVolume: quoteData.average_volume,
            open: quoteData.open,
            high: quoteData.high,
            low: quoteData.low,
            previousClose: quoteData.previous_close,
            currency: quoteData.currency,
            lastUpdated: quoteData.datetime,
            
            // Additional data from profile if available
            ...(profileData && {
              marketCap: profileData.market_cap,
              sector: profileData.sector,
              industry: profileData.industry,
              description: profileData.description,
              employees: profileData.employees,
              website: profileData.website,
              ceo: profileData.ceo,
              country: profileData.country
            })
          };

          results.push(formattedData);
          console.log(`Successfully fetched data for ${ticker}`);
        } else {
          console.log(`No data returned for ${ticker}:`, quoteData);
        }

        // Add delay to respect API rate limits (free tier: 8 calls/min)
        await new Promise(resolve => setTimeout(resolve, 500)); // Reduced delay for testing
        
      } catch (error) {
        console.error(`Error fetching data for ${ticker}:`, error);
        continue;
      }
    }

    console.log(`Successfully fetched data for ${results.length} out of ${requestedTickers.length} tickers`);

    return new Response(JSON.stringify({ 
      success: true, 
      data: results,
      fetchedCount: results.length,
      requestedCount: requestedTickers.length,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in real-time-stock-data function:', error);
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