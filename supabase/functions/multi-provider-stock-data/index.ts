import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  volume: number;
  marketCap?: string;
  pe?: number;
  dividend?: number;
  timestamp: string;
  source: string;
}

interface APIProvider {
  name: string;
  priority: number;
  rateLimitPerMinute: number;
  fetchStock: (symbol: string) => Promise<StockData | null>;
}

const STOCK_MAPPINGS = {
  // Danish stocks (Copenhagen)
  'MAERSK-B.CO': { 
    alphaVantage: 'MAERSK-B.CPH', 
    finnhub: 'MAERSK-B.CO', 
    name: 'A.P. Møller-Mærsk', 
    exchange: 'CPH', 
    currency: 'DKK' 
  },
  'ORSTED.CO': { 
    alphaVantage: 'ORSTED.CPH', 
    finnhub: 'ORSTED.CO', 
    name: 'Ørsted A/S', 
    exchange: 'CPH', 
    currency: 'DKK' 
  },
  'VWS.CO': { 
    alphaVantage: 'VWS.CPH', 
    finnhub: 'VWS.CO', 
    name: 'Vestas', 
    exchange: 'CPH', 
    currency: 'DKK' 
  },
  'DFDS.CO': { 
    alphaVantage: 'DFDS.CPH', 
    finnhub: 'DFDS.CO', 
    name: 'DFDS', 
    exchange: 'CPH', 
    currency: 'DKK' 
  },
  'TORM.CO': { 
    alphaVantage: 'TORM.CPH', 
    finnhub: 'TORM.CO', 
    name: 'TORM A/S', 
    exchange: 'CPH', 
    currency: 'DKK' 
  },
  
  // German stocks (XETRA)
  'HHLA.DE': { 
    alphaVantage: 'HHLA.DEX', 
    finnhub: 'HHLA.DE', 
    name: 'Hamburger Hafen', 
    exchange: 'XETRA', 
    currency: 'EUR' 
  },
  'HAPAG.DE': { 
    alphaVantage: 'HLAG.DEX', 
    finnhub: 'HLAG.DE', 
    name: 'Hapag-Lloyd', 
    exchange: 'XETRA', 
    currency: 'EUR' 
  },
  'RWE.DE': { 
    alphaVantage: 'RWE.DEX', 
    finnhub: 'RWE.DE', 
    name: 'RWE AG', 
    exchange: 'XETRA', 
    currency: 'EUR' 
  },
  
  // Finnish stocks (Helsinki)
  'NESTE.HE': { 
    alphaVantage: 'NESTE.HEL', 
    finnhub: 'NESTE.HE', 
    name: 'Neste Oyj', 
    exchange: 'HEL', 
    currency: 'EUR' 
  },
  'KONE.HE': { 
    alphaVantage: 'KONE.HEL', 
    finnhub: 'KONE.HE', 
    name: 'KONE Oyj', 
    exchange: 'HEL', 
    currency: 'EUR' 
  },
  
  // US stocks
  'EQNR': { 
    alphaVantage: 'EQNR', 
    finnhub: 'EQNR', 
    name: 'Equinor ASA', 
    exchange: 'NYSE', 
    currency: 'USD' 
  },
  'SBLK': { 
    alphaVantage: 'SBLK', 
    finnhub: 'SBLK', 
    name: 'Star Bulk Carriers', 
    exchange: 'NASDAQ', 
    currency: 'USD' 
  },
  'GNK': { 
    alphaVantage: 'GNK', 
    finnhub: 'GNK', 
    name: 'Genco Shipping', 
    exchange: 'NYSE', 
    currency: 'USD' 
  }
};

class RateLimiter {
  private callCounts = new Map<string, { count: number; resetTime: number }>();

  canMakeCall(provider: string, limit: number): boolean {
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const key = `${provider}-${minute}`;
    
    const current = this.callCounts.get(key) || { count: 0, resetTime: minute };
    
    if (current.resetTime < minute) {
      this.callCounts.set(key, { count: 0, resetTime: minute });
      return true;
    }
    
    return current.count < limit;
  }

  recordCall(provider: string): void {
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const key = `${provider}-${minute}`;
    
    const current = this.callCounts.get(key) || { count: 0, resetTime: minute };
    this.callCounts.set(key, { count: current.count + 1, resetTime: minute });
  }
}

const rateLimiter = new RateLimiter();

