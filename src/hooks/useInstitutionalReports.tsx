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
      // Show loading state
      toast.info('Generating professional PDF report...');
      
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      let currentPage = 1;

      // Professional styling constants
      const colors = {
        primary: [15, 23, 42] as [number, number, number], // slate-900
        secondary: [59, 130, 246] as [number, number, number], // blue-500
        accent: [16, 185, 129] as [number, number, number], // emerald-500
        text: [0, 0, 0] as [number, number, number],
        muted: [100, 116, 139] as [number, number, number], // slate-500
        background: [248, 250, 252] as [number, number, number] // slate-50
      };

      // Add watermark function
      const addWatermark = () => {
        doc.setTextColor(...colors.muted);
        doc.setFontSize(48);
        doc.setFont('helvetica', 'bold');
        doc.text('BALTIC INTELLIGENCE HUB - CONFIDENTIAL', pageWidth/2, pageHeight/2, {
          angle: 45,
          align: 'center'
        });
      };

      // Add header function
      const addHeader = () => {
        // Header background
        doc.setFillColor(...colors.primary);
        doc.rect(0, 0, pageWidth, 35, 'F');
        
        // Logo placeholder (blue square)
        doc.setFillColor(...colors.secondary);
        doc.rect(margin, 8, 8, 8, 'F');
        
        // Company branding
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('BALTIC INTELLIGENCE HUB', margin + 12, 15);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Institutional Maritime Investment Research', margin + 12, 22);
        
        // Date and confidentiality
        doc.setFontSize(9);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - margin - 30, 15);
        doc.text('CONFIDENTIAL', pageWidth - margin - 20, 22);
      };

      // Add footer function
      const addFooter = () => {
        const footerY = pageHeight - 15;
        doc.setTextColor(...colors.muted);
        doc.setFontSize(8);
        doc.text('© Baltic Intelligence Hub | Institutional Investment Research | All Rights Reserved', margin, footerY);
        doc.text(`Page ${currentPage}`, pageWidth - margin - 10, footerY);
      };

      // PAGE 1: Cover Page & Executive Summary
      addWatermark();
      addHeader();
      
      let yPos = 50;
      
      // Report title
      doc.setTextColor(...colors.text);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text(report.reportMetadata.title, margin, yPos);
      yPos += 15;
      
      // Report subtitle
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.muted);
      doc.text(`${report.reportMetadata.geography.toUpperCase()} | ${report.reportMetadata.riskProfile.toUpperCase()} | ${report.reportMetadata.timeframe.toUpperCase()}`, margin, yPos);
      yPos += 25;

      // Executive Summary Box
      doc.setFillColor(...colors.background);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 50, 'F');
      doc.setDrawColor(...colors.secondary);
      doc.setLineWidth(0.5);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 50, 'S');
      
      doc.setTextColor(...colors.primary);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('EXECUTIVE SUMMARY', margin + 5, yPos + 10);
      
      doc.setTextColor(...colors.text);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const summaryText = doc.splitTextToSize(report.executiveSummary.marketOverview, pageWidth - 2 * margin - 10);
      doc.text(summaryText, margin + 5, yPos + 18);
      yPos += 65;

      // Key Metrics Grid
      const metricsData = [
        { label: 'Analysis Confidence', value: `${report.reportMetadata.confidence}%`, color: colors.secondary },
        { label: 'AI Consensus', value: report.aiConsensus.overallRating, color: colors.accent },
        { label: 'Total Market Cap', value: report.portfolioAnalysis.totalMarketCap, color: colors.primary },
        { label: 'Portfolio Sharpe', value: report.portfolioAnalysis.riskMetrics.sharpeRatio.toFixed(2), color: colors.muted }
      ];

      const boxWidth = (pageWidth - 2 * margin - 15) / 2;
      const boxHeight = 25;
      
      metricsData.forEach((metric, index) => {
        const xPos = margin + (index % 2) * (boxWidth + 5);
        const yPosBox = yPos + Math.floor(index / 2) * (boxHeight + 5);
        
        // Metric box
        doc.setFillColor(...colors.background);
        doc.rect(xPos, yPosBox, boxWidth, boxHeight, 'F');
        doc.setDrawColor(...metric.color);
        doc.setLineWidth(2);
        doc.line(xPos, yPosBox, xPos + boxWidth, yPosBox);
        
        // Label
        doc.setTextColor(...colors.muted);
        doc.setFontSize(9);
        doc.text(metric.label, xPos + 3, yPosBox + 8);
        
        // Value
        doc.setTextColor(...colors.text);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(metric.value, xPos + 3, yPosBox + 18);
        doc.setFont('helvetica', 'normal');
      });
      
      yPos += 60;

      // Key Insights
      doc.setTextColor(...colors.primary);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('KEY INSIGHTS', margin, yPos);
      yPos += 10;
      
      doc.setTextColor(...colors.text);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      report.executiveSummary.keyInsights.slice(0, 4).forEach((insight, index) => {
        if (yPos > pageHeight - 40) {
          addFooter();
          doc.addPage();
          currentPage++;
          addWatermark();
          addHeader();
          yPos = 50;
        }
        
        const insightText = doc.splitTextToSize(`• ${insight}`, pageWidth - 2 * margin - 5);
        doc.text(insightText, margin + 3, yPos);
        yPos += insightText.length * 4 + 3;
      });

      addFooter();

      // PAGE 2: Portfolio Analysis & Stock Details
      doc.addPage();
      currentPage++;
      addWatermark();
      addHeader();
      yPos = 50;

      // Portfolio Analysis Header
      doc.setTextColor(...colors.primary);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('PORTFOLIO ANALYSIS', margin, yPos);
      yPos += 15;

      // Portfolio Metrics
      doc.setFontSize(12);
      doc.text('Risk & Performance Metrics:', margin, yPos);
      yPos += 10;
      
      const portfolioMetrics = [
        { label: 'Weighted Performance:', value: `${report.portfolioAnalysis.weightedPerformance.toFixed(2)}%` },
        { label: 'Portfolio Volatility:', value: `${report.portfolioAnalysis.riskMetrics.portfolioVolatility.toFixed(2)}%` },
        { label: 'Sharpe Ratio:', value: report.portfolioAnalysis.riskMetrics.sharpeRatio.toFixed(2) },
        { label: 'Beta Coefficient:', value: report.portfolioAnalysis.riskMetrics.beta.toFixed(2) },
        { label: 'Value at Risk (95%):', value: `${report.portfolioAnalysis.riskMetrics.var95.toFixed(2)}%` }
      ];

      doc.setFontSize(10);
      portfolioMetrics.forEach(metric => {
        doc.setTextColor(...colors.text);
        doc.text(metric.label, margin + 5, yPos);
        doc.setFont('helvetica', 'bold');
        doc.text(metric.value, margin + 80, yPos);
        doc.setFont('helvetica', 'normal');
        yPos += 6;
      });
      
      yPos += 15;

      // Individual Stocks Table Header
      doc.setTextColor(...colors.primary);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('INDIVIDUAL STOCK ANALYSIS', margin, yPos);
      yPos += 10;

      // Table headers
      const tableHeaders = ['Symbol', 'Price', 'Daily %', 'RSI', 'Trend', 'Volatility'];
      const colWidths = [25, 25, 20, 15, 20, 25];
      let xPos = margin;

      doc.setFillColor(...colors.primary);
      doc.rect(margin, yPos - 2, pageWidth - 2 * margin, 8, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      
      tableHeaders.forEach((header, index) => {
        doc.text(header, xPos + 2, yPos + 3);
        xPos += colWidths[index];
      });
      
      yPos += 10;

      // Stock data rows
      doc.setTextColor(...colors.text);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      report.individualStocks.slice(0, 8).forEach((stock, index) => {
        if (yPos > pageHeight - 30) {
          addFooter();
          doc.addPage();
          currentPage++;
          addWatermark();
          addHeader();
          yPos = 50;
        }

        xPos = margin;
        const rowData = [
          stock.symbol,
          `${stock.currentPrice.toFixed(2)} ${stock.currency}`,
          `${stock.performance.daily.toFixed(1)}%`,
          stock.technicalIndicators.rsi.toString(),
          stock.technicalIndicators.trend.toUpperCase(),
          `${stock.riskMetrics.volatility.toFixed(1)}%`
        ];

        // Alternate row background
        if (index % 2 === 0) {
          doc.setFillColor(...colors.background);
          doc.rect(margin, yPos - 2, pageWidth - 2 * margin, 7, 'F');
        }

        rowData.forEach((data, colIndex) => {
          // Color code performance
          if (colIndex === 2) { // Daily % column
            const change = parseFloat(data);
            doc.setTextColor(change >= 0 ? 16 : 220, change >= 0 ? 185 : 38, change >= 0 ? 129 : 38);
          } else {
            doc.setTextColor(...colors.text);
          }
          
          doc.text(data, xPos + 2, yPos + 2);
          xPos += colWidths[colIndex];
        });
        yPos += 7;
      });

      addFooter();

      // PAGE 3: Strategic Recommendations & AI Consensus
      doc.addPage();
      currentPage++;
      addWatermark();
      addHeader();
      yPos = 50;

      // Strategic Recommendations
      doc.setTextColor(...colors.primary);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('STRATEGIC RECOMMENDATIONS', margin, yPos);
      yPos += 15;

      // Immediate Actions
      doc.setFillColor(...colors.accent);
      doc.rect(margin - 2, yPos - 2, 4, 8, 'F');
      doc.setTextColor(...colors.text);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Immediate Actions (0-3 months):', margin + 5, yPos + 3);
      yPos += 12;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      report.strategicRecommendations.immediateActions.forEach(action => {
        const actionText = doc.splitTextToSize(`• ${action}`, pageWidth - 2 * margin - 10);
        doc.text(actionText, margin + 5, yPos);
        yPos += actionText.length * 4 + 2;
      });
      yPos += 10;

      // Medium Term Strategy
      doc.setFillColor(...colors.secondary);
      doc.rect(margin - 2, yPos - 2, 4, 8, 'F');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Medium-Term Strategy (3-12 months):', margin + 5, yPos + 3);
      yPos += 12;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      report.strategicRecommendations.mediumTermStrategy.forEach(strategy => {
        const strategyText = doc.splitTextToSize(`• ${strategy}`, pageWidth - 2 * margin - 10);
        doc.text(strategyText, margin + 5, yPos);
        yPos += strategyText.length * 4 + 2;
      });
      yPos += 15;

      // AI Consensus Box
      doc.setFillColor(...colors.background);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 40, 'F');
      doc.setDrawColor(...colors.secondary);
      doc.setLineWidth(1);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 40, 'S');

      doc.setTextColor(...colors.primary);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('AI CONSENSUS & OUTLOOK', margin + 5, yPos + 10);

      doc.setTextColor(...colors.text);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Overall Rating: ${report.aiConsensus.overallRating}`, margin + 5, yPos + 18);
      doc.text(`Confidence Score: ${report.aiConsensus.confidenceScore}%`, margin + 5, yPos + 25);
      doc.text(`Investment Horizon: ${report.aiConsensus.timeHorizon}`, margin + 5, yPos + 32);
      yPos += 50;

      // Risk Factors
      doc.setTextColor(...colors.primary);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Risk Factors:', margin, yPos);
      yPos += 10;

      doc.setTextColor(...colors.text);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      report.executiveSummary.riskFactors.forEach(risk => {
        const riskText = doc.splitTextToSize(`• ${risk}`, pageWidth - 2 * margin - 5);
        doc.text(riskText, margin + 3, yPos);
        yPos += riskText.length * 4 + 2;
      });

      addFooter();

      // PAGE 4: Disclaimers & Legal
      doc.addPage();
      currentPage++;
      addWatermark();
      addHeader();
      yPos = 50;

      doc.setTextColor(...colors.primary);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('METHODOLOGY & DISCLAIMERS', margin, yPos);
      yPos += 15;

      const disclaimerSections = [
        {
          title: 'Data Sources & Methodology',
          content: 'This analysis combines real-time market data from Bloomberg, Reuters, and official exchange feeds with proprietary Baltic Intelligence Hub algorithms. Our methodology incorporates fundamental analysis, technical indicators, ESG scoring, geopolitical risk assessment, and maritime-specific metrics including shipping rates, port efficiency, and environmental regulations.'
        },
        {
          title: 'Investment Disclaimer',
          content: 'This report is for institutional investors only and does not constitute investment advice. Past performance does not guarantee future results. Maritime and blue economy investments carry inherent volatility due to commodity price fluctuations, regulatory changes, and geopolitical factors. Investors should conduct independent due diligence and consult qualified advisors.'
        },
        {
          title: 'Risk Warning',
          content: 'Baltic Sea maritime investments are subject to specific risks including: regulatory changes in EU environmental policies, geopolitical tensions affecting shipping lanes, currency fluctuations in Nordic markets, and operational risks in offshore energy development. The analysis confidence scores reflect data quality limitations and market volatility.'
        },
        {
          title: 'Copyright & Distribution',
          content: `© ${new Date().getFullYear()} Baltic Intelligence Hub. All rights reserved. This report contains confidential and proprietary information. Unauthorized distribution, reproduction, or disclosure is strictly prohibited. Valid for institutional use until ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}.`
        }
      ];

      disclaimerSections.forEach(section => {
        if (yPos > pageHeight - 60) {
          addFooter();
          doc.addPage();
          currentPage++;
          addWatermark();
          addHeader();
          yPos = 50;
        }

        doc.setTextColor(...colors.primary);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(section.title, margin, yPos);
        yPos += 8;

        doc.setTextColor(...colors.text);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const contentText = doc.splitTextToSize(section.content, pageWidth - 2 * margin);
        doc.text(contentText, margin, yPos);
        yPos += contentText.length * 3.5 + 8;
      });

      // Final footer
      const finalFooterY = pageHeight - 25;
      doc.setFillColor(...colors.primary);
      doc.rect(0, finalFooterY, pageWidth, 25, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('BALTIC INTELLIGENCE HUB', pageWidth/2, finalFooterY + 8, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Professional Maritime Investment Intelligence', pageWidth/2, finalFooterY + 15, { align: 'center' });

      addFooter();

      // Generate filename and save
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `Baltic_Intelligence_Institutional_Report_${report.reportMetadata.reportType}_${timestamp}.pdf`;
      
      // Save with professional naming
      doc.save(fileName);
      
      toast.success('Professional PDF report downloaded successfully', {
        description: `${fileName} - Ready for client distribution`
      });
      
    } catch (error) {
      console.error('Professional PDF export failed:', error);
      toast.error('Failed to generate professional PDF report', {
        description: 'Please try again or contact support if the issue persists'
      });
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