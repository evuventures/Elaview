*THESE ARE NON-VERIFIED SAMPLES FOR REFERENCE AND DEVELOPMENT*
*-----------------------------------------------*

-- Create enums for better data integrity
CREATE TYPE listing_type AS ENUM ('wall', 'window', 'car', 'billboard', 'storefront', 'digital_screen', 'other');
CREATE TYPE listing_status AS ENUM ('draft', 'active', 'inactive', 'under_review', 'suspended', 'archived');
CREATE TYPE availability_type AS ENUM ('available', 'booked', 'maintenance', 'pending');

-- Create rental_listings table
CREATE TABLE rental_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Owner information
  landlord_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic listing information
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type listing_type NOT NULL,
  status listing_status DEFAULT 'draft' NOT NULL,
  
  -- Location information
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(3) DEFAULT 'US' NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Physical dimensions (in feet)
  width_ft DECIMAL(8, 2),
  height_ft DECIMAL(8, 2),
  area_sqft DECIMAL(10, 2) GENERATED ALWAYS AS (width_ft * height_ft) STORED,
  
  -- Pricing information
  price_per_day DECIMAL(10, 2) NOT NULL CHECK (price_per_day >= 0),
  price_per_week DECIMAL(10, 2) GENERATED ALWAYS AS (price_per_day * 7 * 0.9) STORED, -- 10% weekly discount
  price_per_month DECIMAL(10, 2) GENERATED ALWAYS AS (price_per_day * 30 * 0.8) STORED, -- 20% monthly discount
  security_deposit DECIMAL(10, 2) DEFAULT 0,
  
  -- Availability information
  available_from DATE,
  available_until DATE,
  minimum_rental_days INTEGER DEFAULT 1 CHECK (minimum_rental_days > 0),
  maximum_rental_days INTEGER CHECK (maximum_rental_days IS NULL OR maximum_rental_days >= minimum_rental_days),
  
  -- Media and documentation
  primary_image_url TEXT,
  image_urls TEXT[] DEFAULT '{}',
  video_url TEXT,
  document_urls TEXT[] DEFAULT '{}', -- permits, contracts, etc.
  
  -- Additional features and amenities
  features TEXT[] DEFAULT '{}', -- ['lit', 'high_traffic', 'weather_protected', etc.]
  visibility_rating INTEGER CHECK (visibility_rating BETWEEN 1 AND 10),
  traffic_count_daily INTEGER,
  
  -- Business rules
  allows_digital BOOLEAN DEFAULT TRUE,
  allows_physical BOOLEAN DEFAULT TRUE,
  content_restrictions TEXT[] DEFAULT '{}', -- ['no_alcohol', 'no_politics', etc.]
  
  -- SEO and search
  slug VARCHAR(250) UNIQUE,
  tags TEXT[] DEFAULT '{}',
  
  -- Analytics and performance
  view_count INTEGER DEFAULT 0,
  inquiry_count INTEGER DEFAULT 0,
  booking_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) CHECK (average_rating BETWEEN 0 AND 5),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Create availability calendar table (for managing bookings)
CREATE TABLE listing_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES rental_listings(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  availability_type availability_type DEFAULT 'available' NOT NULL,
  price_override DECIMAL(10, 2), -- Special pricing for specific dates
  notes TEXT,
  
  UNIQUE(listing_id, date)
);

-- Create booking inquiries table
CREATE TABLE listing_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES rental_listings(id) ON DELETE CASCADE NOT NULL,
  renter_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
  quoted_price DECIMAL(10, 2) NOT NULL,
  
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'expired')),
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days') NOT NULL
);

-- Enable RLS
ALTER TABLE rental_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rental_listings
CREATE POLICY "Public can view active listings" ON rental_listings
  FOR SELECT USING (status = 'active' AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Landlords can manage own listings" ON rental_listings
  FOR ALL USING (auth.uid() = landlord_id);

CREATE POLICY "Authenticated users can view all non-draft listings" ON rental_listings
  FOR SELECT USING (auth.role() = 'authenticated' AND status != 'draft');

-- RLS Policies for listing_availability
CREATE POLICY "Public can view availability for active listings" ON listing_availability
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rental_listings 
      WHERE id = listing_id AND status = 'active'
    )
  );

CREATE POLICY "Landlords can manage availability" ON listing_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM rental_listings 
      WHERE id = listing_id AND landlord_id = auth.uid()
    )
  );

-- RLS Policies for listing_inquiries
CREATE POLICY "Users can view own inquiries" ON listing_inquiries
  FOR SELECT USING (auth.uid() = renter_id OR auth.uid() IN (
    SELECT landlord_id FROM rental_listings WHERE id = listing_id
  ));

CREATE POLICY "Renters can create inquiries" ON listing_inquiries
  FOR INSERT WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Landlords can respond to inquiries" ON listing_inquiries
  FOR UPDATE USING (auth.uid() IN (
    SELECT landlord_id FROM rental_listings WHERE id = listing_id
  ));

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rental_listings_updated_at
  BEFORE UPDATE ON rental_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_listing_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
    NEW.slug = TRIM(BOTH '-' FROM NEW.slug);
    -- Ensure uniqueness
    IF EXISTS (SELECT 1 FROM rental_listings WHERE slug = NEW.slug AND id != NEW.id) THEN
      NEW.slug = NEW.slug || '-' || EXTRACT(EPOCH FROM NOW())::bigint;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_rental_listing_slug
  BEFORE INSERT OR UPDATE ON rental_listings
  FOR EACH ROW
  EXECUTE FUNCTION generate_listing_slug();

-- Create indexes for performance
CREATE INDEX idx_rental_listings_landlord ON rental_listings(landlord_id);
CREATE INDEX idx_rental_listings_status ON rental_listings(status);
CREATE INDEX idx_rental_listings_type ON rental_listings(type);
CREATE INDEX idx_rental_listings_location ON rental_listings(city, state);
CREATE INDEX idx_rental_listings_coordinates ON rental_listings(latitude, longitude);
CREATE INDEX idx_rental_listings_price ON rental_listings(price_per_day);
CREATE INDEX idx_rental_listings_dates ON rental_listings(available_from, available_until);
CREATE INDEX idx_rental_listings_search ON rental_listings USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_rental_listings_tags ON rental_listings USING GIN(tags);
CREATE INDEX idx_rental_listings_features ON rental_listings USING GIN(features);

CREATE INDEX idx_listing_availability_date ON listing_availability(listing_id, date);
CREATE INDEX idx_listing_inquiries_listing ON listing_inquiries(listing_id);
CREATE INDEX idx_listing_inquiries_renter ON listing_inquiries(renter_id);
CREATE INDEX idx_listing_inquiries_status ON listing_inquiries(status);

-- Create view for public listing search
CREATE VIEW public_listings AS
SELECT 
  l.*,
  p.name as landlord_name,
  p.is_verified as landlord_verified,
  CASE 
    WHEN l.average_rating IS NOT NULL 
    THEN ROUND(l.average_rating, 1)
    ELSE NULL 
  END as rating,
  CASE 
    WHEN l.latitude IS NOT NULL AND l.longitude IS NOT NULL 
    THEN POINT(l.longitude, l.latitude)
    ELSE NULL 
  END as coordinates
FROM rental_listings l
JOIN user_profiles p ON l.landlord_id = p.id
WHERE l.status = 'active' 
  AND (l.expires_at IS NULL OR l.expires_at > NOW())
  AND p.is_active = TRUE;