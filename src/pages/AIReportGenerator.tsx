import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TrendingUp, FileText, BarChart3, Brain, Zap } from 'lucide-react';

interface ReportData {
  title: string;
  summary: string;
  marketCap: string;
  investmentGrade: string;
  esgScore: string;
  sharpeRatio: string;
}

const AIReportGenerator = () => {
  const [reportType, setReportType] = useState('quarterly');
  const [geography, setGeography] = useState('baltic');
  const [timeframe, setTimeframe] = useState('current');
  const [riskProfile, setRiskProfile] = useState('conservative');
  const [showReport, setShowReport] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const reportData: Record<string, ReportData> = {
    quarterly: {
      title: 'Q3 2025 Baltic Maritime & Blue Economy Analysis',
      summary: 'Strong recovery in Baltic shipping with Maersk leading container throughput growth. Offshore wind sector presents compelling value after recent selloffs, particularly Ørsted following Equinor\'s $1B backing.',
      marketCap: '€127.4B',
      investmentGrade: 'A-',
      esgScore: '78.3',
      sharpeRatio: '1.47'
    },
    investment: {
      title: 'Baltic Blue Economy Investment Opportunities Report',
      summary: 'Exceptional value in offshore wind stocks trading at multi-year lows. Ørsted down 90% from peaks despite strong fundamentals. Norwegian offshore wind expertise creating €10B annual opportunity by 2030.',
      marketCap: '€89.2B',
      investmentGrade: 'BBB+',
      esgScore: '82.1',
      sharpeRatio: '1.73'
    },
    risk: {
      title: 'Baltic Maritime & Energy Risk Assessment Report',
      summary: 'Geopolitical risks from US offshore wind policy changes affecting Ørsted. However, European and Asian markets remain robust. Baltic shipping routes showing strong resilience despite global trade tensions.',
      marketCap: '€134.7B',
      investmentGrade: 'A',
      esgScore: '75.8',
      sharpeRatio: '1.34'
    },
    sector: {
      title: 'Nordic Blue Economy Sector Performance Analysis',
      summary: 'Container shipping (Maersk) outperforming offshore wind by 45% YTD. However, wind sector fundamentals strong with Equinor-Ørsted partnership signaling industry consolidation opportunities.',
      marketCap: '€156.3B',
      investmentGrade: 'A+',
      esgScore: '84.7',
      sharpeRatio: '1.89'
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsGenerating(false);
    setShowReport(true);
    
    // Smooth scroll to report
    setTimeout(() => {
      document.getElementById('report-section')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }, 100);
  };

  const getConfidence = () => {
    switch (riskProfile) {
      case 'conservative': return '97%';
      case 'aggressive': return '91%';
      default: return '94%';
    }
  };

  const currentData = reportData[reportType];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <Card className="mb-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-white/10">
          <CardHeader className="text-center py-8">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Baltic Intelligence Hub
            </CardTitle>
            <CardDescription className="text-lg text-slate-300 mt-2">
              AI-Powered Maritime Financial Intelligence for Strategic Decision Making
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Controls */}
        <Card className="mb-8 bg-slate-800/30 border-white/10">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="bg-slate-900/80 border-white/20">
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
                <label className="text-sm font-semibold text-slate-200">Geographic Focus</label>
                <Select value={geography} onValueChange={setGeography}>
                  <SelectTrigger className="bg-slate-900/80 border-white/20">
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
                <label className="text-sm font-semibold text-slate-200">Analysis Timeframe</label>
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="bg-slate-900/80 border-white/20">
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
                <label className="text-sm font-semibold text-slate-200">Risk Profile</label>
                <Select value={riskProfile} onValueChange={setRiskProfile}>
                  <SelectTrigger className="bg-slate-900/80 border-white/20">
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
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-4 text-lg font-semibold"
            >
              {isGenerating ? (
                <>
                  <Zap className="mr-2 h-5 w-5 animate-pulse" />
                  Generating AI Analysis...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-5 w-5" />
                  Generate Intelligence Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Report Section */}
        {showReport && (
          <div id="report-section" className="space-y-6">
            <Card className="bg-slate-800/30 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle className="text-2xl font-bold text-white">
                    {currentData.title}
                  </CardTitle>
                  <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2">
                    AI Consensus: {getConfidence()}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Executive Summary */}
            <Card className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-500/30 border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="text-xl text-green-400">Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-200 leading-relaxed">{currentData.summary}</p>
              </CardContent>
            </Card>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-900/60 border-white/10">
                <CardContent className="p-6">
                  <div className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-2">
                    Market Capitalization
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{currentData.marketCap}</div>
                  <div className="text-sm font-semibold text-green-400">+5.2% QoQ</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-white/10">
                <CardContent className="p-6">
                  <div className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-2">
                    Investment Grade Rating
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{currentData.investmentGrade}</div>
                  <div className="text-sm font-semibold text-green-400">Stable Outlook</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-white/10">
                <CardContent className="p-6">
                  <div className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-2">
                    ESG Compliance Score
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{currentData.esgScore}</div>
                  <div className="text-sm font-semibold text-green-400">+12.1% YoY</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-white/10">
                <CardContent className="p-6">
                  <div className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-2">
                    Risk-Adjusted Return
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{currentData.sharpeRatio}</div>
                  <div className="text-sm font-semibold text-green-400">Above Benchmark</div>
                </CardContent>
              </Card>
            </div>

            {/* Chart Placeholder */}
            <Card className="bg-slate-900/60 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Portfolio Performance vs Baltic Maritime Index
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg flex items-center justify-center border border-white/10">
                  <p className="text-slate-400 text-lg">Interactive Chart: Real-time performance visualization would display here</p>
                </div>
              </CardContent>
            </Card>

            {/* Strategic Recommendations */}
            <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30 border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-xl text-blue-400">Strategic Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-900/40 p-4 rounded-lg border-l-2 border-l-purple-500">
                  <h4 className="font-semibold text-white mb-2">Immediate Action (0-3 months)</h4>
                  <p className="text-slate-300">Increase allocation to digitally-enabled shipping companies by 8-12%. Target firms with autonomous vessel technology and AI-powered route optimization capabilities.</p>
                </div>

                <div className="bg-slate-900/40 p-4 rounded-lg border-l-2 border-l-purple-500">
                  <h4 className="font-semibold text-white mb-2">Medium-term Strategy (3-12 months)</h4>
                  <p className="text-slate-300">Diversify into Baltic green energy infrastructure supporting maritime operations. Focus on offshore wind projects serving major shipping routes.</p>
                </div>

                <div className="bg-slate-900/40 p-4 rounded-lg border-l-2 border-l-purple-500">
                  <h4 className="font-semibold text-white mb-2">Long-term Positioning (1-3 years)</h4>
                  <p className="text-slate-300">Establish strategic positions in Arctic shipping preparedness as ice-free passages become commercially viable, leveraging Baltic expertise.</p>
                </div>
              </CardContent>
            </Card>

            {/* AI Consensus */}
            <Card className="bg-slate-900/60 border-white/10">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-lg p-4 text-center">
                    <h4 className="font-semibold text-white mb-2">Claude AI Analysis</h4>
                    <p className="text-slate-300">Confidence: 96%</p>
                    <p className="text-green-400 font-semibold">Recommendation: BUY</p>
                  </div>

                  <div className="bg-gradient-to-r from-green-900/20 to-teal-900/20 border border-green-500/30 rounded-lg p-4 text-center">
                    <h4 className="font-semibold text-white mb-2">OpenAI Analysis</h4>
                    <p className="text-slate-300">Confidence: 92%</p>
                    <p className="text-green-400 font-semibold">Recommendation: BUY</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIReportGenerator;