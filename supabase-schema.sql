-- Daily.Deals — Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS retailers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  logo_url VARCHAR(500),
  website_url VARCHAR(500),
  country VARCHAR(4) DEFAULT 'BOTH' CHECK (country IN ('US','CA','BOTH')),
  category VARCHAR(100),
  affiliate_net VARCHAR(20) DEFAULT 'cj' CHECK (affiliate_net IN ('amazon','cj','shareasale','direct')),
  brand_color VARCHAR(7) DEFAULT '#0A1628',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deals (
  id SERIAL PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  original_price DECIMAL(10,2),
  deal_price DECIMAL(10,2) NOT NULL,
  discount_percent INT,
  retailer_id INT NOT NULL REFERENCES retailers(id),
  category VARCHAR(100),
  image_url VARCHAR(500),
  affiliate_url VARCHAR(1000) NOT NULL,
  coupon_code VARCHAR(50),
  is_online BOOLEAN DEFAULT true,
  is_national BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  country VARCHAR(4) DEFAULT 'BOTH' CHECK (country IN ('US','CA','BOTH')),
  deal_type VARCHAR(20) DEFAULT 'daily' CHECK (deal_type IN ('flash','daily','clearance','coupon')),
  location_region VARCHAR(20),
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  click_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deal_clicks (
  id SERIAL PRIMARY KEY,
  deal_id INT NOT NULL REFERENCES deals(id),
  clicked_at TIMESTAMP DEFAULT NOW(),
  user_country VARCHAR(2),
  user_city VARCHAR(100),
  user_postal VARCHAR(10),
  referrer VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS email_subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(254) NOT NULL UNIQUE,
  location_city VARCHAR(100),
  location_country VARCHAR(2),
  location_postal VARCHAR(10),
  subscribed_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  city VARCHAR(100) NOT NULL,
  state_province VARCHAR(100) NOT NULL,
  state_code VARCHAR(10) NOT NULL,
  country VARCHAR(2) NOT NULL CHECK (country IN ('US','CA')),
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6)
);

-- RETAILERS
INSERT INTO retailers (name,slug,website_url,country,category,affiliate_net,brand_color) VALUES
('Amazon','amazon','https://amazon.com','US','General','amazon','#FF9900'),
('Walmart','walmart','https://walmart.com','US','General','cj','#0071CE'),
('Target','target','https://target.com','US','General','cj','#CC0000'),
('Best Buy','best-buy','https://bestbuy.com','US','Electronics','cj','#003087'),
('Home Depot','home-depot','https://homedepot.com','US','Home','cj','#F96302'),
('Lowes','lowes','https://lowes.com','US','Home','cj','#004990'),
('Macys','macys','https://macys.com','US','Fashion','shareasale','#000000'),
('Nike','nike','https://nike.com','US','Sports','shareasale','#111111'),
('Kohls','kohls','https://kohls.com','US','Fashion','cj','#5A0025'),
('Gap','gap','https://gap.com','US','Fashion','cj','#1B1B1B'),
('Amazon Canada','amazon-ca','https://amazon.ca','CA','General','amazon','#FF9900'),
('Walmart Canada','walmart-ca','https://walmart.ca','CA','General','cj','#0071CE'),
('Canadian Tire','canadian-tire','https://canadiantire.ca','CA','Automotive','direct','#C8102E'),
('Best Buy Canada','best-buy-ca','https://bestbuy.ca','CA','Electronics','cj','#003087'),
('Sport Chek','sport-chek','https://sportchek.ca','CA','Sports','direct','#E31837'),
('The Bay','the-bay','https://thebay.com','CA','Fashion','shareasale','#000000'),
('Staples Canada','staples-ca','https://staples.ca','CA','Office','cj','#CC0000'),
('Home Depot CA','home-depot-ca','https://homedepot.ca','CA','Home','cj','#F96302'),
('Loblaws','loblaws','https://loblaws.ca','CA','Grocery','direct','#D62828'),
('Winners','winners','https://winners.ca','CA','Fashion','direct','#004B8D')
ON CONFLICT (slug) DO NOTHING;

