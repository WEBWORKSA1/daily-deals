-- ============================================================================
-- STEP 1: LOCAL DEALS — Schema additions
-- Run in Supabase SQL Editor
-- ============================================================================

-- 1. Add geo columns to retailers (for physical store locations)
ALTER TABLE retailers
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 7),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 7),
  ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10),
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS province_state VARCHAR(50),
  ADD COLUMN IF NOT EXISTS has_physical_stores BOOLEAN DEFAULT FALSE;

-- 2. Add geo + online flag to deals
ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS is_online_only BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS store_latitude DECIMAL(10, 7),
  ADD COLUMN IF NOT EXISTS store_longitude DECIMAL(10, 7),
  ADD COLUMN IF NOT EXISTS store_city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS store_postal VARCHAR(10);

-- 3. Postal code / ZIP → location lookup table
CREATE TABLE IF NOT EXISTS postal_code_locations (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  country VARCHAR(2) NOT NULL,
  city VARCHAR(100) NOT NULL,
  province_state VARCHAR(50),
  state_code VARCHAR(5),
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_postal_code ON postal_code_locations(code);
CREATE INDEX IF NOT EXISTS idx_postal_country ON postal_code_locations(country);
CREATE INDEX IF NOT EXISTS idx_deals_geo ON deals(store_latitude, store_longitude) WHERE is_online_only = FALSE;

-- 4. Seed common postal codes / ZIPs (top metros)
INSERT INTO postal_code_locations (code, country, city, province_state, state_code, latitude, longitude) VALUES
  -- Canadian postal codes (FSA format — first 3 chars)
  ('L6E', 'CA', 'Markham', 'Ontario', 'ON', 43.8561, -79.3370),
  ('L3R', 'CA', 'Markham', 'Ontario', 'ON', 43.8501, -79.3370),
  ('L3P', 'CA', 'Markham', 'Ontario', 'ON', 43.8800, -79.2700),
  ('M5V', 'CA', 'Toronto', 'Ontario', 'ON', 43.6426, -79.3871),
  ('M5H', 'CA', 'Toronto', 'Ontario', 'ON', 43.6500, -79.3800),
  ('M4W', 'CA', 'Toronto', 'Ontario', 'ON', 43.6757, -79.3839),
  ('M5G', 'CA', 'Toronto', 'Ontario', 'ON', 43.6580, -79.3868),
  ('M5J', 'CA', 'Toronto', 'Ontario', 'ON', 43.6440, -79.3800),
  ('L4Y', 'CA', 'Mississauga', 'Ontario', 'ON', 43.5890, -79.6441),
  ('L5M', 'CA', 'Mississauga', 'Ontario', 'ON', 43.5800, -79.7200),
  ('L4T', 'CA', 'Mississauga', 'Ontario', 'ON', 43.7100, -79.6500),
  ('L4L', 'CA', 'Vaughan', 'Ontario', 'ON', 43.8361, -79.5083),
  ('L6A', 'CA', 'Vaughan', 'Ontario', 'ON', 43.8500, -79.5200),
  ('L4B', 'CA', 'Richmond Hill', 'Ontario', 'ON', 43.8828, -79.4403),
  ('L6P', 'CA', 'Brampton', 'Ontario', 'ON', 43.7315, -79.7624),
  ('L6Y', 'CA', 'Brampton', 'Ontario', 'ON', 43.6800, -79.7600),
  ('K1A', 'CA', 'Ottawa', 'Ontario', 'ON', 45.4215, -75.6972),
  ('K1P', 'CA', 'Ottawa', 'Ontario', 'ON', 45.4200, -75.6900),
  ('H3A', 'CA', 'Montreal', 'Quebec', 'QC', 45.5048, -73.5772),
  ('H2X', 'CA', 'Montreal', 'Quebec', 'QC', 45.5100, -73.5700),
  ('H3B', 'CA', 'Montreal', 'Quebec', 'QC', 45.5017, -73.5673),
  ('V6B', 'CA', 'Vancouver', 'British Columbia', 'BC', 49.2827, -123.1207),
  ('V6Z', 'CA', 'Vancouver', 'British Columbia', 'BC', 49.2800, -123.1300),
  ('V5K', 'CA', 'Vancouver', 'British Columbia', 'BC', 49.2700, -123.0700),
  ('T2P', 'CA', 'Calgary', 'Alberta', 'AB', 51.0447, -114.0719),
  ('T2N', 'CA', 'Calgary', 'Alberta', 'AB', 51.0500, -114.1300),
  ('T5J', 'CA', 'Edmonton', 'Alberta', 'AB', 53.5461, -113.4938),
  ('T6E', 'CA', 'Edmonton', 'Alberta', 'AB', 53.5200, -113.4900),
  ('R3C', 'CA', 'Winnipeg', 'Manitoba', 'MB', 49.8951, -97.1384),
  ('B3J', 'CA', 'Halifax', 'Nova Scotia', 'NS', 44.6488, -63.5752),

  -- US ZIP codes (top metros)
  ('10001', 'US', 'New York', 'New York', 'NY', 40.7506, -73.9971),
  ('10010', 'US', 'New York', 'New York', 'NY', 40.7400, -73.9800),
  ('10019', 'US', 'New York', 'New York', 'NY', 40.7660, -73.9870),
  ('10003', 'US', 'New York', 'New York', 'NY', 40.7300, -73.9890),
  ('11201', 'US', 'Brooklyn', 'New York', 'NY', 40.6943, -73.9903),
  ('90001', 'US', 'Los Angeles', 'California', 'CA', 33.9731, -118.2479),
  ('90028', 'US', 'Los Angeles', 'California', 'CA', 34.1016, -118.3267),
  ('90210', 'US', 'Beverly Hills', 'California', 'CA', 34.1030, -118.4105),
  ('94102', 'US', 'San Francisco', 'California', 'CA', 37.7793, -122.4193),
  ('94103', 'US', 'San Francisco', 'California', 'CA', 37.7726, -122.4099),
  ('94110', 'US', 'San Francisco', 'California', 'CA', 37.7510, -122.4150),
  ('60601', 'US', 'Chicago', 'Illinois', 'IL', 41.8857, -87.6228),
  ('60611', 'US', 'Chicago', 'Illinois', 'IL', 41.8964, -87.6212),
  ('60607', 'US', 'Chicago', 'Illinois', 'IL', 41.8740, -87.6520),
  ('77001', 'US', 'Houston', 'Texas', 'TX', 29.7589, -95.3677),
  ('77002', 'US', 'Houston', 'Texas', 'TX', 29.7500, -95.3600),
  ('75201', 'US', 'Dallas', 'Texas', 'TX', 32.7831, -96.8067),
  ('75202', 'US', 'Dallas', 'Texas', 'TX', 32.7800, -96.8000),
  ('78701', 'US', 'Austin', 'Texas', 'TX', 30.2672, -97.7431),
  ('33101', 'US', 'Miami', 'Florida', 'FL', 25.7617, -80.1918),
  ('33139', 'US', 'Miami Beach', 'Florida', 'FL', 25.7900, -80.1300),
  ('98101', 'US', 'Seattle', 'Washington', 'WA', 47.6101, -122.3344),
  ('98102', 'US', 'Seattle', 'Washington', 'WA', 47.6300, -122.3200),
  ('02108', 'US', 'Boston', 'Massachusetts', 'MA', 42.3582, -71.0637),
  ('02116', 'US', 'Boston', 'Massachusetts', 'MA', 42.3500, -71.0700),
  ('19103', 'US', 'Philadelphia', 'Pennsylvania', 'PA', 39.9526, -75.1652),
  ('20001', 'US', 'Washington', 'District of Columbia', 'DC', 38.9072, -77.0369),
  ('30303', 'US', 'Atlanta', 'Georgia', 'GA', 33.7490, -84.3880),
  ('80202', 'US', 'Denver', 'Colorado', 'CO', 39.7392, -104.9903),
  ('85001', 'US', 'Phoenix', 'Arizona', 'AZ', 33.4484, -112.0740),
  ('89101', 'US', 'Las Vegas', 'Nevada', 'NV', 36.1716, -115.1391),
  ('97201', 'US', 'Portland', 'Oregon', 'OR', 45.5152, -122.6784)
ON CONFLICT (code) DO NOTHING;

-- 5. Update existing retailers with primary store locations (where applicable)
UPDATE retailers SET has_physical_stores = TRUE WHERE slug IN (
  'walmart','target','best-buy','home-depot','nike','kohls','macys','gap',
  'walmart-ca','best-buy-ca','home-depot-ca','canadian-tire','sport-chek',
  'the-bay','loblaws','winners','staples-ca'
);

UPDATE retailers SET has_physical_stores = FALSE, latitude = NULL, longitude = NULL
  WHERE slug IN ('amazon','amazon-ca');
