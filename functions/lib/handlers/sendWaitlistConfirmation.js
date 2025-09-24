"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWaitlistConfirmationFn = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const resend_1 = require("../lib/resend");
const email_1 = require("../lib/email");
const firestore_2 = require("../lib/firestore");
const crypto_1 = require("../lib/crypto");
exports.sendWaitlistConfirmationFn = (0, firestore_1.onDocumentCreated)({
    document: 'waitlist/{waitlistId}',
    region: 'us-central1'
}, async (event) => {
    var _a, _b, _c;
    const waitlistId = event.params.waitlistId;
    const waitlistData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    console.log('Processing waitlist confirmation:', {
        waitlistId,
        email: waitlistData === null || waitlistData === void 0 ? void 0 : waitlistData.email,
        locale: waitlistData === null || waitlistData === void 0 ? void 0 : waitlistData.locale
    });
    try {
        // Validate waitlist data
        if (!waitlistData) {
            throw new Error('Waitlist data not found');
        }
        // Check if confirmation was already sent (idempotency)
        if ((_c = (_b = waitlistData.comms) === null || _b === void 0 ? void 0 : _b.confirmation) === null || _c === void 0 ? void 0 : _c.sent) {
            console.log('Confirmation already sent, skipping:', waitlistId);
            return;
        }
        // Validate email
        const normalizedEmail = (0, crypto_1.normalizeEmail)(waitlistData.email);
        if (!normalizedEmail || !normalizedEmail.includes('@')) {
            throw new Error('Invalid email address');
        }
        // Generate dedupe key
        const dedupeKey = (0, crypto_1.generateDedupeKey)(normalizedEmail);
        // Build email template
        const emailTemplate = (0, email_1.buildWaitlistConfirmationEmail)(normalizedEmail, waitlistData.name, waitlistData.locale, process.env.APP_BASE_URL || 'https://calendado.com');
        // Create Resend client
        const resendClient = (0, resend_1.createResendClient)(process.env.RESEND_API_KEY, process.env.FROM_EMAIL, process.env.FROM_NAME);
        // Send email
        const result = await resendClient.sendWaitlistConfirmation(normalizedEmail, emailTemplate.subject, emailTemplate.html, dedupeKey, waitlistData.locale || 'en-US');
        if (result.error) {
            throw new Error(`Resend API error: ${JSON.stringify(result.error)}`);
        }
        // Update waitlist document with success
        await (0, firestore_2.updateWaitlistConfirmation)(waitlistId, true, result.id, null);
        console.log('Waitlist confirmation sent successfully:', {
            waitlistId,
            email: normalizedEmail,
            messageId: result.id,
            locale: waitlistData.locale
        });
    }
    catch (error) {
        console.error('Error sending waitlist confirmation:', {
            waitlistId,
            email: waitlistData === null || waitlistData === void 0 ? void 0 : waitlistData.email,
            error: error instanceof Error ? error.message : String(error)
        });
        // Update waitlist document with error
        await (0, firestore_2.updateWaitlistConfirmation)(waitlistId, false, null, {
            code: 'SEND_FAILED',
            msg: error instanceof Error ? error.message : String(error)
        });
        // Save to dead letter queue for retry
        await (0, firestore_2.saveToDeadLetterQueue)(waitlistId, (waitlistData === null || waitlistData === void 0 ? void 0 : waitlistData.email) || 'unknown', {
            code: 'SEND_FAILED',
            msg: error instanceof Error ? error.message : String(error)
        });
        // Re-throw to trigger retry
        throw error;
    }
});
//# sourceMappingURL=sendWaitlistConfirmation.js.map