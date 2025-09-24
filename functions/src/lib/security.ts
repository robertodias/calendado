/**
 * Security utilities for Firebase Functions
 */

import { Request, Response } from 'firebase-functions/v1';

/**
 * Rate limiting configuration
 */
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

/**
 * In-memory rate limiting store (for production, use Redis or similar)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Check if request is within rate limit
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 10 }
): boolean {
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
export function getClientIP(req: Request): string {
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
export function setSecurityHeaders(res: Response): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'none'");
}

/**
 * Sanitize log data to prevent information disclosure
 */
export function sanitizeLogData(data: any): any {
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
export function validateRequestSize(req: Request, maxSizeBytes: number = 1024 * 1024): boolean {
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
export function isSuspiciousRequest(req: Request): boolean {
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
export function createErrorResponse(
  res: Response,
  statusCode: number,
  message: string,
  includeDetails: boolean = false
): void {
  setSecurityHeaders(res);
  
  const response: any = {
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
export function validateWebhookPayload(payload: any): boolean {
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
