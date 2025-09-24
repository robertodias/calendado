"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendClient = void 0;
exports.createResendClient = createResendClient;
const resend_1 = require("resend");
class ResendClient {
    constructor(apiKey, fromEmail, fromName) {
        this.client = new resend_1.Resend(apiKey);
        this.fromEmail = fromEmail.trim();
        this.fromName = fromName.trim();
    }
    /**
     * Send email via Resend
     */
    async sendEmail(payload) {
        var _a;
        try {
            const result = await this.client.emails.send({
                from: `${this.fromName} <${this.fromEmail}>`,
                to: payload.to,
                subject: payload.subject,
                html: payload.html,
                headers: payload.headers,
                tags: payload.tags
            });
            if (result.error) {
                console.error('Resend API error:', result.error);
                return { id: '', error: result.error };
            }
            return { id: ((_a = result.data) === null || _a === void 0 ? void 0 : _a.id) || '', error: null };
        }
        catch (error) {
            console.error('Resend client error:', error);
            return { id: '', error };
        }
    }
    /**
     * Send waitlist confirmation email
     */
    async sendWaitlistConfirmation(email, subject, html, dedupeKey, locale) {
        const payload = {
            from: `${this.fromName} <${this.fromEmail}>`,
            to: [email],
            subject,
            html,
            headers: {
                'X-Dedupe-Key': dedupeKey,
                'X-Locale': locale
            },
            tags: [
                { name: 'type', value: 'waitlist-confirmation' },
                { name: 'locale', value: locale }
            ]
        };
        return this.sendEmail(payload);
    }
    /**
     * Parse Resend webhook payload
     */
    parseWebhookPayload(payload) {
        try {
            if (!payload || typeof payload !== 'object') {
                return null;
            }
            const { type, created_at, data } = payload;
            if (!type || !created_at || !data) {
                return null;
            }
            // Validate event type
            const validTypes = ['delivered', 'bounced', 'opened', 'clicked', 'complained', 'dropped'];
            if (!validTypes.includes(type)) {
                console.warn('Invalid event type:', type);
                return null;
            }
            return {
                type,
                created_at,
                data: {
                    id: data.id || '',
                    from: data.from || '',
                    to: Array.isArray(data.to) ? data.to : [],
                    subject: data.subject || '',
                    html: data.html || '',
                    text: data.text || '',
                    created_at: data.created_at || created_at,
                    last_event: data.last_event || type
                }
            };
        }
        catch (error) {
            console.error('Error parsing webhook payload:', error);
            return null;
        }
    }
    /**
     * Map Resend event type to our internal type
     */
    mapEventType(resendType) {
        const typeMap = {
            'email.delivered': 'delivered',
            'email.bounced': 'bounced',
            'email.opened': 'opened',
            'email.clicked': 'clicked',
            'email.complained': 'complained',
            'email.dropped': 'dropped'
        };
        return typeMap[resendType] || null;
    }
    /**
     * Validate webhook signature (placeholder - implement based on Resend docs)
     */
    async validateWebhookSignature(payload, signature, secret) {
        // This is a placeholder - implement actual signature validation
        // based on Resend's webhook signature verification method
        try {
            const crypto = await Promise.resolve().then(() => __importStar(require('crypto')));
            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(payload)
                .digest('hex');
            return signature === expectedSignature;
        }
        catch (error) {
            console.error('Error validating webhook signature:', error);
            return false;
        }
    }
}
exports.ResendClient = ResendClient;
/**
 * Create Resend client instance
 */
function createResendClient(apiKey, fromEmail, fromName) {
    return new ResendClient(apiKey, fromEmail, fromName);
}
//# sourceMappingURL=resend.js.map