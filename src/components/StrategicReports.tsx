import React, { useState } from 'react';
import { FileText, Download, Eye, TrendingUp, Shield, Users, Building, Fish, Leaf } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Report {
  id: string;
  title: string;
  type: 'executive' | 'operational' | 'strategic' | 'environmental' | 'economic';
  stakeholder: string;
  timeframe: string;
  content: string;
  keyMetrics: {
    environmental_health_score: number;
    economic_impact_score: number;
    sustainability_index: number;
    risk_level: string;
    data_coverage: number;
  };
  dataSourcesUsed: string[];
  generatedAt: string;
  validUntil: string;
}

const StrategicReports: React.FC = () => {
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState<string>('executive');
  const [stakeholder, setStakeholder] = useState<string>('government');
  const [timeframe, setTimeframe] = useState<string>('weekly');
  const { toast } = useToast();

  const reportTypes = [
    { 
      value: 'executive', 
      label: 'Executive Summary', 
      description: 'High-level strategic overview for decision makers',
      icon: TrendingUp 
    },
    { 
      value: 'strategic', 
      label: 'Strategic Analysis', 
      description: 'Detailed analysis tailored to specific stakeholders',
      icon: Shield 
    },
    { 
      value: 'operational', 
      label: 'Operational Status', 
      description: 'Current system status and operational metrics',
      icon: Eye 
    }
  ];

  const stakeholders = [
    { value: 'government', label: 'Government & Policy', icon: Building },
    { value: 'shipping', label: 'Shipping Industry', icon: Users },
    { value: 'fishing', label: 'Fishing Industry', icon: Fish },
    { value: 'environmental', label: 'Environmental Groups', icon: Leaf },
    { value: 'research', label: 'Research Institutions', icon: FileText }
  ];

  const generateReport = async () => {
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-reports', {
        body: {
          reportType,
          timeframe,
          stakeholder
        }
      });

      if (error) throw error;

      setCurrentReport(data);
      toast({
        title: "Report Generated",
        description: `${data.title} has been generated successfully.`,
      });

    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Report Generation Failed",
        description: error instanceof Error ? error.message : 'Failed to generate report',
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = () => {
    if (!currentReport) return;

    const reportText = `
${currentReport.title}
Generated: ${new Date(currentReport.generatedAt).toLocaleString()}
Valid Until: ${new Date(currentReport.validUntil).toLocaleString()}

${currentReport.content}

---
Data Sources Used:
${currentReport.dataSourcesUsed.map(source => `- ${source}`).join('\n')}

Key Metrics:
- Environmental Health Score: ${Math.round(currentReport.keyMetrics.environmental_health_score)}/100
- Sustainability Index: ${Math.round(currentReport.keyMetrics.sustainability_index)}%
- Risk Level: ${currentReport.keyMetrics.risk_level.toUpperCase()}
- Data Coverage: ${Math.round(currentReport.keyMetrics.data_coverage)}%
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentReport.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: "Report has been saved to your downloads folder.",
    });
  };

  const formatReportContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      // Handle headings
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold mb-4 text-primary mt-6">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-semibold mb-3 text-foreground mt-5">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-medium mb-2 text-foreground mt-4">{line.substring(4)}</h3>;
      }
      
      // Handle bullet points
      if (line.trim().match(/^\d+\./)) {
        return <div key={index} className="font-semibold text-foreground mb-2 mt-3">{line.trim()}</div>;
      }
      if (line.trim().startsWith('- ')) {
        return <div key={index} className="ml-4 mb-1 text-muted-foreground">{line.trim()}</div>;
      }
      
      // Handle empty lines
      if (line.trim() === '') {
        return <div key={index} className="mb-2"></div>;
      }
      
      // Regular paragraphs
      return <div key={index} className="mb-2 text-muted-foreground leading-relaxed">{line}</div>;
    });
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Strategic Reports & Analysis
          </CardTitle>
          <CardDescription>
            Generate comprehensive reports and strategic insights from Baltic Sea monitoring data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="generator" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generator">Report Generator</TabsTrigger>
              <TabsTrigger value="insights">Strategic Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="generator" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Type</label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Stakeholder</label>
                  <Select value={stakeholder} onValueChange={setStakeholder}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {stakeholders.map((stakeholder) => (
                        <SelectItem key={stakeholder.value} value={stakeholder.value}>
                          <div className="flex items-center gap-2">
                            <stakeholder.icon className="w-4 h-4" />
                            {stakeholder.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Timeframe</label>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {reportTypes.find(r => r.value === reportType)?.description}
                </div>
                <Button 
                  onClick={generateReport}
                  disabled={isGenerating}
                  className="min-w-[140px]"
                >
                  {isGenerating ? 'Generating...' : 'Generate Report'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-primary">42</div>
                    <div className="text-sm text-muted-foreground">Active Monitoring Stations</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">95%</div>
                    <div className="text-sm text-muted-foreground">Data Accuracy</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-600">Medium</div>
                    <div className="text-sm text-muted-foreground">Overall Risk Level</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">73%</div>
                    <div className="text-sm text-muted-foreground">Sustainability Index</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Strategic Decision Areas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium text-red-800">Critical Oxygen Depletion</div>
                        <div className="text-sm text-red-600">Immediate action required in southern Baltic areas</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium text-orange-800">Shipping Route Optimization</div>
                        <div className="text-sm text-orange-600">High traffic areas need regulatory review</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <div className="font-medium text-blue-800">Fisheries Sustainability</div>
                        <div className="text-sm text-blue-600">Stock levels require quota adjustments</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {currentReport && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{currentReport.title}</CardTitle>
                <CardDescription>
                  Generated: {new Date(currentReport.generatedAt).toLocaleString()} • 
                  Valid until: {new Date(currentReport.validUntil).toLocaleString()}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getRiskLevelColor(currentReport.keyMetrics.risk_level)}>
                  Risk: {currentReport.keyMetrics.risk_level.toUpperCase()}
                </Badge>
                <Button onClick={downloadReport} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {Math.round(currentReport.keyMetrics.environmental_health_score)}
                </div>
                <div className="text-xs text-muted-foreground">Environmental Health</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(currentReport.keyMetrics.sustainability_index)}%
                </div>
                <div className="text-xs text-muted-foreground">Sustainability Index</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(currentReport.keyMetrics.data_coverage)}%
                </div>
                <div className="text-xs text-muted-foreground">Data Coverage</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {currentReport.dataSourcesUsed.length}
                </div>
                <div className="text-xs text-muted-foreground">Data Sources</div>
              </div>
            </div>

            <div className="prose prose-sm max-w-none">
              {formatReportContent(currentReport.content)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StrategicReports;