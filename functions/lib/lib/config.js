"use strict";
/**
 * Security and configuration constants
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_MESSAGES = exports.VALIDATION_RULES = exports.SECURITY_CONFIG = void 0;
exports.SECURITY_CONFIG = {
    // Rate limiting
    RATE_LIMIT: {
        WINDOW_MS: 60000, // 1 minute
        MAX_REQUESTS: 10, // 10 requests per minute
        WEBHOOK_WINDOW_MS: 60000, // 1 minute
        WEBHOOK_MAX_REQUESTS: 100, // 100 webhook requests per minute
    },
    // Request validation
    MAX_REQUEST_SIZE: 10240, // 10KB
    MAX_EMAIL_LENGTH: 254,
    MAX_NAME_LENGTH: 100,
    MAX_UTM_FIELD_LENGTH: 50,
    // Security headers
    SECURITY_HEADERS: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Content-Security-Policy': "default-src 'none'",
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    },
    // Email validation
    EMAIL_REGEX: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    // Allowed locales
    ALLOWED_LOCALES: ['en-US', 'pt-BR', 'it-IT'],
    // Retry configuration
    RETRY_CONFIG: {
        MAX_ATTEMPTS: 3,
        INITIAL_DELAY_MS: 1000,
        MAX_DELAY_MS: 10000,
        BACKOFF_MULTIPLIER: 2,
    },
    // Webhook configuration
    WEBHOOK_CONFIG: {
        MAX_PAYLOAD_SIZE: 10000, // 10KB
        TIMEOUT_MS: 30000, // 30 seconds
        SIGNATURE_ALGORITHM: 'sha256',
    },
    // Logging configuration
    LOGGING: {
        SENSITIVE_FIELDS: ['password', 'token', 'secret', 'key', 'authorization', 'apiKey'],
        MAX_LOG_SIZE: 1000, // 1KB per log entry
    },
};
exports.VALIDATION_RULES = {
    EMAIL: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 254,
        PATTERN: exports.SECURITY_CONFIG.EMAIL_REGEX,
    },
    NAME: {
        MIN_LENGTH: 0,
        MAX_LENGTH: 100,
        FORBIDDEN_CHARS: ['<', '>', '&'],
    },
    UTM: {
        MAX_FIELD_LENGTH: 50,
        ALLOWED_FIELDS: ['source', 'medium', 'campaign'],
        FORBIDDEN_CHARS: ['<', '>', '&'],
    },
    DEDUPE_KEY: {
        LENGTH: 64, // SHA256 hex length
        PATTERN: /^[a-f0-9]{64}$/,
    },
};
exports.ERROR_MESSAGES = {
    VALIDATION: {
        INVALID_EMAIL: 'Invalid email format',
        EMAIL_TOO_LONG: 'Email is too long',
        NAME_TOO_LONG: 'Name is too long',
        INVALID_NAME: 'Name contains invalid characters',
        INVALID_LOCALE: 'Invalid locale',
        INVALID_UTM: 'Invalid UTM data',
        MISSING_REQUIRED_FIELD: 'Missing required field',
    },
    SECURITY: {
        RATE_LIMITED: 'Rate limit exceeded',
        REQUEST_TOO_LARGE: 'Request too large',
        SUSPICIOUS_REQUEST: 'Suspicious request detected',
        INVALID_SIGNATURE: 'Invalid webhook signature',
        UNAUTHORIZED: 'Unauthorized',
        FORBIDDEN: 'Forbidden',
    },
    SYSTEM: {
        INTERNAL_ERROR: 'Internal server error',
        SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
        TIMEOUT: 'Request timeout',
    },
};
//# sourceMappingURL=config.js.map