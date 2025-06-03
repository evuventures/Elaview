-- Confirmed Bookings/Contracts
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  inquiry_id UUID REFERENCES listing_inquiries(id),
  listing_id UUID REFERENCES rental_listings(id),
  landlord_id UUID REFERENCES user_profiles(id),
  renter_id UUID REFERENCES user_profiles(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  security_deposit DECIMAL(10, 2),
  status ENUM('confirmed', 'active', 'completed', 'cancelled', 'disputed'),
  contract_terms TEXT,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);