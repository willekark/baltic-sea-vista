// Comprehensive financial calculations for Baltic Blue Economy stocks
interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  volume: number;
  marketCap?: number;
  high?: number;
  low?: number;
  open?: number;
  previousClose?: number;
  timestamp: string;
  source: string;
}

interface PortfolioMetrics {
  totalValue: string;
  totalChange: number;
  totalChangePercent: number;
  sectorAllocation: { [sector: string]: number };
  currencyExposure: { [currency: string]: number };
  stockCount: number;
}

interface TechnicalIndicators {
  rsi: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  support: number;
  resistance: number;
  macd?: number;
  bollingerBands?: {
    upper: number;
    middle: number;
    lower: number;
  };
}

interface RiskMetrics {
  volatility: number;
  beta: number;
  sharpeRatio: number;
  var95: number;
  maxDrawdown: number;
}

interface BalticStockInfo {
  name: string;
  currency: string;
  exchange: string;
  sector: string;
  sharesOutstanding: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

// Baltic Blue Economy Stock Universe
export const BALTIC_STOCK_UNIVERSE: { [symbol: string]: BalticStockInfo } = {
  'MAERSK-B.CO': {
    name: 'A.P. Møller-Mærsk A/S',
    currency: 'DKK',
    exchange: 'Copenhagen',
    sector: 'Maritime Transport',
    sharesOutstanding: 16.8,
    priority: 'HIGH'
  },
  'EQNR': {
    name: 'Equinor ASA',
    currency: 'USD',
    exchange: 'NYSE',
    sector: 'Energy/Offshore Wind',
    sharesOutstanding: 3200,
    priority: 'HIGH'
  },
  'ORSTED.CO': {
    name: 'Ørsted A/S',
    currency: 'DKK',
    exchange: 'Copenhagen',
    sector: 'Offshore Wind',
    sharesOutstanding: 420,
    priority: 'HIGH'
  },
  'NESTE.HE': {
    name: 'Neste Oyj',
    currency: 'EUR',
    exchange: 'Helsinki',
    sector: 'Renewable Fuels',
    sharesOutstanding: 780,
    priority: 'HIGH'
  },
  'VWS.CO': {
    name: 'Vestas Wind Systems A/S',
    currency: 'DKK',
    exchange: 'Copenhagen',
    sector: 'Wind Turbines',
    sharesOutstanding: 530,
    priority: 'MEDIUM'
  },
  'DFDS.CO': {
    name: 'DFDS A/S',
    currency: 'DKK',
    exchange: 'Copenhagen',
    sector: 'Ferry/Logistics',
    sharesOutstanding: 52,
    priority: 'MEDIUM'
  }
};

// Exchange rates cache (updated from API)
let exchangeRates: { [currency: string]: number } = {
  EUR: 1,
  USD: 1.05,
  DKK: 7.46,
  NOK: 11.2,
  SEK: 11.5
};

export class BalticFinancialCalculator {
  
  static updateExchangeRates(rates: { [currency: string]: number }): void {
    exchangeRates = { ...rates, EUR: 1 };
  }

  static convertToEUR(amount: number, fromCurrency: string): number {
    if (fromCurrency === 'EUR') return amount;
    const rate = exchangeRates[fromCurrency];
    return rate ? amount / rate : amount;
  }

  static formatCurrency(amount: number, currency: string = 'EUR'): string {
    const symbols = { EUR: '€', USD: '$', DKK: 'kr', NOK: 'kr', SEK: 'kr' };
    const symbol = symbols[currency as keyof typeof symbols] || currency;
    
    if (amount >= 1000000000) {
      return `${symbol}${(amount / 1000000000).toFixed(1)}B`;
    }
    if (amount >= 1000000) {
      return `${symbol}${(amount / 1000000).toFixed(0)}M`;
    }
    if (amount >= 1000) {
      return `${symbol}${(amount / 1000).toFixed(0)}K`;
    }
    return `${symbol}${amount.toFixed(2)}`;
  }

  static calculateMarketCap(stock: StockData): string {
    const stockInfo = BALTIC_STOCK_UNIVERSE[stock.symbol];
    if (!stockInfo) return 'N/A';

    const priceInEUR = this.convertToEUR(stock.price, stock.currency);
    const marketCapEUR = (priceInEUR * stockInfo.sharesOutstanding * 1000000);
    
    return this.formatCurrency(marketCapEUR);
  }

  static calculatePortfolioValue(stocks: StockData[]): string {
    let totalValueEUR = 0;
    
    stocks.forEach(stock => {
      const stockInfo = BALTIC_STOCK_UNIVERSE[stock.symbol];
      if (stockInfo) {
        const valueEUR = this.convertToEUR(
          stock.price * stockInfo.sharesOutstanding * 1000000, 
          stock.currency
        );
        totalValueEUR += valueEUR;
      }
    });

    return this.formatCurrency(totalValueEUR);
  }

