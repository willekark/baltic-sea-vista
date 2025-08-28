-- Create cargo flows table for backhaul analysis
CREATE TABLE public.cargo_flows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  origin_region TEXT NOT NULL,
  destination_region TEXT NOT NULL,
  cargo_type TEXT NOT NULL,
  cargo_subtype TEXT,
  volume_tons DOUBLE PRECISION,
  rate_per_ton DOUBLE PRECISION,
  currency TEXT DEFAULT 'EUR',
  demand_level TEXT CHECK (demand_level IN ('low', 'medium', 'high', 'critical')),
  seasonal_factor DOUBLE PRECISION DEFAULT 1.0,
  lead_time_days INTEGER,
  frequency TEXT, -- daily, weekly, monthly
  shipper_company TEXT,
  consignee_company TEXT,
  port_origin TEXT,
  port_destination TEXT,
  vessel_type_required TEXT,
  min_vessel_size_dwt INTEGER,
  max_vessel_size_dwt INTEGER,
  loading_time_hours DOUBLE PRECISION,
  discharge_time_hours DOUBLE PRECISION,
  contract_duration_months INTEGER,
  spot_vs_contract TEXT CHECK (spot_vs_contract IN ('spot', 'contract', 'both')),
  commodity_group TEXT, -- bulk_dry, bulk_liquid, container, project, etc
  route_restrictions JSONB DEFAULT '{}',
  environmental_requirements JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  metadata JSONB DEFAULT '{}'
);

-- Enable Row Level Security
ALTER TABLE public.cargo_flows ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Cargo flows are publicly readable" 
ON public.cargo_flows 
FOR SELECT 
USING (true);

-- Create backhaul opportunities view
CREATE OR REPLACE VIEW public.backhaul_opportunities AS
SELECT 
  cf.*,
  CASE 
    WHEN cf.demand_level = 'critical' THEN 95
    WHEN cf.demand_level = 'high' THEN 80
    WHEN cf.demand_level = 'medium' THEN 60
    ELSE 40
  END as opportunity_score,
  (cf.rate_per_ton * cf.volume_tons) as total_value_eur,
  CASE 
    WHEN cf.lead_time_days <= 7 THEN 'immediate'
    WHEN cf.lead_time_days <= 30 THEN 'short_term' 
    ELSE 'long_term'
  END as booking_urgency
FROM public.cargo_flows cf
WHERE 
  cf.valid_until IS NULL OR cf.valid_until >= CURRENT_DATE
  AND cf.valid_from <= CURRENT_DATE
ORDER BY 
  cf.demand_level DESC,
  cf.rate_per_ton DESC,
  cf.volume_tons DESC;

-- Create trigger for updated_at
CREATE TRIGGER update_cargo_flows_updated_at
  BEFORE UPDATE ON public.cargo_flows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample cargo flow data for Mediterranean-Baltic routes
INSERT INTO public.cargo_flows (
  origin_region,
  destination_region,
  cargo_type,
  cargo_subtype,
  volume_tons,
  rate_per_ton,
  demand_level,
  seasonal_factor,
  lead_time_days,
  frequency,
  port_origin,
  port_destination,
  vessel_type_required,
  min_vessel_size_dwt,
  max_vessel_size_dwt,
  loading_time_hours,
  discharge_time_hours,
  spot_vs_contract,
  commodity_group,
  route_restrictions,
  environmental_requirements
) VALUES 
-- Mediterranean to Baltic bulk cargo flows
('Mediterranean', 'Baltic', 'Salt', 'Industrial Salt', 25000, 18.50, 'high', 1.1, 14, 'weekly', 'Barcelona', 'Stockholm', 'Bulk Carrier', 15000, 35000, 24, 18, 'both', 'bulk_dry', '{"draft_limit": "12.5m", "beam_limit": "32m"}', '{"dust_control": true}'),
('Mediterranean', 'Baltic', 'Gypsum', 'Construction Grade', 18000, 22.75, 'medium', 0.9, 21, 'bi-weekly', 'Valencia', 'Helsinki', 'Bulk Carrier', 12000, 30000, 20, 16, 'contract', 'bulk_dry', '{"draft_limit": "11.8m"}', '{"covered_cargo": true}'),
('Mediterranean', 'Baltic', 'Fertilizer', 'Potash', 30000, 45.20, 'critical', 1.3, 7, 'weekly', 'Tarragona', 'Gdansk', 'Bulk Carrier', 20000, 40000, 28, 22, 'spot', 'bulk_dry', '{"segregation_required": true}', '{"hazmat_certified": true}'),
('Mediterranean', 'Baltic', 'Alumina', 'Refined', 22000, 38.90, 'high', 1.0, 10, 'weekly', 'Marseille', 'Riga', 'Bulk Carrier', 15000, 35000, 26, 20, 'both', 'bulk_dry', '{"moisture_protection": true}', '{"dust_free_loading": true}'),
('Mediterranean', 'Baltic', 'Cement', 'Portland Cement', 16000, 28.40, 'medium', 0.8, 18, 'monthly', 'Genoa', 'Klaipeda', 'Bulk Carrier', 10000, 25000, 22, 14, 'contract', 'bulk_dry', '{"pneumatic_discharge": true}', '{"weather_protection": true}'),
('Mediterranean', 'Baltic', 'Kaolin', 'Industrial Clay', 12000, 52.10, 'high', 1.1, 12, 'bi-weekly', 'Naples', 'Tallinn', 'Bulk Carrier', 8000, 20000, 18, 12, 'spot', 'bulk_dry', '{"specialized_holds": true}', '{"contamination_free": true}'),
('Mediterranean', 'Baltic', 'Bentonite', 'Drilling Grade', 8000, 67.30, 'critical', 1.4, 5, 'weekly', 'Livorno', 'Kotka', 'Bulk Carrier', 6000, 15000, 16, 10, 'spot', 'bulk_dry', '{"dry_cargo_holds": true}', '{"food_grade_clean": true}'),
('Mediterranean', 'Baltic', 'Limestone', 'Crushed', 35000, 15.80, 'medium', 0.9, 25, 'monthly', 'Algeciras', 'Ventspils', 'Bulk Carrier', 25000, 50000, 32, 24, 'contract', 'bulk_dry', '{"self_discharging": false}', '{"standard_bulk": true}'),

-- Return flows (Baltic to Mediterranean) for comparison
('Baltic', 'Mediterranean', 'Timber Products', 'Softwood Logs', 20000, 65.40, 'high', 1.2, 14, 'bi-weekly', 'Sundsvall', 'Valencia', 'General Cargo', 12000, 30000, 30, 24, 'both', 'forest_products', '{"deck_cargo_ok": true}', '{"fumigation_free": true}'),
('Baltic', 'Mediterranean', 'Paper Products', 'Newsprint Rolls', 15000, 89.20, 'critical', 1.1, 8, 'weekly', 'Kotka', 'Barcelona', 'General Cargo', 10000, 25000, 24, 18, 'spot', 'forest_products', '{"weather_protection": true}', '{"humidity_control": true}'),
('Baltic', 'Mediterranean', 'Steel Products', 'Steel Coils', 25000, 125.60, 'critical', 1.0, 5, 'weekly', 'Riga', 'Genoa', 'General Cargo', 15000, 35000, 26, 20, 'spot', 'metals', '{"heavy_lift_gear": true}', '{"corrosion_protection": true}');