import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { createResendClient } from '../lib/resend';
import { buildWaitlistConfirmationEmail } from '../lib/email';
import { 
  updateWaitlistConfirmation
} from '../lib/firestore';
import { WaitlistDoc } from '../types/models';
import { generateDedupeKey } from '../lib/crypto';
import { 
  AppError, 
  createEmailServiceError,
  validateEmail,
  validateName,
  validateLocale,
  asyncHandler
} from '../lib/errorHandler';
import { sanitizeEmail, sanitizeName } from '../lib/sanitizer';
import { validateRecaptchaWithSecurity } from '../lib/recaptcha';

export const sendWaitlistConfirmationFn = onDocumentCreated(
  {
    document: 'waitlist/{waitlistId}',
    region: 'us-central1'
  },
  asyncHandler(async (event) => {
    const waitlistId = event.params.waitlistId;
    const waitlistData = event.data?.data() as WaitlistDoc;
    
    console.log('Processing waitlist confirmation:', {
      waitlistId,
      email: waitlistData?.email,
      locale: waitlistData?.locale
    });

    // Validate waitlist data
    if (!waitlistData) {
      throw new AppError({
        code: 'MISSING_DATA' as any,
        message: 'Waitlist data not found',
        statusCode: 400,
        retryable: false
      });
    }

    // Check if confirmation was already sent (idempotency)
    if (waitlistData.comms?.confirmation?.sent) {
      console.log('Confirmation already sent, skipping:', waitlistId);
      return;
    }

    // Sanitize and validate input
    const sanitizedEmail = sanitizeEmail(waitlistData.email);
    const sanitizedName = sanitizeName(waitlistData.name);
    
    validateEmail(sanitizedEmail);
    validateName(sanitizedName);
    
    // Debug locale value
    console.log('Locale value received:', waitlistData.locale, 'Type:', typeof waitlistData.locale);
    validateLocale(waitlistData.locale);

    // Validate reCAPTCHA token if present
    if (waitlistData.captchaToken && waitlistData.captchaVerified) {
      console.log('Validating reCAPTCHA token...');
      const recaptchaValidation = await validateRecaptchaWithSecurity(
        waitlistData.captchaToken,
        'calendado.com', // Expected hostname
        undefined // We don't have the remote IP in this context
      );
      
      if (!recaptchaValidation.valid) {
        console.error('reCAPTCHA validation failed:', recaptchaValidation.reason);
        throw new AppError({
          code: 'INVALID_CAPTCHA' as any,
          message: `reCAPTCHA validation failed: ${recaptchaValidation.reason}`,
          statusCode: 400,
          retryable: false
        });
      }
      
      console.log('reCAPTCHA validation successful');
    } else {
      console.log('No reCAPTCHA token provided, skipping validation');
    }

    // Generate dedupe key
    const dedupeKey = generateDedupeKey(sanitizedEmail);

    // Build email template
    const emailTemplate = buildWaitlistConfirmationEmail(
      sanitizedEmail,
      sanitizedName,
      waitlistData.locale,
      process.env.APP_BASE_URL || 'https://calendado.com'
    );

    // Create Resend client
    const resendClient = createResendClient(
      process.env.RESEND_API_KEY!,
      process.env.FROM_EMAIL!,
      process.env.FROM_NAME!
    );

    // Send email
    const result = await resendClient.sendWaitlistConfirmation(
      sanitizedEmail,
      emailTemplate.subject,
      emailTemplate.html,
      dedupeKey,
      waitlistData.locale || 'en-US'
    );

    if (result.error) {
      throw createEmailServiceError(`Resend API error: ${JSON.stringify(result.error)}`);
    }

    // Update waitlist document with success
    await updateWaitlistConfirmation(
      waitlistId,
      true,
      result.id,
      null
    );

    console.log('Waitlist confirmation sent successfully:', {
      waitlistId,
      email: sanitizedEmail,
      messageId: result.id,
      locale: waitlistData.locale
    });

  })
);
