-- Insert additional Baltic Sea vessels for demonstration
INSERT INTO public.vessels (id, vessel_name, imo_number, mmsi, vessel_type, flag_state, sanctions_status, risk_score, owner, operator, built_year, gross_tonnage) VALUES
('a1b2c3d4-e5f6-7890-abcd-123456789001', 'Baltic Pioneer', 9123456, 234567890, 'Container Ship', 'Finland', 'clear', 5, 'Nordic Shipping Ltd', 'Baltic Lines', 2015, 75000),
('a1b2c3d4-e5f6-7890-abcd-123456789002', 'Northern Cargo', 9234567, 345678901, 'Bulk Carrier', 'Sweden', 'clear', 12, 'Scandinavian Maritime', 'North Sea Carriers', 2018, 45000),
('a1b2c3d4-e5f6-7890-abcd-123456789003', 'Sea Falcon', 9345678, 456789012, 'Tanker', 'Estonia', 'watchlist', 35, 'Baltic Energy Transport', 'Eastern Oil', 2012, 85000),
('a1b2c3d4-e5f6-7890-abcd-123456789004', 'Arctic Wind', 9456789, 567890123, 'Ferry', 'Denmark', 'clear', 2, 'Danish Ferry Co', 'Scandlines', 2020, 25000),
('a1b2c3d4-e5f6-7890-abcd-123456789005', 'Shadow Trader', 9567890, 678901234, 'Tanker', 'Panama', 'sanctioned', 85, 'Unknown Holdings', 'Dark Fleet Ops', 2008, 120000),
('a1b2c3d4-e5f6-7890-abcd-123456789006', 'Baltic Star', 9678901, 789012345, 'Container Ship', 'Germany', 'clear', 8, 'Hamburg Shipping', 'Deutsche Marine', 2019, 95000),
('a1b2c3d4-e5f6-7890-abcd-123456789007', 'Kaliningrad Express', 9789012, 890123456, 'Cargo Ship', 'Russia', 'watchlist', 65, 'Russian Maritime', 'Baltic Cargo', 2010, 35000),
('a1b2c3d4-e5f6-7890-abcd-123456789008', 'Nordic Spirit', 9890123, 901234567, 'Passenger Ship', 'Norway', 'clear', 3, 'Norwegian Cruise Lines', 'Fjord Cruises', 2017, 55000),
('a1b2c3d4-e5f6-7890-abcd-123456789009', 'Ghost Vessel', 9901234, 012345678, 'Tanker', 'Liberia', 'sanctioned', 92, 'Shell Company Ltd', 'Anonymous Shipping', 2005, 150000),
('a1b2c3d4-e5f6-7890-abcd-123456789010', 'Gotland Ferry', 9012345, 123456780, 'RoRo Ferry', 'Sweden', 'clear', 1, 'Gotland Lines', 'Swedish Ferries', 2021, 18000),
('a1b2c3d4-e5f6-7890-abcd-123456789011', 'Petersburg Trader', 9112233, 223344556, 'Bulk Carrier', 'Russia', 'watchlist', 55, 'St. Petersburg Shipping', 'Neva Transport', 2014, 65000),
('a1b2c3d4-e5f6-7890-abcd-123456789012', 'Helsinki Express', 9223344, 334455667, 'Container Ship', 'Finland', 'clear', 7, 'Finnish Maritime', 'Suomi Shipping', 2016, 80000),
('a1b2c3d4-e5f6-7890-abcd-123456789013', 'Phantom Oil', 9334455, 445566778, 'Tanker', 'Marshall Islands', 'sanctioned', 88, 'Offshore Holdings', 'Mystery Maritime', 2007, 180000),
('a1b2c3d4-e5f6-7890-abcd-123456789014', 'Riga Carrier', 9445566, 556677889, 'General Cargo', 'Latvia', 'clear', 15, 'Latvian Shipping', 'Baltic Logistics', 2013, 28000),
('a1b2c3d4-e5f6-7890-abcd-123456789015', 'Stockholm Pride', 9556677, 667788990, 'Cruise Ship', 'Sweden', 'clear', 4, 'Royal Caribbean Baltic', 'Nordic Cruises', 2019, 120000);

