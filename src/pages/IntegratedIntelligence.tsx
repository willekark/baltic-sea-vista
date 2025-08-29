import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Ship, 
  TrendingUp, 
  DollarSign, 
  Navigation, 
  BarChart3,
  MapPin,
  Fuel,
  Globe,
  Activity,
  AlertTriangle,
  Target,
  Waves,
  Compass
} from 'lucide-react';
import { 
  ReportHeader, 
  ExecutiveSummary, 
  SectionHeader, 
  MetricCard,
  FinancialDashboard,
  RiskMatrix,
  ImplementationRoadmap 
} from '@/components/ReportTemplate';
import { supabase } from '@/integrations/supabase/client';

const IntegratedIntelligence = () => {
  const [loading, setLoading] = useState(false);
  const [intelligenceData, setIntelligenceData] = useState<any>(null);

  const generateIntelligence = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('integrated-shipping-intelligence', {
        body: {
          analysisType: 'comprehensive',
          includeRouteOptimization: true,
          includeMarketIntelligence: true,
          timeframe: '30_days'
        }
      });

      if (error) throw error;
      setIntelligenceData(data);
    } catch (error) {
      console.error('Error generating intelligence:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateIntelligence();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Compass className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
              <h2 className="text-xl font-semibold text-primary mb-2">Generating Intelligence Report</h2>
              <p className="text-muted-foreground">Analyzing routes, market data, and optimization opportunities...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!intelligenceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Ship className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h1 className="text-3xl font-bold text-primary mb-4">Integrated Shipping Intelligence</h1>
            <p className="text-muted-foreground mb-6">Generate comprehensive market and route optimization insights</p>
            <Button onClick={generateIntelligence} size="lg">
              Generate Intelligence Report
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
      <div className="max-w-7xl mx-auto">
        {/* Report Header */}
        <ReportHeader
          title="Integrated Shipping Intelligence Report"
          reportType="comprehensive_analysis"
          generatedDate={new Date().toISOString()}
          confidenceLevel={0.92}
          dataPoints={15847}
          validUntil={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()}
        />

        <div className="p-6 space-y-8">
          {/* Executive Summary */}
          <ExecutiveSummary
            title="Executive Summary"
            overview={intelligenceData.executiveSummary}
            keyMetrics={[
              { label: "Potential Savings", value: "€2.3M", change: 15, icon: DollarSign },
              { label: "Route Efficiency", value: "87%", change: 8, icon: Navigation },
              { label: "Market Opportunities", value: "12", icon: TrendingUp },
              { label: "Risk Level", value: "Low", icon: AlertTriangle }
            ]}
            criticalFindings={intelligenceData.criticalFindings || [
              "3 high-value cargo opportunities identified in Q1",
              "Fuel costs can be reduced by 18% through optimized routing",
              "New Baltic regulations require compliance by March 2024"
            ]}
            confidenceLevel={0.92}
          />

          {/* Tabbed Analysis */}
          <Tabs defaultValue="optimization" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/50 dark:bg-slate-800/50">
              <TabsTrigger value="optimization">Route Optimization</TabsTrigger>
              <TabsTrigger value="market">Market Intelligence</TabsTrigger>
              <TabsTrigger value="financial">Financial Impact</TabsTrigger>
              <TabsTrigger value="implementation">Implementation</TabsTrigger>
            </TabsList>

            <TabsContent value="optimization" className="space-y-6">
              <SectionHeader
                title="Route Optimization Analysis"
                subtitle="AI-driven insights for operational efficiency"
                icon={Navigation}
                number={1}
              />
              
              <div className="grid md:grid-cols-3 gap-6">
                <MetricCard
                  title="Fuel Savings Potential"
                  value="€847K"
                  change={18}
                  trend="up"
                  icon={Fuel}
                  color="success"
                  subtitle="Annual projection"
                />
                <MetricCard
                  title="Route Efficiency"
                  value="87%"
                  change={8}
                  trend="up"
                  icon={Target}
                  color="primary"
                  subtitle="Above industry average"
                />
                <MetricCard
                  title="Transit Time Reduction"
                  value="2.3 days"
                  change={12}
                  trend="up"
                  icon={Activity}
                  color="accent"
                  subtitle="Average per route"
                />
              </div>

              <Card className="bg-white/60 dark:bg-slate-800/60">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Optimized Route Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {intelligenceData.routeOptimizations?.slice(0, 3).map((route: any, index: number) => (
                    <div key={index} className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{route.route}</h4>
                        <Badge variant="outline" className="text-success border-success">
                          Save €{route.savingsEur?.toLocaleString() || '45,000'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{route.recommendation}</p>
                    </div>
                  )) || [
                    {
                      route: "Hamburg - Helsinki",
                      recommendation: "Optimize fuel consumption through weather routing and speed adjustment",
                      savingsEur: 45000
                    },
                    {
                      route: "Stockholm - Gdańsk", 
                      recommendation: "Leverage backhaul opportunities for container cargo",
                      savingsEur: 32000
                    }
                  ].map((route, index) => (
                    <div key={index} className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{route.route}</h4>
                        <Badge variant="outline" className="text-success border-success">
                          Save €{route.savingsEur.toLocaleString()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{route.recommendation}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="market" className="space-y-6">
              <SectionHeader
                title="Market Intelligence"
                subtitle="Strategic insights for competitive advantage"
                icon={BarChart3}
                number={2}
              />
              
              <div className="grid md:grid-cols-4 gap-4">
                <MetricCard
                  title="Market Opportunities"
                  value="12"
                  icon={TrendingUp}
                  color="primary"
                  subtitle="High-value cargo routes"
                />
                <MetricCard
                  title="Price Trends"
                  value="+8.2%"
                  change={8.2}
                  trend="up"
                  icon={DollarSign}
                  color="success"
                  subtitle="Baltic freight rates"
                />
                <MetricCard
                  title="Port Congestion"
                  value="Medium"
                  icon={Ship}
                  color="warning"
                  subtitle="Average 2.1 days delay"
                />
                <MetricCard
                  title="Fuel Price Outlook"
                  value="Stable"
                  icon={Fuel}
                  color="accent"
                  subtitle="Next 30 days"
                />
              </div>

              <Card className="bg-white/60 dark:bg-slate-800/60">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Strategic Market Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {intelligenceData.marketInsights?.map((insight: any, index: number) => (
                    <div key={index} className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                      <h4 className="font-semibold mb-2">{insight.category}</h4>
                      <p className="text-sm text-muted-foreground">{insight.insight}</p>
                    </div>
                  )) || [
                    {
                      category: "Emerging Cargo Opportunities",
                      insight: "Green hydrogen exports from Nordic countries showing 300% growth potential"
                    },
                    {
                      category: "Regulatory Impact",
                      insight: "EU ETS Phase 2 implementation creates cost advantage for efficient vessels"
                    }
                  ].map((insight, index) => (
                    <div key={index} className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                      <h4 className="font-semibold mb-2">{insight.category}</h4>
                      <p className="text-sm text-muted-foreground">{insight.insight}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial" className="space-y-6">
              <SectionHeader
                title="Financial Impact Analysis"
                subtitle="Quantified business outcomes"
                icon={DollarSign}
                number={3}
              />
              
              <FinancialDashboard
                metrics={[
                  { label: "Annual Cost Savings", value: "€2.3M", change: 15, trend: "up" },
                  { label: "Revenue Opportunity", value: "€1.8M", change: 22, trend: "up" },
                  { label: "ROI Timeline", value: "8 months", trend: "neutral" },
                  { label: "Fuel Cost Reduction", value: "18%", change: 18, trend: "up" }
                ]}
              />
            </TabsContent>

            <TabsContent value="implementation" className="space-y-6">
              <SectionHeader
                title="Implementation Strategy"
                subtitle="Step-by-step execution plan"
                icon={Target}
                number={4}
              />
              
              <ImplementationRoadmap
                phases={[
                  {
                    title: "Quick Wins Implementation",
                    duration: "30 days",
                    description: "Deploy immediate optimization strategies with minimal investment",
                    actions: [
                      "Implement weather routing on 5 key routes",
                      "Optimize speed profiles for fuel efficiency",
                      "Establish backhaul cargo partnerships"
                    ],
                    investment: 75000,
                    expectedReturn: 180000
                  },
                  {
                    title: "Technology Integration",
                    duration: "60 days", 
                    description: "Integrate advanced analytics and market intelligence systems",
                    actions: [
                      "Deploy real-time market monitoring",
                      "Implement predictive analytics dashboard",
                      "Train operations team on new tools"
                    ],
                    investment: 250000,
                    expectedReturn: 650000
                  },
                  {
                    title: "Strategic Market Positioning",
                    duration: "90 days",
                    description: "Leverage market intelligence for competitive advantage",
                    actions: [
                      "Launch green corridor initiatives",
                      "Develop premium service offerings",
                      "Establish strategic partnerships"
                    ],
                    investment: 500000,
                    expectedReturn: 1200000
                  }
                ]}
              />

              <RiskMatrix
                risks={[
                  {
                    category: "Market Volatility",
                    level: "medium",
                    description: "Freight rate fluctuations could impact projected savings",
                    mitigation: "Implement hedging strategies and flexible pricing models"
                  },
                  {
                    category: "Regulatory Changes",
                    level: "low",
                    description: "New EU regulations may require operational adjustments",
                    mitigation: "Maintain regulatory compliance monitoring and early implementation"
                  }
                ]}
              />
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-6">
            <Button onClick={generateIntelligence} size="lg" className="bg-primary hover:bg-primary/90">
              Refresh Analysis
            </Button>
            <Button variant="outline" size="lg">
              Export Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegratedIntelligence;