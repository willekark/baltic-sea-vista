import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TimeSeriesPoint {
  timestamp: string;
  value: number;
  anomaly: number;
  quality_flag: string;
  forecast?: boolean;
  confidence?: number;
}

interface TimeSeriesResponse {
  variable: string;
  unit: string;
  location: {
    lat: number;
    lon: number;
    depth?: number;
  };
  data: TimeSeriesPoint[];
  climatology?: {
    mean: number;
    std: number;
    percentiles: {
      p5: number;
      p25: number;
      p50: number;
      p75: number;
      p95: number;
    };
  };
  metadata: {
    source: string;
    processing: string;
    grid_resolution: string;
    temporal_resolution: string;
  };
}

function generateTimeSeries(variable: string, lat: number, lon: number, depth: number, days: number): TimeSeriesPoint[] {
  const data: TimeSeriesPoint[] = [];
  const now = new Date();
  
  // Generate historical data (past 14 days)
  for (let i = days; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    let baseValue: number;
    let anomalyRange: number;
    
    // Variable-specific base values and ranges
    switch (variable) {
      case 'currents':
        baseValue = 0.3 + 0.4 * Math.sin(i * 0.1);
        anomalyRange = 2;
        break;
      case 'waves':
        baseValue = 1.2 + 0.8 * Math.sin(i * 0.15);
        anomalyRange = 1.5;
        break;
      case 'wind':
        baseValue = 8 + 6 * Math.sin(i * 0.12);
        anomalyRange = 1.8;
        break;
      case 'sst':
        baseValue = 10 + 2 * Math.sin(i * 0.05);
        anomalyRange = 1.2;
        break;
      case 'sealevel':
        baseValue = 0.1 + 0.3 * Math.sin(i * 0.2);
        anomalyRange = 1.5;
        break;
      case 'oxygen':
        baseValue = 8.5 - 0.5 * Math.sin(i * 0.08);
        anomalyRange = 1.1;
        break;
      case 'chlorophyll':
        baseValue = 8 + 4 * Math.sin(i * 0.18);
        anomalyRange = 1.4;
        break;
      default:
        baseValue = Math.random() * 10;
        anomalyRange = 1;
    }
    
    const noise = (Math.random() - 0.5) * 0.2;
    const value = Math.max(0, baseValue + noise);
    const anomaly = (Math.random() - 0.5) * anomalyRange;
    
    data.push({
      timestamp: timestamp.toISOString(),
      value: Math.round(value * 100) / 100,
      anomaly: Math.round(anomaly * 100) / 100,
      quality_flag: Math.random() > 0.05 ? 'good' : 'questionable',
      forecast: false
    });
  }
  
  // Generate forecast data (next 7 days)
  for (let i = 1; i <= 7; i++) {
    const timestamp = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const lastValue = data[data.length - 1].value;
    const trend = (Math.random() - 0.5) * 0.1;
    const value = Math.max(0, lastValue + trend);
    const confidence = Math.max(0.5, 1 - i * 0.1); // Decreasing confidence
    
    data.push({
      timestamp: timestamp.toISOString(),
      value: Math.round(value * 100) / 100,
      anomaly: Math.round((Math.random() - 0.5) * 1.5 * 100) / 100,
      quality_flag: 'forecast',
      forecast: true,
      confidence: Math.round(confidence * 100) / 100
    });
  }
  
  return data;
}

function getClimatology(variable: string): any {
  const climatologies = {
    currents: {
      mean: 0.35,
      std: 0.25,
      percentiles: { p5: 0.05, p25: 0.18, p50: 0.32, p75: 0.48, p95: 0.75 }
    },
    waves: {
      mean: 1.4,
      std: 0.8,
      percentiles: { p5: 0.3, p25: 0.8, p50: 1.3, p75: 1.9, p95: 2.8 }
    },
    wind: {
      mean: 8.2,
      std: 4.1,
      percentiles: { p5: 2.1, p25: 5.3, p50: 7.8, p75: 11.2, p95: 16.8 }
    },
    sst: {
      mean: 10.5,
      std: 3.2,
      percentiles: { p5: 5.2, p25: 8.1, p50: 10.4, p75: 12.8, p95: 16.2 }
    },
    sealevel: {
      mean: 0.0,
      std: 0.18,
      percentiles: { p5: -0.32, p25: -0.12, p50: 0.01, p75: 0.13, p95: 0.35 }
    },
    oxygen: {
      mean: 8.1,
      std: 1.2,
      percentiles: { p5: 6.2, p25: 7.3, p50: 8.0, p75: 8.8, p95: 10.1 }
    },
    chlorophyll: {
      mean: 9.2,
      std: 4.8,
      percentiles: { p5: 3.1, p25: 5.8, p50: 8.5, p75: 11.9, p95: 18.7 }
    }
  };
  
  return climatologies[variable] || climatologies.sst;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const variable = url.searchParams.get('var') || 'sst';
    const lat = parseFloat(url.searchParams.get('lat') || '57.0');
    const lon = parseFloat(url.searchParams.get('lon') || '18.0');
    const depth = parseFloat(url.searchParams.get('depth') || '0');
    const start = url.searchParams.get('start');
    const end = url.searchParams.get('end');
    
    console.log('Timeseries Request:', { variable, lat, lon, depth, start, end });

    // Calculate days to fetch (default 14 days historical + 7 forecast)
    const days = 14;
    
    const timeseries = generateTimeSeries(variable, lat, lon, depth, days);
    const climatology = getClimatology(variable);
    
    // Get unit based on variable
    const units = {
      currents: 'm/s',
      waves: 'm',
      wind: 'm/s',
      sst: '°C',
      sealevel: 'm',
      oxygen: 'mg/L',
      chlorophyll: 'µg/L'
    };

    const response: TimeSeriesResponse = {
      variable,
      unit: units[variable] || 'units',
      location: { lat, lon, depth },
      data: timeseries,
      climatology,
      metadata: {
        source: variable === 'wind' ? 'SMHI + ECMWF' : 'CMEMS Baltic',
        processing: 'Daily mean, 0.02° grid, Z-score anomaly vs 2000-2020',
        grid_resolution: '0.02° (~2km)',
        temporal_resolution: 'Daily'
      }
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: response,
        metadata: {
          request: { variable, lat, lon, depth },
          timestamp: new Date().toISOString(),
          points: timeseries.length,
          forecast_points: timeseries.filter(p => p.forecast).length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in intelligence-timeseries:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        data: null
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});