import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar } from 'recharts';
import { Waves, Leaf, Zap, Recycle, Fish, TreePine, Award, AlertCircle, CheckCircle, Download } from 'lucide-react';

const ESGSustainabilityDashboard = () => {
  // Mock data for water quality trends
  const waterQualityData = [
    { month: 'Jan', nutrients: 68, oxygen: 78, biodiversity: 72 },
    { month: 'Feb', nutrients: 71, oxygen: 76, biodiversity: 74 },
    { month: 'Mar', nutrients: 69, oxygen: 79, biodiversity: 73 },
    { month: 'Apr', nutrients: 73, oxygen: 81, biodiversity: 76 },
    { month: 'May', nutrients: 75, oxygen: 83, biodiversity: 78 },
    { month: 'Jun', nutrients: 77, oxygen: 85, biodiversity: 80 }
  ];

  // Mock data for renewable energy
  const renewableData = [
    { country: 'Denmark', offshore: 89, onshore: 67, hydro: 23, total: 78 },
    { country: 'Sweden', offshore: 34, onshore: 45, hydro: 89, total: 67 },
    { country: 'Finland', offshore: 12, onshore: 28, hydro: 67, total: 45 },
    { country: 'Estonia', offshore: 45, onshore: 34, hydro: 12, total: 34 },
    { country: 'Latvia', offshore: 23, onshore: 56, hydro: 78, total: 56 },
    { country: 'Lithuania', offshore: 67, onshore: 23, hydro: 34, total: 43 }
  ];

  // Mock data for emissions by sector
  const emissionsData = [
    { name: 'Shipping', value: 35, color: '#3b82f6' },
    { name: 'Industrial', value: 28, color: '#10b981' },
    { name: 'Energy', value: 22, color: '#f59e0b' },
    { name: 'Transport', value: 15, color: '#ef4444' }
  ];

  // Mock data for ecological scores
  const municipalityScores = [
    { 
      name: 'Stockholm', 
      overallScore: 94, 
      waterHealth: 96, 
      emissions: 91, 
      biodiversity: 88, 
      renewables: 93, 
      circularity: 90,
      taxonomyAlignment: 'Article 9',
      sfdrCategory: 'Article 8'
    },
    { 
      name: 'Helsinki', 
      overallScore: 89, 
      waterHealth: 87, 
      emissions: 88, 
      biodiversity: 84, 
      renewables: 91, 
      circularity: 85,
      taxonomyAlignment: 'Article 8',
      sfdrCategory: 'Article 8'
    },
    { 
      name: 'Copenhagen', 
      overallScore: 92, 
      waterHealth: 94, 
      emissions: 89, 
      biodiversity: 91, 
      renewables: 95, 
      circularity: 88,
      taxonomyAlignment: 'Article 9',
      sfdrCategory: 'Article 9'
    },
    { 
      name: 'Göteborg', 
      overallScore: 86, 
      waterHealth: 83, 
      emissions: 85, 
      biodiversity: 79, 
      renewables: 87, 
      circularity: 82,
      taxonomyAlignment: 'Article 6',
      sfdrCategory: 'Article 8'
    }
  ];

  // Mock data for ESG investment pipeline
  const investmentPipeline = [
    {
      project: 'Baltic Offshore Wind Cluster Phase III',
      capacity: '2.4 GW',
      investment: '€4.8B',
      stage: 'Development',
      esgScore: 95,
      taxonomyAligned: true,
      impactMetrics: {
        co2Reduction: '3.2M tons/year',
        jobsCreated: '12,400',
        biodiversityImpact: 'Positive'
      }
    },
    {
      project: 'Stockholm Green Infrastructure Bond',
      capacity: 'Municipal',
      investment: '€850M',
      stage: 'Active',
      esgScore: 92,
      taxonomyAligned: true,
      impactMetrics: {
        co2Reduction: '450k tons/year',
        jobsCreated: '3,200',
        biodiversityImpact: 'Highly Positive'
      }
    },
    {
      project: 'Baltic Circular Economy Hub',
      capacity: 'Regional',
      investment: '€1.2B',
      stage: 'Planning',
      esgScore: 88,
      taxonomyAligned: true,
      impactMetrics: {
        wasteReduction: '75%',
        jobsCreated: '5,600',
        biodiversityImpact: 'Neutral'
      }
    }
  ];

  const keyESGMetrics = [
    {
      title: 'Regional ESG Score',
      value: '89/100',
      change: '+5 pts',
      trend: 'up',
      icon: Award,
      description: 'Weighted composite score'
    },
    {
      title: 'Water Quality Index',
      value: '82/100',
      change: '+3 pts',
      trend: 'up',
      icon: Waves,
      description: 'Baltic Sea health metric'
    },
    {
      title: 'Renewable Penetration',
      value: '67%',
      change: '+8%',
      trend: 'up',
      icon: Zap,
      description: 'Regional energy mix'
    },
    {
      title: 'EU Taxonomy Alignment',
      value: '78%',
      change: '+12%',
      trend: 'up',
      icon: CheckCircle,
      description: 'Eligible investments'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">ESG & Sustainability Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Environmental, social, and governance metrics with EU Taxonomy alignment
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          ESG Report
        </Button>
      </div>

      {/* Key ESG Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyESGMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span className="text-green-600">{metric.change}</span>
                <span>•</span>
                <span>{metric.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="environmental" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="environmental">Environmental</TabsTrigger>
          <TabsTrigger value="social">Social Impact</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
          <TabsTrigger value="taxonomy">EU Taxonomy</TabsTrigger>
        </TabsList>

        <TabsContent value="environmental" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Water Quality Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Waves className="h-5 w-5 text-blue-600" />
                  Baltic Sea Health Indicators
                </CardTitle>
                <CardDescription>
                  Key environmental metrics trending over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={waterQualityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="nutrients" stroke="#3b82f6" name="Nutrient Status" />
                    <Line type="monotone" dataKey="oxygen" stroke="#10b981" name="Oxygen Levels" />
                    <Line type="monotone" dataKey="biodiversity" stroke="#f59e0b" name="Biodiversity Index" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Renewable Energy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-600" />
                  Renewable Energy Penetration
                </CardTitle>
                <CardDescription>
                  Clean energy capacity by country and type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={renewableData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="offshore" stackId="a" fill="#3b82f6" name="Offshore Wind" />
                    <Bar dataKey="onshore" stackId="a" fill="#10b981" name="Onshore Wind" />
                    <Bar dataKey="hydro" stackId="a" fill="#06b6d4" name="Hydro" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Emissions Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Emissions by Sector</CardTitle>
                <CardDescription>
                  Regional CO2 emissions distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={emissionsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {emissionsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {emissionsData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Municipality ESG Performance</CardTitle>
                <CardDescription>
                  Detailed ecological scoring and compliance status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {municipalityScores.map((municipality, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{municipality.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={municipality.taxonomyAlignment === 'Article 9' ? 'default' : 'secondary'}
                          >
                            {municipality.taxonomyAlignment}
                          </Badge>
                          <Badge variant="outline">
                            SFDR: {municipality.sfdrCategory}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <div className="text-muted-foreground mb-1">Overall Score</div>
                          <div className="font-bold text-lg">{municipality.overallScore}/100</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Water Health</div>
                          <Progress value={municipality.waterHealth} className="h-2" />
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Emissions</div>
                          <Progress value={municipality.emissions} className="h-2" />
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Biodiversity</div>
                          <Progress value={municipality.biodiversity} className="h-2" />
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Renewables</div>
                          <Progress value={municipality.renewables} className="h-2" />
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Circularity</div>
                          <Progress value={municipality.circularity} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Impact Metrics</CardTitle>
              <CardDescription>
                Community and societal impact indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <Fish className="h-8 w-8 mx-auto text-blue-600" />
                  <h4 className="font-semibold">Maritime Employment</h4>
                  <div className="text-2xl font-bold">124K</div>
                  <p className="text-sm text-muted-foreground">Jobs supported</p>
                </div>
                <div className="text-center space-y-2">
                  <TreePine className="h-8 w-8 mx-auto text-green-600" />
                  <h4 className="font-semibold">Community Programs</h4>
                  <div className="text-2xl font-bold">89%</div>
                  <p className="text-sm text-muted-foreground">ESG engagement rate</p>
                </div>
                <div className="text-center space-y-2">
                  <Award className="h-8 w-8 mx-auto text-yellow-600" />
                  <h4 className="font-semibold">Safety Rating</h4>
                  <div className="text-2xl font-bold">A+</div>
                  <p className="text-sm text-muted-foreground">Regional average</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Governance & Compliance</CardTitle>
              <CardDescription>
                Regulatory compliance and governance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Regulatory Compliance</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">EU Green Deal</span>
                        <Badge variant="default">Compliant</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">SFDR Disclosure</span>
                        <Badge variant="default">Article 8/9</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Taxonomy Regulation</span>
                        <Badge variant="default">78% Aligned</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold">Transparency Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">ESG Reporting</span>
                        <Progress value={94} className="w-20 h-2" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Data Quality</span>
                        <Progress value={87} className="w-20 h-2" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Audit Coverage</span>
                        <Progress value={91} className="w-20 h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="taxonomy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>EU Taxonomy Alignment</CardTitle>
              <CardDescription>
                Investment opportunities with taxonomy compliance status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {investmentPipeline.map((project, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h4 className="font-semibold">{project.project}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Capacity: {project.capacity}</span>
                          <span>Investment: {project.investment}</span>
                          <span>Stage: {project.stage}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={project.taxonomyAligned ? 'default' : 'secondary'}>
                          {project.taxonomyAligned ? 'Taxonomy Aligned' : 'Not Aligned'}
                        </Badge>
                        <Badge variant="outline">
                          ESG: {project.esgScore}/100
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="space-y-1">
                        <span className="text-muted-foreground">Environmental Impact</span>
                        <div className="font-medium">{project.impactMetrics.co2Reduction || project.impactMetrics.wasteReduction}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground">Social Impact</span>
                        <div className="font-medium">{project.impactMetrics.jobsCreated} jobs</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground">Biodiversity</span>
                        <div className="font-medium">{project.impactMetrics.biodiversityImpact}</div>
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

export default ESGSustainabilityDashboard;