"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWaitlistConfirmationFn = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const resend_1 = require("../lib/resend");
const email_1 = require("../lib/email");
const firestore_2 = require("../lib/firestore");
const crypto_1 = require("../lib/crypto");
const errorHandler_1 = require("../lib/errorHandler");
const sanitizer_1 = require("../lib/sanitizer");
const recaptcha_1 = require("../lib/recaptcha");
exports.sendWaitlistConfirmationFn = (0, firestore_1.onDocumentCreated)({
    document: 'waitlist/{waitlistId}',
    region: 'us-central1'
}, (0, errorHandler_1.asyncHandler)(async (event) => {
    var _a, _b, _c;
    const waitlistId = event.params.waitlistId;
    const waitlistData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    console.log('Processing waitlist confirmation:', {
        waitlistId,
        email: waitlistData === null || waitlistData === void 0 ? void 0 : waitlistData.email,
        locale: waitlistData === null || waitlistData === void 0 ? void 0 : waitlistData.locale
    });
    // Validate waitlist data
    if (!waitlistData) {
        throw new errorHandler_1.AppError({
            code: 'MISSING_DATA',
            message: 'Waitlist data not found',
            statusCode: 400,
            retryable: false
        });
    }
    // Check if confirmation was already sent (idempotency)
    if ((_c = (_b = waitlistData.comms) === null || _b === void 0 ? void 0 : _b.confirmation) === null || _c === void 0 ? void 0 : _c.sent) {
        console.log('Confirmation already sent, skipping:', waitlistId);
        return;
    }
    // Sanitize and validate input
    const sanitizedEmail = (0, sanitizer_1.sanitizeEmail)(waitlistData.email);
    const sanitizedName = (0, sanitizer_1.sanitizeName)(waitlistData.name);
    (0, errorHandler_1.validateEmail)(sanitizedEmail);
    (0, errorHandler_1.validateName)(sanitizedName);
    // Debug locale value
    console.log('Locale value received:', waitlistData.locale, 'Type:', typeof waitlistData.locale);
    (0, errorHandler_1.validateLocale)(waitlistData.locale);
    // Validate reCAPTCHA token if present
    if (waitlistData.captchaToken && waitlistData.captchaVerified) {
        console.log('Validating reCAPTCHA token...');
        const recaptchaValidation = await (0, recaptcha_1.validateRecaptchaWithSecurity)(waitlistData.captchaToken, 'calendado.com', // Expected hostname
        undefined // We don't have the remote IP in this context
        );
        if (!recaptchaValidation.valid) {
            console.error('reCAPTCHA validation failed:', recaptchaValidation.reason);
            throw new errorHandler_1.AppError({
                code: 'INVALID_CAPTCHA',
                message: `reCAPTCHA validation failed: ${recaptchaValidation.reason}`,
                statusCode: 400,
                retryable: false
            });
        }
        console.log('reCAPTCHA validation successful');
    }
    else {
        console.log('No reCAPTCHA token provided, skipping validation');
    }
    // Generate dedupe key
    const dedupeKey = (0, crypto_1.generateDedupeKey)(sanitizedEmail);
    // Build email template
    const emailTemplate = (0, email_1.buildWaitlistConfirmationEmail)(sanitizedEmail, sanitizedName, waitlistData.locale, process.env.APP_BASE_URL || 'https://calendado.com');
    // Clean the subject to remove any special characters
    const cleanSubject = emailTemplate.subject.replace(/[^\x20-\x7E]/g, '');
    console.log('Original subject:', JSON.stringify(emailTemplate.subject));
    console.log('Clean subject:', JSON.stringify(cleanSubject));
    // Create Resend client
    const resendClient = (0, resend_1.createResendClient)(process.env.RESEND_API_KEY, process.env.FROM_EMAIL, process.env.FROM_NAME);
    // Send email
    const result = await resendClient.sendWaitlistConfirmation(sanitizedEmail, cleanSubject, emailTemplate.html, dedupeKey, waitlistData.locale || 'en-US');
    if (result.error) {
        throw (0, errorHandler_1.createEmailServiceError)(`Resend API error: ${JSON.stringify(result.error)}`);
    }
    // Update waitlist document with success
    await (0, firestore_2.updateWaitlistConfirmation)(waitlistId, true, result.id, null);
    console.log('Waitlist confirmation sent successfully:', {
        waitlistId,
        email: sanitizedEmail,
        messageId: result.id,
        locale: waitlistData.locale
    });
}));
//# sourceMappingURL=sendWaitlistConfirmation.js.map