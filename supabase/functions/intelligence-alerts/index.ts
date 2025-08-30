import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Alert {
  id: string;
  type: 'environmental' | 'weather' | 'safety' | 'operational';
  severity: 'info' | 'warning' | 'alert' | 'critical';
  title: string;
  description: string;
  variable: string;
  value: number;
  threshold: number;
  unit: string;
  location: {
    lat: number;
    lon: number;
    name: string;
    basin?: string;
  };
  timestamp: string;
  expires_at: string;
  confidence: number;
  source: string;
  deep_link?: string;
}

function generateMockAlerts(): Alert[] {
  const now = new Date();
  const alerts: Alert[] = [];

  // HAB Alert
  alerts.push({
    id: 'hab-001',
    type: 'environmental',
    severity: 'alert',
    title: 'Harmful Algal Bloom Alert',
    description: 'High HAB probability (65%) detected in central Baltic Proper. Cyanobacteria bloom likely developing.',
    variable: 'chlorophyll_hab',
    value: 0.65,
    threshold: 0.6,
    unit: 'probability',
    location: {
      lat: 57.5,
      lon: 18.2,
      name: 'Central Baltic Proper',
      basin: 'baltic_proper'
    },
    timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
    confidence: 0.85,
    source: 'CMEMS + Sentinel-3',
    deep_link: '/intelligence/explore/chlorophyll?lat=57.5&lon=18.2&t=' + now.toISOString()
  });

  // Strong Wind Alert
  alerts.push({
    id: 'wind-002',
    type: 'weather',
    severity: 'warning',
    title: 'Strong Wind Warning',
    description: 'Wind speeds reaching 18 m/s with gusts up to 25 m/s expected in Gulf of Finland.',
    variable: 'wind_speed',
    value: 18,
    threshold: 14,
    unit: 'm/s',
    location: {
      lat: 59.8,
      lon: 25.1,
      name: 'Gulf of Finland',
      basin: 'gulf_of_finland'
    },
    timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    confidence: 0.92,
    source: 'SMHI + ECMWF',
    deep_link: '/intelligence/explore/wind?lat=59.8&lon=25.1&t=' + now.toISOString()
  });

  // Sea Level Alert
  alerts.push({
    id: 'surge-003',
    type: 'safety',
    severity: 'alert',
    title: 'Storm Surge Alert',
    description: 'Significant sea level rise (0.7m above normal) expected along Swedish coast.',
    variable: 'sea_level',
    value: 0.7,
    threshold: 0.6,
    unit: 'm',
    location: {
      lat: 58.6,
      lon: 16.8,
      name: 'Swedish Coast',
      basin: 'baltic_proper'
    },
    timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
    expires_at: new Date(now.getTime() + 36 * 60 * 60 * 1000).toISOString(),
    confidence: 0.78,
    source: 'SMHI Sea Level',
    deep_link: '/intelligence/explore/sealevel?lat=58.6&lon=16.8&t=' + now.toISOString()
  });

  // Hypoxia Alert
  alerts.push({
    id: 'oxygen-004',
    type: 'environmental',
    severity: 'critical',
    title: 'Severe Hypoxia Detected',
    description: 'Dissolved oxygen levels below 1.5 mg/L detected in deep waters. Fish kill risk elevated.',
    variable: 'dissolved_oxygen',
    value: 1.2,
    threshold: 1.4,
    unit: 'mg/L',
    location: {
      lat: 56.2,
      lon: 17.5,
      name: 'Baltic Deep Waters',
      basin: 'baltic_proper'
    },
    timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString(),
    confidence: 0.95,
    source: 'CMEMS Biogeochemistry',
    deep_link: '/intelligence/explore/oxygen?lat=56.2&lon=17.5&depth=bottom&t=' + now.toISOString()
  });

  // Marine Heatwave
  alerts.push({
    id: 'mhw-005',
    type: 'environmental',
    severity: 'warning',
    title: 'Marine Heatwave Developing',
    description: 'Sea surface temperatures 2.1°C above climatological average. Ecosystem stress likely.',
    variable: 'sst',
    value: 2.1,
    threshold: 2.0,
    unit: '°C anomaly',
    location: {
      lat: 55.4,
      lon: 14.2,
      name: 'Öresund',
      basin: 'kattegat'
    },
    timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(now.getTime() + 120 * 60 * 60 * 1000).toISOString(),
    confidence: 0.88,
    source: 'CMEMS SST + Climatology',
    deep_link: '/intelligence/explore/sst?lat=55.4&lon=14.2&t=' + now.toISOString()
  });

  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const severity = url.searchParams.get('severity');
    const type = url.searchParams.get('type');
    const basin = url.searchParams.get('basin');
    const active_only = url.searchParams.get('active_only') === 'true';

    console.log('Alerts Request:', { severity, type, basin, active_only });

    let alerts = generateMockAlerts();

    // Apply filters
    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }
    
    if (type) {
      alerts = alerts.filter(alert => alert.type === type);
    }
    
    if (basin) {
      alerts = alerts.filter(alert => alert.location.basin === basin);
    }

    if (active_only) {
      const now = new Date();
      alerts = alerts.filter(alert => new Date(alert.expires_at) > now);
    }

    const summary = {
      total: alerts.length,
      by_severity: {
        critical: alerts.filter(a => a.severity === 'critical').length,
        alert: alerts.filter(a => a.severity === 'alert').length,
        warning: alerts.filter(a => a.severity === 'warning').length,
        info: alerts.filter(a => a.severity === 'info').length
      },
      by_type: {
        environmental: alerts.filter(a => a.type === 'environmental').length,
        weather: alerts.filter(a => a.type === 'weather').length,
        safety: alerts.filter(a => a.type === 'safety').length,
        operational: alerts.filter(a => a.type === 'operational').length
      }
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: alerts,
        summary,
        metadata: {
          filters: { severity, type, basin, active_only },
          timestamp: new Date().toISOString(),
          alert_engine_version: '2.1',
          update_frequency: '5 minutes'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in intelligence-alerts:', error);
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