import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Brain,
  Zap,
  AlertTriangle,
  Crown,
  Lock,
  Unlock,
  Euro,
  BarChart3,
  LineChart,
  PieChart,
  Lightbulb,
  Clock,
  Star
} from 'lucide-react';

interface MaritimeIntelligenceProps {
  isPremium?: boolean;
}

const MaritimeIntelligencePlatform: React.FC<MaritimeIntelligenceProps> = ({ isPremium = false }) => {
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<any[]>([]);

  // Mock premium opportunities data
  const revenueOpportunities = [
    {
      id: 1,
      type: 'Arbitrage',
      title: 'Baltic-North Sea Oil Transport Opportunity',
      potential: '€2.3M',
      confidence: 94,
      urgency: 'high',
      timeWindow: '48 hours',
      description: 'Significant price differential between Brent crude in Gothenburg vs Rotterdam ports',
      details: {
        currentRate: '€45/MT',
        targetRate: '€67/MT',
        volume: '120,000 MT',
        profit: '€2,640,000',
        risks: ['Weather delays', 'Port congestion'],
        requiredVessel: 'Aframax tanker',
        competitorActivity: 'Low - 2 vessels in area'
      },
      aiAnalysis: 'AI predicts 97% success probability based on historical patterns and current market conditions.'
    },
    {
      id: 2,
      type: 'Route Optimization',
      title: 'Helsinki-Stockholm Route Efficiency Gain',
      potential: '€850K',
      confidence: 89,
      urgency: 'medium',
      timeWindow: '7 days',
      description: 'Weather patterns allow for shorter northern route, saving 18 hours transit time',
      details: {
        fuelSavings: '€320,000',
        timeSavings: '€530,000',
        additionalCargo: '€1,200,000 capacity',
        risks: ['Ice conditions', 'Regulatory approvals'],
        requiredVessel: 'Ice-class container ship',
        competitorActivity: 'High - 8 vessels using standard route'
      },
      aiAnalysis: 'Machine learning models show 89% weather stability for the next 7 days.'
    },
    {
      id: 3,
      type: 'Market Timing',
      title: 'Grain Export Window - Riga to Hamburg',
      potential: '€1.7M',
      confidence: 91,
      urgency: 'critical',
      timeWindow: '24 hours',
      description: 'Commodity futures indicate 15% price spike expected in German grain markets',
      details: {
        currentPrice: '€240/MT',
        predictedPrice: '€276/MT',
        volume: '85,000 MT',
        profit: '€3,060,000',
        risks: ['Currency fluctuation', 'Quality requirements'],
        requiredVessel: 'Bulk carrier 80K+ DWT',
        competitorActivity: 'Medium - 4 competitors identified'
      },
      aiAnalysis: 'Advanced predictive models indicate 91% probability of price increase within 72 hours.'
    }
  ];

  const competitiveIntelligence = [
    {
      competitor: 'Nordic Shipping AS',
      activity: 'Increased Baltic routes by 23%',
      threat: 'High',
      opportunity: 'Counter with premium service offering',
      marketShare: '12.4%',
      recentMoves: ['Acquired 3 new Panamax vessels', 'Opened Helsinki office', 'Signed 5-year contract with Stora Enso']
    },
    {
      competitor: 'Eastern Maritime Ltd',
      activity: 'Reduced fuel costs by 8%',
      threat: 'Medium',
      opportunity: 'Partner on joint ventures',
      marketShare: '8.1%',
      recentMoves: ['Installed scrubber systems', 'Optimized routing software', 'Hired ex-Maersk operations director']
    },
    {
      competitor: 'Baltic Express Carriers',
      activity: 'Expanding container capacity',
      threat: 'Low',
      opportunity: 'Acquire underperforming assets',
      marketShare: '15.2%',
      recentMoves: ['Ordered 2 new container ships', 'Struggling with debt payments', 'Lost major Ikea contract']
    }
  ];

  const aiPredictions = [
    {
      metric: 'Fuel Prices (Next 30 days)',
      prediction: '+12.5%',
      confidence: 87,
      impact: 'Increase operational costs by €340K',
      recommendation: 'Hedge 60% of fuel requirements immediately'
    },
    {
      metric: 'Baltic Dry Index',
      prediction: '+8.2%',
      confidence: 79,
      impact: 'Increase charter rates by €890K revenue potential',
      recommendation: 'Secure long-term charters before rate increase'
    },
    {
      metric: 'Container Spot Rates',
      prediction: '-6.8%',
      confidence: 83,
      impact: 'Reduce container revenue by €450K',
      recommendation: 'Focus on contract cargo over spot market'
    }
  ];

  useEffect(() => {
    // Simulate real-time AI insights updates
    const interval = setInterval(() => {
      setAiInsights(prev => [
        ...prev.slice(-4),
        {
          timestamp: new Date().toLocaleTimeString(),
          insight: [
            'New arbitrage opportunity detected in Gdansk-Copenhagen route',
            'Competitor vessel movements suggest market consolidation',
            'Weather patterns favor northern Baltic routes for next 72 hours',
            'Fuel price volatility expected due to geopolitical tensions',
            'Port congestion in Hamburg creating alternative route opportunities'
          ][Math.floor(Math.random() * 5)],
          confidence: 85 + Math.floor(Math.random() * 10)
        }
      ]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const PremiumFeature = ({ children, locked = false }: { children: React.ReactNode, locked?: boolean }) => (
    <div className={`relative ${locked ? 'blur-sm' : ''}`}>
      {children}
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
          <div className="bg-white p-4 rounded-lg shadow-lg text-center">
            <Lock className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <p className="font-semibold text-gray-800">Premium Feature</p>
            <p className="text-sm text-gray-600">Upgrade to access market intelligence</p>
            <Button className="mt-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Premium Status Banner */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isPremium ? (
                <>
                  <Crown className="w-6 h-6 text-orange-600" />
                  <div>
                    <p className="font-semibold text-orange-800">Maritime Intelligence Pro</p>
                    <p className="text-sm text-orange-600">Full access to AI-powered market insights</p>
                  </div>
                </>
              ) : (
                <>
                  <Target className="w-6 h-6 text-gray-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Free Maritime Intelligence</p>
                    <p className="text-sm text-gray-600">Limited access - upgrade for premium insights</p>
                  </div>
                </>
              )}
            </div>
            {!isPremium && (
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro - €299/month
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="opportunities" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="opportunities">Revenue Opportunities</TabsTrigger>
          <TabsTrigger value="competitive">Competitive Intel</TabsTrigger>
          <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
          <TabsTrigger value="alerts">Live Alerts</TabsTrigger>
          <TabsTrigger value="reports">Premium Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Active Revenue Opportunities
              </h3>
              {revenueOpportunities.map((opp, index) => (
                <PremiumFeature key={opp.id} locked={!isPremium && index > 0}>
                  <Card 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-l-4 ${
                      opp.urgency === 'critical' ? 'border-l-red-500 bg-red-50' :
                      opp.urgency === 'high' ? 'border-l-orange-500 bg-orange-50' :
                      'border-l-blue-500 bg-blue-50'
                    }`}
                    onClick={() => setSelectedOpportunity(opp)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{opp.title}</CardTitle>
                        <Badge variant={opp.urgency === 'critical' ? 'destructive' : opp.urgency === 'high' ? 'secondary' : 'default'}>
                          {opp.urgency}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-green-600">{opp.potential}</span>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Confidence</p>
                            <p className="font-semibold">{opp.confidence}%</p>
                          </div>
                        </div>
                        
                        <Progress value={opp.confidence} className="h-2" />
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1 text-orange-500" />
                            {opp.timeWindow}
                          </span>
                          <span className="text-green-600 font-medium">
                            Click for details →
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </PremiumFeature>
              ))}
            </div>

            <div>
              {selectedOpportunity ? (
                <PremiumFeature locked={!isPremium}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {selectedOpportunity.title}
                        <Badge className="bg-green-100 text-green-800">
                          {selectedOpportunity.potential} Potential
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-600">{selectedOpportunity.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-sm text-gray-800">Required Vessel</h4>
                          <p className="text-sm">{selectedOpportunity.details.requiredVessel}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-gray-800">Competition</h4>
                          <p className="text-sm">{selectedOpportunity.details.competitorActivity}</p>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                          <Brain className="w-4 h-4 mr-2" />
                          AI Analysis
                        </h4>
                        <p className="text-sm text-blue-700">{selectedOpportunity.aiAnalysis}</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-800">Risk Factors</h4>
                        {selectedOpportunity.details.risks.map((risk: string, idx: number) => (
                          <div key={idx} className="flex items-center text-sm">
                            <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                            {risk}
                          </div>
                        ))}
                      </div>

                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <Target className="w-4 h-4 mr-2" />
                        Execute Opportunity
                      </Button>
                    </CardContent>
                  </Card>
                </PremiumFeature>
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Select an Opportunity</h3>
                    <p>Click on any revenue opportunity to see detailed analysis and execution steps.</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="competitive" className="space-y-6">
          <PremiumFeature locked={!isPremium}>
            <div className="grid gap-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Target className="w-5 h-5 mr-2 text-red-600" />
                Competitive Intelligence Dashboard
              </h3>
              {competitiveIntelligence.map((comp, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-lg">{comp.competitor}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant={comp.threat === 'High' ? 'destructive' : comp.threat === 'Medium' ? 'secondary' : 'outline'}>
                          {comp.threat} Threat
                        </Badge>
                        <Badge variant="outline">
                          {comp.marketShare} Market Share
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-800 mb-2">Recent Activity</h5>
                        <p className="text-sm text-gray-600 mb-3">{comp.activity}</p>
                        <div className="bg-orange-50 p-3 rounded">
                          <h6 className="font-medium text-orange-800">Strategic Opportunity</h6>
                          <p className="text-sm text-orange-700">{comp.opportunity}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-800 mb-2">Intelligence Updates</h5>
                        <ul className="text-sm space-y-1">
                          {comp.recentMoves.map((move, idx) => (
                            <li key={idx} className="flex items-start">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                              {move}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </PremiumFeature>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <PremiumFeature locked={!isPremium}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-600" />
                AI Market Predictions
              </h3>
              {aiPredictions.map((pred, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{pred.metric}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg font-bold ${pred.prediction.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {pred.prediction}
                        </span>
                        <Badge variant="outline">{pred.confidence}% confidence</Badge>
                      </div>
                    </div>
                    
                    <Progress value={pred.confidence} className="mb-3 h-2" />
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-800 mb-1">Business Impact</h5>
                        <p className="text-sm text-gray-600">{pred.impact}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800 mb-1">AI Recommendation</h5>
                        <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded">{pred.recommendation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </PremiumFeature>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <PremiumFeature locked={!isPremium}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                  Live Market Alerts
                </h3>
                <Badge className="bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Live Feed Active
                </Badge>
              </div>
              
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {aiInsights.slice().reverse().map((insight, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{insight.insight}</p>
                            <span className="text-xs text-gray-500">{insight.timestamp}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <Badge variant="outline" className="text-xs">
                              {insight.confidence}% confidence
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {aiInsights.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>AI insights will appear here as they're generated...</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </PremiumFeature>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <PremiumFeature locked={!isPremium}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
                Premium Business Intelligence Reports
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    title: 'Weekly Market Intelligence Report',
                    description: 'Comprehensive analysis of market trends, opportunities, and competitive positioning',
                    price: '€149',
                    features: ['Market trend analysis', 'Competitor tracking', 'Revenue opportunities', 'Risk assessment']
                  },
                  {
                    title: 'Route Optimization Analysis',
                    description: 'AI-powered route recommendations with fuel savings and time optimization',
                    price: '€89',
                    features: ['Fuel cost analysis', 'Time savings calculation', 'Weather routing', 'Port efficiency data']
                  },
                  {
                    title: 'Competitive Intelligence Briefing',
                    description: 'Detailed analysis of competitor activities and strategic recommendations',
                    price: '€199',
                    features: ['Competitor vessel tracking', 'Market share analysis', 'Strategic recommendations', 'Threat assessment']
                  },
                  {
                    title: 'Custom Business Intelligence',
                    description: 'Tailored reports based on your specific business requirements and KPIs',
                    price: 'Custom',
                    features: ['Custom KPI tracking', 'Personalized insights', 'Executive summaries', 'API integration']
                  }
                ].map((report, index) => (
                  <Card key={index} className="border-2 border-indigo-200 hover:border-indigo-400 transition-colors">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{report.title}</CardTitle>
                        <Badge className="bg-indigo-100 text-indigo-800">
                          {report.price}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                      <ul className="space-y-2 mb-4">
                        {report.features.map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-center text-sm">
                            <Star className="w-4 h-4 mr-2 text-indigo-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </PremiumFeature>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MaritimeIntelligencePlatform;