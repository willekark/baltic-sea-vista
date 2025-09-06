import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Baltic Blue Economy Stock Universe
const BALTIC_STOCK_UNIVERSE = {
  // Primary Holdings (HIGH Priority)
  'MAERSK-B.CO': {
    name: 'A.P. Møller-Mærsk A/S',
    currency: 'DKK',
    exchange: 'Copenhagen',
    sector: 'Maritime Transport',
    sharesOutstanding: 16.8, // millions
    priority: 'HIGH',
    alphaVantageSymbol: 'MAERSK-B.CPH',
    finnhubSymbol: 'MAERSK-B.CO',
    polygonSymbol: 'MAERSK-B:CPH',
    twelveDataSymbol: 'MAERSK-B.CO'
  },
  'EQNR': {
    name: 'Equinor ASA',
    currency: 'USD',
    exchange: 'NYSE',
    sector: 'Energy/Offshore Wind',
    sharesOutstanding: 3200, // millions
    priority: 'HIGH',
    alphaVantageSymbol: 'EQNR',
    finnhubSymbol: 'EQNR',
    polygonSymbol: 'EQNR',
    twelveDataSymbol: 'EQNR'
  },
  'ORSTED.CO': {
    name: 'Ørsted A/S',
    currency: 'DKK',
    exchange: 'Copenhagen',
    sector: 'Offshore Wind',
    sharesOutstanding: 420, // millions
    priority: 'HIGH',
    alphaVantageSymbol: 'ORSTED.CPH',
    finnhubSymbol: 'ORSTED.CO',
    polygonSymbol: 'ORSTED:CPH',
    twelveDataSymbol: 'ORSTED.CO'
  },
  'NESTE.HE': {
    name: 'Neste Oyj',
    currency: 'EUR',
    exchange: 'Helsinki',
    sector: 'Renewable Fuels',
    sharesOutstanding: 780, // millions
    priority: 'HIGH',
    alphaVantageSymbol: 'NESTE.HEL',
    finnhubSymbol: 'NESTE.HE',
    polygonSymbol: 'NESTE:HEL',
    twelveDataSymbol: 'NESTE.HE'
  },
  'VWS.CO': {
    name: 'Vestas Wind Systems A/S',
    currency: 'DKK',
    exchange: 'Copenhagen',
    sector: 'Wind Turbines',
    sharesOutstanding: 530, // millions
    priority: 'MEDIUM',
    alphaVantageSymbol: 'VWS.CPH',
    finnhubSymbol: 'VWS.CO',
    polygonSymbol: 'VWS:CPH',
    twelveDataSymbol: 'VWS.CO'
  },
  'DFDS.CO': {
    name: 'DFDS A/S',
    currency: 'DKK',
    exchange: 'Copenhagen',
    sector: 'Ferry/Logistics',
    sharesOutstanding: 52, // millions
    priority: 'MEDIUM',
    alphaVantageSymbol: 'DFDS.CPH',
    finnhubSymbol: 'DFDS.CO',
    polygonSymbol: 'DFDS:CPH',
    twelveDataSymbol: 'DFDS.CO'
  }
};

// Secondary Holdings
const SECONDARY_STOCKS = {
  'SBLK': 'Star Bulk Carriers Corp',
  'GNK': 'Genco Shipping & Trading',
  'HAPAG.DE': 'Hapag-Lloyd AG',
  'TEN': 'Tsakos Energy Navigation'
};

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  volume: number;
  marketCap?: number;
  timestamp: string;
  source: string;
  high?: number;
  low?: number;
  open?: number;
  previousClose?: number;
}

interface APIProvider {
  name: string;
  priority: number;
  rateLimitPerMinute: number;
  fetchStock: (symbol: string) => Promise<StockData | null>;
}

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

// Currency exchange rates cache
let exchangeRates: { [key: string]: number } = {};
let ratesLastUpdated = 0;

async function updateExchangeRates(): Promise<void> {
  const now = Date.now();
  if (now - ratesLastUpdated < 3600000) return; // Update hourly

  try {
    // Using exchangerate-api.com (free tier)
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
    if (response.ok) {
      const data = await response.json();
      exchangeRates = data.rates;
      exchangeRates['EUR'] = 1; // Base currency
      ratesLastUpdated = now;
      console.log('Exchange rates updated:', exchangeRates);
    }
  } catch (error) {
    console.error('Failed to update exchange rates:', error);
    // Use fallback rates
    exchangeRates = { EUR: 1, USD: 1.05, DKK: 7.46, NOK: 11.2, SEK: 11.5 };
  }
}

