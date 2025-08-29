import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock, BarChart3, Target, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PortPerformanceProps {
  selectedPort?: string | null;
}

interface PerformanceData {
  performance: any[];
  metrics: {
    avg_waiting_time: number;
    avg_handling_rate: number;
    efficiency_trend: string;
  };
}

const PortPerformance: React.FC<PortPerformanceProps> = ({ selectedPort }) => {
  const [ports, setPorts] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPortId, setCurrentPortId] = useState<string | null>(selectedPort);
  const [vesselCategory, setVesselCategory] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchPorts();
  }, []);

  useEffect(() => {
    if (selectedPort) {
      setCurrentPortId(selectedPort);
      fetchPortPerformance(selectedPort);
    }
  }, [selectedPort]);

  const fetchPorts = async () => {
    try {
      const { data, error } = await supabase
        .from('ports')
        .select('*')
        .order('name');

      if (error) throw error;
      setPorts(data);
    } catch (error) {
      console.error('Error fetching ports:', error);
      toast({
        title: "Error",
        description: "Failed to load ports data",
        variant: "destructive",
      });
    }
  };

  const fetchPortPerformance = async (portId: string) => {
    if (!portId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('port-agent-services', {
        body: { 
          action: 'get_port_performance',
          port_id: portId
        }
      });

      if (error) throw error;
      setPerformanceData(data);
    } catch (error) {
      console.error('Error fetching port performance:', error);
      
      // Fallback to generate mock performance data
      const mockData = generateMockPerformanceData();
      setPerformanceData(mockData);
      
      toast({
        title: "Using Mock Data",
        description: "Displaying simulated port performance metrics",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockPerformanceData = (): PerformanceData => {
    const performance = [];
    const metrics = [
      'average_waiting_time',
      'cargo_handling_rate',
      'berth_utilization',
      'turnaround_time',
      'on_time_performance'
    ];

    // Generate 30 days of data
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      metrics.forEach(metric => {
        let value;
        let unit;
        
        switch (metric) {
          case 'average_waiting_time':
            value = 2 + Math.random() * 8; // 2-10 hours
            unit = 'hours';
            break;
          case 'cargo_handling_rate':
            value = 80 + Math.random() * 60; // 80-140 moves/hour
            unit = 'moves_per_hour';
            break;
          case 'berth_utilization':
            value = 60 + Math.random() * 30; // 60-90%
            unit = 'percentage';
            break;
          case 'turnaround_time':
            value = 18 + Math.random() * 16; // 18-34 hours
            unit = 'hours';
            break;
          case 'on_time_performance':
            value = 75 + Math.random() * 20; // 75-95%
            unit = 'percentage';
            break;
          default:
            value = Math.random() * 100;
            unit = 'units';
        }

        performance.push({
          id: `${metric}-${i}`,
          metric_type: metric,
          metric_value: value,
          unit,
          measurement_date: date.toISOString().split('T')[0],
          vessel_category: ['container', 'bulk', 'ro-ro'][Math.floor(Math.random() * 3)],
          source: 'port_authority'
        });
      });
    }

    return {
      performance,
      metrics: {
        avg_waiting_time: 4.5,
        avg_handling_rate: 95.0,
        efficiency_trend: 'improving'
      }
    };
  };

  const handlePortSelect = (portId: string) => {
    setCurrentPortId(portId);
    fetchPortPerformance(portId);
  };

  const getMetricsByType = (type: string) => {
    if (!performanceData) return [];
    return performanceData.performance
      .filter(p => p.metric_type === type)
      .sort((a, b) => new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime())
      .slice(0, 7); // Last 7 days
  };

  const calculateTrend = (metrics: any[]) => {
    if (metrics.length < 2) return 'stable';
    const recent = metrics[0].metric_value;
    const older = metrics[metrics.length - 1].metric_value;
    const diff = ((recent - older) / older) * 100;
    
    if (Math.abs(diff) < 5) return 'stable';
    return diff > 0 ? 'improving' : 'declining';
  };

  const getTrendIcon = (trend: string, inverted = false) => {
    const isPositive = inverted ? trend === 'declining' : trend === 'improving';
    
    if (trend === 'stable') return <Target className="w-4 h-4 text-yellow-500" />;
    if (isPositive) return <TrendingUp className="w-4 h-4 text-green-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const formatMetricValue = (value: number, unit: string) => {
    switch (unit) {
      case 'hours':
        return `${value.toFixed(1)}h`;
      case 'moves_per_hour':
        return `${Math.round(value)} moves/h`;
      case 'percentage':
        return `${Math.round(value)}%`;
      case 'tons_per_hour':
        return `${Math.round(value)} t/h`;
      default:
        return value.toFixed(1);
    }
  };

  const currentPort = ports.find(p => p.id === currentPortId);

  return (
    <div className="space-y-6">
      {/* Port Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Port Performance Analytics
          </CardTitle>
          <CardDescription>
            Operational efficiency metrics and performance benchmarking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={currentPortId || ''} onValueChange={handlePortSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a port" />
                </SelectTrigger>
                <SelectContent>
                  {ports.map((port) => (
                    <SelectItem key={port.id} value={port.id}>
                      {port.name} ({port.code}) - {port.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="sm:w-48">
              <Select value={vesselCategory} onValueChange={setVesselCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vessels</SelectItem>
                  <SelectItem value="container">Container Ships</SelectItem>
                  <SelectItem value="bulk">Bulk Carriers</SelectItem>
                  <SelectItem value="ro-ro">Ro-Ro Vessels</SelectItem>
                  <SelectItem value="cruise">Cruise Ships</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={() => currentPortId && fetchPortPerformance(currentPortId)} 
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Metrics */}
      {performanceData && currentPort && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Average Waiting Time */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {formatMetricValue(performanceData.metrics.avg_waiting_time, 'hours')}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg. Waiting Time</p>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(performanceData.metrics.efficiency_trend, true)}
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Handling Rate */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {formatMetricValue(performanceData.metrics.avg_handling_rate, 'moves_per_hour')}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg. Handling Rate</p>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(performanceData.metrics.efficiency_trend)}
                  <BarChart3 className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Efficiency Trend */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold capitalize">
                    {performanceData.metrics.efficiency_trend}
                  </p>
                  <p className="text-sm text-muted-foreground">Overall Trend</p>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(performanceData.metrics.efficiency_trend)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Score */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">A-</p>
                  <p className="text-sm text-muted-foreground">Performance Grade</p>
                </div>
                <Target className="w-6 h-6 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Metrics */}
      {performanceData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Waiting Time Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Waiting Time Analysis
              </CardTitle>
              <CardDescription>
                Average vessel waiting times by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getMetricsByType('average_waiting_time').slice(0, 5).map((metric, index) => {
                  const trend = calculateTrend(getMetricsByType('average_waiting_time').slice(index, index + 2));
                  return (
                    <div key={metric.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium capitalize">{metric.vessel_category || 'All Vessels'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(metric.measurement_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {getTrendIcon(trend, true)}
                        <span className="font-semibold">
                          {formatMetricValue(metric.metric_value, metric.unit)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Cargo Handling Efficiency */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Cargo Handling Efficiency
              </CardTitle>
              <CardDescription>
                Throughput rates by vessel and cargo type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getMetricsByType('cargo_handling_rate').slice(0, 5).map((metric, index) => {
                  const trend = calculateTrend(getMetricsByType('cargo_handling_rate').slice(index, index + 2));
                  return (
                    <div key={metric.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium capitalize">{metric.vessel_category || 'All Vessels'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(metric.measurement_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {getTrendIcon(trend)}
                        <span className="font-semibold">
                          {formatMetricValue(metric.metric_value, metric.unit)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Insights */}
      {performanceData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Performance Insights
            </CardTitle>
            <CardDescription>
              AI-generated insights and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20">
                <h4 className="font-medium text-green-800 dark:text-green-400 mb-2">Strong Performance</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {currentPort?.name} shows excellent cargo handling efficiency with rates 15% above regional average.
                </p>
              </div>
              
              <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-400 mb-2">Optimization Opportunity</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Peak hour congestion could be reduced by optimizing berth scheduling during 09:00-11:00.
                </p>
              </div>
              
              <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Seasonal Trend</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Performance typically improves 20% during winter months due to reduced cruise traffic.
                </p>
              </div>
              
              <div className="p-4 rounded-lg border border-purple-200 bg-purple-50 dark:bg-purple-950/20">
                <h4 className="font-medium text-purple-800 dark:text-purple-400 mb-2">Benchmark Status</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Currently ranked #3 among Baltic ports for container handling efficiency.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {!performanceData && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Port</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Choose a Baltic Sea port from the dropdown above to view detailed performance analytics and operational metrics
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PortPerformance;