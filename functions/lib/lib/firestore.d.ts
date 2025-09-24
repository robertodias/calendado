import { WaitlistDoc, EmailEventDoc, DeadLetterQueueDoc } from '../types/models';
/**
 * Get waitlist document by email
 */
export declare function getWaitlistByEmail(email: string): Promise<WaitlistDoc | null>;
/**
 * Get waitlist document by ID
 */
export declare function getWaitlistById(waitlistId: string): Promise<WaitlistDoc | null>;
/**
 * Update waitlist confirmation communication status
 */
export declare function updateWaitlistConfirmation(waitlistId: string, sent: boolean, messageId?: string | null, error?: {
    code: string;
    msg: string;
} | null): Promise<void>;
/**
 * Mark waitlist user as blocked
 */
export declare function markWaitlistBlocked(email: string): Promise<void>;
/**
 * Save email event to Firestore
 */
export declare function saveEmailEvent(event: Omit<EmailEventDoc, 'id'>): Promise<string>;
/**
 * Save to dead letter queue
 */
export declare function saveToDeadLetterQueue(waitlistId: string, email: string, error: {
    code: string;
    msg: string;
}): Promise<void>;
/**
 * Update dead letter queue attempt count
 */
export declare function updateDeadLetterQueueAttempts(waitlistId: string, error: {
    code: string;
    msg: string;
}): Promise<void>;
/**
 * Get dead letter queue documents
 */
export declare function getDeadLetterQueueDocuments(): Promise<DeadLetterQueueDoc[]>;
/**
 * Delete dead letter queue document
 */
export declare function deleteDeadLetterQueueDocument(waitlistId: string): Promise<void>;
/**
 * Check if email was sent recently (within 24 hours)
 */
export declare function wasEmailSentRecently(waitlistId: string): Promise<boolean>;
//# sourceMappingURL=firestore.d.ts.map