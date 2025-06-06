import express from 'express';
import dotenv from 'dotenv';

// Import middleware
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { generalRateLimit, authRateLimit } from './middleware/rateLimit.js';
import { securityHeaders, sanitizeInput } from './middleware/security.js';
import { requestLogger } from './middleware/logging.js';

// Import routes - FIXED PATHS
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import testRoutes from './routes/testRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware (apply first)
app.use(securityHeaders);
app.use(corsMiddleware);

// Rate limiting
app.use(generalRateLimit);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Input sanitization
app.use(sanitizeInput);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(requestLogger);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Public test routes (NO AUTH REQUIRED) - Only in development/testing
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/test', testRoutes);
  console.log(`🧪 Test endpoints will be available at:`);
  console.log(`   GET http://localhost:${PORT}/api/test/health`);
  console.log(`   GET http://localhost:${PORT}/api/test/users`);
  console.log(`   GET http://localhost:${PORT}/api/test/users/:id`);
}

// Protected API Routes
app.use('/api/auth', authRateLimit, authRoutes);
app.use('/api/users', userRoutes);

// Error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 Auth endpoints available at:`);
  console.log(`   POST http://localhost:${PORT}/api/auth/complete-profile`);
  console.log(`   GET http://localhost:${PORT}/api/auth/profile`);
  console.log(`   POST http://localhost:${PORT}/api/auth/verify-token`);
  console.log(`   GET http://localhost:${PORT}/api/auth/test-protected`);
  console.log(`   GET http://localhost:${PORT}/api/auth/test-landlord`);
});

export default app;