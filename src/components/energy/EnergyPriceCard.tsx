import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const mockPriceData = {
  'SE1': [
    { time: '00:00', price: 45.2 },
    { time: '06:00', price: 52.1 },
    { time: '12:00', price: 68.5 },
    { time: '18:00', price: 71.3 },
    { time: '24:00', price: 49.8 }
  ],
  'SE3': [
    { time: '00:00', price: 48.1 },
    { time: '06:00', price: 55.3 },
    { time: '12:00', price: 72.1 },
    { time: '18:00', price: 75.2 },
    { time: '24:00', price: 51.7 }
  ],
  'DK1': [
    { time: '00:00', price: 41.7 },
    { time: '06:00', price: 48.9 },
    { time: '12:00', price: 63.2 },
    { time: '18:00', price: 66.8 },
    { time: '24:00', price: 46.1 }
  ]
};

const EnergyPriceCard = () => {
  const [selectedZone, setSelectedZone] = useState('SE3');
  const currentPrice = 72.1;
  const priceChange = 5.8;
  const isPositive = priceChange > 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-lg">Nord Pool Spot Prices</CardTitle>
          </div>
          <Select value={selectedZone} onValueChange={setSelectedZone}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SE1">SE1</SelectItem>
              <SelectItem value="SE3">SE3</SelectItem>
              <SelectItem value="DK1">DK1</SelectItem>
              <SelectItem value="FI">FI</SelectItem>
              <SelectItem value="NO2">NO2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardDescription>Real-time electricity prices by bidding zone</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold">{currentPrice} €/MWh</span>
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-red-500' : 'text-green-500'}`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {Math.abs(priceChange)}€
          </div>
        </div>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockPriceData[selectedZone as keyof typeof mockPriceData]}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis hide />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnergyPriceCard;