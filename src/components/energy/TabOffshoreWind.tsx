import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wind, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFingridWindForecast, useFingridGenerationMix } from '@/hooks/useFingridData';
import OffshoreWindTimeline from './OffshoreWindTimeline';

const TabOffshoreWind = () => {
  const { data: forecastData, loading: forecastLoading } = useFingridWindForecast();
  const { data: mixData, loading: mixLoading } = useFingridGenerationMix('FI', '1h');

  // Get current wind generation from mix data
  const latestWind = mixData
    .filter(item => item.fuel_type === 'wind_onshore')
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())[0];

  // Process forecast data for chart
  const forecastChartData = forecastData.slice(0, 48).map(item => ({
    time: new Date(item.ts).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }),
    forecast: item.forecast_mw,
    timestamp: item.ts
  }));

  // Calculate capacity factor (assuming 4000 MW total capacity)
  const totalCapacity = 4000;
  const capacityFactor = latestWind ? Math.round((latestWind.gen_mw / totalCapacity) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <OffshoreWindTimeline />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-blue-600" />
            FI Wind Generation & Forecast
          </CardTitle>
          <CardDescription>Current generation and 48h forecast</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="text-3xl font-bold text-blue-600">
                  {latestWind?.gen_mw || 0} MW
                </div>
                <Badge variant="outline" className="text-xs">Live</Badge>
              </div>
              <div className="text-sm text-muted-foreground">Current Generation (FI)</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-muted/50 rounded">
                <div className="font-bold text-green-600">{capacityFactor}%</div>
                <div className="text-muted-foreground">Capacity Factor</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded">
                <div className="font-bold text-blue-600">
                  {latestWind ? new Date(latestWind.ts).toLocaleTimeString() : '--:--'}
                </div>
                <div className="text-muted-foreground">Last Update</div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">48h Forecast</span>
            </div>
            
            {forecastLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading forecast...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={forecastChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} MW`, 'Forecast']}
                    labelFormatter={(label) => `Time: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="forecast" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TabOffshoreWind;