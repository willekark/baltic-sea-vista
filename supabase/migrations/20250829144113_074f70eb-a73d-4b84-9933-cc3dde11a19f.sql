-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('bidder', 'admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'bidder',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create simple profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create bids table
CREATE TABLE public.contract_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.contract_bidding_opportunities(id) ON DELETE CASCADE NOT NULL,
    bidder_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    bid_amount_eur NUMERIC NOT NULL,
    bid_message TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, rejected
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on bids
ALTER TABLE public.contract_bids ENABLE ROW LEVEL SECURITY;

-- Create commissions table
CREATE TABLE public.commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.contract_bidding_opportunities(id) NOT NULL,
    winning_bid_id UUID REFERENCES public.contract_bids(id) NOT NULL,
    contract_value_eur NUMERIC NOT NULL,
    commission_percentage NUMERIC NOT NULL DEFAULT 3.0, -- 3% default
    commission_amount_eur NUMERIC NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, failed
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on commissions
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view their own role" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Bidders can create bids" ON public.contract_bids
FOR INSERT WITH CHECK (auth.uid() = bidder_id AND public.has_role(auth.uid(), 'bidder'));

CREATE POLICY "Users can view their own bids" ON public.contract_bids
FOR SELECT USING (auth.uid() = bidder_id);

CREATE POLICY "Admins can view all bids" ON public.contract_bids
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage commissions" ON public.commissions
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, contact_email)
  VALUES (NEW.id, NEW.email);
  
  -- Assign bidder role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'bidder');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update function for profiles
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contract_bids_updated_at
  BEFORE UPDATE ON public.contract_bids
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_commissions_updated_at
  BEFORE UPDATE ON public.commissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();