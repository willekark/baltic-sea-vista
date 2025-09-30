import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Alert {
  id: string;
  type: string;
  score: number;
  priority: number;
  mmsi?: number;
  detection_id?: string;
  summary: string;
  details: any;
  alert_time: string;
  lat?: number;
  lon?: number;
  status: string;
}

export interface VesselTrack {
  mmsi: number;
  vessel_name?: string;
  vessel_type?: string;
  points: Array<{
    timestamp: string;
    lat: number;
    lon: number;
    sog: number;
    cog: number;
  }>;
}

export interface SARDetection {
  id: string;
  scene_id: string;
  acq_time: string;
  lat: number;
  lon: number;
  est_length_m: number;
  rcs_db: number;
  confidence: number;
  matched_mmsi?: number;
}

/**
 * Hook to fetch shadow fleet alerts
 */
export function useShadowFleetAlerts(options?: {
  since?: string;
  type?: string;
  minScore?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ['shadow-fleet-alerts', options],
    queryFn: async () => {
      let query = supabase
        .from('shadow_fleet_alerts_v2')
        .select('*')
        .eq('status', options?.status || 'active')
        .order('alert_time', { ascending: false })
        .limit(500);
      
      if (options?.since) {
        query = query.gte('alert_time', options.since);
      }
      
      if (options?.type) {
        query = query.eq('type', options.type);
      }
      
      if (options?.minScore) {
        query = query.gte('score', options.minScore);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data || []) as Alert[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

/**
 * Hook to fetch vessel track
 */
export function useVesselTrack(
  mmsi: number | null,
  options?: {
    since?: string;
    until?: string;
  }
) {
  return useQuery({
    queryKey: ['vessel-track', mmsi, options],
    queryFn: async () => {
      if (!mmsi) return null;
      
      const since = options?.since || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const until = options?.until || new Date().toISOString();
      
      const { data, error } = await supabase
        .from('ais_positions')
        .select('*')
        .eq('mmsi', mmsi)
        .gte('ts', since)
        .lte('ts', until)
        .order('ts', { ascending: true })
        .limit(5000);
      
      if (error) throw error;
      
      if (!data || data.length === 0) return null;
      
      return {
        mmsi,
        vessel_name: data[0].vessel_name,
        vessel_type: data[0].vessel_type,
        points: data.map(p => ({
          timestamp: p.ts,
          lat: p.lat,
          lon: p.lon,
          sog: p.sog,
          cog: p.cog,
        }))
      } as VesselTrack;
    },
    enabled: !!mmsi,
  });
}

/**
 * Hook to fetch SAR detections
 */
export function useSARDetections(options?: {
  sceneId?: string;
  since?: string;
  unmatched?: boolean;
}) {
  return useQuery({
    queryKey: ['sar-detections', options],
    queryFn: async () => {
      let query = supabase
        .from('sar_detections')
        .select('*')
        .order('acq_time', { ascending: false })
        .limit(1000);
      
      if (options?.sceneId) {
        query = query.eq('scene_id', options.sceneId);
      }
      
      if (options?.since) {
        query = query.gte('acq_time', options.since);
      }
      
      if (options?.unmatched) {
        query = query.is('matched_mmsi', null);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data || []) as SARDetection[];
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

/**
 * Hook to run correlation
 */
export function useRunCorrelation() {
  return async (options?: { since?: string; until?: string }) => {
    const { data, error } = await supabase.functions.invoke('ais-sar-correlation', {
      body: options || {}
    });
    
    if (error) throw error;
    return data;
  };
}

/**
 * Hook to calculate scores
 */
export function useCalculateScores() {
  return async (mmsi?: number) => {
    const { data, error } = await supabase.functions.invoke('shadow-fleet-scoring', {
      body: mmsi ? { mmsi } : {}
    });
    
    if (error) throw error;
    return data;
  };
}
