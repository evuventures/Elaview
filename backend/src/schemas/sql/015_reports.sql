-- User Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY,
  reporter_id UUID REFERENCES user_profiles(id),
  reported_user_id UUID REFERENCES user_profiles(id),
  reported_listing_id UUID REFERENCES rental_listings(id),
  report_type ENUM('inappropriate_content', 'spam', 'fraud', 'harassment', 'fake_listing', 'other'),
  description TEXT NOT NULL,
  status ENUM('pending', 'investigating', 'resolved', 'dismissed'),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);