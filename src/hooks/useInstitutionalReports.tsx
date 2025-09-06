import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReportRequest {
  reportType: 'quarterly' | 'investment' | 'risk' | 'sector';
  geography: 'baltic' | 'sweden' | 'denmark' | 'finland' | 'norway';
  timeframe: 'current' | 'ytd' | '12month' | '3year';
  riskProfile: 'conservative' | 'moderate' | 'aggressive' | 'institutional';
  includeForecasts?: boolean;
}

interface StockAnalysis {
  symbol: string;
  name: string;
  currentPrice: number;
  currency: string;
  marketCap: string;
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
    ytd: number;
  };
  technicalIndicators: {
    rsi: number;
    trend: 'bullish' | 'bearish' | 'neutral';
    support: number;
    resistance: number;
  };
  fundamentals: {
    peRatio?: number;
    pbRatio?: number;
    dividendYield?: number;
    beta?: number;
  };
  riskMetrics: {
    volatility: number;
    sharpeRatio?: number;
    maxDrawdown?: number;
  };
}

interface InstitutionalReport {
  reportMetadata: {
    title: string;
    reportType: string;
    generatedAt: string;
    geography: string;
    timeframe: string;
    riskProfile: string;
    confidence: number;
  };
  executiveSummary: {
    marketOverview: string;
    keyInsights: string[];
    riskFactors: string[];
    recommendations: string[];
  };
  portfolioAnalysis: {
    totalMarketCap: string;
    weightedPerformance: number;
    sectorAllocation: { [sector: string]: number };
    currencyExposure: { [currency: string]: number };
    riskMetrics: {
      portfolioVolatility: number;
      sharpeRatio: number;
      beta: number;
      var95: number;
    };
  };
  individualStocks: StockAnalysis[];
  marketIntelligence: {
    balticMaritimeIndex: number;
    offshoreWindIndex: number;
    shippingRatesIndex: number;
    environmentalScore: number;
  };
  strategicRecommendations: {
    immediateActions: string[];
    mediumTermStrategy: string[];
    longTermPositioning: string[];
  };
  aiConsensus: {
    overallRating: 'BUY' | 'HOLD' | 'SELL';
    confidenceScore: number;
    priceTargets: { [symbol: string]: number };
    timeHorizon: string;
  };
}

interface InstitutionalReportResponse {
  success: boolean;
  report: InstitutionalReport;
  generatedAt: string;
  dataFreshness: string;
  version: string;
}

