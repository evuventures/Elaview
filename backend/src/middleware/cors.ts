// src/middleware/cors.ts
import cors from 'cors';

/**
 * CORS configuration for your Vite frontend
 */
const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:3000', // In case you test with different ports
      'http://localhost:5174',
      'http://localhost:4173', // Vite preview mode
    ];
    
    if (process.env.NODE_ENV === 'production') {
      // Add your production domains here
      const productionOrigins = [
        'https://yourdomain.com',
        'https://www.yourdomain.com',
        // Add your Vercel deployment URLs
        // 'https://your-app.vercel.app'
      ];
      allowedOrigins.push(...productionOrigins);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: [
    'X-Total-Count', // For pagination headers
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ],
  maxAge: 86400, // Cache preflight for 24 hours
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

export const corsMiddleware = cors(corsOptions);

/**
 * Development-only CORS (allows all origins)
 */
export const devCorsMiddleware = cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
});

/**
 * Strict production CORS (only specific domains)
 */
export const prodCorsMiddleware = cors({
  origin: [
    'https://yourdomain.com',
    'https://www.yourdomain.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
});