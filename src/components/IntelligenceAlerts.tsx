import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Clock, 
  MapPin,
  ExternalLink,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AlertItem {
  id: string;
  type: 'environmental' | 'weather' | 'safety' | 'operational';
  severity: 'info' | 'warning' | 'alert' | 'critical';
  title: string;
  description: string;
  variable: string;
  value: number;
  threshold: number;
  unit: string;
  location: {
    lat: number;
    lon: number;
    name: string;
    basin?: string;
  };
  timestamp: string;
  expires_at: string;
  confidence: number;
  source: string;
  deep_link?: string;
}

interface AlertsProps {
  basin: string;
}

const IntelligenceAlerts: React.FC<AlertsProps> = ({ basin }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active'>('active');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('intelligence-alerts', {
        body: {
          basin: basin,
          active_only: filter === 'active'
        }
      });

      if (error) throw error;
      
      if (data?.success) {
        setAlerts(data.data || []);
      } else {
        throw new Error(data?.error || 'Failed to fetch alerts');
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to fetch alerts');
      // Use mock data for demo
      const mockAlerts: AlertItem[] = [
        {
          id: 'hab-001',
          type: 'environmental',
          severity: 'alert',
          title: 'Harmful Algal Bloom Alert',
          description: 'High HAB probability (65%) detected in central Baltic Proper. Cyanobacteria bloom likely developing.',
          variable: 'chlorophyll_hab',
          value: 0.65,
          threshold: 0.6,
          unit: 'probability',
          location: {
            lat: 57.5,
            lon: 18.2,
            name: 'Central Baltic Proper',
            basin: 'baltic_proper'
          },
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          confidence: 0.85,
          source: 'CMEMS + Sentinel-3'
        },
        {
          id: 'wind-002',
          type: 'weather',
          severity: 'warning',
          title: 'Strong Wind Warning',
          description: 'Wind speeds reaching 18 m/s with gusts up to 25 m/s expected in Gulf of Finland.',
          variable: 'wind_speed',
          value: 18,
          threshold: 14,
          unit: 'm/s',
          location: {
            lat: 59.8,
            lon: 25.1,
            name: 'Gulf of Finland',
            basin: 'gulf_of_finland'
          },
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          confidence: 0.92,
          source: 'SMHI + ECMWF'
        }
      ];
      setAlerts(mockAlerts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [basin, filter]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'alert': return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'info': return <Info className="h-4 w-4 text-primary" />;
      default: return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'alert': return 'bg-warning text-warning-foreground';
      case 'warning': return 'bg-warning text-warning-foreground';
      case 'info': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'environmental': return 'bg-success/10 text-success';
      case 'weather': return 'bg-primary/10 text-primary';
      case 'safety': return 'bg-destructive/10 text-destructive';
      case 'operational': return 'bg-warning/10 text-warning';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  const handleAlertClick = (alert: AlertItem) => {
    if (alert.deep_link) {
      window.open(alert.deep_link, '_blank');
    } else {
      toast.info(`Opening ${alert.variable} data for ${alert.location.name}`);
    }
  };

  const activeAlerts = alerts.filter(alert => new Date(alert.expires_at) > new Date());
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;
  const alertCount = activeAlerts.filter(a => a.severity === 'alert').length;
  const warningCount = activeAlerts.filter(a => a.severity === 'warning').length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Active Alerts
          </CardTitle>
          <div className="flex items-center gap-1">
            {criticalCount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground text-xs">
                {criticalCount}
              </Badge>
            )}
            {alertCount > 0 && (
              <Badge className="bg-warning text-warning-foreground text-xs">
                {alertCount}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {warningCount}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
            className="text-xs"
          >
            Active
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="text-xs"
          >
            All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80">
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-muted rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : alerts.length === 0 ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No {filter} alerts for {basin.replace('_', ' ')}
                </AlertDescription>
              </Alert>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleAlertClick(alert)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(alert.severity)}
                      <Badge className={getSeverityColor(alert.severity)} variant="secondary">
                        {alert.severity}
                      </Badge>
                      <Badge className={getTypeColor(alert.type)} variant="outline">
                        {alert.type}
                      </Badge>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                  
                  <h4 className="font-medium text-sm text-foreground mb-1">
                    {alert.title}
                  </h4>
                  
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {alert.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{alert.location.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(alert.timestamp)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs">
                      <span className="font-medium">{alert.value}</span>
                      <span className="text-muted-foreground"> {alert.unit}</span>
                      <span className="text-muted-foreground"> (threshold: {alert.threshold})</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(alert.confidence * 100)}% confidence
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default IntelligenceAlerts;