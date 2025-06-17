// src/middleware/auth.ts - Fixed authentication middleware
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';

// In-memory cache for user verification with TTL
interface CacheEntry {
  user: any;
  timestamp: number;
}

const userCache = new Map<string, CacheEntry>();
const pendingVerifications = new Map<string, Promise<any>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 1000; // Prevent memory leaks

// Cache statistics for monitoring
let cacheHits = 0;
let cacheMisses = 0;

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email?: string;
    role?: string;
  };
}

/**
 * Enhanced authentication middleware with caching and deduplication
 */
export const authenticateUser = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  const startTime = Date.now();
  
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false,
        error: 'Missing or invalid authorization header',
        code: 'MISSING_AUTH_HEADER'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      res.status(401).json({ 
        success: false,
        error: 'No token provided',
        code: 'EMPTY_TOKEN'
      });
      return;
    }

    // Check cache first
    const cached = userCache.get(token);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      cacheHits++;
      (req as AuthenticatedRequest).user = {
        id: cached.user.id,
        email: cached.user.email,
        role: cached.user.user_metadata?.role
      };
      
      // Add performance headers in development
      if (process.env.NODE_ENV === 'development') {
        res.setHeader('X-Auth-Cache', 'HIT');
        res.setHeader('X-Auth-Time', `${Date.now() - startTime}ms`);
      }
      
      next();
      return;
    }

    cacheMisses++;

    // Check if verification is already pending for this token
    if (pendingVerifications.has(token)) {
      try {
        const user = await pendingVerifications.get(token);
        (req as AuthenticatedRequest).user = {
          id: user.id,
          email: user.email,
          role: user.user_metadata?.role
        };
        
        if (process.env.NODE_ENV === 'development') {
          res.setHeader('X-Auth-Cache', 'PENDING');
          res.setHeader('X-Auth-Time', `${Date.now() - startTime}ms`);
        }
        
        next();
        return;
      } catch (error) {
        res.status(401).json({ 
          success: false,
          error: 'Token verification failed',
          code: 'VERIFICATION_FAILED'
        });
        return;
      }
    }

    // Create new verification promise
    const verificationPromise = verifyToken(token);
    pendingVerifications.set(token, verificationPromise);

    try {
      const user = await verificationPromise;
      
      if (!user) {
        pendingVerifications.delete(token);
        res.status(401).json({ 
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
        return;
      }

      // Cache the result with size limit
      if (userCache.size >= MAX_CACHE_SIZE) {
        // Remove oldest entries (simple LRU)
        const oldestKey = Array.from(userCache.keys())[0];
        userCache.delete(oldestKey);
      }
      
      userCache.set(token, { user, timestamp: now });
      
      // Clean up pending verification
      pendingVerifications.delete(token);
      
      // Attach user to request
      (req as AuthenticatedRequest).user = {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role
      };

      if (process.env.NODE_ENV === 'development') {
        res.setHeader('X-Auth-Cache', 'MISS');
        res.setHeader('X-Auth-Time', `${Date.now() - startTime}ms`);
      }

      next();
    } catch (error) {
      // Clean up pending verification
      pendingVerifications.delete(token);
      
      console.error('Authentication error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Authentication failed';
      let errorCode = 'AUTH_FAILED';
      
      if (error instanceof Error) {
        if (error.message.includes('expired')) {
          errorMessage = 'Token has expired';
          errorCode = 'TOKEN_EXPIRED';
        } else if (error.message.includes('invalid')) {
          errorMessage = 'Invalid token format';
          errorCode = 'INVALID_TOKEN';
        }
      }
      
      res.status(401).json({ 
        success: false,
        error: errorMessage,
        code: errorCode,
        ...(process.env.NODE_ENV === 'development' && {
          debug: error instanceof Error ? error.message : 'Unknown error'
        })
      });
    }
  } catch (error) {
    console.error('Auth middleware critical error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Authentication service error',
      code: 'SERVICE_ERROR'
    });
  }
};

// Helper function to verify token with Supabase
const verifyToken = async (token: string) => {
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid token');
  }
  
  return user;
};

// Middleware for admin-only routes
export const requireAdmin = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      res.status(401).json({ 
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }

    // Check if user profile is cached
    const cacheKey = `admin_${authReq.user.id}`;
    const cached = userCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      if (cached.user.role !== 'admin') {
        res.status(403).json({ 
          success: false,
          error: 'Admin access required',
          code: 'INSUFFICIENT_ROLE'
        });
        return;
      }
      next();
      return;
    }

    // Fetch user profile to check admin status
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', authReq.user.id)
      .single();

    if (error || !profile) {
      res.status(500).json({ 
        success: false,
        error: 'Failed to verify admin status',
        code: 'ADMIN_CHECK_FAILED'
      });
      return;
    }

    // Cache the admin check
    userCache.set(cacheKey, { user: profile, timestamp: now });

    if (profile.role !== 'admin') {
      res.status(403).json({ 
        success: false,
        error: 'Admin access required',
        code: 'INSUFFICIENT_ROLE'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Admin verification failed',
      code: 'ADMIN_VERIFICATION_FAILED'
    });
  }
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (requiredRole: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }
    
    // Get user profile to check role
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', authReq.user.id)
      .single();
    
    if (error || !profile) {
      res.status(500).json({
        success: false,
        error: 'Failed to verify user role',
        code: 'ROLE_CHECK_FAILED'
      });
      return;
    }
    
    if (profile.role !== requiredRole && profile.role !== 'both' && profile.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: `${requiredRole} role required`,
        code: 'INSUFFICIENT_ROLE',
        required: requiredRole,
        current: profile.role || 'none'
      });
      return;
    }
    
    next();
  };
};

/**
 * Landlord-only middleware (convenience wrapper)
 */
export const requireLandlord = requireRole('landlord');

/**
 * Get cache statistics for monitoring
 */
export const getCacheStats = () => {
  const totalRequests = cacheHits + cacheMisses;
  
  return {
    size: userCache.size,
    hits: cacheHits,
    misses: cacheMisses,
    hitRate: totalRequests > 0 ? `${((cacheHits / totalRequests) * 100).toFixed(1)}%` : '0%',
    pendingVerifications: pendingVerifications.size
  };
};

/**
 * Clear auth cache (useful for development and testing)
 */
export const clearAuthCache = () => {
  const stats = getCacheStats();
  userCache.clear();
  pendingVerifications.clear();
  cacheHits = 0;
  cacheMisses = 0;
  
  console.log(`🧹 Auth cache cleared. Previous stats:`, stats);
};

/**
 * Periodic cache cleanup to prevent memory leaks
 */
const cleanupCache = () => {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [token, entry] of userCache.entries()) {
    if (now - entry.timestamp > CACHE_DURATION) {
      userCache.delete(token);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0 && process.env.NODE_ENV === 'development') {
    console.log(`🧹 Cleaned ${cleanedCount} expired auth cache entries`);
  }
};

// Run cleanup every 10 minutes
setInterval(cleanupCache, 10 * 60 * 1000);

// Log cache stats every hour in development
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const stats = getCacheStats();
    if (stats.hits + stats.misses > 0) {
      console.log('📊 Auth Cache Stats:', stats);
    }
  }, 60 * 60 * 1000);
}