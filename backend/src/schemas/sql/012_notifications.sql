-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  type ENUM('message', 'booking_request', 'booking_confirmed', 'review', 'payment', 'system'),
  title VARCHAR(200) NOT NULL,
  content TEXT,
  related_id UUID, -- Can reference any related entity
  related_type VARCHAR(50), -- 'listing', 'booking', 'message', etc.
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);