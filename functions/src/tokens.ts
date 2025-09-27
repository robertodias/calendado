/**
 * JWT token management for magic links
 * 
 * Provides utilities for creating and validating JWT tokens
 * used in magic links for invitations and password resets.
 */

import jwt from 'jsonwebtoken';
import { defineSecret } from 'firebase-functions/params';

// Define secrets
const jwtSecret = defineSecret('JWT_SECRET');
const publicAppUrl = defineSecret('PUBLIC_APP_URL');

export interface MagicLinkPayload {
  inviteId: string;
  email: string;
  type: 'invite' | 'password_reset';
  iat?: number;
  exp?: number;
}

export interface TokenValidationResult {
  valid: boolean;
  payload?: MagicLinkPayload;
  error?: string;
}

export interface MagicLinkResult {
  success: boolean;
  token?: string;
  url?: string;
  expiresAt?: Date;
  error?: string;
}

/**
 * Creates a magic link token for invitations
 */
export function createInviteToken(
  inviteId: string,
  email: string,
  expiresInHours: number = 72
): MagicLinkResult {
  try {
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = new Date((now + (expiresInHours * 3600)) * 1000);
    
    const payload: MagicLinkPayload = {
      inviteId,
      email,
      type: 'invite',
      iat: now
    };

    const token = jwt.sign(payload, jwtSecret.value(), {
      algorithm: 'HS256',
      expiresIn: `${expiresInHours}h`
    });

    const appUrl = publicAppUrl.value();
    const magicLinkUrl = `${appUrl}/invite/${token}`;

    return {
      success: true,
      token,
      url: magicLinkUrl,
      expiresAt
    };

  } catch (error) {
    console.error('Error creating invite token:', error);
    return {
      success: false,
      error: `Failed to create token: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Creates a magic link token for password resets
 */
export function createPasswordResetToken(
  userId: string,
  email: string,
  expiresInHours: number = 1
): MagicLinkResult {
  try {
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = new Date((now + (expiresInHours * 3600)) * 1000);
    
    const payload: MagicLinkPayload = {
      inviteId: userId, // Using userId as the identifier for password resets
      email,
      type: 'password_reset',
      iat: now
    };

    const token = jwt.sign(payload, jwtSecret.value(), {
      algorithm: 'HS256',
      expiresIn: `${expiresInHours}h`
    });

    const appUrl = publicAppUrl.value();
    const magicLinkUrl = `${appUrl}/reset-password?token=${token}`;

    return {
      success: true,
      token,
      url: magicLinkUrl,
      expiresAt
    };

  } catch (error) {
    console.error('Error creating password reset token:', error);
    return {
      success: false,
      error: `Failed to create token: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Validates a magic link token
 */
export function validateMagicLinkToken(token: string): TokenValidationResult {
  try {
    const payload = jwt.verify(token, jwtSecret.value(), {
      algorithms: ['HS256']
    }) as MagicLinkPayload;

    // Additional validation
    if (!payload.inviteId || !payload.email || !payload.type) {
      return {
        valid: false,
        error: 'Invalid token payload'
      };
    }

    if (!['invite', 'password_reset'].includes(payload.type)) {
      return {
        valid: false,
        error: 'Invalid token type'
      };
    }

    return {
      valid: true,
      payload
    };

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return {
        valid: false,
        error: 'Token has expired'
      };
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return {
        valid: false,
        error: 'Invalid token'
      };
    }

    console.error('Error validating magic link token:', error);
    return {
      valid: false,
      error: `Token validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Extracts token from magic link URL
 */
export function extractTokenFromUrl(url: string): string | null {
  try {
    // Handle both /invite/{token} and ?token={token} formats
    const inviteMatch = url.match(/\/invite\/([^\/\?]+)/);
    if (inviteMatch) {
      return inviteMatch[1];
    }

    const tokenMatch = url.match(/[?&]token=([^&]+)/);
    if (tokenMatch) {
      return tokenMatch[1];
    }

    return null;
  } catch (error) {
    console.error('Error extracting token from URL:', error);
    return null;
  }
}

/**
 * Checks if a token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as MagicLinkPayload;
    if (!decoded || !decoded.exp) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
}

/**
 * Gets token expiration date
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as MagicLinkPayload;
    if (!decoded || !decoded.exp) {
      return null;
    }

    return new Date(decoded.exp * 1000);
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return null;
  }
}

/**
 * Creates a short-lived token for immediate use (e.g., email verification)
 */
export function createShortLivedToken(
  inviteId: string,
  email: string,
  type: 'invite' | 'password_reset' = 'invite',
  expiresInMinutes: number = 15
): MagicLinkResult {
  try {
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = new Date((now + (expiresInMinutes * 60)) * 1000);
    
    const payload: MagicLinkPayload = {
      inviteId,
      email,
      type,
      iat: now
    };

    const token = jwt.sign(payload, jwtSecret.value(), {
      algorithm: 'HS256',
      expiresIn: `${expiresInMinutes}m`
    });

    const appUrl = publicAppUrl.value();
    const magicLinkUrl = type === 'invite' 
      ? `${appUrl}/invite/${token}`
      : `${appUrl}/reset-password?token=${token}`;

    return {
      success: true,
      token,
      url: magicLinkUrl,
      expiresAt
    };

  } catch (error) {
    console.error('Error creating short-lived token:', error);
    return {
      success: false,
      error: `Failed to create token: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
