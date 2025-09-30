-- Fix function search_path security issue
CREATE OR REPLACE FUNCTION update_geom_from_lat_lon()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.geom := ST_SetSRID(ST_MakePoint(NEW.lon, NEW.lat), 4326)::geography;
  RETURN NEW;
END;
$$;

-- Enable RLS on cache_entries if it exists and isn't enabled
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'cache_entries'
  ) THEN
    ALTER TABLE public.cache_entries ENABLE ROW LEVEL SECURITY;
    
    -- Add public read policy if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'cache_entries' 
      AND policyname = 'Cache entries are publicly readable'
    ) THEN
      CREATE POLICY "Cache entries are publicly readable"
        ON public.cache_entries FOR SELECT USING (true);
    END IF;
  END IF;
END $$;