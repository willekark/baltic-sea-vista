-- Insert recent AIS tracking data for the Baltic Sea vessels
INSERT INTO public.ais_tracking (vessel_id, location_lat, location_lng, speed, course, heading, timestamp, mmsi, imo_number, destination, status, source) VALUES
-- Baltic Pioneer (near Helsinki)
('a1b2c3d4-e5f6-7890-abcd-123456789001', 60.1699, 24.9384, 14.2, 120.5, 118.3, NOW() - INTERVAL '2 hours', 234567890, 9123456, 'Stockholm', 'Under way using engine', 'ais'),
-- Northern Cargo (Gothenburg area)
('a1b2c3d4-e5f6-7890-abcd-123456789002', 57.7089, 11.9746, 8.7, 45.2, 42.1, NOW() - INTERVAL '1 hour', 345678901, 9234567, 'Copenhagen', 'At anchor', 'ais'),
-- Sea Falcon (suspicious near Kaliningrad)
('a1b2c3d4-e5f6-7890-abcd-123456789003', 54.7104, 20.5114, 2.1, 180.0, 175.5, NOW() - INTERVAL '30 minutes', 456789012, 9345678, 'Undeclared', 'Restricted manoeuvrability', 'ais'),
-- Arctic Wind (Øresund Bridge area)
('a1b2c3d4-e5f6-7890-abcd-123456789004', 55.6761, 12.5683, 16.8, 90.3, 88.7, NOW() - INTERVAL '45 minutes', 567890123, 9456789, 'Oslo', 'Under way using engine', 'ais'),
-- Shadow Trader (dark zone - old timestamp)
('a1b2c3d4-e5f6-7890-abcd-123456789005', 55.2, 15.8, 0.0, 0.0, 0.0, NOW() - INTERVAL '8 hours', 678901234, 9567890, 'Unknown', 'Not under command', 'ais'),
-- Baltic Star (near Kiel Canal)
('a1b2c3d4-e5f6-7890-abcd-123456789006', 54.3233, 10.1394, 12.5, 75.8, 73.2, NOW() - INTERVAL '3 hours', 789012345, 9678901, 'Hamburg', 'Under way using engine', 'ais'),
-- Kaliningrad Express
('a1b2c3d4-e5f6-7890-abcd-123456789007', 54.9063, 20.6560, 11.3, 200.1, 198.9, NOW() - INTERVAL '1.5 hours', 890123456, 9789012, 'St. Petersburg', 'Under way using engine', 'ais'),
-- Nordic Spirit (Norwegian fjords)
('a1b2c3d4-e5f6-7890-abcd-123456789008', 59.9139, 10.7522, 18.9, 350.5, 348.1, NOW() - INTERVAL '4 hours', 901234567, 9890123, 'Bergen', 'Under way using engine', 'ais'),
-- Ghost Vessel (completely dark - no recent AIS)
('a1b2c3d4-e5f6-7890-abcd-123456789009', 56.5, 18.2, 0.0, 0.0, 0.0, NOW() - INTERVAL '15 hours', 012345678, 9901234, 'Unknown', 'Not under command', 'ais'),
-- Gotland Ferry
('a1b2c3d4-e5f6-7890-abcd-123456789010', 57.6348, 18.2948, 22.1, 45.7, 44.3, NOW() - INTERVAL '2.5 hours', 123456780, 9012345, 'Visby', 'Under way using engine', 'ais');