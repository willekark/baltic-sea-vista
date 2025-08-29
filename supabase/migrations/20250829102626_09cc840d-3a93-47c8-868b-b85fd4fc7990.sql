-- Create ports table
CREATE TABLE public.ports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  country text NOT NULL,
  code text UNIQUE NOT NULL,
  location_lat double precision NOT NULL,
  location_lng double precision NOT NULL,
  port_type text NOT NULL DEFAULT 'commercial',
  facilities jsonb DEFAULT '{}',
  contact_info jsonb DEFAULT '{}',
  operating_hours jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create port_tariffs table
CREATE TABLE public.port_tariffs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  port_id uuid REFERENCES public.ports(id) NOT NULL,
  service_type text NOT NULL,
  rate_per_unit double precision NOT NULL,
  unit_type text NOT NULL,
  vessel_size_category text,
  cargo_type text,
  currency text DEFAULT 'EUR',
  valid_from date NOT NULL DEFAULT CURRENT_DATE,
  valid_until date,
  additional_fees jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create berth_availability table
CREATE TABLE public.berth_availability (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  port_id uuid REFERENCES public.ports(id) NOT NULL,
  berth_number text NOT NULL,
  berth_type text NOT NULL,
  max_length_m double precision,
  max_draft_m double precision,
  available_from timestamp with time zone NOT NULL,
  available_until timestamp with time zone NOT NULL,
  reserved_vessel_id uuid,
  status text NOT NULL DEFAULT 'available',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create port_performance table
CREATE TABLE public.port_performance (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  port_id uuid REFERENCES public.ports(id) NOT NULL,
  metric_type text NOT NULL,
  metric_value double precision NOT NULL,
  unit text NOT NULL,
  measurement_date date NOT NULL DEFAULT CURRENT_DATE,
  vessel_category text,
  cargo_type text,
  source text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create regulatory_requirements table
CREATE TABLE public.regulatory_requirements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  port_id uuid REFERENCES public.ports(id) NOT NULL,
  requirement_type text NOT NULL,
  description text NOT NULL,
  mandatory boolean DEFAULT true,
  compliance_deadline date,
  documentation_required jsonb DEFAULT '[]',
  fees_eur double precision DEFAULT 0,
  valid_from date NOT NULL DEFAULT CURRENT_DATE,
  valid_until date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.ports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.port_tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.berth_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.port_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_requirements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Ports are publicly readable" ON public.ports FOR SELECT USING (true);
CREATE POLICY "Port tariffs are publicly readable" ON public.port_tariffs FOR SELECT USING (true);
CREATE POLICY "Berth availability is publicly readable" ON public.berth_availability FOR SELECT USING (true);
CREATE POLICY "Port performance is publicly readable" ON public.port_performance FOR SELECT USING (true);
CREATE POLICY "Regulatory requirements are publicly readable" ON public.regulatory_requirements FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX idx_ports_country ON public.ports(country);
CREATE INDEX idx_ports_code ON public.ports(code);
CREATE INDEX idx_port_tariffs_port_service ON public.port_tariffs(port_id, service_type);
CREATE INDEX idx_berth_availability_port_status ON public.berth_availability(port_id, status);
CREATE INDEX idx_port_performance_port_metric ON public.port_performance(port_id, metric_type);
CREATE INDEX idx_regulatory_requirements_port ON public.regulatory_requirements(port_id);

-- Create triggers for updated_at
CREATE TRIGGER update_ports_updated_at
  BEFORE UPDATE ON public.ports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_port_tariffs_updated_at
  BEFORE UPDATE ON public.port_tariffs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_regulatory_requirements_updated_at
  BEFORE UPDATE ON public.regulatory_requirements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample Baltic ports data
INSERT INTO public.ports (name, country, code, location_lat, location_lng, port_type, facilities) VALUES
('Port of Helsinki', 'Finland', 'FIHEL', 60.1699, 24.9384, 'commercial', '{"berths": 15, "max_draft": 11.0, "cargo_types": ["containers", "ro-ro", "passengers"], "services": ["pilotage", "towage", "bunkering"]}'),
('Port of Stockholm', 'Sweden', 'SESTO', 59.3293, 18.0686, 'commercial', '{"berths": 12, "max_draft": 10.5, "cargo_types": ["containers", "ro-ro", "cruise"], "services": ["pilotage", "towage", "bunkering"]}'),
('Port of Gdansk', 'Poland', 'PLGDN', 54.3520, 18.6466, 'commercial', '{"berths": 25, "max_draft": 17.0, "cargo_types": ["containers", "bulk", "breakbulk"], "services": ["pilotage", "towage", "bunkering", "stevedoring"]}'),
('Port of Riga', 'Latvia', 'LVRIX', 57.0588, 24.0967, 'commercial', '{"berths": 20, "max_draft": 16.0, "cargo_types": ["containers", "bulk", "timber"], "services": ["pilotage", "towage", "bunkering"]}'),
('Port of Tallinn', 'Estonia', 'EETLL', 59.4370, 24.7536, 'commercial', '{"berths": 18, "max_draft": 18.0, "cargo_types": ["containers", "ro-ro", "cruise"], "services": ["pilotage", "towage", "bunkering"]}'),
('Port of Copenhagen', 'Denmark', 'DKCPH', 55.6761, 12.5683, 'commercial', '{"berths": 14, "max_draft": 9.0, "cargo_types": ["containers", "ro-ro", "cruise"], "services": ["pilotage", "towage", "bunkering"]}'),
('Port of Klaipeda', 'Lithuania', 'LTKLA', 55.7033, 21.1443, 'commercial', '{"berths": 22, "max_draft": 14.5, "cargo_types": ["containers", "bulk", "fertilizers"], "services": ["pilotage", "towage", "bunkering"]}'),
('Port of Gothenburg', 'Sweden', 'SEGOT', 57.7089, 11.9746, 'commercial', '{"berths": 30, "max_draft": 16.5, "cargo_types": ["containers", "ro-ro", "cars"], "services": ["pilotage", "towage", "bunkering", "rail_connection"]}');

-- Insert sample port tariffs
INSERT INTO public.port_tariffs (port_id, service_type, rate_per_unit, unit_type, vessel_size_category, currency) VALUES
((SELECT id FROM public.ports WHERE code = 'FIHEL'), 'port_dues', 0.15, 'per_gt', 'all', 'EUR'),
((SELECT id FROM public.ports WHERE code = 'FIHEL'), 'pilotage', 450.0, 'per_service', 'small', 'EUR'),
((SELECT id FROM public.ports WHERE code = 'FIHEL'), 'pilotage', 680.0, 'per_service', 'medium', 'EUR'),
((SELECT id FROM public.ports WHERE code = 'FIHEL'), 'pilotage', 920.0, 'per_service', 'large', 'EUR'),
((SELECT id FROM public.ports WHERE code = 'PLGDN'), 'port_dues', 0.12, 'per_gt', 'all', 'EUR'),
((SELECT id FROM public.ports WHERE code = 'PLGDN'), 'pilotage', 380.0, 'per_service', 'small', 'EUR'),
((SELECT id FROM public.ports WHERE code = 'PLGDN'), 'pilotage', 580.0, 'per_service', 'medium', 'EUR'),
((SELECT id FROM public.ports WHERE code = 'PLGDN'), 'pilotage', 780.0, 'per_service', 'large', 'EUR'),
((SELECT id FROM public.ports WHERE code = 'LVRIX'), 'port_dues', 0.08, 'per_gt', 'all', 'EUR'),
((SELECT id FROM public.ports WHERE code = 'LVRIX'), 'pilotage', 320.0, 'per_service', 'small', 'EUR'),
((SELECT id FROM public.ports WHERE code = 'LVRIX'), 'pilotage', 480.0, 'per_service', 'medium', 'EUR'),
((SELECT id FROM public.ports WHERE code = 'LVRIX'), 'pilotage', 640.0, 'per_service', 'large', 'EUR');

-- Insert sample port performance data
INSERT INTO public.port_performance (port_id, metric_type, metric_value, unit, vessel_category, source) VALUES
((SELECT id FROM public.ports WHERE code = 'FIHEL'), 'average_waiting_time', 4.5, 'hours', 'container', 'port_authority'),
((SELECT id FROM public.ports WHERE code = 'FIHEL'), 'cargo_handling_rate', 85.0, 'moves_per_hour', 'container', 'port_authority'),
((SELECT id FROM public.ports WHERE code = 'PLGDN'), 'average_waiting_time', 8.2, 'hours', 'container', 'port_authority'),
((SELECT id FROM public.ports WHERE code = 'PLGDN'), 'cargo_handling_rate', 120.0, 'moves_per_hour', 'container', 'port_authority'),
((SELECT id FROM public.ports WHERE code = 'LVRIX'), 'average_waiting_time', 6.1, 'hours', 'bulk', 'port_authority'),
((SELECT id FROM public.ports WHERE code = 'LVRIX'), 'cargo_handling_rate', 1200.0, 'tons_per_hour', 'bulk', 'port_authority'),
((SELECT id FROM public.ports WHERE code = 'EETLL'), 'average_waiting_time', 3.8, 'hours', 'container', 'port_authority'),
((SELECT id FROM public.ports WHERE code = 'EETLL'), 'cargo_handling_rate', 95.0, 'moves_per_hour', 'container', 'port_authority');