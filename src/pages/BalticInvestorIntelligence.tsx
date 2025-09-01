import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, MapPin, AlertTriangle, Factory, Waves, DollarSign, FileText, Target, BarChart3 } from 'lucide-react';
import MacroMarketsDashboard from '@/components/investor/MacroMarketsDashboard';
import ESGSustainabilityDashboard from '@/components/investor/ESGSustainabilityDashboard';
import InfraLogisticsDashboard from '@/components/investor/InfraLogisticsDashboard';
import RiskGeopoliticsDashboard from '@/components/investor/RiskGeopoliticsDashboard';
import BlueEconomyDashboard from '@/components/investor/BlueEconomyDashboard';
import InvestmentAnalyticsDashboard from '@/components/investor/InvestmentAnalyticsDashboard';
import PortfolioLens from '@/components/investor/PortfolioLens';
import ScenarioStudio from '@/components/investor/ScenarioStudio';
import { BankDemoMode } from '@/components/investor/BankDemoMode';

const BalticInvestorIntelligence = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const overviewMetrics = [
    {
      title: 'Regional GDP Growth',
      value: '+2.8%',
      change: '+0.3%',
      trend: 'up',
      icon: TrendingUp,
      description: 'YoY Baltic region aggregate'
    },
    {
      title: 'ESG Risk Score',
      value: '72/100',
      change: '-5 pts',
      trend: 'up',
      icon: Waves,
      description: 'Regional sustainability index'
    },
    {
      title: 'Port Congestion Index',
      value: '64/100',
      change: '+12%',
      trend: 'down',
      icon: Factory,
      description: 'Avg across major Baltic ports'
    },
    {
      title: 'Geopolitical Risk',
      value: 'Medium',
      change: 'Stable',
      trend: 'neutral',
      icon: AlertTriangle,
      description: 'Regional stability assessment'
    }
  ];

  const topInvestmentOpportunities = [
    {
      id: 1,
      type: 'Green Bond',
      region: 'Stockholm Municipality',
      score: 94,
      rationale: 'Exceptional ecological performance improvement (+15% YoY) with robust offshore wind pipeline',
      estimatedReturn: '4.2-6.8%',
      riskLevel: 'Low',
      tags: ['ESG', 'Municipal', 'Green Infrastructure']
    },
    {
      id: 2,
      type: 'Infrastructure Equity',
      region: 'Port of Göteborg',
      score: 89,
      rationale: 'Capacity expansion project with 40% efficiency gains, low congestion risk',
      estimatedReturn: '8.5-12.3%',
      riskLevel: 'Medium',
      tags: ['Logistics', 'Port Infrastructure', 'Trade Growth']
    },
    {
      id: 3,
      type: 'Blue Economy Fund',
      region: 'Baltic Aquaculture Cluster',
      score: 86,
      rationale: 'Sustainable fisheries recovery trend, EU funding support, innovation pipeline',
      estimatedReturn: '6.1-9.4%',
      riskLevel: 'Medium-High',
      tags: ['Blue Economy', 'Sustainability', 'Innovation']
    }
  ];

  const riskAlerts = [
    {
      severity: 'High',
      type: 'Sanctions Exposure',
      region: 'Eastern Baltic Shipping Routes',
      description: 'Elevated shadow fleet activity detected, compliance risk for logistics investments'
    },
    {
      severity: 'Medium',
      type: 'Environmental',
      region: 'Gulf of Finland',
      description: 'Oxygen depletion events may impact maritime operations and tourism sectors'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Baltic Intelligence Investor</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Investment Intelligence Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive risk, opportunity, and ESG analytics for fund and asset managers investing in the Baltic region
          </p>
        </div>

        {/* Quick Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {overviewMetrics.map((metric, index) => (
            <Card key={index} className="relative overflow-hidden">
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

        {/* Main Dashboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="macro">Macro & Markets</TabsTrigger>
            <TabsTrigger value="esg">ESG & Sustainability</TabsTrigger>
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
            <TabsTrigger value="risk">Risk & Geopolitics</TabsTrigger>
            <TabsTrigger value="blue">Blue Economy</TabsTrigger>
            <TabsTrigger value="analytics">Investment Analytics</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio Lens</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Investment Opportunities */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Top Investment Opportunities
                  </CardTitle>
                  <CardDescription>
                    AI-generated investment recommendations based on comprehensive data analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topInvestmentOpportunities.map((opportunity) => (
                    <div key={opportunity.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold">{opportunity.type}</h4>
                          <p className="text-sm text-muted-foreground">{opportunity.region}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="bg-green-50 text-green-700">
                            Score: {opportunity.score}/100
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm">{opportunity.rationale}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Est. Return: </span>
                          <span className="font-medium">{opportunity.estimatedReturn}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Risk Level: </span>
                          <span className={`font-medium ${
                            opportunity.riskLevel === 'Low' ? 'text-green-600' :
                            opportunity.riskLevel === 'Medium' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {opportunity.riskLevel}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {opportunity.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button size="sm" className="w-full">
                        View Detailed Analysis
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Risk Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Risk Alerts
                  </CardTitle>
                  <CardDescription>
                    Active risk monitoring and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {riskAlerts.map((alert, index) => (
                    <div key={index} className="border-l-4 border-l-red-500 pl-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={alert.severity === 'High' ? 'destructive' : 'secondary'}>
                          {alert.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{alert.type}</span>
                      </div>
                      <h4 className="font-medium">{alert.region}</h4>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                    </div>
                  ))}
                  
                  <Button variant="outline" size="sm" className="w-full">
                    View All Risk Assessments
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveTab('analytics')}>
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-sm">Scenario Analysis</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveTab('portfolio')}>
                    <FileText className="h-5 w-5" />
                    <span className="text-sm">Portfolio Lens</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveTab('esg')}>
                    <Waves className="h-5 w-5" />
                    <span className="text-sm">ESG Dashboard</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveTab('risk')}>
                    <AlertTriangle className="h-5 w-5" />
                    <span className="text-sm">Risk Monitor</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="macro">
            <MacroMarketsDashboard />
          </TabsContent>

          <TabsContent value="esg">
            <ESGSustainabilityDashboard />
          </TabsContent>

          <TabsContent value="infrastructure">
            <InfraLogisticsDashboard />
          </TabsContent>

          <TabsContent value="risk">
            <RiskGeopoliticsDashboard />
          </TabsContent>

          <TabsContent value="blue">
            <BlueEconomyDashboard />
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 gap-6">
              <BankDemoMode />
              <InvestmentAnalyticsDashboard />
            </div>
          </TabsContent>

          <TabsContent value="portfolio">
            <PortfolioLens />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BalticInvestorIntelligence;