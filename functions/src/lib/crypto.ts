import { createHmac, createHash } from 'crypto';

/**
 * Generate SHA256 hash for email deduplication
 */
export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Generate dedupe key for email addresses
 */
export function generateDedupeKey(email: string): string {
  const normalized = email.trim().toLowerCase();
  return sha256(normalized);
}

/**
 * Verify Svix webhook signature (used by Resend)
 * Svix signature format: v1,<signature>
 */
export function verifyResendSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Svix signature format: v1,<signature>
    if (!signature.startsWith('v1,')) {
      console.warn('Invalid signature format, expected v1,<signature>');
      return false;
    }
    
    const actualSignature = signature.substring(3);
    
    // Svix uses HMAC-SHA256 with the secret as the key
    const expectedSignature = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    // Use constant-time comparison to prevent timing attacks
    return timingSafeEqual(
      Buffer.from(actualSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Error verifying Resend signature:', error);
    return false;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  
  return result === 0;
}

/**
 * Extract signature from Authorization header
 * Expected format: "Bearer <signature>"
 */
export function extractSignature(authHeader: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email.trim());
}

/**
 * Normalize email address
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
