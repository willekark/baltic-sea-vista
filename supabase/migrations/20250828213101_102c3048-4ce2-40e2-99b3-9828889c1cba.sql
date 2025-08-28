-- Fix security definer view issue by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.backhaul_opportunities;

CREATE OR REPLACE VIEW public.backhaul_opportunities 
WITH (security_invoker = true) AS
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