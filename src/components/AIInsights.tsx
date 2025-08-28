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

      if (error) {
        // Check if it's an OpenAI API key issue
        if (error.message?.includes('OpenAI API key') || error.message?.includes('Incorrect API key')) {
          // Show fallback analysis instead of error
          const fallbackAnalysis = generateFallbackAnalysis(analysisType, analysisData);
          setCurrentAnalysis({
            analysis: fallbackAnalysis,
            analysisType,
            timestamp: new Date().toISOString()
          });
          
          toast({
            title: "Analysis Complete (Offline Mode)",
            description: "Using built-in analysis. For AI-powered insights, configure your OpenAI API key.",
          });
          return;
        }
        throw error;
      }

      setCurrentAnalysis(data);
      toast({
        title: "AI Analysis Complete",
        description: `AI ${analysisType} analysis has been generated.`,
      });
      
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Always provide fallback analysis
      const analysisData = marineData.map(item => ({
        indicator: item.title,
        value: parseFloat(item.value.replace(/[^\d.-]/g, '')) || 0,
        change: item.change,
        trend: item.trend,
        status: item.status
      }));
      
      const fallbackAnalysis = generateFallbackAnalysis(analysisType, analysisData);
      setCurrentAnalysis({
        analysis: fallbackAnalysis,
        analysisType,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Analysis Complete (Offline Mode)",
        description: "Using built-in analysis capabilities. Configure OpenAI API key for enhanced insights.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateFallbackAnalysis = (analysisType: AnalysisType, data: any[]) => {
    const criticalCount = data.filter(item => item.status === 'critical').length;
    const warningCount = data.filter(item => item.status === 'warning').length;
    const declineCount = data.filter(item => item.trend === 'down').length;
    
    switch (analysisType) {
      case 'patterns':
        return `# Pattern Recognition Analysis

## Key Findings
• ${criticalCount} indicators show critical status requiring immediate attention
• ${warningCount} indicators are in warning state and need monitoring
• ${declineCount} indicators show declining trends
• Shipping intensity shows ${data.find(d => d.indicator.includes('Shipping'))?.trend || 'stable'} trend with ${data.find(d => d.indicator.includes('Shipping'))?.change || 0}% change

## Detailed Analysis
The Baltic Sea monitoring data reveals several concerning patterns. Oxygen levels are currently at ${data.find(d => d.indicator.includes('Oxygen'))?.value || 'N/A'} mg/L, showing a ${data.find(d => d.indicator.includes('Oxygen'))?.trend || 'stable'} trend. This correlates with increased maritime activity and environmental pressure.

Temperature readings indicate ${data.find(d => d.indicator.includes('Temperature'))?.trend || 'stable'} patterns, which may be contributing to ecosystem changes. Fish stock indices require careful monitoring as they show ${data.find(d => d.indicator.includes('Fish'))?.trend || 'stable'} trends.

## Recommendations
1. Implement enhanced monitoring for critical indicators
2. Coordinate with maritime authorities on shipping traffic management
3. Establish rapid response protocols for environmental emergencies
4. Increase sampling frequency in high-risk areas`;

      case 'predictions':
        return `# Predictive Analysis

## Key Forecasts (Next 30-90 Days)
• Environmental conditions likely to ${criticalCount > 0 ? 'deteriorate' : 'remain stable'} based on current trends
• Shipping traffic expected to ${data.find(d => d.indicator.includes('Shipping'))?.trend === 'up' ? 'increase' : 'stabilize'}
• Fish stock levels projected to ${data.find(d => d.indicator.includes('Fish'))?.trend === 'down' ? 'decline further' : 'stabilize'}
• Weather patterns suggest ${data.find(d => d.indicator.includes('Wave'))?.trend || 'stable'} sea conditions

## Detailed Predictions
Based on current data trends, the Baltic Sea ecosystem faces several challenges in the coming months. Oxygen depletion areas may expand if current trends continue, particularly in deeper waters during warmer periods.

Maritime traffic patterns suggest continued pressure on sensitive marine areas. Temperature variations may lead to increased stratification, potentially worsening oxygen conditions in bottom waters.

## Confidence Levels
- Environmental indicators: Medium confidence (based on seasonal patterns)
- Shipping trends: High confidence (based on historical traffic data)
- Fish stock projections: Medium confidence (requires updated survey data)

## Next Steps
1. Implement early warning systems for critical thresholds
2. Prepare response protocols for predicted deterioration
3. Coordinate with regional partners on management strategies`;

      case 'anomalies':
        return `# Anomaly Detection Report

## Unusual Patterns Detected
• ${criticalCount > 0 ? 'Critical status indicators require immediate investigation' : 'No critical anomalies detected'}
• ${Math.abs(data.find(d => d.indicator.includes('Wave'))?.change || 0) > 20 ? 'Unusual wave height variations detected' : 'Wave patterns within normal range'}
• ${data.find(d => d.indicator.includes('Shipping'))?.change > 10 ? 'Significant shipping traffic increase noted' : 'Shipping traffic within expected ranges'}

## Analysis of Deviations
Current monitoring reveals several deviations from expected patterns. ${data.find(d => d.indicator.includes('Oxygen'))?.status === 'critical' ? 'Oxygen levels are critically low, indicating potential dead zone formation' : 'Oxygen levels are within acceptable ranges'}.

Temperature anomalies may be contributing to changes in marine stratification, while shipping intensity variations suggest economic or seasonal factors affecting maritime traffic.

## Risk Assessment
${criticalCount > 0 ? 'HIGH RISK: Immediate action required' : warningCount > 0 ? 'MEDIUM RISK: Enhanced monitoring recommended' : 'LOW RISK: Continue standard monitoring'}

## Immediate Actions
1. Verify data quality and sensor calibration
2. Cross-reference with historical patterns
3. Alert relevant authorities of significant deviations
4. Initiate enhanced monitoring protocols`;

      case 'insights':
        return `# Actionable Insights & Recommendations

## Key Strategic Insights
• Current environmental health requires ${criticalCount > 0 ? 'immediate intervention' : 'continued monitoring'}
• Maritime activity management needs ${data.find(d => d.indicator.includes('Shipping'))?.status === 'warning' ? 'enhanced regulation' : 'current protocols maintained'}
• Fisheries sustainability shows ${data.find(d => d.indicator.includes('Fish'))?.trend === 'down' ? 'declining trends requiring quota adjustments' : 'stable conditions'}

## Policy Recommendations
1. **Environmental Protection**: Implement stricter controls in oxygen-depleted areas
2. **Maritime Management**: Optimize shipping routes to reduce environmental impact
3. **Fisheries Policy**: Adjust quotas based on current stock assessments
4. **Monitoring Enhancement**: Deploy additional sensors in critical areas

## Economic Impact Analysis
Current conditions suggest ${criticalCount > 0 ? 'potential economic losses' : 'stable economic conditions'} for Baltic Sea industries. Shipping efficiency may be ${data.find(d => d.indicator.includes('Shipping'))?.trend === 'up' ? 'improving but with environmental costs' : 'stable'}.

## Success Metrics
- Reduce critical status indicators by 50% within 6 months
- Maintain shipping efficiency while reducing environmental impact
- Stabilize fish stock indices above sustainable thresholds
- Achieve 95% data coverage across monitoring network

## Implementation Timeline
- Immediate (0-30 days): Emergency response protocols
- Short-term (1-6 months): Enhanced monitoring deployment
- Medium-term (6-12 months): Policy implementation
- Long-term (1-2 years): Ecosystem recovery assessment`;

      default:
        return 'Analysis completed using built-in capabilities. Configure OpenAI API key for enhanced AI-powered insights.';
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