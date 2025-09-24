/**
 * Input validation and sanitization utilities
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    sanitizedValue?: any;
}
/**
 * Validate and sanitize email address
 */
export declare function validateEmail(email: unknown): ValidationResult;
/**
 * Validate and sanitize name
 */
export declare function validateName(name: unknown): ValidationResult;
/**
 * Validate and sanitize locale
 */
export declare function validateLocale(locale: unknown): ValidationResult;
/**
 * Validate and sanitize UTM data
 */
export declare function validateUtmData(utm: unknown): ValidationResult;
/**
 * Validate waitlist signup data
 */
export declare function validateWaitlistData(data: unknown): ValidationResult;
//# sourceMappingURL=validation.d.ts.map