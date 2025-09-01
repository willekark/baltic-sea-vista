import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, DollarSign, Brain, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ECSResponse {
  answer: string;
  citations: Array<{
    id: string;
    url?: string;
    freshness_days: number;
    reliability_score: number;
  }>;
  numbers: Array<{
    name: string;
    value: number;
    unit: string;
    calc_trace_id: string;
  }>;
  confidence: number;
  model_votes: Array<{
    model: string;
    agree: boolean;
    response: string;
    confidence: number;
  }>;
  verifications: {
    numeric_pass: boolean;
    citation_pass: boolean;
  };
  latency_ms: number;
  cost_estimate: {
    usd: number;
  };
  degraded?: boolean;
}

export const EnsembleOrchestrator = () => {
  const [query, setQuery] = useState('');
  const [taskType, setTaskType] = useState<'qna' | 'numeric' | 'geo' | 'summary' | 'forecast'>('qna');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ECSResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ecs-gateway', {
        body: {
          task_type: taskType,
          query: query.trim(),
          constraints: {
            must_cite: true,
            deadline_ms: 6000
          }
        }
      });

      if (error) throw error;
      setResponse(data);
      toast.success('Analysis completed successfully');
    } catch (error) {
      console.error('ECS Error:', error);
      toast.error('Analysis failed: ' + (error as Error).message);
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
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Ensemble Orchestration Service
          </CardTitle>
          <CardDescription>
            Multi-model AI analysis with citation verification and confidence scoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <Label htmlFor="query">Query</Label>
                <Input
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask about maritime intelligence, environmental data, or market analysis..."
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="taskType">Task Type</Label>
                <select
                  id="taskType"
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  disabled={loading}
                >
                  <option value="qna">Q&A</option>
                  <option value="summary">Summary</option>
                  <option value="numeric">Numeric</option>
                  <option value="geo">Geographic</option>
                  <option value="forecast">Forecast</option>
                </select>
              </div>
            </div>
            <Button type="submit" disabled={loading || !query.trim()} className="w-full">
              {loading ? 'Analyzing...' : 'Run Ensemble Analysis'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {response && (
        <div className="space-y-6">
          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Confidence</p>
                    <p className={`text-2xl font-bold ${getConfidenceColor(response.confidence)}`}>
                      {Math.round(response.confidence * 100)}%
                    </p>
                  </div>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </div>
                <Progress value={response.confidence * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Latency</p>
                    <p className="text-2xl font-bold">{response.latency_ms}ms</p>
                  </div>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Cost</p>
                    <p className="text-2xl font-bold">${response.cost_estimate.usd}</p>
                  </div>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Models</p>
                    <p className="text-2xl font-bold">{response.model_votes.length}</p>
                  </div>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Answer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Ensemble Response
                <div className="flex items-center gap-2">
                  <Badge className={getConfidenceBadge(response.confidence)}>
                    {Math.round(response.confidence * 100)}% confidence
                  </Badge>
                  {response.degraded && (
                    <Badge variant="destructive">Degraded</Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {response.answer}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Model Votes */}
          <Card>
            <CardHeader>
              <CardTitle>Model Analysis</CardTitle>
              <CardDescription>Individual AI model responses and agreement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {response.model_votes.map((vote, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">{vote.model}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={vote.agree ? 'default' : 'secondary'}>
                          {vote.agree ? 'Agrees' : 'Disagrees'}
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(vote.confidence * 100)}% confident
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {vote.response}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Verifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {response.verifications.numeric_pass ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  Numeric Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {response.verifications.numeric_pass 
                    ? 'All numeric calculations verified against source data'
                    : 'Some numeric values could not be verified'
                  }
                </p>
                {response.numbers.length > 0 && (
                  <div className="space-y-2">
                    {response.numbers.map((num, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="font-medium">{num.name}</span>
                        <span>{num.value} {num.unit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {response.verifications.citation_pass ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  Citation Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {response.citations.length} sources cited
                </p>
                <div className="space-y-2">
                  {response.citations.map((citation, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="font-medium truncate">{citation.id}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {citation.freshness_days}d old
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(citation.reliability_score * 100)}% reliable
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};