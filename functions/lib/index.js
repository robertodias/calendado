"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRoles = exports.readinessCheck = exports.livenessCheck = exports.healthCheck = exports.dlqReplayerFn = exports.adminResendConfirmationFn = exports.resendWebhookFn = exports.sendWaitlistConfirmationFn = void 0;
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const app_1 = require("firebase-admin/app");
const sendWaitlistConfirmation_1 = require("./handlers/sendWaitlistConfirmation");
Object.defineProperty(exports, "sendWaitlistConfirmationFn", { enumerable: true, get: function () { return sendWaitlistConfirmation_1.sendWaitlistConfirmationFn; } });
const resendWebhook_1 = require("./handlers/resendWebhook");
const adminResendConfirmation_1 = require("./handlers/adminResendConfirmation");
const dlqReplayer_1 = require("./handlers/dlqReplayer");
const healthCheck_1 = require("./handlers/healthCheck");
Object.defineProperty(exports, "healthCheck", { enumerable: true, get: function () { return healthCheck_1.healthCheck; } });
Object.defineProperty(exports, "livenessCheck", { enumerable: true, get: function () { return healthCheck_1.livenessCheck; } });
Object.defineProperty(exports, "readinessCheck", { enumerable: true, get: function () { return healthCheck_1.readinessCheck; } });
const updateUserRoles_1 = require("./handlers/updateUserRoles");
Object.defineProperty(exports, "updateUserRoles", { enumerable: true, get: function () { return updateUserRoles_1.updateUserRoles; } });
// Initialize Firebase Admin
(0, app_1.initializeApp)();
// Define secrets
const resendApiKey = (0, params_1.defineSecret)('RESEND_API_KEY');
const resendWebhookSecret = (0, params_1.defineSecret)('RESEND_WEBHOOK_SECRET');
const fromEmail = (0, params_1.defineSecret)('FROM_EMAIL');
const fromName = (0, params_1.defineSecret)('FROM_NAME');
const appBaseUrl = (0, params_1.defineSecret)('APP_BASE_URL');
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