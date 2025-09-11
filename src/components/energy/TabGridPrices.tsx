import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp } from 'lucide-react';
import EnergyPriceCard from './EnergyPriceCard';

const TabGridPrices = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <EnergyPriceCard />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Price Forecast
          </CardTitle>
          <CardDescription>24-hour price predictions by zone</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['SE1', 'SE3', 'DK1', 'FI'].map((zone) => (
              <div key={zone} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">{zone}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Peak: €78.2</Badge>
                  <Badge variant="secondary">Avg: €65.5</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TabGridPrices;