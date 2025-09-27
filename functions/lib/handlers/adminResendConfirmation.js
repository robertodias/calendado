"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminResendConfirmation = void 0;
const https_1 = require("firebase-functions/v2/https");
const middleware_1 = require("../lib/middleware");
const resend_1 = require("../lib/resend");
const email_1 = require("../lib/email");
const firestore_1 = require("../lib/firestore");
const crypto_1 = require("../lib/crypto");
exports.adminResendConfirmation = (0, https_1.onRequest)((0, middleware_1.withAuth)({ requireAdmin: true })((0, middleware_1.requireMethod)('POST')((0, middleware_1.validateBody)([])(async (req, res, user) => {
    console.log('Admin resend confirmation request:', {
        method: req.method,
        body: req.body,
        userId: user.uid
    });
    const requestData = req.body;
    const { waitlistId, email, force = false } = requestData;
    if (!waitlistId && !email) {
        res.status(400).json({
            error: 'Either waitlistId or email must be provided'
        });
        return;
    }
    // Get waitlist document
    let waitlistDoc;
    if (waitlistId) {
        waitlistDoc = await (0, firestore_1.getWaitlistById)(waitlistId);
    }
    else if (email) {
        waitlistDoc = await (0, firestore_1.getWaitlistByEmail)(email);
    }
    if (!waitlistDoc) {
        res.status(404).json({
            error: 'Waitlist document not found'
        });
        return;
    }
    // Check if email was sent recently (unless forced)
    if (!force) {
        const wasSentRecently = await (0, firestore_1.wasEmailSentRecently)(waitlistDoc.id);
        if (wasSentRecently) {
            res.status(409).json({
                error: 'Email was sent recently. Use force=true to override.',
                waitlistId: waitlistDoc.id
            });
            return;
        }
    }
    // Validate email
    const normalizedEmail = (0, crypto_1.normalizeEmail)(waitlistDoc.email);
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
        res.status(400).json({
            error: 'Invalid email address'
        });
        return;
    }
    // Generate dedupe key
    const dedupeKey = (0, crypto_1.generateDedupeKey)(normalizedEmail);
    // Build email template
    const emailTemplate = (0, email_1.buildWaitlistConfirmationEmail)(normalizedEmail, waitlistDoc.name, waitlistDoc.locale, process.env.APP_BASE_URL || 'https://calendado.com');
    // Create Resend client
    const resendClient = (0, resend_1.createResendClient)(process.env.RESEND_API_KEY, process.env.FROM_EMAIL, process.env.FROM_NAME);
    // Send email
    const result = await resendClient.sendWaitlistConfirmation(normalizedEmail, emailTemplate.subject, emailTemplate.html, dedupeKey, waitlistDoc.locale || 'en-US');
    if (result.error) {
        throw new Error(`Resend API error: ${JSON.stringify(result.error)}`);
    }
    // Update waitlist document
    await (0, firestore_1.updateWaitlistConfirmation)(waitlistDoc.id, true, result.id, null);
    console.log('Admin resend confirmation successful:', {
        waitlistId: waitlistDoc.id,
        email: normalizedEmail,
        messageId: result.id,
        forced: force
    });
    res.status(200).json({
        success: true,
        waitlistId: waitlistDoc.id,
        email: normalizedEmail,
        messageId: result.id,
        forced: force
    });
}))));
//# sourceMappingURL=adminResendConfirmation.js.map