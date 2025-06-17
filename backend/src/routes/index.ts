// src/index.ts - Fixed Express server with optimizations
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes - Fixed imports
import authRoutes from './authRoutes.js'
import userRoutes from './userRoutes.js';
import testRoutes from './testRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const isDevelopment = process.env.NODE_ENV === 'development';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development if needed
}));

// Compression middleware
app.use(compression());

// CORS configuration
app.use(cors({
  origin: isDevelopment 
    ? ['http://localhost:3000', 'http://127.0.0.1:3000']
    : process.env.FRONTEND_URL?.split(',') || ['https://yourdomain.com'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting - more aggressive in development to catch issues early
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 200 : 1000, // Lower limit in dev to catch excessive requests
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/health'
});

// Specific rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 20 : 50, // Very limited auth attempts
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  }
});

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
if (isDevelopment) {
  app.use((req, res, next) => {
    const start = Date.now();
    console.log(`🔍 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const status = res.statusCode;
      const statusEmoji = status >= 400 ? '❌' : status >= 300 ? '⚠️' : '✅';
      console.log(`${statusEmoji} ${req.method} ${req.path} - ${status} (${duration}ms)`);
    });
    
    next();
  });
}

// Health check endpoint (no rate limiting)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server Error:', error);
  
  // Don't leak error details in production
  const errorResponse = isDevelopment 
    ? { error: error.message, stack: error.stack }
    : { error: 'Internal server error' };
    
  res.status(error.statusCode || 500).json(errorResponse);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: `Route ${req.originalUrl} not found`,
    availableRoutes: ['/api/auth', '/api/users', '/health']
  });
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`🛑 ${signal} received, shutting down gracefully`);
  server.close(() => {
    console.log('✅ Server closed. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (isDevelopment) {
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`🔧 API base: http://localhost:${PORT}/api`);
    console.log(`🔐 Auth endpoints:`);
    console.log(`   POST http://localhost:${PORT}/api/auth/complete-profile`);
    console.log(`   GET  http://localhost:${PORT}/api/auth/profile`);
    console.log(`   POST http://localhost:${PORT}/api/auth/verify-token`);
    console.log(`   GET  http://localhost:${PORT}/api/auth/test-protected`);
    console.log(`   GET  http://localhost:${PORT}/api/auth/test-landlord`);
  }
});

export default app;