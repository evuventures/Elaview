-- Listing Availability Calendar
-- Listing availability is used to track the availability of a listing
-- Listing availability is used to track the price of a listing
-- Listing availability is used to track the availability of a listing
-- Listing availability is used to track the availability of a listing


CREATE TABLE listing_availability (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES rental_listings(id),
  date DATE NOT NULL,
  availability_type ENUM('available', 'booked', 'maintenance', 'blocked'),
  price_override DECIMAL(10, 2),
  UNIQUE(listing_id, date)
);