// src/controllers/userController.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';
import { 
  UserProfile, 
  CreateUserProfileRequest, 
  UpdateUserProfileRequest
} from '../schemas/types/core/user.js';
import { ApiResponse, PaginatedResponse } from '../types/api.js';

export class UserController {
  
  /**
   * Get current user's profile
   * GET /api/users/me
   */
  static async getMyProfile(
    req: AuthenticatedRequest, 
    res: Response<ApiResponse<UserProfile>>
  ): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', req.user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          res.status(404).json({ 
            success: false, 
            error: 'Profile not found. Please create your profile first.' 
          });
          return;
        }
        throw error;
      }

      // Update last active timestamp
      await supabase.rpc('update_last_active', { user_id: req.user.id });

      res.json({ 
        success: true, 
        data: data as UserProfile 
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch profile' 
      });
    }
  }

  /**
   * Create user profile (typically called after signup)
   * POST /api/users/me
   */
  static async createProfile(
    req: AuthenticatedRequest, 
    res: Response<ApiResponse<UserProfile>>
  ): Promise<void> {
    try {
      const profileData: CreateUserProfileRequest = req.body;

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', req.user.id)
        .single();

      if (existingProfile) {
        res.status(409).json({
          success: false,
          error: 'Profile already exists. Use PATCH to update.'
        });
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: req.user.id,
          ...profileData,
          can_create_listings: profileData.role === 'landlord',
        })
        .select()
        .single();

      if (error) {
        console.error('Create profile error:', error);
        throw error;
      }

      res.status(201).json({
        success: true,
        data: data as UserProfile,
        message: 'Profile created successfully'
      });
    } catch (error) {
      console.error('Create profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create profile'
      });
    }
  }

  /**
   * Update user profile
   * PATCH /api/users/me
   */
  static async updateProfile(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<UserProfile>>
  ): Promise<void> {
    try {
      const updates: UpdateUserProfileRequest = req.body;
      
      // Remove fields that shouldn't be updated directly by users
      delete (updates as any).id;
      delete (updates as any).created_at;
      delete (updates as any).is_verified;
      delete (updates as any).verification_level;
      delete (updates as any).total_listings;
      delete (updates as any).total_bookings;
      delete (updates as any).total_reviews;
      delete (updates as any).average_rating;
      delete (updates as any).verified_at;
      delete (updates as any).verified_by;

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', req.user.id)
        .single();

      if (!existingProfile) {
        res.status(404).json({
          success: false,
          error: 'Profile not found. Please create your profile first.'
        });
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', req.user.id)
        .select()
        .single();

      if (error) {
        console.error('Update profile error:', error);
        throw error;
      }

      res.json({
        success: true,
        data: data as UserProfile,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }
  }

  /**
   * Get public profile by ID
   * GET /api/users/:id
   */
  static async getPublicProfile(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<Partial<UserProfile>>>
  ): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
        return;
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        res.status(400).json({
          success: false,
          error: 'Invalid user ID format'
        });
        return;
      }

      const { data, error } = await supabase
        .from('public_user_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          res.status(404).json({
            success: false,
            error: 'User not found or profile is private'
          });
          return;
        }
        throw error;
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Get public profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch profile'
      });
    }
  }

  /**
   * Upload/update profile image
   * POST /api/users/upload-image
   */
  static async uploadProfileImage(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<{ url: string }>>
  ): Promise<void> {
    try {
      const { image_url } = req.body;

      if (!image_url) {
        res.status(400).json({
          success: false,
          error: 'Image URL is required'
        });
        return;
      }

      // Validate URL format
      try {
        new URL(image_url);
      } catch {
        res.status(400).json({
          success: false,
          error: 'Invalid image URL format'
        });
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update({ profile_image_url: image_url })
        .eq('id', req.user.id)
        .select('profile_image_url')
        .single();

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        data: { url: data.profile_image_url },
        message: 'Profile image updated successfully'
      });
    } catch (error) {
      console.error('Upload profile image error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile image'
      });
    }
  }

  /**
   * Deactivate user profile (soft delete)
   * DELETE /api/users/me
   */
  static async deactivateProfile(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<null>>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          is_active: false,
          is_public: false // Also make profile private
        })
        .eq('id', req.user.id);

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        data: null,
        message: 'Profile deactivated successfully'
      });
    } catch (error) {
      console.error('Deactivate profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to deactivate profile'
      });
    }
  }

  /**
   * Reactivate user profile
   * POST /api/users/reactivate
   */
  static async reactivateProfile(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<UserProfile>>
  ): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          is_active: true,
          is_public: true 
        })
        .eq('id', req.user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        data: data as UserProfile,
        message: 'Profile reactivated successfully'
      });
    } catch (error) {
      console.error('Reactivate profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reactivate profile'
      });
    }
  }

  /**
   * Search users (public directory)
   * GET /api/users/search
   */
  static async searchUsers(
    req: AuthenticatedRequest,
    res: Response<PaginatedResponse<Partial<UserProfile>>>
  ): Promise<void> {
    try {
      const { 
        search, 
        role, 
        city, 
        state, 
        verified_only,
        page = '1', 
        limit = '20' 
      } = req.query;

      // Validate pagination parameters
      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20)); // Max 100 results
      const offset = (pageNum - 1) * limitNum;

      let query = supabase
        .from('public_user_profiles')
        .select('*', { count: 'exact' });

      // Apply search filters
      if (search && typeof search === 'string' && search.trim()) {
        const searchTerm = search.trim();
        query = query.or(`name.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`);
      }

      if (role && role !== 'all' && typeof role === 'string') {
        if (['renter', 'landlord', 'both'].includes(role)) {
          query = query.eq('role', role);
        }
      }

      if (city && typeof city === 'string' && city.trim()) {
        query = query.ilike('city', `%${city.trim()}%`);
      }

      if (state && typeof state === 'string' && state.trim()) {
        query = query.eq('state', state.trim());
      }

      if (verified_only === 'true') {
        query = query.eq('is_verified', true);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limitNum - 1);

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        data: data || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limitNum)
        }
      });
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search users',
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        }
      });
    }
  }

  /**
   * Get user statistics (for dashboard)
   * GET /api/users/stats
   */
  static async getUserStats(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<{
      total_listings: number;
      total_bookings: number;
      total_reviews: number;
      average_rating: number | null;
      profile_completion: number;
    }>>
  ): Promise<void> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select(`
          total_listings,
          total_bookings,
          total_reviews,
          average_rating,
          name,
          bio,
          profile_image_url,
          phone,
          city,
          state,
          company_name,
          role
        `)
        .eq('id', req.user.id)
        .single();

      if (error) {
        throw error;
      }

      // Calculate profile completion percentage
      const fields = [
        profile.name,
        profile.bio,
        profile.profile_image_url,
        profile.phone,
        profile.city,
        profile.state,
        profile.role === 'landlord' ? profile.company_name : true // Company name only required for landlords
      ];
      
      const completedFields = fields.filter(field => field && field !== '').length;
      const profileCompletion = Math.round((completedFields / fields.length) * 100);

      res.json({
        success: true,
        data: {
          total_listings: profile.total_listings,
          total_bookings: profile.total_bookings,
          total_reviews: profile.total_reviews,
          average_rating: profile.average_rating,
          profile_completion: profileCompletion
        }
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user statistics'
      });
    }
  }

  /**
   * Update user preferences
   * PATCH /api/users/preferences
   */
  static async updatePreferences(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<{ message: string }>>
  ): Promise<void> {
    try {
      const {
        email_notifications,
        sms_notifications,
        marketing_emails,
        preferred_currency,
        preferred_language,
        timezone
      } = req.body;

      const updates: any = {};
      
      if (typeof email_notifications === 'boolean') updates.email_notifications = email_notifications;
      if (typeof sms_notifications === 'boolean') updates.sms_notifications = sms_notifications;
      if (typeof marketing_emails === 'boolean') updates.marketing_emails = marketing_emails;
      if (preferred_currency && typeof preferred_currency === 'string') updates.preferred_currency = preferred_currency;
      if (preferred_language && typeof preferred_language === 'string') updates.preferred_language = preferred_language;
      if (timezone && typeof timezone === 'string') updates.timezone = timezone;

      if (Object.keys(updates).length === 0) {
        res.status(400).json({
          success: false,
          error: 'No valid preferences provided'
        });
        return;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', req.user.id);

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        data: { message: 'Preferences updated successfully' }
      });
    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update preferences'
      });
    }
  }
}