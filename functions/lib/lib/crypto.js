"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256 = sha256;
exports.generateDedupeKey = generateDedupeKey;
exports.verifyResendSignature = verifyResendSignature;
exports.extractSignature = extractSignature;
exports.isValidEmail = isValidEmail;
exports.normalizeEmail = normalizeEmail;
const crypto_1 = require("crypto");
/**
 * Generate SHA256 hash for email deduplication
 */
function sha256(input) {
    return (0, crypto_1.createHash)('sha256').update(input).digest('hex');
}
/**
 * Generate dedupe key for email addresses
 */
function generateDedupeKey(email) {
    const normalized = email.trim().toLowerCase();
    return sha256(normalized);
}
/**
 * Verify Svix webhook signature (used by Resend)
 * Svix signature format: v1,<signature>
 */
function verifyResendSignature(payload, signature, secret) {
    try {
        // Svix signature format: v1,<signature>
        if (!signature.startsWith('v1,')) {
            console.warn('Invalid signature format, expected v1,<signature>');
            return false;
        }
        const actualSignature = signature.substring(3);
        // Svix uses HMAC-SHA256 with the secret as the key
        const expectedSignature = (0, crypto_1.createHmac)('sha256', secret)
            .update(payload)
            .digest('hex');
        // Use constant-time comparison to prevent timing attacks
        return timingSafeEqual(Buffer.from(actualSignature, 'hex'), Buffer.from(expectedSignature, 'hex'));
    }
    catch (error) {
        console.error('Error verifying Resend signature:', error);
        return false;
    }
}
/**
 * Constant-time string comparison to prevent timing attacks
 */
function timingSafeEqual(a, b) {
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
function extractSignature(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}
/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email.trim());
}
/**
 * Normalize email address
 */
function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
//# sourceMappingURL=crypto.js.map