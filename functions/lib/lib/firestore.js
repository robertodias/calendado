"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWaitlistByEmail = getWaitlistByEmail;
exports.getWaitlistById = getWaitlistById;
exports.updateWaitlistConfirmation = updateWaitlistConfirmation;
exports.markWaitlistBlocked = markWaitlistBlocked;
exports.saveEmailEvent = saveEmailEvent;
exports.saveToDeadLetterQueue = saveToDeadLetterQueue;
exports.updateDeadLetterQueueAttempts = updateDeadLetterQueueAttempts;
exports.getDeadLetterQueueDocuments = getDeadLetterQueueDocuments;
exports.deleteDeadLetterQueueDocument = deleteDeadLetterQueueDocument;
exports.wasEmailSentRecently = wasEmailSentRecently;
const firestore_1 = require("firebase-admin/firestore");
const crypto_1 = require("./crypto");
// Lazy initialization of Firestore
let db;
function getDb() {
    if (!db) {
        db = (0, firestore_1.getFirestore)();
    }
    return db;
}
/**
 * Get waitlist document by email
 */
async function getWaitlistByEmail(email) {
    try {
        const normalizedEmail = (0, crypto_1.normalizeEmail)(email);
        const dedupeKey = (0, crypto_1.generateDedupeKey)(normalizedEmail);
        const snapshot = await getDb()
            .collection('waitlist')
            .where('dedupeKey', '==', dedupeKey)
            .limit(1)
            .get();
        if (snapshot.empty) {
            return null;
        }
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }
    catch (error) {
        console.error('Error getting waitlist by email:', error);
        throw error;
    }
}
/**
 * Get waitlist document by ID
 */
async function getWaitlistById(waitlistId) {
    try {
        const doc = await getDb().collection('waitlist').doc(waitlistId).get();
        if (!doc.exists) {
            return null;
        }
        return { id: doc.id, ...doc.data() };
    }
    catch (error) {
        console.error('Error getting waitlist by ID:', error);
        throw error;
    }
}
/**
 * Update waitlist confirmation communication status
 */
async function updateWaitlistConfirmation(waitlistId, sent, messageId = null, error = null) {
    try {
        const updateData = {
            'comms.confirmation.sent': sent,
            'comms.confirmation.sentAt': sent ? firestore_1.FieldValue.serverTimestamp() : null,
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
    }
    catch (error) {
        console.error('Error updating waitlist confirmation:', error);
        throw error;
    }
}
/**
 * Mark waitlist user as blocked
 */
async function markWaitlistBlocked(email) {
    try {
        const waitlistDoc = await getWaitlistByEmail(email);
        if (!waitlistDoc) {
            console.warn('Waitlist document not found for email:', email);
            return;
        }
        await getDb().collection('waitlist').doc(waitlistDoc.id).update({
            status: 'blocked'
        });
        console.log('Marked waitlist user as blocked:', { email, waitlistId: waitlistDoc.id });
    }
    catch (error) {
        console.error('Error marking waitlist as blocked:', error);
        throw error;
    }
}
/**
 * Save email event to Firestore
 */
async function saveEmailEvent(event) {
    try {
        const docRef = await getDb().collection('email_events').add({
            ...event,
            ts: firestore_1.FieldValue.serverTimestamp()
        });
        console.log('Saved email event:', { eventId: docRef.id, type: event.type });
        return docRef.id;
    }
    catch (error) {
        console.error('Error saving email event:', error);
        throw error;
    }
}
/**
 * Save to dead letter queue
 */
async function saveToDeadLetterQueue(waitlistId, email, error) {
    try {
        const dlqDoc = {
            waitlistId,
            email,
            error,
            lastAttempt: firestore_1.FieldValue.serverTimestamp(),
            attempts: 1,
            maxAttempts: 3
        };
        await getDb().collection('email_dlq').doc(waitlistId).set(dlqDoc);
        console.log('Saved to dead letter queue:', { waitlistId, email, error });
    }
    catch (error) {
        console.error('Error saving to dead letter queue:', error);
        throw error;
    }
}
/**
 * Update dead letter queue attempt count
 */
async function updateDeadLetterQueueAttempts(waitlistId, error) {
    try {
        const docRef = getDb().collection('email_dlq').doc(waitlistId);
        const doc = await docRef.get();
        if (!doc.exists) {
            console.warn('Dead letter queue document not found:', waitlistId);
            return;
        }
        const currentData = doc.data();
        const newAttempts = currentData.attempts + 1;
        await docRef.update({
            attempts: newAttempts,
            lastAttempt: firestore_1.FieldValue.serverTimestamp(),
            error
        });
        console.log('Updated dead letter queue attempts:', { waitlistId, attempts: newAttempts });
    }
    catch (error) {
        console.error('Error updating dead letter queue attempts:', error);
        throw error;
    }
}
/**
 * Get dead letter queue documents
 */
async function getDeadLetterQueueDocuments() {
    try {
        const snapshot = await getDb().collection('email_dlq').get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
    catch (error) {
        console.error('Error getting dead letter queue documents:', error);
        throw error;
    }
}
/**
 * Delete dead letter queue document
 */
async function deleteDeadLetterQueueDocument(waitlistId) {
    try {
        await getDb().collection('email_dlq').doc(waitlistId).delete();
        console.log('Deleted dead letter queue document:', waitlistId);
    }
    catch (error) {
        console.error('Error deleting dead letter queue document:', error);
        throw error;
    }
}
/**
 * Check if email was sent recently (within 24 hours)
 */
async function wasEmailSentRecently(waitlistId) {
    var _a;
    try {
        const doc = await getDb().collection('waitlist').doc(waitlistId).get();
        if (!doc.exists) {
            return false;
        }
        const data = doc.data();
        const confirmation = (_a = data.comms) === null || _a === void 0 ? void 0 : _a.confirmation;
        if (!(confirmation === null || confirmation === void 0 ? void 0 : confirmation.sent) || !confirmation.sentAt) {
            return false;
        }
        const sentAt = confirmation.sentAt.toDate();
        const now = new Date();
        const hoursDiff = (now.getTime() - sentAt.getTime()) / (1000 * 60 * 60);
        return hoursDiff < 24;
    }
    catch (error) {
        console.error('Error checking if email was sent recently:', error);
        return false;
    }
}
//# sourceMappingURL=firestore.js.map