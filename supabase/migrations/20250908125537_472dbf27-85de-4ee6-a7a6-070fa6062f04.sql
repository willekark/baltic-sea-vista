-- Create comprehensive schema for ERDDAP oceanographic data
-- Raw observations from ERDDAP datasets
CREATE TABLE IF NOT EXISTS public.oceanographic_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  location_lat DOUBLE PRECISION NOT NULL,
  location_lng DOUBLE PRECISION NOT NULL,
  variable_name TEXT NOT NULL,
  value DOUBLE PRECISION,
  unit TEXT,
  depth_m DOUBLE PRECISION,
  quality_flag TEXT DEFAULT 'good',
  confidence_score REAL DEFAULT 1.0,
  platform_id TEXT,
  mission_id TEXT,
  source TEXT DEFAULT 'voice_of_ocean',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(dataset_id, timestamp, variable_name, location_lat, location_lng, depth_m)
);

-- Enable RLS
ALTER TABLE public.oceanographic_observations ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Oceanographic observations are publicly readable" 
ON public.oceanographic_observations 
FOR SELECT 
USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_obs_dataset_time ON public.oceanographic_observations(dataset_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_obs_location ON public.oceanographic_observations(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_obs_variable ON public.oceanographic_observations(variable_name);
CREATE INDEX IF NOT EXISTS idx_obs_timestamp ON public.oceanographic_observations(timestamp DESC);

-- Dataset catalog with metadata
CREATE TABLE IF NOT EXISTS public.erddap_datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  institution TEXT,
  variables JSONB DEFAULT '[]',
  temporal_coverage JSONB DEFAULT '{}',
  spatial_coverage JSONB DEFAULT '{}',
  data_quality TEXT DEFAULT 'good',
  deployment_type TEXT DEFAULT 'real-time',
  platform_type TEXT,
  license TEXT,
  last_updated TIMESTAMPTZ DEFAULT now(),
  confidence_score REAL DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.erddap_datasets ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "ERDDAP datasets are publicly readable" 
ON public.erddap_datasets 
FOR SELECT 
USING (true);

-- Baltic Sea indices and indicators
CREATE TABLE IF NOT EXISTS public.baltic_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_type TEXT NOT NULL, -- 'baltic_oxygen_index', 'salinity_stress_index', 'surface_temp_anomaly', 'hypoxia_risk'
  region TEXT DEFAULT 'baltic_sea',
  bbox JSONB, -- spatial bounds
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  confidence REAL DEFAULT 1.0,
  methodology TEXT,
  data_sources JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.baltic_indicators ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Baltic indicators are publicly readable" 
ON public.baltic_indicators 
FOR SELECT 
USING (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_indicators_type_period ON public.baltic_indicators(indicator_type, period_start, period_end);

-- Intelligence alerts system
CREATE TABLE IF NOT EXISTS public.intelligence_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL, -- 'hypoxia_risk', 'temperature_anomaly', 'salinity_extreme', 'data_quality'
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status TEXT DEFAULT 'active', -- 'active', 'resolved', 'acknowledged'
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  bbox JSONB,
  trigger_conditions JSONB DEFAULT '{}',
  trigger_data JSONB DEFAULT '{}',
  affected_datasets JSONB DEFAULT '[]',
  notification_channels JSONB DEFAULT '[]',
  triggered_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.intelligence_alerts ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Intelligence alerts are publicly readable" 
ON public.intelligence_alerts 
FOR SELECT 
USING (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_alerts_status_severity ON public.intelligence_alerts(status, severity);
CREATE INDEX IF NOT EXISTS idx_alerts_location ON public.intelligence_alerts(location_lat, location_lng);

-- Quality assessment results
CREATE TABLE IF NOT EXISTS public.data_quality_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id TEXT NOT NULL,
  assessment_period_start TIMESTAMPTZ NOT NULL,
  assessment_period_end TIMESTAMPTZ NOT NULL,
  overall_score REAL DEFAULT 1.0,
  completeness_score REAL DEFAULT 1.0,
  accuracy_score REAL DEFAULT 1.0,
  temporal_continuity_score REAL DEFAULT 1.0,
  spatial_coverage_score REAL DEFAULT 1.0,
  quality_flags JSONB DEFAULT '{}',
  assessment_details JSONB DEFAULT '{}',
  computed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.data_quality_assessments ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Data quality assessments are publicly readable" 
ON public.data_quality_assessments 
FOR SELECT 
USING (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_quality_dataset_period ON public.data_quality_assessments(dataset_id, assessment_period_start);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_erddap_datasets_updated_at
  BEFORE UPDATE ON public.erddap_datasets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_intelligence_alerts_updated_at
  BEFORE UPDATE ON public.intelligence_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();