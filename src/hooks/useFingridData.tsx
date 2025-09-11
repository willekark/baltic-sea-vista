import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LoadData {
  ts: string;
  load_mw: number;
  source: string;
}

interface GenerationMixData {
  ts: string;
  fuel_type: 'wind_offshore' | 'wind_onshore' | 'solar' | 'hydro' | 'biomass' | 'nuclear' | 'fossil';
  gen_mw: number;
}

interface WindForecastData {
  ts: string;
  forecast_mw: number;
  source: string;
}

interface EnergyKPIs {
  avg_price_eur_mwh: number;
  offshore_wind_mw: number;
  ops_coverage_pct: number;
  green_fuel_ports: number;
  last_updated_utc: string;
  source_status: string;
}

export const useFingridLoad = (zone: string = 'FI', range: string = '24h') => {
  const [data, setData] = useState<LoadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: result, error } = await supabase.functions.invoke('fingrid-energy-load', {
          body: { zone, range }
        });

        if (error) throw error;
        setData(result || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [zone, range]);

  return { data, loading, error };
};

export const useFingridGenerationMix = (zone: string = 'FI', range: string = '24h') => {
  const [data, setData] = useState<GenerationMixData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: result, error } = await supabase.functions.invoke('fingrid-generation-mix', {
          body: { zone, range }
        });

        if (error) throw error;
        setData(result || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch generation mix data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [zone, range]);

  return { data, loading, error };
};

export const useFingridWindForecast = (zone: string = 'FI', horizon: string = '48h') => {
  const [data, setData] = useState<WindForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: result, error } = await supabase.functions.invoke('fingrid-wind-forecast', {
          body: { zone, horizon }
        });

        if (error) throw error;
        setData(result || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch wind forecast data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh every 7 minutes
    const interval = setInterval(fetchData, 7 * 60 * 1000);
    return () => clearInterval(interval);
  }, [zone, horizon]);

  return { data, loading, error };
};

export const useFingridKPIs = () => {
  const [data, setData] = useState<EnergyKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: result, error } = await supabase.functions.invoke('fingrid-energy-kpis');

        if (error) throw error;
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch KPIs');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
};