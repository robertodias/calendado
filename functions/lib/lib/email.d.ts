import type { Locale, EmailTemplate } from '../types/models';
/**
 * Build email template for waitlist confirmation
 */
export declare function buildWaitlistConfirmationEmail(email: string, name: string | null, locale: Locale | null, appBaseUrl: string): EmailTemplate;
/**
 * Validate email template data
 */
export declare function validateEmailTemplateData(email: string, name: string | null, locale: Locale | null): {
    isValid: boolean;
    errors: string[];
};
//# sourceMappingURL=email.d.ts.map