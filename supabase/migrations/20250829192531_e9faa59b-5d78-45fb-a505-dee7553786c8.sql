-- Add more Baltic Sea vessels
INSERT INTO public.vessels (id, vessel_name, imo_number, mmsi, vessel_type, flag_state, sanctions_status, risk_score, owner, operator, built_year, gross_tonnage) VALUES
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