function convertToEUR(amount: number, fromCurrency: string): number {
  if (fromCurrency === 'EUR') return amount;
  const rate = exchangeRates[fromCurrency];
  return rate ? amount / rate : amount;
}

async function fetchAlphaVantage(symbol: string): Promise<StockData | null> {
  const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
  if (!apiKey) {
    console.log('Alpha Vantage API key not found');
    return null;
  }

  if (!rateLimiter.canMakeCall('alphavantage', 5)) {
    console.log('Alpha Vantage rate limit exceeded');
    return null;
  }

  const stockInfo = BALTIC_STOCK_UNIVERSE[symbol as keyof typeof BALTIC_STOCK_UNIVERSE];
  if (!stockInfo) {
    console.log(`No Alpha Vantage mapping for symbol: ${symbol}`);
    return null;
  }

  try {
    const apiSymbol = stockInfo.alphaVantageSymbol;
    console.log(`Fetching ${symbol} as ${apiSymbol} from Alpha Vantage`);
    
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${apiSymbol}&apikey=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.Note || data['Error Message']) {
      throw new Error('Alpha Vantage API limit or error');
    }
    
    const quote = data['Global Quote'];
    if (!quote || Object.keys(quote).length === 0) {
      throw new Error('No data returned from Alpha Vantage');
    }

    rateLimiter.recordCall('alphavantage');

    return {
      symbol,
      name: stockInfo.name,
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      currency: stockInfo.currency,
      volume: parseInt(quote['06. volume']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      open: parseFloat(quote['02. open']),
      previousClose: parseFloat(quote['08. previous close']),
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
  if (!apiKey) {
    console.log('Finnhub API key not found');
    return null;
  }

  if (!rateLimiter.canMakeCall('finnhub', 60)) {
    console.log('Finnhub rate limit exceeded');
    return null;
  }

  const stockInfo = BALTIC_STOCK_UNIVERSE[symbol as keyof typeof BALTIC_STOCK_UNIVERSE];
  if (!stockInfo) {
    console.log(`No Finnhub mapping for symbol: ${symbol}`);
    return null;
  }

  try {
    const apiSymbol = stockInfo.finnhubSymbol;
    console.log(`Fetching ${symbol} as ${apiSymbol} from Finnhub`);
    
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${apiSymbol}&token=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.c || data.c === 0) {
      throw new Error('No data returned from Finnhub');
    }

    rateLimiter.recordCall('finnhub');

    return {
      symbol,
      name: stockInfo.name,
      price: data.c,
      change: data.d || 0,
      changePercent: data.dp || 0,
      currency: stockInfo.currency,
      volume: 0, // Finnhub doesn't provide volume in this endpoint
      high: data.h || data.c,
      low: data.l || data.c,
      open: data.o || data.c,
      previousClose: data.pc || data.c,
      timestamp: new Date().toISOString(),
      source: 'Finnhub'
    };
  } catch (error) {
    console.error(`Finnhub error for ${symbol}:`, error);
    return null;
  }
}

async function fetchPolygon(symbol: string): Promise<StockData | null> {
  const apiKey = Deno.env.get('POLYGON_API_KEY');
  if (!apiKey) {
    console.log('Polygon API key not found');
    return null;
  }

  if (!rateLimiter.canMakeCall('polygon', 5)) {
    console.log('Polygon rate limit exceeded');
    return null;
  }

  const stockInfo = BALTIC_STOCK_UNIVERSE[symbol as keyof typeof BALTIC_STOCK_UNIVERSE];
  if (!stockInfo) {
    console.log(`No Polygon mapping for symbol: ${symbol}`);
    return null;
  }

  try {
    const apiSymbol = stockInfo.polygonSymbol;
    console.log(`Fetching ${symbol} as ${apiSymbol} from Polygon`);
    
    // Get previous day's close
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];
    
    const response = await fetch(
      `https://api.polygon.io/v1/open-close/${apiSymbol}/${dateStr}?adjusted=true&apikey=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.close) {
      throw new Error('No data returned from Polygon');
    }

    rateLimiter.recordCall('polygon');

    return {
      symbol,
      name: stockInfo.name,
      price: data.close,
      change: data.close - data.open,
      changePercent: ((data.close - data.open) / data.open) * 100,
      currency: stockInfo.currency,
      volume: data.volume || 0,
      high: data.high || data.close,
      low: data.low || data.close,
      open: data.open || data.close,
      previousClose: data.preMarket || data.open,
      timestamp: new Date().toISOString(),
      source: 'Polygon'
    };
  } catch (error) {
    console.error(`Polygon error for ${symbol}:`, error);
    return null;
  }
}

async function fetchTwelveData(symbol: string): Promise<StockData | null> {
  const apiKey = Deno.env.get('TWELVE_DATA_API_KEY');
  if (!apiKey) {
    console.log('TwelveData API key not found');
    return null;
  }

  if (!rateLimiter.canMakeCall('twelvedata', 8)) {
    console.log('TwelveData rate limit exceeded');
    return null;
  }

  const stockInfo = BALTIC_STOCK_UNIVERSE[symbol as keyof typeof BALTIC_STOCK_UNIVERSE];
  if (!stockInfo) {
    console.log(`No TwelveData mapping for symbol: ${symbol}`);
    return null;
  }

  try {
    const apiSymbol = stockInfo.twelveDataSymbol;
    console.log(`Fetching ${symbol} as ${apiSymbol} from TwelveData`);
    
    const response = await fetch(
      `https://api.twelvedata.com/quote?symbol=${apiSymbol}&apikey=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`TwelveData API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'error' || !data.close) {
      throw new Error(data.message || 'No data returned from TwelveData');
    }

    rateLimiter.recordCall('twelvedata');

    return {
      symbol,
      name: stockInfo.name,
      price: parseFloat(data.close),
      change: parseFloat(data.change) || 0,
      changePercent: parseFloat(data.percent_change?.replace('%', '')) || 0,
      currency: stockInfo.currency,
      volume: parseInt(data.volume) || 0,
      high: parseFloat(data.high) || parseFloat(data.close),
      low: parseFloat(data.low) || parseFloat(data.close),
      open: parseFloat(data.open) || parseFloat(data.close),
      previousClose: parseFloat(data.previous_close) || parseFloat(data.close),
      timestamp: new Date().toISOString(),
      source: 'TwelveData'
    };
  } catch (error) {
    console.error(`TwelveData error for ${symbol}:`, error);
    return null;
  }
}

async function fetchStockDataWithFailover(symbol: string): Promise<StockData | null> {
  const providers: APIProvider[] = [
    { name: 'TwelveData', priority: 1, rateLimitPerMinute: 8, fetchStock: fetchTwelveData },
    { name: 'Alpha Vantage', priority: 2, rateLimitPerMinute: 5, fetchStock: fetchAlphaVantage },
    { name: 'Finnhub', priority: 3, rateLimitPerMinute: 60, fetchStock: fetchFinnhub },
    { name: 'Polygon', priority: 4, rateLimitPerMinute: 5, fetchStock: fetchPolygon }
  ];

  for (const provider of providers) {
    try {
      console.log(`Trying ${provider.name} for ${symbol}`);
      const data = await provider.fetchStock(symbol);
      if (data && data.price && data.price > 0) {
        console.log(`Successfully fetched ${symbol} from ${provider.name}`);
        
        // Calculate market cap
        const stockInfo = BALTIC_STOCK_UNIVERSE[symbol as keyof typeof BALTIC_STOCK_UNIVERSE];
        if (stockInfo) {
          const priceInEUR = convertToEUR(data.price, data.currency);
          data.marketCap = priceInEUR * stockInfo.sharesOutstanding * 1000000; // Convert to actual market cap
        }
        
        return data;
      }
    } catch (error) {
      console.error(`${provider.name} failed for ${symbol}:`, error);
      continue;
    }
  }

  console.log(`No real data available for ${symbol} from any provider`);
  return null;
}

class FinancialCalculator {
  static calculateMarketCap(price: number, sharesOutstanding: number, currency: string): string {
    const priceInEUR = convertToEUR(price, currency);
    const marketCapEUR = (priceInEUR * sharesOutstanding) / 1000; // In millions
    
    if (marketCapEUR >= 1000) {
      return `€${(marketCapEUR / 1000).toFixed(1)}B`;
    }
    return `€${marketCapEUR.toFixed(0)}M`;
  }

