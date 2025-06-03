-- Rental Listings (advertising spaces)
-- Rental listings are created by the landlord
-- Rental listings are used to advertise a space for rent
-- Rental listings are used to track the availability of a listing
-- Rental listings are used to track the price of a listing
-- Rental listings are used to track the availability of a listing


CREATE TABLE rental_listings (
  id UUID PRIMARY KEY,
  landlord_id UUID REFERENCES user_profiles(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type ENUM('wall', 'window', 'car', 'billboard', 'storefront', 'digital_screen', 'other'),
  status ENUM('draft', 'active', 'inactive', 'under_review', 'suspended', 'archived'),
  address_line1 TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  width_ft DECIMAL(8, 2),
  height_ft DECIMAL(8, 2),
  area_sqft DECIMAL(10, 2) GENERATED,
  price_per_day DECIMAL(10, 2) NOT NULL,
  minimum_rental_days INTEGER DEFAULT 1,
  primary_image_url TEXT,
  image_urls TEXT[],
  features TEXT[],
  visibility_rating INTEGER,
  allows_digital BOOLEAN DEFAULT TRUE,
  allows_physical BOOLEAN DEFAULT TRUE,
  content_restrictions TEXT[],
  view_count INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0,
  booking_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

