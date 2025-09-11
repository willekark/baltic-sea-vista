import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Wind, MapPin, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface WindFarm {
  name: string;
  capacity: number;
  status: 'operational' | 'under-construction' | 'planned';
  year: number;
  location: string;
}

const mockWindFarms: WindFarm[] = [
  { name: 'Horns Rev 3', capacity: 407, status: 'operational', year: 2019, location: 'Danish North Sea' },
  { name: 'Kriegers Flak', capacity: 604, status: 'operational', year: 2021, location: 'Baltic Sea' },
  { name: 'Vineyard Wind 1', capacity: 800, status: 'under-construction', year: 2024, location: 'US East Coast' },
  { name: 'Baltic Eagle', capacity: 476, status: 'under-construction', year: 2024, location: 'German Baltic' },
  { name: 'Sophia', capacity: 1100, status: 'planned', year: 2027, location: 'UK North Sea' },
  { name: 'Aurora', capacity: 900, status: 'planned', year: 2028, location: 'Baltic Sea' }
];

const OffshoreWindTimeline = () => {
  const [yearRange, setYearRange] = useState([2019]);
  const selectedYear = yearRange[0];
  
  const filteredFarms = mockWindFarms.filter(farm => farm.year <= selectedYear);
  const totalCapacity = filteredFarms.reduce((sum, farm) => sum + farm.capacity, 0);
  
  const yearlyData = Array.from({ length: 10 }, (_, i) => {
    const year = 2019 + i;
    const capacity = mockWindFarms
      .filter(farm => farm.year <= year)
      .reduce((sum, farm) => sum + farm.capacity, 0);
    return { year, capacity };
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wind className="h-5 w-5 text-blue-500" />
          <CardTitle>Offshore Wind Timeline</CardTitle>
        </div>
        <CardDescription>Operational and planned offshore wind capacity growth</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Timeline Year</span>
              <Badge variant="outline">{selectedYear}</Badge>
            </div>
            <Slider
              value={yearRange}
              onValueChange={setYearRange}
              min={2019}
              max={2028}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>2019</span>
              <span>2028</span>
            </div>
          </div>

          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="year" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <Bar 
                  dataKey="capacity" 
                  fill="hsl(var(--primary))"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalCapacity.toLocaleString()} MW
              </div>
              <div className="text-muted-foreground">Cumulative Capacity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredFarms.length}
              </div>
              <div className="text-muted-foreground">Wind Farms</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Active Projects ({selectedYear})
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {filteredFarms.map((farm, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div>
                    <div className="font-medium text-sm">{farm.name}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {farm.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">{farm.capacity} MW</div>
                    <Badge 
                      variant={farm.status === 'operational' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {farm.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OffshoreWindTimeline;