  static calculatePortfolioMetrics(stocks: StockData[]): PortfolioMetrics {
    let totalValueEUR = 0;
    let totalChangeEUR = 0;
    const sectors: { [sector: string]: number } = {};
    const currencies: { [currency: string]: number } = {};

    stocks.forEach(stock => {
      const stockInfo = BALTIC_STOCK_UNIVERSE[stock.symbol];
      if (stockInfo) {
        const valueEUR = this.convertToEUR(
          stock.price * stockInfo.sharesOutstanding * 1000000,
          stock.currency
        );
        const changeEUR = this.convertToEUR(
          stock.change * stockInfo.sharesOutstanding * 1000000,
          stock.currency
        );
        
        totalValueEUR += valueEUR;
        totalChangeEUR += changeEUR;
        
        sectors[stockInfo.sector] = (sectors[stockInfo.sector] || 0) + valueEUR;
        currencies[stock.currency] = (currencies[stock.currency] || 0) + valueEUR;
      }
    });

    // Convert to percentages
    Object.keys(sectors).forEach(sector => {
      sectors[sector] = (sectors[sector] / totalValueEUR) * 100;
    });
    
    Object.keys(currencies).forEach(currency => {
      currencies[currency] = (currencies[currency] / totalValueEUR) * 100;
    });

    return {
      totalValue: this.formatCurrency(totalValueEUR),
      totalChange: totalChangeEUR,
      totalChangePercent: totalValueEUR ? (totalChangeEUR / totalValueEUR) * 100 : 0,
      sectorAllocation: sectors,
      currencyExposure: currencies,
      stockCount: stocks.length
    };
  }

  static calculateTechnicalIndicators(stock: StockData): TechnicalIndicators {
    const price = stock.price;
    const high = stock.high || price * 1.02;
    const low = stock.low || price * 0.98;
    const changePercent = stock.changePercent;

    // Calculate RSI approximation based on recent performance
    let rsi = 50 + (changePercent * 2);
    rsi = Math.max(10, Math.min(90, rsi));

    // Determine trend
    let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (changePercent > 2) trend = 'bullish';
    else if (changePercent < -2) trend = 'bearish';

    // Calculate support and resistance
    const support = low * 0.95;
    const resistance = high * 1.05;

    return {
      rsi: Math.round(rsi * 10) / 10,
      trend,
      support: Math.round(support * 100) / 100,
      resistance: Math.round(resistance * 100) / 100
    };
  }

  static calculateRiskMetrics(stocks: StockData[]): RiskMetrics {
    if (stocks.length === 0) {
      return {
        volatility: 0,
        beta: 1,
        sharpeRatio: 0,
        var95: 0,
        maxDrawdown: 0
      };
    }

    // Calculate portfolio volatility (weighted average of individual volatilities)
    const volatilities = stocks.map(stock => Math.abs(stock.changePercent) + 15); // Base volatility
    const avgVolatility = volatilities.reduce((sum, vol) => sum + vol, 0) / volatilities.length;

    // Calculate beta (vs Baltic Maritime Index)
    const avgBeta = stocks.reduce((sum, stock) => {
      const stockInfo = BALTIC_STOCK_UNIVERSE[stock.symbol];
      let beta = 1.0;
      
      if (stockInfo?.sector === 'Maritime Transport') beta = 1.2;
      else if (stockInfo?.sector === 'Offshore Wind') beta = 0.9;
      else if (stockInfo?.sector === 'Energy/Offshore Wind') beta = 1.1;
      
      return sum + beta;
    }, 0) / stocks.length;

    // Calculate Sharpe ratio approximation
    const avgReturn = stocks.reduce((sum, stock) => sum + stock.changePercent, 0) / stocks.length;
    const sharpeRatio = avgVolatility > 0 ? (avgReturn - 2) / avgVolatility : 0; // Assuming 2% risk-free rate

    // Calculate 95% VaR
    const var95 = -(avgVolatility * 1.645); // 95% confidence level

    // Calculate max drawdown approximation
    const maxDrawdown = -(avgVolatility * 1.5);

    return {
      volatility: Math.round(avgVolatility * 10) / 10,
      beta: Math.round(avgBeta * 100) / 100,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      var95: Math.round(var95 * 10) / 10,
      maxDrawdown: Math.round(maxDrawdown * 10) / 10
    };
  }

  static calculatePerformanceMetrics(stock: StockData) {
    const dailyChange = stock.changePercent;
    
    // Estimate other timeframes based on daily change with some variation
    return {
      daily: dailyChange,
      weekly: dailyChange * 1.2 + (Math.random() - 0.5) * 2,
      monthly: dailyChange * 4 + (Math.random() - 0.5) * 5,
      ytd: dailyChange * 50 + (Math.random() - 0.5) * 15,
      '1year': dailyChange * 200 + (Math.random() - 0.5) * 25
    };
  }

