import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mock realistic Baltic Sea stock data
const mockStockData = {
  "MAERSK-B.CO": {
    ticker: "MAERSK-B.CO",
    company: "A.P. Møller-Mærsk A/S",
    exchange: "Copenhagen",
    price: "12680.00",
    change: "+142.00",
    changePercent: "+1.13%",
    trend: "up",
    volume: "89432",
    avgVolume: "125670",
    open: "12598.00",
    high: "12720.00",
    low: "12580.00",
    previousClose: "12538.00",
    currency: "DKK",
    lastUpdated: "2025-09-06"
  },
  "HHLA.DE": {
    ticker: "HHLA.DE",
    company: "Hamburger Hafen und Logistik AG",
    exchange: "XETRA",
    price: "15.28",
    change: "-0.12",
    changePercent: "-0.78%",
    trend: "down",
    volume: "156780",
    avgVolume: "203450",
    open: "15.45",
    high: "15.52",
    low: "15.20",
    previousClose: "15.40",
    currency: "EUR",
    lastUpdated: "2025-09-06"
  },
  "ORSTED.CO": {
    ticker: "ORSTED.CO",
    company: "Ørsted A/S",
    exchange: "Copenhagen",
    price: "453.20",
    change: "+8.60",
    changePercent: "+1.93%",
    trend: "up",
    volume: "234560",
    avgVolume: "289340",
    open: "448.50",
    high: "456.80",
    low: "447.20",
    previousClose: "444.60",
    currency: "DKK",
    lastUpdated: "2025-09-06"
  },
  "TORM.CO": {
    ticker: "TORM.CO",
    company: "TORM plc",
    exchange: "Copenhagen",
    price: "135.60",
    change: "+2.40",
    changePercent: "+1.80%",
    trend: "up",
    volume: "167890",
    avgVolume: "198760",
    open: "133.80",
    high: "137.20",
    low: "133.20",
    previousClose: "133.20",
    currency: "DKK",
    lastUpdated: "2025-09-06"
  },
  "HAPAG.DE": {
    ticker: "HAPAG.DE",
    company: "Hapag-Lloyd AG",
    exchange: "XETRA",
    price: "186.40",
    change: "+3.20",
    changePercent: "+1.75%",
    trend: "up",
    volume: "98760",
    avgVolume: "134520",
    open: "184.20",
    high: "188.60",
    low: "183.80",
    previousClose: "183.20",
    currency: "EUR",
    lastUpdated: "2025-09-06"
  },
  "EQNR": {
    ticker: "EQNR",
    company: "Equinor ASA",
    exchange: "Oslo",
    price: "274.50",
    change: "+1.80",
    changePercent: "+0.66%",
    trend: "up",
    volume: "2340000",
    avgVolume: "2890000",
    open: "273.20",
    high: "276.40",
    low: "272.60",
    previousClose: "272.70",
    currency: "NOK",
    lastUpdated: "2025-09-06"
  },
  "NESTE": {
    ticker: "NESTE",
    company: "Neste Corporation",
    exchange: "Helsinki",
    price: "14.87",
    change: "+0.23",
    changePercent: "+1.57%",
    trend: "up",
    volume: "567890",
    avgVolume: "678340",
    open: "14.72",
    high: "14.95",
    low: "14.68",
    previousClose: "14.64",
    currency: "EUR",
    lastUpdated: "2025-09-06"
  },
  "DFDS": {
    ticker: "DFDS",
    company: "DFDS A/S",
    exchange: "Copenhagen",
    price: "434.00",
    change: "+6.50",
    changePercent: "+1.52%",
    trend: "up",
    volume: "45670",
    avgVolume: "67840",
    open: "429.50",
    high: "436.20",
    low: "428.80",
    previousClose: "427.50",
    currency: "DKK",
    lastUpdated: "2025-09-06"
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Mock stock data function called');
    
    const { tickers } = await req.json();
    console.log('Requested tickers:', tickers);

    // Parse tickers if it's a string
    let tickerList: string[] = [];
    if (typeof tickers === 'string') {
      tickerList = tickers.split(',').map(t => t.trim());
    } else if (Array.isArray(tickers)) {
      tickerList = tickers;
    }

    const results = [];
    for (const ticker of tickerList) {
      if (mockStockData[ticker]) {
        results.push(mockStockData[ticker]);
        console.log(`Found mock data for ${ticker}`);
      } else {
        console.log(`No mock data available for ${ticker}`);
      }
    }

    console.log(`Returning ${results.length} mock stock entries out of ${tickerList.length} requested`);

    return new Response(JSON.stringify({
      success: true,
      data: results,
      fetchedCount: results.length,
      requestedCount: tickerList.length,
      timestamp: new Date().toISOString(),
      source: "mock_data"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in mock stock data function:', error);
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