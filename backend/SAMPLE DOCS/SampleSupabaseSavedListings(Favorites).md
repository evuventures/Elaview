*THESE ARE NON-VERIFIED SAMPLES FOR REFERENCE AND DEVELOPMENT*
*-----------------------------------------------*

-- Create saved_listings table (user favorites)
CREATE TABLE saved_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- User and listing relationship
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES rental_listings(id) ON DELETE CASCADE NOT NULL,
  
  -- Organization and personalization
  folder_name VARCHAR(100) DEFAULT 'general', -- 'general', 'business', 'personal', etc.
  personal_notes TEXT,
  priority_level INTEGER DEFAULT 3 CHECK (priority_level BETWEEN 1 AND 5), -- 1=highest, 5=lowest
  
  -- Engagement tracking
  times_viewed INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  
  -- Status and metadata
  is_archived BOOLEAN DEFAULT FALSE,
  reminder_date DATE, -- User can set reminders for seasonal listings
  
  -- Timestamps
  saved_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
  
  -- Note: Unique constraint for non-archived items created separately below
);

-- Create saved_listing_folders table for organization
CREATE TABLE saved_listing_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color_hex VARCHAR(7) DEFAULT '#3B82F6', -- Blue default
  icon_name VARCHAR(50) DEFAULT 'bookmark', -- For UI icons
  
  sort_order INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- User can't have duplicate folder names
  UNIQUE(user_id, name)
);

-- Create saved_listing_tags table for flexible categorization
CREATE TABLE saved_listing_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  saved_listing_id UUID REFERENCES saved_listings(id) ON DELETE CASCADE NOT NULL,
  
  tag_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(saved_listing_id, tag_name)
);

-- Create partial unique index to prevent duplicate saves (except archived)
CREATE UNIQUE INDEX idx_saved_listings_unique_active 
ON saved_listings(user_id, listing_id) 
WHERE NOT is_archived;

-- Create user_listing_interactions table for analytics
CREATE TABLE user_listing_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES rental_listings(id) ON DELETE CASCADE NOT NULL,
  
  interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('view', 'save', 'unsave', 'inquiry', 'share')),
  metadata JSONB DEFAULT '{}', -- Store additional context
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for user_listing_interactions analytics
CREATE INDEX idx_interactions_user_type ON user_listing_interactions(user_id, interaction_type);
CREATE INDEX idx_interactions_listing_type ON user_listing_interactions(listing_id, interaction_type);

-- Enable RLS on all tables
ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_listing_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_listing_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_listing_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_listings
CREATE POLICY "Users can manage their own saved listings" ON saved_listings
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for saved_listing_folders
CREATE POLICY "Users can manage their own folders" ON saved_listing_folders
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for saved_listing_tags
CREATE POLICY "Users can manage tags on their saved listings" ON saved_listing_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM saved_listings 
      WHERE id = saved_listing_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for user_listing_interactions
CREATE POLICY "Users can view their own interactions" ON user_listing_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interactions" ON user_listing_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for saved_listings
CREATE TRIGGER update_saved_listings_updated_at
  BEFORE UPDATE ON saved_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for saved_listing_folders
CREATE TRIGGER update_saved_listing_folders_updated_at
  BEFORE UPDATE ON saved_listing_folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create default folder for new users
CREATE OR REPLACE FUNCTION create_default_folder()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO saved_listing_folders (user_id, name, is_default)
  VALUES (NEW.id, 'Favorites', TRUE)
  ON CONFLICT (user_id, name) DO NOTHING;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create default folder when user profile is created
CREATE TRIGGER create_user_default_folder
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_folder();

-- Function to track save/unsave interactions
CREATE OR REPLACE FUNCTION track_save_interaction()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Track save action
    INSERT INTO user_listing_interactions (user_id, listing_id, interaction_type, metadata)
    VALUES (NEW.user_id, NEW.listing_id, 'save', jsonb_build_object('folder', NEW.folder_name));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Track unsave action
    INSERT INTO user_listing_interactions (user_id, listing_id, interaction_type)
    VALUES (OLD.user_id, OLD.listing_id, 'unsave');
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger to track save/unsave interactions
CREATE TRIGGER track_saved_listing_interactions
  AFTER INSERT OR DELETE ON saved_listings
  FOR EACH ROW
  EXECUTE FUNCTION track_save_interaction();

-- Function to update view count when user views saved listing
CREATE OR REPLACE FUNCTION update_saved_listing_view()
RETURNS TRIGGER AS $$
BEGIN
  NEW.times_viewed = OLD.times_viewed + 1;
  NEW.last_viewed_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create indexes for performance
CREATE INDEX idx_saved_listings_user ON saved_listings(user_id);
CREATE INDEX idx_saved_listings_listing ON saved_listings(listing_id);
CREATE INDEX idx_saved_listings_folder ON saved_listings(user_id, folder_name);
CREATE INDEX idx_saved_listings_priority ON saved_listings(user_id, priority_level);
CREATE INDEX idx_saved_listings_saved_at ON saved_listings(user_id, saved_at DESC);
CREATE INDEX idx_saved_listings_archived ON saved_listings(user_id, is_archived);
CREATE INDEX idx_saved_listings_reminders ON saved_listings(user_id, reminder_date) WHERE reminder_date IS NOT NULL;

CREATE INDEX idx_saved_listing_folders_user ON saved_listing_folders(user_id, sort_order);
CREATE INDEX idx_saved_listing_tags_saved_listing ON saved_listing_tags(saved_listing_id);

-- Create useful views
CREATE VIEW user_saved_listings_summary AS
SELECT 
  sl.user_id,
  sl.folder_name,
  COUNT(*) as listing_count,
  COUNT(*) FILTER (WHERE rl.status = 'active') as active_count,
  AVG(rl.price_per_day) as avg_price,
  MAX(sl.saved_at) as last_saved_at
FROM saved_listings sl
JOIN rental_listings rl ON sl.listing_id = rl.id
WHERE sl.is_archived = FALSE
GROUP BY sl.user_id, sl.folder_name;

CREATE VIEW saved_listings_with_details AS
SELECT 
  sl.*,
  rl.title,
  rl.type,
  rl.price_per_day,
  rl.city,
  rl.state,
  rl.status as listing_status,
  rl.primary_image_url,
  up.name as landlord_name,
  up.is_verified as landlord_verified,
  ARRAY_AGG(slt.tag_name) FILTER (WHERE slt.tag_name IS NOT NULL) as tags
FROM saved_listings sl
JOIN rental_listings rl ON sl.listing_id = rl.id
JOIN user_profiles up ON rl.landlord_id = up.id
LEFT JOIN saved_listing_tags slt ON sl.id = slt.saved_listing_id
WHERE sl.is_archived = FALSE
GROUP BY sl.id, rl.id, up.id;

-- Create function for bulk operations
CREATE OR REPLACE FUNCTION bulk_update_saved_listings(
  p_user_id UUID,
  p_listing_ids UUID[],
  p_folder_name VARCHAR DEFAULT NULL,
  p_priority_level INTEGER DEFAULT NULL,
  p_is_archived BOOLEAN DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE saved_listings 
  SET 
    folder_name = COALESCE(p_folder_name, folder_name),
    priority_level = COALESCE(p_priority_level, priority_level),
    is_archived = COALESCE(p_is_archived, is_archived),
    updated_at = NOW()
  WHERE user_id = p_user_id 
    AND listing_id = ANY(p_listing_ids)
    AND is_archived = FALSE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ language 'plpgsql' SECURITY DEFINER;