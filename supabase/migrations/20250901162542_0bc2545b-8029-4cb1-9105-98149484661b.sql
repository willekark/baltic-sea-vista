-- Create tables for caching real-time data from external sources
CREATE TABLE IF NOT EXISTS public.data_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  data_type TEXT NOT NULL,
  cached_data JSONB NOT NULL,
  cache_key TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.data_cache ENABLE ROW LEVEL SECURITY;

-- Create policy for reading cached data
CREATE POLICY "Data cache is publicly readable" 
ON public.data_cache 
FOR SELECT 
USING (true);

-- Create index for efficient cache lookups
CREATE INDEX idx_data_cache_key ON public.data_cache (cache_key);
CREATE INDEX idx_data_cache_expires ON public.data_cache (expires_at);

-- Create table for real-time market data
CREATE TABLE IF NOT EXISTS public.market_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  exchange TEXT NOT NULL,
  price DECIMAL(15,4),
  change_percent DECIMAL(8,4),
  volume BIGINT,
  market_cap BIGINT,
  currency TEXT NOT NULL DEFAULT 'EUR',
  sector TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for market data
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Market data is publicly readable"
ON public.market_data
FOR SELECT
USING (true);

-- Create indexes for market data
CREATE INDEX idx_market_data_symbol ON public.market_data (symbol);
CREATE INDEX idx_market_data_timestamp ON public.market_data (timestamp DESC);

-- Create table for real regulatory feeds
CREATE TABLE IF NOT EXISTS public.regulatory_feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  regulation_type TEXT NOT NULL,
  source_authority TEXT NOT NULL,
  effective_date DATE,
  impact_level TEXT NOT NULL,
  sectors TEXT[] DEFAULT '{}',
  url TEXT,
  content JSONB DEFAULT '{}',
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for regulatory feeds
ALTER TABLE public.regulatory_feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Regulatory feeds are publicly readable"
ON public.regulatory_feeds
FOR SELECT
USING (true);

-- Create index for regulatory feeds
CREATE INDEX idx_regulatory_feeds_published ON public.regulatory_feeds (published_at DESC);
CREATE INDEX idx_regulatory_feeds_type ON public.regulatory_feeds (regulation_type);