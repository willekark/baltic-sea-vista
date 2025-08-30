import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Map,
  Clock,
  Layers,
  Activity,
  Thermometer,
  Waves,
  Wind,
  Droplet,
  Eye,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Calendar,
  Download,
  Share,
  Settings,
  Bell,
  Info,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  Filter,
  Bookmark,
  FileText,
  Camera
} from 'lucide-react';

interface ConditionCard {
  title: string;
  status: 'good' | 'warning' | 'alert';
  value: string;
  change: number;
  lastUpdate: string;
  description: string;
  icon: React.ComponentType<any>;
}

interface TileData {
  id: string;
  title: string;
  category: 'physical' | 'biological' | 'chemical';
  layers: string[];
  icon: React.ComponentType<any>;
  unit: string;
  currentValue: string;
  trend: 'up' | 'down' | 'stable';
  anomaly: boolean;
}

interface AlertItem {
  id: string;
  type: 'marine_heatwave' | 'hab' | 'hypoxia' | 'severe_weather' | 'fog' | 'ice' | 'coastal_flood' | 'user_threshold';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  location?: string;
  isActive: boolean;
}

const DecisionHub = () => {
  // State management
  const [selectedAOI, setSelectedAOI] = useState('baltic_sea');
  const [selectedDepth, setSelectedDepth] = useState('surface');
  const [timeHorizon, setTimeHorizon] = useState('nowcast');
  const [showBaseline, setShowBaseline] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeValue, setTimeValue] = useState([0]);
  const [selectedLayers, setSelectedLayers] = useState(['sst', 'currents']);
  const [savedWorkspaces, setSavedWorkspaces] = useState([]);

  // Mock data - would be replaced with real API calls
  const conditionCards: ConditionCard[] = [
    {
      title: 'Marine Conditions Index',
      status: 'warning',
      value: 'Warning',
      change: -5,
      lastUpdate: '2 hours ago',
      description: 'Moderate sea state with increasing wave heights. Wind speeds 15-20 knots from SW.',
      icon: Activity
    },
    {
      title: 'Coastal Hazard Risk',
      status: 'good',
      value: 'Low',
      change: 0,
      lastUpdate: '1 hour ago',
      description: 'Sea level normal, wave run-up risk minimal for next 72h.',
      icon: Waves
    },
    {
      title: 'Ecosystem Status',
      status: 'alert',
      value: 'Alert',
      change: -12,
      lastUpdate: '30 minutes ago',
      description: 'Hypoxic conditions detected in southern Baltic. Chlorophyll-a elevated.',
      icon: Droplet
    },
    {
      title: 'Ice Status',
      status: 'good',
      value: 'Clear',
      change: 8,
      lastUpdate: '45 minutes ago',
      description: 'Ice-free conditions across most areas. Minimal formation expected.',
      icon: Thermometer
    }
  ];

  const coreTiles: TileData[] = [
    { id: 'currents', title: 'Currents', category: 'physical', layers: ['surface', '10m'], icon: Activity, unit: 'm/s', currentValue: '0.3', trend: 'stable', anomaly: false },
    { id: 'waves', title: 'Waves', category: 'physical', layers: ['Hs', 'Tp', 'Dir'], icon: Waves, unit: 'm', currentValue: '1.8', trend: 'up', anomaly: true },
    { id: 'wind', title: 'Wind & Gusts', category: 'physical', layers: ['speed', 'direction', 'gusts'], icon: Wind, unit: 'm/s', currentValue: '12', trend: 'up', anomaly: false },
    { id: 'sst', title: 'Sea Surface Temp', category: 'physical', layers: ['sst', 'anomaly'], icon: Thermometer, unit: '°C', currentValue: '8.2', trend: 'stable', anomaly: true },
    { id: 'oxygen', title: 'Dissolved Oxygen', category: 'chemical', layers: ['concentration', 'saturation'], icon: Droplet, unit: 'mg/L', currentValue: '6.8', trend: 'down', anomaly: true },
    { id: 'chlorophyll', title: 'Chlorophyll-a', category: 'biological', layers: ['concentration', 'anomaly'], icon: Eye, unit: 'mg/m³', currentValue: '3.2', trend: 'up', anomaly: true },
    { id: 'clarity', title: 'Water Clarity', category: 'physical', layers: ['TSM', 'Secchi'], icon: Eye, unit: 'm', currentValue: '4.5', trend: 'stable', anomaly: false },
    { id: 'stratification', title: 'Mixed Layer Depth', category: 'physical', layers: ['MLD', 'stratification'], icon: Layers, unit: 'm', currentValue: '18', trend: 'down', anomaly: false }
  ];

  const alerts: AlertItem[] = [
    {
      id: '1',
      type: 'marine_heatwave',
      title: 'Marine Heatwave Alert',
      description: 'SST anomaly +3.2°C detected in southern Baltic, persisting for 7 days',
      severity: 'high',
      timestamp: '2024-01-15T10:30:00Z',
      location: 'Southern Baltic Sea',
      isActive: true
    },
    {
      id: '2',
      type: 'hab',
      title: 'HAB Risk Warning',
      description: 'Elevated chlorophyll-a levels indicate potential harmful algal bloom development',
      severity: 'medium',
      timestamp: '2024-01-15T08:15:00Z',
      location: 'Gulf of Finland',
      isActive: true
    },
    {
      id: '3',
      type: 'hypoxia',
      title: 'Hypoxia Event',
      description: 'DO levels below 2 mg/L detected in deep basins',
      severity: 'critical',
      timestamp: '2024-01-15T06:00:00Z',
      location: 'Gotland Basin',
      isActive: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'alert': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Control Bar */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* AOI Selector */}
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedAOI} onValueChange={setSelectedAOI}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select AOI" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baltic_sea">Baltic Sea</SelectItem>
                  <SelectItem value="north_sea">North Sea</SelectItem>
                  <SelectItem value="custom">Custom AOI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Depth Selector */}
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedDepth} onValueChange={setSelectedDepth}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="surface">Surface</SelectItem>
                  <SelectItem value="10m">10m</SelectItem>
                  <SelectItem value="20m">20m</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time Horizon */}
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <Select value={timeHorizon} onValueChange={setTimeHorizon}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nowcast">Nowcast</SelectItem>
                  <SelectItem value="24h">24h</SelectItem>
                  <SelectItem value="72h">72h</SelectItem>
                  <SelectItem value="7d">7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Baseline Toggle */}
            <div className="flex items-center space-x-2">
              <Switch 
                id="baseline" 
                checked={showBaseline}
                onCheckedChange={setShowBaseline}
              />
              <label htmlFor="baseline" className="text-sm text-muted-foreground">Show Baseline</label>
            </div>
          </div>

          {/* Workspace Controls */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Bookmark className="w-4 h-4 mr-2" />
              Save Workspace
            </Button>
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Today Summary Cards */}
          <div className="p-4 bg-background border-b border-border">
            <div className="grid grid-cols-4 gap-4">
              {conditionCards.map((card, index) => (
                <Card key={index} className={`border-2 ${getStatusColor(card.status)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <card.icon className="w-5 h-5" />
                      <Badge variant="outline" className={getStatusColor(card.status)}>
                        {card.value}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{card.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{card.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{card.lastUpdate}</span>
                      <div className="flex items-center">
                        {getTrendIcon(card.change > 0 ? 'up' : card.change < 0 ? 'down' : 'stable')}
                        <span className="ml-1">{card.change > 0 ? '+' : ''}{card.change}%</span>
                      </div>
                    </div>
                    <Button variant="link" size="sm" className="h-6 p-0 mt-2">
                      Explore →
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Map Canvas */}
          <div className="flex-1 relative bg-slate-100">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Map className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">Interactive Map Canvas</h3>
                <p className="text-sm text-muted-foreground mb-4">Fast tile layers with currents, waves, SST, ice, and more</p>
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <span>Selected layers: {selectedLayers.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Time Slider */}
            <div className="absolute bottom-4 left-4 right-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm">
                  <SkipBack className="w-4 h-4" />
                </Button>
                <div className="flex-1">
                  <Slider
                    value={timeValue}
                    onValueChange={setTimeValue}
                    max={24}
                    step={1}
                    className="w-full"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <SkipForward className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-20">
                  +{timeValue[0]}h
                </span>
              </div>
            </div>

            {/* Layer Controls */}
            <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-2">
              <Button variant="ghost" size="sm">
                <Layers className="w-4 h-4 mr-2" />
                Layers
              </Button>
            </div>
          </div>

          {/* Core Tiles Grid */}
          <div className="p-4 bg-background border-t border-border">
            <div className="grid grid-cols-4 gap-4">
              {coreTiles.map((tile) => (
                <Card key={tile.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <tile.icon className="w-4 h-4 text-muted-foreground" />
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(tile.trend)}
                        {tile.anomaly && <AlertTriangle className="w-3 h-3 text-orange-500" />}
                      </div>
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{tile.title}</h4>
                    <p className="text-lg font-bold text-primary">
                      {tile.currentValue} <span className="text-xs font-normal text-muted-foreground">{tile.unit}</span>
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Rail - Alerts & Status */}
        <div className="w-80 bg-card/50 border-l border-border p-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Events & Alerts</h2>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>

            {/* Active Alerts */}
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Card key={alert.id} className={`border-2 ${getSeverityColor(alert.severity)}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5" />
                      <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{alert.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>
                    {alert.location && (
                      <p className="text-xs text-muted-foreground mb-2">📍 {alert.location}</p>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                      <Button variant="link" size="sm" className="h-4 p-0">
                        Details →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* User Thresholds */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">User Thresholds</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">DO &lt; 2 mg/L</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">SST anomaly &gt; +2°C</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Wave height &gt; 3m</span>
                  <Switch />
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3">
                <Bell className="w-4 h-4 mr-2" />
                Add Threshold
              </Button>
            </div>

            {/* Data Quality */}
            <div className="mt-6 p-3 bg-muted/50 rounded-lg">
              <h3 className="text-sm font-semibold text-foreground mb-2">Data Quality</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">CMEMS</span>
                  <Badge variant="outline" className="text-green-600 border-green-200">Good</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">SMHI</span>
                  <Badge variant="outline" className="text-green-600 border-green-200">Good</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">HELCOM</span>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-200">Delayed</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Last refresh: 15 minutes ago
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecisionHub;