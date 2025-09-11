import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertTriangle, ArrowRight } from 'lucide-react';

interface EnergyFlow {
  from: string;
  to: string;
  capacity: number;
  flow: number;
  congested: boolean;
}

const mockFlows: EnergyFlow[] = [
  { from: 'SE1', to: 'FI', capacity: 1200, flow: 950, congested: false },
  { from: 'SE3', to: 'DK1', capacity: 1700, flow: 1685, congested: true },
  { from: 'NO2', to: 'DK1', capacity: 1000, flow: 850, congested: false },
  { from: 'LT', to: 'SE4', capacity: 700, flow: 680, congested: true },
  { from: 'DK1', to: 'DE', capacity: 600, flow: 420, congested: false }
];

const FlowMapLayer = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          <CardTitle>Interconnector Flows</CardTitle>
        </div>
        <CardDescription>Real-time electricity flows between bidding zones</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockFlows.map((flow, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{flow.from}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{flow.to}</span>
                {flow.congested && (
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {flow.flow}/{flow.capacity} MW
                </span>
                <Badge variant={flow.congested ? "destructive" : "secondary"}>
                  {Math.round((flow.flow / flow.capacity) * 100)}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Normal flow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Congested</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlowMapLayer;