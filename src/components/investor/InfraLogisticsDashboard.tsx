import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Ship, Truck, Zap, Building2, Clock, TrendingUp, AlertTriangle, Download, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const InfraLogisticsDashboard = () => {
  const [realData, setRealData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchRealPortData();
  }, []);

  const fetchRealPortData = async () => {
    try {
      console.log('Fetching real port data...');
      
      // Fetch real port performance data
      const { data: portData, error: portError } = await supabase.functions.invoke('real-port-data', {
        body: {}
      });

      if (portError) {
        console.error('Error fetching port data:', portError);
        setLoading(false);
        return;
      }

      console.log('Received port data:', portData);
      setRealData(portData);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchRealPortData:', error);
      setLoading(false);
    }
  };
  // Mock data for port performance
  const portPerformanceData = [
    { month: 'Jan', turnaround: 18.2, utilization: 87, throughput: 2340 },
    { month: 'Feb', turnaround: 17.8, utilization: 89, throughput: 2480 },
    { month: 'Mar', turnaround: 16.9, utilization: 91, throughput: 2650 },
    { month: 'Apr', turnaround: 16.2, utilization: 94, throughput: 2890 },
    { month: 'May', turnaround: 15.8, utilization: 96, throughput: 3120 },
    { month: 'Jun', turnaround: 15.1, utilization: 98, throughput: 3350 }
  ];

  // Mock data for infrastructure projects pipeline
  const infrastructureProjects = [
    {
      name: 'Baltic Wind Terminal Expansion',
      type: 'Port Infrastructure',
      status: 'Construction',
      investment: '€1.2B',
      completion: '2025 Q3',
      capacity: '+40% handling',
      roi: '12-15%',
      riskLevel: 'Medium',
      keyMetrics: {
        jobsCreated: 2400,
        co2Reduction: '850k tons/year',
        efficiency: '+35%'
      }
    },
    {
      name: 'Stockholm Smart Logistics Hub',
      type: 'Digital Infrastructure',
      status: 'Development',
      investment: '€450M',
      completion: '2024 Q4',
      capacity: '2M containers/year',
      roi: '18-22%',
      riskLevel: 'Low',
      keyMetrics: {
        jobsCreated: 1200,
        efficiency: '+45%',
        digitization: '100%'
      }
    },
    {
      name: 'Helsinki Green Energy Grid',
      type: 'Energy Infrastructure',
      status: 'Planning',
      investment: '€800M',
      completion: '2026 Q2',
      capacity: '500 MW renewable',
      roi: '8-11%',
      riskLevel: 'Medium',
      keyMetrics: {
        jobsCreated: 1800,
        co2Reduction: '1.2M tons/year',
        reliability: '+25%'
      }
    },
    {
      name: 'Baltic Rail Freight Corridor',
      type: 'Transport Infrastructure',
      status: 'Feasibility',
      investment: '€2.1B',
      completion: '2027 Q1',
      capacity: '15M tons/year',
      roi: '9-13%',
      riskLevel: 'High',
      keyMetrics: {
        jobsCreated: 3600,
        efficiency: '+60%',
        modalShift: '30%'
      }
    }
  ];

  // Mock data for congestion monitoring
  const congestionData = [
    { port: 'Göteborg', current: 23, forecast: 28, capacity: 89, alerts: 1 },
    { port: 'Stockholm', current: 31, forecast: 35, capacity: 92, alerts: 2 },
    { port: 'Helsinki', current: 19, forecast: 22, capacity: 86, alerts: 0 },
    { port: 'Copenhagen', current: 42, forecast: 38, capacity: 94, alerts: 3 },
    { port: 'Tallinn', current: 28, forecast: 31, capacity: 78, alerts: 1 },
    { port: 'Riga', current: 35, forecast: 39, capacity: 82, alerts: 2 }
  ];

  // Mock data for sanctions/shadow fleet monitoring
  const riskMonitoring = [
    {
      category: 'Shadow Fleet Activity',
      level: 'Medium',
      incidents: 12,
      trend: 'stable',
      description: 'Detected vessels with AIS gaps near major shipping lanes'
    },
    {
      category: 'Sanctions Compliance',
      level: 'Low',
      incidents: 3,
      trend: 'decreasing',
      description: 'Minimal sanctions-related shipping disruptions'
    },
    {
      category: 'Infrastructure Security',
      level: 'Low',
      incidents: 1,
      trend: 'stable',
      description: 'Port and terminal security assessments normal'
    }
  ];

  const keyInfraMetrics = [
    {
      title: 'Avg Port Efficiency',
      value: '92%',
      change: '+4%',
      trend: 'up',
      icon: Ship,
      description: 'Regional capacity utilization'
    },
    {
      title: 'Pipeline Investment',
      value: '€4.6B',
      change: '+18%',
      trend: 'up',
      icon: Building2,
      description: 'Active infrastructure projects'
    },
    {
      title: 'Avg Turnaround',
      value: '16.3h',
      change: '-2.1h',
      trend: 'up',
      icon: Clock,
      description: 'Port operational efficiency'
    },
    {
      title: 'Risk Level',
      value: 'Low-Med',
      change: 'Stable',
      trend: 'stable',
      icon: AlertTriangle,
      description: 'Infrastructure security'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Construction': return 'bg-blue-100 text-blue-800';
      case 'Development': return 'bg-green-100 text-green-800';
      case 'Planning': return 'bg-yellow-100 text-yellow-800';
      case 'Feasibility': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'High': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Infrastructure & Logistics Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Port performance, capacity utilization, and infrastructure investment pipeline
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Infrastructure Report
        </Button>
      </div>

      {/* Key Infrastructure Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyInfraMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className={`h-4 w-4 ${
                metric.trend === 'up' ? 'text-green-600' : 
                metric.trend === 'down' ? 'text-red-600' : 'text-yellow-600'
              }`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span className={
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-yellow-600'
                }>
                  {metric.change}
                </span>
                <span>•</span>
                <span>{metric.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Port Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5 text-blue-600" />
              Port Performance Trends
            </CardTitle>
            <CardDescription>
              Turnaround times, utilization, and throughput metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={portPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="turnaround" stroke="#3b82f6" name="Turnaround (hours)" />
                <Line yAxisId="right" type="monotone" dataKey="utilization" stroke="#10b981" name="Utilization %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Congestion Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Real-time Congestion Monitor
            </CardTitle>
            <CardDescription>
              Current and forecasted port congestion levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {congestionData.map((port, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{port.port}</h4>
                    <div className="flex items-center gap-2">
                      {port.alerts > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {port.alerts} alerts
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {port.capacity}% capacity
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Current Wait</div>
                      <div className="font-medium">{port.current}h</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">24h Forecast</div>
                      <div className={`font-medium ${
                        port.forecast > port.current ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {port.forecast}h
                      </div>
                    </div>
                  </div>
                  <Progress value={port.capacity} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Infrastructure Projects Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-green-600" />
            Infrastructure Investment Pipeline
          </CardTitle>
          <CardDescription>
            Major infrastructure projects with investment opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {infrastructureProjects.map((project, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold">{project.name}</h4>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Type: {project.type}</span>
                      <span>Investment: {project.investment}</span>
                      <span>Completion: {project.completion}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-bold text-lg">{project.roi}</div>
                    <div className={`text-sm font-medium ${getRiskColor(project.riskLevel)}`}>
                      {project.riskLevel} Risk
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Capacity Impact</div>
                    <div className="font-medium">{project.capacity}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Jobs Created</div>
                    <div className="font-medium">{project.keyMetrics.jobsCreated.toLocaleString()}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground">Environmental Impact</div>
                    <div className="font-medium">
                      {project.keyMetrics.co2Reduction || `${project.keyMetrics.efficiency} efficiency`}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                  <Button size="sm">
                    Investment Opportunity
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Infrastructure Risk Monitoring
          </CardTitle>
          <CardDescription>
            Sanctions exposure, shadow fleet activity, and security assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {riskMonitoring.map((risk, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{risk.category}</h4>
                  <Badge 
                    variant={risk.level === 'Low' ? 'secondary' : risk.level === 'Medium' ? 'default' : 'destructive'}
                  >
                    {risk.level} Risk
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Incidents (30d)</span>
                    <span className="font-medium">{risk.incidents}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Trend</span>
                    <span className={`font-medium ${
                      risk.trend === 'decreasing' ? 'text-green-600' :
                      risk.trend === 'increasing' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {risk.trend}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{risk.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfraLogisticsDashboard;