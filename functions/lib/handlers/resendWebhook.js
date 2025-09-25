"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendWebhook = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const resend_1 = require("../lib/resend");
const firestore_2 = require("../lib/firestore");
const crypto_1 = require("../lib/crypto");
const security_1 = require("../lib/security");
exports.resendWebhook = (0, https_1.onRequest)(async (req, res) => {
    const clientIP = (0, security_1.getClientIP)(req);
    console.log('Received Resend webhook:', (0, security_1.sanitizeLogData)({
        method: req.method,
        clientIP,
        userAgent: req.headers['user-agent'],
        contentLength: req.headers['content-length']
    }));
    try {
        // Set security headers
        (0, security_1.setSecurityHeaders)(res);
        // Validate request size
        if (!(0, security_1.validateRequestSize)(req, 10240)) { // 10KB limit
            console.warn('Request too large:', clientIP);
            (0, security_1.createErrorResponse)(res, 413, 'Request too large');
            return;
        }
        // Check for suspicious requests
        if ((0, security_1.isSuspiciousRequest)(req)) {
            console.warn('Suspicious request detected:', clientIP);
            (0, security_1.createErrorResponse)(res, 403, 'Forbidden');
            return;
        }
        // Only accept POST requests
        if (req.method !== 'POST') {
            console.warn('Invalid method for webhook:', req.method, clientIP);
            (0, security_1.createErrorResponse)(res, 405, 'Method not allowed');
            return;
        }
        // Validate webhook payload
        if (!(0, security_1.validateWebhookPayload)(req.body)) {
            console.warn('Invalid webhook payload:', clientIP);
            (0, security_1.createErrorResponse)(res, 400, 'Invalid payload');
            return;
        }
        // Verify webhook signature (Svix format)
        const svixSignature = req.headers['svix-signature'];
        const svixTimestamp = req.headers['svix-timestamp'];
        const svixId = req.headers['svix-id'];
        if (!svixSignature || !svixTimestamp || !svixId) {
            console.warn('Missing Svix headers:', {
                signature: !!svixSignature,
                timestamp: !!svixTimestamp,
                id: !!svixId
            });
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const payload = JSON.stringify(req.body);
        const isValidSignature = (0, crypto_1.verifyResendSignature)(payload, svixSignature, process.env.RESEND_WEBHOOK_SECRET);
        if (!isValidSignature) {
            console.warn('Invalid webhook signature');
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // Parse webhook payload
        const resendClient = (0, resend_1.createResendClient)('', '', '');
        const webhookData = resendClient.parseWebhookPayload(req.body);
        if (!webhookData) {
            console.warn('Invalid webhook payload');
            res.status(400).json({ error: 'Invalid payload' });
            return;
        }
        console.log('Processing webhook event:', {
            type: webhookData.type,
            messageId: webhookData.data.id,
            email: webhookData.data.to[0]
        });
        // Save email event
        const emailEvent = {
            messageId: webhookData.data.id,
            type: webhookData.type,
            email: webhookData.data.to[0] || '',
            ts: firestore_1.Timestamp.fromDate(new Date(webhookData.created_at)),
            meta: {
                from: webhookData.data.from,
                subject: webhookData.data.subject,
                lastEvent: webhookData.data.last_event,
                createdAt: webhookData.data.created_at
            }
        };
        await (0, firestore_2.saveEmailEvent)(emailEvent);
        // Handle bounce and complaint events
        if (webhookData.type === 'bounced' || webhookData.type === 'complained') {
            const email = webhookData.data.to[0];
            if (email) {
                await (0, firestore_2.markWaitlistBlocked)(email);
                console.log('Marked user as blocked due to:', webhookData.type, email);
            }
        }
        console.log('Webhook processed successfully:', {
            type: webhookData.type,
            messageId: webhookData.data.id
        });
        res.status(200).json({ success: true });
    }
    catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : String(error)
        });
    }
});
//# sourceMappingURL=resendWebhook.js.map