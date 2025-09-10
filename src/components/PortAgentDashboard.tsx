import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Ship, Fuel, Clock, TrendingUp, MapPin, Info, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PortAgentDashboardProps {
  onPortSelect: (portId: string) => void;
}

interface DashboardData {
  ports: any[];
  active_calls: any[];
  congestion_alerts: any[];
  fuel_prices: any[];
  insights: any[];
}

const PortAgentDashboard: React.FC<PortAgentDashboardProps> = ({ onPortSelect }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('port-agent-services', {
        body: { action: 'get_dashboard' }
      });

      if (error) throw error;

      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching port agent dashboard:', error);
      
      // Fallback to mock data for demonstration
      const mockData = generateMockDashboardData();
      setDashboardData(mockData);
      
      toast({
        title: "Using Demo Data",
        description: "Displaying sample port agent dashboard data",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockDashboardData = (): DashboardData => {
    return {
      ports: [
        {
          id: '1',
          name: 'Port of Helsinki',
          country: 'Finland',
          code: 'FIHEL',
          facilities: '{"berths": 15, "max_draft": 11.0}'
        },
        {
          id: '2',
          name: 'Port of Stockholm',
          country: 'Sweden',
          code: 'SESTO',
          facilities: '{"berths": 12, "max_draft": 10.5}'
        },
        {
          id: '3',
          name: 'Port of Gdansk',
          country: 'Poland',
          code: 'PLGDN',
          facilities: '{"berths": 25, "max_draft": 17.0}'
        }
      ],
      active_calls: [
        {
          id: '1',
          status: 'arrived',
          scheduled_arrival: new Date().toISOString(),
          vessels: { vessel_name: 'Baltic Trader' },
          ports: { name: 'Helsinki', code: 'FIHEL' }
        },
        {
          id: '2',
          status: 'scheduled',
          scheduled_arrival: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          vessels: { vessel_name: 'Nordic Star' },
          ports: { name: 'Stockholm', code: 'SESTO' }
        }
      ],
      congestion_alerts: [],
      fuel_prices: [
        {
          port_name: 'Helsinki',
          fuel_type: 'MGO',
          port_country: 'Finland',
          price_per_tonne: 650
        },
        {
          port_name: 'Stockholm',
          fuel_type: 'MGO',
          port_country: 'Sweden',
          price_per_tonne: 680
        }
      ],
      insights: [
        {
          type: 'efficiency_tip',
          title: 'Port Operations Overview',
          description: 'Baltic ports showing normal operational levels',
          severity: 'info',
          action: 'Continue monitoring'
        },
        {
          type: 'fuel_optimization',
          title: 'Fuel Price Advantage',
          description: 'Helsinki offers competitive fuel prices',
          severity: 'medium',
          action: 'Consider fuel optimization'
        }
      ]
    };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'info': return 'secondary';
      default: return 'outline';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'congestion_alert': return AlertTriangle;
      case 'fuel_optimization': return Fuel;
      case 'efficiency_tip': return TrendingUp;
      default: return Info;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">No dashboard data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboardData.insights.map((insight, index) => {
          const IconComponent = getInsightIcon(insight.type);
          return (
            <Card key={index} className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-5 h-5 text-primary" />
                  <CardTitle className="text-base">{insight.title}</CardTitle>
                  <Badge variant={getSeverityColor(insight.severity) as any}>
                    {insight.severity}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                <p className="text-xs font-medium text-primary">{insight.action}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Baltic Ports Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Baltic Ports Overview
            </CardTitle>
            <CardDescription>Key ports in the Baltic Sea region</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.ports.map((port) => (
                <div 
                  key={port.id} 
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => onPortSelect(port.id)}
                >
                  <div>
                    <p className="font-medium">{port.name}</p>
                    <p className="text-sm text-muted-foreground">{port.country} • {port.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      {(() => {
                        try {
                          const facilities = typeof port.facilities === 'string' ? JSON.parse(port.facilities || '{}') : (port.facilities || {});
                          return facilities.berths || 'N/A';
                        } catch { return 'N/A'; }
                      })()} berths
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Max draft: {(() => {
                        try {
                          const facilities = typeof port.facilities === 'string' ? JSON.parse(port.facilities || '{}') : (port.facilities || {});
                          return facilities.max_draft || 'N/A';
                        } catch { return 'N/A'; }
                      })()}m
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Port Calls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="w-5 h-5" />
              Active Port Calls
            </CardTitle>
            <CardDescription>Current and scheduled vessel movements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.active_calls.slice(0, 5).map((call) => (
                <div key={call.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">
                      {call.vessels?.vessel_name || 'Unknown Vessel'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {call.ports?.name} ({call.ports?.code})
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={call.status === 'arrived' ? 'default' : 'secondary'}>
                      {call.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {call.scheduled_arrival ? 
                        new Date(call.scheduled_arrival).toLocaleDateString() : 
                        'No ETA'
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Port Congestion Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Congestion Alerts
            </CardTitle>
            <CardDescription>High congestion warnings</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.congestion_alerts.length === 0 ? (
              <p className="text-muted-foreground">No high congestion alerts</p>
            ) : (
              <div className="space-y-3">
                {dashboardData.congestion_alerts.map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                    <div>
                      <p className="font-medium">{alert.port_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {alert.vessels_waiting} vessels waiting
                      </p>
                    </div>
                    <Badge variant="destructive">{alert.congestion_level}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fuel Prices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fuel className="w-5 h-5" />
              Bunker Fuel Prices
            </CardTitle>
            <CardDescription>Current fuel pricing across Baltic ports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.fuel_prices.slice(0, 4).map((fuel, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{fuel.port_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {fuel.fuel_type} • {fuel.port_country}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">€{fuel.price_per_tonne}</p>
                    <p className="text-xs text-muted-foreground">per tonne</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={fetchDashboardData} variant="default">
          <Clock className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
        <Button variant="outline" onClick={() => window.location.href = '/intelligence'}>
          View Full Intelligence
        </Button>
        <Button variant="outline" onClick={() => window.location.href = '/shadow-fleet'}>
          Security Monitoring
        </Button>
      </div>
    </div>
  );
};

export default PortAgentDashboard;