export const useInstitutionalReports = () => {
  const [report, setReport] = useState<InstitutionalReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = useCallback(async (request: ReportRequest) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Generating institutional report with request:', request);

      const { data, error: supabaseError } = await supabase.functions.invoke('real-time-financial-reports', {
        body: request
      });

      if (supabaseError) {
        throw new Error(`Supabase error: ${supabaseError.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate report');
      }

      const response: InstitutionalReportResponse = data;
      setReport(response.report);

      toast.success('Institutional report generated successfully');

      console.log('Successfully generated institutional report:', {
        title: response.report.reportMetadata.title,
        confidence: response.report.reportMetadata.confidence,
        stockCount: response.report.individualStocks.length,
        version: response.version
      });

      return response.report;

    } catch (error) {
      console.error('Failed to generate institutional report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Failed to generate report: ${errorMessage}`);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearReport = useCallback(() => {
    setReport(null);
    setError(null);
  }, []);

  const exportToPDF = useCallback(async (report: InstitutionalReport) => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Set up document
      doc.setFontSize(20);
      doc.text(report.reportMetadata.title, 20, 30);
      
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date(report.reportMetadata.generatedAt).toLocaleDateString()}`, 20, 45);
      doc.text(`Geography: ${report.reportMetadata.geography.toUpperCase()}`, 20, 55);
      doc.text(`Risk Profile: ${report.reportMetadata.riskProfile}`, 20, 65);
      doc.text(`Confidence: ${report.reportMetadata.confidence}%`, 20, 75);
      
      // Executive Summary
      doc.setFontSize(16);
      doc.text('Executive Summary', 20, 95);
      doc.setFontSize(11);
      
      const marketOverview = doc.splitTextToSize(report.executiveSummary.marketOverview, 170);
      doc.text(marketOverview, 20, 110);
      
      let yPos = 110 + (marketOverview.length * 5) + 10;
      
      // Key Insights
      doc.setFontSize(14);
      doc.text('Key Insights:', 20, yPos);
      yPos += 10;
      doc.setFontSize(10);
      
      report.executiveSummary.keyInsights.forEach((insight, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        const insightText = doc.splitTextToSize(`• ${insight}`, 170);
        doc.text(insightText, 25, yPos);
        yPos += insightText.length * 4 + 3;
      });
      
      // Portfolio Analysis
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(16);
      doc.text('Portfolio Analysis', 20, yPos);
      yPos += 15;
      
      doc.setFontSize(12);
      doc.text(`Total Market Cap: ${report.portfolioAnalysis.totalMarketCap}`, 20, yPos);
      yPos += 8;
      doc.text(`Weighted Performance: ${report.portfolioAnalysis.weightedPerformance.toFixed(2)}%`, 20, yPos);
      yPos += 8;
      doc.text(`Portfolio Volatility: ${report.portfolioAnalysis.riskMetrics.portfolioVolatility.toFixed(2)}%`, 20, yPos);
      yPos += 8;
      doc.text(`Sharpe Ratio: ${report.portfolioAnalysis.riskMetrics.sharpeRatio.toFixed(2)}`, 20, yPos);
      yPos += 15;
      
      // Individual Stocks
      doc.setFontSize(14);
      doc.text('Individual Stock Analysis:', 20, yPos);
      yPos += 10;
      
      report.individualStocks.slice(0, 5).forEach((stock, index) => {
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.text(`${stock.symbol} - ${stock.name}`, 20, yPos);
        yPos += 6;
        doc.setFontSize(10);
        doc.text(`Price: ${stock.currentPrice} ${stock.currency} | Daily: ${stock.performance.daily.toFixed(2)}%`, 25, yPos);
        yPos += 5;
        doc.text(`Market Cap: ${stock.marketCap} | RSI: ${stock.technicalIndicators.rsi}`, 25, yPos);
        yPos += 5;
        doc.text(`Trend: ${stock.technicalIndicators.trend} | Volatility: ${stock.riskMetrics.volatility.toFixed(2)}%`, 25, yPos);
        yPos += 10;
      });
      
      // Strategic Recommendations
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(16);
      doc.text('Strategic Recommendations', 20, yPos);
      yPos += 15;
      
      doc.setFontSize(12);
      doc.text('Immediate Actions:', 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      
      report.strategicRecommendations.immediateActions.forEach((action) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        const actionText = doc.splitTextToSize(`• ${action}`, 170);
        doc.text(actionText, 25, yPos);
        yPos += actionText.length * 4 + 3;
      });
      
      // AI Consensus
      yPos += 10;
      doc.setFontSize(14);
      doc.text('AI Consensus:', 20, yPos);
      yPos += 10;
      doc.setFontSize(12);
      doc.text(`Overall Rating: ${report.aiConsensus.overallRating}`, 20, yPos);
      yPos += 6;
      doc.text(`Confidence Score: ${report.aiConsensus.confidenceScore}%`, 20, yPos);
      yPos += 6;
      doc.text(`Time Horizon: ${report.aiConsensus.timeHorizon}`, 20, yPos);
      
      // Save the PDF
      const fileName = `Baltic-Intelligence-${report.reportMetadata.reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast.success('PDF report exported successfully');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to export PDF. Please try again.');
    }
  }, []);

  return {
    report,
    loading,
    error,
    generateReport,
    clearReport,
    exportToPDF
  };
};

export type { ReportRequest, InstitutionalReport, StockAnalysis };
export default useInstitutionalReports;