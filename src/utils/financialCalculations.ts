export interface FinancialMetrics {
  valuation: {
    peRatio: number;
    pbRatio: number;
    evEbitda: number;
    priceToSales: number;
  };
  profitability: {
    roe: number;
    roa: number;
    grossMargin: number;
    operatingMargin: number;
  };
  financialStrength: {
    debtToEquity: number;
    currentRatio: number;
    freeCashFlow: number;
    interestCoverage: number;
  };
}

export interface DCFModel {
  projectionYears: number;
  revenueGrowthRates: number[];
  ebitdaMargins: number[];
  capexAsPercentRevenue: number[];
  terminalGrowthRate: number;
  discountRate: number;
  fairValue: number;
  upside: number;
}

export interface TechnicalAnalysis {
  trendAnalysis: {
    shortTerm: string;
    mediumTerm: string;
    longTerm: string;
  };
  keyLevels: {
    support: number[];
    resistance: number[];
  };
  momentum: {
    rsi: number;
    macd: number;
    bollinger: {
      upper: number;
      middle: number;
      lower: number;
    };
  };
  volumeAnalysis: string;
}

export interface ESGAnalysis {
  environmental: {
    score: number;
    factors: string[];
    improvement: string;
  };
  social: {
    score: number;
    factors: string[];
    concerns: string;
  };
  governance: {
    score: number;
    factors: string[];
    strengths: string;
  };
  overallRating: string;
  industryRank: string;
}

export class FinancialCalculator {
  // Valuation Ratios
  static calculatePE(price: number, earnings: number): number {
    return earnings > 0 ? price / earnings : 0;
  }

  static calculatePB(price: number, bookValue: number): number {
    return bookValue > 0 ? price / bookValue : 0;
  }

  static calculateEVEBITDA(enterpriseValue: number, ebitda: number): number {
    return ebitda > 0 ? enterpriseValue / ebitda : 0;
  }

  static calculatePS(marketCap: number, revenue: number): number {
    return revenue > 0 ? marketCap / revenue : 0;
  }

  // Profitability Ratios
  static calculateROE(netIncome: number, shareholderEquity: number): number {
    return shareholderEquity > 0 ? (netIncome / shareholderEquity) * 100 : 0;
  }

  static calculateROA(netIncome: number, totalAssets: number): number {
    return totalAssets > 0 ? (netIncome / totalAssets) * 100 : 0;
  }

  static calculateGrossMargin(grossProfit: number, revenue: number): number {
    return revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  }

  static calculateOperatingMargin(operatingIncome: number, revenue: number): number {
    return revenue > 0 ? (operatingIncome / revenue) * 100 : 0;
  }

  // Financial Strength Ratios
  static calculateDebtToEquity(totalDebt: number, totalEquity: number): number {
    return totalEquity > 0 ? totalDebt / totalEquity : 0;
  }

  static calculateCurrentRatio(currentAssets: number, currentLiabilities: number): number {
    return currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
  }

  static calculateInterestCoverage(ebit: number, interestExpense: number): number {
    return interestExpense > 0 ? ebit / interestExpense : 0;
  }

  // DCF Valuation
  static calculateDCF(params: {
    initialRevenue: number;
    growthRates: number[];
    ebitdaMargins: number[];
    taxRate: number;
    capexRates: number[];
    discountRate: number;
    terminalGrowthRate: number;
  }): DCFModel {
    const { initialRevenue, growthRates, ebitdaMargins, taxRate, capexRates, discountRate, terminalGrowthRate } = params;
    
    let revenues: number[] = [];
    let freeCashFlows: number[] = [];
    
    // Project revenues and cash flows
    for (let i = 0; i < growthRates.length; i++) {
      const revenue = i === 0 
        ? initialRevenue * (1 + growthRates[i] / 100)
        : revenues[i - 1] * (1 + growthRates[i] / 100);
      revenues.push(revenue);
      
      const ebitda = revenue * (ebitdaMargins[i] / 100);
      const ebit = ebitda; // Simplified - assuming no D&A for now
      const tax = ebit * (taxRate / 100);
      const nopat = ebit - tax;
      const capex = revenue * (capexRates[i] / 100);
      const fcf = nopat - capex;
      
      freeCashFlows.push(fcf);
    }
    
    // Terminal value
    const terminalFCF = freeCashFlows[freeCashFlows.length - 1] * (1 + terminalGrowthRate / 100);
    const terminalValue = terminalFCF / ((discountRate / 100) - (terminalGrowthRate / 100));
    
    // Discount cash flows to present value
    let presentValue = 0;
    for (let i = 0; i < freeCashFlows.length; i++) {
      presentValue += freeCashFlows[i] / Math.pow(1 + discountRate / 100, i + 1);
    }
    
    // Discount terminal value
    const presentTerminalValue = terminalValue / Math.pow(1 + discountRate / 100, freeCashFlows.length);
    
    const fairValue = presentValue + presentTerminalValue;
    
    return {
      projectionYears: growthRates.length,
      revenueGrowthRates: growthRates,
      ebitdaMargins,
      capexAsPercentRevenue: capexRates,
      terminalGrowthRate,
      discountRate,
      fairValue,
      upside: 0 // Will be calculated with current price
    };
  }

  // Technical Indicators
  static calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  static calculateMACD(prices: number[]): number {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    return ema12 - ema26;
  }

  static calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0;
    
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }

  static calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): { upper: number; middle: number; lower: number } {
    if (prices.length < period) {
      const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      return { upper: avg, middle: avg, lower: avg };
    }
    
    const recentPrices = prices.slice(-period);
    const sma = recentPrices.reduce((sum, price) => sum + price, 0) / period;
    
    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);
    
    return {
      upper: sma + (standardDeviation * stdDev),
      middle: sma,
      lower: sma - (standardDeviation * stdDev)
    };
  }

  // Risk Metrics
  static calculateBeta(stockReturns: number[], marketReturns: number[]): number {
    if (stockReturns.length !== marketReturns.length || stockReturns.length < 2) return 1;
    
    const stockMean = stockReturns.reduce((sum, ret) => sum + ret, 0) / stockReturns.length;
    const marketMean = marketReturns.reduce((sum, ret) => sum + ret, 0) / marketReturns.length;
    
    let covariance = 0;
    let marketVariance = 0;
    
    for (let i = 0; i < stockReturns.length; i++) {
      covariance += (stockReturns[i] - stockMean) * (marketReturns[i] - marketMean);
      marketVariance += Math.pow(marketReturns[i] - marketMean, 2);
    }
    
    return marketVariance === 0 ? 1 : covariance / marketVariance;
  }

  static calculateSharpeRatio(returns: number[], riskFreeRate: number): number {
    if (returns.length === 0) return 0;
    
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev === 0 ? 0 : (avgReturn - riskFreeRate) / stdDev;
  }

  static calculateWACC(params: {
    marketValueEquity: number;
    marketValueDebt: number;
    costOfEquity: number;
    costOfDebt: number;
    taxRate: number;
  }): number {
    const { marketValueEquity, marketValueDebt, costOfEquity, costOfDebt, taxRate } = params;
    const totalValue = marketValueEquity + marketValueDebt;
    
    if (totalValue === 0) return costOfEquity;
    
    const equityWeight = marketValueEquity / totalValue;
    const debtWeight = marketValueDebt / totalValue;
    
    return (equityWeight * costOfEquity) + (debtWeight * costOfDebt * (1 - taxRate / 100));
  }
}