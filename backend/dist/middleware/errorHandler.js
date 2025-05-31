/**
 * Create a custom API error
 */
export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    // Log error details
    console.error('Error Details:', {
        message: err.message,
        statusCode,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    // Don't leak error details in production
    const errorResponse = {
        success: false,
        error: message
    };
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
        errorResponse.details = {
            url: req.url,
            method: req.method,
            body: req.body,
            params: req.params,
            query: req.query
        };
    }
    res.status(statusCode).json(errorResponse);
};
/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.originalUrl} not found`
    });
};
/**
 * Async error wrapper - catches async errors and passes to error handler
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
/**
 * Handle different types of operational errors
 */
export const handleOperationalError = (err) => {
    // Handle specific error types
    if (err.message.includes('duplicate key')) {
        return new AppError('Resource already exists', 409);
    }
    if (err.message.includes('foreign key')) {
        return new AppError('Referenced resource not found', 400);
    }
    if (err.message.includes('not found')) {
        return new AppError('Resource not found', 404);
    }
    // Default to internal server error
    return new AppError('Internal server error', 500);
};
