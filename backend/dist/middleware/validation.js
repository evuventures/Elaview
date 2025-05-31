import { z } from 'zod';
/**
 * Generic validation middleware using Zod schemas
 */
export const validateSchema = (schema) => {
    return (req, res, next) => {
        try {
            // Parse and validate request body
            const validatedData = schema.parse(req.body);
            // Replace request body with validated data
            req.body = validatedData;
            next();
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.issues.map(issue => ({
                        field: issue.path.join('.'),
                        message: issue.message
                    }))
                });
                return;
            }
            res.status(400).json({
                success: false,
                error: 'Invalid request data'
            });
        }
    };
};
/**
 * Validate query parameters
 */
export const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            const validatedQuery = schema.parse(req.query);
            req.query = validatedQuery;
            next();
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid query parameters',
                    details: error.issues.map(issue => ({
                        field: issue.path.join('.'),
                        message: issue.message
                    }))
                });
                return;
            }
            res.status(400).json({
                success: false,
                error: 'Invalid query parameters'
            });
        }
    };
};
/**
 * Validation schemas for user endpoints
 */
export const createUserProfileSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    role: z.enum(['renter', 'landlord'], {
        errorMap: () => ({ message: 'Role must be either "renter" or "landlord"' })
    }),
    phone: z.string().min(10, 'Phone must be at least 10 characters').max(20).optional(),
    company_name: z.string().max(200, 'Company name too long').optional(),
    bio: z.string().max(1000, 'Bio too long').optional(),
    city: z.string().max(100, 'City name too long').optional(),
    state: z.string().max(50, 'State name too long').optional(),
    timezone: z.string().max(50, 'Timezone too long').optional(),
});
export const updateUserProfileSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
    role: z.enum(['renter', 'landlord', 'both']).optional(),
    phone: z.string().min(10).max(20).optional(),
    company_name: z.string().max(200).optional(),
    bio: z.string().max(1000).optional(),
    website_url: z.string().url('Invalid URL format').optional(),
    address_line1: z.string().max(200).optional(),
    address_line2: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(50).optional(),
    postal_code: z.string().max(20).optional(),
    country: z.string().length(2, 'Country code must be 2 characters').optional(),
    timezone: z.string().max(50).optional(),
    is_public: z.boolean().optional(),
    email_notifications: z.boolean().optional(),
    sms_notifications: z.boolean().optional(),
    marketing_emails: z.boolean().optional(),
    preferred_currency: z.string().length(3, 'Currency code must be 3 characters').optional(),
    preferred_language: z.string().max(5).optional(),
    social_links: z.record(z.string().url()).optional(),
    emergency_contact_name: z.string().max(100).optional(),
    emergency_contact_phone: z.string().min(10).max(20).optional(),
});
export const searchUsersQuerySchema = z.object({
    search: z.string().optional(),
    role: z.enum(['renter', 'landlord', 'both', 'all']).optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    verified_only: z.enum(['true', 'false']).optional(),
    page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
});
// Auth validation schemas
export const signupSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(1, 'Name is required'),
    role: z.enum(['renter', 'landlord'])
});
export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
});
export const uploadImageSchema = z.object({
    image_url: z.string().url('Invalid image URL')
});
export const preferencesSchema = z.object({
    email_notifications: z.boolean().optional(),
    sms_notifications: z.boolean().optional(),
    marketing_emails: z.boolean().optional(),
    preferred_currency: z.string().length(3).optional(),
    preferred_language: z.string().max(5).optional(),
    timezone: z.string().max(50).optional(),
});