async function fetchAlphaVantage(symbol: string): Promise<StockData | null> {
  const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
  if (!apiKey) return null;

  if (!rateLimiter.canMakeCall('alphavantage', 5)) {
    throw new Error('Alpha Vantage rate limit exceeded');
  }

  const mapping = STOCK_MAPPINGS[symbol as keyof typeof STOCK_MAPPINGS];
  if (!mapping) {
    console.log(`No mapping found for symbol: ${symbol}`);
    return null;
  }

  try {
    const apiSymbol = mapping.alphaVantage;
    console.log(`Fetching ${symbol} as ${apiSymbol} from Alpha Vantage`);
    
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${apiSymbol}&apikey=${apiKey}`
    );
    
    if (!response.ok) throw new Error(`Alpha Vantage API error: ${response.status}`);
    
    const data = await response.json();
    console.log(`Alpha Vantage response for ${symbol}:`, data);
    
    const quote = data['Global Quote'];
    
    if (!quote || Object.keys(quote).length === 0) {
      throw new Error('No data returned from Alpha Vantage');
    }

    rateLimiter.recordCall('alphavantage');

    return {
      symbol,
      name: mapping.name,
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      currency: mapping.currency,
      volume: parseInt(quote['06. volume']),
      timestamp: new Date().toISOString(),
      source: 'Alpha Vantage'
    };
  } catch (error) {
    console.error(`Alpha Vantage error for ${symbol}:`, error);
    return null;
  }
}

async function fetchFinnhub(symbol: string): Promise<StockData | null> {
  const apiKey = Deno.env.get('FINNHUB_API_KEY');
  if (!apiKey) return null;

  if (!rateLimiter.canMakeCall('finnhub', 60)) {
    throw new Error('Finnhub rate limit exceeded');
  }

  const mapping = STOCK_MAPPINGS[symbol as keyof typeof STOCK_MAPPINGS];
  if (!mapping) {
    console.log(`No mapping found for symbol: ${symbol}`);
    return null;
  }

  try {
    const apiSymbol = mapping.finnhub;
    console.log(`Fetching ${symbol} as ${apiSymbol} from Finnhub`);
    
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${apiSymbol}&token=${apiKey}`
    );
    
    if (!response.ok) throw new Error(`Finnhub API error: ${response.status}`);
    
    const data = await response.json();
    console.log(`Finnhub response for ${symbol}:`, data);
    
    if (!data.c || data.c === 0) {
      throw new Error('No data returned from Finnhub');
    }

    rateLimiter.recordCall('finnhub');

    return {
      symbol,
      name: mapping.name,
      price: data.c,
      change: data.d,
      changePercent: data.dp,
      currency: mapping.currency,
      volume: 0, // Finnhub doesn't provide volume in this endpoint
      timestamp: new Date().toISOString(),
      source: 'Finnhub'
    };
  } catch (error) {
    console.error(`Finnhub error for ${symbol}:`, error);
    return null;
  }
}

async function fetchStockDataWithFailover(symbol: string): Promise<StockData | null> {
  const providers: APIProvider[] = [
    {
      name: 'Alpha Vantage',
      priority: 1,
      rateLimitPerMinute: 5,
      fetchStock: fetchAlphaVantage
    },
    {
      name: 'Finnhub',
      priority: 2,
      rateLimitPerMinute: 60,
      fetchStock: fetchFinnhub
    }
  ];

  for (const provider of providers) {
    try {
      const data = await provider.fetchStock(symbol);
      if (data) {
        console.log(`Successfully fetched ${symbol} from ${provider.name}`);
        return data;
      }
    } catch (error) {
      console.error(`${provider.name} failed for ${symbol}:`, error);
      continue;
    }
  }

  // Return null instead of mock data when real data isn't available
  console.log(`No real data available for ${symbol} from any provider`);
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbols } = await req.json();
    const requestedSymbols = symbols || Object.keys(STOCK_MAPPINGS);

    // Fetch data for all symbols in parallel
    const promises = requestedSymbols.map((symbol: string) => 
      fetchStockDataWithFailover(symbol)
    );

    const results = await Promise.allSettled(promises);
    const stockData: StockData[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        stockData.push(result.value);
      } else {
        const symbol = requestedSymbols[index];
        const mapping = STOCK_MAPPINGS[symbol as keyof typeof STOCK_MAPPINGS];
        errors.push(`No real-time data available for ${mapping?.name || symbol} (${symbol})`);
      }
    });

    return new Response(JSON.stringify({
      success: true,
      data: stockData,
      errors,
      timestamp: new Date().toISOString(),
      providers: ['Alpha Vantage', 'Finnhub']
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});