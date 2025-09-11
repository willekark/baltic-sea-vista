import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Wind, Plug, Fuel } from 'lucide-react';

const EnergyKpis = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Zap className="h-8 w-8 text-yellow-500" />
            <div>
              <div className="text-2xl font-bold">€72.1</div>
              <div className="text-sm text-muted-foreground">Average Price/MWh</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Wind className="h-8 w-8 text-blue-500" />
            <div>
              <div className="text-2xl font-bold">4,287 MW</div>
              <div className="text-sm text-muted-foreground">Offshore Wind</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Plug className="h-8 w-8 text-green-500" />
            <div>
              <div className="text-2xl font-bold">68%</div>
              <div className="text-sm text-muted-foreground">OPS Coverage</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Fuel className="h-8 w-8 text-orange-500" />
            <div>
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-muted-foreground">Green Fuel Ports</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnergyKpis;