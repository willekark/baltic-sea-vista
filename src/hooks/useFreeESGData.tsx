import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ESGDataOptions {
  dataTypes?: string[];
  region?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useFreeESGData = (options: ESGDataOptions = {}) => {
  const {
    dataTypes = ['environmental', 'social', 'governance'],
    region = 'baltic',
    autoRefresh = false,
    refreshInterval = 300000 // 5 minutes
  } = options;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchESGData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching free ESG data:', { dataTypes, region });

      const { data: response, error: fetchError } = await supabase.functions.invoke('free-esg-data-service', {
        body: { 
          dataTypes,
          region
        }
      });

      if (fetchError) {
        throw new Error(fetchError.message || 'Failed to fetch ESG data');
      }

      if (response?.success) {
        setData(response.data);
        setLastUpdated(new Date());
        console.log('Free ESG data fetched successfully:', response.data);
      } else {
        throw new Error(response?.error || 'Invalid response from ESG service');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error fetching free ESG data:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchESGData();
  }, [region, JSON.stringify(dataTypes)]);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchESGData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const refresh = () => {
    fetchESGData();
  };

  // Helper functions to extract specific data
  const getEnvironmentalMetrics = () => {
    if (!data?.environmental) return null;
    
    return {
      co2Emissions: data.environmental.co2Emissions || {},
      renewableEnergy: data.environmental.renewableEnergy || {},
      summary: data.environmental.summary || {}
    };
  };

  const getSocialMetrics = () => {
    if (!data?.social) return null;
    
    return {
      employment: data.social.employment || {},
      education: data.social.education || {},
      health: data.social.health || {},
      humanRights: data.social.humanRights || {}
    };
  };

  const getGovernanceMetrics = () => {
    if (!data?.governance) return null;
    
    return {
      transparency: data.governance.transparency || {},
      accountability: data.governance.accountability || {},
      businessEnvironment: data.governance.businessEnvironment || {},
      digitalGovernance: data.governance.digitalGovernance || {}
    };
  };

  // Get data quality metrics
  const getDataQuality = () => {
    return {
      sources: data?.metadata?.sources || [],
      lastUpdated: data?.metadata?.lastUpdated || null,
      coverage: data?.metadata?.coverage || region,
      quality: data?.metadata?.dataQuality || 'unknown'
    };
  };

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    
    // Helper functions
    getEnvironmentalMetrics,
    getSocialMetrics,
    getGovernanceMetrics,
    getDataQuality,
    
    // Status flags
    hasData: !!data,
    hasEnvironmentalData: !!data?.environmental,
    hasSocialData: !!data?.social,
    hasGovernanceData: !!data?.governance
  };
};