-- DEALS
INSERT INTO deals (title,description,original_price,deal_price,discount_percent,retailer_id,category,affiliate_url,is_online,is_national,country,deal_type,is_featured) VALUES
('Apple AirPods Pro 2nd Gen','Best-in-class noise cancellation with Adaptive Audio. USB-C charging case.',249.00,149.00,40,1,'Electronics','https://amazon.com/dp/B0CHWRXH8B?tag=dailydeals-us-20',true,true,'US','flash',true),
('Samsung 65 4K QLED TV','Quantum HDR, 120Hz refresh rate, built-in Alexa.',1299.00,699.00,46,4,'Electronics','https://bestbuy.com/site/samsung-65-tv',true,true,'US','daily',true),
('KitchenAid Stand Mixer 5qt','Professional 5-quart stand mixer with 10 speeds.',449.00,279.00,38,3,'Home & Kitchen','https://target.com/p/kitchenaid-mixer',true,true,'US','daily',false),
('Ninja Air Fryer XL 5.5qt','Max Crisp technology. Fits a 5 lb chicken.',129.00,79.00,39,2,'Home & Kitchen','https://walmart.com/ip/ninja-air-fryer',true,true,'US','daily',false),
('Nike Air Max 270 Sneakers','Lightweight foam for all-day comfort. Available in 8 colorways.',150.00,89.00,41,8,'Fashion','https://nike.com/t/air-max-270',true,true,'US','daily',false),
('Dyson V15 Detect Cordless Vacuum','Laser reveals hidden dust. Up to 60 min runtime.',749.00,499.00,33,1,'Home & Kitchen','https://amazon.com/dp/dyson-v15?tag=dailydeals-us-20',true,true,'US','flash',true),
('Levi 501 Original Jeans','Classic straight fit. 100% cotton denim.',79.00,39.00,51,10,'Fashion','https://gap.com/levi-501',true,true,'US','clearance',false),
('DeWalt 20V Cordless Drill Kit','Includes drill, two batteries, charger and kit bag.',199.00,119.00,40,5,'Tools','https://homedepot.com/dewalt-drill',true,true,'US','daily',false),
('Instant Pot Duo 7-in-1 6qt','Pressure cooker, slow cooker, rice cooker and more.',99.00,59.00,40,2,'Home & Kitchen','https://walmart.com/ip/instant-pot-duo',true,true,'US','flash',false),
('Apple Watch Series 9 GPS 41mm','Carbon neutral. Double tap gesture. Always-on Retina display.',399.00,299.00,25,4,'Electronics','https://bestbuy.com/apple-watch-s9',true,true,'US','daily',true),
('Columbia Mens Winter Jacket','Omni-Heat thermal reflective lining. Waterproof.',220.00,99.00,55,9,'Fashion','https://kohls.com/columbia-jacket',true,true,'US','clearance',false),
('Cuisinart 12-Cup Coffee Maker','Brew strength control, 24-hr programmable.',79.00,44.00,44,3,'Home & Kitchen','https://target.com/cuisinart-coffee',true,true,'US','daily',false),
('LG 27 4K UHD Monitor','USB-C connectivity, HDR10, 99% sRGB color accuracy.',599.00,329.00,45,4,'Electronics','https://bestbuy.com/lg-27-monitor',true,true,'US','daily',false),
('Adidas Ultraboost 22 Running Shoes','BOOST midsole returns energy with every stride.',190.00,109.00,43,1,'Sports','https://amazon.com/adidas-ultraboost?tag=dailydeals-us-20',true,true,'US','daily',false),
('iRobot Roomba i3 Robot Vacuum','Learns your home. Schedules cleaning automatically.',349.00,199.00,43,1,'Home & Kitchen','https://amazon.com/roomba-i3?tag=dailydeals-us-20',true,true,'US','flash',true),
('Apple AirPods Pro 2nd Gen CA','Best-in-class noise cancellation. USB-C charging case.',329.00,199.00,40,11,'Electronics','https://amazon.ca/dp/B0CHWRXH8B?tag=dailydeals-ca-20',true,true,'CA','flash',true),
('Samsung 65 4K TV Canada','Quantum HDR 12x, 120Hz, built-in Bixby.',1699.00,899.00,47,14,'Electronics','https://bestbuy.ca/samsung-65-tv',true,true,'CA','daily',true),
('Canadian Tire 6-Piece BBQ Set','Stainless steel tools with ergonomic handles.',79.00,39.00,51,13,'Outdoor','https://canadiantire.ca/bbq-set',true,true,'CA','clearance',false),
('Nike Air Max 270 CA','Lightweight foam. Free shipping over $75.',185.00,109.00,41,11,'Fashion','https://amazon.ca/nike-air-max?tag=dailydeals-ca-20',true,true,'CA','daily',false),
('Dyson V12 Detect Slim','Intelligent suction. Up to 60 min runtime.',899.00,599.00,33,11,'Home & Kitchen','https://amazon.ca/dyson-v12?tag=dailydeals-ca-20',true,true,'CA','flash',true),
('The Bay Calvin Klein Jacket','Quilted puffer jacket. Water resistant.',250.00,129.00,48,16,'Fashion','https://thebay.com/calvin-klein-jacket',true,true,'CA','daily',false),
('Sport Chek Under Armour Hoodie','Fleece lining. Available in 6 colors.',89.00,44.00,51,15,'Sports','https://sportchek.ca/ua-hoodie',true,true,'CA','clearance',false),
('Staples Canada Office Chair','Ergonomic mesh back, adjustable lumbar support.',299.00,159.00,47,17,'Office','https://staples.ca/office-chair',true,true,'CA','daily',false),
('Home Depot Canada Dewalt Combo Kit','20V cordless 2-tool combo. 2 batteries included.',379.00,229.00,40,18,'Tools','https://homedepot.ca/dewalt-combo',true,true,'CA','daily',false),
('Apple Watch SE 2nd Gen CA','Crash Detection, fall detection, swimproof.',329.00,249.00,24,14,'Electronics','https://bestbuy.ca/apple-watch-se',true,true,'CA','daily',false),
('Winners Hunter Rain Boots','Waterproof rubber. Adjustable back gusset.',180.00,69.00,62,20,'Fashion','https://winners.ca/hunter-boots',true,true,'CA','clearance',false),
('Amazon Echo Dot 5th Gen CA','Improved audio. Motion detection. Works with Alexa.',79.00,34.00,57,11,'Electronics','https://amazon.ca/echo-dot-5?tag=dailydeals-ca-20',true,true,'CA','flash',false),
('Canadian Tire Mastercraft Tool Box','26-inch 5-drawer roller cabinet. Lockable.',299.00,149.00,50,13,'Tools','https://canadiantire.ca/mastercraft-toolbox',true,true,'CA','clearance',false),
('Sport Chek Nike Running Shoes','Nike Pegasus 41. React foam cushioning.',160.00,99.00,38,15,'Sports','https://sportchek.ca/nike-pegasus-41',true,true,'CA','daily',false),
('Loblaws PC Insiders Collection Box','Monthly curated box of Presidents Choice products.',59.00,35.00,41,19,'Grocery','https://loblaws.ca/pc-box',true,true,'CA','daily',false);

