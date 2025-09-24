import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { sendWaitlistConfirmationFn } from './handlers/sendWaitlistConfirmation';
import { resendWebhook } from './handlers/resendWebhook';
import { adminResendConfirmation } from './handlers/adminResendConfirmation';
import { dlqReplayer } from './handlers/dlqReplayer';
import { healthCheck, livenessCheck, readinessCheck } from './handlers/healthCheck';

// Initialize Firebase Admin
initializeApp();

// Define secrets
const resendApiKey = defineSecret('RESEND_API_KEY');
const resendWebhookSecret = defineSecret('RESEND_WEBHOOK_SECRET');
const fromEmail = defineSecret('FROM_EMAIL');
const fromName = defineSecret('FROM_NAME');
const appBaseUrl = defineSecret('APP_BASE_URL');

// Export the Firestore trigger function (v2)
export { sendWaitlistConfirmationFn };

export const resendWebhookFn = onRequest(
  {
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 30,
    secrets: [resendWebhookSecret]
  },
  resendWebhook
);

export const adminResendConfirmationFn = onRequest(
  {
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 60,
    secrets: [resendApiKey, fromEmail, fromName, appBaseUrl]
  },
  adminResendConfirmation
);

export const dlqReplayerFn = onRequest(
  {
    region: 'us-central1',
    memory: '256MiB',
    timeoutSeconds: 300,
    secrets: [resendApiKey, fromEmail, fromName, appBaseUrl]
  },
  dlqReplayer
);

// Health check endpoints
export { healthCheck, livenessCheck, readinessCheck };
