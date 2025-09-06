import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StockData, PortfolioMetrics } from '@/utils/balticFinancialCalculations';

interface UseBalticStockDataProps {
  symbols?: string[];
  refreshInterval?: number;
  includePortfolioMetrics?: boolean;
}

interface BalticStockDataResponse {
  success: boolean;
  data: StockData[];
  portfolioMetrics?: PortfolioMetrics;
  executiveSummary?: {
    totalMarketCap: string;
    performance: string;
    dataQuality: string;
    lastUpdated: string;
    exchangeRates: { [currency: string]: number };
  };
  errors?: string[];
  timestamp: string;
  providers: string[];
}

export const useBalticStockData = ({
  symbols = ['MAERSK-B.CO', 'EQNR', 'ORSTED.CO', 'NESTE.HE', 'VWS.CO', 'DFDS.CO'],
  refreshInterval = 5 * 60 * 1000, // 5 minutes
  includePortfolioMetrics = true
}: UseBalticStockDataProps = {}) => {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetrics | null>(null);
  const [executiveSummary, setExecutiveSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [dataQuality, setDataQuality] = useState<string>('');

  const fetchStockData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching Baltic stock data for symbols:', symbols);

      const { data, error: supabaseError } = await supabase.functions.invoke('baltic-stock-data-service', {
        body: { 
          symbols,
          includePortfolioMetrics
        }
      });

      if (supabaseError) {
        throw new Error(`Supabase error: ${supabaseError.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch stock data');
      }

      const response: BalticStockDataResponse = data;

      setStockData(response.data || []);
      setPortfolioMetrics(response.portfolioMetrics || null);
      setExecutiveSummary(response.executiveSummary || null);
      setLastUpdated(response.timestamp);
      setDataQuality(response.executiveSummary?.dataQuality || '');

      // Show errors if any stocks failed to load
      if (response.errors && response.errors.length > 0) {
        console.warn('Some stocks had limited data availability:', response.errors);
        
        // Only show toast if we have no data at all
        if (response.data.length === 0) {
          toast.error('No stock data available from any provider');
        } else if (response.data.length < symbols.length) {
          toast.warning(`Limited data: ${response.data.length}/${symbols.length} stocks loaded`);
        }
      } else {
        toast.success(`Stock data updated: ${response.data.length} stocks loaded`);
      }

      console.log('Successfully fetched stock data:', {
        stocks: response.data.length,
        errors: response.errors?.length || 0,
        providers: response.providers
      });

    } catch (error) {
      console.error('Failed to fetch Baltic stock data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      toast.error('Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  }, [symbols, includePortfolioMetrics]);

  // Initial fetch
  useEffect(() => {
    fetchStockData();
  }, [fetchStockData]);

  // Set up periodic refresh
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(fetchStockData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchStockData, refreshInterval]);

  const refresh = useCallback(() => {
    fetchStockData();
  }, [fetchStockData]);

  return {
    stockData,
    portfolioMetrics,
    executiveSummary,
    loading,
    error,
    lastUpdated,
    dataQuality,
    refresh
  };
};

export default useBalticStockData;