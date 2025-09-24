"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dlqReplayerFn = exports.adminResendConfirmationFn = exports.resendWebhookFn = exports.sendWaitlistConfirmationFn = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const app_1 = require("firebase-admin/app");
const sendWaitlistConfirmation_1 = require("./handlers/sendWaitlistConfirmation");
const resendWebhook_1 = require("./handlers/resendWebhook");
const adminResendConfirmation_1 = require("./handlers/adminResendConfirmation");
const dlqReplayer_1 = require("./handlers/dlqReplayer");
// Initialize Firebase Admin
(0, app_1.initializeApp)();
// Define secrets
const resendApiKey = (0, params_1.defineSecret)('RESEND_API_KEY');
const resendWebhookSecret = (0, params_1.defineSecret)('RESEND_WEBHOOK_SECRET');
const fromEmail = (0, params_1.defineSecret)('FROM_EMAIL');
const fromName = (0, params_1.defineSecret)('FROM_NAME');
const appBaseUrl = (0, params_1.defineSecret)('APP_BASE_URL');
// Export functions
exports.sendWaitlistConfirmationFn = (0, firestore_1.onDocumentCreated)({
    document: 'waitlist/{waitlistId}',
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 60,
    secrets: [resendApiKey, fromEmail, fromName, appBaseUrl]
}, sendWaitlistConfirmation_1.sendWaitlistConfirmation);
exports.resendWebhookFn = (0, https_1.onRequest)({
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 30,
    secrets: [resendWebhookSecret]
}, resendWebhook_1.resendWebhook);
exports.adminResendConfirmationFn = (0, https_1.onRequest)({
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 60,
    secrets: [resendApiKey, fromEmail, fromName, appBaseUrl]
}, adminResendConfirmation_1.adminResendConfirmation);
exports.dlqReplayerFn = (0, https_1.onRequest)({
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 300,
    secrets: [resendApiKey, fromEmail, fromName, appBaseUrl]
}, dlqReplayer_1.dlqReplayer);
//# sourceMappingURL=index.js.map