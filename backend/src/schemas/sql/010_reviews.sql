-- Reviews (for listings and users)
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  reviewer_id UUID REFERENCES user_profiles(id),
  reviewee_id UUID REFERENCES user_profiles(id),
  listing_id UUID REFERENCES rental_listings(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(200),
  comment TEXT,
  review_type ENUM('listing', 'landlord', 'renter'),
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id, reviewer_id, review_type)
);