import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wind } from 'lucide-react';
import OffshoreWindTimeline from './OffshoreWindTimeline';

const TabOffshoreWind = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <OffshoreWindTimeline />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-blue-600" />
            Wind Generation Forecast
          </CardTitle>
          <CardDescription>Next 48 hours wind power output</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">2,847 MW</div>
              <div className="text-sm text-muted-foreground">Current Generation</div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-muted/50 rounded">
                <div className="font-bold text-green-600">89%</div>
                <div className="text-muted-foreground">Capacity Factor</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded">
                <div className="font-bold text-blue-600">15.2 m/s</div>
                <div className="text-muted-foreground">Avg Wind Speed</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TabOffshoreWind;