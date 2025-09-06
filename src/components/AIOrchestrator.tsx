import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  FileText,
  Activity,
  Clock,
  Target,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AIOrchestratorResponse {
  success: boolean;
  responses: {
    claude?: {
      content: string;
      confidence: number;
      model: string;
      latency: number;
    };
    openai?: {
      content: string;
      confidence: number;
      model: string;
      latency: number;
    };
  };
  consensus?: {
    agreement_score: number;
    key_agreements: string[];
    key_disagreements: string[];
    final_recommendation: string;
    confidence: number;
  };
  metadata: {
    task_type: string;
    models_used: string[];
    total_latency: number;
    timestamp: string;
  };
}

const AIOrchestrator = () => {
  const [prompt, setPrompt] = useState('');
  const [taskType, setTaskType] = useState('analysis');
  const [dataSource, setDataSource] = useState('mixed');
  const [priority, setPriority] = useState('accuracy');
  const [requireConsensus, setRequireConsensus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIOrchestratorResponse | null>(null);
  const [realtimeInsights, setRealtimeInsights] = useState<any[]>([]);

  // Real-time processing state
  const [realtimeActive, setRealtimeActive] = useState(false);
  const [processingType, setProcessingType] = useState('anomaly_detection');

  useEffect(() => {
    // Initialize real-time monitoring
    startRealtimeMonitoring();
  }, []);

  const startRealtimeMonitoring = async () => {
    setRealtimeActive(true);
    // Start continuous monitoring
    const interval = setInterval(async () => {
      if (realtimeActive) {
        await processRealtimeData();
      }
    }, 30000); // Process every 30 seconds

    return () => clearInterval(interval);
  };

  const processRealtimeData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('realtime-ai-processor', {
        body: {
          data_stream: 'all',
          processing_type: processingType,
          alert_thresholds: {
            critical: 0.8,
            warning: 0.6,
            info: 0.4
          },
          ai_consensus_required: true
        }
      });

      if (error) {
        console.error('Real-time processing error:', error);
        return;
      }

      if (data?.success) {
        setRealtimeInsights(prev => [data, ...prev.slice(0, 9)]); // Keep last 10 insights
        
        // Show alerts if generated
        if (data.alerts_generated?.length > 0) {
          const criticalAlerts = data.alerts_generated.filter(alert => alert.severity === 'critical');
          if (criticalAlerts.length > 0) {
            toast.error(`${criticalAlerts.length} Critical Alert(s) Generated`, {
              description: criticalAlerts[0].content.substring(0, 100) + '...'
            });
          }
        }
      }
    } catch (error) {
      console.error('Real-time processing failed:', error);
    }
  };

  const handleAnalysis = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt for analysis');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-orchestrator', {
        body: {
          prompt,
          task_type: taskType,
          data_source: dataSource,
          require_consensus: requireConsensus,
          models: ['both'],
          priority
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        setResponse(data);
        toast.success('AI Analysis Complete', {
          description: `Generated insights using ${data.metadata.models_used.join(' and ')}`
        });
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis Failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-report-generator', {
        body: {
          report_type: 'comprehensive',
          time_range: '24h',
          data_sources: ['maritime', 'financial', 'environmental', 'intelligence'],
          format: 'structured',
          include_charts: true,
          include_predictions: true,
          stakeholder_level: 'executive'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        toast.success('Comprehensive Report Generated', {
          description: 'AI-powered report with Claude and OpenAI consensus'
        });
        
        // You could open a modal or navigate to a report view here
        console.log('Generated report:', data.report);
      }
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('Report Generation Failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          AI Orchestration Platform
        </h2>
        <p className="text-muted-foreground mt-1">
          Unified Claude and OpenAI intelligence for comprehensive maritime analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Real-time Processing</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {realtimeActive ? 'Active' : 'Inactive'}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {realtimeInsights.length} insights processed
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">AI Consensus</span>
            </div>
            <div className="text-2xl font-bold text-green-700">
              {response?.consensus ? 'Available' : 'Pending'}
            </div>
            <div className="text-xs text-green-600 mt-1">
              Cross-model validation
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">Analysis Speed</span>
            </div>
            <div className="text-2xl font-bold text-purple-700">
              {response?.metadata.total_latency ? `${response.metadata.total_latency}ms` : '--'}
            </div>
            <div className="text-xs text-purple-600 mt-1">
              Total processing time
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium">Active Alerts</span>
            </div>
            <div className="text-2xl font-bold text-orange-700">
              {realtimeInsights.reduce((sum, insight) => sum + (insight.alerts_generated?.length || 0), 0)}
            </div>
            <div className="text-xs text-orange-600 mt-1">
              Generated alerts
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analysis" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analysis">Interactive Analysis</TabsTrigger>
          <TabsTrigger value="realtime">Real-time Processing</TabsTrigger>
          <TabsTrigger value="reports">Report Generation</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis Configuration</CardTitle>
              <CardDescription>
                Configure your analysis parameters for optimal Claude and OpenAI collaboration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Task Type</label>
                  <Select value={taskType} onValueChange={setTaskType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="analysis">Analysis</SelectItem>
                      <SelectItem value="forecast">Forecast</SelectItem>
                      <SelectItem value="recommendation">Recommendation</SelectItem>
                      <SelectItem value="validation">Validation</SelectItem>
                      <SelectItem value="summary">Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Data Source</label>
                  <Select value={dataSource} onValueChange={setDataSource}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixed">All Sources</SelectItem>
                      <SelectItem value="maritime">Maritime</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="environmental">Environmental</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accuracy">Accuracy</SelectItem>
                      <SelectItem value="speed">Speed</SelectItem>
                      <SelectItem value="consensus">Consensus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="consensus"
                    checked={requireConsensus}
                    onChange={(e) => setRequireConsensus(e.target.checked)}
                  />
                  <label htmlFor="consensus" className="text-sm">Require Consensus</label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Analysis Prompt</label>
                <Textarea
                  placeholder="Enter your analysis query here..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                />
              </div>

              <Button onClick={handleAnalysis} disabled={loading} className="w-full">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Analyzing with AI...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Run AI Analysis
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {response && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Analysis Results
                  <Badge variant="outline">
                    {response.metadata.models_used.join(' + ')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Processing Time</div>
                    <div className="text-lg font-semibold">{response.metadata.total_latency}ms</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Models Used</div>
                    <div className="text-lg font-semibold">{response.metadata.models_used.length}</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Consensus Score</div>
                    <div className={`text-lg font-semibold ${getConfidenceColor(response.consensus?.confidence || 0)}`}>
                      {((response.consensus?.confidence || 0) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {response.consensus && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">AI Consensus Analysis</h4>
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <div className="prose max-w-none">
                        <pre className="whitespace-pre-wrap text-sm">
                          {response.consensus.final_recommendation}
                        </pre>
                      </div>
                    </div>

                    {response.consensus.key_agreements.length > 0 && (
                      <div>
                        <h5 className="font-medium text-green-700 mb-2">Key Agreements</h5>
                        <div className="flex flex-wrap gap-2">
                          {response.consensus.key_agreements.map((agreement, index) => (
                            <Badge key={index} className="bg-green-100 text-green-800">
                              {agreement}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {response.consensus.key_disagreements.length > 0 && (
                      <div>
                        <h5 className="font-medium text-yellow-700 mb-2">Areas of Disagreement</h5>
                        <div className="flex flex-wrap gap-2">
                          {response.consensus.key_disagreements.map((disagreement, index) => (
                            <Badge key={index} className="bg-yellow-100 text-yellow-800">
                              {disagreement}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Tabs defaultValue="claude" className="mt-6">
                  <TabsList>
                    <TabsTrigger value="claude">Claude Analysis</TabsTrigger>
                    <TabsTrigger value="openai">OpenAI Analysis</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="claude">
                    {response.responses.claude && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{response.responses.claude.model}</Badge>
                          <Badge className={getConfidenceBadge(response.responses.claude.confidence)}>
                            {(response.responses.claude.confidence * 100).toFixed(1)}% confidence
                          </Badge>
                          <Badge variant="secondary">
                            {response.responses.claude.latency}ms
                          </Badge>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <pre className="whitespace-pre-wrap text-sm">
                            {response.responses.claude.content}
                          </pre>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="openai">
                    {response.responses.openai && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{response.responses.openai.model}</Badge>
                          <Badge className={getConfidenceBadge(response.responses.openai.confidence)}>
                            {(response.responses.openai.confidence * 100).toFixed(1)}% confidence
                          </Badge>
                          <Badge variant="secondary">
                            {response.responses.openai.latency}ms
                          </Badge>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <pre className="whitespace-pre-wrap text-sm">
                            {response.responses.openai.content}
                          </pre>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time AI Processing</CardTitle>
              <CardDescription>
                Continuous monitoring and analysis of live data streams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Select value={processingType} onValueChange={setProcessingType}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anomaly_detection">Anomaly Detection</SelectItem>
                    <SelectItem value="trend_analysis">Trend Analysis</SelectItem>
                    <SelectItem value="alert_generation">Alert Generation</SelectItem>
                    <SelectItem value="predictive_modeling">Predictive Modeling</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={() => setRealtimeActive(!realtimeActive)}
                  variant={realtimeActive ? "destructive" : "default"}
                >
                  {realtimeActive ? 'Stop Monitoring' : 'Start Monitoring'}
                </Button>
              </div>

              <div className="space-y-4">
                {realtimeInsights.map((insight, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{insight.processing_results?.processing_type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(insight.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="text-center p-2 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Confidence</div>
                          <div className="font-semibold">
                            {((insight.processing_results?.confidence_score || 0) * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Alerts</div>
                          <div className="font-semibold">
                            {insight.alerts_generated?.length || 0}
                          </div>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded">
                          <div className="text-xs text-muted-foreground">Data Streams</div>
                          <div className="font-semibold">
                            {insight.data_streams_processed?.length || 0}
                          </div>
                        </div>
                      </div>

                      {insight.alerts_generated?.length > 0 && (
                        <div className="mt-3">
                          <h5 className="font-medium mb-2">Generated Alerts</h5>
                          <div className="flex flex-wrap gap-1">
                            {insight.alerts_generated.map((alert: any, alertIndex: number) => (
                              <Badge 
                                key={alertIndex}
                                variant={alert.severity === 'critical' ? 'destructive' : 
                                        alert.severity === 'warning' ? 'default' : 'secondary'}
                              >
                                {alert.type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Report Generation</CardTitle>
              <CardDescription>
                Generate comprehensive reports with Claude and OpenAI consensus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Button onClick={generateReport} disabled={loading} className="h-24 flex flex-col items-center justify-center">
                  <FileText className="h-8 w-8 mb-2" />
                  <span>Generate Comprehensive Report</span>
                  <span className="text-xs text-muted-foreground">Executive Summary + Analysis</span>
                </Button>
                
                <Button variant="outline" disabled={loading} className="h-24 flex flex-col items-center justify-center">
                  <BarChart3 className="h-8 w-8 mb-2" />
                  <span>Technical Analysis Report</span>
                  <span className="text-xs text-muted-foreground">Detailed Technical Insights</span>
                </Button>
                
                <Button variant="outline" disabled={loading} className="h-24 flex flex-col items-center justify-center">
                  <Target className="h-8 w-8 mb-2" />
                  <span>Risk Assessment Report</span>
                  <span className="text-xs text-muted-foreground">Comprehensive Risk Analysis</span>
                </Button>
                
                <Button variant="outline" disabled={loading} className="h-24 flex flex-col items-center justify-center">
                  <Clock className="h-8 w-8 mb-2" />
                  <span>Real-time Status Report</span>
                  <span className="text-xs text-muted-foreground">Current Conditions Summary</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIOrchestrator;