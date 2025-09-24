// import { Request, Response } from 'firebase-functions/v1/https';
import { getClientIP } from './security';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: any) => string;
}

interface RateLimitData {
  count: number;
  resetTime: number;
}

// In-memory store for development (use Redis in production)
const rateLimitStore = new Map<string, RateLimitData>();

export function rateLimit(config: RateLimitConfig) {
  return (req: any, res: any, next: () => void) => {
    const clientId = config.keyGenerator ? config.keyGenerator(req) : getClientIP(req);
    const now = Date.now();
    
    // Clean up expired entries
    for (const [key, data] of rateLimitStore.entries()) {
      if (now > data.resetTime) {
        rateLimitStore.delete(key);
      }
    }
    
    const clientData = rateLimitStore.get(clientId) || { 
      count: 0, 
      resetTime: now + config.windowMs 
    };
    
    // Reset if window has expired
    if (now > clientData.resetTime) {
      clientData.count = 0;
      clientData.resetTime = now + config.windowMs;
    }
    
    // Check if limit exceeded
    if (clientData.count >= config.maxRequests) {
      res.status(429).json({ 
        error: 'Too many requests',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
        limit: config.maxRequests,
        remaining: 0
      });
      return;
    }
    
    // Increment counter
    clientData.count++;
    rateLimitStore.set(clientId, clientData);
    
    // Add rate limit headers
    res.set('X-RateLimit-Limit', config.maxRequests.toString());
    res.set('X-RateLimit-Remaining', (config.maxRequests - clientData.count).toString());
    res.set('X-RateLimit-Reset', new Date(clientData.resetTime).toISOString());
    
    next();
  };
}

// Predefined rate limiters
export const waitlistRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 requests per 15 minutes
  keyGenerator: (req: any) => {
    const email = req.body?.email;
    return email ? `waitlist:${email.toLowerCase()}` : getClientIP(req);
  }
});

export const webhookRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  keyGenerator: (req: any) => `webhook:${getClientIP(req)}`
});

export const adminRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20, // 20 requests per minute
  keyGenerator: (req: any) => `admin:${getClientIP(req)}`
});

// Clear rate limit for testing
export function clearRateLimit(): void {
  rateLimitStore.clear();
}
