-- Create cache_entries table for API response caching
CREATE TABLE IF NOT EXISTS public.cache_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cache_entries_key ON public.cache_entries(key);
CREATE INDEX IF NOT EXISTS idx_cache_entries_expires_at ON public.cache_entries(expires_at);

-- Enable RLS
ALTER TABLE public.cache_entries ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage cache
CREATE POLICY "Service role can manage cache entries" 
ON public.cache_entries 
FOR ALL 
USING (true);

-- Create cleanup function for expired entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.cache_entries WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;