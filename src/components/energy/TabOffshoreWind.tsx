import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wind, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import OffshoreWindTimeline from './OffshoreWindTimeline';

const TabOffshoreWind = () => {
  // Mock data
  const latestWind = {
    gen_mw: 1420,
    ts: new Date().toISOString()
  };

  // Mock forecast data for chart
  const forecastChartData = Array.from({ length: 48 }, (_, i) => ({
    time: `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`,
    forecast: 1200 + Math.random() * 800 + Math.sin(i / 48 * 4 * Math.PI) * 400,
  }));

  // Calculate capacity factor (assuming 4000 MW total capacity)
  const totalCapacity = 4000;
  const capacityFactor = Math.round((latestWind.gen_mw / totalCapacity) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <OffshoreWindTimeline />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-blue-600" />
            Wind Generation & Forecast
          </CardTitle>
          <CardDescription>Current generation and 48h forecast</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {latestWind.gen_mw} MW
              </div>
              <div className="text-sm text-muted-foreground">Current Generation</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-muted/50 rounded">
                <div className="font-bold text-green-600">{capacityFactor}%</div>
                <div className="text-muted-foreground">Capacity Factor</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded">
                <div className="font-bold text-blue-600">
                  {new Date(latestWind.ts).toLocaleTimeString()}
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
            
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={forecastChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${Math.round(Number(value))} MW`, 'Forecast']}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TabOffshoreWind;