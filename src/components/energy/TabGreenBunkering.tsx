import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Fuel } from 'lucide-react';

const TabGreenBunkering = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fuel className="h-5 w-5 text-orange-600" />
          Green Fuel Infrastructure
        </CardTitle>
        <CardDescription>LNG, methanol, and hydrogen bunkering facilities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">18</div>
            <div className="text-sm text-blue-600">LNG Terminals</div>
            <div className="text-xs text-muted-foreground mt-1">2.4M m³ capacity</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="text-2xl font-bold text-green-700">7</div>
            <div className="text-sm text-green-600">Methanol Facilities</div>
            <div className="text-xs text-muted-foreground mt-1">450k tons/year</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">3</div>
            <div className="text-sm text-purple-600">Hydrogen Hubs</div>
            <div className="text-xs text-muted-foreground mt-1">150 tons/day</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TabGreenBunkering;