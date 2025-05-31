/**
 * Security headers middleware
 */
export const securityHeaders = (req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Content Security Policy (adjust based on your needs)
    const csp = [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'", // Allow inline styles for development
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-ancestors 'none'"
    ].join('; ');
    res.setHeader('Content-Security-Policy', csp);
    // Strict Transport Security (HTTPS only)
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    // Remove powered by header
    res.removeHeader('X-Powered-By');
    next();
};
/**
 * Request sanitization middleware
 */
export const sanitizeInput = (req, res, next) => {
    // Basic input sanitization
    const sanitize = (obj) => {
        if (typeof obj === 'string') {
            return obj
                .trim()
                // Remove script tags
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                // Remove javascript: protocol
                .replace(/javascript:/gi, '')
                // Remove on* event handlers
                .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
                // Remove HTML entities that could be dangerous
                .replace(/&lt;script&gt;.*?&lt;\/script&gt;/gi, '');
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitize);
        }
        if (obj && typeof obj === 'object') {
            const sanitized = {};
            for (const key in obj) {
                // Skip potentially dangerous keys
                if (key.toLowerCase().includes('script') || key.toLowerCase().includes('eval')) {
                    continue;
                }
                sanitized[key] = sanitize(obj[key]);
            }
            return sanitized;
        }
        return obj;
    };
    if (req.body) {
        req.body = sanitize(req.body);
    }
    if (req.query) {
        req.query = sanitize(req.query);
    }
    if (req.params) {
        req.params = sanitize(req.params);
    }
    next();
};
/**
 * IP validation middleware
 */
export const validateIP = (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    // Block private/internal IPs in production (except for health checks)
    if (process.env.NODE_ENV === 'production' && req.path !== '/health') {
        const privateIPRegex = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|127\.|::1|fc00:|fe80:)/;
        if (clientIP && privateIPRegex.test(clientIP)) {
            res.status(403).json({
                success: false,
                error: 'Access denied from private network'
            });
            return;
        }
    }
    next();
};
/**
 * Request size limiter
 */
export const requestSizeLimiter = (maxSize = '10mb') => {
    return (req, res, next) => {
        const contentLength = parseInt(req.get('content-length') || '0');
        const maxBytes = parseSize(maxSize);
        if (contentLength > maxBytes) {
            res.status(413).json({
                success: false,
                error: `Request too large. Maximum size is ${maxSize}`
            });
            return;
        }
        next();
    };
};
/**
 * Parse size string to bytes
 */
function parseSize(size) {
    const units = {
        'b': 1,
        'kb': 1024,
        'mb': 1024 * 1024,
        'gb': 1024 * 1024 * 1024
    };
    const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
    if (!match)
        return 0;
    const value = parseFloat(match[1]);
    const unit = match[2] || 'b';
    return Math.floor(value * units[unit]);
}
/**
 * HTTP method validation
 */
export const validateHttpMethod = (allowedMethods) => {
    return (req, res, next) => {
        if (!allowedMethods.includes(req.method)) {
            res.setHeader('Allow', allowedMethods.join(', '));
            res.status(405).json({
                success: false,
                error: `Method ${req.method} not allowed`
            });
            return;
        }
        next();
    };
};
/**
 * User agent validation (block known bots/crawlers if needed)
 */
export const validateUserAgent = (req, res, next) => {
    const userAgent = req.get('User-Agent');
    // Block requests without user agent (potential bots)
    if (!userAgent && process.env.NODE_ENV === 'production') {
        res.status(403).json({
            success: false,
            error: 'User agent required'
        });
        return;
    }
    // Block known malicious user agents
    const blockedAgents = [
        /sqlmap/i,
        /nikto/i,
        /masscan/i,
        /nmap/i,
        /dirb/i,
        /dirbuster/i
    ];
    if (userAgent && blockedAgents.some(pattern => pattern.test(userAgent))) {
        console.warn(`Blocked malicious user agent: ${userAgent} from ${req.ip}`);
        res.status(403).json({
            success: false,
            error: 'Access denied'
        });
        return;
    }
    next();
};
/**
 * Request timeout middleware
 */
export const requestTimeout = (timeoutMs = 30000) => {
    return (req, res, next) => {
        const timeout = setTimeout(() => {
            if (!res.headersSent) {
                res.status(408).json({
                    success: false,
                    error: 'Request timeout'
                });
            }
        }, timeoutMs);
        res.on('finish', () => {
            clearTimeout(timeout);
        });
        res.on('close', () => {
            clearTimeout(timeout);
        });
        next();
    };
};
