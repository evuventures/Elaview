-- Listing Inquiries (Booking Requests)
-- Listing inquiries are created by the renter
-- Listing inquiries are used to book a listing
-- Listing inquiries are used to track the status of a listing
-- Listing inquiries are used to track the price of a listing
-- Listing inquiries are used to track the availability of a listing


CREATE TABLE listing_inquiries (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES rental_listings(id),
  renter_id UUID REFERENCES user_profiles(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER GENERATED,
  quoted_price DECIMAL(10, 2) NOT NULL,
  message TEXT,
  status ENUM('pending', 'approved', 'declined', 'expired', 'cancelled'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);