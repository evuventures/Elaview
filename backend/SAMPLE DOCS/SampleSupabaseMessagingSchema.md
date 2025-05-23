*THESE ARE NON-VERIFIED SAMPLES FOR REFERENCE AND DEVELOPMENT*
*-----------------------------------------------*

-- Create enums for message system
CREATE TYPE message_type AS ENUM ('text', 'image', 'document', 'system', 'inquiry', 'booking_request');
CREATE TYPE conversation_status AS ENUM ('active', 'archived', 'blocked', 'resolved');
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');

-- Create conversations table (message threads)
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Participants
  listing_id UUID REFERENCES rental_listings(id) ON DELETE CASCADE NOT NULL,
  landlord_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  renter_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Conversation metadata
  subject VARCHAR(200), -- "Inquiry about Wall Space on Main St"
  status conversation_status DEFAULT 'active' NOT NULL,
  
  -- Quick access to latest message
  last_message_text TEXT,
  last_message_at TIMESTAMPTZ,
  last_message_sender_id UUID REFERENCES user_profiles(id),
  
  -- Message counts
  total_messages INTEGER DEFAULT 0,
  unread_by_landlord INTEGER DEFAULT 0,
  unread_by_renter INTEGER DEFAULT 0,
  
  -- Conversation settings
  is_archived_by_landlord BOOLEAN DEFAULT FALSE,
  is_archived_by_renter BOOLEAN DEFAULT FALSE,
  is_muted_by_landlord BOOLEAN DEFAULT FALSE,
  is_muted_by_renter BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Ensure unique conversation per listing/renter pair
  UNIQUE(listing_id, renter_id)
);

-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  
  -- Message content
  sender_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  message_type message_type DEFAULT 'text' NOT NULL,
  content TEXT NOT NULL,
  
  -- File attachments
  attachment_urls TEXT[] DEFAULT '{}',
  attachment_names TEXT[] DEFAULT '{}',
  attachment_sizes INTEGER[] DEFAULT '{}', -- file sizes in bytes
  
  -- Message metadata
  status message_status DEFAULT 'sent' NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  original_content TEXT, -- Store original if edited
  
  -- Threading and replies
  reply_to_message_id UUID REFERENCES messages(id),
  
  -- System message data (for booking requests, etc.)
  system_data JSONB DEFAULT '{}',
  
  -- Read receipts
  read_by_landlord_at TIMESTAMPTZ,
  read_by_renter_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create message reactions table (like/dislike, thumbs up, etc.)
CREATE TABLE message_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  
  reaction_type VARCHAR(20) NOT NULL, -- 'like', 'love', 'thumbs_up', etc.
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(message_id, user_id, reaction_type)
);

-- Create conversation participants table (for future group messaging)
CREATE TABLE conversation_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  
  role VARCHAR(20) DEFAULT 'participant' CHECK (role IN ('landlord', 'renter', 'participant', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  left_at TIMESTAMPTZ,
  
  -- Participant settings
  is_muted BOOLEAN DEFAULT FALSE,
  last_read_message_id UUID REFERENCES messages(id),
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(conversation_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations they participate in" ON conversations
  FOR SELECT USING (
    auth.uid() = landlord_id OR 
    auth.uid() = renter_id
  );

CREATE POLICY "Renters can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Participants can update conversation settings" ON conversations
  FOR UPDATE USING (
    auth.uid() = landlord_id OR 
    auth.uid() = renter_id
  );

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_id 
      AND (landlord_id = auth.uid() OR renter_id = auth.uid())
    )
  );

CREATE POLICY "Conversation participants can send messages" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_id 
      AND (landlord_id = auth.uid() OR renter_id = auth.uid())
      AND status = 'active'
    )
    AND auth.uid() = sender_id
  );

CREATE POLICY "Message senders can edit their own messages" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- RLS Policies for message_reactions
CREATE POLICY "Users can manage reactions in their conversations" ON message_reactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE m.id = message_id 
      AND (c.landlord_id = auth.uid() OR c.renter_id = auth.uid())
    )
    AND auth.uid() = user_id
  );

-- RLS Policies for conversation_participants
CREATE POLICY "Users can view participants in their conversations" ON conversation_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE id = conversation_id 
      AND (landlord_id = auth.uid() OR renter_id = auth.uid())
    )
  );

-- Create functions and triggers

-- Function to update conversation metadata when messages are added
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update conversation with latest message info
    UPDATE conversations 
    SET 
      last_message_text = LEFT(NEW.content, 100), -- Truncate for preview
      last_message_at = NEW.created_at,
      last_message_sender_id = NEW.sender_id,
      total_messages = total_messages + 1,
      unread_by_landlord = CASE 
        WHEN NEW.sender_id != landlord_id THEN unread_by_landlord + 1 
        ELSE unread_by_landlord 
      END,
      unread_by_renter = CASE 
        WHEN NEW.sender_id != renter_id THEN unread_by_renter + 1 
        ELSE unread_by_renter 
      END,
      updated_at = NOW()
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger to update conversation on new messages
CREATE TRIGGER update_conversation_on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
  is_landlord BOOLEAN;
