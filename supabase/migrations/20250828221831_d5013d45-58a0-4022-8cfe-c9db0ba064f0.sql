-- Create CO2 emissions data table for tracking atmospheric and maritime emissions
CREATE TABLE public.co2_emissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  location_lat DOUBLE PRECISION NOT NULL,
  location_lng DOUBLE PRECISION NOT NULL,
  source TEXT NOT NULL, -- 'socat', 'copernicus', 'icos', 'satellite'
  data_type TEXT NOT NULL, -- 'pco2_water', 'co2_flux', 'atmospheric_co2', 'ship_plume'
  value DOUBLE PRECISION NOT NULL,
  unit TEXT NOT NULL, -- 'ppm', 'μmol/kg', 'mmol/m²/day', etc.
  quality_flag TEXT DEFAULT 'good',
  vessel_id UUID, -- Link to vessels table when detecting ship plumes
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_co2_emissions_timestamp ON public.co2_emissions(timestamp);
CREATE INDEX idx_co2_emissions_location ON public.co2_emissions(location_lat, location_lng);
CREATE INDEX idx_co2_emissions_source ON public.co2_emissions(source);
CREATE INDEX idx_co2_emissions_vessel ON public.co2_emissions(vessel_id);

-- Enable RLS
ALTER TABLE public.co2_emissions ENABLE ROW LEVEL SECURITY;

-- Create policy for public access to CO2 data
CREATE POLICY "CO2 emissions data is publicly readable" 
ON public.co2_emissions 
FOR SELECT 
USING (true);

-- Create table for emissions analysis results
CREATE TABLE public.emissions_anomalies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID,
  anomaly_type TEXT NOT NULL, -- 'excess_emissions', 'missing_plume', 'dark_zone_emissions'
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  location_lat DOUBLE PRECISION NOT NULL,
  location_lng DOUBLE PRECISION NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  expected_emissions DOUBLE PRECISION,
  actual_emissions DOUBLE PRECISION,
  deviation_percent DOUBLE PRECISION,
  analysis_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active', -- 'active', 'investigating', 'resolved'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for emissions anomalies
CREATE INDEX idx_emissions_anomalies_vessel ON public.emissions_anomalies(vessel_id);
CREATE INDEX idx_emissions_anomalies_detected ON public.emissions_anomalies(detected_at);
CREATE INDEX idx_emissions_anomalies_severity ON public.emissions_anomalies(severity);

-- Enable RLS for emissions anomalies
ALTER TABLE public.emissions_anomalies ENABLE ROW LEVEL SECURITY;

-- Create policy for public access to emissions anomalies
CREATE POLICY "Emissions anomalies are publicly readable" 
ON public.emissions_anomalies 
FOR SELECT 
USING (true);