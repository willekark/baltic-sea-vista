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
  // Original companies
  { ticker: 'MAERSK-B.CO', symbol: 'MAERSK-B', exchange: 'Copenhagen', twelveDataSymbol: 'MAERSK-B.CSE' },
  { ticker: 'HHLA.DE', symbol: 'HHLA', exchange: 'XETRA', twelveDataSymbol: 'HHLA.XETRA' },
  { ticker: 'ORSTED.CO', symbol: 'ORSTED', exchange: 'Copenhagen', twelveDataSymbol: 'ORSTED.CSE' },
  { ticker: 'TORM.CO', symbol: 'TORM', exchange: 'Copenhagen', twelveDataSymbol: 'TORM.CSE' },
  { ticker: 'HAPAG.DE', symbol: 'HAPAG', exchange: 'XETRA', twelveDataSymbol: 'HAPAG.XETRA' },
  { ticker: 'SALM.HE', symbol: 'SALM', exchange: 'Helsinki', twelveDataSymbol: 'SALM.HEL' },
  { ticker: 'TELUS.HE', symbol: 'TELIA', exchange: 'Stockholm', twelveDataSymbol: 'TELIA.STO' },
  { ticker: 'KONE.HE', symbol: 'KONE', exchange: 'Helsinki', twelveDataSymbol: 'KONE.HEL' },
  
  // New Baltic companies
  { ticker: 'TSM1T', symbol: 'TSM1T', exchange: 'Tallinn', twelveDataSymbol: 'TSM1T.NASDAQ' },
  { ticker: 'VIK1V', symbol: 'VIK1V', exchange: 'Helsinki', twelveDataSymbol: 'VIK1V.HEL' },
  { ticker: 'TAL1T', symbol: 'TAL1T', exchange: 'Tallinn', twelveDataSymbol: 'TAL1T.NASDAQ' },
  { ticker: 'DFDS', symbol: 'DFDS', exchange: 'Copenhagen', twelveDataSymbol: 'DFDS.CSE' },
  { ticker: 'PGE', symbol: 'PGE', exchange: 'Warsaw', twelveDataSymbol: 'PGE.WSE' },
  { ticker: 'ORLEN', symbol: 'ORLEN', exchange: 'Warsaw', twelveDataSymbol: 'PKN.WSE' },
  { ticker: 'RWE', symbol: 'RWE', exchange: 'XETRA', twelveDataSymbol: 'RWE.XETRA' },
  { ticker: 'EBK', symbol: 'EBK', exchange: 'XETRA', twelveDataSymbol: 'EBK.XETRA' },
  { ticker: 'IGN1L', symbol: 'IGN1L', exchange: 'Vilnius', twelveDataSymbol: 'IGN1L.NASDAQ' },
  { ticker: 'EGR1T', symbol: 'EGR1T', exchange: 'Tallinn', twelveDataSymbol: 'EGR1T.NASDAQ' },
  { ticker: 'EQNR', symbol: 'EQNR', exchange: 'Oslo', twelveDataSymbol: 'EQNR.OSL' },
  { ticker: 'PEP', symbol: 'PEP', exchange: 'Warsaw', twelveDataSymbol: 'PEP.WSE' },
  { ticker: 'NESTE', symbol: 'NESTE', exchange: 'Helsinki', twelveDataSymbol: 'NESTE.HEL' },
  { ticker: 'WRT1V', symbol: 'WRT1V', exchange: 'Helsinki', twelveDataSymbol: 'WRT1V.HEL' },
  { ticker: 'ALFA', symbol: 'ALFA', exchange: 'Stockholm', twelveDataSymbol: 'ALFA.STO' },
  { ticker: 'CCC', symbol: 'CCC', exchange: 'Stockholm', twelveDataSymbol: 'CCC.STO' },
  { ticker: 'TVE1T', symbol: 'TVE1T', exchange: 'Tallinn', twelveDataSymbol: 'TVE1T.NASDAQ' },
  { ticker: 'KNE1L', symbol: 'KNE1L', exchange: 'Vilnius', twelveDataSymbol: 'KNE1L.NASDAQ' }
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

    const url = new URL(req.url);
    const requestedTickers = url.searchParams.get('tickers')?.split(',') || [];
    const includeProfile = url.searchParams.get('includeProfile') === 'true';
    
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
        console.log(`Fetching quote from: ${quoteUrl}`);
        
        const quoteResponse = await fetch(quoteUrl);
        const quoteData: TwelveDataQuote = await quoteResponse.json();

        if (quoteData && !('code' in quoteData)) {
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
        await new Promise(resolve => setTimeout(resolve, 8000));
        
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