import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  Waves,
  Thermometer,
  Droplets,
  Leaf,
  MapPin,
  Clock,
  Activity,
  TrendingUp,
  ExternalLink,
  RefreshCw,
  Database,
  Satellite,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface VoiceOfOceanSummary {
  total_datasets: number;
  active_platforms: number;
  data_coverage: {
    temporal_span_days: number;
    spatial_coverage: string;
    depth_range: string;
    variables_measured: number;
  };
  platform_status: Array<{
    platform_id: string;
    status: string;
    last_transmission: string;
    current_mission: string;
    location: { lat: number; lng: number };
    data_quality: string;
  }>;
  data_quality_summary: {
    excellent: number;
    good: number;
    questionable: number;
  };
  recent_observations: {
    avg_temperature: number;
    avg_salinity: number;
    avg_oxygen: number;
    avg_chlorophyll: number;
  };
}

interface ERDDAPDataset {
  id: string;
  title: string;
  institution: string;
  summary: string;
  deployment_type: 'real-time' | 'delayed';
  platform_type: string;
  data_quality: string;
  temporal_coverage: {
    start: string;
    end: string;
  };
  variables: Array<{
    name: string;
    units: string;
    description: string;
  }>;
}

const VoiceOfOceanIntegration = () => {
  const [summary, setSummary] = useState<VoiceOfOceanSummary | null>(null);
  const [datasets, setDatasets] = useState<ERDDAPDataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch summary and datasets concurrently
      const [summaryResponse, datasetsResponse] = await Promise.all([
        supabase.functions.invoke('voice-of-ocean-connector', {
          body: { action: 'get_summary' }
        }),
        supabase.functions.invoke('voice-of-ocean-connector', {
          body: { action: 'list_datasets' }
        })
      ]);

      if (summaryResponse.error) throw summaryResponse.error;
      if (datasetsResponse.error) throw datasetsResponse.error;

      if (summaryResponse.data?.success) {
        setSummary(summaryResponse.data.summary);
      }

      if (datasetsResponse.data?.success) {
        setDatasets(datasetsResponse.data.datasets);
      }

      setLastUpdate(new Date().toISOString());
      toast.success('Voice of the Ocean data updated successfully');

    } catch (error) {
      console.error('Error fetching Voice of the Ocean data:', error);
      toast.error('Failed to fetch oceanographic data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'bg-success text-success-foreground';
      case 'good':
        return 'bg-primary text-primary-foreground';
      case 'questionable':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Waves className="h-5 w-5" />
            Voice of the Ocean Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Waves className="h-5 w-5 text-primary" />
            Voice of the Ocean Integration
            <Badge variant="outline" className="ml-2">
              600+ Datasets
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="mr-1 h-3 w-3" />
              {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Never'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="datasets">Datasets</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Real-time access to 600+ oceanographic datasets from autonomous underwater gliders 
                operating across the Baltic Sea region, providing high-resolution measurements 
                of temperature, salinity, oxygen, chlorophyll, and turbidity.
              </AlertDescription>
            </Alert>

            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Total Datasets</span>
                    </div>
                    <div className="text-2xl font-bold">{summary.total_datasets}</div>
                    <div className="text-xs text-muted-foreground">
                      {summary.data_coverage.variables_measured} variables measured
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Satellite className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium">Active Platforms</span>
                    </div>
                    <div className="text-2xl font-bold text-success">{summary.active_platforms}</div>
                    <div className="text-xs text-muted-foreground">
                      Real-time data streams
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Coverage</span>
                    </div>
                    <div className="text-sm font-bold">{summary.data_coverage.spatial_coverage}</div>
                    <div className="text-xs text-muted-foreground">
                      {summary.data_coverage.depth_range}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-warning" />
                      <span className="text-sm font-medium">Data Quality</span>
                    </div>
                    <div className="text-sm font-bold">{summary.data_quality_summary.excellent}%</div>
                    <div className="text-xs text-muted-foreground">
                      Excellent quality
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {summary?.recent_observations && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Observations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-red-500" />
                      <div>
                        <div className="text-sm font-medium">Temperature</div>
                        <div className="text-lg font-bold">{summary.recent_observations.avg_temperature.toFixed(1)}°C</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="text-sm font-medium">Salinity</div>
                        <div className="text-lg font-bold">{summary.recent_observations.avg_salinity.toFixed(1)} PSU</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-cyan-500" />
                      <div>
                        <div className="text-sm font-medium">Dissolved O₂</div>
                        <div className="text-lg font-bold">{summary.recent_observations.avg_oxygen.toFixed(1)} mg/L</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="text-sm font-medium">Chlorophyll</div>
                        <div className="text-lg font-bold">{summary.recent_observations.avg_chlorophyll.toFixed(1)} µg/L</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="platforms" className="space-y-4">
            {summary?.platform_status.map((platform) => (
              <Card key={platform.platform_id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Satellite className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{platform.platform_id}</span>
                      <Badge variant="outline">{platform.current_mission}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(platform.status)}
                      <Badge className={getQualityColor(platform.data_quality)}>
                        {platform.data_quality}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <div className="font-mono">
                        {platform.location.lat.toFixed(3)}°N, {platform.location.lng.toFixed(3)}°E
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Transmission:</span>
                      <div>{new Date(platform.last_transmission).toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <div className="capitalize font-medium">{platform.status}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="datasets" className="space-y-4">
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {datasets.map((dataset) => (
                  <Card key={dataset.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{dataset.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{dataset.summary}</p>
                        </div>
                        <div className="flex gap-1 ml-4">
                          <Badge 
                            variant={dataset.deployment_type === 'real-time' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {dataset.deployment_type}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`https://erddap.observations.voiceoftheocean.org/erddap/info/${dataset.id}/index.html`, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {dataset.variables.slice(0, 4).map((variable) => (
                          <Badge key={variable.name} variant="outline" className="text-xs">
                            {variable.name}
                          </Badge>
                        ))}
                        {dataset.variables.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{dataset.variables.length - 4} more
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="mr-4">Institution: {dataset.institution}</span>
                        <span>Quality: {dataset.data_quality}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VoiceOfOceanIntegration;