-- Insert recent AIS tracking data for these vessels
INSERT INTO public.ais_tracking (vessel_id, location_lat, location_lng, speed, course, heading, timestamp, mmsi, imo_number, destination, status, source) VALUES
-- Baltic Pioneer (near Helsinki)
('a1b2c3d4-e5f6-7890-abcd-123456789001', 60.1699, 24.9384, 14.2, 120.5, 118.3, NOW() - INTERVAL '2 hours', 234567890, 9123456, 'Stockholm', 'Under way using engine', 'ais'),
-- Northern Cargo (Gothenburg area)
('a1b2c3d4-e5f6-7890-abcd-123456789002', 57.7089, 11.9746, 8.7, 45.2, 42.1, NOW() - INTERVAL '1 hour', 345678901, 9234567, 'Copenhagen', 'At anchor', 'ais'),
-- Sea Falcon (suspicious near Kaliningrad)
('a1b2c3d4-e5f6-7890-abcd-123456789003', 54.7104, 20.5114, 2.1, 180.0, 175.5, NOW() - INTERVAL '30 minutes', 456789012, 9345678, 'Undeclared', 'Restricted manoeuvrability', 'ais'),
-- Arctic Wind (Øresund Bridge area)
('a1b2c3d4-e5f6-7890-abcd-123456789004', 55.6761, 12.5683, 16.8, 90.3, 88.7, NOW() - INTERVAL '45 minutes', 567890123, 9456789, 'Oslo', 'Under way using engine', 'ais'),
-- Shadow Trader (dark zone entry)
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
('a1b2c3d4-e5f6-7890-abcd-123456789010', 57.6348, 18.2948, 22.1, 45.7, 44.3, NOW() - INTERVAL '2.5 hours', 123456780, 9012345, 'Visby', 'Under way using engine', 'ais'),
-- Petersburg Trader (suspicious loitering)
('a1b2c3d4-e5f6-7890-abcd-123456789011', 59.9311, 30.3609, 1.8, 90.0, 89.5, NOW() - INTERVAL '6 hours', 223344556, 9112233, 'Unknown', 'At anchor', 'ais'),
-- Helsinki Express
('a1b2c3d4-e5f6-7890-abcd-123456789012', 60.1699, 24.9384, 13.7, 280.2, 278.8, NOW() - INTERVAL '1 hour', 334455667, 9223344, 'Tallinn', 'Under way using engine', 'ais'),
-- Phantom Oil (dark operations)
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

-- Add some shadow fleet alerts
INSERT INTO public.shadow_fleet_alerts (vessel_id, alert_type, priority, title, description, alert_data) VALUES
('a1b2c3d4-e5f6-7890-abcd-123456789005', 'sanctions_violation', 'critical', 'Sanctioned Vessel Active', 'Shadow Trader appears on sanctions list and is operating in Baltic waters', '{"sanctions_list": "EU", "violation_type": "oil_transport"}'),
('a1b2c3d4-e5f6-7890-abcd-123456789009', 'ais_dark_zone', 'high', 'Extended Dark Zone', 'Ghost Vessel has been without AIS signal for 15+ hours', '{"dark_duration_hours": 15.2, "last_known_position": "56.5, 18.2"}'),
('a1b2c3d4-e5f6-7890-abcd-123456789013', 'emissions_anomaly', 'high', 'Suspicious Emissions Pattern', 'Phantom Oil showing emissions inconsistent with declared cargo', '{"expected_vs_actual": "85% under normal levels"}'),
('a1b2c3d4-e5f6-7890-abcd-123456789011', 'loitering', 'medium', 'Extended Loitering', 'Petersburg Trader has been moving at very low speed for 6+ hours', '{"loitering_duration_hours": 6.1, "average_speed": 1.8});