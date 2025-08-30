import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SummaryParams {
  t0?: string;
  horizon?: string;
  bbox?: string;
  basin?: string;
  depth?: string;
}

interface VariableStatus {
  variable: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'alert';
  anomaly: number;
  anomaly_method: string;
  last_update: string;
  forecast_horizon: string;
  quality_flag: string;
  thresholds: Record<string, number>;
  secondary_metrics?: Record<string, any>;
}

// Threshold configurations per variable and basin
const THRESHOLDS = {
  currents: { good: 0.5, warning: 0.5, alert: 0.8 },
  waves: { good: 1.5, warning: 1.5, alert: 3.0 },
  wind: { good: 8, warning: 8, alert: 14, severe: 20 },
  sealevel: { good: 0.30, warning: 0.30, alert: 0.60 },
  sst: { good: 1, warning: 1, alert: 2 },
  oxygen: { good: 4, warning: 4, alert: 2, severe: 1.4 },
  chlorophyll: { 
    chla: { good: 10, warning: 10, alert: 20 },
    hab: { good: 0.3, warning: 0.3, alert: 0.6 }
  },
  seaice: {
    thickness: { good: 10, warning: 10, alert: 30 },
    drift: { good: 10, warning: 10, alert: 20 }
  }
};

function determineStatus(value: number, thresholds: any, anomaly?: number): 'good' | 'warning' | 'alert' {
  // First check absolute thresholds
  if (thresholds.alert && value >= thresholds.alert) return 'alert';
  if (thresholds.warning && value >= thresholds.warning) return 'warning';
  
  // Then check anomaly severity
  if (anomaly !== undefined) {
    if (Math.abs(anomaly) >= 2) return 'alert';
    if (Math.abs(anomaly) >= 1) return 'warning';
  }
  
  return 'good';
}

function generateMockSummary(params: SummaryParams): VariableStatus[] {
  const now = new Date().toISOString();
  const horizon = params.horizon || '24h';
  
  return [
    {
      variable: 'currents',
      value: 0.42,
      unit: 'm/s',
      status: determineStatus(0.42, THRESHOLDS.currents, 0.8),
      anomaly: 0.8,
      anomaly_method: 'Z-score vs 2000-2020 climatology',
      last_update: now,
      forecast_horizon: '7 days',
      quality_flag: 'good',
      thresholds: THRESHOLDS.currents,
      secondary_metrics: {
        direction: 165,
        max_speed: 0.58
      }
    },
    {
      variable: 'waves',
      value: 2.2,
      unit: 'm',
      status: determineStatus(2.2, THRESHOLDS.waves, 1.1),
      anomaly: 1.1,
      anomaly_method: 'Z-score vs 2000-2020 climatology',
      last_update: now,
      forecast_horizon: '5 days',
      quality_flag: 'good',
      thresholds: THRESHOLDS.waves,
      secondary_metrics: {
        peak_period: 5.2,
        direction: 320
      }
    },
    {
      variable: 'wind',
      value: 12.5,
      unit: 'm/s',
      status: determineStatus(12.5, THRESHOLDS.wind, 1.2),
      anomaly: 1.2,
      anomaly_method: 'Z-score vs 2000-2020 climatology',
      last_update: now,
      forecast_horizon: '7 days',
      quality_flag: 'good',
      thresholds: THRESHOLDS.wind,
      secondary_metrics: {
        gusts: 18.2,
        direction: 275
      }
    },
    {
      variable: 'sealevel',
      value: 0.15,
      unit: 'm',
      status: determineStatus(0.15, THRESHOLDS.sealevel, -0.5),
      anomaly: -0.5,
      anomaly_method: 'Z-score vs 2000-2020 climatology',
      last_update: now,
      forecast_horizon: '3 days',
      quality_flag: 'good',
      thresholds: THRESHOLDS.sealevel,
      secondary_metrics: {
        tide: -0.12,
        surge: 0.27
      }
    },
    {
      variable: 'sst',
      value: 11.2,
      unit: '°C',
      status: determineStatus(11.2, THRESHOLDS.sst, 0.6),
      anomaly: 0.6,
      anomaly_method: 'Z-score vs 2000-2020 climatology',
      last_update: now,
      forecast_horizon: '5 days',
      quality_flag: 'good',
      thresholds: THRESHOLDS.sst,
      secondary_metrics: {
        mhw_status: 0,
        anomaly_magnitude: 0.6
      }
    },
    {
      variable: 'seaice',
      value: 0,
      unit: '%',
      status: 'good',
      anomaly: 0,
      anomaly_method: 'Z-score vs 2000-2020 climatology',
      last_update: now,
      forecast_horizon: 'N/A',
      quality_flag: 'good',
      thresholds: THRESHOLDS.seaice,
      secondary_metrics: {
        thickness: 0,
        drift_speed: 0
      }
    },
    {
      variable: 'oxygen',
      value: 8.4,
      unit: 'mg/L',
      status: determineStatus(8.4, THRESHOLDS.oxygen, 0.9),
      anomaly: 0.9,
      anomaly_method: 'Z-score vs 2000-2020 climatology',
      last_update: now,
      forecast_horizon: '3 days',
      quality_flag: 'good',
      thresholds: THRESHOLDS.oxygen,
      secondary_metrics: {
        saturation: 84,
        hypoxia_risk: 0.15
      }
    },
    {
      variable: 'chlorophyll',
      value: 12.8,
      unit: 'µg/L',
      status: determineStatus(12.8, THRESHOLDS.chlorophyll.chla, 1.3),
      anomaly: 1.3,
      anomaly_method: 'Z-score vs 2000-2020 climatology',
      last_update: now,
      forecast_horizon: '5 days',
      quality_flag: 'good',
      thresholds: THRESHOLDS.chlorophyll,
      secondary_metrics: {
        hab_probability: 0.42,
        cyanobacteria_index: 1.8
      }
    }
  ];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const params: SummaryParams = {
      t0: url.searchParams.get('t0') || undefined,
      horizon: url.searchParams.get('horizon') || '24h',
      bbox: url.searchParams.get('bbox') || undefined,
      basin: url.searchParams.get('basin') || 'baltic_proper',
      depth: url.searchParams.get('depth') || 'surface'
    };

    console.log('Intelligence Summary Request:', params);

    // Generate summary data
    const summary = generateMockSummary(params);

    return new Response(
      JSON.stringify({
        success: true,
        data: summary,
        metadata: {
          basin: params.basin,
          depth: params.depth,
          horizon: params.horizon,
          timestamp: new Date().toISOString(),
          bbox: params.bbox,
          data_sources: [
            'CMEMS Baltic',
            'SMHI Open Data',
            'EMODnet',
            'HELCOM'
          ],
          quality_summary: {
            overall: 'good',
            coverage: 0.95,
            timeliness: 'current'
          }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in intelligence-summary:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        data: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});