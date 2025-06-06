// backend/src/routes/authRoutes.ts
import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Lazy-loaded Supabase client to ensure env vars are available
const getSupabaseClient = () => {
  if (!process.env.SUPABASE_URL) {
    throw new Error('SUPABASE_URL environment variable is required');
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  }
  
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};

// Helper function to verify Supabase JWT token
const verifySupabaseToken = async (token: string) => {
  try {
    const supabase = getSupabaseClient();
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new Error('Invalid token');
    }
    
    return user;
  } catch (error) {
    throw new Error('Token verification failed');
  }
};

// POST /api/auth/complete-profile - Complete user profile after Supabase signup
router.post('/complete-profile', async (req: Request, res: Response) => {
  try {
    console.log('👤 Profile completion request received...');
    
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify the Supabase token
    const supabaseUser = await verifySupabaseToken(token);
    
    // Extract profile data from request
    const {
      name,
      role = 'renter', // Default to renter
      wantsToRentSpaces = false, // Question asked during signup
      phone,
      company_name,
      business_license,
      bio,
      address_line1,
      city,
      state,
      postal_code,
      website_url
    } = req.body;
    
    // Determine final role
    let finalRole = role;
    if (wantsToRentSpaces && role === 'renter') {
      finalRole = 'both'; // They want to rent spaces but selected renter initially
    } else if (wantsToRentSpaces && role === 'landlord') {
      finalRole = 'landlord'; // They selected landlord and want to rent spaces
    }
    
    const supabase = getSupabaseClient();
    
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('id, name, role')
      .eq('id', supabaseUser.id)
      .single();
    
    if (existingProfile) {
      console.log('📝 Updating existing profile...');
      
      // Update existing profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          name,
          role: finalRole,
          phone,
          company_name,
          business_license,
          bio,
          address_line1,
          city,
          state,
          postal_code,
          website_url,
          can_create_listings: finalRole === 'landlord' || finalRole === 'both',
          updated_at: new Date().toISOString()
        })
        .eq('id', supabaseUser.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Profile update error:', updateError);
        return res.status(500).json({
          success: false,
          error: 'Failed to update profile',
          details: updateError.message
        });
      }
      
      console.log('✅ Profile updated successfully');
      return res.status(200).json({
        success: true,
        data: updatedProfile,
        message: 'Profile updated successfully',
        isNewUser: false
      });
    } else {
      console.log('🆕 Creating new profile...');
      
      // Create new profile
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: supabaseUser.id,
          name,
          role: finalRole,
          phone,
          company_name,
          business_license,
          bio,
          address_line1,
          city,
          state,
          postal_code,
          website_url,
          verification_level: supabaseUser.email_confirmed_at ? 'email_verified' : 'unverified',
          can_create_listings: finalRole === 'landlord' || finalRole === 'both',
          is_active: true
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Profile creation error:', createError);
        return res.status(500).json({
          success: false,
          error: 'Failed to create profile',
          details: createError.message
        });
      }
      
      console.log('✅ Profile created successfully');
      return res.status(201).json({
        success: true,
        data: newProfile,
        message: 'Profile created successfully',
        isNewUser: true
      });
    }
    
  } catch (error) {
    console.error('💥 Profile completion error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/auth/profile - Get current user's profile
router.get('/profile', async (req: Request, res: Response) => {
  try {
    console.log('👤 Profile fetch request...');
    
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header'
      });
    }
    
    const token = authHeader.substring(7);
    
    // Verify the Supabase token
    const supabaseUser = await verifySupabaseToken(token);
    
    const supabase = getSupabaseClient();
    
    // Fetch user profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();
    
    if (error) {
      console.error('❌ Profile fetch error:', error);
      return res.status(404).json({
        success: false,
        error: 'Profile not found',
        details: error.message,
        needsProfileCompletion: true
      });
    }
    
    console.log('✅ Profile fetched successfully');
    res.status(200).json({
      success: true,
      data: {
        ...profile,
        supabase_user: {
          id: supabaseUser.id,
          email: supabaseUser.email,
          email_confirmed_at: supabaseUser.email_confirmed_at,
          last_sign_in_at: supabaseUser.last_sign_in_at
        }
      },
      message: 'Profile fetched successfully'
    });
    
  } catch (error) {
    console.error('💥 Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/auth/verify-token - Verify if a Supabase token is valid
router.post('/verify-token', async (req: Request, res: Response) => {
  try {
    console.log('🔐 Token verification request...');
    
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }
    
    // Verify the Supabase token
    const supabaseUser = await verifySupabaseToken(token);
    
    const supabase = getSupabaseClient();
    
    // Check if user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, name, role, verification_level, can_create_listings')
      .eq('id', supabaseUser.id)
      .single();
    
    console.log('✅ Token verified successfully');
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: supabaseUser.id,
          email: supabaseUser.email,
          email_confirmed_at: supabaseUser.email_confirmed_at
        },
        profile: profile || null,
        needsProfileCompletion: !profile
      },
      message: 'Token is valid'
    });
    
  } catch (error) {
    console.error('❌ Token verification failed:', error);
    res.status(401).json({
      success: false,
      error: 'Token verification failed',
      message: error instanceof Error ? error.message : 'Invalid token'
    });
  }
});

// GET /api/auth/test-protected - Test protected route
router.get('/test-protected', async (req: Request, res: Response) => {
  try {
    console.log('🔒 Testing protected route...');
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header'
      });
    }
    
    const token = authHeader.substring(7);
    const supabaseUser = await verifySupabaseToken(token);
    
    const supabase = getSupabaseClient();
    
    // Fetch user profile for role info
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('name, role, verification_level')
      .eq('id', supabaseUser.id)
      .single();
    
    console.log('✅ Protected route access successful');
    res.status(200).json({
      success: true,
      data: {
        message: 'Protected route accessed successfully!',
        user: {
          id: supabaseUser.id,
          email: supabaseUser.email,
          profile: profile
        },
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Protected route access denied:', error);
    res.status(401).json({
      success: false,
      error: 'Access denied',
      message: error instanceof Error ? error.message : 'Authentication failed'
    });
  }
});

// GET /api/auth/test-landlord - Test landlord-only route
router.get('/test-landlord', async (req: Request, res: Response) => {
  try {
    console.log('🏠 Testing landlord route...');
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header'
      });
    }
    
    const token = authHeader.substring(7);
    const supabaseUser = await verifySupabaseToken(token);
    
    const supabase = getSupabaseClient();
    
    // Check if user has landlord role
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('name, role, can_create_listings')
      .eq('id', supabaseUser.id)
      .single();
    
    if (error || !profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }
    
    if (profile.role !== 'landlord' && profile.role !== 'both') {
      return res.status(403).json({
        success: false,
        error: 'Access denied - landlord role required',
        userRole: profile.role
      });
    }
    
    console.log('✅ Landlord route access successful');
    res.status(200).json({
      success: true,
      data: {
        message: 'Landlord route accessed successfully!',
        user: {
          id: supabaseUser.id,
          email: supabaseUser.email,
          role: profile.role,
          can_create_listings: profile.can_create_listings
        },
        allowedActions: [
          'Create listings',
          'Manage properties',
          'View inquiries',
          'Access analytics'
        ]
      }
    });
    
  } catch (error) {
    console.error('❌ Landlord route access denied:', error);
    res.status(401).json({
      success: false,
      error: 'Access denied',
      message: error instanceof Error ? error.message : 'Authentication failed'
    });
  }
});

export default router;