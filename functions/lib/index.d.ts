import { sendWaitlistConfirmationFn } from './handlers/sendWaitlistConfirmation';
import { healthCheck, livenessCheck, readinessCheck } from './handlers/healthCheck';
import { updateUserRoles } from './handlers/updateUserRoles';
import { inviteFromWaitlist, rejectWaitlist, getWaitlistEntry } from './waitlist';
import { issueMagicLink, validateMagicLink, redeemMagicLink } from './magicLink';
import { consumeInvite } from './invite';
export { sendWaitlistConfirmationFn };
export declare const resendWebhookFn: import("firebase-functions/v2/https").HttpsFunction;
export declare const adminResendConfirmationFn: import("firebase-functions/v2/https").HttpsFunction;
export declare const dlqReplayerFn: import("firebase-functions/v2/https").HttpsFunction;
export { healthCheck, livenessCheck, readinessCheck };
export { updateUserRoles };
export { inviteFromWaitlist, rejectWaitlist, getWaitlistEntry };
export { issueMagicLink, validateMagicLink, redeemMagicLink };
export { consumeInvite };
//# sourceMappingURL=index.d.ts.map