import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plug, Euro, Fuel } from 'lucide-react';

interface PortOPS {
  port: string;
  opsberths: number;
  totalberths: number;
  tariff: number;
  fuelCost: number;
}

const mockPortsOPS: PortOPS[] = [
  { port: 'Helsinki', opsberths: 12, totalberths: 15, tariff: 0.08, fuelCost: 0.15 },
  { port: 'Stockholm', opsberths: 8, totalberths: 12, tariff: 0.09, fuelCost: 0.16 },
  { port: 'Copenhagen', opsberths: 6, totalberths: 10, tariff: 0.07, fuelCost: 0.14 },
  { port: 'Oslo', opsberths: 4, totalberths: 8, tariff: 0.06, fuelCost: 0.13 },
  { port: 'Riga', opsberths: 3, totalberths: 9, tariff: 0.05, fuelCost: 0.12 }
];

const OPSCoverageBar = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Plug className="h-5 w-5 text-green-500" />
          <CardTitle>Onshore Power Supply (OPS)</CardTitle>
        </div>
        <CardDescription>Port electrification coverage and cost comparison</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockPortsOPS.map((port, index) => {
            const coverage = (port.opsberths / port.totalberths) * 100;
            const savings = ((port.fuelCost - port.tariff) / port.fuelCost) * 100;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{port.port}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {port.opsberths}/{port.totalberths} berths
                    </Badge>
                    <Badge 
                      variant={coverage > 75 ? "default" : coverage > 50 ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {Math.round(coverage)}%
                    </Badge>
                  </div>
                </div>
                
                <Progress value={coverage} className="h-2" />
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Plug className="h-3 w-3 text-green-500" />
                      <span>€{port.tariff}/kWh</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Fuel className="h-3 w-3 text-orange-500" />
                      <span>€{port.fuelCost}/kWh</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <Euro className="h-3 w-3" />
                    <span>{Math.round(savings)}% savings</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(mockPortsOPS.reduce((acc, port) => acc + (port.opsberths / port.totalberths) * 100, 0) / mockPortsOPS.length)}%
              </div>
              <div className="text-muted-foreground">Average OPS Coverage</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {mockPortsOPS.reduce((acc, port) => acc + port.opsberths, 0)}
              </div>
              <div className="text-muted-foreground">Total OPS Berths</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OPSCoverageBar;