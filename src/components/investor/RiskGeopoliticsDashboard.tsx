import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, AlertTriangle, Zap, Globe, Navigation, Radar, Download, MapPin } from 'lucide-react';

const RiskGeopoliticsDashboard = () => {
  // Mock data for maritime incidents
  const incidentTrends = [
    { month: 'Jan', incidents: 12, severity: 2.3, resolved: 11 },
    { month: 'Feb', incidents: 8, severity: 1.8, resolved: 8 },
    { month: 'Mar', incidents: 15, severity: 2.9, resolved: 13 },
    { month: 'Apr', incidents: 6, severity: 1.4, resolved: 6 },
    { month: 'May', incidents: 11, severity: 2.1, resolved: 10 },
    { month: 'Jun', incidents: 9, severity: 1.7, resolved: 9 }
  ];

  // Mock data for geopolitical risk heatmap
  const riskRegions = [
    {
      region: 'Baltic Proper',
      overallRisk: 34,
      environmental: 42,
      geopolitical: 28,
      infrastructure: 31,
      incidents: 23,
      coordinates: { lat: 57.0, lng: 17.0 }
    },
    {
      region: 'Gulf of Finland',
      overallRisk: 45,
      environmental: 38,
      geopolitical: 52,
      infrastructure: 35,
      incidents: 31,
      coordinates: { lat: 59.8, lng: 26.0 }
    },
    {
      region: 'Bothnia Bay',
      overallRisk: 23,
      environmental: 28,
      geopolitical: 15,
      infrastructure: 26,
      incidents: 8,
      coordinates: { lat: 64.0, lng: 21.0 }
    },
    {
      region: 'Danish Straits',
      overallRisk: 38,
      environmental: 35,
      geopolitical: 31,
      infrastructure: 48,
      incidents: 19,
      coordinates: { lat: 55.5, lng: 12.0 }
    },
    {
      region: 'Gulf of Riga',
      overallRisk: 29,
      environmental: 33,
      geopolitical: 26,
      infrastructure: 28,
      incidents: 12,
      coordinates: { lat: 57.5, lng: 23.5 }
    }
  ];

  // Mock data for NATO exercises and military activity
  const militaryActivity = [
    {
      event: 'Baltic Operations Exercise',
      type: 'NATO Exercise',
      status: 'Scheduled',
      date: '2024-07-15',
      duration: '14 days',
      impact: 'Medium',
      affectedAreas: ['Central Baltic', 'Gulf of Finland'],
      description: 'Multi-national naval exercise with shipping lane restrictions'
    },
    {
      event: 'Northern Coasts Maritime Security',
      type: 'Joint Patrol',
      status: 'Active',
      date: '2024-06-20',
      duration: 'Ongoing',
      impact: 'Low',
      affectedAreas: ['Swedish EEZ', 'Finnish Waters'],
      description: 'Enhanced maritime surveillance operations'
    },
    {
      event: 'BALTOPS 2024',
      type: 'NATO Exercise',
      status: 'Completed',
      date: '2024-06-02',
      duration: '12 days',
      impact: 'High',
      affectedAreas: ['Baltic Sea Wide'],
      description: 'Large-scale multinational maritime exercise'
    }
  ];

  // Mock data for energy security indicators
  const energySecurityData = [
    { month: 'Jan', supply: 94, demand: 89, reserves: 78, imports: 23 },
    { month: 'Feb', supply: 92, demand: 91, reserves: 76, imports: 25 },
    { month: 'Mar', supply: 89, demand: 94, reserves: 74, imports: 28 },
    { month: 'Apr', supply: 91, demand: 88, reserves: 77, imports: 24 },
    { month: 'May', supply: 95, demand: 85, reserves: 81, imports: 21 },
    { month: 'Jun', supply: 93, demand: 87, reserves: 79, imports: 22 }
  ];

  // Mock data for regulatory changes
  const regulatoryChanges = [
    {
      title: 'Enhanced Sanctions Enforcement',
      type: 'EU Regulation',
      effectiveDate: '2024-07-01',
      impact: 'High',
      sectors: ['Shipping', 'Energy', 'Trade'],
      description: 'Stricter compliance requirements for Russian oil transport',
      investmentImpact: 'Negative for conventional shipping, positive for compliant operators'
    },
    {
      title: 'Green Shipping Corridor Initiative',
      type: 'Policy Framework',
      effectiveDate: '2024-08-15',
      impact: 'Medium',
      sectors: ['Maritime', 'Green Tech'],
      description: 'New incentives for zero-emission shipping technologies',
      investmentImpact: 'Positive for clean tech investments'
    },
    {
      title: 'Baltic Maritime Security Act',
      type: 'Regional Agreement',
      effectiveDate: '2024-09-01',
      impact: 'Medium',
      sectors: ['Defense', 'Infrastructure'],
      description: 'Enhanced coordination on maritime domain awareness',
      investmentImpact: 'Positive for security tech and monitoring systems'
    }
  ];

  const keyRiskMetrics = [
    {
      title: 'Regional Risk Level',
      value: 'Medium',
      change: 'Stable',
      trend: 'stable',
      icon: Shield,
      description: 'Composite risk assessment'
    },
    {
      title: 'Maritime Incidents',
      value: '9/month',
      change: '-3',
      trend: 'up',
      icon: Navigation,
      description: 'Average monthly incidents'
    },
    {
      title: 'Energy Security',
      value: '91%',
      change: '+2%',
      trend: 'up',
      icon: Zap,
      description: 'Supply reliability index'
    },
    {
      title: 'NATO Activity',
      value: '2 Active',
      change: 'Normal',
      trend: 'stable',
      icon: Radar,
      description: 'Current operations'
    }
  ];

  const getRiskColor = (risk: number) => {
    if (risk <= 30) return 'text-green-600';
    if (risk <= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
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
          <h2 className="text-3xl font-bold">Risk & Geopolitics Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Maritime incidents, NATO exercises, energy security, and regulatory changes
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Risk Assessment Report
        </Button>
      </div>

      {/* Key Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyRiskMetrics.map((metric, index) => (
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

      <Tabs defaultValue="incidents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="incidents">Maritime Incidents</TabsTrigger>
          <TabsTrigger value="heatmap">Risk Heatmap</TabsTrigger>
          <TabsTrigger value="military">Military Activity</TabsTrigger>
          <TabsTrigger value="regulatory">Regulatory Changes</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Incident Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-red-600" />
                  Maritime Incident Trends
                </CardTitle>
                <CardDescription>
                  Monthly incident counts and severity analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={incidentTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="incidents" fill="#3b82f6" name="Incidents" />
                    <Line yAxisId="right" type="monotone" dataKey="severity" stroke="#ef4444" name="Avg Severity" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Energy Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Energy Security Indicators
                </CardTitle>
                <CardDescription>
                  Supply reliability and import dependency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={energySecurityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="supply" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Supply Security" />
                    <Area type="monotone" dataKey="reserves" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Strategic Reserves" />
                    <Line type="monotone" dataKey="imports" stroke="#ef4444" name="Import Dependency" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-600" />
                Regional Risk Heatmap
              </CardTitle>
              <CardDescription>
                Risk assessment by Baltic Sea regions with detailed breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskRegions.map((region, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{region.region}</h4>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={region.overallRisk <= 30 ? 'secondary' : region.overallRisk <= 60 ? 'default' : 'destructive'}
                        >
                          Risk: {region.overallRisk}/100
                        </Badge>
                        <Badge variant="outline">
                          {region.incidents} incidents
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Environmental</span>
                          <span className={`font-medium ${getRiskColor(region.environmental)}`}>
                            {region.environmental}/100
                          </span>
                        </div>
                        <Progress value={region.environmental} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Geopolitical</span>
                          <span className={`font-medium ${getRiskColor(region.geopolitical)}`}>
                            {region.geopolitical}/100
                          </span>
                        </div>
                        <Progress value={region.geopolitical} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Infrastructure</span>
                          <span className={`font-medium ${getRiskColor(region.infrastructure)}`}>
                            {region.infrastructure}/100
                          </span>
                        </div>
                        <Progress value={region.infrastructure} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="military" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radar className="h-5 w-5 text-blue-600" />
                NATO Exercises & Military Activity
              </CardTitle>
              <CardDescription>
                Current and scheduled military operations affecting maritime traffic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {militaryActivity.map((activity, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-semibold">{activity.event}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>Type: {activity.type}</span>
                          <span>Date: {activity.date}</span>
                          <span>Duration: {activity.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={activity.status === 'Active' ? 'default' : activity.status === 'Scheduled' ? 'secondary' : 'outline'}
                        >
                          {activity.status}
                        </Badge>
                        <Badge 
                          variant={activity.impact === 'High' ? 'destructive' : activity.impact === 'Medium' ? 'default' : 'secondary'}
                        >
                          {activity.impact} Impact
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm">{activity.description}</p>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Affected Areas:</span>
                      <div className="flex flex-wrap gap-1">
                        {activity.affectedAreas.map((area, areaIndex) => (
                          <Badge key={areaIndex} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regulatory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-600" />
                Regulatory Changes & Impact
              </CardTitle>
              <CardDescription>
                Recent and upcoming regulatory changes affecting investments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {regulatoryChanges.map((change, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h4 className="font-semibold">{change.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>Type: {change.type}</span>
                          <span>Effective: {change.effectiveDate}</span>
                        </div>
                      </div>
                      <Badge 
                        variant={change.impact === 'High' ? 'destructive' : change.impact === 'Medium' ? 'default' : 'secondary'}
                      >
                        {change.impact} Impact
                      </Badge>
                    </div>
                    
                    <p className="text-sm">{change.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Affected Sectors:</span>
                        <div className="flex flex-wrap gap-1">
                          {change.sectors.map((sector, sectorIndex) => (
                            <Badge key={sectorIndex} variant="outline" className="text-xs">
                              {sector}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="text-sm font-medium text-blue-800 mb-1">Investment Impact</div>
                        <div className="text-sm text-blue-700">{change.investmentImpact}</div>
                      </div>
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

export default RiskGeopoliticsDashboard;