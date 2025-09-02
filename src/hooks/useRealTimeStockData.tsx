import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RealTimeStockData {
  ticker: string;
  company: string;
  exchange: string;
  price: string;
  change: string;
  changePercent: string;
  trend: 'up' | 'down' | 'neutral';
  volume: string;
  avgVolume: string;
  open: string;
  high: string;
  low: string;
  previousClose: string;
  currency: string;
  lastUpdated: string;
  marketCap?: string;
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
  refreshInterval?: number; // in milliseconds
  includeProfile?: boolean;
}

export const useRealTimeStockData = ({ 
  tickers, 
  refreshInterval = 60000, // 1 minute default 
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
      console.log('Fetching real-time stock data for:', tickers);
      
      const { data, error: functionError } = await supabase.functions.invoke('real-time-stock-data', {
        body: {
          tickers: tickers.join(','),
          includeProfile
        }
      });

      console.log('Function response:', data);

      if (functionError) {
        throw new Error(`Function error: ${functionError.message}`);
      }

      if (data?.success) {
        setStockData(data.data || []);
        setLastUpdated(new Date());
        
        if (data.fetchedCount < data.requestedCount) {
          toast.warning(`Retrieved ${data.fetchedCount} out of ${data.requestedCount} stocks`, {
            description: 'Some stocks may not be available or have rate limits'
          });
        } else if (data.fetchedCount > 0) {
          toast.success(`Updated ${data.fetchedCount} stock prices`);
        }
        
        console.log(`Successfully fetched ${data.fetchedCount} stock prices`);
      } else {
        throw new Error(data?.error || 'Failed to fetch stock data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching real-time stock data:', err);
      
      toast.error('Failed to fetch real-time stock data', {
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