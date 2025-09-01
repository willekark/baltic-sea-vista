import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Clock, DollarSign, Target, RefreshCw, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LeaderboardEntry {
  model: string;
  task_type: string;
  accuracy: number;
  avg_cost: number;
  avg_latency: number;
  eval_count: number;
  last_updated: string;
}

interface EvaluationRun {
  run_id: string;
  timestamp: string;
  total_items: number;
  passed_items: number;
  avg_score: number;
}

export const ECSLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [recentRuns, setRecentRuns] = useState<EvaluationRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ecs-evaluator/leaderboard');
      if (error) throw error;
      
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const runEvaluation = async () => {
    setEvaluating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ecs-evaluator/eval/run');
      if (error) throw error;
      
      setLeaderboard(data.leaderboard || []);
      toast.success(`Evaluation completed: ${data.results?.length || 0} items tested`);
    } catch (error) {
      console.error('Error running evaluation:', error);
      toast.error('Evaluation failed: ' + (error as Error).message);
    } finally {
      setEvaluating(false);
    }
  };

  const getModelIcon = (model: string) => {
    const icons = {
      claude: '🤖',
      grok: '🚀', 
      openai: '⚡',
      perplexity: '🔍'
    };
    return icons[model as keyof typeof icons] || '🧠';
  };

  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy >= 0.9) return 'bg-green-100 text-green-800';
    if (accuracy >= 0.8) return 'bg-blue-100 text-blue-800';
    if (accuracy >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (index === 1) return <Trophy className="h-4 w-4 text-gray-400" />;
    if (index === 2) return <Trophy className="h-4 w-4 text-amber-600" />;
    return <span className="h-4 w-4 flex items-center justify-center text-xs font-bold">{index + 1}</span>;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                ECS Model Leaderboard
              </CardTitle>
              <CardDescription>
                Performance metrics across AI models for maritime intelligence tasks
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={loadLeaderboard}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                onClick={runEvaluation}
                disabled={evaluating}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {evaluating ? 'Evaluating...' : 'Run Evaluation'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Rankings</CardTitle>
          <CardDescription>Models ranked by accuracy across all task types</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((entry, index) => (
                <div 
                  key={`${entry.model}-${entry.task_type}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8">
                      {getRankIcon(index)}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getModelIcon(entry.model)}</span>
                      <div>
                        <h3 className="font-semibold capitalize">{entry.model}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {entry.task_type} • {entry.eval_count} evaluations
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Accuracy */}
                    <div className="text-center">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Accuracy</span>
                      </div>
                      <Badge className={getAccuracyBadge(entry.accuracy)}>
                        {Math.round(entry.accuracy * 100)}%
                      </Badge>
                      <Progress 
                        value={entry.accuracy * 100} 
                        className="w-16 h-1 mt-1"
                      />
                    </div>

                    {/* Latency */}
                    <div className="text-center">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Latency</span>
                      </div>
                      <p className="text-sm font-medium">
                        {Math.round(entry.avg_latency)}ms
                      </p>
                    </div>

                    {/* Cost */}
                    <div className="text-center">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Avg Cost</span>
                      </div>
                      <p className="text-sm font-medium">
                        ${entry.avg_cost.toFixed(3)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Best Accuracy</p>
                <p className="text-2xl font-bold text-green-600">
                  {leaderboard.length > 0 ? Math.round(leaderboard[0].accuracy * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {leaderboard.length > 0 ? leaderboard[0].model : 'N/A'}
                </p>
              </div>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Fastest Model</p>
                <p className="text-2xl font-bold text-blue-600">
                  {leaderboard.length > 0 
                    ? Math.round(Math.min(...leaderboard.map(l => l.avg_latency)))
                    : 0}ms
                </p>
                <p className="text-xs text-muted-foreground">
                  {leaderboard.length > 0 
                    ? leaderboard.find(l => l.avg_latency === Math.min(...leaderboard.map(m => m.avg_latency)))?.model
                    : 'N/A'
                  }
                </p>
              </div>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Most Economical</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${leaderboard.length > 0 
                    ? Math.min(...leaderboard.map(l => l.avg_cost)).toFixed(3)
                    : '0.000'
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  {leaderboard.length > 0 
                    ? leaderboard.find(l => l.avg_cost === Math.min(...leaderboard.map(m => m.avg_cost)))?.model
                    : 'N/A'
                  }
                </p>
              </div>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};