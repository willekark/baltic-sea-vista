import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  MapPin, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Activity,
  Navigation,
  Waves,
  Wind,
  Thermometer,
  Droplets,
  Leaf,
  Snowflake,
  Info,
  Download,
  ExternalLink,
  Layers,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import IntelligenceMap from '@/components/IntelligenceMap';
import IntelligenceAlerts from '@/components/IntelligenceAlerts';
import IntelligenceProvenance from '@/components/IntelligenceProvenance';
import ShippingInsights from '@/components/ShippingInsights';
import MultiAIInsights from '@/components/MultiAIInsights';
import { EnsembleOrchestrator } from '@/components/EnsembleOrchestrator';
import { ECSLeaderboard } from '@/components/ECSLeaderboard';

interface VariableStatus {
  variable: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'alert';
  anomaly: number;
  last_update: string;
  forecast_horizon: string;
  secondary_metrics?: Record<string, any>;
}

interface DashboardState {
  aoi: string;
  depth: string;
  timeHorizon: string;
  showBaseline: boolean;
}

const VARIABLE_ICONS: Record<string, React.ComponentType<any>> = {
  currents: Navigation,
  waves: Waves,
  wind: Wind,
  sst: Thermometer,
  sealevel: Activity,
  seaice: Snowflake,
  oxygen: Droplets,
  chlorophyll: Leaf
};

const VARIABLE_NAMES = {
  currents: 'Surface Currents',
  waves: 'Wave Height',
  wind: 'Wind Speed',
  sst: 'Sea Temperature',
  sealevel: 'Sea Level',
  seaice: 'Sea Ice',
  oxygen: 'Dissolved Oxygen',
  chlorophyll: 'Chlorophyll-a'
};

const IntelligenceDashboard = () => {
  const [summary, setSummary] = useState<VariableStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [state, setState] = useState<DashboardState>({
    aoi: 'baltic_proper',
    depth: 'surface',
    timeHorizon: '24h',
    showBaseline: false
  });

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('intelligence-summary', {
        body: {
          basin: state.aoi,
          depth: state.depth,
          horizon: state.timeHorizon
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        setSummary(data.data || []);
        setLastUpdate(new Date().toISOString());
        toast.success(`Updated ${data.data?.length || 0} variables`);
      } else {
        throw new Error(data?.error || 'Failed to fetch summary');
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
      toast.error('Failed to fetch intelligence summary');
      // Use mock data for demo
      const mockSummary = [
        {
          variable: 'currents',
          value: 0.42,
          unit: 'm/s',
          status: 'good' as const,
          anomaly: 0.8,
          last_update: new Date().toISOString(),
          forecast_horizon: '7 days'
        },
        {
          variable: 'waves',
          value: 2.2,
          unit: 'm',
          status: 'warning' as const,
          anomaly: 1.1,
          last_update: new Date().toISOString(),
          forecast_horizon: '5 days'
        },
        {
          variable: 'wind',
          value: 12.5,
          unit: 'm/s',
          status: 'warning' as const,  
          anomaly: 1.2,
          last_update: new Date().toISOString(),
          forecast_horizon: '7 days'
        }
      ];
      setSummary(mockSummary);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [state.aoi, state.depth, state.timeHorizon]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-success text-success-foreground';
      case 'warning': return 'bg-warning text-warning-foreground';
      case 'alert': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTrendIcon = (anomaly: number) => {
    if (anomaly > 0.5) return <TrendingUp className="h-4 w-4 text-warning" />;
    if (anomaly < -0.5) return <TrendingDown className="h-4 w-4 text-primary" />;
    return <Activity className="h-4 w-4 text-muted-foreground" />;
  };

  const handleExplore = (variable: string) => {
    window.open(`/intelligence/explore/${variable}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Intelligence Dashboard</h1>
              <p className="text-muted-foreground">Baltic Sea Marine Data & Analytics</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'Loading...'}
              </Badge>
              <Button onClick={fetchSummary} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Select 
                value={state.aoi} 
                onValueChange={(value) => setState(prev => ({ ...prev, aoi: value }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baltic_proper">Baltic Proper</SelectItem>
                  <SelectItem value="gulf_of_finland">Gulf of Finland</SelectItem>
                  <SelectItem value="gulf_of_riga">Gulf of Riga</SelectItem>
                  <SelectItem value="bothnian_sea">Bothnian Sea</SelectItem>
                  <SelectItem value="bothnian_bay">Bothnian Bay</SelectItem>
                  <SelectItem value="kattegat">Kattegat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <Select 
                value={state.depth} 
                onValueChange={(value) => setState(prev => ({ ...prev, depth: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Depth" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="surface">Surface</SelectItem>
                  <SelectItem value="5m">5m</SelectItem>
                  <SelectItem value="10m">10m</SelectItem>
                  <SelectItem value="20m">20m</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Select 
                value={state.timeHorizon} 
                onValueChange={(value) => setState(prev => ({ ...prev, timeHorizon: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Horizon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="now">Now</SelectItem>
                  <SelectItem value="24h">+24h</SelectItem>
                  <SelectItem value="72h">+72h</SelectItem>
                  <SelectItem value="7d">+7d</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <Button
              variant={state.showBaseline ? "default" : "outline"}
              size="sm"
              onClick={() => setState(prev => ({ ...prev, showBaseline: !prev.showBaseline }))}
            >
              <Settings className="mr-2 h-4 w-4" />
              Baseline
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Map Section */}
          <div className="lg:col-span-3">
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Interactive Map
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-96 bg-muted rounded-b-lg">
                  <IntelligenceMap 
                    basin={state.aoi}
                    depth={state.depth}
                    showBaseline={state.showBaseline}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Variable Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-16 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                summary.map((item) => {
                  const IconComponent = VARIABLE_ICONS[item.variable as keyof typeof VARIABLE_ICONS] || Activity;
                  return (
                    <Card 
                      key={item.variable} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleExplore(item.variable)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <IconComponent className="h-5 w-5 text-primary" />
                          <Badge className={getStatusColor(item.status)} variant="secondary">
                            {item.status}
                          </Badge>
                        </div>
                        <h3 className="font-medium text-sm text-foreground mb-1">
                          {VARIABLE_NAMES[item.variable] || item.variable}
                        </h3>
                        <div className="flex items-end justify-between">
                          <div>
                            <span className="text-2xl font-bold text-foreground">
                              {item.value}
                            </span>
                            <span className="text-sm text-muted-foreground ml-1">
                              {item.unit}
                            </span>
                          </div>
                          {getTrendIcon(item.anomaly)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Anomaly: {item.anomaly > 0 ? '+' : ''}{item.anomaly}σ
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Shipping Intelligence Section */}
            <div className="mb-6">
              <ShippingInsights />
            </div>

            {/* Multi-AI Analysis Section */}
            <div className="mb-6">
              <MultiAIInsights />
            </div>

            {/* Ensemble Orchestration Service */}
            <div className="mb-6">
              <EnsembleOrchestrator />
            </div>

            {/* ECS Leaderboard */}
            <div className="mb-6">
              <ECSLeaderboard />
            </div>
          </div>

          {/* Right Rail */}
          <div className="space-y-6">
            <IntelligenceAlerts basin={state.aoi} />
            <IntelligenceProvenance />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceDashboard;