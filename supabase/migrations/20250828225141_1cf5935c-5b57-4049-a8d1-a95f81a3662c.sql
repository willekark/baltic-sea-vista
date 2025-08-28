-- Add sample vessels for demonstration
INSERT INTO vessels (id, vessel_name, vessel_type, imo_number, mmsi, flag_state, gross_tonnage, built_year, owner, operator, risk_score) VALUES
(gen_random_uuid(), 'Atlantic Pioneer', 'Container Ship', 9876543, 123456789, 'Panama', 95000, 2018, 'Global Shipping Corp', 'Maritime Solutions Ltd', 3),
(gen_random_uuid(), 'Baltic Express', 'Bulk Carrier', 9876544, 123456790, 'Liberia', 75000, 2020, 'Nordic Maritime AS', 'Scandinavian Logistics', 2),
(gen_random_uuid(), 'North Sea Trader', 'General Cargo', 9876545, 123456791, 'Marshall Islands', 45000, 2016, 'European Shipping Inc', 'Baltic Operations', 4),
(gen_random_uuid(), 'Greenland Voyager', 'Tanker', 9876546, 123456792, 'Singapore', 120000, 2019, 'Arctic Shipping Co', 'Northern Routes Ltd', 1),
(gen_random_uuid(), 'Stockholm Runner', 'Container Ship', 9876547, 123456793, 'Denmark', 85000, 2021, 'Scandinavian Lines', 'Danish Maritime', 2);

-- Add realistic AIS tracking data for route analysis (last 30 days)
INSERT INTO ais_tracking (id, vessel_id, timestamp, location_lat, location_lng, speed, course, heading, status, destination, imo_number, mmsi, source)
SELECT 
  gen_random_uuid(),
  v.id,
  NOW() - INTERVAL '1 day' * (random() * 30),
  -- Baltic Sea coordinates with realistic shipping routes
  55.0 + (random() * 5), -- Latitude between 55-60 (Baltic Sea region)
  10.0 + (random() * 15), -- Longitude between 10-25 (Baltic Sea region)
  5 + (random() * 15), -- Speed between 5-20 knots
  random() * 360, -- Course 0-360 degrees
  random() * 360, -- Heading 0-360 degrees
  CASE WHEN random() < 0.1 THEN 'At anchor' ELSE 'Under way using engine' END,
  CASE (random() * 4)::int 
    WHEN 0 THEN 'Stockholm'
    WHEN 1 THEN 'Helsinki' 
    WHEN 2 THEN 'Copenhagen'
    ELSE 'Gdansk'
  END,
  v.imo_number,
  v.mmsi,
  'ais'
FROM vessels v
CROSS JOIN generate_series(1, 50); -- 50 positions per vessel

-- Add some low-speed "port time" data for efficiency analysis
INSERT INTO ais_tracking (id, vessel_id, timestamp, location_lat, location_lng, speed, course, heading, status, destination, imo_number, mmsi, source)
SELECT 
  gen_random_uuid(),
  v.id,
  NOW() - INTERVAL '1 day' * (random() * 30),
  -- Port locations
  CASE (random() * 4)::int 
    WHEN 0 THEN 59.3293 -- Stockholm
    WHEN 1 THEN 60.1699 -- Helsinki
    WHEN 2 THEN 55.6761 -- Copenhagen
    ELSE 54.3520 -- Gdansk
  END,
  CASE (random() * 4)::int 
    WHEN 0 THEN 18.0686 -- Stockholm
    WHEN 1 THEN 24.9384 -- Helsinki  
    WHEN 2 THEN 12.5683 -- Copenhagen
    ELSE 18.6466 -- Gdansk
  END,
  random() * 2, -- Very low speed (in port)
  random() * 360,
  random() * 360,
  'At anchor',
  CASE (random() * 4)::int 
    WHEN 0 THEN 'Stockholm'
    WHEN 1 THEN 'Helsinki'
    WHEN 2 THEN 'Copenhagen' 
    ELSE 'Gdansk'
  END,
  v.imo_number,
  v.mmsi,
  'ais'
FROM vessels v
CROSS JOIN generate_series(1, 15); -- 15 port positions per vessel

-- Add environmental data for weather routing analysis
INSERT INTO environmental_data (id, timestamp, location_lat, location_lng, data_type, value, unit, source, quality_flag)
SELECT 
  gen_random_uuid(),
  NOW() - INTERVAL '1 day' * (random() * 30),
  55.0 + (random() * 5),
  10.0 + (random() * 15),
  'wind_speed',
  5 + (random() * 20), -- Wind speed 5-25 m/s
  'm/s',
  'weather_station',
  'good'
FROM generate_series(1, 100);

-- Add more cargo flow data for market analysis
INSERT INTO cargo_flows (id, cargo_type, origin_region, destination_region, volume_tons, rate_per_ton, currency, valid_from, valid_until, frequency, demand_level, commodity_group)
SELECT 
  gen_random_uuid(),
  CASE (random() * 4)::int 
    WHEN 0 THEN 'Containers'
    WHEN 1 THEN 'Bulk Cargo'
    WHEN 2 THEN 'Oil Products'
    ELSE 'General Cargo'
  END,
  CASE (random() * 3)::int 
    WHEN 0 THEN 'Northern Europe'
    WHEN 1 THEN 'Scandinavia'
    ELSE 'Baltic States'
  END,
  CASE (random() * 3)::int 
    WHEN 0 THEN 'Northern Europe'
    WHEN 1 THEN 'Scandinavia' 
    ELSE 'Baltic States'
  END,
  1000 + (random() * 50000), -- Volume 1,000-51,000 tons
  50 + (random() * 200), -- Rate 50-250 EUR per ton
  'EUR',
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE + INTERVAL '60 days',
  CASE (random() * 3)::int 
    WHEN 0 THEN 'weekly'
    WHEN 1 THEN 'monthly'
    ELSE 'quarterly'
  END,
  CASE (random() * 3)::int 
    WHEN 0 THEN 'high'
    WHEN 1 THEN 'medium'
    ELSE 'low'
  END,
  CASE (random() * 4)::int 
    WHEN 0 THEN 'manufactured_goods'
    WHEN 1 THEN 'energy'
    WHEN 2 THEN 'raw_materials'
    ELSE 'food_products'
  END
FROM generate_series(1, 50);

-- Add shadow fleet alerts for risk analysis
INSERT INTO shadow_fleet_alerts (id, vessel_id, alert_type, priority, title, description, status)
SELECT 
  gen_random_uuid(),
  v.id,
  CASE (random() * 3)::int 
    WHEN 0 THEN 'sanctions_risk'
    WHEN 1 THEN 'dark_zone_activity'
    ELSE 'suspicious_behavior'
  END,
  CASE (random() * 3)::int 
    WHEN 0 THEN 'high'
    WHEN 1 THEN 'medium'
    ELSE 'low'
  END,
  'Potential compliance issue detected',
  'Automated risk assessment flagged this vessel for review',
  'active'
FROM vessels v
WHERE random() < 0.6; -- 60% of vessels have alerts

-- Add sanctions list entries
INSERT INTO sanctions_lists (id, entity_type, entity_name, sanction_type, sanction_authority, effective_date, sanction_reason, status)
VALUES 
(gen_random_uuid(), 'vessel', 'Sanctioned Vessel Alpha', 'asset_freeze', 'EU', CURRENT_DATE - INTERVAL '180 days', 'Sanctions evasion', 'active'),
(gen_random_uuid(), 'company', 'Blocked Shipping Corp', 'comprehensive', 'US OFAC', CURRENT_DATE - INTERVAL '90 days', 'Supporting sanctioned regime', 'active'),
(gen_random_uuid(), 'individual', 'John Doe Maritime', 'travel_ban', 'UN', CURRENT_DATE - INTERVAL '365 days', 'Sanctions violations', 'active');

-- Add CO2 emissions data
INSERT INTO co2_emissions (id, timestamp, location_lat, location_lng, data_type, value, unit, source, vessel_id)
SELECT 
  gen_random_uuid(),
  NOW() - INTERVAL '1 day' * (random() * 30),
  55.0 + (random() * 5),
  10.0 + (random() * 15),
  'co2_emissions',
  10 + (random() * 40), -- 10-50 tons CO2 per day
  'tons_per_day',
  'vessel_monitoring',
  v.id
FROM vessels v
CROSS JOIN generate_series(1, 20); -- 20 emission readings per vessel