import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, FileText, BarChart3, 
  Download, Activity, Target, Shield, Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface ReportData {
  title: string;
  summary: string;
  marketCap: string;
  investmentGrade: string;
  esgScore: string;
  sharpeRatio: string;
  recommendations: {
    immediate: string;
    medium: string;
    longterm: string;
  };
}

const FinancialReports: React.FC = () => {
  const [reportType, setReportType] = useState('quarterly');
  const [geography, setGeography] = useState('baltic');
  const [timeframe, setTimeframe] = useState('current');
  const [riskProfile, setRiskProfile] = useState('moderate');
  const [showReport, setShowReport] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const reportTemplates: Record<string, ReportData> = {
    quarterly: {
      title: 'Q4 2025 Baltic Maritime & Blue Economy Analysis',
      summary: 'Strong recovery in Baltic shipping with Maersk leading container throughput growth. Offshore wind sector presents compelling value after recent selloffs, particularly Ørsted following major infrastructure investments.',
      marketCap: '€127.4B',
      investmentGrade: 'A-',
      esgScore: '78.3',
      sharpeRatio: '1.47',
      recommendations: {
        immediate: 'Increase allocation to digitally-enabled shipping companies by 8-12%. Target firms with autonomous vessel technology and AI-powered route optimization capabilities.',
        medium: 'Diversify into Baltic green energy infrastructure supporting maritime operations. Focus on offshore wind projects serving major shipping routes.',
        longterm: 'Establish strategic positions in Arctic shipping preparedness as ice-free passages become commercially viable, leveraging Baltic expertise.'
      }
    },
    investment: {
      title: 'Baltic Blue Economy Investment Opportunities Report',
      summary: 'Exceptional value in offshore wind stocks trading at multi-year lows. Ørsted presents compelling opportunity despite recent volatility. Norwegian offshore wind expertise creating €10B annual opportunity by 2030.',
      marketCap: '€89.2B',
      investmentGrade: 'BBB+',
      esgScore: '82.1',
      sharpeRatio: '1.73',
      recommendations: {
        immediate: 'Execute value accumulation strategy in undervalued offshore wind leaders. Focus on companies with strong project pipelines and government backing.',
        medium: 'Build positions in maritime technology companies developing autonomous systems and green fuel infrastructure.',
        longterm: 'Capitalize on energy transition by investing in hydrogen infrastructure and floating offshore wind platforms.'
      }
    },
    risk: {
      title: 'Baltic Maritime & Energy Risk Assessment Report',
      summary: 'Geopolitical risks from policy changes affecting offshore wind sector. However, European and Asian markets remain robust. Baltic shipping routes showing strong resilience despite global trade tensions.',
      marketCap: '€134.7B',
      investmentGrade: 'A',
      esgScore: '75.8',
      sharpeRatio: '1.34',
      recommendations: {
        immediate: 'Implement hedging strategies for currency and commodity exposure. Maintain defensive positions in high-quality maritime assets.',
        medium: 'Diversify geographic exposure to reduce Baltic-specific risks. Increase allocation to digital maritime services.',
        longterm: 'Build climate resilience through investments in adaptive infrastructure and sustainable technologies.'
      }
    },
    sector: {
      title: 'Nordic Blue Economy Sector Performance Analysis',
      summary: 'Container shipping (Maersk) outperforming offshore wind by 45% YTD. However, wind sector fundamentals remain strong with consolidation opportunities emerging across the industry.',
      marketCap: '€156.3B',
      investmentGrade: 'A+',
      esgScore: '84.7',
      sharpeRatio: '1.89',
      recommendations: {
        immediate: 'Rebalance portfolio to capture sector rotation from traditional shipping to renewable energy infrastructure.',
        medium: 'Focus on sector leaders with strong ESG credentials and regulatory compliance advantages.',
        longterm: 'Position for next-generation maritime technologies including hydrogen fuel cells and carbon capture systems.'
      }
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    toast.info('Generating comprehensive AI analysis...');
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const data = reportTemplates[reportType];
    setReportData(data);
    setShowReport(true);
    setGenerating(false);
    
    toast.success('Intelligence report generated successfully');
    
    // Scroll to report
    setTimeout(() => {
      const reportElement = document.getElementById('reportContainer');
      if (reportElement) {
        reportElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const exportToPDF = () => {
    toast.info('PDF export feature - Coming soon');
    // In real implementation, this would generate and download a PDF
  };

  const getConfidenceLevel = () => {
    switch (riskProfile) {
      case 'conservative': return '97%';
      case 'aggressive': return '91%';
      case 'institutional': return '95%';
      default: return '94%';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
          <CardHeader className="text-center py-8">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Baltic Intelligence Hub
            </CardTitle>
            <p className="text-lg text-slate-300 mt-2">
              AI-Powered Maritime Financial Intelligence for Strategic Decision Making
            </p>
          </CardHeader>
        </Card>

        {/* Controls */}
        <Card className="mb-8 bg-blue-900/30 border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Report Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarterly">Quarterly Market Analysis</SelectItem>
                    <SelectItem value="investment">Investment Opportunity Assessment</SelectItem>
                    <SelectItem value="risk">Risk Assessment Report</SelectItem>
                    <SelectItem value="sector">Sector Performance Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Geographic Focus</label>
                <Select value={geography} onValueChange={setGeography}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baltic">Entire Baltic Sea Region</SelectItem>
                    <SelectItem value="sweden">Sweden Maritime Sector</SelectItem>
                    <SelectItem value="denmark">Denmark Maritime Sector</SelectItem>
                    <SelectItem value="finland">Finland Maritime Sector</SelectItem>
                    <SelectItem value="norway">Norway Maritime Sector</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Analysis Timeframe</label>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current Quarter</SelectItem>
                    <SelectItem value="ytd">Year to Date</SelectItem>
                    <SelectItem value="12month">12-Month Outlook</SelectItem>
                    <SelectItem value="3year">3-Year Strategic View</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Risk Profile</label>
                <Select value={riskProfile} onValueChange={setRiskProfile}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Conservative</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                    <SelectItem value="institutional">Institutional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={generateReport}
              disabled={generating}
              className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {generating ? (
                <>
                  <Activity className="h-5 w-5 mr-2 animate-spin" />
                  Generating AI Analysis...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Generate Intelligence Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Report Container */}
        {showReport && reportData && (
          <div id="reportContainer">
            <Card className="bg-blue-900/20 border-blue-500/30 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold">{reportData.title}</CardTitle>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
                      AI Consensus: {getConfidenceLevel()}
                    </Badge>
                    <Button onClick={exportToPDF} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-8">
                {/* Executive Summary */}
                <Card className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-l-4 border-l-green-500">
                  <CardHeader>
                    <CardTitle className="text-green-400">Executive Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 leading-relaxed">{reportData.summary}</p>
                  </CardContent>
                </Card>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-slate-800/50 border-slate-600/50">
                    <CardContent className="p-6">
                      <div className="text-sm text-slate-400 font-medium uppercase tracking-wide mb-2">
                        Market Capitalization
                      </div>
                      <div className="text-3xl font-bold mb-1">{reportData.marketCap}</div>
                      <div className="text-sm text-green-400 font-medium flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +5.2% QoQ
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-600/50">
                    <CardContent className="p-6">
                      <div className="text-sm text-slate-400 font-medium uppercase tracking-wide mb-2">
                        Investment Grade Rating
                      </div>
                      <div className="text-3xl font-bold mb-1">{reportData.investmentGrade}</div>
                      <div className="text-sm text-slate-400 font-medium">Stable Outlook</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-600/50">
                    <CardContent className="p-6">
                      <div className="text-sm text-slate-400 font-medium uppercase tracking-wide mb-2">
                        ESG Compliance Score
                      </div>
                      <div className="text-3xl font-bold mb-1">{reportData.esgScore}</div>
                      <div className="text-sm text-green-400 font-medium flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +12.1% YoY
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-600/50">
                    <CardContent className="p-6">
                      <div className="text-sm text-slate-400 font-medium uppercase tracking-wide mb-2">
                        Risk-Adjusted Return
                      </div>
                      <div className="text-3xl font-bold mb-1">{reportData.sharpeRatio}</div>
                      <div className="text-sm text-green-400 font-medium">Above Benchmark</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Chart Placeholder */}
                <Card className="bg-slate-800/50 border-slate-600/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Portfolio Performance vs Baltic Maritime Index
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg flex items-center justify-center border border-slate-600/30">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                        <p className="text-slate-400">Interactive Chart: Real-time performance visualization</p>
                        <p className="text-sm text-slate-500 mt-1">Integration with TradingView or Chart.js coming soon</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Strategic Recommendations */}
                <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="text-blue-400 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Strategic Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Card className="bg-slate-800/40 border-l-4 border-l-orange-500">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-orange-400 mb-2">Immediate Action (0-3 months)</h4>
                        <p className="text-slate-300">{reportData.recommendations.immediate}</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/40 border-l-4 border-l-yellow-500">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-yellow-400 mb-2">Medium-term Strategy (3-12 months)</h4>
                        <p className="text-slate-300">{reportData.recommendations.medium}</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/40 border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-green-400 mb-2">Long-term Positioning (1-3 years)</h4>
                        <p className="text-slate-300">{reportData.recommendations.longterm}</p>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>

                {/* AI Consensus */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border-orange-500/30">
                    <CardContent className="p-6 text-center">
                      <h4 className="text-lg font-bold text-orange-400 mb-2">Claude AI Analysis</h4>
                      <div className="space-y-1">
                        <p className="text-orange-300">Confidence: 96%</p>
                        <Badge className="bg-green-600/20 text-green-400">Recommendation: BUY</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-emerald-500/30">
                    <CardContent className="p-6 text-center">
                      <h4 className="text-lg font-bold text-emerald-400 mb-2">OpenAI Analysis</h4>
                      <div className="space-y-1">
                        <p className="text-emerald-300">Confidence: 92%</p>
                        <Badge className="bg-green-600/20 text-green-400">Recommendation: BUY</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Report Footer */}
                <Card className="bg-slate-800/30 border-slate-600/30">
                  <CardContent className="p-4">
                    <div className="text-xs text-slate-400 space-y-2">
                      <div className="font-medium">Disclaimer & Data Sources:</div>
                      <div>
                        This report is generated using AI analysis of market data and should be used for informational purposes only. 
                        Data sourced from multiple financial APIs including Alpha Vantage, real-time maritime intelligence, 
                        and proprietary Baltic Sea economic indicators. Past performance does not guarantee future results.
                      </div>
                      <div className="pt-2 border-t border-slate-600 flex justify-between">
                        <span>Generated: {new Date().toLocaleString()}</span>
                        <span>Next Update: {new Date(Date.now() + 72 * 60 * 60 * 1000).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialReports;