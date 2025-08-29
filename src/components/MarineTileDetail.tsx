import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Map, 
  BarChart3,
  Activity,
  Info,
  Calendar,
  MapPin
} from 'lucide-react';

interface MarineTileDetailProps {
  tileId: string;
  tileName: string;
  onClose: () => void;
}

const MarineTileDetail: React.FC<MarineTileDetailProps> = ({ tileId, tileName, onClose }) => {
  const [viewMode, setViewMode] = useState('timeseries');
  const [timeRange, setTimeRange] = useState('7d');

  // Mock detailed data
  const generateTimeSeriesData = (days: number) => {
    const data = [];
    const now = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      data.push({
        timestamp: date.toISOString(),
        value: Math.random() * 10 + 5,
        forecast: i <= 3,
        anomaly: Math.random() * 4 - 2
      });
    }
    return data;
  };

  const timeSeriesData = generateTimeSeriesData(parseInt(timeRange.replace('d', '')));

  const depthProfileData = [
    { depth: 0, value: 14.6, quality: 'good' },
    { depth: 5, value: 14.2, quality: 'good' },
    { depth: 10, value: 13.8, quality: 'good' },
    { depth: 15, value: 12.1, quality: 'warning' },
    { depth: 20, value: 8.9, quality: 'alert' },
    { depth: 25, value: 6.7, quality: 'alert' },
  ];

  const basinStats = [
    { name: 'Baltic Proper', current: 14.6, anomaly: 1.3, trend: 'up' },
    { name: 'Bothnian Bay', current: 12.8, anomaly: 0.8, trend: 'up' },
    { name: 'Gulf of Finland', current: 15.2, anomaly: 1.8, trend: 'up' },
    { name: 'Kattegat', current: 16.1, anomaly: 0.5, trend: 'stable' },
  ];

  const renderTimeSeriesChart = () => {
    const maxValue = Math.max(...timeSeriesData.map(d => d.value));
    const minValue = Math.min(...timeSeriesData.map(d => d.value));
    const range = maxValue - minValue || 1;

    return (
      <div className="h-64 bg-gray-50 rounded-lg p-4">
        <div className="relative h-full">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="border-t border-gray-200" />
            ))}
          </div>
          
          {/* Data line */}
          <svg className="absolute inset-0 w-full h-full">
            <polyline
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
              points={timeSeriesData.map((point, index) => {
                const x = (index / (timeSeriesData.length - 1)) * 100;
                const y = 100 - ((point.value - minValue) / range) * 100;
                return `${x}%,${y}%`;
              }).join(' ')}
            />
            
            {/* Forecast area */}
            <defs>
              <pattern id="forecast" patternUnits="userSpaceOnUse" width="4" height="4">
                <rect width="4" height="4" fill="rgba(59, 130, 246, 0.1)" />
                <path d="m-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" />
              </pattern>
            </defs>
          </svg>
          
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
            <span>{maxValue.toFixed(1)}</span>
            <span>{((maxValue + minValue) / 2).toFixed(1)}</span>
            <span>{minValue.toFixed(1)}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderDepthProfile = () => {
    const maxDepth = Math.max(...depthProfileData.map(d => d.depth));
    
    return (
      <div className="h-64 bg-gray-50 rounded-lg p-4 flex">
        <div className="w-16 flex flex-col justify-between text-xs text-gray-500">
          {depthProfileData.map((point, index) => (
            <span key={index}>{point.depth}m</span>
          ))}
        </div>
        
        <div className="flex-1 relative">
          {depthProfileData.map((point, index) => (
            <div 
              key={index}
              className="flex items-center mb-2 last:mb-0"
              style={{ height: `${100 / depthProfileData.length}%` }}
            >
              <div className="flex-1 bg-white rounded border h-6 flex items-center px-2">
                <div className="text-sm font-medium">{point.value}°C</div>
                <div className="ml-auto">
                  <Badge 
                    className={`text-xs ${
                      point.quality === 'good' ? 'bg-green-100 text-green-800' :
                      point.quality === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {point.quality}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl h-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b bg-white sticky top-0">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{tileName} - Detailed Analytics</h2>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
          
          <div className="flex items-center space-x-4 mt-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">1 Day</SelectItem>
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export NetCDF
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <div className="p-6">
          <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="timeseries">Time Series</TabsTrigger>
              <TabsTrigger value="profile">Depth Profile</TabsTrigger>
              <TabsTrigger value="spatial">Spatial Map</TabsTrigger>
              <TabsTrigger value="statistics">Basin Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="timeseries" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Time Series Analysis
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded mr-2" />
                        Observed
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-300 rounded mr-2" />
                        Forecast
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {renderTimeSeriesChart()}
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-gray-600">Current Value</div>
                        <div className="text-2xl font-bold text-primary">14.6°C</div>
                        <div className="flex items-center text-sm text-green-600">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          +1.3°C (7d avg)
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-gray-600">Anomaly Score</div>
                        <div className="text-2xl font-bold text-yellow-600">+1.4 σ</div>
                        <div className="text-sm text-gray-500">Above seasonal normal</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-gray-600">Forecast Trend</div>
                        <div className="text-2xl font-bold text-blue-600">Stable</div>
                        <div className="text-sm text-gray-500">Next 72h outlook</div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Depth Profile Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderDepthProfile()}
                  
                  <div className="mt-6">
                    <h4 className="font-semibold mb-4">Profile Characteristics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Mixed Layer Depth:</span>
                        <span className="ml-2 font-semibold">12 m</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Stratification:</span>
                        <span className="ml-2 font-semibold">Moderate</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Surface-Bottom Δ:</span>
                        <span className="ml-2 font-semibold">7.9°C</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Thermocline:</span>
                        <span className="ml-2 font-semibold">10-20 m</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="spatial" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Map className="w-5 h-5 mr-2" />
                    Spatial Distribution Map
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Map className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
                      <p className="text-gray-600">
                        Real-time spatial visualization with basin boundaries, 
                        station locations, and interpolated fields
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="statistics" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Basin-wise Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {basinStats.map((basin, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-semibold">{basin.name}</div>
                          <div className="text-2xl text-primary">{basin.current}°C</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Anomaly</div>
                          <div className={`text-lg font-semibold ${
                            basin.anomaly > 1 ? 'text-red-600' : 
                            basin.anomaly > 0.5 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {basin.anomaly > 0 ? '+' : ''}{basin.anomaly}°C
                          </div>
                        </div>
                        <div>
                          {basin.trend === 'up' && <TrendingUp className="w-5 h-5 text-red-500" />}
                          {basin.trend === 'down' && <TrendingDown className="w-5 h-5 text-blue-500" />}
                          {basin.trend === 'stable' && <div className="w-5 h-5 bg-gray-400 rounded-full" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MarineTileDetail;