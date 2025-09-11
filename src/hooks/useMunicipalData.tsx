import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MunicipalEnergyData {
  year: number;
  sector: 'households' | 'industry' | 'transport' | 'services' | 'dh_losses';
  consumption_gwh: number;
  heat_share_pct: number | null;
  elec_share_pct: number | null;
  source: string;
  source_status?: string;
}

interface SectorShareData {
  year: number;
  households_pct: number;
  industry_pct: number;
  transport_pct: number;
  services_pct: number;
  dh_losses_pct: number;
  source: string;
}

interface PeakClashData {
  clash_score: number;
  peak_hours_local: string[];
  method: string;
  source: string;
}

export const useMunicipalEnergy = (geoId: string = 'SE0114', years: string = '2019-2024') => {
  const [data, setData] = useState<MunicipalEnergyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: result, error } = await supabase.functions.invoke('municipal-energy', {
          body: { geo_id: geoId, years }
        });

        if (error) throw error;
        setData(result || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch municipal energy data');
        console.error('Municipal energy fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh every hour
    const interval = setInterval(fetchData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [geoId, years]);

  return { data, loading, error };
};

export const useMunicipalSectorShare = (geoId: string = 'SE0114', years: string = '2019-2024') => {
  const [data, setData] = useState<SectorShareData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: result, error } = await supabase.functions.invoke('municipal-energy/sector-share', {
          body: { geo_id: geoId, years }
        });

        if (error) throw error;
        setData(result || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch sector share data');
        console.error('Sector share fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh every hour
    const interval = setInterval(fetchData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [geoId, years]);

  return { data, loading, error };
};

export const useMunicipalPeaks = (geoId: string = 'SE0114') => {
  const [data, setData] = useState<PeakClashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: result, error } = await supabase.functions.invoke('municipal-peaks', {
          body: { geo_id: geoId }
        });

        if (error) throw error;
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch peak clash data');
        console.error('Peak clash fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh every 30 minutes for peaks
    const interval = setInterval(fetchData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [geoId]);

  return { data, loading, error };
};