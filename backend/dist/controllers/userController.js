import { supabase } from '../config/supabase.js';
export class UserController {
    /**
     * Get current user's profile
     * GET /api/users/me
     */
    static async getMyProfile(req, res) {
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
                data: data
            });
        }
        catch (error) {
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
    static async createProfile(req, res) {
        try {
            const profileData = req.body;
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
                data: data,
                message: 'Profile created successfully'
            });
        }
        catch (error) {
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
    static async updateProfile(req, res) {
        try {
            const updates = req.body;
            // Remove fields that shouldn't be updated directly by users
            delete updates.id;
            delete updates.created_at;
            delete updates.is_verified;
            delete updates.verification_level;
            delete updates.total_listings;
            delete updates.total_bookings;
            delete updates.total_reviews;
            delete updates.average_rating;
            delete updates.verified_at;
            delete updates.verified_by;
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
                data: data,
                message: 'Profile updated successfully'
            });
        }
        catch (error) {
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
    static async getPublicProfile(req, res) {
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
        }
        catch (error) {
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
    static async uploadProfileImage(req, res) {
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
            }
            catch {
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
        }
        catch (error) {
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
    static async deactivateProfile(req, res) {
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
        }
        catch (error) {
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
    static async reactivateProfile(req, res) {
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
                data: data,
                message: 'Profile reactivated successfully'
            });
        }
        catch (error) {
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
    static async searchUsers(req, res) {
        try {
            const { search, role, city, state, verified_only, page = '1', limit = '20' } = req.query;
            // Validate pagination parameters
            const pageNum = Math.max(1, parseInt(page) || 1);
            const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20)); // Max 100 results
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
        }
        catch (error) {
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
    static async getUserStats(req, res) {
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
        }
        catch (error) {
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
    static async updatePreferences(req, res) {
        try {
            const { email_notifications, sms_notifications, marketing_emails, preferred_currency, preferred_language, timezone } = req.body;
            const updates = {};
            if (typeof email_notifications === 'boolean')
                updates.email_notifications = email_notifications;
            if (typeof sms_notifications === 'boolean')
                updates.sms_notifications = sms_notifications;
            if (typeof marketing_emails === 'boolean')
                updates.marketing_emails = marketing_emails;
            if (preferred_currency && typeof preferred_currency === 'string')
                updates.preferred_currency = preferred_currency;
            if (preferred_language && typeof preferred_language === 'string')
                updates.preferred_language = preferred_language;
            if (timezone && typeof timezone === 'string')
                updates.timezone = timezone;
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
        }
        catch (error) {
            console.error('Update preferences error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update preferences'
            });
        }
    }
}
