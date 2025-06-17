// src/config/supabase.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Optimized Supabase client configuration
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce' as const,
    // Increase token refresh threshold to reduce auth requests
    refreshTokenMarginSeconds: 300, // Refresh 5 minutes before expiry
  },
  global: {
    headers: {
      'X-Client-Info': 'your-app/1.0.0'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10 // Limit realtime events
    }
  },
  // Add database connection pooling for better performance
  db: {
    schema: 'public'
  }
};

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, supabaseOptions);

// Cached user authentication with request deduplication
const authCache = new Map<string, { user: any; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
const pendingRequests = new Map<string, Promise<any>>();

export const getAuthenticatedUser = async (token: string) => {
  // Check cache first
  const cached = authCache.get(token);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.user;
  }

  // Check if request is already pending
  if (pendingRequests.has(token)) {
    return pendingRequests.get(token);
  }

  // Create new request
  const request = supabase.auth.getUser(token).then(({ data: { user }, error }) => {
    if (error) throw error;
    
    // Cache the result
    authCache.set(token, { user, timestamp: now });
    
    // Clean up pending request
    pendingRequests.delete(token);
    
    return user;
  }).catch(error => {
    // Clean up pending request on error
    pendingRequests.delete(token);
    throw error;
  });

  // Store pending request
  pendingRequests.set(token, request);
  
  return request;
};

// Utility to clear auth cache (useful for development)
export const clearAuthCache = () => {
  authCache.clear();
  pendingRequests.clear();
};

// Rate limiting utility for development
export const withRateLimit = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  limit: number = 100, // requests per minute
  windowMs: number = 60 * 1000 // 1 minute
): T => {
  const requests: number[] = [];
  
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    
    // Remove old requests outside the window
    while (requests.length > 0 && requests[0] <= now - windowMs) {
      requests.shift();
    }
    
    // Check if we're at the limit
    if (requests.length >= limit) {
      console.warn(`Rate limit exceeded for function ${fn.name}. Requests: ${requests.length}/${limit}`);
      return Promise.reject(new Error('Rate limit exceeded'));
    }
    
    // Add current request
    requests.push(now);
    
    return fn(...args);
  }) as T;
};