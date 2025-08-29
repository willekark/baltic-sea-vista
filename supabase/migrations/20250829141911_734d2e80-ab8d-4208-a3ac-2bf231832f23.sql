-- Create contract bidding opportunities table
CREATE TABLE public.contract_bidding_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_title TEXT NOT NULL,
  contract_description TEXT,
  contract_type TEXT NOT NULL, -- tender, rfq, spot_market, etc.
  issuing_organization TEXT NOT NULL,
  contract_value_eur DECIMAL(15,2),
  estimated_value_eur DECIMAL(15,2),
  bid_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  contract_start_date DATE,
  contract_end_date DATE,
  route_origin TEXT,
  route_destination TEXT,
  cargo_type TEXT,
  cargo_volume_tons DECIMAL(10,2),
  vessel_requirements JSONB DEFAULT '{}',
  regulatory_requirements JSONB DEFAULT '[]',
  bid_requirements JSONB DEFAULT '{}',
  competitive_score INTEGER CHECK (competitive_score >= 0 AND competitive_score <= 100),
  recommended_bid_strategy TEXT,
  win_probability INTEGER CHECK (win_probability >= 0 AND win_probability <= 100),
  region TEXT DEFAULT 'baltic',
  contract_status TEXT DEFAULT 'open' CHECK (contract_status IN ('open', 'closed', 'awarded', 'cancelled')),
  source_url TEXT,
  contact_info JSONB DEFAULT '{}',
  terms_conditions TEXT,
  evaluation_criteria JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contract_bidding_opportunities ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Contract bidding opportunities are publicly readable"
ON public.contract_bidding_opportunities
FOR SELECT
USING (true);

-- Create index for better performance
CREATE INDEX idx_contract_bidding_deadline ON public.contract_bidding_opportunities(bid_deadline);
CREATE INDEX idx_contract_bidding_region ON public.contract_bidding_opportunities(region);
CREATE INDEX idx_contract_bidding_status ON public.contract_bidding_opportunities(contract_status);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_contract_bidding_opportunities_updated_at
  BEFORE UPDATE ON public.contract_bidding_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();