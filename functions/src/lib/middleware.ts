/**
 * Common middleware functions for Firebase Functions
 * 
 * Provides reusable middleware for authentication, validation,
 * and error handling across all functions.
 */

import { Request, Response } from 'firebase-functions/v1';
import { CallableRequest } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { HttpsError } from 'firebase-functions/v2/https';
import { handleError } from './errorHandler';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  customClaims?: Record<string, any>;
}

export interface AuthMiddlewareOptions {
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
  allowedRoles?: string[];
}

/**
 * Middleware for HTTP functions that validates authentication
 */
export function withAuth(options: AuthMiddlewareOptions = {}) {
  return (handler: (req: Request, res: Response, user: AuthenticatedUser) => Promise<void>) => {
    return async (req: Request, res: Response) => {
      try {
        // Extract and validate token
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader || !String(authHeader).startsWith('Bearer ')) {
          res.status(401).json({ error: 'Missing or invalid authorization header' });
          return;
        }

        const token = String(authHeader).substring(7);
        const decodedToken = await getAuth().verifyIdToken(token);
        
        const user: AuthenticatedUser = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          customClaims: decodedToken
        };

        // Check role requirements
        if (options.requireSuperAdmin || options.requireAdmin || options.allowedRoles) {
          const hasRequiredRole = await validateUserRoles(user, options);
          if (!hasRequiredRole) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
          }
        }

        // Call the actual handler
        await handler(req, res, user);
      } catch (error) {
        console.error('Auth middleware error:', error);
        handleError(res, error);
      }
    };
  };
}

/**
 * Middleware for callable functions that validates authentication
 */
export function withCallableAuth(options: AuthMiddlewareOptions = {}) {
  return <T extends CallableRequest>(
    handler: (request: T, user: AuthenticatedUser) => Promise<any>
  ) => {
    return async (request: T) => {
      try {
        if (!request.auth) {
          throw new HttpsError('unauthenticated', 'Authentication required');
        }

        const user: AuthenticatedUser = {
          uid: request.auth.uid,
          email: request.auth.token.email,
          customClaims: request.auth.token
        };

        // Check role requirements
        if (options.requireSuperAdmin || options.requireAdmin || options.allowedRoles) {
          const hasRequiredRole = await validateUserRoles(request, options);
          if (!hasRequiredRole) {
            throw new HttpsError('permission-denied', 'Insufficient permissions');
          }
        }

        // Call the actual handler
        return await handler(request, user);
      } catch (error) {
        if (error instanceof HttpsError) {
          throw error;
        }
        console.error('Callable auth middleware error:', error);
        throw new HttpsError('internal', 'Internal server error');
      }
    };
  };
}

/**
 * Validates user roles against requirements
 */
async function validateUserRoles(
  userOrRequest: AuthenticatedUser | CallableRequest,
  options: AuthMiddlewareOptions
): Promise<boolean> {
  let user: AuthenticatedUser;

  if ('auth' in userOrRequest) {
    // CallableRequest
    if (!userOrRequest.auth) return false;
    user = {
      uid: userOrRequest.auth.uid,
      email: userOrRequest.auth.token.email,
      customClaims: userOrRequest.auth.token
    };
  } else {
    // AuthenticatedUser
    user = userOrRequest;
  }

  const customClaims = user.customClaims || {};
  const userRoles = customClaims.roles || [];
  const isPlatformAdmin = customClaims.platformAdmin === true;

  // Check superadmin requirement
  if (options.requireSuperAdmin) {
    return isPlatformAdmin || userRoles.includes('superadmin');
  }

  // Check admin requirement
  if (options.requireAdmin) {
    return isPlatformAdmin || 
           userRoles.includes('superadmin') || 
           userRoles.includes('admin');
  }

  // Check specific roles
  if (options.allowedRoles && options.allowedRoles.length > 0) {
    return options.allowedRoles.some(role => userRoles.includes(role));
  }

  return true;
}

/**
 * Validates HTTP method
 */
export function requireMethod(method: string) {
  return (req: Request, res: Response, next: () => void) => {
    if (req.method !== method) {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }
    next();
  };
}

/**
 * Validates request body structure
 */
export function validateBody(requiredFields: string[]) {
  return (req: Request, res: Response, next: () => void) => {
    const body = req.body;
    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: 'Invalid request body' });
      return;
    }

    const missingFields = requiredFields.filter(field => !(field in body));
    if (missingFields.length > 0) {
      res.status(400).json({ 
        error: 'Missing required fields', 
        missingFields 
      });
      return;
    }

    next();
  };
}

/**
 * Rate limiting middleware
 */
export function withRateLimit(requestsPerMinute: number = 60) {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: () => void) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    
    const clientData = requests.get(clientId);
    
    if (!clientData || now > clientData.resetTime) {
      requests.set(clientId, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }
    
    if (clientData.count >= requestsPerMinute) {
      res.status(429).json({ error: 'Rate limit exceeded' });
      return;
    }
    
    clientData.count++;
    next();
  };
}

