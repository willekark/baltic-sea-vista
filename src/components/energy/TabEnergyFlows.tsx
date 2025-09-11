import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useFingridLoad, useFingridGenerationMix } from '@/hooks/useFingridData';
import FlowMapLayer from './FlowMapLayer';

const TabEnergyFlows = () => {
  const { data: loadData, loading: loadLoading } = useFingridLoad();
  const { data: mixData, loading: mixLoading } = useFingridGenerationMix();

  // Process load data for chart
  const loadChartData = loadData.slice(-24).map(item => ({
    time: new Date(item.ts).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }),
    load: item.load_mw,
    timestamp: item.ts
  }));

  // Process generation mix for latest values
  const latestGeneration = mixData.reduce((acc, item) => {
    const timestamp = new Date(item.ts).getTime();
    if (!acc[item.fuel_type] || new Date(acc[item.fuel_type].ts).getTime() < timestamp) {
      acc[item.fuel_type] = item;
    }
    return acc;
  }, {} as Record<string, any>);

  const fuelTypeColors = {
    nuclear: '#8B5CF6',
    hydro: '#3B82F6', 
    wind_onshore: '#10B981',
    fossil: '#EF4444',
    wind_offshore: '#06B6D4',
    solar: '#F59E0B',
    biomass: '#84CC16'
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              FI Load Profile (24h)
            </CardTitle>
            <CardDescription>Real-time electricity consumption</CardDescription>
          </CardHeader>
          <CardContent>
            {loadLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading load data...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={loadChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} MW`, 'Load']}
                    labelFormatter={(label) => `Time: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="load" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              FI Generation Mix (Current)
            </CardTitle>
            <CardDescription>Live generation by fuel type</CardDescription>
          </CardHeader>
          <CardContent>
            {mixLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading generation data...</div>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.values(latestGeneration).map((item: any) => (
                  <div key={item.fuel_type} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: fuelTypeColors[item.fuel_type as keyof typeof fuelTypeColors] || '#6B7280' }}
                      />
                      <span className="font-medium capitalize">{item.fuel_type.replace('_', ' ')}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{item.gen_mw} MW</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.ts).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <FlowMapLayer />
    </div>
  );
};

export default TabEnergyFlows;