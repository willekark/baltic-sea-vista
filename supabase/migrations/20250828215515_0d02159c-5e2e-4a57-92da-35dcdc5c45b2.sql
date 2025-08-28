-- Create comprehensive shadow fleet tracking system

-- Vessels registry with enhanced tracking
CREATE TABLE public.vessels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  imo_number INTEGER UNIQUE,
  mmsi INTEGER,
  vessel_name TEXT NOT NULL,
  vessel_type TEXT,
  flag_state TEXT,
  call_sign TEXT,
  gross_tonnage INTEGER,
  built_year INTEGER,
  owner TEXT,
  operator TEXT,
  manager TEXT,
  insurance_company TEXT,
  risk_score INTEGER DEFAULT 0,
  sanctions_status TEXT DEFAULT 'clear',
  last_reflagging_date DATE,
  reflagging_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- AIS tracking with gap detection
CREATE TABLE public.ais_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id),
  imo_number INTEGER,
  mmsi INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  location_lat DOUBLE PRECISION NOT NULL,
  location_lng DOUBLE PRECISION NOT NULL,
  speed DOUBLE PRECISION,
  course DOUBLE PRECISION,
  heading DOUBLE PRECISION,
  status TEXT,
  destination TEXT,
  eta TIMESTAMP WITH TIME ZONE,
  draught DOUBLE PRECISION,
  ais_active BOOLEAN DEFAULT true,
  dark_zone_entry TIMESTAMP WITH TIME ZONE,
  dark_zone_duration_hours DOUBLE PRECISION,
  source TEXT DEFAULT 'ais',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Satellite detections (SAR/Optical)
CREATE TABLE public.satellite_detections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  detection_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location_lat DOUBLE PRECISION NOT NULL,
  location_lng DOUBLE PRECISION NOT NULL,
  satellite_source TEXT NOT NULL, -- 'sentinel-1', 'sentinel-2', 'capella', etc.
  detection_confidence DOUBLE PRECISION,
  vessel_length_estimate DOUBLE PRECISION,
  vessel_width_estimate DOUBLE PRECISION,
  matched_ais_vessel_id UUID REFERENCES public.vessels(id),
  ais_gap_detected BOOLEAN DEFAULT false,
  suspicious_score INTEGER DEFAULT 0,
  image_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Suspicious activities detection
CREATE TABLE public.suspicious_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id),
  activity_type TEXT NOT NULL, -- 'ais_dark_zone', 'sts_transfer', 'loitering', 'false_destination', 'sanctions_violation'
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  description TEXT,
  evidence JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active', -- 'active', 'investigating', 'resolved', 'false_positive'
  investigated_by TEXT,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ship-to-Ship transfer detections
CREATE TABLE public.sts_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel1_id UUID REFERENCES public.vessels(id),
  vessel2_id UUID REFERENCES public.vessels(id),
  transfer_start TIMESTAMP WITH TIME ZONE NOT NULL,
  transfer_end TIMESTAMP WITH TIME ZONE,
  location_lat DOUBLE PRECISION NOT NULL,
  location_lng DOUBLE PRECISION NOT NULL,
  distance_between_vessels DOUBLE PRECISION,
  duration_hours DOUBLE PRECISION,
  estimated_cargo_transferred DOUBLE PRECISION,
  transfer_type TEXT, -- 'oil', 'fuel', 'cargo', 'unknown'
  risk_assessment TEXT DEFAULT 'medium',
  weather_conditions JSONB,
  regulatory_compliance TEXT DEFAULT 'unknown',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sanctions and regulatory lists
CREATE TABLE public.sanctions_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL, -- 'vessel', 'company', 'individual'
  entity_name TEXT NOT NULL,
  imo_number INTEGER,
  sanction_authority TEXT NOT NULL, -- 'EU', 'OFAC', 'UK', 'UN'
  sanction_type TEXT NOT NULL,
  sanction_reason TEXT,
  effective_date DATE NOT NULL,
  expiry_date DATE,
  status TEXT DEFAULT 'active',
  source_url TEXT,
  last_verified TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Port calls and cargo analysis
CREATE TABLE public.port_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id),
  port_name TEXT NOT NULL,
  port_country TEXT NOT NULL,
  arrival_time TIMESTAMP WITH TIME ZONE,
  departure_time TIMESTAMP WITH TIME ZONE,
  declared_cargo TEXT,
  actual_cargo TEXT,
  cargo_discrepancy BOOLEAN DEFAULT false,
  high_risk_port BOOLEAN DEFAULT false,
  customs_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Shadow fleet alerts and monitoring
CREATE TABLE public.shadow_fleet_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vessel_id UUID REFERENCES public.vessels(id),
  alert_type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  title TEXT NOT NULL,
  description TEXT,
  alert_data JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active', -- 'active', 'acknowledged', 'resolved'
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ais_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.satellite_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suspicious_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sts_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sanctions_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.port_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shadow_fleet_alerts ENABLE ROW LEVEL SECURITY;

-- Create public read policies (can be restricted later based on user roles)
CREATE POLICY "Shadow fleet data is publicly readable" ON public.vessels FOR SELECT USING (true);
CREATE POLICY "AIS tracking is publicly readable" ON public.ais_tracking FOR SELECT USING (true);
CREATE POLICY "Satellite detections are publicly readable" ON public.satellite_detections FOR SELECT USING (true);
CREATE POLICY "Suspicious activities are publicly readable" ON public.suspicious_activities FOR SELECT USING (true);
CREATE POLICY "STS transfers are publicly readable" ON public.sts_transfers FOR SELECT USING (true);
CREATE POLICY "Sanctions lists are publicly readable" ON public.sanctions_lists FOR SELECT USING (true);
CREATE POLICY "Port calls are publicly readable" ON public.port_calls FOR SELECT USING (true);
CREATE POLICY "Shadow fleet alerts are publicly readable" ON public.shadow_fleet_alerts FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX idx_vessels_imo ON public.vessels(imo_number);
CREATE INDEX idx_vessels_mmsi ON public.vessels(mmsi);
CREATE INDEX idx_vessels_risk_score ON public.vessels(risk_score DESC);
CREATE INDEX idx_ais_tracking_vessel_time ON public.ais_tracking(vessel_id, timestamp DESC);
CREATE INDEX idx_ais_tracking_location ON public.ais_tracking(location_lat, location_lng);
CREATE INDEX idx_ais_tracking_dark_zones ON public.ais_tracking(ais_active, dark_zone_duration_hours DESC);
CREATE INDEX idx_satellite_detections_time ON public.satellite_detections(detection_time DESC);
CREATE INDEX idx_satellite_detections_suspicious ON public.satellite_detections(suspicious_score DESC);
CREATE INDEX idx_suspicious_activities_severity ON public.suspicious_activities(severity, detected_at DESC);
CREATE INDEX idx_sts_transfers_time ON public.sts_transfers(transfer_start DESC);
CREATE INDEX idx_sanctions_lists_active ON public.sanctions_lists(status, effective_date DESC);
CREATE INDEX idx_port_calls_vessel_time ON public.port_calls(vessel_id, arrival_time DESC);
CREATE INDEX idx_shadow_fleet_alerts_priority ON public.shadow_fleet_alerts(priority, status, created_at DESC);

-- Create triggers for updated_at columns
CREATE TRIGGER update_vessels_updated_at BEFORE UPDATE ON public.vessels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_suspicious_activities_updated_at BEFORE UPDATE ON public.suspicious_activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();