-- Enable PostGIS extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS postgis;

-- AIS Positions table (Timescale-like with hypertable semantics)
CREATE TABLE IF NOT EXISTS public.ais_positions (
  mmsi BIGINT NOT NULL,
  ts TIMESTAMPTZ NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  sog DOUBLE PRECISION, -- Speed over ground (knots)
  cog DOUBLE PRECISION, -- Course over ground (degrees)
  heading DOUBLE PRECISION, -- True heading (degrees)
  nav_status TEXT,
  imo BIGINT,
  callsign TEXT,
  vessel_name TEXT,
  vessel_type TEXT,
  draught DOUBLE PRECISION, -- meters
  source TEXT,
  geom GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (mmsi, ts)
);

-- Create index for geospatial queries
CREATE INDEX IF NOT EXISTS idx_ais_positions_geom ON public.ais_positions USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_ais_positions_ts ON public.ais_positions (ts DESC);
CREATE INDEX IF NOT EXISTS idx_ais_positions_mmsi ON public.ais_positions (mmsi);

-- SAR Detections table
CREATE TABLE IF NOT EXISTS public.sar_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id TEXT NOT NULL,
  acq_time TIMESTAMPTZ NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  est_length_m DOUBLE PRECISION,
  rcs_db DOUBLE PRECISION, -- Radar cross section
  confidence DOUBLE PRECISION CHECK (confidence >= 0 AND confidence <= 1),
  geom GEOGRAPHY(POINT, 4326),
  matched_mmsi BIGINT, -- Matched AIS vessel
  match_distance_m DOUBLE PRECISION, -- Distance to matched AIS position
  match_confidence DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sar_detections_geom ON public.sar_detections USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_sar_detections_acq_time ON public.sar_detections (acq_time DESC);
CREATE INDEX IF NOT EXISTS idx_sar_detections_scene ON public.sar_detections (scene_id);

-- Alerts table (enhanced from existing)
CREATE TABLE IF NOT EXISTS public.shadow_fleet_alerts_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type TEXT NOT NULL, -- dark_detection, spoofing_suspected, loitering, rendezvous
  priority INTEGER CHECK (priority >= 0 AND priority <= 100),
  mmsi BIGINT,
  detection_id UUID REFERENCES public.sar_detections(id),
  summary TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  score INTEGER CHECK (score >= 0 AND score <= 100),
  geom GEOGRAPHY(POINT, 4326),
  status TEXT DEFAULT 'active',
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shadow_alerts_v2_geom ON public.shadow_fleet_alerts_v2 USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_shadow_alerts_v2_time ON public.shadow_fleet_alerts_v2 (alert_time DESC);
CREATE INDEX IF NOT EXISTS idx_shadow_alerts_v2_type ON public.shadow_fleet_alerts_v2 (type);
CREATE INDEX IF NOT EXISTS idx_shadow_alerts_v2_status ON public.shadow_fleet_alerts_v2 (status);

-- Ports table (context layer)
CREATE TABLE IF NOT EXISTS public.ports_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT,
  port_type TEXT,
  geom GEOGRAPHY(POLYGON, 4326),
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ports_context_geom ON public.ports_context USING GIST(geom);

-- EEZ Zones table (context layer)
CREATE TABLE IF NOT EXISTS public.eez_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT,
  geom GEOGRAPHY(MULTIPOLYGON, 4326),
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eez_zones_geom ON public.eez_zones USING GIST(geom);

-- Vessel tracks cache (for performance)
CREATE TABLE IF NOT EXISTS public.vessel_tracks_cache (
  mmsi BIGINT PRIMARY KEY,
  last_position_time TIMESTAMPTZ,
  last_lat DOUBLE PRECISION,
  last_lon DOUBLE PRECISION,
  track_points JSONB, -- Array of recent positions
  predicted_lat DOUBLE PRECISION, -- Kalman filter prediction
  predicted_lon DOUBLE PRECISION,
  prediction_uncertainty DOUBLE PRECISION,
  status TEXT, -- normal, loitering, gap_detected, dark
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vessel_tracks_mmsi ON public.vessel_tracks_cache (mmsi);
CREATE INDEX IF NOT EXISTS idx_vessel_tracks_updated ON public.vessel_tracks_cache (updated_at DESC);

-- RLS Policies for new tables
ALTER TABLE public.ais_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sar_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shadow_fleet_alerts_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ports_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eez_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessel_tracks_cache ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "AIS positions are publicly readable"
  ON public.ais_positions FOR SELECT USING (true);

CREATE POLICY "SAR detections are publicly readable"
  ON public.sar_detections FOR SELECT USING (true);

CREATE POLICY "Shadow fleet alerts v2 are publicly readable"
  ON public.shadow_fleet_alerts_v2 FOR SELECT USING (true);

CREATE POLICY "Ports context is publicly readable"
  ON public.ports_context FOR SELECT USING (true);

CREATE POLICY "EEZ zones are publicly readable"
  ON public.eez_zones FOR SELECT USING (true);

CREATE POLICY "Vessel tracks cache is publicly readable"
  ON public.vessel_tracks_cache FOR SELECT USING (true);

-- Trigger to auto-populate geom from lat/lon
CREATE OR REPLACE FUNCTION update_geom_from_lat_lon()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geom := ST_SetSRID(ST_MakePoint(NEW.lon, NEW.lat), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ais_positions_geom_trigger
  BEFORE INSERT OR UPDATE ON public.ais_positions
  FOR EACH ROW
  EXECUTE FUNCTION update_geom_from_lat_lon();

CREATE TRIGGER sar_detections_geom_trigger
  BEFORE INSERT OR UPDATE ON public.sar_detections
  FOR EACH ROW
  EXECUTE FUNCTION update_geom_from_lat_lon();