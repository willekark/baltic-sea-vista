import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import FlowMapLayer from './FlowMapLayer';

const TabEnergyFlows = () => {
  // Mock load data for chart
  const loadChartData = Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, '0')}:00`,
    load: 9000 + Math.random() * 2000 + Math.sin(i / 24 * 2 * Math.PI) * 1000,
  }));

  // Mock generation mix data
  const latestGeneration = {
    nuclear: { fuel_type: 'nuclear', gen_mw: 2700, ts: new Date().toISOString() },
    hydro: { fuel_type: 'hydro', gen_mw: 1150, ts: new Date().toISOString() },
    wind_onshore: { fuel_type: 'wind_onshore', gen_mw: 1420, ts: new Date().toISOString() },
    fossil: { fuel_type: 'fossil', gen_mw: 420, ts: new Date().toISOString() },
    solar: { fuel_type: 'solar', gen_mw: 150, ts: new Date().toISOString() },
    biomass: { fuel_type: 'biomass', gen_mw: 320, ts: new Date().toISOString() }
  };

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
              Load Profile (24h)
            </CardTitle>
            <CardDescription>Electricity consumption forecast</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={loadChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${Math.round(Number(value))} MW`, 'Load']}
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              Generation Mix (Current)
            </CardTitle>
            <CardDescription>Generation by fuel type</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      <FlowMapLayer />
    </div>
  );
};

export default TabEnergyFlows;