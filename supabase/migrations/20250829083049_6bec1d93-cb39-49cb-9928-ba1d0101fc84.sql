-- Create arbitrage opportunities tracking table
CREATE TABLE public.arbitrage_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN (
    'freight_rate_arbitrage',
    'backhaul_cargo_arbitrage', 
    'fuel_bunkering_arbitrage',
    'carbon_credit_arbitrage',
    'commodity_flow_arbitrage',
    'ice_season_arbitrage',
    'port_congestion_arbitrage',
    'regulatory_arbitrage',
    'storage_floating_arbitrage'
  )),
  title TEXT NOT NULL,
  description TEXT,
  potential_savings_eur DOUBLE PRECISION,
  potential_revenue_eur DOUBLE PRECISION,
  probability_score INTEGER CHECK (probability_score >= 0 AND probability_score <= 100),
  time_sensitivity TEXT CHECK (time_sensitivity IN ('urgent', 'high', 'medium', 'low')),
  implementation_complexity TEXT CHECK (implementation_complexity IN ('simple', 'moderate', 'complex')),
  
  -- Route/Location data
  origin_port TEXT,
  destination_port TEXT,
  alternative_route TEXT,
  affected_regions TEXT[],
  
  -- Financial details
  current_rate_per_ton DOUBLE PRECISION,
  arbitrage_rate_per_ton DOUBLE PRECISION,
  fuel_cost_difference_per_tonne DOUBLE PRECISION,
  carbon_cost_savings_eur DOUBLE PRECISION,
  
  -- Timing and validity
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  seasonal_factor DOUBLE PRECISION DEFAULT 1.0,
  
  -- Implementation details
  vessel_type_required TEXT,
  min_vessel_size_dwt INTEGER,
  max_vessel_size_dwt INTEGER,
  ice_class_required BOOLEAN DEFAULT false,
  
  -- Risk assessment
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'very_high')),
  risk_factors TEXT[],
  mitigation_strategies TEXT[],
  
  -- Supporting data
  market_data JSONB DEFAULT '{}',
  weather_factors JSONB DEFAULT '{}',
  regulatory_factors JSONB DEFAULT '{}',
  
  -- Tracking
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'executed', 'cancelled')),
  confidence_level INTEGER CHECK (confidence_level >= 0 AND confidence_level <= 100),
  data_sources TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.arbitrage_opportunities ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for public read access
CREATE POLICY "Arbitrage opportunities are publicly readable" 
ON public.arbitrage_opportunities 
FOR SELECT 
USING (true);

-- Create indexes for performance
CREATE INDEX idx_arbitrage_opportunities_type ON public.arbitrage_opportunities(opportunity_type);
CREATE INDEX idx_arbitrage_opportunities_validity ON public.arbitrage_opportunities(valid_from, valid_until);
CREATE INDEX idx_arbitrage_opportunities_potential_savings ON public.arbitrage_opportunities(potential_savings_eur DESC);
CREATE INDEX idx_arbitrage_opportunities_ports ON public.arbitrage_opportunities(origin_port, destination_port);
CREATE INDEX idx_arbitrage_opportunities_time_sensitivity ON public.arbitrage_opportunities(time_sensitivity);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_arbitrage_opportunities_updated_at
BEFORE UPDATE ON public.arbitrage_opportunities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for tracking fuel prices by port (for bunkering arbitrage)
CREATE TABLE public.fuel_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  port_name TEXT NOT NULL,
  port_country TEXT NOT NULL,
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('HFO', 'MGO', 'LSFO', 'VLSFO', 'LNG')),
  price_per_tonne DOUBLE PRECISION NOT NULL,
  currency TEXT DEFAULT 'USD',
  supplier TEXT,
  availability TEXT CHECK (availability IN ('high', 'medium', 'low', 'unavailable')),
  minimum_quantity_tonnes INTEGER,
  delivery_time_hours INTEGER,
  price_date DATE NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for fuel prices
ALTER TABLE public.fuel_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fuel prices are publicly readable" 
ON public.fuel_prices 
FOR SELECT 
USING (true);

-- Create indexes for fuel prices
CREATE INDEX idx_fuel_prices_port_date ON public.fuel_prices(port_name, price_date DESC);
CREATE INDEX idx_fuel_prices_type_date ON public.fuel_prices(fuel_type, price_date DESC);

-- Create table for port congestion data (for congestion arbitrage)
CREATE TABLE public.port_congestion (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  port_name TEXT NOT NULL,
  port_country TEXT NOT NULL,
  congestion_level TEXT NOT NULL CHECK (congestion_level IN ('none', 'light', 'moderate', 'heavy', 'severe')),
  average_waiting_time_hours DOUBLE PRECISION,
  vessels_waiting INTEGER DEFAULT 0,
  berth_availability_percent DOUBLE PRECISION,
  estimated_delay_hours DOUBLE PRECISION,
  congestion_reason TEXT,
  weather_factor BOOLEAN DEFAULT false,
  industrial_action BOOLEAN DEFAULT false,
  infrastructure_issues BOOLEAN DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  forecast_next_24h TEXT CHECK (forecast_next_24h IN ('improving', 'stable', 'worsening')),
  source TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for port congestion
ALTER TABLE public.port_congestion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Port congestion data is publicly readable" 
ON public.port_congestion 
FOR SELECT 
USING (true);

-- Create indexes for port congestion
CREATE INDEX idx_port_congestion_port_timestamp ON public.port_congestion(port_name, timestamp DESC);
CREATE INDEX idx_port_congestion_level ON public.port_congestion(congestion_level, timestamp DESC);