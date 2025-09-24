"use strict";
/**
 * Security utilities for Firebase Functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRateLimit = checkRateLimit;
exports.getClientIP = getClientIP;
exports.setSecurityHeaders = setSecurityHeaders;
exports.sanitizeLogData = sanitizeLogData;
exports.validateRequestSize = validateRequestSize;
exports.isSuspiciousRequest = isSuspiciousRequest;
exports.createErrorResponse = createErrorResponse;
exports.validateWebhookPayload = validateWebhookPayload;
/**
 * In-memory rate limiting store (for production, use Redis or similar)
 */
const rateLimitStore = new Map();
/**
 * Check if request is within rate limit
 */
function checkRateLimit(identifier, config = { windowMs: 60000, maxRequests: 10 }) {
    const now = Date.now();
    const key = identifier;
    const stored = rateLimitStore.get(key);
    if (!stored || now > stored.resetTime) {
        // Reset or create new entry
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + config.windowMs
        });
        return true;
    }
    if (stored.count >= config.maxRequests) {
        return false;
    }
    stored.count++;
    return true;
}
/**
 * Get client IP address from request
 */
function getClientIP(req) {
    const forwarded = req.headers['x-forwarded-for'];
    const realIP = req.headers['x-real-ip'];
    const cfConnectingIP = req.headers['cf-connecting-ip'];
    if (cfConnectingIP) {
        return String(cfConnectingIP);
    }
    if (realIP) {
        return String(realIP);
    }
    if (forwarded) {
        const ips = String(forwarded).split(',');
        return ips[0].trim();
    }
    return req.ip || 'unknown';
}
/**
 * Set security headers
 */
function setSecurityHeaders(res) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', "default-src 'none'");
}
/**
 * Sanitize log data to prevent information disclosure
 */
function sanitizeLogData(data) {
    if (typeof data !== 'object' || data === null) {
        return data;
    }
    const sanitized = { ...data };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    for (const field of sensitiveFields) {
        if (field in sanitized) {
            sanitized[field] = '[REDACTED]';
        }
    }
    return sanitized;
}
/**
 * Validate request size
 */
function validateRequestSize(req, maxSizeBytes = 1024 * 1024) {
    const contentLength = req.headers['content-length'];
    if (contentLength) {
        const size = parseInt(String(contentLength), 10);
        return size <= maxSizeBytes;
    }
    return true; // If no content-length header, assume it's fine
}
/**
 * Check if request is from a suspicious source
 */
function isSuspiciousRequest(req) {
    const userAgent = req.headers['user-agent'] || '';
    const ip = getClientIP(req);
    // Check for common bot patterns
    const botPatterns = [
        /bot/i,
        /crawler/i,
        /spider/i,
        /scraper/i,
        /curl/i,
        /wget/i,
        /python/i,
        /java/i,
        /go-http/i
    ];
    if (botPatterns.some(pattern => pattern.test(userAgent))) {
        return true;
    }
    // Check for missing or suspicious user agent
    if (!userAgent || userAgent.length < 10) {
        return true;
    }
    // Check for suspicious IP patterns (basic check)
    if (ip === 'unknown' || ip.startsWith('127.0.0.1')) {
        return true;
    }
    return false;
}
/**
 * Create a secure error response
 */
function createErrorResponse(res, statusCode, message, includeDetails = false) {
    setSecurityHeaders(res);
    const response = {
        error: message,
        timestamp: new Date().toISOString()
    };
    if (includeDetails && process.env.NODE_ENV === 'development') {
        response.details = 'Development mode - additional details available';
    }
    res.status(statusCode).json(response);
}
/**
 * Validate webhook payload size and structure
 */
function validateWebhookPayload(payload) {
    if (!payload || typeof payload !== 'object') {
        return false;
    }
    // Check for required fields
    const requiredFields = ['type', 'data'];
    if (!requiredFields.every(field => field in payload)) {
        return false;
    }
    // Check payload size
    const payloadStr = JSON.stringify(payload);
    if (payloadStr.length > 10000) { // 10KB limit
        return false;
    }
    return true;
}
//# sourceMappingURL=security.js.map