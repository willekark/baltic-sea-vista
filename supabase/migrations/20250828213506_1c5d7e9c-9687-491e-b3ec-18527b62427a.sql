-- Fix security issue: Restrict cargo_flows table access to authenticated users only
-- Replace the overly permissive "publicly readable" policy with secure authentication-based access

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Cargo flows are publicly readable" ON public.cargo_flows;

-- Create new secure policy that requires authentication
CREATE POLICY "Authenticated users can view cargo flows" 
ON public.cargo_flows 
FOR SELECT 
TO authenticated
USING (true);

-- Optional: Create a more restrictive policy for business users only
-- This policy would require a user roles system to be implemented
-- Uncomment when user roles are implemented:
-- CREATE POLICY "Business users can view cargo flows" 
-- ON public.cargo_flows 
-- FOR SELECT 
-- TO authenticated
-- USING (public.has_role(auth.uid(), 'business_user') OR public.has_role(auth.uid(), 'admin'));

-- Add comment explaining the security change
COMMENT ON TABLE public.cargo_flows IS 'Contains sensitive commercial shipping data. Access restricted to authenticated users to prevent competitor data theft.';