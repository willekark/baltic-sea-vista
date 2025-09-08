import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Scatter
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
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ObservationData {
  id: string;
  dataset_id: string;
  timestamp: string;
  location_lat: number;
  location_lng: number;
  variable_name: string;
  value: number;
  unit: string;
  depth_m: number;
  quality_flag: string;
  confidence_score: number;
  platform_id: string;
}

interface BalticIndicator {
  id: string;
  indicator_type: string;
  region: string;
  period_start: string;
  period_end: string;
  value: number;
  confidence: number;
  methodology: string;
  metadata: Record<string, any>;
}

interface IntelligenceAlert {
  id: string;
  alert_type: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  triggered_at: string;
  location_lat?: number;
  location_lng?: number;
}

const IntelligenceDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [selectedRegion, setSelectedRegion] = useState('baltic_sea');
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [observations, setObservations] = useState<ObservationData[]>([]);
  const [indicators, setIndicators] = useState<BalticIndicator[]>([]);
  const [alerts, setAlerts] = useState<IntelligenceAlert[]>([]);
  const [timeseriesData, setTimeseriesData] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [selectedRegion, selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadObservations(),
        loadIndicators(),
        loadAlerts(),
        processTimeseriesData()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadObservations = async () => {
    const endTime = new Date();
    const startTime = new Date();
    
    // Set time range based on selected period
    switch (selectedPeriod) {
      case '24h':
        startTime.setHours(startTime.getHours() - 24);
        break;
      case '7d':
        startTime.setDate(startTime.getDate() - 7);
        break;
      case '30d':
        startTime.setDate(startTime.getDate() - 30);
        break;
      default:
        startTime.setDate(startTime.getDate() - 7);
    }

    const { data, error } = await supabase
      .from('oceanographic_observations')
      .select('*')
      .gte('timestamp', startTime.toISOString())
      .lte('timestamp', endTime.toISOString())
      .order('timestamp', { ascending: false })
      .limit(5000);

    if (error) {
      console.error('Error loading observations:', error);
      return;
    }

    setObservations(data || []);
  };

  const loadIndicators = async () => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('baltic_indicators')
      .select('*')
      .eq('region', selectedRegion)
      .gte('period_start', startDate)
      .lte('period_end', endDate)
      .order('computed_at', { ascending: false });

    if (error) {
      console.error('Error loading indicators:', error);
      return;
    }

    setIndicators(data || []);
  };

  const loadAlerts = async () => {
    const { data, error } = await supabase
      .from('intelligence_alerts')
      .select('*')
      .eq('status', 'active')
      .order('triggered_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading alerts:', error);
      return;
    }

    setAlerts(data || []);
  };

  const processTimeseriesData = async () => {
    if (observations.length === 0) return;

    // Group observations by time and variable for charting
    const timeGroups: Record<string, Record<string, number[]>> = {};
    
    observations.forEach(obs => {
      const timeKey = new Date(obs.timestamp).toISOString().split(':')[0] + ':00:00Z'; // Round to hour
      if (!timeGroups[timeKey]) timeGroups[timeKey] = {};
      if (!timeGroups[timeKey][obs.variable_name]) timeGroups[timeKey][obs.variable_name] = [];
      timeGroups[timeKey][obs.variable_name].push(obs.value);
    });

    const chartData = Object.entries(timeGroups).map(([time, variables]) => ({
      time,
      timestamp: new Date(time).getTime(),
      ...Object.entries(variables).reduce((acc, [variable, values]) => ({
        ...acc,
        [variable]: values.reduce((sum, val) => sum + val, 0) / values.length // Average
      }), {})
    })).sort((a, b) => a.timestamp - b.timestamp);

    setTimeseriesData(chartData);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast.success('Dashboard data refreshed');
  };

  const triggerDataIngestion = async () => {
    try {
      setRefreshing(true);
      
      // Trigger ERDDAP data ingestion
      const endTime = new Date().toISOString();
      const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase.functions.invoke('enhanced-erddap-processor', {
        body: {
          action: 'ingest_data',
          dataset_id: 'nrt_SEA068_M34', // Example dataset
          variables: ['time', 'latitude', 'longitude', 'temperature', 'salinity', 'dissolved_oxygen', 'chlorophyll'],
          time_range: { start: startTime, end: endTime }
        }
      });

      if (error) throw error;
      
      toast.success(`Ingested ${data.observations_ingested} new observations`);
      await loadDashboardData();
      
    } catch (error) {
      console.error('Error triggering ingestion:', error);
      toast.error('Failed to trigger data ingestion');
    } finally {
      setRefreshing(false);
    }
  };

  const computeIndicators = async () => {
    try {
      setRefreshing(true);
      
      const endTime = new Date().toISOString();
      const startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase.functions.invoke('enhanced-erddap-processor', {
        body: {
          action: 'compute_indicators',
          region: selectedRegion,
          period_start: startTime,
          period_end: endTime
        }
      });

      if (error) throw error;
      
      toast.success(`Computed ${data.indicators_computed} indicators`);
      await loadIndicators();
      
    } catch (error) {
      console.error('Error computing indicators:', error);
      toast.error('Failed to compute indicators');
    } finally {
      setRefreshing(false);
    }
  };

  const getIndicatorTrend = (indicatorType: string): string => {
    const recent = indicators.filter(ind => ind.indicator_type === indicatorType).slice(0, 2);
    if (recent.length < 2) return 'stable';
    return recent[0].value > recent[1].value ? 'up' : 'down';
  };

  const getIndicatorValue = (indicatorType: string): number => {
    const latest = indicators.find(ind => ind.indicator_type === indicatorType);
    return latest?.value || 0;
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-primary text-primary-foreground';
      case 'low': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatValue = (value: number, variable: string): string => {
    const units: Record<string, string> = {
      temperature: '°C',
      salinity: 'PSU',
      dissolved_oxygen: 'mg/L',
      chlorophyll: 'µg/L',
      turbidity: 'NTU'
    };
    
    return `${value.toFixed(2)} ${units[variable] || ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Baltic Intelligence Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time oceanographic intelligence powered by ERDDAP data
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baltic_sea">Baltic Sea</SelectItem>
                <SelectItem value="baltic_proper">Baltic Proper</SelectItem>
                <SelectItem value="bothnian_sea">Bothnian Sea</SelectItem>
                <SelectItem value="bothnian_bay">Bothnian Bay</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24h</SelectItem>
                <SelectItem value="7d">7d</SelectItem>
                <SelectItem value="30d">30d</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={triggerDataIngestion}
              disabled={refreshing}
            >
              <Download className="h-4 w-4 mr-2" />
              Ingest Data
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={computeIndicators}
              disabled={refreshing}
            >
              <Zap className="h-4 w-4 mr-2" />
              Compute Indicators
            </Button>
          </div>
        </div>

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <Alert className="border-warning bg-warning/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>{alerts.length} active alerts requiring attention</span>
                <Button variant="link" size="sm" onClick={() => setActiveView('alerts')}>
                  View All →
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Key Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">Baltic Oxygen Index</span>
                </div>
                {getIndicatorTrend('baltic_oxygen_index') === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
              </div>
              <div className="text-2xl font-bold">
                {(getIndicatorValue('baltic_oxygen_index') * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                Oxygen health indicator
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium">Hypoxia Risk</span>
                </div>
                {getIndicatorTrend('hypoxia_risk') === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-destructive" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-success" />
                )}
              </div>
              <div className="text-2xl font-bold">
                {(getIndicatorValue('hypoxia_risk') * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                Areas below 2 mg/L O₂
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-medium">Temp Anomaly</span>
                </div>
                {getIndicatorTrend('surface_temp_anomaly') === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-warning" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-blue-500" />
                )}
              </div>
              <div className="text-2xl font-bold">
                {getIndicatorValue('surface_temp_anomaly').toFixed(1)}°C
              </div>
              <div className="text-xs text-muted-foreground">
                From seasonal average
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Waves className="h-5 w-5 text-cyan-500" />
                  <span className="text-sm font-medium">Salinity Stress</span>
                </div>
                {getIndicatorTrend('salinity_stress_index') === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-warning" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-success" />
                )}
              </div>
              <div className="text-2xl font-bold">
                {(getIndicatorValue('salinity_stress_index') * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                Deviation from optimal
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeseries">Time Series</TabsTrigger>
            <TabsTrigger value="spatial">Spatial View</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="quality">Data Quality</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            
            {/* Environmental Parameters Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Environmental Parameters Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeseriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="time" 
                        tickFormatter={(time) => new Date(time).toLocaleDateString()}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(time) => new Date(time).toLocaleString()}
                        formatter={(value: number, name: string) => [
                          formatValue(value, name), 
                          name.replace('_', ' ').toUpperCase()
                        ]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="temperature" 
                        stroke="hsl(var(--chart-1))" 
                        strokeWidth={2} 
                        dot={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="dissolved_oxygen" 
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={2} 
                        dot={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="salinity" 
                        stroke="hsl(var(--chart-3))" 
                        strokeWidth={2} 
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Data Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Observations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {observations.slice(0, 5).map((obs) => (
                      <div key={obs.id} className="flex items-center justify-between p-2 rounded border">
                        <div>
                          <div className="font-medium">{obs.variable_name.replace('_', ' ')}</div>
                          <div className="text-xs text-muted-foreground">
                            {obs.platform_id} • {new Date(obs.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono">{formatValue(obs.value, obs.variable_name)}</div>
                          <Badge 
                            variant={obs.quality_flag === 'good' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {obs.quality_flag}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from(new Set(observations.map(obs => obs.platform_id))).slice(0, 5).map((platform) => {
                      const platformObs = observations.filter(obs => obs.platform_id === platform);
                      const lastUpdate = Math.max(...platformObs.map(obs => new Date(obs.timestamp).getTime()));
                      const hoursOld = (Date.now() - lastUpdate) / (1000 * 60 * 60);
                      
                      return (
                        <div key={platform} className="flex items-center justify-between p-2 rounded border">
                          <div>
                            <div className="font-medium">{platform}</div>
                            <div className="text-xs text-muted-foreground">
                              {platformObs.length} observations
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm">
                              {hoursOld < 1 ? 'Just now' : `${hoursOld.toFixed(0)}h ago`}
                            </div>
                            <Badge 
                              variant={hoursOld < 6 ? 'default' : hoursOld < 24 ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {hoursOld < 6 ? 'Active' : hoursOld < 24 ? 'Recent' : 'Stale'}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timeseries" className="space-y-6">
            {/* Variable selection and detailed timeseries */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Time Series Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['temperature', 'dissolved_oxygen', 'salinity', 'chlorophyll'].map((variable) => {
                    const variableData = timeseriesData.filter(d => d[variable] !== undefined);
                    
                    return (
                      <div key={variable}>
                        <h4 className="font-medium mb-2 capitalize">
                          {variable.replace('_', ' ')} Trend
                        </h4>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={variableData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="time" 
                                tickFormatter={(time) => new Date(time).toLocaleDateString()}
                              />
                              <YAxis />
                              <Tooltip 
                                labelFormatter={(time) => new Date(time).toLocaleString()}
                                formatter={(value: number) => [
                                  formatValue(value, variable), 
                                  variable.replace('_', ' ').toUpperCase()
                                ]}
                              />
                              <Area 
                                type="monotone" 
                                dataKey={variable} 
                                stroke="hsl(var(--primary))" 
                                fill="hsl(var(--primary))" 
                                fillOpacity={0.2}
                                strokeWidth={2}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Intelligence Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
                      <p>No active alerts - All systems operating normally</p>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div key={alert.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-warning" />
                            <h4 className="font-medium">{alert.title}</h4>
                          </div>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {alert.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Type: {alert.alert_type.replace('_', ' ')}</span>
                          <span>Triggered: {new Date(alert.triggered_at).toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Quality Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Quality Distribution */}
                  <div>
                    <h4 className="font-medium mb-4">Quality Flag Distribution</h4>
                    <div className="space-y-2">
                      {['good', 'questionable', 'bad'].map((flag) => {
                        const count = observations.filter(obs => obs.quality_flag === flag).length;
                        const percentage = observations.length > 0 ? (count / observations.length) * 100 : 0;
                        
                        return (
                          <div key={flag} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded ${
                                flag === 'good' ? 'bg-success' : 
                                flag === 'questionable' ? 'bg-warning' : 'bg-destructive'
                              }`} />
                              <span className="capitalize">{flag}</span>
                            </div>
                            <div className="text-sm">
                              {count} ({percentage.toFixed(1)}%)
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Confidence Scores */}
                  <div>
                    <h4 className="font-medium mb-4">Confidence Scores</h4>
                    <div className="space-y-2">
                      {observations.length > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span>Average Confidence:</span>
                            <span className="font-mono">
                              {(observations.reduce((sum, obs) => sum + obs.confidence_score, 0) / observations.length).toFixed(3)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>High Confidence (>0.8):</span>
                            <span className="font-mono">
                              {observations.filter(obs => obs.confidence_score > 0.8).length}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Low Confidence (<0.5):</span>
                            <span className="font-mono">
                              {observations.filter(obs => obs.confidence_score < 0.5).length}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Data Coverage */}
                  <div>
                    <h4 className="font-medium mb-4">Data Coverage</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Observations:</span>
                        <span className="font-mono">{observations.length.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Unique Platforms:</span>
                        <span className="font-mono">{new Set(observations.map(obs => obs.platform_id)).size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Variables Measured:</span>
                        <span className="font-mono">{new Set(observations.map(obs => obs.variable_name)).size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time Span:</span>
                        <span className="font-mono">{selectedPeriod}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IntelligenceDashboard;