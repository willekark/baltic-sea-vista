import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Building2, 
  Ship, 
  Zap,
  AlertTriangle,
  Target,
  PlayCircle,
  RefreshCw,
  Download,
  Calendar,
  Users,
  Briefcase
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { downloadTrialReport } from '@/utils/reportDownload';

interface DemoScenario {
  id: string;
  title: string;
  description: string;
  investment_size: string;
  expected_return: string;
  risk_level: 'Low' | 'Medium' | 'High';
  timeline: string;
  key_metrics: any[];
  live_data?: any;
}

export const BankDemoMode = () => {
  const [activeScenario, setActiveScenario] = useState<string>('green-bonds');
  const [liveData, setLiveData] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [demoStarted, setDemoStarted] = useState(false);

  // Professional demo scenarios for bank presentation
  const demoScenarios: DemoScenario[] = [
    {
      id: 'green-bonds',
      title: 'Baltic Green Infrastructure Bonds',
      description: 'ESG-compliant infrastructure investments across Stockholm, Helsinki, and Copenhagen municipal projects',
      investment_size: '€50M - €200M',
      expected_return: '4.2% - 6.8%',
      risk_level: 'Low',
      timeline: '5-10 years',
      key_metrics: [
        { label: 'ESG Score', value: 94, trend: 'up', change: '+8 pts' },
        { label: 'Credit Rating', value: 'AA-', trend: 'stable', change: 'Stable' },
        { label: 'Liquidity', value: 'High', trend: 'up', change: '+12%' },
        { label: 'Carbon Impact', value: '-15%', trend: 'up', change: 'Reduction' }
      ]
    },
    {
      id: 'port-infrastructure',
      title: 'Smart Port Infrastructure Fund',
      description: 'Technology-enabled port modernization across Göteborg, Malmö, and Helsingborg',
      investment_size: '€100M - €500M',
      expected_return: '8.5% - 12.3%',
      risk_level: 'Medium',
      timeline: '3-7 years',
      key_metrics: [
        { label: 'Capacity Growth', value: '+40%', trend: 'up', change: 'Projected' },
        { label: 'Automation Level', value: '85%', trend: 'up', change: '+25%' },
        { label: 'Efficiency Gain', value: '+22%', trend: 'up', change: 'YoY' },
        { label: 'Trade Volume', value: '€2.8B', trend: 'up', change: '+15%' }
      ]
    },
    {
      id: 'blue-economy',
      title: 'Sustainable Maritime Tech',
      description: 'Next-generation shipping technology, alternative fuels, and marine innovation',
      investment_size: '€25M - €100M',
      expected_return: '12% - 18%',
      risk_level: 'High',
      timeline: '2-5 years',
      key_metrics: [
        { label: 'Patent Portfolio', value: '142', trend: 'up', change: '+28' },
        { label: 'Market Size', value: '€45B', trend: 'up', change: 'TAM' },
        { label: 'Fuel Savings', value: '30%', trend: 'up', change: 'Target' },
        { label: 'CO2 Reduction', value: '45%', trend: 'up', change: 'Projected' }
      ]
    }
  ];

  const portfolioData = [
    { name: 'Green Bonds', value: 35, return: 5.2, allocation: 35 },
    { name: 'Port Infrastructure', value: 28, return: 9.8, allocation: 28 },
    { name: 'Maritime Tech', value: 20, return: 14.2, allocation: 20 },
    { name: 'Real Estate', value: 12, return: 6.1, allocation: 12 },
    { name: 'Cash/Liquidity', value: 5, return: 2.1, allocation: 5 }
  ];

  const performanceData = [
    { month: 'Jan 2024', portfolio: 8.2, benchmark: 6.1, alpha: 2.1 },
    { month: 'Feb 2024', portfolio: 9.1, benchmark: 6.8, alpha: 2.3 },
    { month: 'Mar 2024', portfolio: 8.8, benchmark: 7.2, alpha: 1.6 },
    { month: 'Apr 2024', portfolio: 10.2, benchmark: 7.5, alpha: 2.7 },
    { month: 'May 2024', portfolio: 11.1, benchmark: 8.1, alpha: 3.0 },
    { month: 'Jun 2024', portfolio: 10.8, benchmark: 8.4, alpha: 2.4 }
  ];

  const riskMetrics = [
    { metric: 'Sharpe Ratio', value: '1.84', benchmark: '1.32', status: 'outperform' },
    { metric: 'Max Drawdown', value: '-3.2%', benchmark: '-5.8%', status: 'outperform' },
    { metric: 'Beta', value: '0.76', benchmark: '1.00', status: 'defensive' },
    { metric: 'VaR (95%)', value: '-2.8%', benchmark: '-4.1%', status: 'outperform' }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    if (demoStarted) {
      fetchLiveData();
      const interval = setInterval(fetchLiveData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [demoStarted]);

  const fetchLiveData = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('market-data-collector');
      if (error) throw error;
      
      setLiveData(data);
      toast.success('Live market data updated');
    } catch (error) {
      console.error('Error fetching live data:', error);
      toast.error('Failed to fetch live data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const startDemo = () => {
    setDemoStarted(true);
    fetchLiveData();
    toast.success('Demo mode activated - Live data streaming');
  };

  const currentScenario = demoScenarios.find(s => s.id === activeScenario) || demoScenarios[0];

  return (
    <div className="space-y-6 p-6">
      {/* Demo Header */}
      <div className="text-center space-y-4 p-6 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-xl border">
        <div className="inline-flex items-center gap-2 bg-primary/20 px-4 py-2 rounded-full">
          <Briefcase className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Baltic Intelligence - Bank Demo</span>
        </div>
        <h1 className="text-4xl font-bold">
          Professional Investment Platform Demo
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Live demonstration of real-time Baltic Sea investment intelligence for institutional investors
        </p>
        
        {!demoStarted ? (
          <Button 
            size="lg" 
            onClick={startDemo}
            className="text-lg px-8 py-3"
          >
            <PlayCircle className="h-5 w-5 mr-2" />
            Start Live Demo
          </Button>
        ) : (
          <div className="flex items-center justify-center gap-4">
            <Badge variant="secondary" className="bg-green-100 text-green-800 px-4 py-2">
              <Zap className="h-4 w-4 mr-2" />
              Live Data Active
            </Badge>
            <Button 
              variant="outline" 
              onClick={fetchLiveData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        )}
      </div>

      {demoStarted && (
        <>
          {/* Live Market Status */}
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="text-green-800">Live Market Intelligence</CardTitle>
              <CardDescription className="text-green-700">
                Real-time data integration from {liveData ? '12' : '0'} Baltic market sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">€847M</div>
                  <div className="text-sm text-green-700">AUM Managed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">+9.4%</div>
                  <div className="text-sm text-blue-700">YTD Performance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">1.84</div>
                  <div className="text-sm text-purple-700">Sharpe Ratio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">AA-</div>
                  <div className="text-sm text-orange-700">Avg Credit Rating</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeScenario} onValueChange={setActiveScenario} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              {demoScenarios.map((scenario) => (
                <TabsTrigger key={scenario.id} value={scenario.id} className="text-xs">
                  {scenario.title.split(' ').slice(0, 2).join(' ')}
                </TabsTrigger>
              ))}
            </TabsList>

            {demoScenarios.map((scenario) => (
              <TabsContent key={scenario.id} value={scenario.id} className="space-y-6">
                {/* Scenario Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      {scenario.title}
                    </CardTitle>
                    <CardDescription>{scenario.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-lg font-bold text-primary">{scenario.investment_size}</div>
                        <div className="text-sm text-muted-foreground">Investment Size</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-lg font-bold text-green-600">{scenario.expected_return}</div>
                        <div className="text-sm text-muted-foreground">Expected Return</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <Badge variant={scenario.risk_level === 'Low' ? 'secondary' : scenario.risk_level === 'Medium' ? 'default' : 'destructive'}>
                          {scenario.risk_level} Risk
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">Risk Profile</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{scenario.timeline}</div>
                        <div className="text-sm text-muted-foreground">Timeline</div>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {scenario.key_metrics.map((metric, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{metric.label}</span>
                            {metric.trend === 'up' ? 
                              <TrendingUp className="h-4 w-4 text-green-600" /> : 
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            }
                          </div>
                          <div className="text-xl font-bold">{metric.value}</div>
                          <div className="text-xs text-muted-foreground">{metric.change}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          {/* Portfolio Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Allocation</CardTitle>
                <CardDescription>Current asset allocation and returns</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={portfolioData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {portfolioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance vs Benchmark</CardTitle>
                <CardDescription>Portfolio performance and alpha generation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="portfolio" stroke="#0088FE" strokeWidth={3} name="Portfolio" />
                    <Line type="monotone" dataKey="benchmark" stroke="#888888" strokeWidth={2} name="Benchmark" />
                    <Line type="monotone" dataKey="alpha" stroke="#00C49F" strokeWidth={2} name="Alpha" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Risk Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Analytics</CardTitle>
              <CardDescription>Comprehensive risk-adjusted performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {riskMetrics.map((risk, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{risk.metric}</span>
                      <Badge variant={risk.status === 'outperform' ? 'secondary' : 'outline'}>
                        {risk.status === 'outperform' ? 'Outperform' : 'Defensive'}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-primary">{risk.value}</div>
                    <div className="text-sm text-muted-foreground">
                      Benchmark: {risk.benchmark}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-blue-800">Demo Summary & Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-blue-800">Professional Integration</h4>
                  <p className="text-sm text-blue-700">API access for portfolio management systems</p>
                </div>
                <div className="text-center p-4">
                  <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-blue-800">Custom Reporting</h4>
                  <p className="text-sm text-blue-700">Automated daily/weekly investment reports</p>
                </div>
                <div className="text-center p-4">
                  <Download className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-blue-800">Data Export</h4>
                  <p className="text-sm text-blue-700">Excel, CSV, and API data integration</p>
                </div>
              </div>
              
              <div className="flex justify-center gap-4 mt-6">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Schedule Implementation Call
                </Button>
                <Button variant="outline" onClick={downloadTrialReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Demo Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};