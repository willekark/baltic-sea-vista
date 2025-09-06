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

const BALTIC_STOCKS = [
  { symbol: 'MAERSK-B.CO', name: 'A.P. Møller-Mærsk', exchange: 'CPH', currency: 'DKK' },
  { symbol: 'EQNR', name: 'Equinor ASA', exchange: 'NYSE', currency: 'USD' },
  { symbol: 'ORSTED.CO', name: 'Ørsted A/S', exchange: 'CPH', currency: 'DKK' },
  { symbol: 'NESTE.HE', name: 'Neste Oyj', exchange: 'HEL', currency: 'EUR' },
  { symbol: 'VWS.CO', name: 'Vestas', exchange: 'CPH', currency: 'DKK' },
  { symbol: 'DFDS.CO', name: 'DFDS', exchange: 'CPH', currency: 'DKK' },
  { symbol: 'SBLK', name: 'Star Bulk Carriers', exchange: 'NASDAQ', currency: 'USD' },
  { symbol: 'GNK', name: 'Genco Shipping', exchange: 'NYSE', currency: 'USD' },
  { symbol: 'HHLA.DE', name: 'Hamburger Hafen', exchange: 'XETRA', currency: 'EUR' },
  { symbol: 'TORM.CO', name: 'TORM A/S', exchange: 'CPH', currency: 'DKK' },
  { symbol: 'HAPAG.DE', name: 'Hapag-Lloyd', exchange: 'XETRA', currency: 'EUR' },
  { symbol: 'RWE.DE', name: 'RWE AG', exchange: 'XETRA', currency: 'EUR' },
  { symbol: 'KONE.HE', name: 'KONE Oyj', exchange: 'HEL', currency: 'EUR' },
  { symbol: 'SALM.HE', name: 'Salmar ASA', exchange: 'HEL', currency: 'EUR' },
  { symbol: 'TELUS.HE', name: 'Telia Company', exchange: 'HEL', currency: 'EUR' }
];

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

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
    );
    
    if (!response.ok) throw new Error(`Alpha Vantage API error: ${response.status}`);
    
    const data = await response.json();
    const quote = data['Global Quote'];
    
    if (!quote || Object.keys(quote).length === 0) {
      throw new Error('No data returned from Alpha Vantage');
    }

    rateLimiter.recordCall('alphavantage');

    const stockInfo = BALTIC_STOCKS.find(s => s.symbol === symbol);
    return {
      symbol: quote['01. symbol'],
      name: stockInfo?.name || symbol,
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      currency: stockInfo?.currency || 'USD',
      volume: parseInt(quote['06. volume']),
      timestamp: new Date().toISOString(),
      source: 'Alpha Vantage'
    };
  } catch (error) {
    console.error('Alpha Vantage error:', error);
    return null;
  }
}

async function fetchFinnhub(symbol: string): Promise<StockData | null> {
  const apiKey = Deno.env.get('FINNHUB_API_KEY');
  if (!apiKey) return null;

  if (!rateLimiter.canMakeCall('finnhub', 60)) {
    throw new Error('Finnhub rate limit exceeded');
  }

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
    );
    
    if (!response.ok) throw new Error(`Finnhub API error: ${response.status}`);
    
    const data = await response.json();
    
    if (!data.c || data.c === 0) {
      throw new Error('No data returned from Finnhub');
    }

    rateLimiter.recordCall('finnhub');

    const stockInfo = BALTIC_STOCKS.find(s => s.symbol === symbol);
    return {
      symbol,
      name: stockInfo?.name || symbol,
      price: data.c,
      change: data.d,
      changePercent: data.dp,
      currency: stockInfo?.currency || 'USD',
      volume: 0, // Finnhub doesn't provide volume in this endpoint
      timestamp: new Date().toISOString(),
      source: 'Finnhub'
    };
  } catch (error) {
    console.error('Finnhub error:', error);
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

  // Fallback with realistic mock data in correct currencies
  const stockInfo = BALTIC_STOCKS.find(s => s.symbol === symbol);
  const currency = stockInfo?.currency || 'USD';
  
  // Generate realistic price ranges based on currency
  let basePrice, priceRange;
  switch (currency) {
    case 'DKK':
      basePrice = 500; // Danish Kroner - typically higher numbers
      priceRange = 200;
      break;
    case 'EUR':
      basePrice = 50; // Euro prices
      priceRange = 25;
      break;
    case 'USD':
    default:
      basePrice = 25; // USD prices
      priceRange = 15;
      break;
  }

  return {
    symbol,
    name: stockInfo?.name || symbol,
    price: basePrice + Math.random() * priceRange,
    change: (Math.random() - 0.5) * 5,
    changePercent: (Math.random() - 0.5) * 5,
    currency,
    volume: Math.floor(Math.random() * 1000000),
    timestamp: new Date().toISOString(),
    source: 'Fallback Mock Data'
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbols } = await req.json();
    const requestedSymbols = symbols || BALTIC_STOCKS.map(s => s.symbol);

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
        errors.push(`Failed to fetch data for ${requestedSymbols[index]}`);
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