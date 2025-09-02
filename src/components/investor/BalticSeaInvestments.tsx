import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  Ship, 
  Zap, 
  Fish, 
  Factory, 
  TrendingUp, 
  TrendingDown, 
  Search,
  ExternalLink,
  MapPin,
  DollarSign,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Calculator,
  RefreshCw,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { useRealTimeStockData } from '@/hooks/useRealTimeStockData';

interface PublicStock {
  ticker: string;
  company: string;
  exchange: string;
  sector: string;
  marketCap: string;
  price: string;
  change: string;
  changePercent: string;
  trend: 'up' | 'down' | 'neutral';
  balticExposure: string;
  description: string;
  headquarters: string;
  tags: string[];
  analyticalData: {
    peRatio: number | string;
    sharpeRatio: number;
    beta: number;
    dividendYield: number;
    roe: number;
    debtToEquity: number;
    currentRatio: number;
    priceToBook: number;
    eps: number;
    revenue52w: string;
    operatingMargin: number;
    freeCashFlow: string;
    analystRating: string;
    priceTarget: string;
    volumeAvg: string;
  };
}

interface PrivateCompany {
  name: string;
  sector: string;
  headquarters: string;
  stage: string;
  valuation: string;
  balticOperations: string;
  description: string;
  investmentType: string;
  tags: string[];
}

const BalticSeaInvestments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  
  // All Baltic Sea company tickers
  const allTickers = [
    'MAERSK-B.CO', 'HHLA.DE', 'ORSTED.CO', 'TORM.CO', 'HAPAG.DE', 'SALM.HE', 'TELUS.HE', 'KONE.HE',
    'TSM1T', 'VIK1V', 'TAL1T', 'DFDS', 'PGE', 'ORLEN', 'RWE', 'EBK', 'IGN1L', 'EGR1T', 
    'EQNR', 'PEP', 'NESTE', 'WRT1V', 'ALFA', 'CCC', 'TVE1T', 'KNE1L'
  ];
  
  // Fetch real-time stock data
  const { stockData, loading, error, lastUpdated, refresh } = useRealTimeStockData({
    tickers: allTickers,
    refreshInterval: 300000, // Refresh every 5 minutes
    includeProfile: false
  });

  const publicStocks: PublicStock[] = [
    {
      ticker: 'MAERSK-B.CO',
      company: 'A.P. Møller-Mærsk',
      exchange: 'NASDAQ Copenhagen',
      sector: 'Shipping & Logistics',
      marketCap: '$47.2B',
      price: 'DKK 12,580',
      change: '+145',
      changePercent: '+1.17%',
      trend: 'up',
      balticExposure: 'High - Major Baltic routes',
      description: 'Global container shipping and port operations with significant Baltic Sea presence',
      headquarters: 'Copenhagen, Denmark',
      tags: ['Shipping', 'Logistics', 'Ports', 'Container'],
      analyticalData: {
        peRatio: 8.2,
        sharpeRatio: 1.45,
        beta: 1.23,
        dividendYield: 3.8,
        roe: 15.2,
        debtToEquity: 0.65,
        currentRatio: 1.85,
        priceToBook: 1.12,
        eps: 1534.5,
        revenue52w: '$61.8B',
        operatingMargin: 12.8,
        freeCashFlow: '$4.2B',
        analystRating: 'Buy',
        priceTarget: 'DKK 14,200',
        volumeAvg: '425K'
      }
    },
    {
      ticker: 'HHLA.DE',
      company: 'Hamburger Hafen und Logistik AG',
      exchange: 'XETRA',
      sector: 'Port Operations',
      marketCap: '€1.8B',
      price: '€16.25',
      change: '-0.35',
      changePercent: '-2.11%',
      trend: 'down',
      balticExposure: 'Very High - Hamburg port gateway',
      description: 'Leading European port and logistics company operating Hamburg port',
      headquarters: 'Hamburg, Germany',
      tags: ['Ports', 'Logistics', 'Container', 'Rail'],
      analyticalData: {
        peRatio: 12.4,
        sharpeRatio: 0.82,
        beta: 0.95,
        dividendYield: 5.2,
        roe: 8.9,
        debtToEquity: 0.48,
        currentRatio: 1.42,
        priceToBook: 0.88,
        eps: 1.31,
        revenue52w: '€1.4B',
        operatingMargin: 8.5,
        freeCashFlow: '€180M',
        analystRating: 'Hold',
        priceTarget: '€17.50',
        volumeAvg: '85K'
      }
    },
    {
      ticker: 'ORSTED.CO',
      company: 'Ørsted A/S',
      exchange: 'NASDAQ Copenhagen',
      sector: 'Renewable Energy',
      marketCap: '$23.4B',
      price: 'DKK 358.60',
      change: '+2.80',
      changePercent: '+0.79%',
      trend: 'up',
      balticExposure: 'High - Baltic offshore wind farms',
      description: 'Leading offshore wind developer with multiple Baltic Sea projects',
      headquarters: 'Fredericia, Denmark',
      tags: ['Wind Energy', 'Renewable', 'Offshore', 'Green Energy'],
      analyticalData: {
        peRatio: 18.7,
        sharpeRatio: 1.12,
        beta: 1.08,
        dividendYield: 2.1,
        roe: 12.4,
        debtToEquity: 0.82,
        currentRatio: 1.15,
        priceToBook: 2.34,
        eps: 19.18,
        revenue52w: 'DKK 77.2B',
        operatingMargin: 15.6,
        freeCashFlow: 'DKK 8.5B',
        analystRating: 'Buy',
        priceTarget: 'DKK 420.00',
        volumeAvg: '2.1M'
      }
    },
    {
      ticker: 'TORM.CO',
      company: 'TORM plc',
      exchange: 'NASDAQ Copenhagen',
      sector: 'Tanker Shipping',
      marketCap: '$2.1B',
      price: 'DKK 172.40',
      change: '-1.60',
      changePercent: '-0.92%',
      trend: 'down',
      balticExposure: 'Medium - Baltic/North Sea routes',
      description: 'Product tanker shipping company with Baltic operations',
      headquarters: 'Copenhagen, Denmark',
      tags: ['Tankers', 'Product Shipping', 'Maritime'],
      analyticalData: {
        peRatio: 6.8,
        sharpeRatio: 2.15,
        beta: 1.85,
        dividendYield: 8.4,
        roe: 24.6,
        debtToEquity: 0.35,
        currentRatio: 2.45,
        priceToBook: 1.68,
        eps: 25.35,
        revenue52w: 'DKK 9.2B',
        operatingMargin: 28.5,
        freeCashFlow: 'DKK 1.8B',
        analystRating: 'Strong Buy',
        priceTarget: 'DKK 195.00',
        volumeAvg: '1.2M'
      }
    },
    {
      ticker: 'HAPAG.DE',
      company: 'Hapag-Lloyd AG',
      exchange: 'XETRA',
      sector: 'Container Shipping',
      marketCap: '€24.8B',
      price: '€154.20',
      change: '+2.10',
      changePercent: '+1.38%',
      trend: 'up',
      balticExposure: 'Medium - Baltic service routes',
      description: 'Major container shipping line serving Baltic ports',
      headquarters: 'Hamburg, Germany',
      tags: ['Container', 'Shipping', 'Logistics'],
      analyticalData: {
        peRatio: 4.2,
        sharpeRatio: 1.88,
        beta: 1.65,
        dividendYield: 6.8,
        roe: 32.5,
        debtToEquity: 0.58,
        currentRatio: 1.92,
        priceToBook: 1.35,
        eps: 36.71,
        revenue52w: '€19.8B',
        operatingMargin: 18.2,
        freeCashFlow: '€3.2B',
        analystRating: 'Buy',
        priceTarget: '€175.00',
        volumeAvg: '890K'
      }
    },
    {
      ticker: 'SALM.HE',
      company: 'Salmar ASA',
      exchange: 'Oslo Børs',
      sector: 'Aquaculture',
      marketCap: 'NOK 89.2B',
      price: 'NOK 734.50',
      change: '+8.50',
      changePercent: '+1.17%',
      trend: 'up',
      balticExposure: 'Low-Medium - Nordic operations',
      description: 'Major salmon farming company with Nordic operations',
      headquarters: 'Frøya, Norway',
      tags: ['Aquaculture', 'Salmon', 'Food Production'],
      analyticalData: {
        peRatio: 14.2,
        sharpeRatio: 0.95,
        beta: 0.88,
        dividendYield: 3.2,
        roe: 18.4,
        debtToEquity: 0.42,
        currentRatio: 1.68,
        priceToBook: 2.58,
        eps: 51.73,
        revenue52w: 'NOK 28.5B',
        operatingMargin: 22.8,
        freeCashFlow: 'NOK 4.1B',
        analystRating: 'Buy',
        priceTarget: 'NOK 820.00',
        volumeAvg: '245K'
      }
    },
    {
      ticker: 'TELUS.HE',
      company: 'Telia Company AB',
      exchange: 'NASDAQ Stockholm',
      sector: 'Telecommunications',
      marketCap: 'SEK 172B',
      price: 'SEK 24.16',
      change: '-0.08',
      changePercent: '-0.33%',
      trend: 'down',
      balticExposure: 'Very High - Baltic states coverage',
      description: 'Major telecom operator in Nordic and Baltic countries',
      headquarters: 'Solna, Sweden',
      tags: ['Telecom', '5G', 'Infrastructure'],
        analyticalData: {
        peRatio: 'N/A',
        sharpeRatio: 0.68,
        beta: 0.72,
        dividendYield: 7.8,
        roe: -2.1,
        debtToEquity: 0.92,
        currentRatio: 0.85,
        priceToBook: 0.68,
        eps: -1.24,
        revenue52w: 'SEK 84.2B',
        operatingMargin: 15.2,
        freeCashFlow: 'SEK 12.5B',
        analystRating: 'Hold',
        priceTarget: 'SEK 26.00',
        volumeAvg: '3.8M'
      }
    },
    // New Baltic Sea Companies Dataset
    {
      ticker: 'TSM1T',
      company: 'AS Tallinna Sadam',
      exchange: 'Nasdaq Tallinn',
      sector: 'Port Operations',
      marketCap: '€1.2B',
      price: '€1.45',
      change: '+0.02',
      changePercent: '+1.40%',
      trend: 'up',
      balticExposure: 'Very High - Primary Baltic port',
      description: 'Major Baltic port operator serving Estonia and regional cargo flows',
      headquarters: 'Tallinn, Estonia',
      tags: ['Ports', 'Logistics', 'Baltic Gateway'],
      analyticalData: {
        peRatio: 11.5,
        sharpeRatio: 1.18,
        beta: 0.78,
        dividendYield: 4.8,
        roe: 12.6,
        debtToEquity: 0.52,
        currentRatio: 1.68,
        priceToBook: 1.45,
        eps: 0.126,
        revenue52w: '€165M',
        operatingMargin: 18.2,
        freeCashFlow: '€45M',
        analystRating: 'Buy',
        priceTarget: '€1.65',
        volumeAvg: '125K'
      }
    },
    {
      ticker: 'VIK1V',
      company: 'Viking Line Abp',
      exchange: 'Nasdaq Helsinki',
      sector: 'Ferry Operations',
      marketCap: '€485M',
      price: '€11.20',
      change: '-0.15',
      changePercent: '-1.32%',
      trend: 'down',
      balticExposure: 'Very High - Baltic Sea routes',
      description: 'Leading ferry operator connecting Finland, Sweden, and Baltic islands',
      headquarters: 'Mariehamn, Finland',
      tags: ['Ferries', 'Passenger Transport', 'Tourism'],
      analyticalData: {
        peRatio: 15.8,
        sharpeRatio: 0.85,
        beta: 1.12,
        dividendYield: 2.8,
        roe: 8.4,
        debtToEquity: 0.68,
        currentRatio: 1.25,
        priceToBook: 1.32,
        eps: 0.71,
        revenue52w: '€495M',
        operatingMargin: 6.8,
        freeCashFlow: '€35M',
        analystRating: 'Hold',
        priceTarget: '€12.50',
        volumeAvg: '85K'
      }
    },
    {
      ticker: 'TAL1T',
      company: 'AS Tallink Grupp',
      exchange: 'Nasdaq Tallinn',
      sector: 'Ferry Operations',
      marketCap: '€420M',
      price: '€0.66',
      change: '+0.01',
      changePercent: '+1.54%',
      trend: 'up',
      balticExposure: 'Very High - Dominant Baltic ferry operator',
      description: 'Largest passenger and cargo ferry company in Baltic Sea region',
      headquarters: 'Tallinn, Estonia',
      tags: ['Ferries', 'RoRo', 'Baltic Transport'],
      analyticalData: {
        peRatio: 8.9,
        sharpeRatio: 1.22,
        beta: 1.45,
        dividendYield: 3.6,
        roe: 14.2,
        debtToEquity: 0.92,
        currentRatio: 1.15,
        priceToBook: 0.88,
        eps: 0.074,
        revenue52w: '€950M',
        operatingMargin: 12.5,
        freeCashFlow: '€85M',
        analystRating: 'Buy',
        priceTarget: '€0.78',
        volumeAvg: '2.1M'
      }
    },
    {
      ticker: 'DFDS',
      company: 'DFDS A/S',
      exchange: 'Nasdaq Copenhagen',
      sector: 'Ferry Operations',
      marketCap: 'DKK 28.5B',
      price: 'DKK 385.00',
      change: '+5.50',
      changePercent: '+1.45%',
      trend: 'up',
      balticExposure: 'High - Baltic and North Sea routes',
      description: 'Major Northern European ferry and logistics operator',
      headquarters: 'Copenhagen, Denmark',
      tags: ['Ferries', 'Logistics', 'RoRo'],
      analyticalData: {
        peRatio: 12.8,
        sharpeRatio: 1.35,
        beta: 1.18,
        dividendYield: 2.9,
        roe: 16.8,
        debtToEquity: 0.75,
        currentRatio: 1.32,
        priceToBook: 2.15,
        eps: 30.08,
        revenue52w: 'DKK 24.8B',
        operatingMargin: 8.5,
        freeCashFlow: 'DKK 1.8B',
        analystRating: 'Buy',
        priceTarget: 'DKK 425.00',
        volumeAvg: '185K'
      }
    },
    {
      ticker: 'PGE',
      company: 'PGE Polska Grupa Energetyczna',
      exchange: 'Warsaw Stock Exchange',
      sector: 'Energy & Utilities',
      marketCap: 'PLN 42.8B',
      price: 'PLN 12.85',
      change: '+0.18',
      changePercent: '+1.42%',
      trend: 'up',
      balticExposure: 'Medium - Baltic Sea offshore wind projects',
      description: 'Largest Polish power company with major renewable energy expansion',
      headquarters: 'Warsaw, Poland',
      tags: ['Utilities', 'Renewable Energy', 'Wind Power'],
      analyticalData: {
        peRatio: 6.8,
        sharpeRatio: 0.95,
        beta: 0.88,
        dividendYield: 5.2,
        roe: 11.4,
        debtToEquity: 0.58,
        currentRatio: 1.48,
        priceToBook: 0.75,
        eps: 1.89,
        revenue52w: 'PLN 58.2B',
        operatingMargin: 9.8,
        freeCashFlow: 'PLN 4.2B',
        analystRating: 'Buy',
        priceTarget: 'PLN 15.50',
        volumeAvg: '8.5M'
      }
    },
    {
      ticker: 'ORLEN',
      company: 'ORLEN S.A.',
      exchange: 'Warsaw Stock Exchange',
      sector: 'Energy & Oil',
      marketCap: 'PLN 52.8B',
      price: 'PLN 48.52',
      change: '-0.35',
      changePercent: '-0.72%',
      trend: 'down',
      balticExposure: 'Medium - Baltic refining and petrochemicals',
      description: 'Central European oil refiner and petrochemicals company',
      headquarters: 'Płock, Poland',
      tags: ['Oil & Gas', 'Petrochemicals', 'Refining'],
      analyticalData: {
        peRatio: 4.2,
        sharpeRatio: 1.05,
        beta: 1.25,
        dividendYield: 6.8,
        roe: 18.5,
        debtToEquity: 0.42,
        currentRatio: 1.85,
        priceToBook: 0.68,
        eps: 11.55,
        revenue52w: 'PLN 185.2B',
        operatingMargin: 5.8,
        freeCashFlow: 'PLN 8.5B',
        analystRating: 'Hold',
        priceTarget: 'PLN 52.00',
        volumeAvg: '1.2M'
      }
    },
    {
      ticker: 'RWE',
      company: 'RWE AG',
      exchange: 'Xetra (Frankfurt)',
      sector: 'Renewable Energy',
      marketCap: '€28.5B',
      price: '€42.15',
      change: '+0.85',
      changePercent: '+2.06%',
      trend: 'up',
      balticExposure: 'High - Major Baltic offshore wind developer',
      description: 'Leading European renewable energy company with extensive offshore wind',
      headquarters: 'Essen, Germany',
      tags: ['Renewable Energy', 'Offshore Wind', 'Green Transition'],
      analyticalData: {
        peRatio: 16.5,
        sharpeRatio: 1.28,
        beta: 0.92,
        dividendYield: 2.8,
        roe: 14.2,
        debtToEquity: 0.68,
        currentRatio: 1.25,
        priceToBook: 1.85,
        eps: 2.55,
        revenue52w: '€24.2B',
        operatingMargin: 18.5,
        freeCashFlow: '€2.8B',
        analystRating: 'Buy',
        priceTarget: '€48.50',
        volumeAvg: '2.8M'
      }
    },
    {
      ticker: 'EBK',
      company: 'EnBW AG',
      exchange: 'Xetra (Frankfurt)',
      sector: 'Utilities & Renewables',
      marketCap: '€18.8B',
      price: '€72.45',
      change: '+1.25',
      changePercent: '+1.76%',
      trend: 'up',
      balticExposure: 'Medium - Baltic offshore wind investments',
      description: 'German utility company with significant renewable energy portfolio',
      headquarters: 'Karlsruhe, Germany',
      tags: ['Utilities', 'Renewable Energy', 'Grid Infrastructure'],
      analyticalData: {
        peRatio: 14.8,
        sharpeRatio: 1.12,
        beta: 0.85,
        dividendYield: 4.2,
        roe: 12.8,
        debtToEquity: 0.78,
        currentRatio: 1.32,
        priceToBook: 1.58,
        eps: 4.89,
        revenue52w: '€25.5B',
        operatingMargin: 12.8,
        freeCashFlow: '€1.8B',
        analystRating: 'Hold',
        priceTarget: '€75.00',
        volumeAvg: '425K'
      }
    },
    {
      ticker: 'IGN1L',
      company: 'Ignitis Group',
      exchange: 'Nasdaq Vilnius',
      sector: 'Energy & Utilities',
      marketCap: '€2.1B',
      price: '€18.85',
      change: '+0.25',
      changePercent: '+1.34%',
      trend: 'up',
      balticExposure: 'Very High - Baltic states energy leader',
      description: 'Leading energy group in Baltic states with renewable focus',
      headquarters: 'Vilnius, Lithuania',
      tags: ['Utilities', 'Renewable Energy', 'Baltic Energy'],
      analyticalData: {
        peRatio: 12.5,
        sharpeRatio: 1.08,
        beta: 0.95,
        dividendYield: 3.8,
        roe: 15.2,
        debtToEquity: 0.65,
        currentRatio: 1.45,
        priceToBook: 1.68,
        eps: 1.51,
        revenue52w: '€1.8B',
        operatingMargin: 16.8,
        freeCashFlow: '€285M',
        analystRating: 'Buy',
        priceTarget: '€22.00',
        volumeAvg: '95K'
      }
    },
    {
      ticker: 'EGR1T',
      company: 'Enefit Green AS',
      exchange: 'Nasdaq Tallinn',
      sector: 'Renewable Energy',
      marketCap: '€1.4B',
      price: '€13.20',
      change: '+0.35',
      changePercent: '+2.72%',
      trend: 'up',
      balticExposure: 'Very High - Baltic renewable energy leader',
      description: 'Leading renewable energy producer in Baltic states and Poland',
      headquarters: 'Tallinn, Estonia',
      tags: ['Wind Energy', 'Solar Power', 'Green Energy'],
      analyticalData: {
        peRatio: 22.5,
        sharpeRatio: 1.45,
        beta: 1.15,
        dividendYield: 1.8,
        roe: 18.5,
        debtToEquity: 0.48,
        currentRatio: 1.85,
        priceToBook: 3.25,
        eps: 0.587,
        revenue52w: '€285M',
        operatingMargin: 42.5,
        freeCashFlow: '€95M',
        analystRating: 'Strong Buy',
        priceTarget: '€16.50',
        volumeAvg: '185K'
      }
    },
    {
      ticker: 'EQNR',
      company: 'Equinor ASA',
      exchange: 'Oslo Børs',
      sector: 'Energy & Oil',
      marketCap: 'NOK 885B',
      price: 'NOK 275.80',
      change: '+2.15',
      changePercent: '+0.79%',
      trend: 'up',
      balticExposure: 'Low-Medium - Nordic offshore operations',
      description: 'Norwegian energy company with offshore wind and oil operations',
      headquarters: 'Stavanger, Norway',
      tags: ['Oil & Gas', 'Offshore Wind', 'Energy Transition'],
      analyticalData: {
        peRatio: 11.2,
        sharpeRatio: 1.32,
        beta: 1.28,
        dividendYield: 5.8,
        roe: 22.5,
        debtToEquity: 0.35,
        currentRatio: 1.95,
        priceToBook: 2.15,
        eps: 24.64,
        revenue52w: 'NOK 1,085B',
        operatingMargin: 18.8,
        freeCashFlow: 'NOK 185B',
        analystRating: 'Buy',
        priceTarget: 'NOK 320.00',
        volumeAvg: '8.5M'
      }
    },
    {
      ticker: 'PEP',
      company: 'Polenergia S.A.',
      exchange: 'Warsaw Stock Exchange',
      sector: 'Renewable Energy',
      marketCap: 'PLN 4.8B',
      price: 'PLN 12.85',
      change: '+0.42',
      changePercent: '+3.38%',
      trend: 'up',
      balticExposure: 'High - Baltic offshore wind projects',
      description: 'Polish renewable energy company with offshore wind focus',
      headquarters: 'Warsaw, Poland',
      tags: ['Offshore Wind', 'Renewable Energy', 'Clean Technology'],
      analyticalData: {
        peRatio: 28.5,
        sharpeRatio: 1.58,
        beta: 1.45,
        dividendYield: 0.8,
        roe: 8.5,
        debtToEquity: 0.85,
        currentRatio: 1.25,
        priceToBook: 2.85,
        eps: 0.45,
        revenue52w: 'PLN 1.2B',
        operatingMargin: 25.8,
        freeCashFlow: 'PLN 185M',
        analystRating: 'Buy',
        priceTarget: 'PLN 16.00',
        volumeAvg: '425K'
      }
    },
    {
      ticker: 'NESTE',
      company: 'Neste Oyj',
      exchange: 'Nasdaq Helsinki',
      sector: 'Sustainable Fuels',
      marketCap: '€28.5B',
      price: '€37.82',
      change: '+0.85',
      changePercent: '+2.30%',
      trend: 'up',
      balticExposure: 'Medium - Baltic refining and biofuels',
      description: 'Leading sustainable aviation fuel and renewable diesel producer',
      headquarters: 'Espoo, Finland',
      tags: ['Biofuels', 'Sustainable Aviation Fuel', 'Clean Technology'],
      analyticalData: {
        peRatio: 15.8,
        sharpeRatio: 1.25,
        beta: 1.08,
        dividendYield: 4.2,
        roe: 18.5,
        debtToEquity: 0.28,
        currentRatio: 1.68,
        priceToBook: 2.85,
        eps: 2.39,
        revenue52w: '€22.9B',
        operatingMargin: 8.5,
        freeCashFlow: '€1.8B',
        analystRating: 'Buy',
        priceTarget: '€42.50',
        volumeAvg: '1.8M'
      }
    },
    {
      ticker: 'WRT1V',
      company: 'Wärtsilä Oyj',
      exchange: 'Nasdaq Helsinki',
      sector: 'Marine Technology',
      marketCap: '€6.8B',
      price: '€11.24',
      change: '+0.18',
      changePercent: '+1.63%',
      trend: 'up',
      balticExposure: 'High - Marine engines and energy solutions',
      description: 'Marine and energy technology company serving Baltic shipping',
      headquarters: 'Helsinki, Finland',
      tags: ['Marine Technology', 'Energy Solutions', 'Shipping Equipment'],
      analyticalData: {
        peRatio: 18.5,
        sharpeRatio: 1.12,
        beta: 1.25,
        dividendYield: 3.8,
        roe: 12.8,
        debtToEquity: 0.42,
        currentRatio: 1.85,
        priceToBook: 2.25,
        eps: 0.608,
        revenue52w: '€5.8B',
        operatingMargin: 9.8,
        freeCashFlow: '€485M',
        analystRating: 'Hold',
        priceTarget: '€12.50',
        volumeAvg: '1.2M'
      }
    },
    {
      ticker: 'ALFA',
      company: 'Alfa Laval AB',
      exchange: 'Nasdaq Stockholm',
      sector: 'Industrial Technology',
      marketCap: 'SEK 148B',
      price: 'SEK 349.80',
      change: '+4.20',
      changePercent: '+1.22%',
      trend: 'up',
      balticExposure: 'Medium - Marine and energy solutions',
      description: 'Heat transfer, separation and fluid handling technology',
      headquarters: 'Lund, Sweden',
      tags: ['Industrial Equipment', 'Marine Solutions', 'Clean Technology'],
      analyticalData: {
        peRatio: 24.8,
        sharpeRatio: 1.35,
        beta: 1.15,
        dividendYield: 2.2,
        roe: 21.5,
        debtToEquity: 0.35,
        currentRatio: 1.95,
        priceToBook: 4.85,
        eps: 14.10,
        revenue52w: 'SEK 63.2B',
        operatingMargin: 16.8,
        freeCashFlow: 'SEK 6.8B',
        analystRating: 'Buy',
        priceTarget: 'SEK 385.00',
        volumeAvg: '985K'
      }
    },
    {
      ticker: 'CCC',
      company: 'Cavotec SA',
      exchange: 'Nasdaq Stockholm',
      sector: 'Port Technology',
      marketCap: 'SEK 2.8B',
      price: 'SEK 25.40',
      change: '+0.65',
      changePercent: '+2.62%',
      trend: 'up',
      balticExposure: 'High - Port electrification solutions',
      description: 'Port and industrial electrification technology solutions',
      headquarters: 'Lugano, Switzerland',
      tags: ['Port Technology', 'Electrification', 'Clean Technology'],
      analyticalData: {
        peRatio: 32.5,
        sharpeRatio: 1.85,
        beta: 1.68,
        dividendYield: 1.2,
        roe: 8.5,
        debtToEquity: 0.28,
        currentRatio: 2.15,
        priceToBook: 2.85,
        eps: 0.78,
        revenue52w: 'SEK 1.8B',
        operatingMargin: 12.8,
        freeCashFlow: 'SEK 185M',
        analystRating: 'Buy',
        priceTarget: 'SEK 32.00',
        volumeAvg: '125K'
      }
    },
    {
      ticker: 'TVE1T',
      company: 'AS Tallinna Vesi',
      exchange: 'Nasdaq Tallinn',
      sector: 'Water Utilities',
      marketCap: '€225M',
      price: '€12.90',
      change: '+0.10',
      changePercent: '+0.78%',
      trend: 'up',
      balticExposure: 'High - Baltic water and wastewater services',
      description: 'Water supply and wastewater treatment services in Tallinn region',
      headquarters: 'Tallinn, Estonia',
      tags: ['Water Utilities', 'Environmental Services', 'Infrastructure'],
      analyticalData: {
        peRatio: 8.5,
        sharpeRatio: 0.85,
        beta: 0.45,
        dividendYield: 6.8,
        roe: 15.2,
        debtToEquity: 0.38,
        currentRatio: 1.85,
        priceToBook: 1.25,
        eps: 1.518,
        revenue52w: '€65M',
        operatingMargin: 28.5,
        freeCashFlow: '€18M',
        analystRating: 'Hold',
        priceTarget: '€13.50',
        volumeAvg: '15K'
      }
    },
    {
      ticker: 'KNE1L',
      company: 'KN Energies (ex-Klaipėdos nafta)',
      exchange: 'Nasdaq Vilnius',
      sector: 'Energy Infrastructure',
      marketCap: '€485M',
      price: '€0.62',
      change: '+0.01',
      changePercent: '+1.64%',
      trend: 'up',
      balticExposure: 'Very High - Baltic LNG terminal operator',
      description: 'LNG terminal operator and energy infrastructure company',
      headquarters: 'Klaipėda, Lithuania',
      tags: ['LNG Infrastructure', 'Energy Security', 'Gas Terminal'],
      analyticalData: {
        peRatio: 12.8,
        sharpeRatio: 1.25,
        beta: 1.05,
        dividendYield: 4.5,
        roe: 8.8,
        debtToEquity: 0.85,
        currentRatio: 1.45,
        priceToBook: 1.15,
        eps: 0.0484,
        revenue52w: '€185M',
        operatingMargin: 18.5,
        freeCashFlow: '€35M',
        analystRating: 'Buy',
        priceTarget: '€0.75',
        volumeAvg: '485K'
      }
    },
    {
      ticker: 'KONE.HE',
      company: 'KONE Corporation',
      exchange: 'NASDAQ Helsinki',
      sector: 'Industrial Equipment',
      marketCap: '€42.1B',
      price: '€40.88',
      change: '+0.22',
      changePercent: '+0.54%',
      trend: 'up',
      balticExposure: 'Medium - Baltic infrastructure projects',
      description: 'Global elevator and escalator manufacturer with Baltic presence',
      headquarters: 'Helsinki, Finland',
      tags: ['Elevators', 'Infrastructure', 'Industrial'],
      analyticalData: {
        peRatio: 19.8,
        sharpeRatio: 1.05,
        beta: 0.95,
        dividendYield: 4.1,
        roe: 16.8,
        debtToEquity: 0.28,
        currentRatio: 1.35,
        priceToBook: 3.24,
        eps: 2.07,
        revenue52w: '€10.9B',
        operatingMargin: 12.5,
        freeCashFlow: '€1.1B',
        analystRating: 'Buy',
        priceTarget: '€45.50',
        volumeAvg: '1.1M'
      }
    }
  ];

  const privateCompanies: PrivateCompany[] = [
    {
      name: 'Port of Göteborg AB',
      sector: 'Port Operations',
      headquarters: 'Göteborg, Sweden',
      stage: 'Established',
      valuation: '~€2.5B',
      balticOperations: 'Primary Scandinavian gateway port',
      description: 'Largest port in Scandinavia, key Baltic trade hub',
      investmentType: 'Municipal/Infrastructure Fund',
      tags: ['Ports', 'Infrastructure', 'Trade Gateway']
    },
    {
      name: 'Tallink Group',
      sector: 'Ferry Operations',
      headquarters: 'Tallinn, Estonia',
      stage: 'Public (TLG1T.TL)',
      valuation: '€420M',
      balticOperations: 'Dominant Baltic Sea ferry operator',
      description: 'Leading passenger and cargo ferry company in Baltic Sea region',
      investmentType: 'Public Equity',
      tags: ['Ferries', 'Passenger Transport', 'Tourism']
    },
    {
      name: 'Stena Line',
      sector: 'Ferry Operations',
      headquarters: 'Gothenburg, Sweden',
      stage: 'Private',
      valuation: '~€3.2B',
      balticOperations: 'Major Baltic routes to Poland, Germany',
      description: 'One of largest ferry operators in Europe with key Baltic routes',
      investmentType: 'Private Equity/Family Owned',
      tags: ['Ferries', 'RoRo', 'Transport Infrastructure']
    },
    {
      name: 'Nordic Aquafarms',
      sector: 'Aquaculture',
      headquarters: 'Bergen, Norway',
      stage: 'Growth',
      valuation: '~€500M',
      balticOperations: 'Land-based salmon farming facilities',
      description: 'Revolutionary land-based salmon farming technology',
      investmentType: 'Growth Capital',
      tags: ['Salmon', 'Sustainable Aquaculture', 'Innovation']
    },
    {
      name: 'Ellevio AB',
      sector: 'Utilities',
      headquarters: 'Stockholm, Sweden',
      stage: 'Established',
      valuation: '~€4.8B',
      balticOperations: 'Swedish electricity distribution network',
      description: 'Major Swedish electricity distribution company',
      investmentType: 'Infrastructure Fund',
      tags: ['Electricity', 'Grid Infrastructure', 'Utilities']
    },
    {
      name: 'Baltic Workboats AS',
      sector: 'Maritime Services',
      headquarters: 'Tallinn, Estonia',
      stage: 'Mid-stage',
      valuation: '~€75M',
      balticOperations: 'Offshore wind support vessels',
      description: 'Specialized workboat operator for offshore wind projects',
      investmentType: 'Private Equity',
      tags: ['Offshore Support', 'Wind Energy', 'Marine Services']
    },
    {
      name: 'Gasum',
      sector: 'Energy',
      headquarters: 'Espoo, Finland',
      stage: 'Established',
      valuation: '~€2.1B',
      balticOperations: 'LNG terminals and gas supply network',
      description: 'Leading Nordic gas company with LNG infrastructure',
      investmentType: 'State Owned/Infrastructure',
      tags: ['LNG', 'Gas Infrastructure', 'Energy Transition']
    },
    {
      name: 'Baltic Sea Properties',
      sector: 'Real Estate',
      headquarters: 'Stockholm, Sweden',
      stage: 'Growth',
      valuation: '~€850M',
      balticOperations: 'Logistics and industrial properties',
      description: 'Specialized in Baltic logistics and port-adjacent real estate',
      investmentType: 'Real Estate Fund',
      tags: ['Logistics Real Estate', 'Industrial Properties', 'Port Infrastructure']
    }
  ];

  const sectors = [
    { id: 'all', name: 'All Sectors', icon: BarChart3 },
    { id: 'shipping', name: 'Shipping & Logistics', icon: Ship },
    { id: 'energy', name: 'Energy & Renewables', icon: Zap },
    { id: 'aquaculture', name: 'Aquaculture & Food', icon: Fish },
    { id: 'infrastructure', name: 'Infrastructure & Ports', icon: Factory },
    { id: 'industrial', name: 'Industrial & Manufacturing', icon: Building2 }
  ];

  const filteredPublicStocks = publicStocks.filter(stock => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = stock.company.toLowerCase().includes(searchLower) ||
                         stock.ticker.toLowerCase().includes(searchLower) ||
                         stock.exchange.toLowerCase().includes(searchLower);
    const matchesSector = selectedSector === 'all' || 
                         stock.sector.toLowerCase().includes(selectedSector.toLowerCase());
    return matchesSearch && matchesSector;
  });

  const filteredPrivateCompanies = privateCompanies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'all' || 
                         company.sector.toLowerCase().includes(selectedSector.toLowerCase());
    return matchesSearch && matchesSector;
  });

  const getSectorIcon = (sector: string) => {
    if (sector.includes('Shipping') || sector.includes('Ferry')) return Ship;
    if (sector.includes('Energy') || sector.includes('Renewable')) return Zap;
    if (sector.includes('Aquaculture') || sector.includes('Food')) return Fish;
    if (sector.includes('Port') || sector.includes('Infrastructure')) return Factory;
    return Building2;
  };

  // Merge real-time data with static company info
  const getMergedStockData = (stock: PublicStock): PublicStock & { lastUpdated?: string } => {
    const realTimeData = stockData.find(rt => rt.ticker === stock.ticker);
    if (realTimeData) {
      return {
        ...stock,
        price: realTimeData.price,
        change: realTimeData.change,
        changePercent: realTimeData.changePercent,
        trend: realTimeData.trend as 'up' | 'down' | 'neutral',
        marketCap: realTimeData.marketCap || stock.marketCap,
        lastUpdated: realTimeData.lastUpdated
      };
    }
    return stock;
  };

  const toggleCardExpansion = (index: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  const handleViewChart = (ticker: string, company: string) => {
    toast.info(`Opening chart for ${company} (${ticker})`, {
      description: "Chart functionality would redirect to financial data provider"
    });
  };

  const handleInvestmentAnalysis = (ticker: string, company: string) => {
    toast.info(`Opening investment analysis for ${company}`, {
      description: "Analysis would show detailed research report"
    });
  };

  const AnalyticalDataSection = ({ stock, index }: { stock: PublicStock; index: number }) => {
    const isExpanded = expandedCards.has(index);
    
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleCardExpansion(index)}
          className="w-full flex items-center justify-between p-2"
        >
          <span className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Financial Metrics
          </span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        
        {isExpanded && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-primary">Valuation Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">P/E Ratio:</span>
                  <span className="font-medium">{stock.analyticalData.peRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">P/B Ratio:</span>
                  <span className="font-medium">{stock.analyticalData.priceToBook}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">EPS:</span>
                  <span className="font-medium">{stock.analyticalData.eps}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-primary">Risk Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sharpe Ratio:</span>
                  <span className="font-medium">{stock.analyticalData.sharpeRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Beta:</span>
                  <span className="font-medium">{stock.analyticalData.beta}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Debt/Equity:</span>
                  <span className="font-medium">{stock.analyticalData.debtToEquity}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-primary">Profitability</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ROE:</span>
                  <span className="font-medium">{stock.analyticalData.roe}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Op. Margin:</span>
                  <span className="font-medium">{stock.analyticalData.operatingMargin}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dividend Yield:</span>
                  <span className="font-medium">{stock.analyticalData.dividendYield}%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-primary">Financial Health</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Ratio:</span>
                  <span className="font-medium">{stock.analyticalData.currentRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Free Cash Flow:</span>
                  <span className="font-medium">{stock.analyticalData.freeCashFlow}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenue (52w):</span>
                  <span className="font-medium">{stock.analyticalData.revenue52w}</span>
                </div>
              </div>
            </div>
            
            <div className="col-span-2 lg:col-span-4 pt-2 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Analyst Rating:</span>
                  <Badge variant={
                    stock.analyticalData.analystRating.includes('Buy') ? 'default' : 
                    stock.analyticalData.analystRating === 'Hold' ? 'secondary' : 'outline'
                  }>
                    {stock.analyticalData.analystRating}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price Target:</span>
                  <span className="font-medium">{stock.analyticalData.priceTarget}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Volume:</span>
                  <span className="font-medium">{stock.analyticalData.volumeAvg}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Baltic Sea Investment Universe</h2>
        <p className="text-muted-foreground mt-1">
          Comprehensive list of investment opportunities in the Baltic Sea region
        </p>
        
        {/* Real-time Data Status */}
        <div className="flex items-center gap-4 mt-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {loading ? 'Fetching real-time data...' : 
               lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 
               'Real-time data not available'}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Updating...' : 'Refresh Prices'}
          </Button>
          {stockData.length > 0 && (
            <Badge variant="secondary" className="bg-green-50 text-green-700">
              {stockData.length} live prices
            </Badge>
          )}
          {error && (
            <Badge variant="destructive">
              Error fetching data
            </Badge>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies, tickers, or exchanges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
            <div className="flex flex-wrap gap-2">
              {sectors.map((sector) => {
                const Icon = sector.icon;
                return (
                  <Button
                    key={sector.id}
                    variant={selectedSector === sector.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSector(sector.id)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {sector.name}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="public" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="public">Public Companies ({filteredPublicStocks.length})</TabsTrigger>
          <TabsTrigger value="private">Private Companies & Opportunities ({filteredPrivateCompanies.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="public" className="space-y-4">
          <div className="grid gap-4">
            {filteredPublicStocks.map((stock, index) => {
              const mergedStock = getMergedStockData(stock);
              const SectorIcon = getSectorIcon(mergedStock.sector);
              const isRealTime = stockData.some(rt => rt.ticker === stock.ticker);
              
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <SectorIcon className="h-5 w-5 text-primary" />
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg">{mergedStock.company}</CardTitle>
                              {isRealTime && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                                  LIVE
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="font-mono font-medium">{mergedStock.ticker}</span>
                              <span>•</span>
                              <span>{mergedStock.exchange}</span>
                              <span>•</span>
                              <MapPin className="h-3 w-3" />
                              <span>{mergedStock.headquarters}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{mergedStock.description}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-2xl font-bold">{mergedStock.price}</div>
                        <div className={`flex items-center gap-1 text-sm ${
                          mergedStock.trend === 'up' ? 'text-green-600' : 
                          mergedStock.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {mergedStock.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          <span>{mergedStock.change} ({mergedStock.changePercent})</span>
                        </div>
                        {isRealTime && mergedStock.lastUpdated && (
                          <div className="text-xs text-muted-foreground">
                            {new Date(mergedStock.lastUpdated).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Market Cap: </span>
                        <span className="font-medium">{mergedStock.marketCap}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sector: </span>
                        <span className="font-medium">{mergedStock.sector}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Baltic Exposure: </span>
                        <span className="font-medium">{mergedStock.balticExposure}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {mergedStock.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <AnalyticalDataSection stock={mergedStock} index={index} />
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={() => handleViewChart(mergedStock.ticker, mergedStock.company)}
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Chart
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleInvestmentAnalysis(mergedStock.ticker, mergedStock.company)}
                      >
                        Investment Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="private" className="space-y-4">
          <div className="grid gap-4">
            {filteredPrivateCompanies.map((company, index) => {
              const SectorIcon = getSectorIcon(company.sector);
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <SectorIcon className="h-5 w-5 text-primary" />
                          <div>
                            <CardTitle className="text-lg">{company.name}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{company.headquarters}</span>
                              <span>•</span>
                              <span>{company.stage}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{company.description}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-lg font-bold">{company.valuation}</div>
                        <Badge variant="outline">{company.investmentType}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Sector: </span>
                        <span className="font-medium">{company.sector}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Baltic Operations: </span>
                        <span className="font-medium">{company.balticOperations}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {company.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Investment Opportunity
                      </Button>
                      <Button size="sm" variant="outline">
                        Company Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{publicStocks.length}</div>
            <div className="text-xs text-muted-foreground">Public Companies</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{privateCompanies.length}</div>
            <div className="text-xs text-muted-foreground">Private Opportunities</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">~€285B</div>
            <div className="text-xs text-muted-foreground">Combined Market Cap</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">12</div>
            <div className="text-xs text-muted-foreground">Key Sectors</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BalticSeaInvestments;