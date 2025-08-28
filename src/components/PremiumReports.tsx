import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp,
  DollarSign,
  Shield,
  FileText,
  AlertTriangle,
  Target,
  BarChart3,
  PieChart,
  Download,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Building2,
  Fuel,
  Globe,
  Calculator
} from 'lucide-react';

interface PremiumReport {
  reportType: string;
  generatedAt: string;
  executiveSummary: any;
  detailedAnalysis?: any;
  recommendations?: any;
  roi?: any;
  confidenceLevel?: number;
}

const PremiumReports = () => {
  const [reports, setReports] = useState<Record<string, PremiumReport>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [activeReport, setActiveReport] = useState<string>('route_optimization');

  const reportTypes = [
    {
      id: 'route_optimization',
      title: 'Route Optimization Intelligence',
      description: 'Advanced route analysis with AI-powered fuel savings recommendations',
      icon: Target,
      color: 'text-primary',
      value: '€540K Annual Savings',
      businessValue: 'Reduces fuel costs by 12-15% through optimized routing and weather intelligence'
    },
    {
      id: 'market_intelligence',
      title: 'Market Intelligence Report',
      description: 'Competitive analysis, pricing strategies, and market opportunities',
      icon: BarChart3,
      color: 'text-success',
      value: '€2.3M Revenue Opportunity',
      businessValue: 'Identifies high-value cargo opportunities and optimal pricing strategies'
    },
    {
      id: 'risk_assessment',
      title: 'Enterprise Risk Assessment',
      description: 'Comprehensive risk analysis including sanctions, compliance, and operational risks',
      icon: Shield,
      color: 'text-destructive',
      value: '€5M Risk Exposure',
      businessValue: 'Prevents regulatory fines, reduces insurance costs, protects reputation'
    },
    {
      id: 'cost_analysis',
      title: 'Advanced Cost Analytics',
      description: 'Detailed P&L analysis with benchmarking and optimization recommendations',
      icon: Calculator,
      color: 'text-warning',
      value: '€4.5M Cost Savings',
      businessValue: 'Identifies cost reduction opportunities and improves operational efficiency'
    },
    {
      id: 'compliance_report',
      title: 'Regulatory Compliance Monitor',
      description: 'Real-time compliance tracking for IMO, EU ETS, and sanctions regulations',
      icon: FileText,
      color: 'text-accent',
      value: '100% Compliance',
      businessValue: 'Avoids regulatory penalties and ensures operational continuity'
    }
  ];

  const generateReport = async (reportType: string) => {
    try {
      setLoading(prev => ({ ...prev, [reportType]: true }));
      
      const { data, error } = await supabase.functions.invoke('premium-shipping-reports', {
        body: {
          reportType,
          timeframe: '30days'
        }
      });
      
      if (error) throw error;
      
      setReports(prev => ({ ...prev, [reportType]: data }));
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setLoading(prev => ({ ...prev, [reportType]: false }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'EUR', 
      minimumFractionDigits: 0 
    }).format(amount);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-success';
    if (confidence >= 0.6) return 'text-warning';
    return 'text-destructive';
  };

  const currentReport = reports[activeReport];
  const currentReportType = reportTypes.find(t => t.id === activeReport);

  return (
    <div className="space-y-6">
      {/* Premium Reports Header */}
      <Card className="bg-gradient-dark-panel shadow-panel border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center text-primary">
                <Star className="w-6 h-6 mr-3 text-warning" />
                Premium Analytics Suite
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Enterprise-grade shipping intelligence that pays for itself
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-warning text-warning px-3 py-1">
              ROI: 340% Average
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-subtle p-4 rounded border border-success/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Annual Value</p>
                  <p className="text-2xl font-bold text-success">€12.3M</p>
                </div>
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
            </div>
            <div className="bg-gradient-subtle p-4 rounded border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Risk Mitigation</p>
                  <p className="text-2xl font-bold text-primary">€8.7M</p>
                </div>
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div className="bg-gradient-subtle p-4 rounded border border-warning/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Efficiency Gains</p>
                  <p className="text-2xl font-bold text-warning">+23%</p>
                </div>
                <Target className="w-8 h-8 text-warning" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Type Selection */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((reportType) => {
          const IconComponent = reportType.icon;
          const isActive = activeReport === reportType.id;
          const isLoading = loading[reportType.id];
          const hasReport = reports[reportType.id];
          
          return (
            <Card 
              key={reportType.id}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                isActive 
                  ? 'bg-gradient-dark-panel shadow-panel border-primary border-2' 
                  : 'bg-gradient-dark-panel shadow-panel border-primary/20 hover:border-primary/40'
              }`}
              onClick={() => setActiveReport(reportType.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <IconComponent className={`w-6 h-6 ${reportType.color}`} />
                  {hasReport && <CheckCircle className="w-5 h-5 text-success" />}
                </div>
                <CardTitle className="text-sm">{reportType.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">{reportType.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Business Value:</span>
                    <Badge variant="outline" className={`text-xs ${reportType.color.replace('text-', 'border-')}`}>
                      {reportType.value}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{reportType.businessValue}</p>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    generateReport(reportType.id);
                  }}
                  disabled={isLoading}
                  className="w-full mt-4"
                  size="sm"
                >
                  {isLoading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : hasReport ? (
                    <>
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      View Report
                    </>
                  ) : (
                    'Generate Report'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Display */}
      {currentReport && currentReportType && (
        <Card className="bg-gradient-dark-panel shadow-panel border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <currentReportType.icon className={`w-6 h-6 ${currentReportType.color}`} />
                <div>
                  <CardTitle>{currentReportType.title}</CardTitle>
                  <CardDescription>
                    Generated: {new Date(currentReport.generatedAt).toLocaleString()}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {currentReport.confidenceLevel && (
                  <Badge variant="outline" className={getConfidenceColor(currentReport.confidenceLevel)}>
                    {Math.round(currentReport.confidenceLevel * 100)}% Confidence
                  </Badge>
                )}
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="executive" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="executive">Executive Summary</TabsTrigger>
                <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="executive" className="space-y-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(currentReport.executiveSummary).map(([key, value]) => (
                    <Card key={key} className="bg-gradient-subtle border border-primary/20">
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-lg font-bold">
                          {typeof value === 'number' 
                            ? (key.includes('Cost') || key.includes('Savings') || key.includes('Value') 
                               ? formatCurrency(value) 
                               : value.toLocaleString())
                            : String(value)
                          }
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {activeReport === 'route_optimization' && currentReport.roi && (
                  <Alert className="bg-gradient-success border-success/20">
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription className="text-success-foreground">
                      <strong>Key Finding:</strong> Route optimization can save {formatCurrency(currentReport.roi.annualProjectedSavings)} 
                      annually with a payback period of just {currentReport.roi.paybackPeriod} months.
                    </AlertDescription>
                  </Alert>
                )}

                {activeReport === 'market_intelligence' && (
                  <Alert className="bg-gradient-primary border-primary/20">
                    <BarChart3 className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Market Opportunity:</strong> Premium cargo rates are projected to increase 12.5% 
                      next quarter. Consider capacity expansion in high-value routes.
                    </AlertDescription>
                  </Alert>
                )}

                {activeReport === 'risk_assessment' && (
                  <Alert className="bg-gradient-danger border-destructive/20">
                    <Shield className="h-4 w-4" />
                    <AlertDescription className="text-destructive-foreground">
                      <strong>Risk Alert:</strong> {currentReport.executiveSummary.criticalRisks} critical risks 
                      identified requiring immediate attention to avoid potential €{(5000000).toLocaleString()} exposure.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="detailed" className="space-y-4">
                {currentReport.detailedAnalysis && (
                  <div className="space-y-4">
                    {Object.entries(currentReport.detailedAnalysis).map(([section, data]) => (
                      <Card key={section} className="bg-gradient-subtle border border-primary/20">
                        <CardHeader>
                          <CardTitle className="text-lg capitalize">
                            {section.replace(/([A-Z])/g, ' $1').trim()}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <pre className="text-sm text-muted-foreground whitespace-pre-wrap overflow-x-auto">
                            {JSON.stringify(data, null, 2)}
                          </pre>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                {currentReport.recommendations && (
                  <div className="space-y-4">
                    {Object.entries(currentReport.recommendations).map(([category, items]) => (
                      <Card key={category} className="bg-gradient-subtle border border-primary/20">
                        <CardHeader>
                          <CardTitle className="text-lg capitalize flex items-center">
                            <Target className="w-5 h-5 mr-2 text-primary" />
                            {category.replace(/([A-Z])/g, ' $1').trim()} Actions
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {Array.isArray(items) ? items.map((item, index) => (
                              <div key={index} className="flex items-start space-x-2">
                                <ArrowUpRight className="w-4 h-4 text-primary mt-0.5" />
                                <span className="text-sm">{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                              </div>
                            )) : (
                              <div className="text-sm">{JSON.stringify(items)}</div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="roi" className="space-y-4">
                {currentReport.roi && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-gradient-success border border-success/20">
                      <CardHeader>
                        <CardTitle className="flex items-center text-success">
                          <DollarSign className="w-5 h-5 mr-2" />
                          Financial Impact
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Monthly Savings:</span>
                            <span className="font-bold text-success">
                              {formatCurrency(currentReport.roi.monthlyFuelSavings || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Annual Projected:</span>
                            <span className="font-bold text-success">
                              {formatCurrency(currentReport.roi.annualProjectedSavings || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Net Present Value:</span>
                            <span className="font-bold text-success">
                              {formatCurrency(currentReport.roi.netPresentValue || 0)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Payback Period</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={(12 - (currentReport.roi.paybackPeriod || 0)) / 12 * 100} className="flex-1" />
                            <span className="text-sm font-medium">{currentReport.roi.paybackPeriod || 0} months</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-primary border border-primary/20">
                      <CardHeader>
                        <CardTitle className="flex items-center text-primary">
                          <PieChart className="w-5 h-5 mr-2" />
                          Business Value Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="bg-background/30 p-3 rounded">
                            <p className="text-sm font-medium">Cost Reduction</p>
                            <p className="text-2xl font-bold text-success">65%</p>
                          </div>
                          <div className="bg-background/30 p-3 rounded">
                            <p className="text-sm font-medium">Revenue Enhancement</p>
                            <p className="text-2xl font-bold text-primary">25%</p>
                          </div>
                          <div className="bg-background/30 p-3 rounded">
                            <p className="text-sm font-medium">Risk Mitigation</p>
                            <p className="text-2xl font-bold text-warning">10%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <Alert className="bg-gradient-investment border-primary/20">
                  <Building2 className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Enterprise Value:</strong> Premium analytics typically deliver 3-5x ROI within 12 months 
                    through operational optimization, risk reduction, and strategic decision support.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Pricing Information */}
      <Card className="bg-gradient-dark-panel shadow-panel border-warning/20">
        <CardHeader>
          <CardTitle className="flex items-center text-warning">
            <Star className="w-5 h-5 mr-2" />
            Enterprise Pricing
          </CardTitle>
          <CardDescription>
            Professional maritime intelligence that drives measurable business results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-subtle p-4 rounded border border-primary/20">
              <h4 className="font-bold text-primary">Professional</h4>
              <p className="text-2xl font-bold mt-2">€15K/month</p>
              <ul className="text-sm text-muted-foreground mt-4 space-y-1">
                <li>• Route optimization reports</li>
                <li>• Basic risk assessment</li>
                <li>• Monthly market intelligence</li>
                <li>• Standard support</li>
              </ul>
            </div>
            <div className="bg-gradient-primary p-4 rounded border border-primary">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-primary-foreground">Enterprise</h4>
                <Badge variant="secondary">Most Popular</Badge>
              </div>
              <p className="text-2xl font-bold mt-2 text-primary-foreground">€35K/month</p>
              <ul className="text-sm text-primary-foreground/80 mt-4 space-y-1">
                <li>• All Professional features</li>
                <li>• Advanced cost analytics</li>
                <li>• Real-time compliance monitoring</li>
                <li>• Custom report generation</li>
                <li>• Dedicated support</li>
              </ul>
            </div>
            <div className="bg-gradient-subtle p-4 rounded border border-accent/20">
              <h4 className="font-bold text-accent">Custom</h4>
              <p className="text-2xl font-bold mt-2">Contact Sales</p>
              <ul className="text-sm text-muted-foreground mt-4 space-y-1">
                <li>• White-label solutions</li>
                <li>• API integration</li>
                <li>• Custom analytics</li>
                <li>• On-premise deployment</li>
                <li>• 24/7 support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumReports;