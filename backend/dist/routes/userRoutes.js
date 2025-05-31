// src/routes/userRoutes.ts
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateSchema, updateUserProfileSchema, uploadImageSchema } from '../middleware/validation.js';
import { updateRateLimit, uploadRateLimit } from '../middleware/rateLimit.js';
import { UserController } from '../controllers/userController.js';
const router = Router();
// Apply auth to all user routes
router.use(authenticateToken);
// Specific rate limits for certain endpoints
router.patch('/me', updateRateLimit, validateSchema(updateUserProfileSchema), (req, res) => UserController.updateProfile(req, res));
router.post('/upload-image', uploadRateLimit, validateSchema(uploadImageSchema), (req, res) => UserController.uploadProfileImage(req, res));
// Other routes...
router.get('/me', (req, res) => UserController.getMyProfile(req, res));
router.get('/search', (req, res) => UserController.searchUsers(req, res));
export default router;
