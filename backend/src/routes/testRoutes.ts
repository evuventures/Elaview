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
      'GET /api/test/users/:id - Get specific user'
    ]
  });
});

export default router;