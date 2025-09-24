import { Timestamp } from 'firebase-admin/firestore';
export type Locale = 'en-US' | 'pt-BR' | 'it-IT';
export type WaitlistStatus = 'pending' | 'confirmed' | 'invited' | 'blocked';
export type EmailEventType = 'delivered' | 'bounced' | 'opened' | 'clicked' | 'complained' | 'dropped';
export interface UtmData {
    source?: string;
    medium?: string;
    campaign?: string;
}
export interface ConfirmationComms {
    sent: boolean;
    sentAt: Timestamp | null;
    messageId: string | null;
    error: {
        code: string;
        msg: string;
    } | null;
}
export interface WaitlistDoc {
    id: string;
    email: string;
    name: string | null;
    locale: Locale | null;
    utm: UtmData | null;
    userAgent: string | null;
    ip: string | null;
    createdAt: Timestamp;
    status: WaitlistStatus;
    comms: {
        confirmation: ConfirmationComms;
    };
    dedupeKey: string;
}
export interface EmailEventDoc {
    messageId: string;
    type: EmailEventType;
    email: string;
    ts: Timestamp;
    meta: Record<string, unknown>;
}
export interface DeadLetterQueueDoc {
    id: string;
    waitlistId: string;
    email: string;
    error: {
        code: string;
        msg: string;
    };
    lastAttempt: Timestamp;
    attempts: number;
    maxAttempts: number;
}
export interface AdminResendRequest {
    waitlistId?: string;
    email?: string;
    force?: boolean;
}
export interface ResendEmailPayload {
    from: string;
    to: string[];
    subject: string;
    html: string;
    headers?: Record<string, string>;
    tags?: Array<{
        name: string;
        value: string;
    }>;
}
export interface ResendWebhookPayload {
    type: EmailEventType;
    created_at: string;
    data: {
        id: string;
        from: string;
        to: string[];
        subject: string;
        html: string;
        text: string;
        created_at: string;
        last_event: string;
    };
}
export interface EmailTemplate {
    subject: string;
    html: string;
}
export interface LocalizedStrings {
    subject: string;
    greeting: string;
    body: string;
    expectations: {
        title: string;
        items: string[];
    };
    closing: string;
    footer: {
        why: string;
        privacy: string;
    };
}
//# sourceMappingURL=models.d.ts.map