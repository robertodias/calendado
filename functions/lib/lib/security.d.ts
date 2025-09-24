/**
 * Security utilities for Firebase Functions
 */
import { Request, Response } from 'firebase-functions/v1';
/**
 * Rate limiting configuration
 */
interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
}
/**
 * Check if request is within rate limit
 */
export declare function checkRateLimit(identifier: string, config?: RateLimitConfig): boolean;
/**
 * Get client IP address from request
 */
export declare function getClientIP(req: Request): string;
/**
 * Set security headers
 */
export declare function setSecurityHeaders(res: Response): void;
/**
 * Sanitize log data to prevent information disclosure
 */
export declare function sanitizeLogData(data: any): any;
/**
 * Validate request size
 */
export declare function validateRequestSize(req: Request, maxSizeBytes?: number): boolean;
/**
 * Check if request is from a suspicious source
 */
export declare function isSuspiciousRequest(req: Request): boolean;
/**
 * Create a secure error response
 */
export declare function createErrorResponse(res: Response, statusCode: number, message: string, includeDetails?: boolean): void;
/**
 * Validate webhook payload size and structure
 */
export declare function validateWebhookPayload(payload: any): boolean;
export {};
//# sourceMappingURL=security.d.ts.map