BEGIN
  -- Check if user is landlord or renter
  SELECT (landlord_id = p_user_id) INTO is_landlord
  FROM conversations 
  WHERE id = p_conversation_id;
  
  -- Update read timestamps on unread messages
  IF is_landlord THEN
    UPDATE messages 
    SET read_by_landlord_at = NOW()
    WHERE conversation_id = p_conversation_id 
      AND sender_id != p_user_id 
      AND read_by_landlord_at IS NULL;
    
    -- Reset unread count for landlord
    UPDATE conversations 
    SET unread_by_landlord = 0
    WHERE id = p_conversation_id;
  ELSE
    UPDATE messages 
    SET read_by_renter_at = NOW()
    WHERE conversation_id = p_conversation_id 
      AND sender_id != p_user_id 
      AND read_by_renter_at IS NULL;
    
    -- Reset unread count for renter
    UPDATE conversations 
    SET unread_by_renter = 0
    WHERE id = p_conversation_id;
  END IF;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to create conversation with initial message
CREATE OR REPLACE FUNCTION create_conversation_with_message(
  p_listing_id UUID,
  p_renter_id UUID,
  p_initial_message TEXT,
  p_subject VARCHAR DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
  v_landlord_id UUID;
  v_listing_title TEXT;
BEGIN
  -- Get landlord_id and listing title
  SELECT landlord_id, title INTO v_landlord_id, v_listing_title
  FROM rental_listings 
  WHERE id = p_listing_id;
  
  -- Create or get existing conversation
  INSERT INTO conversations (listing_id, landlord_id, renter_id, subject)
  VALUES (
    p_listing_id, 
    v_landlord_id, 
    p_renter_id,
    COALESCE(p_subject, 'Inquiry about ' || v_listing_title)
  )
  ON CONFLICT (listing_id, renter_id) 
  DO UPDATE SET status = 'active'
  RETURNING id INTO v_conversation_id;
  
  -- Insert initial message
  INSERT INTO messages (conversation_id, sender_id, content)
  VALUES (v_conversation_id, p_renter_id, p_initial_message);
  
  RETURN v_conversation_id;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX idx_conversations_landlord ON conversations(landlord_id, updated_at DESC);
CREATE INDEX idx_conversations_renter ON conversations(renter_id, updated_at DESC);
CREATE INDEX idx_conversations_listing ON conversations(listing_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX idx_conversations_unread_landlord ON conversations(landlord_id) WHERE unread_by_landlord > 0;
CREATE INDEX idx_conversations_unread_renter ON conversations(renter_id) WHERE unread_by_renter > 0;

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id, created_at DESC);
CREATE INDEX idx_messages_unread_landlord ON messages(conversation_id) WHERE read_by_landlord_at IS NULL;
CREATE INDEX idx_messages_unread_renter ON messages(conversation_id) WHERE read_by_renter_at IS NULL;
CREATE INDEX idx_messages_content_search ON messages USING GIN(to_tsvector('english', content));

CREATE INDEX idx_message_reactions_message ON message_reactions(message_id);
CREATE INDEX idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);

-- Create useful views
CREATE VIEW conversation_list AS
SELECT 
  c.*,
  rl.title as listing_title,
  rl.primary_image_url as listing_image,
  rl.city as listing_city,
  rl.type as listing_type,
  landlord.name as landlord_name,
  landlord.profile_image_url as landlord_image,
  renter.name as renter_name,
  renter.profile_image_url as renter_image,
  CASE 
    WHEN c.last_message_sender_id = c.landlord_id THEN landlord.name
    ELSE renter.name 
  END as last_sender_name
FROM conversations c
JOIN rental_listings rl ON c.listing_id = rl.id
JOIN user_profiles landlord ON c.landlord_id = landlord.id
JOIN user_profiles renter ON c.renter_id = renter.id
WHERE c.status = 'active';

CREATE VIEW message_thread AS
SELECT 
  m.*,
  sender.name as sender_name,
  sender.profile_image_url as sender_image,
  CASE 
    WHEN c.landlord_id = m.sender_id THEN 'landlord'
    WHEN c.renter_id = m.sender_id THEN 'renter'
    ELSE 'system'
  END as sender_role,
  ARRAY_AGG(
    DISTINCT jsonb_build_object(
      'type', mr.reaction_type,
      'user_id', mr.user_id,
      'user_name', reactor.name
    )
  ) FILTER (WHERE mr.id IS NOT NULL) as reactions
FROM messages m
JOIN conversations c ON m.conversation_id = c.id
JOIN user_profiles sender ON m.sender_id = sender.id
LEFT JOIN message_reactions mr ON m.id = mr.message_id
LEFT JOIN user_profiles reactor ON mr.user_id = reactor.id
GROUP BY m.id, sender.id, c.landlord_id, c.renter_id
ORDER BY m.created_at;