// backend/src/routes/testRoutes.ts
// Create a public test route that doesn't require authentication

import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Initialize Supabase with anon key for safer testing
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY! // Using anon key for read-only test operations
);

// Helper function to format traffic count
function formatTraffic(count: number | null): string {
  if (!count) return '0 daily';
  
  if (count >= 20000) return '20,000+ daily';
  if (count >= 15000) return '15,000+ daily';
  if (count >= 10000) return '10,000+ daily';
  if (count >= 5000) return '5,000+ daily';
  
  // For counts less than 5000, round down to nearest 500
  const rounded = Math.floor(count / 500) * 500;
  return `${rounded.toLocaleString()}+ daily`;
}

// Helper function to format availability
function formatAvailability(availableFrom: string | null): string {
  if (!availableFrom) return 'Immediately';
  
  const availableDate = new Date(availableFrom);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  availableDate.setHours(0, 0, 0, 0);
  
  if (availableDate <= today) {
    return 'Immediately';
  }
  
  // Format as MM/DD/YYYY to match your current frontend
  return availableDate.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
}

// Helper function to extract base location name
function getBaseLocation(title: string): string {
  if (title.startsWith('SoHo Building Hall')) return 'SoHo Building Hall';
  if (title.startsWith('Times Square')) return 'Times Square';
  if (title.startsWith('Chelsea')) return 'Chelsea';
  if (title.startsWith('DUMBO')) return 'DUMBO';
  if (title.startsWith('Williamsberg')) return 'Williamsberg';
  if (title.startsWith('Upper East Side')) return 'Upper East Side';
  return title;
}

// PUBLIC test endpoint - no auth required
router.get('/users', async (req: Request, res: Response) => {
  try {
    console.log('📊 Test endpoint hit - fetching users...');
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Database query failed',
        details: error.message 
      });
    }

    console.log(`✅ Found ${data?.length || 0} users`);
    
    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
      message: `Successfully fetched ${data?.length || 0} users`
    });
    
  } catch (error) {
    console.error('💥 Server error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUBLIC test endpoint - single user
router.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`📊 Test endpoint hit - fetching user ${id}...`);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(404).json({ 
        success: false,
        error: 'User not found',
        details: error.message 
      });
    }

    console.log(`✅ Found user: ${data?.name || data?.email || 'Unknown'}`);
    
    res.json({
      success: true,
      data: data,
      message: `Successfully fetched user ${id}`
    });
    
  } catch (error) {
    console.error('💥 Server error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUBLIC test endpoint - fetch all listings
router.get('/listings', async (req: Request, res: Response) => {
  try {
    console.log('📋 Test endpoint hit - fetching listings...');

    // Extract query parameters for filtering (optional for now)
    const {
      neighborhoods,
      spaceTypes,
      traffic,
      minPrice,
      maxPrice,
      minWidth,
      minHeight,
      availableNow,
      availableFrom,
      limit = '100'
    } = req.query;

    let query = supabase
      .from('public_listings')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply basic filters if provided
    if (spaceTypes && typeof spaceTypes === 'string') {
      const typeList = spaceTypes.split(',');
      query = query.in('type', typeList);
    }

    if (minPrice) {
      query = query.gte('price_per_week', parseFloat(minPrice as string));
    }

    if (maxPrice) {
      query = query.lte('price_per_week', parseFloat(maxPrice as string));
    }

    if (minWidth) {
      query = query.gte('width_ft', parseFloat(minWidth as string));
    }

    if (minHeight) {
      query = query.gte('height_ft', parseFloat(minHeight as string));
    }

    if (availableNow === 'true') {
      query = query.or('available_from.is.null,available_from.lte.' + new Date().toISOString().split('T')[0]);
    }

    const { data: listings, error } = await query;

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Database query failed',
        details: error.message 
      });
    }

    if (!listings) {
      console.log('⚠️ No listings found');
      return res.status(200).json({
        success: true,
        listings: [],
        total: 0,
        message: 'No listings found'
      });
    }

    // Transform the data to match frontend expectations
    let transformedListings = listings.map(listing => ({
      id: listing.id,
      location: listing.title || 'Unknown Location', // Using title field as location display name
      price: Math.round(listing.price_per_week || 0),
      pricePerMonth: Math.round(listing.price_per_month || (listing.price_per_week * 4.3) || 0),
      img: listing.primary_image_url || 'https://via.placeholder.com/400x300?text=No+Image',
      type: listing.type || 'Unknown',
      width: `${Math.round(listing.width_ft || 0)}ft`,
      height: `${Math.round(listing.height_ft || 0)}ft`,
      traffic: formatTraffic(listing.traffic_count_daily),
      availability: formatAvailability(listing.available_from),
      // Additional fields
      description: listing.description,
      landlordName: listing.landlord_name,
      landlordVerified: listing.landlord_verified,
      rating: listing.rating,
      features: listing.features || [],
      tags: listing.tags || []
    }));

    // Apply client-side filtering for neighborhoods if provided
    if (neighborhoods && typeof neighborhoods === 'string') {
      const neighborhoodList = neighborhoods.split(',');
      transformedListings = transformedListings.filter(listing => {
        const baseLocation = getBaseLocation(listing.location);
        return neighborhoodList.includes(baseLocation);
      });
    }

    console.log(`✅ Successfully fetched ${transformedListings.length} listings`);
    
    res.json({
      success: true,
      listings: transformedListings,
      total: transformedListings.length,
      message: `Successfully fetched ${transformedListings.length} listings`
    });

  } catch (error) {
    console.error('💥 Server error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test database connection
router.get('/health', async (req: Request, res: Response) => {
  try {
    console.log('🔍 Testing database connection...');
    
    // Simple query to test connection
    const { count, error } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Database connection failed:', error);
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }

    console.log('✅ Database connection successful');
    
    res.json({ 
      success: true,
      message: 'Database connection successful!',
      userCount: count || 0,
      timestamp: new Date().toISOString(),
      supabaseUrl: process.env.SUPABASE_URL ? 'Connected' : 'Missing URL'
    });
    
  } catch (error) {
    console.error('💥 Database test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Simple ping endpoint
router.get('/ping', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Test routes are working!',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/test/ping - This endpoint',
      'GET /api/test/health - Database connection test',
      'GET /api/test/users - Get all users',
      'GET /api/test/users/:id - Get specific user',
      'GET /api/test/listings - Get all listings (NEW!)'
    ]
  });
});

export default router;