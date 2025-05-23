*THESE ARE NON-VERIFIED SAMPLES FOR REFERENCE AND DEVELOPMENT*
*-----------------------------------------------*

// api/listings/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../backend/utils/auth';
import { supabase } from '../../backend/utils/supabase';
import { createListingSchema } from '../../backend/utils/validation';
import { buildListingFilters } from '../../backend/utils/helpers';
import { CreateListingRequest, PaginatedResponse, RentalListing } from '../../backend/types';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Create new listing
    try {
      const validatedData = createListingSchema.parse(req.body);

      const { data, error } = await supabase
        .from('rental_listings')
        .insert({
          ...validatedData,
          landlord_id: req.user.id,
          status: 'draft'
        })
        .select()
        .single();

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      res.status(201).json({
        success: true,
        data,
        message: 'Listing created successfully'
      });
    } catch (error) {
      console.error('Create listing error:', error);
      res.status(400).json({ 
        success: false, 
        error: 'Invalid listing data' 
      });
    }
  } else if (req.method === 'GET') {
    // Browse/filter listings
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('public_listings')
        .select('*', { count: 'exact' });

      // Apply filters
      const { filters } = buildListingFilters(req.query);
      
      if (req.query.city) {
        query = query.ilike('city', `%${req.query.city}%`);
      }
      if (req.query.state) {
        query = query.eq('state', req.query.state);
      }
      if (req.query.type) {
        query = query.eq('type', req.query.type);
      }
      if (req.query.price_min) {
        query = query.gte('price_per_day', parseFloat(req.query.price_min as string));
      }
      if (req.query.price_max) {
        query = query.lte('price_per_day', parseFloat(req.query.price_max as string));
      }
      if (req.query.features) {
        const features = Array.isArray(req.query.features) 
          ? req.query.features 
          : [req.query.features];
        query = query.overlaps('features', features);
      }
      if (req.query.search) {
        query = query.or(`title.ilike.%${req.query.search}%,description.ilike.%${req.query.search}%`);
      }

      // Location-based search
      if (req.query.latitude && req.query.longitude && req.query.radius) {
        const lat = parseFloat(req.query.latitude as string);
        const lng = parseFloat(req.query.longitude as string);
        const radius = parseFloat(req.query.radius as string);
        
        // Use PostGIS for distance calculation (if available)
        // Otherwise, use a simple bounding box
        const latRange = radius / 69; // Approximate miles to degrees
        const lngRange = radius / (69 * Math.cos(lat * Math.PI / 180));
        
        query = query
          .gte('latitude', lat - latRange)
          .lte('latitude', lat + latRange)
          .gte('longitude', lng - lngRange)
          .lte('longitude', lng + lngRange);
      }

      // Sorting
      const sortBy = req.query.sort_by as string || 'created_at';
      const sortOrder = req.query.sort_order as string || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error, count } = await query
        .range(offset, offset + limit - 1);

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      const response: PaginatedResponse<RentalListing> = {
        success: true,
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Browse listings error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

export default withAuth(handler);

// api/listings/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../backend/utils/auth';
import { supabase } from '../../backend/utils/supabase';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    // View listing details
    try {
      const { data, error } = await supabase
        .from('public_listings')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return res.status(404).json({ success: false, error: 'Listing not found' });
      }

      // Track view
      await supabase.rpc('increment_view_count', { listing_id: id });

      res.json({ success: true, data });
    } catch (error) {
      console.error('Get listing error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  } else if (req.method === 'PATCH') {
    // Edit listing (landlord only)
    try {
      // First check if user owns this listing
      const { data: listing, error: fetchError } = await supabase
        .from('rental_listings')
        .select('landlord_id')
        .eq('id', id)
        .single();

      if (fetchError || !listing) {
        return res.status(404).json({ success: false, error: 'Listing not found' });
      }

      if (listing.landlord_id !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
      }

      const updateData = req.body;
      delete updateData.id;
      delete updateData.landlord_id;
      delete updateData.created_at;

      const { data, error } = await supabase
        .from('rental_listings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      res.json({ 
        success: true, 
        data,
        message: 'Listing updated successfully' 
      });
    } catch (error) {
      console.error('Update listing error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    // Deactivate listing
    try {
      // Check ownership
      const { data: listing, error: fetchError } = await supabase
        .from('rental_listings')
        .select('landlord_id')
        .eq('id', id)
        .single();

      if (fetchError || !listing) {
        return res.status(404).json({ success: false, error: 'Listing not found' });
      }

      if (listing.landlord_id !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
      }

      const { error } = await supabase
        .from('rental_listings')
        .update({ status: 'archived' })
        .eq('id', id);

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      res.json({ 
        success: true, 
        message: 'Listing deactivated successfully' 
      });
    } catch (error) {
      console.error('Delete listing error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

export default withAuth(handler);

// api/favorites/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../backend/utils/auth';
import { supabase } from '../../backend/utils/supabase';
import { z } from 'zod';

const saveFavoriteSchema = z.object({
  listing_id: z.string().uuid(),
  folder_name: z.string().default('general'),
  personal_notes: z.string().optional(),
  priority_level: z.number().min(1).max(5).default(3)
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Save a listing
    try {
      const validatedData = saveFavoriteSchema.parse(req.body);

      const { data, error } = await supabase
        .from('saved_listings')
        .insert({
          ...validatedData,
          user_id: req.user.id
        })
        .select(`
          *,
          listing:rental_listings(
            id, title, type, price_per_day, city, state,
            primary_image_url, status
          )
        `)
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          return res.status(409).json({ 
            success: false, 
            error: 'Listing already saved' 
          });
        }
        return res.status(400).json({ success: false, error: error.message });
      }

      res.status(201).json({
        success: true,
        data,
        message: 'Listing saved successfully'
      });
    } catch (error) {
      console.error('Save favorite error:', error);
      res.status(400).json({ 
        success: false, 
        error: 'Invalid request data' 
      });
    }
  } else if (req.method === 'GET') {
    // View all saved listings
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('saved_listings_with_details')
        .select('*', { count: 'exact' })
        .eq('user_id', req.user.id);

      // Filter by folder
      if (req.query.folder) {
        query = query.eq('folder_name', req.query.folder);
      }

      // Filter by priority
      if (req.query.priority) {
        query = query.eq('priority_level', parseInt(req.query.priority as string));
      }

      // Exclude archived
      if (req.query.include_archived !== 'true') {
        query = query.eq('is_archived', false);
      }

      // Sort by saved date (newest first)
      const sortBy = req.query.sort_by as string || 'saved_at';
      const sortOrder = req.query.sort_order as string || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error, count } = await query
        .range(offset, offset + limit - 1);

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      res.json({
        success: true,
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      });
    } catch (error) {
      console.error('Get favorites error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

export default withAuth(handler);

// api/favorites/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../backend/utils/auth';
import { supabase } from '../../backend/utils/supabase';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    // Remove saved listing
    try {
      const { error } = await supabase
        .from('saved_listings')
        .delete()
        .eq('id', id)
        .eq('user_id', req.user.id);

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      res.json({ 
        success: true, 
        message: 'Listing removed from favorites' 
      });
    } catch (error) {
      console.error('Remove favorite error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  } else if (req.method === 'PATCH') {
    // Update saved listing (folder, notes, priority)
    try {
      const updateData = req.body;
      delete updateData.id;
      delete updateData.user_id;
      delete updateData.listing_id;
      delete updateData.saved_at;

      const { data, error } = await supabase
        .from('saved_listings')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', req.user.id)
        .select()
        .single();

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      res.json({ 
        success: true, 
        data,
        message: 'Favorite updated successfully' 
      });
    } catch (error) {
      console.error('Update favorite error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

export default withAuth(handler);

// api/messages/start.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../backend/utils/auth';
import { supabase } from '../../backend/utils/supabase';
import { startConversationSchema } from '../../backend/utils/validation';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { listing_id, message, subject } = startConversationSchema.parse(req.body);

    // Call the database function to create conversation with initial message
    const { data, error } = await supabase.rpc('create_conversation_with_message', {
      p_listing_id: listing_id,
      p_renter_id: req.user.id,
      p_initial_message: message,
      p_subject: subject
    });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    // Fetch the created conversation with details
    const { data: conversation, error: fetchError } = await supabase
      .from('conversation_list')
      .select('*')
      .eq('id', data)
      .single();

    if (fetchError) {
      console.error('Fetch conversation error:', fetchError);
    }

    res.status(201).json({
      success: true,
      data: { conversation_id: data, conversation },
      message: 'Conversation started successfully'
    });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Invalid request data' 
    });
  }
}

export default withAuth(handler);

// api/messages/threads.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../backend/utils/auth';
import { supabase } from '../../backend/utils/supabase';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('conversation_list')
      .select('*', { count: 'exact' })
      .or(`landlord_id.eq.${req.user.id},renter_id.eq.${req.user.id}`);

    // Filter by status
    if (req.query.status) {
      query = query.eq('status', req.query.status);
    }

    // Filter archived conversations
    const showArchived = req.query.archived === 'true';
    if (!showArchived) {
      query = query.eq('is_archived_by_landlord', false)
                   .eq('is_archived_by_renter', false);
    }

    // Filter unread conversations only
    if (req.query.unread_only === 'true') {
      query = query.or(`unread_by_landlord.gt.0,unread_by_renter.gt.0`);
    }

    // Sort by last message time
    query = query.order('last_message_at', { ascending: false, nullsLast: true });

    const { data, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export default withAuth(handler);

// api/messages/thread/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../backend/utils/auth';
import { supabase } from '../../backend/utils/supabase';
import { sendMessageSchema } from '../../backend/utils/validation';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id: conversationId } = req.query;

  if (req.method === 'GET') {
    // Fetch messages in thread
    try {
      // First verify user has access to this conversation
      const { data: conversation, error: accessError } = await supabase
        .from('conversations')
        .select('landlord_id, renter_id')
        .eq('id', conversationId)
        .single();

      if (accessError || !conversation) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
      }

      if (conversation.landlord_id !== req.user.id && conversation.renter_id !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
      }

      // Get messages
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const { data, error, count } = await supabase
        .from('message_thread')
        .select('*', { count: 'exact' })
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      // Mark messages as read
      await supabase.rpc('mark_messages_as_read', {
        p_conversation_id: conversationId,
        p_user_id: req.user.id
      });

      res.json({
        success: true,
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    // Send message in thread
    try {
      // Verify access
      const { data: conversation, error: accessError } = await supabase
        .from('conversations')
        .select('landlord_id, renter_id, status')
        .eq('id', conversationId)
        .single();

      if (accessError || !conversation) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
      }

      if (conversation.landlord_id !== req.user.id && conversation.renter_id !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
      }

      if (conversation.status !== 'active') {
        return res.status(400).json({ success: false, error: 'Cannot send message to inactive conversation' });
      }

      const messageData = sendMessageSchema.parse(req.body);

      const { data, error } = await supabase
        .from('messages')
        .insert({
          ...messageData,
          conversation_id: conversationId,
          sender_id: req.user.id
        })
        .select(`
          *,
          sender:user_profiles!sender_id(name, profile_image_url)
        `)
        .single();

      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }

      res.status(201).json({
        success: true,
        data,
        message: 'Message sent successfully'
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(400).json({ 
        success: false, 
        error: 'Invalid message data' 
      });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

export default withAuth(handler);

// SQL Functions to add to Supabase (run these in SQL editor)
/*
-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(listing_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE rental_listings 
  SET view_count = view_count + 1 
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policy for view count increment
CREATE POLICY "Anyone can increment view count" ON rental_listings
  FOR UPDATE USING (true) WITH CHECK (true);
*/