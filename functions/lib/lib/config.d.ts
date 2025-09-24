/**
 * Security and configuration constants
 */
export declare const SECURITY_CONFIG: {
    readonly RATE_LIMIT: {
        readonly WINDOW_MS: 60000;
        readonly MAX_REQUESTS: 10;
        readonly WEBHOOK_WINDOW_MS: 60000;
        readonly WEBHOOK_MAX_REQUESTS: 100;
    };
    readonly MAX_REQUEST_SIZE: 10240;
    readonly MAX_EMAIL_LENGTH: 254;
    readonly MAX_NAME_LENGTH: 100;
    readonly MAX_UTM_FIELD_LENGTH: 50;
    readonly SECURITY_HEADERS: {
        readonly 'X-Content-Type-Options': "nosniff";
        readonly 'X-Frame-Options': "DENY";
        readonly 'X-XSS-Protection': "1; mode=block";
        readonly 'Referrer-Policy': "strict-origin-when-cross-origin";
        readonly 'Content-Security-Policy': "default-src 'none'";
        readonly 'Strict-Transport-Security': "max-age=31536000; includeSubDomains";
    };
    readonly EMAIL_REGEX: RegExp;
    readonly ALLOWED_LOCALES: readonly ["en-US", "pt-BR", "it-IT"];
    readonly RETRY_CONFIG: {
        readonly MAX_ATTEMPTS: 3;
        readonly INITIAL_DELAY_MS: 1000;
        readonly MAX_DELAY_MS: 10000;
        readonly BACKOFF_MULTIPLIER: 2;
    };
    readonly WEBHOOK_CONFIG: {
        readonly MAX_PAYLOAD_SIZE: 10000;
        readonly TIMEOUT_MS: 30000;
        readonly SIGNATURE_ALGORITHM: "sha256";
    };
    readonly LOGGING: {
        readonly SENSITIVE_FIELDS: readonly ["password", "token", "secret", "key", "authorization", "apiKey"];
        readonly MAX_LOG_SIZE: 1000;
    };
};
export declare const VALIDATION_RULES: {
    readonly EMAIL: {
        readonly MIN_LENGTH: 1;
        readonly MAX_LENGTH: 254;
        readonly PATTERN: RegExp;
    };
    readonly NAME: {
        readonly MIN_LENGTH: 0;
        readonly MAX_LENGTH: 100;
        readonly FORBIDDEN_CHARS: readonly ["<", ">", "&"];
    };
    readonly UTM: {
        readonly MAX_FIELD_LENGTH: 50;
        readonly ALLOWED_FIELDS: readonly ["source", "medium", "campaign"];
        readonly FORBIDDEN_CHARS: readonly ["<", ">", "&"];
    };
    readonly DEDUPE_KEY: {
        readonly LENGTH: 64;
        readonly PATTERN: RegExp;
    };
};
export declare const ERROR_MESSAGES: {
    readonly VALIDATION: {
        readonly INVALID_EMAIL: "Invalid email format";
        readonly EMAIL_TOO_LONG: "Email is too long";
        readonly NAME_TOO_LONG: "Name is too long";
        readonly INVALID_NAME: "Name contains invalid characters";
        readonly INVALID_LOCALE: "Invalid locale";
        readonly INVALID_UTM: "Invalid UTM data";
        readonly MISSING_REQUIRED_FIELD: "Missing required field";
    };
    readonly SECURITY: {
        readonly RATE_LIMITED: "Rate limit exceeded";
        readonly REQUEST_TOO_LARGE: "Request too large";
        readonly SUSPICIOUS_REQUEST: "Suspicious request detected";
        readonly INVALID_SIGNATURE: "Invalid webhook signature";
        readonly UNAUTHORIZED: "Unauthorized";
        readonly FORBIDDEN: "Forbidden";
    };
    readonly SYSTEM: {
        readonly INTERNAL_ERROR: "Internal server error";
        readonly SERVICE_UNAVAILABLE: "Service temporarily unavailable";
        readonly TIMEOUT: "Request timeout";
    };
};
//# sourceMappingURL=config.d.ts.map