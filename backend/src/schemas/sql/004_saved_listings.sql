-- Saved Listings (Favorites)
-- Saved listings are created by the user
-- Saved listings are used to organize saved listings
-- Saved listings are used to filter saved listings
-- Saved listings are used to share saved listings with other users


CREATE TABLE saved_listings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  listing_id UUID REFERENCES rental_listings(id),
  folder_name VARCHAR(100) DEFAULT 'general',
  personal_notes TEXT,
  priority_level INTEGER DEFAULT 3,
  is_archived BOOLEAN DEFAULT FALSE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id) WHERE NOT is_archived
);