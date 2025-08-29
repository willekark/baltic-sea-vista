import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Navigation, 
  Waves, 
  Wind, 
  Thermometer, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Clock,
  Info,
  ExternalLink,
  MapPin,
  AlertTriangle,
  Loader2,
  Snowflake,
  Droplets,
  Leaf,
  Eye,
  Layers
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MarineTileDetail from './MarineTileDetail';

interface MarineTileData {
  id: string;
  name: string;
  icon: string;
  primaryValue: number;
  primaryUnit: string;
  status: 'good' | 'warning' | 'alert' | 'severe';
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  lastUpdate: string;
  forecastHorizon: string;
  sparklineData: number[];
  anomalyScore: number;
  thresholdType: 'absolute' | 'anomaly' | 'combined';
  depthSupported: boolean;
  secondaryMetrics?: Array<{
    label: string;
    value: number;
    unit: string;
  }>;
}

const MarineDataDashboard: React.FC = () => {
  const [selectedDepth, setSelectedDepth] = useState('surface');
  const [timeMode, setTimeMode] = useState('nowcast');
  const [basin, setBasin] = useState('baltic_proper');
  const [marineData, setMarineData] = useState<MarineTileData[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailTile, setDetailTile] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetchMarineData();
  }, [basin, selectedDepth, timeMode]);

  const fetchMarineData = async () => {
    try {
      setLoading(true);
      console.log('Fetching marine data with params:', { basin, depth: selectedDepth, timeMode });
      
      const { data, error } = await supabase.functions.invoke('fetch-baltic-marine-data', {
        body: {
          basin,
          depth: selectedDepth,
          timeMode
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        toast.error('Failed to fetch marine data');
        return;
      }

      if (data.success) {
        setMarineData(data.data);
        setEvents(data.events || []);
        console.log('Marine data loaded:', data.data.length, 'tiles');
      } else {
        console.error('API error:', data.error);
        toast.error('Error loading marine data');
      }
    } catch (error) {
      console.error('Error fetching marine data:', error);
      toast.error('Failed to connect to marine data service');
    } finally {
      setLoading(false);
    }
  };

  // Icon mapping
  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ElementType> = {
      Navigation,
      Waves, 
      Wind,
      Thermometer,
      Activity,
      Snowflake,
      Droplets,
      Leaf,
      Eye,
      Layers,
      AlertTriangle
    };
    return icons[iconName] || Activity;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'alert': return 'bg-red-100 text-red-800 border-red-200';
      case 'severe': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
  };

  const renderSparkline = (data: number[]) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    return (
      <div className="flex items-end space-x-1 h-8">
        {data.map((value, index) => (
          <div
            key={index}
            className="bg-primary/60 rounded-sm"
            style={{
              width: '4px',
              height: `${((value - min) / range) * 100}%`,
              minHeight: '2px'
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Global Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Baltic Marine Data Dashboard
            {loading && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Basin:</label>
              <Select value={basin} onValueChange={setBasin}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baltic_proper">Baltic Proper</SelectItem>
                  <SelectItem value="bothnian_bay">Bothnian Bay</SelectItem>
                  <SelectItem value="bothnian_sea">Bothnian Sea</SelectItem>
                  <SelectItem value="gulf_of_finland">Gulf of Finland</SelectItem>
                  <SelectItem value="gulf_of_riga">Gulf of Riga</SelectItem>
                  <SelectItem value="kattegat">Kattegat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Depth:</label>
              <Select value={selectedDepth} onValueChange={setSelectedDepth}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="surface">Surface (0-1m)</SelectItem>
                  <SelectItem value="5m">5 m</SelectItem>
                  <SelectItem value="10m">10 m</SelectItem>
                  <SelectItem value="20m">20 m</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Time Mode:</label>
              <Select value={timeMode} onValueChange={setTimeMode}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nowcast">Nowcast</SelectItem>
                  <SelectItem value="forecast_24h">+24h Forecast</SelectItem>
                  <SelectItem value="forecast_72h">+72h Forecast</SelectItem>
                  <SelectItem value="forecast_7d">+7d Forecast</SelectItem>
                  <SelectItem value="climatology">Climatology</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marine Data Tiles */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Events & Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 9 }, (_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {marineData.map((tile) => {
                const IconComponent = getIcon(tile.icon);
                
                return (
                  <Card key={tile.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="w-5 h-5 text-primary" />
                          <CardTitle className="text-base">{tile.name}</CardTitle>
                        </div>
                        <Badge className={getStatusColor(tile.status)}>
                          {tile.status}
                        </Badge>
                      </div>
                      
                      {/* Metadata */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Updated: {new Date(tile.lastUpdate).toLocaleTimeString()}
                        </div>
                        <div>Forecast: {tile.forecastHorizon}</div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Primary Metric */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-primary">
                            {tile.primaryValue} {tile.primaryUnit}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            {getTrendIcon(tile.trend)}
                            <span className="ml-1">
                              {tile.trend === 'up' ? '+' : tile.trend === 'down' ? '' : '±'}
                              {tile.trendValue} (7d avg)
                            </span>
                          </div>
                        </div>
                        
                        {/* Sparkline */}
                        <div className="flex-shrink-0">
                          {renderSparkline(tile.sparklineData)}
                        </div>
                      </div>

                      {/* Secondary Metrics */}
                      {tile.secondaryMetrics && (
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {tile.secondaryMetrics.map((metric, index) => (
                            <div key={index}>
                              <div className="text-gray-600">{metric.label}</div>
                              <div className="font-semibold">
                                {metric.value} {metric.unit}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Anomaly Info */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center text-xs text-gray-500">
                          <Info className="w-3 h-3 mr-1" />
                          Z-score: {tile.anomalyScore.toFixed(1)} | {tile.thresholdType}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2"
                          onClick={() => setDetailTile({ id: tile.id, name: tile.name })}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Explore
                        </Button>
                      </div>

                      {/* Depth indicator for supported tiles */}
                      {tile.depthSupported && (
                        <div className="absolute top-2 right-2 bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                          {selectedDepth}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sprint C Analytics - Complete</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 text-green-600">✅ Sprint A Complete</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Surface Currents (speed, direction)</li>
                    <li>• Significant Wave Height (Hs, period)</li>
                    <li>• Wind Speed & Gusts (10m)</li>
                    <li>• Sea Surface Temperature + MHW</li>
                    <li>• Sea Level & Storm Surge</li>
                  </ul>
                </Card>
                
                <Card className="p-4">
                  <h4 className="font-semibold mb-3 text-blue-600">✅ Sprint B Complete</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Sea Ice (concentration, thickness, drift)</li>
                    <li>• Dissolved Oxygen & Hypoxia detection</li>
                    <li>• Chlorophyll-a & HAB Risk assessment</li>
                    <li>• Water Clarity (TSM, Secchi depth)</li>
                  </ul>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3 text-purple-600">✅ Sprint C Complete</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Mixed Layer Depth & Stratification</li>
                    <li>• Nutrients (NO₃⁻, PO₄³⁻, SiO₄)</li>
                    <li>• Fronts & Upwelling Index</li>
                    <li>• Coastal Flood Risk</li>
                  </ul>
                </Card>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold mb-2 text-green-800">🎉 Complete Baltic Marine Monitoring System</h4>
                <p className="text-sm text-green-600 mb-3">
                  Full implementation includes 13 marine data tiles with basin-specific thresholds, anomaly detection, and real-time alerting.
                </p>
                <div className="text-xs text-green-500">
                  Features: Z-score anomaly detection • Basin-specific climatology • Multi-depth support • Event detection & alerts
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Marine Events & Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.length > 0 ? events.map((event, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border ${
                      event.severity === 'alert' ? 'bg-red-50 border-red-200' :
                      event.severity === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <AlertTriangle className={`w-5 h-5 mr-2 ${
                        event.severity === 'alert' ? 'text-red-600' :
                        event.severity === 'warning' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                      <div>
                        <div className={`font-semibold ${
                          event.severity === 'alert' ? 'text-red-800' :
                          event.severity === 'warning' ? 'text-yellow-800' :
                          'text-blue-800'
                        }`}>
                          {event.title}
                        </div>
                        <div className={`text-sm ${
                          event.severity === 'alert' ? 'text-red-600' :
                          event.severity === 'warning' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`}>
                          {event.description}
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <Activity className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <div className="font-semibold text-green-800">No Active Alerts</div>
                        <div className="text-sm text-green-600">
                          All monitored parameters within normal ranges for {basin.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center py-8">
                  <div className="text-sm text-gray-500">
                    Alert types: Marine Heatwaves • Hypoxia Events • HAB Alerts • Severe Sea States • Icing Risk • Flood Alerts • Stratification Events
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      {detailTile && (
        <MarineTileDetail
          tileId={detailTile.id}
          tileName={detailTile.name}
          onClose={() => setDetailTile(null)}
        />
      )}
    </div>
  );
};

export default MarineDataDashboard;