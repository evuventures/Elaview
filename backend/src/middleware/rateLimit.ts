// src/middleware/rateLimit.ts
import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

/**
 * Simple in-memory rate limiting (use Redis in production)
 */
export const createRateLimit = (options: {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  message?: string;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}) => {
  const store: RateLimitStore = {};
  const { 
    windowMs, 
    max, 
    message = 'Too many requests', 
    keyGenerator,
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyGenerator ? keyGenerator(req) : req.ip || 'unknown';
    const now = Date.now();
    
    // Clean expired entries periodically
    if (Math.random() < 0.01) { // 1% chance to clean up
      Object.keys(store).forEach(k => {
        if (store[k].resetTime < now) {
          delete store[k];
        }
      });
    }
    
    // Initialize or get current request data
    if (!store[key]) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs
      };
    }
    
    // Reset if window expired
    if (store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs
      };
    }
    
    // Check if limit exceeded
    if (store[key].count >= max) {
      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', store[key].resetTime.toString());
      
      res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000)
      });
      return;
    }
    
    // Increment counter (unless we're skipping this type of request)
    const shouldSkip = (skipSuccessfulRequests || skipFailedRequests);
    
    if (!shouldSkip) {
      store[key].count++;
    } else {
      // We'll increment after the response if needed
      const originalSend = res.send;
      res.send = function(data) {
        const statusCode = res.statusCode;
        const isSuccess = statusCode >= 200 && statusCode < 300;
        const isFailed = statusCode >= 400;
        
        if ((!skipSuccessfulRequests || !isSuccess) && (!skipFailedRequests || !isFailed)) {
          store[key].count++;
        }
        
        return originalSend.call(this, data);
      };
    }
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - store[key].count - 1));
    res.setHeader('X-RateLimit-Reset', store[key].resetTime.toString());
    
    next();
  };
};

/**
 * Rate limit based on user ID instead of IP (for authenticated routes)
 */
export const createUserRateLimit = (options: {
  windowMs: number;
  max: number;
  message?: string;
}) => {
  return createRateLimit({
    ...options,
    keyGenerator: (req: any) => {
      // Use user ID if available, otherwise fall back to IP
      return req.user?.id || req.ip || 'anonymous';
    }
  });
};

// Predefined rate limits for different use cases

/**
 * General API rate limit
 */
export const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes per IP
  message: 'Too many requests, please try again later'
});

/**
 * Authentication rate limit (stricter)
 */
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 authentication attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true // Don't count successful logins
});

/**
 * Profile update rate limit
 */
export const updateRateLimit = createUserRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 updates per 5 minutes per user
  message: 'Too many profile updates, please slow down'
});

/**
 * Search rate limit
 */
export const searchRateLimit = createRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 searches per minute
  message: 'Too many search requests, please wait a moment'
});

/**
 * Upload rate limit
 */
export const uploadRateLimit = createUserRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 uploads per minute per user
  message: 'Too many uploads, please wait before uploading again'
});

/**
 * Password reset rate limit
 */
export const passwordResetRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  message: 'Too many password reset attempts, please try again later'
});

/**
 * Create account rate limit
 */
export const signupRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 signups per hour per IP
  message: 'Too many account creation attempts, please try again later'
});