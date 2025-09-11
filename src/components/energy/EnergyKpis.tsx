import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Wind, Plug, Fuel } from 'lucide-react';

const EnergyKpis = () => {
  // Mock data
  const kpis = {
    avg_price_eur_mwh: 72.1,
    offshore_wind_mw: 1420,
    ops_coverage_pct: 0.68,
    green_fuel_ports: 12
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Zap className="h-8 w-8 text-yellow-500" />
            <div>
              <div className="text-2xl font-bold">€{kpis.avg_price_eur_mwh}</div>
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
              <div className="text-2xl font-bold">{kpis.offshore_wind_mw} MW</div>
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
              <div className="text-2xl font-bold">{Math.round(kpis.ops_coverage_pct * 100)}%</div>
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
              <div className="text-2xl font-bold">{kpis.green_fuel_ports}</div>
              <div className="text-sm text-muted-foreground">Green Fuel Ports</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnergyKpis;