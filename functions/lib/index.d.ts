import { sendWaitlistConfirmationFn } from './handlers/sendWaitlistConfirmation';
import { healthCheck, livenessCheck, readinessCheck } from './handlers/healthCheck';
import { updateUserRoles } from './handlers/updateUserRoles';
import { bootstrapSuperadmin } from './handlers/bootstrapSuperadmin';
export { sendWaitlistConfirmationFn };
export declare const resendWebhookFn: import("firebase-functions/v2/https").HttpsFunction;
export declare const adminResendConfirmationFn: import("firebase-functions/v2/https").HttpsFunction;
export declare const dlqReplayerFn: import("firebase-functions/v2/https").HttpsFunction;
export { healthCheck, livenessCheck, readinessCheck };
export { updateUserRoles };
export { bootstrapSuperadmin };
//# sourceMappingURL=index.d.ts.map