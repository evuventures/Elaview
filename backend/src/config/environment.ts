// src/config/environment.ts - Create this new file
export const config = {
  // Environment flags
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Feature flags
  features: {
    adminPanel: process.env.NODE_ENV === 'development',
    debugMode: process.env.NODE_ENV === 'development',
    apiLogging: process.env.NODE_ENV === 'development',
  },
  
  // API configuration
  api: {
    // Rate limiting (requests per minute)
    rateLimit: {
      auth: process.env.NODE_ENV === 'development' ? 30 : 60,
      database: process.env.NODE_ENV === 'development' ? 50 : 100,
    },
    
    // Cache durations (in milliseconds)
    cache: {
      userProfile: 5 * 60 * 1000, // 5 minutes
      userList: 10 * 60 * 1000,   // 10 minutes
      auth: 2 * 60 * 1000,        // 2 minutes
    },
    
    // Request timeouts
    timeout: {
      default: 10000, // 10 seconds
      auth: 5000,     // 5 seconds
    }
  },
  
  // Development-specific settings
  dev: {
    hotReloadDelay: 500,        // Delay for admin checks after hot reload
    cacheDebug: true,           // Show cache statistics
    requestLogging: true,       // Log API requests
    maxConcurrentRequests: 3,   // Limit concurrent requests
  }
};

// Export individual flags for convenience
export const { isDevelopment, isProduction } = config;
export const { features } = config;