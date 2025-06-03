// DO WE NEED THIS? // - Michael Anderson

-- Saved Listing Folders
-- Saved listing folders are created by the user
-- Saved listing folders are used to organize saved listings
-- Saved listing folders are used to filter saved listings
-- Saved listing folders are used to share saved listings with other users


CREATE TABLE saved_listing_folders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  name VARCHAR(100) NOT NULL,
  color_hex VARCHAR(7) DEFAULT '#3B82F6',
  icon_name VARCHAR(50) DEFAULT 'bookmark',
  is_default BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, name)
);