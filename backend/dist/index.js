// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
// Import middleware
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler, notFoundHandler, errorLogger } from './middleware/errorHandler.js';
import { generalRateLimit, authRateLimit } from './middleware/rateLimit.js';
import { securityHeaders, sanitizeInput, requestSizeLimiter } from './middleware/security.js';
import { requestLogger, performanceLogger } from './middleware/logging.js';
// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
// 1. Security middleware (apply first)
app.use(securityHeaders);
app.use(corsMiddleware);
// 2. Rate limiting (early protection)
app.use(generalRateLimit);
// 3. Request processing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestSizeLimiter('10mb'));
// 4. Input sanitization
app.use(sanitizeInput);
// 5. Logging (after parsing, before routes)
if (process.env.NODE_ENV !== 'test') {
    app.use(requestLogger);
    app.use(performanceLogger);
}
// 6. Health check (before auth)
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
    });
});
// 7. API Routes with specific middleware
app.use('/api/auth', authRateLimit, authRoutes); // Extra rate limiting for auth
app.use('/api/users', userRoutes); // User routes have auth middleware inside
// 8. Error handling (must be last!)
app.use(errorLogger); // Log errors before handling
app.use(notFoundHandler); // 404 handler
app.use(errorHandler); // Global error handler
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🛡️  Security: CORS, Rate Limiting, Input Sanitization`);
});
export default app;