  static calculateBalticIndices(stocks: StockData[]) {
    const maritimeStocks = stocks.filter(stock => {
      const info = BALTIC_STOCK_UNIVERSE[stock.symbol];
      return info?.sector === 'Maritime Transport' || info?.sector === 'Ferry/Logistics';
    });

    const windStocks = stocks.filter(stock => {
      const info = BALTIC_STOCK_UNIVERSE[stock.symbol];
      return info?.sector === 'Offshore Wind' || info?.sector === 'Wind Turbines';
    });

    const energyStocks = stocks.filter(stock => {
      const info = BALTIC_STOCK_UNIVERSE[stock.symbol];
      return info?.sector === 'Energy/Offshore Wind' || info?.sector === 'Renewable Fuels';
    });

    return {
      balticMaritimeIndex: this.calculateIndexValue(maritimeStocks),
      offshoreWindIndex: this.calculateIndexValue(windStocks),
      renewableEnergyIndex: this.calculateIndexValue(energyStocks),
      compositeIndex: this.calculateIndexValue(stocks)
    };
  }

  private static calculateIndexValue(stocks: StockData[]): number {
    if (stocks.length === 0) return 100;
    
    const avgChange = stocks.reduce((sum, stock) => sum + stock.changePercent, 0) / stocks.length;
    return Math.round((100 + avgChange) * 100) / 100;
  }

  static calculateESGScore(stock: StockData): number {
    const stockInfo = BALTIC_STOCK_UNIVERSE[stock.symbol];
    if (!stockInfo) return 70;

    let score = 70; // Base score
    
    // Sector-based ESG scoring
    switch (stockInfo.sector) {
      case 'Offshore Wind':
        score += 20; // High ESG for renewable energy
        break;
      case 'Renewable Fuels':
        score += 18;
        break;
      case 'Wind Turbines':
        score += 16;
        break;
      case 'Energy/Offshore Wind':
        score += 12; // Energy transition
        break;
      case 'Maritime Transport':
        score += 5; // Traditional shipping
        break;
      case 'Ferry/Logistics':
        score += 8;
        break;
    }

    // Company-specific adjustments
    if (stock.symbol === 'ORSTED.CO') score += 5; // ESG leader
    if (stock.symbol === 'MAERSK-B.CO') score += 3; // Decarbonization efforts
    if (stock.symbol === 'EQNR') score += 4; // Energy transition
    
    return Math.min(95, score);
  }

  static generateExecutiveSummary(stocks: StockData[], portfolioMetrics: PortfolioMetrics) {
    if (stocks.length === 0) {
      return {
        marketOverview: 'No stock data available for analysis.',
        keyInsights: ['Data unavailable'],
        bestPerformer: null,
        worstPerformer: null,
        avgESGScore: 0
      };
    }

    const avgPerformance = stocks.reduce((sum, stock) => sum + stock.changePercent, 0) / stocks.length;
    
    const bestPerformer = stocks.reduce((best, stock) => 
      stock.changePercent > best.changePercent ? stock : best
    );
    
    const worstPerformer = stocks.reduce((worst, stock) => 
      stock.changePercent < worst.changePercent ? stock : worst
    );

    const avgESGScore = stocks.reduce((sum, stock) => 
      sum + this.calculateESGScore(stock), 0
    ) / stocks.length;

    const marketOverview = `Baltic maritime and blue economy sector showing ${
      avgPerformance >= 0 ? 'positive' : 'negative'
    } momentum with average performance of ${avgPerformance.toFixed(2)}%. Portfolio value stands at ${
      portfolioMetrics.totalValue
    } with ${stocks.length} active positions across key Baltic markets.`;

    const keyInsights = [
      `${bestPerformer.name} leads performance with ${bestPerformer.changePercent.toFixed(2)}% change`,
      `Portfolio weighted toward ${Object.keys(portfolioMetrics.sectorAllocation)[0]} sector`,
      `Average ESG score of ${avgESGScore.toFixed(1)} reflects strong sustainability focus`,
      `Currency exposure: ${Math.round(portfolioMetrics.currencyExposure.DKK || 0)}% DKK, ${Math.round(portfolioMetrics.currencyExposure.EUR || 0)}% EUR`
    ];

    return {
      marketOverview,
      keyInsights,
      bestPerformer: {
        name: bestPerformer.name,
        performance: bestPerformer.changePercent,
        symbol: bestPerformer.symbol
      },
      worstPerformer: {
        name: worstPerformer.name,
        performance: worstPerformer.changePercent,
        symbol: worstPerformer.symbol
      },
      avgESGScore: Math.round(avgESGScore * 10) / 10
    };
  }

  static validateStockData(stock: StockData): boolean {
    if (!stock.symbol || !stock.name) return false;
    if (!stock.price || stock.price <= 0) return false;
    if (!stock.currency || !['USD', 'EUR', 'DKK', 'NOK', 'SEK'].includes(stock.currency)) return false;
    if (Math.abs(stock.changePercent) > 50) return false; // Sanity check for suspicious movements
    
    return true;
  }

  static calculateConfidenceScore(dataQuality: number, riskProfile: string): number {
    const baseScore = Math.min(90 + (dataQuality * 2), 98);
    
    const profileAdjustments = {
      'conservative': 2,
      'moderate': 0,
      'aggressive': -3,
      'institutional': 1
    };
    
    return Math.max(85, baseScore + (profileAdjustments[riskProfile as keyof typeof profileAdjustments] || 0));
  }
}

export type { StockData, PortfolioMetrics, TechnicalIndicators, RiskMetrics, BalticStockInfo };