  static calculatePriceChange(currentPrice: number, previousClose: number) {
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;
    return { change, changePercent };
  }

  static calculatePortfolioMetrics(stockData: StockData[]): any {
    let totalValueEUR = 0;
    let totalChangeEUR = 0;
    const sectors: { [key: string]: number } = {};
    const currencies: { [key: string]: number } = {};

    stockData.forEach(stock => {
      const stockInfo = BALTIC_STOCK_UNIVERSE[stock.symbol as keyof typeof BALTIC_STOCK_UNIVERSE];
      if (stockInfo) {
        const valueEUR = convertToEUR(stock.price * stockInfo.sharesOutstanding, stock.currency);
        const changeEUR = convertToEUR(stock.change * stockInfo.sharesOutstanding, stock.currency);
        
        totalValueEUR += valueEUR;
        totalChangeEUR += changeEUR;
        
        sectors[stockInfo.sector] = (sectors[stockInfo.sector] || 0) + valueEUR;
        currencies[stock.currency] = (currencies[stock.currency] || 0) + valueEUR;
      }
    });

    return {
      totalValue: `€${(totalValueEUR / 1000000000).toFixed(1)}B`,
      totalChange: totalChangeEUR,
      totalChangePercent: totalValueEUR ? (totalChangeEUR / totalValueEUR) * 100 : 0,
      sectorAllocation: sectors,
      currencyExposure: currencies,
      stockCount: stockData.length
    };
  }
}

class DataQualityMonitor {
  static validateStockData(data: StockData): boolean {
    if (!data.price || data.price <= 0) return false;
    if (Math.abs(data.changePercent) > 50) return false; // Sanity check
    if (!data.currency || !['USD', 'EUR', 'DKK', 'NOK', 'SEK'].includes(data.currency)) return false;
    
    return true;
  }

  static flagSuspiciousMovement(symbol: string, newPrice: number, lastPrice: number): boolean {
    const change = Math.abs((newPrice - lastPrice) / lastPrice);
    if (change > 0.20) {
      console.warn(`Suspicious price movement for ${symbol}: ${change * 100}% change`);
      return false;
    }
    return true;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Update exchange rates
    await updateExchangeRates();

    const { symbols, includePortfolioMetrics } = await req.json();
    const requestedSymbols = symbols || Object.keys(BALTIC_STOCK_UNIVERSE);

    console.log(`Fetching data for symbols: ${requestedSymbols.join(', ')}`);

    // Fetch data for all symbols in parallel
    const promises = requestedSymbols.map((symbol: string) => 
      fetchStockDataWithFailover(symbol)
    );

    const results = await Promise.allSettled(promises);
    const stockData: StockData[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        if (DataQualityMonitor.validateStockData(result.value)) {
          stockData.push(result.value);
        } else {
          errors.push(`Data quality check failed for ${requestedSymbols[index]}`);
        }
      } else {
        const symbol = requestedSymbols[index];
        const stockInfo = BALTIC_STOCK_UNIVERSE[symbol as keyof typeof BALTIC_STOCK_UNIVERSE];
        errors.push(`No reliable data available for ${stockInfo?.name || symbol} (${symbol})`);
      }
    });

    // Calculate portfolio metrics if requested
    let portfolioMetrics = null;
    if (includePortfolioMetrics && stockData.length > 0) {
      portfolioMetrics = FinancialCalculator.calculatePortfolioMetrics(stockData);
    }

    // Generate executive summary
    const executiveSummary = {
      totalMarketCap: portfolioMetrics?.totalValue || 'N/A',
      performance: portfolioMetrics?.totalChangePercent?.toFixed(2) + '%' || 'N/A',
      dataQuality: `${stockData.length}/${requestedSymbols.length} symbols with reliable data`,
      lastUpdated: new Date().toISOString(),
      exchangeRates: exchangeRates
    };

    return new Response(JSON.stringify({
      success: true,
      data: stockData,
      portfolioMetrics,
      executiveSummary,
      errors,
      timestamp: new Date().toISOString(),
      providers: ['TwelveData', 'Alpha Vantage', 'Finnhub', 'Polygon']
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Baltic Stock Data Service error:', error);
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