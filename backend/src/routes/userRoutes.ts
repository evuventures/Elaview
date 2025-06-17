// src/routes/userRoutes.ts - Optimized with fraud prevention
import { Router, Request, Response } from 'express';
import { authenticateUser, requireLandlord, AuthenticatedRequest } from '../middleware/auth.js';
import { 
  validateSchema, 
  validateQuery,
  createUserProfileSchema,
  updateUserProfileSchema, 
  uploadImageSchema,
  searchUsersQuerySchema,
  preferencesSchema
} from '../middleware/validation.js';
import { 
  updateRateLimit, 
  uploadRateLimit, 
  landlordActionRateLimit,
  preferencesRateLimit
} from '../middleware/rateLimit.js';
import { UserController } from '../controllers/userController.js';

const router = Router();

// Apply authentication to all user routes
router.use(authenticateUser);

/**
 * Profile Management Routes
 */

// GET /api/users/me - Get current user's profile
router.get('/me', (req: Request, res: Response) => 
  UserController.getMyProfile(req as AuthenticatedRequest, res)
);

// POST /api/users/me - Create user profile (DevOps will handle rate limiting)
router.post('/me', 
  validateSchema(createUserProfileSchema), 
  (req: Request, res: Response) => 
    UserController.createProfile(req as AuthenticatedRequest, res)
);

// PATCH /api/users/me - Update user profile (rate limited to prevent spam)
router.patch('/me', 
  updateRateLimit,
  validateSchema(updateUserProfileSchema), 
  (req: Request, res: Response) => 
    UserController.updateProfile(req as AuthenticatedRequest, res)
);

// DELETE /api/users/me - Deactivate profile (soft delete)
router.delete('/me', (req: Request, res: Response) => 
  UserController.deactivateProfile(req as AuthenticatedRequest, res)
);

// POST /api/users/reactivate - Reactivate deactivated profile
router.post('/reactivate', (req: Request, res: Response) => 
  UserController.reactivateProfile(req as AuthenticatedRequest, res)
);

/**
 * Image Upload Routes (Fraud Prevention)
 */

// POST /api/users/upload-image - Upload/update profile image (heavily rate limited)
router.post('/upload-image', 
  uploadRateLimit,
  validateSchema(uploadImageSchema), 
  (req: Request, res: Response) => 
    UserController.uploadProfileImage(req as AuthenticatedRequest, res)
);

/**
 * User Preferences Routes
 */

// PATCH /api/users/preferences - Update user notification and app preferences
router.patch('/preferences',
  preferencesRateLimit,
  validateSchema(preferencesSchema),
  (req: Request, res: Response) => 
    UserController.updatePreferences(req as AuthenticatedRequest, res)
);

/**
 * User Statistics Routes
 */

// GET /api/users/stats - Get user dashboard statistics
router.get('/stats', (req: Request, res: Response) => 
  UserController.getUserStats(req as AuthenticatedRequest, res)
);

/**
 * Public Profile Routes (No Auth Required)
 */

// GET /api/users/:id - Get public profile by ID (removed auth requirement)
router.get('/:id', (req: Request, res: Response) => 
  UserController.getPublicProfile(req as AuthenticatedRequest, res)
);

/**
 * Landlord-Specific Routes (Extra Fraud Prevention)
 * These routes have additional rate limiting to prevent fraudulent listings
 */

// Example: If you add landlord-specific profile actions later
// router.post('/landlord-verification', 
//   requireLandlord,
//   landlordActionRateLimit,
//   (req: Request, res: Response) => 
//     UserController.requestLandlordVerification(req as AuthenticatedRequest, res)
// );

/**
 * Future Routes (Currently Disabled)
 */

// User search functionality - disabled per requirements
// router.get('/search', 
//   validateQuery(searchUsersQuerySchema),
//   (req: Request, res: Response) => 
//     UserController.searchUsers(req as AuthenticatedRequest, res)
// );

export default router;