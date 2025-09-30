// import { Request, Response } from 'firebase-functions/v1/https';
import { getClientIP } from './security';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: unknown) => string;
}

interface RateLimitData {
  count: number;
  resetTime: number;
}

// Firestore-based distributed rate limiting
const RATE_LIMIT_COLLECTION = 'rate_limits';
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

// In-memory cache for quick lookups (optional optimization)
const rateLimitCache = new Map<string, RateLimitData & { cachedAt: number }>();
const CACHE_TTL_MS = 5000; // 5 seconds

/**
 * Firestore-based distributed rate limiting
 * Works across multiple function instances
 */
async function getRateLimitData(
  key: string,
  windowMs: number
): Promise<RateLimitData> {
  const db = getFirestore();
  const docRef = db.collection(RATE_LIMIT_COLLECTION).doc(key);
  const now = Date.now();

  try {
    // Check cache first (optional optimization)
    const cached = rateLimitCache.get(key);
    if (cached && now - cached.cachedAt < CACHE_TTL_MS && now <= cached.resetTime) {
      return { count: cached.count, resetTime: cached.resetTime };
    }

    const doc = await docRef.get();

    if (!doc.exists) {
      // Initialize new rate limit entry
      const resetTime = now + windowMs;
      await docRef.set({
        count: 1,
        resetTime,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      const data = { count: 1, resetTime };
      rateLimitCache.set(key, { ...data, cachedAt: now });
      return data;
    }

    const data = doc.data();
    if (!data) {
      throw new Error('Rate limit data is null');
    }

    const resetTime = data.resetTime as number;
    let count = (data.count as number) || 0;

    // Reset if window has expired
    if (now > resetTime) {
      count = 0;
      const newResetTime = now + windowMs;
      await docRef.update({
        count: 1,
        resetTime: newResetTime,
        lastUpdated: FieldValue.serverTimestamp(),
      });

      const newData = { count: 1, resetTime: newResetTime };
      rateLimitCache.set(key, { ...newData, cachedAt: now });
      return newData;
    }

    // Increment counter atomically
    await docRef.update({
      count: FieldValue.increment(1),
      lastUpdated: FieldValue.serverTimestamp(),
    });

    const updatedData = { count: count + 1, resetTime };
    rateLimitCache.set(key, { ...updatedData, cachedAt: now });
    return updatedData;
  } catch (error) {
    // Fallback to permissive behavior on Firestore errors
    console.error('Rate limit check failed:', error);
    return { count: 0, resetTime: now + windowMs };
  }
}

export function rateLimit(config: RateLimitConfig) {
  return async (req: unknown, res: unknown, next: () => void) => {
    const clientId = config.keyGenerator
      ? config.keyGenerator(req)
      : getClientIP(req as { ip?: string });
    const now = Date.now();

    try {
      const clientData = await getRateLimitData(clientId, config.windowMs);

      // Check if limit exceeded
      if (clientData.count >= config.maxRequests) {
        if (res && typeof res === 'object' && 'status' in res) {
          (res as { status: (code: number) => void }).status(429);
          if (
            res &&
            typeof res === 'object' &&
            'json' in res &&
            typeof (res as { json: unknown }).json === 'function'
          ) {
            (res as { json: (data: unknown) => void }).json({
              error: 'Too many requests',
              retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
              limit: config.maxRequests,
              remaining: 0,
            });
          }
        }
        return;
      }

      // Add rate limit headers
      if (
        res &&
        typeof res === 'object' &&
        'set' in res &&
        typeof (res as { set: unknown }).set === 'function'
      ) {
        const resObj = res as {
          set: (name: string, value: string) => void;
        };
        resObj.set('X-RateLimit-Limit', config.maxRequests.toString());
        resObj.set(
          'X-RateLimit-Remaining',
          (config.maxRequests - clientData.count).toString()
        );
        resObj.set(
          'X-RateLimit-Reset',
          new Date(clientData.resetTime).toISOString()
        );
      }

      next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      // Fail open - allow request through if rate limiting fails
      next();
    }
  };
}

// Predefined rate limiters
export const waitlistRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 requests per 15 minutes
  keyGenerator: (req: unknown) => {
    const body = req as { body?: { email?: string } };
    const email = body.body?.email;
    return email ? `waitlist:${email.toLowerCase()}` : getClientIP(req as { ip?: string });
  },
});

export const webhookRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  keyGenerator: (req: unknown) =>
    `webhook:${getClientIP(req as { ip?: string })}`,
});

export const adminRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20, // 20 requests per minute
  keyGenerator: (req: unknown) => `admin:${getClientIP(req as { ip?: string })}`,
});

// Clear rate limit cache for testing
export function clearRateLimitCache(): void {
  rateLimitCache.clear();
}

/**
 * Cleanup old rate limit entries (should be called periodically)
 */
export async function cleanupRateLimits(): Promise<void> {
  const db = getFirestore();
  const now = Date.now();
  const cutoffTime = now - CLEANUP_INTERVAL_MS;

  try {
    const snapshot = await db
      .collection(RATE_LIMIT_COLLECTION)
      .where('resetTime', '<', cutoffTime)
      .limit(500)
      .get();

    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error('Error cleaning up rate limits:', error);
  }
}
