import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Bell,
  BellRing,
  Mail,
  Smartphone,
  Slack,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  Play,
  Pause,
  Edit,
  Trash2,
  Plus,
  Target,
  Clock,
  MapPin,
  TrendingUp,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AlertRule {
  id: string;
  name: string;
  description: string;
  alert_type: string;
  conditions: {
    variable: string;
    operator: string;
    threshold: number;
    duration_minutes?: number;
  }[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  notification_channels: string[];
  active: boolean;
  created_at: string;
  last_triggered?: string;
}

interface NotificationChannel {
  id: string;
  type: 'email' | 'sms' | 'slack' | 'webhook';
  name: string;
  config: any;
  active: boolean;
}

interface RealtimeAlert {
  id: string;
  alert_type: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  triggered_at: string;
  resolved_at?: string;
  location_lat?: number;
  location_lng?: number;
  trigger_data: any;
}

const RealtimeMonitoring = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [realtimeAlerts, setRealtimeAlerts] = useState<RealtimeAlert[]>([]);
  const [notificationChannels, setNotificationChannels] = useState<NotificationChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [monitoringActive, setMonitoringActive] = useState(true);

  useEffect(() => {
    loadMonitoringData();
    
    // Set up real-time subscription for new alerts
    const alertsSubscription = supabase
      .channel('intelligence_alerts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'intelligence_alerts'
      }, (payload) => {
        const newAlert = payload.new as RealtimeAlert;
        setRealtimeAlerts(prev => [newAlert, ...prev]);
        
        // Show toast notification
        toast.error(`New ${newAlert.severity} alert: ${newAlert.title}`, {
          action: {
            label: 'View',
            onClick: () => setActiveTab('alerts')
          }
        });
      })
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(alertsSubscription);
    };
  }, []);

  const loadMonitoringData = async () => {
    try {
      setLoading(true);

      // Load recent alerts
      const { data: alerts, error: alertsError } = await supabase
        .from('intelligence_alerts')
        .select('*')
        .order('triggered_at', { ascending: false })
        .limit(50);

      if (alertsError) throw alertsError;
      setRealtimeAlerts(alerts || []);

      // Mock alert rules and notification channels for demo
      setAlertRules([
        {
          id: 'temp_anomaly',
          name: 'Temperature Anomaly Detection',
          description: 'Detect unusual temperature readings outside normal ranges',
          alert_type: 'temperature_anomaly',
          conditions: [
            { variable: 'temperature', operator: '>', threshold: 25 },
            { variable: 'temperature', operator: '<', threshold: 0 }
          ],
          severity: 'high',
          notification_channels: ['email', 'slack'],
          active: true,
          created_at: new Date().toISOString(),
          last_triggered: '2024-01-15T10:30:00Z'
        },
        {
          id: 'oxygen_depletion',
          name: 'Oxygen Depletion Alert',
          description: 'Monitor dissolved oxygen levels for critical depletion',
          alert_type: 'oxygen_depletion',
          conditions: [
            { variable: 'dissolved_oxygen', operator: '<', threshold: 4, duration_minutes: 30 }
          ],
          severity: 'critical',
          notification_channels: ['email', 'sms'],
          active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'data_quality',
          name: 'Data Quality Degradation',
          description: 'Alert when data quality scores drop below acceptable levels',
          alert_type: 'data_quality',
          conditions: [
            { variable: 'quality_score', operator: '<', threshold: 0.7, duration_minutes: 60 }
          ],
          severity: 'medium',
          notification_channels: ['email'],
          active: true,
          created_at: new Date().toISOString()
        }
      ]);

      setNotificationChannels([
        {
          id: 'email_primary',
          type: 'email',
          name: 'Primary Email',
          config: { recipients: ['alerts@company.com', 'ops@company.com'] },
          active: true
        },
        {
          id: 'slack_ops',
          type: 'slack',
          name: 'Operations Slack',
          config: { webhook_url: 'https://hooks.slack.com/...' },
          active: true
        },
        {
          id: 'sms_critical',
          type: 'sms',
          name: 'Critical SMS',
          config: { phone_numbers: ['+1234567890'] },
          active: false
        }
      ]);

    } catch (error) {
      console.error('Error loading monitoring data:', error);
      toast.error('Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  };

  const toggleAlertRule = async (ruleId: string, active: boolean) => {
    try {
      setAlertRules(prev => 
        prev.map(rule => 
          rule.id === ruleId ? { ...rule, active } : rule
        )
      );
      
      toast.success(`Alert rule ${active ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling alert rule:', error);
      toast.error('Failed to update alert rule');
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('intelligence_alerts')
        .update({ 
          status: 'resolved', 
          resolved_at: new Date().toISOString() 
        })
        .eq('id', alertId);

      if (error) throw error;

      setRealtimeAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId 
            ? { ...alert, status: 'resolved', resolved_at: new Date().toISOString() }
            : alert
        )
      );

      toast.success('Alert resolved');
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error('Failed to resolve alert');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-destructive bg-destructive/10';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-warning bg-warning/10';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Info className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <Smartphone className="h-4 w-4" />;
      case 'slack': return <Slack className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
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
        </div>
      </div>
    );
  }

  const activeAlerts = realtimeAlerts.filter(alert => alert.status === 'active');
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');
  const highAlerts = activeAlerts.filter(alert => alert.severity === 'high');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-time Monitoring</h1>
          <p className="text-muted-foreground">Intelligent monitoring and alerting system</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="monitoring-toggle">Monitoring Active</Label>
            <Switch
              id="monitoring-toggle"
              checked={monitoringActive}
              onCheckedChange={setMonitoringActive}
            />
          </div>
          <Badge variant={monitoringActive ? 'default' : 'secondary'}>
            {monitoringActive ? (
              <>
                <Activity className="h-3 w-3 mr-1" />
                Live
              </>
            ) : (
              <>
                <Pause className="h-3 w-3 mr-1" />
                Paused
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Critical Alerts</p>
                <p className="text-2xl font-bold text-destructive">{criticalAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-orange-500">{highAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">{activeAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Active Rules</p>
                <p className="text-2xl font-bold">{alertRules.filter(r => r.active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="rules">Alert Rules</TabsTrigger>
          <TabsTrigger value="channels">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {realtimeAlerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className={`p-1 rounded ${getSeverityColor(alert.severity)}`}>
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{alert.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {alert.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(alert.triggered_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Ingestion</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-sm">Operational</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Alert Processing</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-sm">Operational</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Notification System</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-sm">Operational</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ERDDAP Connection</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-sm">Connected</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-success mx-auto mb-2" />
                    <p className="text-lg font-medium">No Active Alerts</p>
                    <p className="text-muted-foreground">All systems are operating normally</p>
                  </div>
                ) : (
                  activeAlerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded ${getSeverityColor(alert.severity)}`}>
                            {getSeverityIcon(alert.severity)}
                          </div>
                          <div>
                            <h4 className="font-medium">{alert.title}</h4>
                            <p className="text-sm text-muted-foreground">{alert.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <Button size="sm" onClick={() => resolveAlert(alert.id)}>
                            Resolve
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Triggered: {new Date(alert.triggered_at).toLocaleString()}
                        </div>
                        {alert.location_lat && alert.location_lng && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Location: {alert.location_lat.toFixed(2)}, {alert.location_lng.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Alert Rules</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertRules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{rule.name}</h4>
                          <Badge className={getSeverityColor(rule.severity)}>
                            {rule.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.active}
                          onCheckedChange={(checked) => toggleAlertRule(rule.id, checked)}
                        />
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>
                        Conditions: {rule.conditions.map(c => 
                          `${c.variable} ${c.operator} ${c.threshold}`
                        ).join(', ')}
                      </div>
                      <div>
                        Channels: {rule.notification_channels.join(', ')}
                      </div>
                      {rule.last_triggered && (
                        <div>
                          Last triggered: {new Date(rule.last_triggered).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Notification Channels</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Channel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationChannels.map((channel) => (
                  <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 border rounded">
                        {getChannelIcon(channel.type)}
                      </div>
                      <div>
                        <h4 className="font-medium">{channel.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">{channel.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={channel.active ? 'default' : 'secondary'}>
                        {channel.active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
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

export default RealtimeMonitoring;