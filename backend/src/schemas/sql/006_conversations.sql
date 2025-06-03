-- Conversations (Message Threads)
-- Conversations are created when a landlord or renter messages another user
-- Conversations are created when a landlord or renter messages a listing
-- Conversations are created when a landlord or renter messages a user
-- Conversations are created when a landlord or renter messages a user


CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES rental_listings(id),
  landlord_id UUID REFERENCES user_profiles(id),
  renter_id UUID REFERENCES user_profiles(id),
  subject VARCHAR(200),
  status ENUM('active', 'archived', 'blocked', 'resolved'),
  last_message_at TIMESTAMPTZ,
  unread_by_landlord INTEGER DEFAULT 0,
  unread_by_renter INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id, renter_id)
);