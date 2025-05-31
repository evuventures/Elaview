// src/routes/userRoutes.ts
import { Router, Request, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { validateSchema, updateUserProfileSchema, uploadImageSchema } from '../middleware/validation.js';
import { updateRateLimit, uploadRateLimit } from '../middleware/rateLimit.js';
import { UserController } from '../controllers/userController.js';

const router = Router();

// Apply auth to all user routes
router.use(authenticateToken);

// Specific rate limits for certain endpoints
router.patch('/me', updateRateLimit, validateSchema(updateUserProfileSchema), (req: Request, res: Response) => UserController.updateProfile(req as AuthenticatedRequest, res));
router.post('/upload-image', uploadRateLimit, validateSchema(uploadImageSchema), (req: Request, res: Response) => UserController.uploadProfileImage(req as AuthenticatedRequest, res));

// Other routes...
router.get('/me', (req: Request, res: Response) => UserController.getMyProfile(req as AuthenticatedRequest, res));
router.get('/search', (req: Request, res: Response) => UserController.searchUsers(req as AuthenticatedRequest, res));

export default router;