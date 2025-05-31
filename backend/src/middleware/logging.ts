// src/middleware/logging.ts
import { Request, Response, NextFunction } from 'express';

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // Generate unique request ID
  const requestId = generateRequestId();
  
  // Add request ID to request and response
  (req as any).requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  // Log incoming request
  console.log(`[${timestamp}] ${requestId} - ${req.method} ${req.url} - IP: ${req.ip} - UA: ${req.get('User-Agent')?.substring(0, 100) || 'N/A'}`);
  
  // Log request body for debugging (be careful with sensitive data)
  if (process.env.NODE_ENV === 'development' && req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = sanitizeLogData(req.body);
    console.log(`[${timestamp}] ${requestId} - Request Body:`, JSON.stringify(sanitizedBody, null, 2));
  }
  
  // Track response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    const endTimestamp = new Date().toISOString();
    
    // Log response
    console.log(`[${endTimestamp}] ${requestId} - ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    
    // Log response body for debugging (only in development and for errors)
    if (process.env.NODE_ENV === 'development' && (res.statusCode >= 400 || process.env.LOG_RESPONSES === 'true')) {
      try {
        const responseData = typeof data === 'string' ? JSON.parse(data) : data;
        const sanitizedResponse = sanitizeLogData(responseData);
        console.log(`[${endTimestamp}] ${requestId} - Response:`, JSON.stringify(sanitizedResponse, null, 2));
      } catch (error) {
        console.log(`[${endTimestamp}] ${requestId} - Response (raw):`, data?.toString().substring(0, 200));
      }
    }
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`[${endTimestamp}] ${requestId} - SLOW REQUEST: ${duration}ms - ${req.method} ${req.url}`);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * Error logging middleware
 */
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  const timestamp = new Date().toISOString();
  const requestId = (req as any).requestId || 'unknown';
  
  console.error(`[${timestamp}] ${requestId} - ERROR:`, {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: sanitizeLogData(req.body),
    params: req.params,
    query: req.query
  });
  
  next(err);
};

/**
 * API analytics logging
 */
export const analyticsLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const analytics = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      contentLength: res.get('Content-Length'),
      requestId: (req as any).requestId
    };
    
    // In production, you might want to send this to a analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics:', JSON.stringify(analytics));
    }
    
    // You could send to external services here:
    // - Google Analytics
    // - Mixpanel
    // - Custom analytics endpoint
    // - Database for internal analytics
  });
  
  next();
};

/**
 * Performance monitoring
 */
export const performanceLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = process.hrtime.bigint();
  
  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationNs = end - start;
    const durationMs = Number(durationNs) / 1000000; // Convert to milliseconds
    
    // Log performance metrics
    const metrics = {
      timestamp: new Date().toISOString(),
      requestId: (req as any).requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100, // Round to 2 decimal places
      memoryUsage: process.memoryUsage(),
    };
    
    // Log slow requests or errors
    if (durationMs > 1000 || res.statusCode >= 400) {
      console.warn('Performance Alert:', JSON.stringify(metrics, null, 2));
    }
    
    // In production, you might want to send metrics to monitoring services
    // like DataDog, New Relic, or custom monitoring
  });
  
  next();
};

/**
 * Security event logger
 */
export const securityLogger = {
  logAuthAttempt: (req: Request, success: boolean, userId?: string) => {
    console.log(`[SECURITY] Auth attempt - IP: ${req.ip}, Success: ${success}, User: ${userId || 'unknown'}, UA: ${req.get('User-Agent')}`);
  },
  
  logRateLimitHit: (req: Request, limit: number) => {
    console.warn(`[SECURITY] Rate limit hit - IP: ${req.ip}, Limit: ${limit}, URL: ${req.url}`);
  },
  
  logSuspiciousActivity: (req: Request, reason: string) => {
    console.warn(`[SECURITY] Suspicious activity - IP: ${req.ip}, Reason: ${reason}, URL: ${req.url}, UA: ${req.get('User-Agent')}`);
  },
  
  logAccessDenied: (req: Request, reason: string) => {
    console.warn(`[SECURITY] Access denied - IP: ${req.ip}, Reason: ${reason}, URL: ${req.url}`);
  }
};

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Sanitize sensitive data from logs
 */
function sanitizeLogData(data: any): any {
  if (!data) return data;
  
  const sensitiveFields = [
    'password',
    'token',
    'access_token',
    'refresh_token',
    'secret',
    'key',
    'authorization',
    'credit_card',
    'ssn',
    'social_security'
  ];
  
  if (typeof data === 'object') {
    const sanitized = { ...data };
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }
    
    // Recursively sanitize nested objects
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'object') {
        sanitized[key] = sanitizeLogData(sanitized[key]);
      }
    }
    
    return sanitized;
  }
  
  return data;
}

/**
 * Morgan-style HTTP request logger (alternative simpler option)
 */
export const simpleLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    
    // Format: [timestamp] method url status duration - ip
    console.log(`[${timestamp}] ${req.method} ${req.url} ${res.statusCode} ${duration}ms - ${req.ip}`);
  });
  
  next();
};