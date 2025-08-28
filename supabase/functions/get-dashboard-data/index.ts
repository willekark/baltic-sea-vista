import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const formatIndicatorValue = (type: string, value: number, metadata: any) => {
  switch (type) {
    case 'oxygen_levels':
      return `${value.toFixed(1)} mg/L`;
    case 'sea_temperature':
      return `${value.toFixed(1)}°C`;
    case 'shipping_intensity':
      return value.toLocaleString();
    case 'fish_stock_index':
      return value.toFixed(2);
    case 'wave_height':
      return `${value.toFixed(1)}m`;
    case 'wind_speed':
      return `${value.toFixed(1)} m/s`;
    default:
      return value.toString();
  }
};

const getIndicatorIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    oxygen_levels: 'Activity',
    sea_temperature: 'Thermometer', 
    shipping_intensity: 'Ship',
    fish_stock_index: 'Fish',
    wave_height: 'Waves',
    wind_speed: 'Wind'
  };
  return iconMap[type] || 'Activity';
};

const getIndicatorColor = (type: string, status: string) => {
  if (status === 'critical') return 'text-destructive';
  if (status === 'warning') return 'text-warning';
  if (status === 'excellent') return 'text-primary';
  return 'text-secondary';
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch latest data summaries
    const { data: summaries, error } = await supabase
      .from('data_summaries')
      .select('*')
      .eq('region', 'baltic_sea')
      .order('calculation_date', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    // If no data, trigger data fetch
    if (!summaries || summaries.length === 0) {
      console.log('No summaries found, triggering data fetch...');
      
      // Call the fetch-baltic-data function to populate data
      const fetchResponse = await fetch(`${supabaseUrl}/functions/v1/fetch-baltic-data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (fetchResponse.ok) {
        // Re-fetch summaries after data population
        const { data: newSummaries } = await supabase
          .from('data_summaries')
          .select('*')
          .eq('region', 'baltic_sea')
          .order('calculation_date', { ascending: false })
          .limit(10);
        
        if (newSummaries && newSummaries.length > 0) {
          return formatDashboardResponse(newSummaries);
        }
      }
      
      // If still no data, return mock data
      return getMockDashboardData();
    }

    return formatDashboardResponse(summaries);

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    // Return mock data as fallback
    return getMockDashboardData();
  }
});

function formatDashboardResponse(summaries: any[]) {
  const indicators = summaries.map(summary => ({
    title: summary.indicator_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    value: formatIndicatorValue(summary.indicator_type, summary.current_value, summary.metadata),
    change: summary.change_percent || 0,
    trend: summary.trend as 'up' | 'down' | 'stable',
    icon: getIndicatorIcon(summary.indicator_type),
    color: getIndicatorColor(summary.indicator_type, summary.status),
    status: summary.status as 'excellent' | 'good' | 'warning' | 'critical',
    lastUpdated: summary.updated_at
  }));

  return new Response(JSON.stringify({
    success: true,
    indicators,
    timestamp: new Date().toISOString(),
    dataSource: 'realtime'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function getMockDashboardData() {
  const mockIndicators = [
    {
      title: "Oxygen Levels",
      value: "7.2 mg/L",
      change: -2.1,
      trend: "down" as const,
      icon: "Activity",
      color: "text-destructive",
      status: "critical" as const
    },
    {
      title: "Sea Temperature", 
      value: "14.8°C",
      change: 1.3,
      trend: "up" as const,
      icon: "Thermometer",
      color: "text-secondary", 
      status: "good" as const
    },
    {
      title: "Shipping Intensity",
      value: "2,847",
      change: 12.5,
      trend: "up" as const,
      icon: "Ship",
      color: "text-primary",
      status: "warning" as const
    },
    {
      title: "Fish Stock Index",
      value: "0.67", 
      change: -8.3,
      trend: "down" as const,
      icon: "Fish",
      color: "text-accent",
      status: "warning" as const
    },
    {
      title: "Wave Height",
      value: "1.2m",
      change: 0.3, 
      trend: "up" as const,
      icon: "Waves",
      color: "text-secondary",
      status: "good" as const
    },
    {
      title: "Wind Speed",
      value: "8.5 m/s",
      change: -1.2,
      trend: "down" as const, 
      icon: "Wind",
      color: "text-muted-foreground",
      status: "excellent" as const
    }
  ];

  return new Response(JSON.stringify({
    success: true,
    indicators: mockIndicators,
    timestamp: new Date().toISOString(),
    dataSource: 'mock'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}