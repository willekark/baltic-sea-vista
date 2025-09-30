-- Create RPC function for finding nearby AIS positions
-- Used by correlation and scoring functions

CREATE OR REPLACE FUNCTION public.find_nearby_ais(
  target_lat DOUBLE PRECISION,
  target_lon DOUBLE PRECISION,
  radius_m DOUBLE PRECISION,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ
)
RETURNS TABLE (
  mmsi BIGINT,
  ts TIMESTAMPTZ,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  sog DOUBLE PRECISION,
  cog DOUBLE PRECISION,
  vessel_type TEXT,
  vessel_name TEXT,
  draught DOUBLE PRECISION,
  distance_m DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.mmsi,
    a.ts,
    a.lat,
    a.lon,
    a.sog,
    a.cog,
    a.vessel_type,
    a.vessel_name,
    a.draught,
    ST_Distance(
      a.geom,
      ST_SetSRID(ST_MakePoint(target_lon, target_lat), 4326)::geography
    ) as distance_m
  FROM public.ais_positions a
  WHERE 
    a.ts >= start_time
    AND a.ts <= end_time
    AND ST_DWithin(
      a.geom,
      ST_SetSRID(ST_MakePoint(target_lon, target_lat), 4326)::geography,
      radius_m
    )
  ORDER BY distance_m ASC
  LIMIT 50;
END;
$$;