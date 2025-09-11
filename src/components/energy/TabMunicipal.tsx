import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building } from 'lucide-react';

const TabMunicipal = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-indigo-600" />
          Municipal Energy Demand
        </CardTitle>
        <CardDescription>District heating, industrial, and household consumption patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium">District Heating Share</h4>
            {[
              { city: 'Helsinki', share: 92 },
              { city: 'Stockholm', share: 88 },
              { city: 'Copenhagen', share: 85 },
              { city: 'Riga', share: 78 }
            ].map((city, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{city.city}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${city.share}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{city.share}%</span>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <h4 className="font-medium">Consumption Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Industrial</span>
                <span className="text-sm font-medium">45%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Residential</span>
                <span className="text-sm font-medium">35%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Commercial</span>
                <span className="text-sm font-medium">20%</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TabMunicipal;