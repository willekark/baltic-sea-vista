import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, CheckCircle, AlertTriangle, TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIResponse {
  engine: string;
  response: string;
  confidence?: number;
  timestamp: string;
  error?: string;
}

interface MultiAIAnalysis {
  prompt: string;
  analysisType: string;
  responses: AIResponse[];
  consensus: {
    agreements: string[];
    disagreements: string[];
    confidence_score: number;
    recommended_action: string;
  };
  timestamp: string;
}

const MultiAIInsights = () => {
  const [analysis, setAnalysis] = useState<MultiAIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [analysisType, setAnalysisType] = useState<string>('maritime');
  const [selectedEngines, setSelectedEngines] = useState<string[]>(['openai', 'grok', 'perplexity']);

  const analysisTypes = [
    { value: 'environmental', label: 'Environmental Analysis' },
    { value: 'maritime', label: 'Maritime Intelligence' },
    { value: 'market', label: 'Market Analysis' },
    { value: 'risk', label: 'Risk Assessment' },
    { value: 'route-optimization', label: 'Route Optimization' }
  ];

  const handleAnalysis = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt for analysis');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('multi-ai-analysis', {
        body: {
          prompt,
          analysisType,
          includeEngines: selectedEngines
        }
      });

      if (error) throw error;

      setAnalysis(data);
      toast.success('Multi-AI analysis completed!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to perform multi-AI analysis');
    } finally {
      setLoading(false);
    }
  };

  const getEngineColor = (engine: string) => {
    const colors = {
      'OpenAI GPT-4.1': 'bg-green-500',
      'Grok (xAI)': 'bg-purple-500',
      'Perplexity Sonar': 'bg-blue-500'
    };
    return colors[engine as keyof typeof colors] || 'bg-gray-500';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Multi-AI Intelligence Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Analysis Type
              </label>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger className="text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {analysisTypes.map((type) => (
                    <SelectItem 
                      key={type.value} 
                      value={type.value}
                      className="text-card-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                AI Engines
              </label>
              <div className="flex gap-2 flex-wrap">
                {['openai', 'grok', 'perplexity'].map((engine) => (
                  <Badge
                    key={engine}
                    variant={selectedEngines.includes(engine) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedEngines(prev => 
                        prev.includes(engine) 
                          ? prev.filter(e => e !== engine)
                          : [...prev, engine]
                      );
                    }}
                  >
                    {engine.charAt(0).toUpperCase() + engine.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Analysis Prompt
            </label>
            <Textarea
              placeholder="Enter your analysis request (e.g., 'Analyze current Baltic Sea shipping conditions and recommend optimal routes for container vessels')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button 
            onClick={handleAnalysis} 
            disabled={loading || selectedEngines.length === 0}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing with {selectedEngines.length} AI engines...
              </>
            ) : (
              `Analyze with ${selectedEngines.length} AI Engines`
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Consensus Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Agreements
                  </h4>
                  {analysis.consensus.agreements.map((agreement, index) => (
                    <p key={index} className="text-sm text-muted-foreground p-2 bg-green-50 rounded">
                      {agreement}
                    </p>
                  ))}
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Disagreements
                  </h4>
                  {analysis.consensus.disagreements.map((disagreement, index) => (
                    <p key={index} className="text-sm text-muted-foreground p-2 bg-yellow-50 rounded">
                      {disagreement}
                    </p>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">Confidence Score</span>
                  <Badge className={getConfidenceColor(analysis.consensus.confidence_score)}>
                    {Math.round(analysis.consensus.confidence_score * 100)}%
                  </Badge>
                </div>
                <div className="bg-secondary rounded p-3">
                  <p className="text-sm text-foreground">{analysis.consensus.recommended_action}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="comparison" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="comparison">AI Comparison</TabsTrigger>
              <TabsTrigger value="individual">Individual Responses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="comparison" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {analysis.responses
                  .filter(response => !response.error)
                  .map((response, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getEngineColor(response.engine)}`} />
                          <span className="font-medium text-foreground">{response.engine}</span>
                        </div>
                        {response.confidence && (
                          <Badge className={getConfidenceColor(response.confidence)}>
                            {Math.round(response.confidence * 100)}%
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {response.response.substring(0, 300)}
                        {response.response.length > 300 && '...'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="individual" className="space-y-4">
              {analysis.responses.map((response, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getEngineColor(response.engine)}`} />
                        <CardTitle className="text-lg">{response.engine}</CardTitle>
                      </div>
                      {response.confidence && (
                        <Badge className={getConfidenceColor(response.confidence)}>
                          {Math.round(response.confidence * 100)}% confidence
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(response.timestamp).toLocaleString()}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {response.error ? (
                      <div className="p-4 bg-red-50 rounded text-red-700">
                        <p className="font-medium">Error:</p>
                        <p className="text-sm">{response.error}</p>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <p className="text-foreground whitespace-pre-wrap">{response.response}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default MultiAIInsights;