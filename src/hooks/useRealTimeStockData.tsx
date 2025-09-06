import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RealTimeStockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  volume: number;
  marketCap?: string;
  pe?: number;
  dividend?: number;
  timestamp: string;
  source: string;
  // Legacy fields for compatibility
  ticker?: string;
  company?: string;
  exchange?: string;
  trend?: 'up' | 'down' | 'neutral';
  avgVolume?: string;
  open?: string;
  high?: string;
  low?: string;
  previousClose?: string;
  lastUpdated?: string;
  sector?: string;
  industry?: string;
  description?: string;
  employees?: string;
  website?: string;
  ceo?: string;
  country?: string;
}

interface UseRealTimeStockDataProps {
  tickers: string[];
  refreshInterval?: number;
  includeProfile?: boolean;
}

export const useRealTimeStockData = ({ 
  tickers, 
  refreshInterval = 60000,
  includeProfile = false 
}: UseRealTimeStockDataProps) => {
  const [stockData, setStockData] = useState<RealTimeStockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStockData = async () => {
    if (tickers.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching multi-provider stock data for:', tickers);
      
      const { data, error: functionError } = await supabase.functions.invoke('multi-provider-stock-data', {
        body: {
          symbols: tickers,
          includeProfile
        }
      });

      console.log('Function response:', data);

      if (functionError) {
        throw new Error(`Function error: ${functionError.message}`);
      }

      if (data?.success) {
        const stocksWithCompatibility = (data.data || []).map((stock: any) => ({
          ...stock,
          // Add compatibility fields
          ticker: stock.symbol,
          company: stock.name,
          trend: stock.change > 0 ? 'up' : stock.change < 0 ? 'down' : 'neutral',
          lastUpdated: stock.timestamp
        }));
        
        setStockData(stocksWithCompatibility);
        setLastUpdated(new Date());
        
        const fetchedCount = data.data?.length || 0;
        const requestedCount = tickers.length;
        
        if (fetchedCount < requestedCount) {
          toast.warning(`Retrieved ${fetchedCount} out of ${requestedCount} stocks`, {
            description: 'Some stocks may not be available or have rate limits'
          });
        } else if (fetchedCount > 0) {
          toast.success(`Updated ${fetchedCount} stock prices from ${data.providers?.join(', ') || 'multiple sources'}`);
        }
        
        console.log(`Successfully fetched ${fetchedCount} stock prices`);
      } else {
        throw new Error(data?.error || 'Failed to fetch stock data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching multi-provider stock data:', err);
      
      toast.error('Failed to fetch stock data', {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStockData();
  }, [tickers.join(','), includeProfile]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval <= 0) return;
    
    const interval = setInterval(() => {
      fetchStockData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, tickers.join(','), includeProfile]);

  // Manual refresh function
  const refresh = () => {
    fetchStockData();
  };

  return {
    stockData,
    loading,
    error,
    lastUpdated,
    refresh
  };
};