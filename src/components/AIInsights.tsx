import React, { useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AIInsightsProps {
  marineData: Array<{
    title: string;
    value: string;
    change: number;
    trend: 'up' | 'down' | 'stable';
    status: 'excellent' | 'good' | 'warning' | 'critical';
  }>;
}

type AnalysisType = 'patterns' | 'predictions' | 'anomalies' | 'insights';

interface AnalysisResult {
  analysis: string;
  analysisType: AnalysisType;
  timestamp: string;
}

const AIInsights: React.FC<AIInsightsProps> = ({ marineData }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analysisTypes = [
    {
      type: 'patterns' as AnalysisType,
      icon: Brain,
      title: 'Pattern Recognition',
      description: 'Identify trends and correlations in environmental data',
      color: 'bg-blue-500/10 text-blue-700 hover:bg-blue-500/20'
    },
    {
      type: 'predictions' as AnalysisType,
      icon: TrendingUp,
      title: 'Predictive Analysis',
      description: 'Forecast future environmental conditions',
      color: 'bg-green-500/10 text-green-700 hover:bg-green-500/20'
    },
    {
      type: 'anomalies' as AnalysisType,
      icon: AlertTriangle,
      title: 'Anomaly Detection',
      description: 'Detect unusual patterns and potential issues',
      color: 'bg-orange-500/10 text-orange-700 hover:bg-orange-500/20'
    },
    {
      type: 'insights' as AnalysisType,
      icon: Lightbulb,
      title: 'Actionable Insights',
      description: 'Get recommendations and policy suggestions',
      color: 'bg-purple-500/10 text-purple-700 hover:bg-purple-500/20'
    }
  ];

  const runAnalysis = async (analysisType: AnalysisType) => {
    setIsAnalyzing(true);
    
    try {
      // Transform marine data for AI analysis
      const analysisData = marineData.map(item => ({
        indicator: item.title,
        value: parseFloat(item.value.replace(/[^\d.-]/g, '')) || 0,
        change: item.change,
        trend: item.trend,
        status: item.status
      }));

      const { data, error } = await supabase.functions.invoke('ai-insights', {
        body: {
          data: analysisData,
          analysisType
        }
      });

      if (error) throw error;

      setCurrentAnalysis(data);
      toast({
        title: "Analysis Complete",
        description: `AI ${analysisType} analysis has been generated.`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : 'Failed to generate analysis',
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatAnalysis = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.trim().match(/^\d+\./)) {
        return <div key={index} className="font-semibold text-primary mt-3 mb-1">{line}</div>;
      }
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return <div key={index} className="ml-4 mb-1 text-muted-foreground">{line}</div>;
      }
      if (line.trim() === '') {
        return <div key={index} className="mb-2"></div>;
      }
      return <div key={index} className="mb-2">{line}</div>;
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            AI Environmental Analysis
          </CardTitle>
          <CardDescription>
            Leverage artificial intelligence to analyze Baltic Sea environmental data and discover insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysisTypes.map(({ type, icon: Icon, title, description, color }) => (
              <Button
                key={type}
                variant="outline"
                className={`h-auto p-4 justify-start ${color} transition-colors`}
                onClick={() => runAnalysis(type)}
                disabled={isAnalyzing}
              >
                <div className="flex items-start gap-3 w-full">
                  <Icon className="w-5 h-5 mt-1 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold">{title}</div>
                    <div className="text-sm opacity-80">{description}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>

          {isAnalyzing && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-muted-foreground">Analyzing environmental data...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {currentAnalysis && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {analysisTypes.find(t => t.type === currentAnalysis.analysisType)?.icon && 
                  React.createElement(analysisTypes.find(t => t.type === currentAnalysis.analysisType)!.icon, {
                    className: "w-5 h-5"
                  })
                }
                {analysisTypes.find(t => t.type === currentAnalysis.analysisType)?.title} Results
              </CardTitle>
              <Badge variant="secondary" className="capitalize">
                {currentAnalysis.analysisType}
              </Badge>
            </div>
            <CardDescription>
              Generated on {new Date(currentAnalysis.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {formatAnalysis(currentAnalysis.analysis)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIInsights;