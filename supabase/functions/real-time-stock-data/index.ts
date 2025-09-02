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
  // Original companies - using correct Twelve Data symbols
  { ticker: 'MAERSK-B.CO', symbol: 'MAERSK-B', exchange: 'Copenhagen', twelveDataSymbol: 'MAERSK-B' },
  { ticker: 'HHLA.DE', symbol: 'HHLA', exchange: 'XETRA', twelveDataSymbol: 'HHLA' },
  { ticker: 'ORSTED.CO', symbol: 'ORSTED', exchange: 'Copenhagen', twelveDataSymbol: 'ORSTED' },
  { ticker: 'TORM.CO', symbol: 'TORM', exchange: 'Copenhagen', twelveDataSymbol: 'TORM' },
  { ticker: 'HAPAG.DE', symbol: 'HAPAG', exchange: 'XETRA', twelveDataSymbol: 'HAPAG-LLOYD' },
  { ticker: 'SALM.HE', symbol: 'SALM', exchange: 'Helsinki', twelveDataSymbol: 'SALMAR' },
  { ticker: 'TELUS.HE', symbol: 'TELIA', exchange: 'Stockholm', twelveDataSymbol: 'TELIA' },
  { ticker: 'KONE.HE', symbol: 'KONE', exchange: 'Helsinki', twelveDataSymbol: 'KNEBV' },
  
  // Test with simpler, well-known symbols first
  { ticker: 'RWE', symbol: 'RWE', exchange: 'XETRA', twelveDataSymbol: 'RWE' },
  { ticker: 'EQNR', symbol: 'EQNR', exchange: 'Oslo', twelveDataSymbol: 'EQNR' },
  { ticker: 'NESTE', symbol: 'NESTE', exchange: 'Helsinki', twelveDataSymbol: 'NESTE' },
  
  // New Baltic companies - simplified symbols
  { ticker: 'TSM1T', symbol: 'TSM1T', exchange: 'Tallinn', twelveDataSymbol: 'TSM1T' },
  { ticker: 'VIK1V', symbol: 'VIK1V', exchange: 'Helsinki', twelveDataSymbol: 'VIK1V' },
  { ticker: 'TAL1T', symbol: 'TAL1T', exchange: 'Tallinn', twelveDataSymbol: 'TAL1T' },
  { ticker: 'DFDS', symbol: 'DFDS', exchange: 'Copenhagen', twelveDataSymbol: 'DFDS' },
  { ticker: 'PGE', symbol: 'PGE', exchange: 'Warsaw', twelveDataSymbol: 'PGE' },
  { ticker: 'ORLEN', symbol: 'ORLEN', exchange: 'Warsaw', twelveDataSymbol: 'PKN' },
  { ticker: 'EBK', symbol: 'EBK', exchange: 'XETRA', twelveDataSymbol: 'EBK' },
  { ticker: 'IGN1L', symbol: 'IGN1L', exchange: 'Vilnius', twelveDataSymbol: 'IGN1L' },
  { ticker: 'EGR1T', symbol: 'EGR1T', exchange: 'Tallinn', twelveDataSymbol: 'EGR1T' },
  { ticker: 'PEP', symbol: 'PEP', exchange: 'Warsaw', twelveDataSymbol: 'PEP' },
  { ticker: 'WRT1V', symbol: 'WRT1V', exchange: 'Helsinki', twelveDataSymbol: 'WRT1V' },
  { ticker: 'ALFA', symbol: 'ALFA', exchange: 'Stockholm', twelveDataSymbol: 'ALFA' },
  { ticker: 'CCC', symbol: 'CCC', exchange: 'Stockholm', twelveDataSymbol: 'CCC' },
  { ticker: 'TVE1T', symbol: 'TVE1T', exchange: 'Tallinn', twelveDataSymbol: 'TVE1T' },
  { ticker: 'KNE1L', symbol: 'KNE1L', exchange: 'Vilnius', twelveDataSymbol: 'KNE1L' }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('TWELVE_DATA_API_KEY');
    if (!apiKey) {
      throw new Error('TWELVE_DATA_API_KEY is not configured');
    }

    // Get request data from body (when using supabase.functions.invoke)
    const requestData = await req.json();
    const tickersParam = requestData.tickers;
    const includeProfile = requestData.includeProfile || false;
    
    // Parse tickers - can be string or array
    const requestedTickers = typeof tickersParam === 'string' 
      ? tickersParam.split(',').filter(t => t.trim()) 
      : Array.isArray(tickersParam) ? tickersParam : [];
    
    console.log(`Fetching data for tickers: ${requestedTickers.join(', ')}`);

    const results: any[] = [];

    // Process each requested ticker
    for (const ticker of requestedTickers) {
      const mapping = stockMappings.find(m => m.ticker === ticker);
      if (!mapping) {
        console.log(`No mapping found for ticker: ${ticker}`);
        continue;
      }

      try {
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

        if (quoteData && !('code' in quoteData) && !('message' in quoteData)) {
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