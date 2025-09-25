import type { Timestamp} from 'firebase-admin/firestore';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type { WaitlistDoc, EmailEventDoc, DeadLetterQueueDoc, WaitlistStatus } from '../types/models';
import { generateDedupeKey, normalizeEmail } from './crypto';

// Lazy initialization of Firestore
let db: FirebaseFirestore.Firestore;
function getDb() {
  if (!db) {
    db = getFirestore();
  }
  return db;
}

/**
 * Get waitlist document by email
 */
export async function getWaitlistByEmail(email: string): Promise<WaitlistDoc | null> {
  try {
    const normalizedEmail = normalizeEmail(email);
    const dedupeKey = generateDedupeKey(normalizedEmail);
    
    const snapshot = await getDb()
      .collection('waitlist')
      .where('dedupeKey', '==', dedupeKey)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as WaitlistDoc;
  } catch (error) {
    console.error('Error getting waitlist by email:', error);
    throw error;
  }
}

/**
 * Get waitlist document by ID
 */
export async function getWaitlistById(waitlistId: string): Promise<WaitlistDoc | null> {
  try {
    const doc = await getDb().collection('waitlist').doc(waitlistId).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return { id: doc.id, ...doc.data() } as WaitlistDoc;
  } catch (error) {
    console.error('Error getting waitlist by ID:', error);
    throw error;
  }
}

/**
 * Update waitlist confirmation communication status
 */
export async function updateWaitlistConfirmation(
  waitlistId: string,
  sent: boolean,
  messageId: string | null = null,
  error: { code: string; msg: string } | null = null
): Promise<void> {
  try {
    const updateData: any = {
      'comms.confirmation.sent': sent,
      'comms.confirmation.sentAt': sent ? FieldValue.serverTimestamp() : null,
      'comms.confirmation.messageId': messageId,
      'comms.confirmation.error': error
    };

    await getDb().collection('waitlist').doc(waitlistId).update(updateData);
    
    console.log('Updated waitlist confirmation status:', {
      waitlistId,
      sent,
      messageId,
      error
    });
  } catch (error) {
    console.error('Error updating waitlist confirmation:', error);
    throw error;
  }
}

/**
 * Mark waitlist user as blocked
 */
export async function markWaitlistBlocked(email: string): Promise<void> {
  try {
    const waitlistDoc = await getWaitlistByEmail(email);
    
    if (!waitlistDoc) {
      console.warn('Waitlist document not found for email:', email);
      return;
    }
    
    await getDb().collection('waitlist').doc(waitlistDoc.id).update({
      status: 'blocked' as WaitlistStatus
    });
    
    console.log('Marked waitlist user as blocked:', { email, waitlistId: waitlistDoc.id });
  } catch (error) {
    console.error('Error marking waitlist as blocked:', error);
    throw error;
  }
}

/**
 * Save email event to Firestore
 */
export async function saveEmailEvent(event: Omit<EmailEventDoc, 'id'>): Promise<string> {
  try {
    const docRef = await getDb().collection('email_events').add({
      ...event,
      ts: FieldValue.serverTimestamp()
    });
    
    console.log('Saved email event:', { eventId: docRef.id, type: event.type });
    return docRef.id;
  } catch (error) {
    console.error('Error saving email event:', error);
    throw error;
  }
}

/**
 * Save to dead letter queue
 */
export async function saveToDeadLetterQueue(
  waitlistId: string,
  email: string,
  error: { code: string; msg: string }
): Promise<void> {
  try {
    const dlqDoc: Omit<DeadLetterQueueDoc, 'id'> = {
      waitlistId,
      email,
      error,
      lastAttempt: FieldValue.serverTimestamp() as Timestamp,
      attempts: 1,
      maxAttempts: 3
    };
    
    await getDb().collection('email_dlq').doc(waitlistId).set(dlqDoc);
    
    console.log('Saved to dead letter queue:', { waitlistId, email, error });
  } catch (error) {
    console.error('Error saving to dead letter queue:', error);
    throw error;
  }
}

/**
 * Update dead letter queue attempt count
 */
export async function updateDeadLetterQueueAttempts(
  waitlistId: string,
  error: { code: string; msg: string }
): Promise<void> {
  try {
    const docRef = getDb().collection('email_dlq').doc(waitlistId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      console.warn('Dead letter queue document not found:', waitlistId);
      return;
    }
    
    const currentData = doc.data() as DeadLetterQueueDoc;
    const newAttempts = currentData.attempts + 1;
    
    await docRef.update({
      attempts: newAttempts,
      lastAttempt: FieldValue.serverTimestamp(),
      error
    });
    
    console.log('Updated dead letter queue attempts:', { waitlistId, attempts: newAttempts });
  } catch (error) {
    console.error('Error updating dead letter queue attempts:', error);
    throw error;
  }
}

/**
 * Get dead letter queue documents
 */
export async function getDeadLetterQueueDocuments(): Promise<DeadLetterQueueDoc[]> {
  try {
    const snapshot = await getDb().collection('email_dlq').get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DeadLetterQueueDoc));
  } catch (error) {
    console.error('Error getting dead letter queue documents:', error);
    throw error;
  }
}

/**
 * Delete dead letter queue document
 */
export async function deleteDeadLetterQueueDocument(waitlistId: string): Promise<void> {
  try {
    await getDb().collection('email_dlq').doc(waitlistId).delete();
    console.log('Deleted dead letter queue document:', waitlistId);
  } catch (error) {
    console.error('Error deleting dead letter queue document:', error);
    throw error;
  }
}

/**
 * Check if email was sent recently (within 24 hours)
 */
export async function wasEmailSentRecently(waitlistId: string): Promise<boolean> {
  try {
    const doc = await getDb().collection('waitlist').doc(waitlistId).get();
    
    if (!doc.exists) {
      return false;
    }
    
    const data = doc.data() as WaitlistDoc;
    const confirmation = data.comms?.confirmation;
    
    if (!confirmation?.sent || !confirmation.sentAt) {
      return false;
    }
    
    const sentAt = confirmation.sentAt.toDate();
    const now = new Date();
    const hoursDiff = (now.getTime() - sentAt.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff < 24;
  } catch (error) {
    console.error('Error checking if email was sent recently:', error);
    return false;
  }
}
