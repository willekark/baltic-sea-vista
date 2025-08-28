-- Create comprehensive Baltic Sea monitoring database schema

-- Main environmental monitoring data table
CREATE TABLE public.environmental_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL, -- 'copernicus', 'noaa', 'esa', etc.
  data_type TEXT NOT NULL, -- 'temperature', 'salinity', 'oxygen', etc.
  location_lat FLOAT NOT NULL,
  location_lng FLOAT NOT NULL,
  location_name TEXT,
  value FLOAT NOT NULL,
  unit TEXT NOT NULL,
  quality_flag TEXT DEFAULT 'good',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Shipping and vessel data
CREATE TABLE public.shipping_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id TEXT NOT NULL,
  vessel_name TEXT,
  vessel_type TEXT,
  mmsi INTEGER,
  imo INTEGER,
  location_lat FLOAT NOT NULL,
  location_lng FLOAT NOT NULL,
  speed FLOAT,
  course FLOAT,
  heading FLOAT,
  status TEXT,
  destination TEXT,
  eta TIMESTAMP WITH TIME ZONE,
  draught FLOAT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  source TEXT NOT NULL DEFAULT 'ais',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fisheries and biological data
CREATE TABLE public.fisheries_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  species TEXT NOT NULL,
  catch_area TEXT NOT NULL,
  catch_weight FLOAT,
  catch_count INTEGER,
  stock_assessment TEXT,
  fishing_method TEXT,
  vessel_country TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  year INTEGER NOT NULL,
  quarter INTEGER,
  source TEXT NOT NULL, -- 'ices', 'fao', etc.
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Water quality monitoring
CREATE TABLE public.water_quality (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id TEXT NOT NULL,
  station_name TEXT,
  location_lat FLOAT NOT NULL,
  location_lng FLOAT NOT NULL,
  depth FLOAT,
  oxygen FLOAT,
  salinity FLOAT,
  temperature FLOAT,
  ph FLOAT,
  nitrates FLOAT,
  phosphates FLOAT,
  chlorophyll FLOAT,
  turbidity FLOAT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  source TEXT NOT NULL, -- 'helcom', 'smhi', 'emodnet'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Environmental incidents and alerts
CREATE TABLE public.environmental_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_type TEXT NOT NULL, -- 'oil_spill', 'algal_bloom', 'dead_zone', etc.
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  location_lat FLOAT NOT NULL,
  location_lng FLOAT NOT NULL,
  area_affected FLOAT, -- in km²
  description TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'resolved', 'monitoring'
  reported_at TIMESTAMP WITH TIME ZONE NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  source TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Data aggregation summaries for dashboard
CREATE TABLE public.data_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  indicator_type TEXT NOT NULL, -- 'oxygen_levels', 'temperature', 'shipping_intensity', etc.
  current_value FLOAT NOT NULL,
  previous_value FLOAT,
  change_percent FLOAT,
  trend TEXT NOT NULL, -- 'up', 'down', 'stable'
  status TEXT NOT NULL, -- 'excellent', 'good', 'warning', 'critical'
  region TEXT DEFAULT 'baltic_sea',
  calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(indicator_type, region, calculation_date)
);

-- Create indexes for performance
CREATE INDEX idx_environmental_data_location ON public.environmental_data(location_lat, location_lng);
CREATE INDEX idx_environmental_data_timestamp ON public.environmental_data(timestamp DESC);
CREATE INDEX idx_environmental_data_type ON public.environmental_data(data_type, source);

CREATE INDEX idx_shipping_data_location ON public.shipping_data(location_lat, location_lng);
CREATE INDEX idx_shipping_data_timestamp ON public.shipping_data(timestamp DESC);
CREATE INDEX idx_shipping_data_vessel ON public.shipping_data(vessel_id);

CREATE INDEX idx_water_quality_location ON public.water_quality(location_lat, location_lng);
CREATE INDEX idx_water_quality_timestamp ON public.water_quality(timestamp DESC);
CREATE INDEX idx_water_quality_station ON public.water_quality(station_id);

CREATE INDEX idx_fisheries_data_species ON public.fisheries_data(species);
CREATE INDEX idx_fisheries_data_year ON public.fisheries_data(year DESC);

CREATE INDEX idx_incidents_location ON public.environmental_incidents(location_lat, location_lng);
CREATE INDEX idx_incidents_type ON public.environmental_incidents(incident_type, status);

CREATE INDEX idx_summaries_indicator ON public.data_summaries(indicator_type, calculation_date DESC);

-- Enable Row Level Security
ALTER TABLE public.environmental_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fisheries_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_quality ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environmental_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_summaries ENABLE ROW LEVEL SECURITY;

-- Create public read policies (data is open/public)
CREATE POLICY "Environmental data is publicly readable" 
ON public.environmental_data FOR SELECT 
USING (true);

CREATE POLICY "Shipping data is publicly readable" 
ON public.shipping_data FOR SELECT 
USING (true);

CREATE POLICY "Fisheries data is publicly readable" 
ON public.fisheries_data FOR SELECT 
USING (true);

CREATE POLICY "Water quality data is publicly readable" 
ON public.water_quality FOR SELECT 
USING (true);

CREATE POLICY "Environmental incidents are publicly readable" 
ON public.environmental_incidents FOR SELECT 
USING (true);

CREATE POLICY "Data summaries are publicly readable" 
ON public.data_summaries FOR SELECT 
USING (true);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_environmental_data_updated_at
  BEFORE UPDATE ON public.environmental_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_summaries_updated_at
  BEFORE UPDATE ON public.data_summaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();