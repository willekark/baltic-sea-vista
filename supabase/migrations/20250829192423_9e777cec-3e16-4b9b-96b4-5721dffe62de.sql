-- Insert additional Baltic Sea vessels for demonstration
INSERT INTO public.vessels (id, vessel_name, imo_number, mmsi, vessel_type, flag_state, sanctions_status, risk_score, owner, operator, built_year, gross_tonnage) VALUES
('a1b2c3d4-e5f6-7890-abcd-123456789001', 'Baltic Pioneer', 9123456, 234567890, 'Container Ship', 'Finland', 'clear', 5, 'Nordic Shipping Ltd', 'Baltic Lines', 2015, 75000),
('a1b2c3d4-e5f6-7890-abcd-123456789002', 'Northern Cargo', 9234567, 345678901, 'Bulk Carrier', 'Sweden', 'clear', 12, 'Scandinavian Maritime', 'North Sea Carriers', 2018, 45000),
('a1b2c3d4-e5f6-7890-abcd-123456789003', 'Sea Falcon', 9345678, 456789012, 'Tanker', 'Estonia', 'watchlist', 35, 'Baltic Energy Transport', 'Eastern Oil', 2012, 85000),
('a1b2c3d4-e5f6-7890-abcd-123456789004', 'Arctic Wind', 9456789, 567890123, 'Ferry', 'Denmark', 'clear', 2, 'Danish Ferry Co', 'Scandlines', 2020, 25000),
('a1b2c3d4-e5f6-7890-abcd-123456789005', 'Shadow Trader', 9567890, 678901234, 'Tanker', 'Panama', 'sanctioned', 85, 'Unknown Holdings', 'Dark Fleet Ops', 2008, 120000);