-- Ecological Reporting System Database Schema

-- Municipal boundaries and business sites
CREATE TABLE public.municipalities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country_code TEXT NOT NULL DEFAULT 'SE',
  basin TEXT NOT NULL DEFAULT 'baltic_proper',
  geometry JSONB NOT NULL, -- GeoJSON polygon
  population INTEGER,
  coastal_length_km DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.business_sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  site_type TEXT NOT NULL, -- industrial, marina, port, etc.
  municipality_id UUID REFERENCES public.municipalities(id),
  location_lat DOUBLE PRECISION NOT NULL,
  location_lng DOUBLE PRECISION NOT NULL,
  basin TEXT NOT NULL DEFAULT 'baltic_proper',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Administrative flags for compliance tracking
CREATE TABLE public.entity_compliance_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('municipality', 'site')),
  entity_id UUID NOT NULL,
  
  -- Framework participation flags
  cdp_participant BOOLEAN DEFAULT false,
  secap_participant BOOLEAN DEFAULT false,
  green_city_accord BOOLEAN DEFAULT false,
  iso37120_certified BOOLEAN DEFAULT false,
  
  -- Adaptation planning
  has_adaptation_plan BOOLEAN DEFAULT false,
  adaptation_plan_year INTEGER,
  
  -- Supporting documents
  documents JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(entity_type, entity_id)
);

-- Ecological metrics data (aggregated by entity and time period)
CREATE TABLE public.ecological_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('municipality', 'site')),
  entity_id UUID NOT NULL,
  metric_name TEXT NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('quarter', 'year')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Metric values
  value DOUBLE PRECISION NOT NULL,
  anomaly_score DOUBLE PRECISION, -- z-score vs climatology
  confidence DOUBLE PRECISION DEFAULT 1.0, -- 0-1 quality indicator
  
  -- Metadata
  data_source TEXT NOT NULL,
  basin TEXT NOT NULL,
  processing_method TEXT,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(entity_type, entity_id, metric_name, period_start, period_end)
);

-- Computed ecological scores
CREATE TABLE public.ecological_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('municipality', 'site')),
  entity_id UUID NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('quarter', 'year')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Overall score and pillars
  overall_score DOUBLE PRECISION NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  eutrophication_pressure DOUBLE PRECISION CHECK (eutrophication_pressure >= 0 AND eutrophication_pressure <= 100),
  ecosystem_health DOUBLE PRECISION CHECK (ecosystem_health >= 0 AND ecosystem_health <= 100),
  bathing_wastewater DOUBLE PRECISION CHECK (bathing_wastewater >= 0 AND bathing_wastewater <= 100),
  coastal_hazard DOUBLE PRECISION CHECK (coastal_hazard >= 0 AND coastal_hazard <= 100),
  trend_compliance DOUBLE PRECISION CHECK (trend_compliance >= 0 AND trend_compliance <= 100),
  
  -- Metadata
  confidence DOUBLE PRECISION DEFAULT 1.0,
  config_version TEXT NOT NULL DEFAULT 'v1.0',
  computed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(entity_type, entity_id, period_start, period_end)
);

-- Generated CTAs (Call-to-Actions)
CREATE TABLE public.ecological_ctas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('municipality', 'site')),
  entity_id UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER NOT NULL DEFAULT 1, -- 1=high, 2=medium, 3=low
  estimated_impact TEXT, -- "High", "Medium", "Low"
  
  -- Triggering conditions
  triggered_by_metrics JSONB NOT NULL DEFAULT '[]'::jsonb, -- list of metric names
  trigger_rules JSONB NOT NULL DEFAULT '{}'::jsonb, -- the rules that fired
  
  -- Action details
  actions JSONB NOT NULL DEFAULT '[]'::jsonb, -- list of specific actions
  evidence_metrics JSONB DEFAULT '[]'::jsonb, -- supporting metrics
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(entity_type, entity_id, period_start, period_end, title)
);

-- Bathing water quality data from EEA
CREATE TABLE public.bathing_water_sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id TEXT NOT NULL UNIQUE, -- EEA site identifier
  name TEXT NOT NULL,
  municipality_id UUID REFERENCES public.municipalities(id),
  location_lat DOUBLE PRECISION NOT NULL,
  location_lng DOUBLE PRECISION NOT NULL,
  water_body_type TEXT, -- coastal, inland
  status_2024 TEXT, -- Excellent, Good, Sufficient, Poor
  status_2023 TEXT,
  status_2022 TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- UWWTD (Urban Waste Water Treatment) compliance data
CREATE TABLE public.uwwtd_plants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  municipality_id UUID REFERENCES public.municipalities(id),
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  capacity_pe INTEGER, -- population equivalent
  treatment_level TEXT, -- primary, secondary, tertiary
  compliant BOOLEAN DEFAULT true,
  tertiary_np_removal BOOLEAN DEFAULT false, -- nitrogen/phosphorus removal
  discharge_to_baltic BOOLEAN DEFAULT true,
  last_inspection DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_compliance_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecological_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecological_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ecological_ctas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bathing_water_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uwwtd_plants ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Municipalities are publicly readable" ON public.municipalities FOR SELECT USING (true);
CREATE POLICY "Business sites are publicly readable" ON public.business_sites FOR SELECT USING (true);
CREATE POLICY "Compliance flags are publicly readable" ON public.entity_compliance_flags FOR SELECT USING (true);
CREATE POLICY "Ecological metrics are publicly readable" ON public.ecological_metrics FOR SELECT USING (true);
CREATE POLICY "Ecological scores are publicly readable" ON public.ecological_scores FOR SELECT USING (true);
CREATE POLICY "Ecological CTAs are publicly readable" ON public.ecological_ctas FOR SELECT USING (true);
CREATE POLICY "Bathing water sites are publicly readable" ON public.bathing_water_sites FOR SELECT USING (true);
CREATE POLICY "UWWTD plants are publicly readable" ON public.uwwtd_plants FOR SELECT USING (true);

-- Admin policies for data management
CREATE POLICY "Admins can manage all ecological data" ON public.municipalities FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage business sites" ON public.business_sites FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage compliance flags" ON public.entity_compliance_flags FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes for performance
CREATE INDEX idx_ecological_metrics_entity ON public.ecological_metrics(entity_type, entity_id, period_start);
CREATE INDEX idx_ecological_scores_entity ON public.ecological_scores(entity_type, entity_id, period_start);
CREATE INDEX idx_municipalities_basin ON public.municipalities(basin);
CREATE INDEX idx_business_sites_municipality ON public.business_sites(municipality_id);

-- Triggers for updated_at timestamps
CREATE TRIGGER update_municipalities_updated_at BEFORE UPDATE ON public.municipalities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_business_sites_updated_at BEFORE UPDATE ON public.business_sites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_compliance_flags_updated_at BEFORE UPDATE ON public.entity_compliance_flags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bathing_sites_updated_at BEFORE UPDATE ON public.bathing_water_sites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_uwwtd_plants_updated_at BEFORE UPDATE ON public.uwwtd_plants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();