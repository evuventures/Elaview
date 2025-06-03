-- INDIVIDUAL MESSAGES WITHIN A CONVERSATION
-- Messages are sent by either the landlord or the renter
-- Messages are sent to a conversation
-- Messages are sent to a listing
-- Messages are sent to a user



CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  sender_id UUID REFERENCES user_profiles(id),
  message_type ENUM('text', 'image', 'document', 'booking_request', 'system'),
  content TEXT NOT NULL,
  attachment_urls TEXT[],
  is_edited BOOLEAN DEFAULT FALSE,
  read_by_landlord_at TIMESTAMPTZ,
  read_by_renter_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);