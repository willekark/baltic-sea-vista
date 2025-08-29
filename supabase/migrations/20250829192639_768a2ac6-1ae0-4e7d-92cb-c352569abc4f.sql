-- Insert final batch of AIS tracking data for remaining vessels
INSERT INTO public.ais_tracking (vessel_id, location_lat, location_lng, speed, course, heading, timestamp, mmsi, imo_number, destination, status, source) VALUES
-- Petersburg Trader (suspicious loitering)
('a1b2c3d4-e5f6-7890-abcd-123456789011', 59.9311, 30.3609, 1.8, 90.0, 89.5, NOW() - INTERVAL '6 hours', 223344556, 9112233, 'Unknown', 'At anchor', 'ais'),
-- Helsinki Express
('a1b2c3d4-e5f6-7890-abcd-123456789012', 60.1699, 24.9384, 13.7, 280.2, 278.8, NOW() - INTERVAL '1 hour', 334455667, 9223344, 'Tallinn', 'Under way using engine', 'ais'),
-- Phantom Oil (dark operations - old timestamp)
('a1b2c3d4-e5f6-7890-abcd-123456789013', 56.8, 16.1, 0.0, 0.0, 0.0, NOW() - INTERVAL '12 hours', 445566778, 9334455, 'Unknown', 'Not under command', 'ais'),
-- Riga Carrier
('a1b2c3d4-e5f6-7890-abcd-123456789014', 56.9496, 24.1052, 9.4, 180.7, 179.3, NOW() - INTERVAL '3.5 hours', 556677889, 9445566, 'Klaipeda', 'Under way using engine', 'ais'),
-- Stockholm Pride
('a1b2c3d4-e5f6-7890-abcd-123456789015', 59.3293, 18.0686, 0.5, 0.0, 45.0, NOW() - INTERVAL '30 minutes', 667788990, 9556677, 'Stockholm Port', 'Moored', 'ais');

-- Add some emissions anomalies for shadow fleet detection
INSERT INTO public.emissions_anomalies (vessel_id, location_lat, location_lng, anomaly_type, expected_emissions, actual_emissions, deviation_percent, severity, detected_at) VALUES
('a1b2c3d4-e5f6-7890-abcd-123456789005', 55.2, 15.8, 'excess_emissions', 45.2, 78.9, 74.5, 'critical', NOW() - INTERVAL '4 hours'),
('a1b2c3d4-e5f6-7890-abcd-123456789009', 56.5, 18.2, 'dark_zone_emissions', 0.0, 35.6, 100.0, 'critical', NOW() - INTERVAL '8 hours'),
('a1b2c3d4-e5f6-7890-abcd-123456789013', 56.8, 16.1, 'under_emissions', 85.3, 12.1, -85.8, 'high', NOW() - INTERVAL '6 hours');