// src/routes/authRoutes.ts  
import { Router } from 'express';
import { validateSchema, signupSchema, loginSchema } from '../middleware/validation.js';
import { signupRateLimit } from '../middleware/rateLimit.js';
import { AuthController } from '../controllers/authController.js';
const router = Router();
// Extra rate limiting for signup
router.post('/signup', signupRateLimit, validateSchema(signupSchema), AuthController.signup);
router.post('/login', validateSchema(loginSchema), AuthController.login);
export default router;
