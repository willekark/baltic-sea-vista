import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Wind, Plug, Fuel } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useFingridKPIs } from '@/hooks/useFingridData';

const EnergyKpis = () => {
  const { data: kpis, loading, error } = useFingridKPIs();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                <div>
                  <div className="h-8 w-20 bg-muted animate-pulse rounded mb-1" />
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="col-span-full">
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              Failed to load energy KPIs: {error}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Zap className="h-8 w-8 text-yellow-500" />
            <div>
              <div className="text-2xl font-bold">€{kpis?.avg_price_eur_mwh || 72.1}</div>
              <div className="text-sm text-muted-foreground">Average Price/MWh</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Wind className="h-8 w-8 text-blue-500" />
            <div className="flex items-center gap-2">
              <div>
                <div className="text-2xl font-bold">{kpis?.offshore_wind_mw || 1420} MW</div>
                <div className="text-sm text-muted-foreground">Wind Generation (FI)</div>
              </div>
              {kpis?.source_status === 'live' && (
                <Badge variant="outline" className="text-xs">Live</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Plug className="h-8 w-8 text-green-500" />
            <div>
              <div className="text-2xl font-bold">{Math.round((kpis?.ops_coverage_pct || 0.68) * 100)}%</div>
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
              <div className="text-2xl font-bold">{kpis?.green_fuel_ports || 12}</div>
              <div className="text-sm text-muted-foreground">Green Fuel Ports</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnergyKpis;