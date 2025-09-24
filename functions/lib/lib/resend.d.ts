import { ResendEmailPayload, ResendWebhookPayload, EmailEventType } from '../types/models';
export declare class ResendClient {
    private client;
    private fromEmail;
    private fromName;
    constructor(apiKey: string, fromEmail: string, fromName: string);
    /**
     * Send email via Resend
     */
    sendEmail(payload: ResendEmailPayload): Promise<{
        id: string;
        error?: any;
    }>;
    /**
     * Send waitlist confirmation email
     */
    sendWaitlistConfirmation(email: string, subject: string, html: string, dedupeKey: string, locale: string): Promise<{
        id: string;
        error?: any;
    }>;
    /**
     * Parse Resend webhook payload
     */
    parseWebhookPayload(payload: any): ResendWebhookPayload | null;
    /**
     * Map Resend event type to our internal type
     */
    mapEventType(resendType: string): EmailEventType | null;
    /**
     * Validate webhook signature (placeholder - implement based on Resend docs)
     */
    validateWebhookSignature(payload: string, signature: string, secret: string): Promise<boolean>;
}
/**
 * Create Resend client instance
 */
export declare function createResendClient(apiKey: string, fromEmail: string, fromName: string): ResendClient;
//# sourceMappingURL=resend.d.ts.map