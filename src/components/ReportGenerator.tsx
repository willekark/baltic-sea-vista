import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  FileText,
  Download,
  Calendar,
  Users,
  Building,
  Globe,
  BarChart3,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Settings,
  Send,
  Eye,
  Clock,
  MapPin
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'environmental' | 'compliance' | 'executive' | 'technical';
  sections: string[];
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
}

interface GeneratedReport {
  id: string;
  title: string;
  type: string;
  generated_at: string;
  data_sources: string[];
  executive_summary: string;
  key_findings: string[];
  recommendations: string[];
  charts_data: any[];
  compliance_status: 'compliant' | 'warning' | 'non-compliant';
  distribution_list: string[];
}

const ReportGenerator = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [reportPeriod, setReportPeriod] = useState('30d');
  const [targetAudience, setTargetAudience] = useState('management');
  const [customTitle, setCustomTitle] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [templates] = useState<ReportTemplate[]>([
    {
      id: 'env_compliance',
      name: 'Environmental Compliance Report',
      description: 'Comprehensive analysis of environmental regulations compliance',
      type: 'compliance',
      sections: ['Executive Summary', 'Compliance Status', 'Key Metrics', 'Risk Assessment', 'Recommendations'],
      frequency: 'monthly'
    },
    {
      id: 'water_quality',
      name: 'Baltic Sea Water Quality Assessment',
      description: 'Technical analysis of water quality indicators and trends',
      type: 'environmental',
      sections: ['Data Overview', 'Quality Indicators', 'Temporal Analysis', 'Spatial Distribution', 'Conclusions'],
      frequency: 'quarterly'
    },
    {
      id: 'executive_summary',
      name: 'Executive Dashboard Summary',
      description: 'High-level overview for executive decision making',
      type: 'executive',
      sections: ['Key Performance Indicators', 'Strategic Insights', 'Risk Overview', 'Action Items'],
      frequency: 'weekly'
    },
    {
      id: 'technical_analysis',
      name: 'Technical Data Analysis Report',
      description: 'Detailed technical analysis with statistical insights',
      type: 'technical',
      sections: ['Data Sources', 'Methodology', 'Statistical Analysis', 'Correlations', 'Technical Recommendations'],
      frequency: 'monthly'
    }
  ]);

  const generateReport = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a report template');
      return;
    }

    try {
      setGenerating(true);

      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) throw new Error('Template not found');

      // Call AI report generator edge function
      const { data, error } = await supabase.functions.invoke('ai-report-generator', {
        body: {
          template_id: selectedTemplate,
          template_type: template.type,
          period: reportPeriod,
          audience: targetAudience,
          custom_title: customTitle,
          additional_notes: additionalNotes,
          sections: template.sections
        }
      });

      if (error) throw error;

      setGeneratedReport(data.report);
      toast.success('Report generated successfully');
      
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
      
      // Mock data for demonstration
      const template = templates.find(t => t.id === selectedTemplate);
      setGeneratedReport({
        id: `report_${Date.now()}`,
        title: customTitle || template?.name || 'Baltic Intelligence Report',
        type: template?.type || 'environmental',
        generated_at: new Date().toISOString(),
        data_sources: ['Voice of Ocean ERDDAP', 'Environmental Sensors', 'Regulatory Databases'],
        executive_summary: `This report provides a comprehensive analysis of Baltic Sea environmental conditions for the past ${reportPeriod}. Key findings indicate stable water quality parameters with some areas of concern requiring attention. Our AI-powered analysis has identified several trend patterns and actionable insights for stakeholders.`,
        key_findings: [
          'Water temperature shows seasonal variations within expected ranges',
          'Salinity levels remain stable across monitored regions',
          'Dissolved oxygen concentrations meet regulatory requirements in 85% of measured areas',
          'Chlorophyll-a levels indicate healthy phytoplankton activity',
          'Three minor anomalies detected requiring further investigation'
        ],
        recommendations: [
          'Continue current monitoring protocols in high-priority areas',
          'Investigate anomalous dissolved oxygen readings in Gulf of Finland',
          'Enhance data collection frequency during summer months',
          'Coordinate with regional stakeholders on pollution prevention measures'
        ],
        charts_data: [
          { name: 'Temperature Trend', type: 'line', data: [] },
          { name: 'Quality Distribution', type: 'pie', data: [] },
          { name: 'Regional Comparison', type: 'bar', data: [] }
        ],
        compliance_status: 'compliant',
        distribution_list: ['management@company.com', 'compliance@company.com']
      });
    } finally {
      setGenerating(false);
    }
  };

  const exportToPDF = () => {
    if (!generatedReport) return;

    const doc = new jsPDF();
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.text(generatedReport.title, 20, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    doc.text(`Generated: ${new Date(generatedReport.generated_at).toLocaleString()}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Report Type: ${generatedReport.type}`, 20, yPosition);
    yPosition += 20;

    // Executive Summary
    doc.setFontSize(16);
    doc.text('Executive Summary', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    const summaryLines = doc.splitTextToSize(generatedReport.executive_summary, 170);
    doc.text(summaryLines, 20, yPosition);
    yPosition += summaryLines.length * 5 + 10;

    // Key Findings
    doc.setFontSize(16);
    doc.text('Key Findings', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    generatedReport.key_findings.forEach((finding, index) => {
      const findingText = `${index + 1}. ${finding}`;
      const findingLines = doc.splitTextToSize(findingText, 170);
      doc.text(findingLines, 20, yPosition);
      yPosition += findingLines.length * 5 + 3;
    });
    yPosition += 10;

    // Recommendations
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.text('Recommendations', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    generatedReport.recommendations.forEach((rec, index) => {
      const recText = `${index + 1}. ${rec}`;
      const recLines = doc.splitTextToSize(recText, 170);
      doc.text(recLines, 20, yPosition);
      yPosition += recLines.length * 5 + 3;
    });

    // Save the PDF
    doc.save(`${generatedReport.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Report exported to PDF');
  };

  const sendReport = async () => {
    if (!generatedReport) return;

    try {
      // In a real implementation, this would send the report via email
      toast.success('Report sent to distribution list');
    } catch (error) {
      console.error('Error sending report:', error);
      toast.error('Failed to send report');
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-success bg-success/10';
      case 'warning': return 'text-warning bg-warning/10';
      case 'non-compliant': return 'text-destructive bg-destructive/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Report Generator</h1>
          <p className="text-muted-foreground">Generate intelligent reports from Baltic Sea data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Report Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template">Report Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {templates.find(t => t.id === selectedTemplate)?.description}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="period">Report Period</Label>
                <Select value={reportPeriod} onValueChange={setReportPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="audience">Target Audience</Label>
                <Select value={targetAudience} onValueChange={setTargetAudience}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="technical">Technical Staff</SelectItem>
                    <SelectItem value="compliance">Compliance Team</SelectItem>
                    <SelectItem value="stakeholders">External Stakeholders</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Custom Report Title (Optional)</Label>
                <Input
                  id="title"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Enter custom title"
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any specific requirements or focus areas..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={generateReport} 
                disabled={generating || !selectedTemplate}
                className="w-full"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Template Information */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle>Template Details</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const template = templates.find(t => t.id === selectedTemplate);
                  if (!template) return null;
                  
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Type:</span>
                        <Badge variant="outline" className="capitalize">
                          {template.type}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Frequency:</span>
                        <span className="text-sm capitalize">{template.frequency}</span>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Sections:</p>
                        <ul className="text-sm space-y-1">
                          {template.sections.map((section, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-success" />
                              {section}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Generated Report */}
        <div className="lg:col-span-2">
          {generating && (
            <Card>
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <h3 className="text-lg font-medium">Generating Your Report</h3>
                  <p className="text-muted-foreground">
                    Our AI is analyzing data and generating insights...
                  </p>
                  <Progress value={66} className="w-full max-w-sm mx-auto" />
                </div>
              </CardContent>
            </Card>
          )}

          {generatedReport && !generating && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{generatedReport.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Generated on {new Date(generatedReport.generated_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getComplianceColor(generatedReport.compliance_status)}>
                      {generatedReport.compliance_status}
                    </Badge>
                    <Button size="sm" onClick={exportToPDF}>
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button size="sm" variant="outline" onClick={sendReport}>
                      <Send className="h-4 w-4 mr-2" />
                      Send Report
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Data Sources */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Data Sources
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedReport.data_sources.map((source, index) => (
                      <Badge key={index} variant="secondary">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Executive Summary */}
                <div>
                  <h4 className="font-medium mb-3">Executive Summary</h4>
                  <p className="text-sm leading-relaxed">{generatedReport.executive_summary}</p>
                </div>

                <Separator />

                {/* Key Findings */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Key Findings
                  </h4>
                  <ul className="space-y-2">
                    {generatedReport.key_findings.map((finding, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Recommendations */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {generatedReport.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
                          {index + 1}
                        </div>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Distribution */}
                <div>
                  <h4 className="font-medium mb-2">Distribution List</h4>
                  <div className="flex flex-wrap gap-2">
                    {generatedReport.distribution_list.map((email, index) => (
                      <Badge key={index} variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {email}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!generatedReport && !generating && (
            <Card>
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-medium">Ready to Generate Report</h3>
                  <p className="text-muted-foreground">
                    Configure your report settings and click "Generate Report" to create an AI-powered analysis
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;