import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  MapPin,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  Thermometer,
  Droplets,
  Waves,
  Wind,
  Download,
  RefreshCw,
  Zap,
  Target,
  Eye,
  Calendar,
  Filter,
  Settings,
  BarChart3,
  PieChart as PieChartIcon,
  Map,
  Database,
  Globe,
  Users,
  FileText,
  Bell
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AdvancedAnalyticsData {
  correlations: Array<{
    variable1: string;
    variable2: string;
    correlation: number;
    significance: number;
  }>;
  trends: Array<{
    variable: string;
    trend_direction: string;
    trend_strength: number;
    period_days: number;
  }>;
  anomalies: Array<{
    variable: string;
    timestamp: string;
    expected_value: number;
    actual_value: number;
    anomaly_score: number;
    location: { lat: number; lng: number };
  }>;
  forecasts: Array<{
    variable: string;
    horizon_hours: number;
    predicted_value: number;
    confidence_interval: [number, number];
    accuracy_score: number;
  }>;
}

interface RegionalComparison {
  region: string;
  indicators: Record<string, number>;
  quality_score: number;
  data_completeness: number;
  active_platforms: number;
}

const AdvancedAnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('correlations');
  const [selectedVariable, setSelectedVariable] = useState('temperature');
  const [timeWindow, setTimeWindow] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AdvancedAnalyticsData | null>(null);
  const [regionalData, setRegionalData] = useState<RegionalComparison[]>([]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#82ca9d', '#ffc658', '#ff7300'];

  useEffect(() => {
    loadAdvancedAnalytics();
  }, [selectedVariable, timeWindow]);

  const loadAdvancedAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch advanced analytics from our enhanced ERDDAP processor
      const { data: analytics, error } = await supabase.functions.invoke('enhanced-erddap-processor', {
        body: {
          action: 'advanced_analytics',
          variable: selectedVariable,
          time_window: timeWindow,
          analysis_types: ['correlations', 'trends', 'anomalies', 'forecasts']
        }
      });

      if (error) throw error;

      setAnalyticsData(analytics);

      // Load regional comparison data
      const { data: regionalComp, error: regionalError } = await supabase.functions.invoke('baltic-indicators-processor', {
        body: {
          action: 'regional_comparison',
          time_window: timeWindow
        }
      });

      if (regionalError) throw regionalError;
      setRegionalData(regionalComp?.regions || []);

    } catch (error) {
      console.error('Error loading advanced analytics:', error);
      toast.error('Failed to load advanced analytics');
      
      // Mock data for demonstration
      setAnalyticsData({
        correlations: [
          { variable1: 'temperature', variable2: 'salinity', correlation: -0.65, significance: 0.001 },
          { variable1: 'temperature', variable2: 'dissolved_oxygen', correlation: -0.78, significance: 0.0001 },
          { variable1: 'salinity', variable2: 'chlorophyll', correlation: 0.43, significance: 0.05 },
          { variable1: 'depth', variable2: 'temperature', correlation: -0.89, significance: 0.0001 }
        ],
        trends: [
          { variable: 'temperature', trend_direction: 'increasing', trend_strength: 0.75, period_days: 30 },
          { variable: 'salinity', trend_direction: 'stable', trend_strength: 0.15, period_days: 30 },
          { variable: 'dissolved_oxygen', trend_direction: 'decreasing', trend_strength: 0.55, period_days: 30 }
        ],
        anomalies: Array.from({length: 8}, (_, i) => ({
          variable: ['temperature', 'salinity', 'dissolved_oxygen', 'chlorophyll'][i % 4],
          timestamp: new Date(Date.now() - i * 86400000).toISOString(),
          expected_value: 15 + Math.random() * 10,
          actual_value: 20 + Math.random() * 15,
          anomaly_score: 0.6 + Math.random() * 0.4,
          location: { lat: 57.5 + Math.random(), lng: 17.5 + Math.random() }
        })),
        forecasts: [
          { variable: 'temperature', horizon_hours: 24, predicted_value: 18.5, confidence_interval: [17.2, 19.8], accuracy_score: 0.85 },
          { variable: 'salinity', horizon_hours: 24, predicted_value: 7.2, confidence_interval: [6.8, 7.6], accuracy_score: 0.92 },
          { variable: 'dissolved_oxygen', horizon_hours: 24, predicted_value: 8.4, confidence_interval: [7.9, 8.9], accuracy_score: 0.78 }
        ]
      });

      setRegionalData([
        { region: 'Baltic Proper', indicators: { temperature: 18.5, salinity: 7.2, oxygen: 8.4 }, quality_score: 0.92, data_completeness: 0.88, active_platforms: 15 },
        { region: 'Gulf of Finland', indicators: { temperature: 16.8, salinity: 6.8, oxygen: 9.1 }, quality_score: 0.89, data_completeness: 0.91, active_platforms: 8 },
        { region: 'Gulf of Bothnia', indicators: { temperature: 15.2, salinity: 5.5, oxygen: 10.2 }, quality_score: 0.95, data_completeness: 0.93, active_platforms: 12 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs > 0.7) return 'bg-destructive text-destructive-foreground';
    if (abs > 0.5) return 'bg-warning text-warning-foreground';
    if (abs > 0.3) return 'bg-secondary text-secondary-foreground';
    return 'bg-muted text-muted-foreground';
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const exportAnalytics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-erddap-processor', {
        body: {
          action: 'export_analytics',
          data: analyticsData,
          format: 'csv'
        }
      });

      if (error) throw error;
      
      // Create and download file
      const blob = new Blob([data.csv_content], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `baltic_analytics_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Analytics data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export analytics data');
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({length: 4}).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground">Deep insights into Baltic Sea data patterns</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedVariable} onValueChange={setSelectedVariable}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="temperature">Temperature</SelectItem>
              <SelectItem value="salinity">Salinity</SelectItem>
              <SelectItem value="dissolved_oxygen">Dissolved Oxygen</SelectItem>
              <SelectItem value="chlorophyll">Chlorophyll-a</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeWindow} onValueChange={setTimeWindow}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
              <SelectItem value="1y">1 year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Strong Correlations</p>
                <p className="text-2xl font-bold">
                  {analyticsData?.correlations.filter(c => Math.abs(c.correlation) > 0.7).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Active Trends</p>
                <p className="text-2xl font-bold">
                  {analyticsData?.trends.filter(t => t.trend_strength > 0.5).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Anomalies Detected</p>
                <p className="text-2xl font-bold">
                  {analyticsData?.anomalies.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Forecast Accuracy</p>
                <p className="text-2xl font-bold">
                  {analyticsData?.forecasts.length > 0 
                    ? `${Math.round((analyticsData.forecasts.reduce((sum, f) => sum + f.accuracy_score, 0) / analyticsData.forecasts.length) * 100)}%`
                    : '0%'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="correlations">Correlations</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
        </TabsList>

        <TabsContent value="correlations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Variable Correlations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analyticsData?.correlations.map((corr, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{corr.variable1}</span>
                        <span className="text-muted-foreground">↔</span>
                        <span className="font-medium">{corr.variable2}</span>
                      </div>
                      <Badge className={getCorrelationColor(corr.correlation)}>
                        {corr.correlation.toFixed(3)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Significance: {corr.significance < 0.001 ? '***' : corr.significance < 0.01 ? '**' : corr.significance < 0.05 ? '*' : 'ns'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.trends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTrendIcon(trend.trend_direction)}
                      <div>
                        <h4 className="font-medium capitalize">{trend.variable.replace('_', ' ')}</h4>
                        <p className="text-sm text-muted-foreground">
                          {trend.trend_direction} trend over {trend.period_days} days
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg">{(trend.trend_strength * 100).toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">strength</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Anomaly Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analyticsData?.anomalies.map((anomaly, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">{anomaly.variable.replace('_', ' ')}</h4>
                      <Badge variant={anomaly.anomaly_score > 0.8 ? 'destructive' : 'secondary'}>
                        Score: {anomaly.anomaly_score.toFixed(2)}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Expected:</span>
                        <span className="font-mono">{anomaly.expected_value.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Actual:</span>
                        <span className="font-mono">{anomaly.actual_value.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span className="font-mono">
                          {anomaly.location.lat.toFixed(2)}, {anomaly.location.lng.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span>{new Date(anomaly.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Predictive Forecasts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.forecasts.map((forecast, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium capitalize">{forecast.variable.replace('_', ' ')}</h4>
                      <Badge variant="outline">
                        {forecast.horizon_hours}h forecast
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Predicted Value</p>
                        <p className="font-mono text-lg">{forecast.predicted_value.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Confidence Range</p>
                        <p className="font-mono">
                          {forecast.confidence_interval[0].toFixed(2)} - {forecast.confidence_interval[1].toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Accuracy Score</p>
                        <p className="font-mono text-lg">{(forecast.accuracy_score * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span>Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regional Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {regionalData.map((region, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">{region.region}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Data Quality:</span>
                        <Badge variant="outline">
                          {(region.quality_score * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Completeness:</span>
                        <span className="font-mono text-sm">
                          {(region.data_completeness * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Active Platforms:</span>
                        <span className="font-mono text-sm">{region.active_platforms}</span>
                      </div>
                      <Separator />
                      {Object.entries(region.indicators).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-sm capitalize">{key}:</span>
                          <span className="font-mono text-sm">{value.toFixed(1)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;