-- LOCATIONS
INSERT INTO locations (slug,city,state_province,state_code,country,latitude,longitude) VALUES
('richmond-va','Richmond','Virginia','VA','US',37.5407,-77.4360),
('new-york-ny','New York','New York','NY','US',40.7128,-74.0060),
('los-angeles-ca','Los Angeles','California','CA','US',34.0522,-118.2437),
('chicago-il','Chicago','Illinois','IL','US',41.8781,-87.6298),
('houston-tx','Houston','Texas','TX','US',29.7604,-95.3698),
('dallas-tx','Dallas','Texas','TX','US',32.7767,-96.7970),
('seattle-wa','Seattle','Washington','WA','US',47.6062,-122.3321),
('boston-ma','Boston','Massachusetts','MA','US',42.3601,-71.0589),
('miami-fl','Miami','Florida','FL','US',25.7617,-80.1918),
('atlanta-ga','Atlanta','Georgia','GA','US',33.7490,-84.3880),
('denver-co','Denver','Colorado','CO','US',39.7392,-104.9903),
('las-vegas-nv','Las Vegas','Nevada','NV','US',36.1699,-115.1398),
('nashville-tn','Nashville','Tennessee','TN','US',36.1627,-86.7816),
('hays-ks','Hays','Kansas','KS','US',38.8793,-99.3268),
('orlando-fl','Orlando','Florida','FL','US',28.5383,-81.3792),
('raleigh-nc','Raleigh','North Carolina','NC','US',35.7796,-78.6382),
('san-francisco-ca','San Francisco','California','CA','US',37.7749,-122.4194),
('toronto-on','Toronto','Ontario','ON','CA',43.6532,-79.3832),
('markham-on','Markham','Ontario','ON','CA',43.8561,-79.3370),
('vancouver-bc','Vancouver','British Columbia','BC','CA',49.2827,-123.1207),
('calgary-ab','Calgary','Alberta','AB','CA',51.0447,-114.0719),
('edmonton-ab','Edmonton','Alberta','AB','CA',53.5461,-113.4938),
('ottawa-on','Ottawa','Ontario','ON','CA',45.4215,-75.6972),
('montreal-qc','Montreal','Quebec','QC','CA',45.5017,-73.5673),
('winnipeg-mb','Winnipeg','Manitoba','MB','CA',49.8951,-97.1384),
('hamilton-on','Hamilton','Ontario','ON','CA',43.2557,-79.8711),
('mississauga-on','Mississauga','Ontario','ON','CA',43.5890,-79.6441),
('brampton-on','Brampton','Ontario','ON','CA',43.7315,-79.7624),
('niagara-falls-on','Niagara Falls','Ontario','ON','CA',43.0896,-79.0849),
('richmond-hill-on','Richmond Hill','Ontario','ON','CA',43.8828,-79.4403),
('kelowna-bc','Kelowna','British Columbia','BC','CA',49.8880,-119.4960),
('halifax-ns','Halifax','Nova Scotia','NS','CA',44.6488,-63.5752),
('victoria-bc','Victoria','British Columbia','BC','CA',48.4284,-123.3656),
('saskatoon-sk','Saskatoon','Saskatchewan','SK','CA',52.1332,-106.6700),
('london-on','London','Ontario','ON','CA',42.9849,-81.2453),
('windsor-on','Windsor','Ontario','ON','CA',42.3149,-83.0364),
('barrie-on','Barrie','Ontario','ON','CA',44.3894,-79.6903)
ON CONFLICT (slug) DO NOTHING;
