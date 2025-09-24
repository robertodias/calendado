/**
 * Generate SHA256 hash for email deduplication
 */
export declare function sha256(input: string): string;
/**
 * Generate dedupe key for email addresses
 */
export declare function generateDedupeKey(email: string): string;
/**
 * Verify Resend webhook signature using constant-time comparison
 */
export declare function verifyResendSignature(payload: string, signature: string, secret: string): boolean;
/**
 * Extract signature from Authorization header
 * Expected format: "Bearer <signature>"
 */
export declare function extractSignature(authHeader: string): string | null;
/**
 * Validate email format
 */
export declare function isValidEmail(email: string): boolean;
/**
 * Normalize email address
 */
export declare function normalizeEmail(email: string): string;
//# sourceMappingURL=crypto.d.ts.map