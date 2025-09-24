/**
 * Client-side crypto utilities
 * Handles email normalization and dedupe key generation
 */

/**
 * Generate SHA256 hash for email deduplication using Web Crypto API
 */
export async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Synchronous SHA256 fallback for environments without Web Crypto API
 */
export function sha256Sync(input: string): string {
  // Simple hash function for client-side use
  // This is a fallback and should not be used for security-critical operations
  let hash = 0;
  if (input.length === 0) return hash.toString(16);
  
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16);
}

/**
 * Generate dedupe key for email addresses (async version)
 */
export async function generateDedupeKey(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  return await sha256(normalized);
}

/**
 * Generate dedupe key for email addresses (sync fallback)
 */
export function generateDedupeKeySync(email: string): string {
  const normalized = email.trim().toLowerCase();
  return sha256Sync(normalized);
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
