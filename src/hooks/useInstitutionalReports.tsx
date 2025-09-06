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

  const exportToPDF = useCallback((report: InstitutionalReport) => {
    // Create a comprehensive PDF-ready format
    const reportContent = {
      title: report.reportMetadata.title,
      metadata: report.reportMetadata,
      executiveSummary: report.executiveSummary,
      portfolioAnalysis: report.portfolioAnalysis,
      individualStocks: report.individualStocks.map(stock => ({
        name: stock.name,
        symbol: stock.symbol,
        price: `${stock.currentPrice} ${stock.currency}`,
        performance: `${stock.performance.daily.toFixed(2)}%`,
        marketCap: stock.marketCap,
        rsi: stock.technicalIndicators.rsi,
        trend: stock.technicalIndicators.trend
      })),
      recommendations: report.strategicRecommendations,
      aiConsensus: report.aiConsensus
    };

    // Create downloadable content
    const dataStr = JSON.stringify(reportContent, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `baltic-intelligence-${report.reportMetadata.reportType}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Report exported successfully');
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