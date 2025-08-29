import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const downloadTrialReport = async () => {
  const trialData = {
    title: "Baltic Sea Shipping Intelligence - Trial Report",
    date: new Date().toLocaleDateString(),
    executiveSummary: "This trial report demonstrates our integrated shipping intelligence capabilities. Analysis of 5,000+ data points reveals significant optimization opportunities across Baltic Sea operations with potential annual savings of €1.2M through route optimization and €850K in new revenue opportunities.",
    keyFindings: [
      "18% fuel cost reduction potential through AI-optimized routing",
      "12 high-value cargo opportunities identified for Q1 2024", 
      "87% route efficiency score - 8% above industry average",
      "Medium risk level with proactive mitigation strategies available"
    ],
    marketInsights: [
      {
        category: "Green Corridor Development",
        insight: "300% growth potential in hydrogen and renewable energy cargo exports from Nordic countries"
      },
      {
        category: "Regulatory Compliance",
        insight: "EU ETS Phase 2 creates 15-20% cost advantage for efficient vessels"
      },
      {
        category: "Port Efficiency",
        insight: "Real-time monitoring shows 2.1 day average congestion at major Baltic ports"
      }
    ],
    financialImpact: {
      costSavings: "€1.2M",
      revenueOpportunity: "€850K", 
      roiPercentage: "185%",
      paybackMonths: "8"
    }
  };

  return generatePDFReport(trialData);
};

export const downloadFullReport = async (reportData: any) => {
  return generatePDFReport(reportData);
};

const generatePDFReport = async (data: any) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  
  // Header
  pdf.setFillColor(15, 23, 42); // slate-900
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  // Logo area
  pdf.setFillColor(59, 130, 246); // blue-500
  pdf.rect(margin, 8, 8, 8, 'F');
  
  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.title, margin + 12, 18);
  
  // Date
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${data.date}`, pageWidth - margin - 30, 18);
  
  // Reset position for content
  let yPosition = 60;
  
  // Executive Summary
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Executive Summary', margin, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const summaryLines = pdf.splitTextToSize(data.executiveSummary, pageWidth - 2 * margin);
  pdf.text(summaryLines, margin, yPosition);
  yPosition += summaryLines.length * 5 + 15;
  
  // Key Findings
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Key Findings', margin, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  data.keyFindings.forEach((finding: string, index: number) => {
    pdf.text(`• ${finding}`, margin + 5, yPosition);
    yPosition += 7;
  });
  yPosition += 10;
  
  // Financial Impact (if page space allows)
  if (yPosition + 50 < pageHeight - margin) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Financial Impact Summary', margin, yPosition);
    yPosition += 15;
    
    // Financial metrics boxes
    const boxWidth = (pageWidth - 2 * margin - 15) / 4;
    const metrics = [
      { label: 'Cost Savings', value: data.financialImpact.costSavings },
      { label: 'Revenue Opportunity', value: data.financialImpact.revenueOpportunity },
      { label: 'ROI', value: data.financialImpact.roiPercentage },
      { label: 'Payback', value: `${data.financialImpact.paybackMonths} months` }
    ];
    
    metrics.forEach((metric, index) => {
      const xPos = margin + (boxWidth + 5) * index;
      
      // Box background
      pdf.setFillColor(248, 250, 252); // slate-50
      pdf.rect(xPos, yPosition, boxWidth, 20, 'F');
      
      // Border
      pdf.setDrawColor(226, 232, 240); // slate-200
      pdf.rect(xPos, yPosition, boxWidth, 20, 'S');
      
      // Label
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139); // slate-500
      pdf.text(metric.label, xPos + 2, yPosition + 5);
      
      // Value
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42); // slate-900
      pdf.text(metric.value, xPos + 2, yPosition + 15);
    });
    yPosition += 35;
  }
  
  // New page for market insights
  pdf.addPage();
  yPosition = margin + 10;
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Market Intelligence Insights', margin, yPosition);
  yPosition += 15;
  
  data.marketInsights.forEach((insight: any, index: number) => {
    // Category header
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(59, 130, 246); // blue-500
    pdf.text(insight.category, margin, yPosition);
    yPosition += 8;
    
    // Insight text
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    const insightLines = pdf.splitTextToSize(insight.insight, pageWidth - 2 * margin);
    pdf.text(insightLines, margin + 5, yPosition);
    yPosition += insightLines.length * 5 + 10;
  });
  
  // Footer
  const footerY = pageHeight - 15;
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Maritime Intelligence Platform - Strategic Analytics', margin, footerY);
  pdf.text('Page 2', pageWidth - margin - 10, footerY);
  
  // Download
  const fileName = `Baltic_Sea_Intelligence_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};

export const downloadReportHTML = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true
  });
  
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = pdf.internal.pageSize.getWidth();
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
  pdf.save(filename);
};