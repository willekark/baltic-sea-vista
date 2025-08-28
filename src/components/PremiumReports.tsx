import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
  Calculator,
  MapPin,
  Navigation,
  TrendingDown
} from 'lucide-react';

interface PremiumReport {
  reportType: string;
  generatedAt: string;
  executiveSummary: any;
  detailedAnalysis?: any;
  recommendations?: any;
  roi?: any;
  confidenceLevel?: number;
  strategicContext?: any;
  implementation?: any;
  riskAssessment?: any;
  conclusion?: string;
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
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, [reportType]: false }));
    }
  };

  const exportToPDF = async () => {
    if (!currentReport || !currentReportType) return;
    
    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we prepare your report...",
      });

      // Create a print-friendly version of the content
      const reportElement = document.getElementById('premium-report-content');
      if (!reportElement) return;

      // Create a temporary container with print styles
      const printContainer = document.createElement('div');
      printContainer.innerHTML = reportElement.innerHTML;
      printContainer.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        width: 800px;
        background: white;
        color: #000000 !important;
        font-family: 'Arial', sans-serif;
        font-size: 14px;
        line-height: 1.6;
        padding: 40px;
      `;
      
      // Override all text colors for PDF readability
      printContainer.querySelectorAll('*').forEach((el: any) => {
        el.style.color = '#000000';
        el.style.backgroundColor = 'transparent';
        if (el.classList.contains('bg-gradient-success') || el.classList.contains('text-success')) {
          el.style.color = '#059669';
          el.style.backgroundColor = '#f0fdf4';
        }
        if (el.classList.contains('bg-gradient-primary') || el.classList.contains('text-primary')) {
          el.style.color = '#2563eb';
          el.style.backgroundColor = '#eff6ff';
        }
        if (el.classList.contains('text-warning')) {
          el.style.color = '#d97706';
        }
        if (el.classList.contains('text-destructive')) {
          el.style.color = '#dc2626';
        }
      });

      document.body.appendChild(printContainer);

      const canvas = await html2canvas(printContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: printContainer.scrollHeight
      });

      document.body.removeChild(printContainer);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${currentReportType.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF Generated",
        description: "Your report has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderDetailedAnalysis = (data: any, section: string) => {
    if (!data || typeof data !== 'object') return null;

    switch (section) {
      case 'routePerformance':
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-background/30 p-4 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <Navigation className="w-5 h-5 text-primary" />
                  <p className="font-medium">Total Routes Analyzed</p>
                </div>
                <p className="text-2xl font-bold">{data.totalRoutes || 0}</p>
              </div>
              <div className="bg-background/30 p-4 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <Fuel className="w-5 h-5 text-warning" />
                  <p className="font-medium">Fuel Consumption</p>
                </div>
                <p className="text-2xl font-bold">{data.fuelConsumption || 0}L</p>
              </div>
              <div className="bg-background/30 p-4 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-5 h-5 text-success" />
                  <p className="font-medium">Route Efficiency</p>
                </div>
                <p className="text-2xl font-bold">{Math.round((data.efficiency || 0) * 100)}%</p>
              </div>
            </div>
            {data.optimizedRoutes && data.optimizedRoutes.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Optimized Routes</h4>
                <div className="space-y-2">
                  {data.optimizedRoutes.map((route: any, index: number) => (
                    <div key={index} className="bg-background/20 p-3 rounded border-l-4 border-primary">
                      <p className="font-medium">{route.name || `Route ${index + 1}`}</p>
                      <p className="text-sm text-muted-foreground">{route.description || 'Optimized for fuel efficiency'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'fuelOptimization':
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-gradient-success border-success/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-5 h-5 text-success" />
                    <p className="font-medium text-success">Total Savings</p>
                  </div>
                  <p className="text-2xl font-bold text-success">{formatCurrency(data.totalSavings || 0)}</p>
                  <p className="text-sm text-success/80 mt-1">Annual projected savings</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-primary border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <p className="font-medium text-primary">Average Savings</p>
                  </div>
                  <p className="text-2xl font-bold text-primary">{(data.averageSavings || 0).toFixed(1)}%</p>
                  <p className="text-sm text-primary/80 mt-1">Per route optimization</p>
                </CardContent>
              </Card>
            </div>
            <div className="bg-background/20 p-4 rounded">
              <h4 className="font-medium mb-2">Monthly Breakdown</h4>
              <div className="flex justify-between">
                <span>Monthly Fuel Savings:</span>
                <span className="font-bold text-success">{formatCurrency(data.monthlySavings || 0)}</span>
              </div>
            </div>
          </div>
        );

      case 'weatherRouting':
        return (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center">
              <Globe className="w-5 h-5 mr-2 text-primary" />
              Seasonal Weather Recommendations
            </h4>
            {data.seasonalRecommendations && data.seasonalRecommendations.length > 0 ? (
              <div className="space-y-2">
                {data.seasonalRecommendations.map((recommendation: string, index: number) => (
                  <Alert key={index} className="bg-gradient-subtle border-primary/20">
                    <ArrowUpRight className="h-4 w-4" />
                    <AlertDescription>{recommendation}</AlertDescription>
                  </Alert>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No seasonal recommendations available</p>
            )}
          </div>
        );

      case 'portEfficiency':
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-background/30 p-4 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-warning" />
                  <p className="font-medium">Average Port Time</p>
                </div>
                <p className="text-2xl font-bold">{data.averagePortTime || 0}h</p>
              </div>
              <div className="bg-background/30 p-4 rounded">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-5 h-5 text-success" />
                  <p className="font-medium">Port Efficiency</p>
                </div>
                <p className="text-2xl font-bold">{Math.round((data.efficiency || 0) * 100)}%</p>
              </div>
            </div>
            {data.recommendations && data.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Port Optimization Recommendations</h4>
                <div className="space-y-2">
                  {data.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <ArrowUpRight className="w-4 h-4 text-primary mt-0.5" />
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        if (typeof data === 'string') {
          return <p className="text-sm">{data}</p>;
        }
        return (
          <div className="bg-background/20 p-4 rounded">
            <p className="text-sm text-muted-foreground">
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className="flex justify-between py-1">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </p>
          </div>
        );
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

      {/* Current Report Display */}
      {currentReport && currentReportType && (
        <Card className="bg-gradient-dark-panel shadow-panel border-primary/20" id="premium-report-content">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-primary">
                  <currentReportType.icon className="w-6 h-6 mr-3" />
                  {currentReportType.title}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1">
                  Generated on {new Date(currentReport.generatedAt).toLocaleDateString()} 
                  {currentReport.confidenceLevel && (
                    <Badge variant="outline" className={`ml-2 ${getConfidenceColor(currentReport.confidenceLevel)}`}>
                      {Math.round(currentReport.confidenceLevel * 100)}% Confidence
                    </Badge>
                  )}
                </CardDescription>
              </div>
              <Button onClick={exportToPDF} variant="outline" className="flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Executive Summary */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-primary border-b border-primary/20 pb-2">Executive Summary</h3>
                {currentReport.executiveSummary?.overview && (
                  <div className="bg-gradient-subtle p-6 rounded-lg border">
                    <p className="text-base leading-relaxed">{currentReport.executiveSummary.overview}</p>
                  </div>
                )}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentReport.executiveSummary && typeof currentReport.executiveSummary === 'object' && 
                    Object.entries(currentReport.executiveSummary).filter(([key]) => key !== 'overview').map(([key, value]) => (
                      <div key={key} className="bg-background/30 p-4 rounded border">
                        <p className="text-sm text-muted-foreground capitalize mb-1">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-lg font-bold">
                          {typeof value === 'number' && key.includes('Savings') 
                            ? formatCurrency(value)
                            : typeof value === 'number' 
                              ? value.toLocaleString() 
                              : Array.isArray(value) 
                                ? `${value.length} items`
                                : String(value)
                          }
                        </p>
                      </div>
                    ))
                  }
                </div>
              </div>

              {/* Strategic Context */}
              {currentReport.strategicContext && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-primary border-b border-primary/20 pb-2">Strategic Context & Market Position</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">Market Analysis</h4>
                      <div className="bg-gradient-subtle p-4 rounded">
                        <p className="text-sm leading-relaxed">{currentReport.strategicContext.marketAnalysis}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">Industry Trends</h4>
                      <div className="bg-gradient-subtle p-4 rounded">
                        <p className="text-sm leading-relaxed">{currentReport.strategicContext.industryTrends}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Analysis */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-primary border-b border-primary/20 pb-2">Comprehensive Analysis</h3>
                {currentReport.detailedAnalysis && typeof currentReport.detailedAnalysis === 'object' ? (
                  <div className="space-y-6">
                    {Object.entries(currentReport.detailedAnalysis).map(([section, data]) => (
                      <Card key={section} className="bg-background/20 border-primary/10">
                        <CardHeader>
                          <CardTitle className="text-lg capitalize text-primary">
                            {section.replace(/([A-Z])/g, ' $1').trim()}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {renderDetailedAnalysis(data, section)}
                          {data && typeof data === 'object' && (data as any).insights && (
                            <div className="mt-6 p-4 bg-gradient-subtle rounded border-l-4 border-primary">
                              <h5 className="font-semibold mb-2">Key Insights</h5>
                              <p className="text-sm leading-relaxed">{(data as any).insights}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No detailed analysis available</p>
                )}
              </div>

              {/* Strategic Recommendations */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-primary border-b border-primary/20 pb-2">Strategic Action Plan</h3>
                {currentReport.recommendations && typeof currentReport.recommendations === 'object' ? (
                  <div className="space-y-6">
                    {Object.entries(currentReport.recommendations).map(([category, recs]) => (
                      <div key={category} className="space-y-4">
                        <h4 className="text-lg font-semibold capitalize text-primary">
                          {category.replace(/([A-Z])/g, ' $1').trim()} Recommendations
                        </h4>
                        <Card className="bg-background/20 border-primary/10">
                          <CardContent className="p-6">
                            {Array.isArray(recs) ? (
                              <div className="space-y-3">
                                {recs.map((rec, index) => (
                                  <div key={index} className="flex items-start p-3 bg-gradient-subtle rounded">
                                    <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                                    </div>
                                    <div>
                                      <p className="text-sm leading-relaxed">{rec}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm leading-relaxed">{String(recs)}</p>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No recommendations available</p>
                )}
              </div>

              {/* Implementation Timeline */}
              {currentReport.implementation && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-primary border-b border-primary/20 pb-2">Implementation Roadmap</h3>
                  <div className="space-y-4">
                    {currentReport.implementation.phases?.map((phase: any, index: number) => (
                      <Card key={index} className="bg-background/20 border-primary/10">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-primary">{phase.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {phase.duration}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{phase.description}</p>
                          <div className="text-sm">
                            <strong>Expected ROI:</strong> {formatCurrency(phase.roi)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Financial Analysis */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-primary border-b border-primary/20 pb-2">Financial Impact Analysis</h3>
                {currentReport.roi && typeof currentReport.roi === 'object' ? (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(currentReport.roi).filter(([key]) => key !== 'analysis').map(([metric, value]) => (
                        <Card key={metric} className="bg-gradient-success/10 border-success/20">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {metric.replace(/([A-Z])/g, ' $1').trim()}
                                </p>
                                <p className="text-xl font-bold text-success">
                                  {typeof value === 'number' 
                                    ? formatCurrency(value)
                                    : String(value)
                                  }
                                </p>
                              </div>
                              <DollarSign className="w-8 h-8 text-success" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    {currentReport.roi.analysis && (
                      <Card className="bg-gradient-subtle border-primary/10">
                        <CardContent className="p-6">
                          <h4 className="font-semibold text-primary mb-3">Investment Analysis</h4>
                          <p className="text-sm leading-relaxed">{currentReport.roi.analysis}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No ROI data available</p>
                )}
              </div>

              {/* Risk Assessment */}
              {currentReport.riskAssessment && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-primary border-b border-primary/20 pb-2">Risk Assessment & Mitigation</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="bg-gradient-warning/10 border-warning/20">
                      <CardHeader>
                        <CardTitle className="text-base text-warning">Identified Risks</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          {currentReport.riskAssessment.risks?.map((risk: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <AlertTriangle className="w-4 h-4 text-warning mr-2 mt-0.5 flex-shrink-0" />
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-success/10 border-success/20">
                      <CardHeader>
                        <CardTitle className="text-base text-success">Mitigation Strategies</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          {currentReport.riskAssessment.mitigation?.map((strategy: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="w-4 h-4 text-success mr-2 mt-0.5 flex-shrink-0" />
                              {strategy}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Conclusion */}
              {currentReport.conclusion && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-primary border-b border-primary/20 pb-2">Executive Conclusion</h3>
                  <Card className="bg-gradient-primary/10 border-primary/20">
                    <CardContent className="p-6">
                      <p className="text-base leading-relaxed">{currentReport.conclusion}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
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