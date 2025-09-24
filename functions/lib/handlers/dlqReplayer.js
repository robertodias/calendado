"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dlqReplayer = void 0;
const https_1 = require("firebase-functions/v2/https");
const auth_1 = require("firebase-admin/auth");
const resend_1 = require("../lib/resend");
const email_1 = require("../lib/email");
const firestore_1 = require("../lib/firestore");
const crypto_1 = require("../lib/crypto");
exports.dlqReplayer = (0, https_1.onRequest)(async (req, res) => {
    console.log('DLQ replayer request:', {
        method: req.method,
        body: req.body
    });
    try {
        // Only accept POST requests
        if (req.method !== 'POST') {
            res.status(405).json({ error: 'Method not allowed' });
            return;
        }
        // Verify admin authentication
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader || !String(authHeader).startsWith('Bearer ')) {
            res.status(401).json({ error: 'Missing or invalid authorization header' });
            return;
        }
        const token = String(authHeader).substring(7);
        const decodedToken = await (0, auth_1.getAuth)().verifyIdToken(token);
        // Check if user has admin role (custom claim)
        if (!decodedToken.admin) {
            res.status(403).json({ error: 'Admin access required' });
            return;
        }
        // Get dead letter queue documents
        const dlqDocs = await (0, firestore_1.getDeadLetterQueueDocuments)();
        if (dlqDocs.length === 0) {
            res.status(200).json({
                success: true,
                message: 'No items in dead letter queue',
                processed: 0
            });
            return;
        }
        console.log(`Processing ${dlqDocs.length} items from dead letter queue`);
        const results = {
            processed: 0,
            successful: 0,
            failed: 0,
            errors: []
        };
        // Process each DLQ item
        for (const dlqDoc of dlqDocs) {
            try {
                await processDLQItem(dlqDoc);
                results.successful++;
                results.processed++;
            }
            catch (error) {
                results.failed++;
                results.processed++;
                const errorMsg = `Failed to process DLQ item ${dlqDoc.waitlistId}: ${error instanceof Error ? error.message : String(error)}`;
                results.errors.push(errorMsg);
                console.error(errorMsg);
            }
        }
        console.log('DLQ replayer completed:', results);
        res.status(200).json({
            success: true,
            ...results
        });
    }
    catch (error) {
        console.error('Error in DLQ replayer:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : String(error)
        });
    }
});
/**
 * Process a single DLQ item
 */
async function processDLQItem(dlqDoc) {
    const { waitlistId, attempts, maxAttempts } = dlqDoc;
    // Check if we've exceeded max attempts
    if (attempts >= maxAttempts) {
        console.warn(`Max attempts exceeded for DLQ item: ${waitlistId}`);
        await (0, firestore_1.deleteDeadLetterQueueDocument)(waitlistId);
        return;
    }
    // Get waitlist document
    const waitlistDoc = await (0, firestore_1.getWaitlistById)(waitlistId);
    if (!waitlistDoc) {
        console.warn(`Waitlist document not found for DLQ item: ${waitlistId}`);
        await (0, firestore_1.deleteDeadLetterQueueDocument)(waitlistId);
        return;
    }
    // Validate email
    const normalizedEmail = (0, crypto_1.normalizeEmail)(waitlistDoc.email);
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
        console.warn(`Invalid email for DLQ item: ${waitlistId}`);
        await (0, firestore_1.deleteDeadLetterQueueDocument)(waitlistId);
        return;
    }
    // Generate dedupe key
    const dedupeKey = (0, crypto_1.generateDedupeKey)(normalizedEmail);
    // Build email template
    const emailTemplate = (0, email_1.buildWaitlistConfirmationEmail)(normalizedEmail, waitlistDoc.name, waitlistDoc.locale, process.env.APP_BASE_URL || 'https://calendado.com');
    // Create Resend client
    const resendClient = (0, resend_1.createResendClient)(process.env.RESEND_API_KEY, process.env.FROM_EMAIL, process.env.FROM_NAME);
    try {
        // Send email
        const result = await resendClient.sendWaitlistConfirmation(normalizedEmail, emailTemplate.subject, emailTemplate.html, dedupeKey, waitlistDoc.locale || 'en-US');
        if (result.error) {
            throw new Error(`Resend API error: ${JSON.stringify(result.error)}`);
        }
        // Update waitlist document with success
        await (0, firestore_1.updateWaitlistConfirmation)(waitlistId, true, result.id, null);
        // Remove from DLQ
        await (0, firestore_1.deleteDeadLetterQueueDocument)(waitlistId);
        console.log('Successfully processed DLQ item:', {
            waitlistId,
            email: normalizedEmail,
            messageId: result.id
        });
    }
    catch (error) {
        // Update attempt count
        await (0, firestore_1.updateDeadLetterQueueAttempts)(waitlistId, {
            code: 'RETRY_FAILED',
            msg: error instanceof Error ? error.message : String(error)
        });
        throw error;
    }
}
//# sourceMappingURL=dlqReplayer.js.map