import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { createResendClient } from '../lib/resend';
import { buildWaitlistConfirmationEmail } from '../lib/email';
import { 
  updateWaitlistConfirmation, 
  saveToDeadLetterQueue 
} from '../lib/firestore';
import { WaitlistDoc } from '../types/models';
import { generateDedupeKey, normalizeEmail } from '../lib/crypto';

export const sendWaitlistConfirmation = onDocumentCreated(
  'waitlist/{waitlistId}',
  async (event) => {
    const waitlistId = event.params.waitlistId;
    const waitlistData = event.data?.data() as WaitlistDoc;
    
    console.log('Processing waitlist confirmation:', {
      waitlistId,
      email: waitlistData?.email,
      locale: waitlistData?.locale
    });

    try {
      // Validate waitlist data
      if (!waitlistData) {
        throw new Error('Waitlist data not found');
      }

      // Check if confirmation was already sent (idempotency)
      if (waitlistData.comms?.confirmation?.sent) {
        console.log('Confirmation already sent, skipping:', waitlistId);
        return;
      }

      // Validate email
      const normalizedEmail = normalizeEmail(waitlistData.email);
      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        throw new Error('Invalid email address');
      }

      // Generate dedupe key
      const dedupeKey = generateDedupeKey(normalizedEmail);

      // Build email template
      const emailTemplate = buildWaitlistConfirmationEmail(
        normalizedEmail,
        waitlistData.name,
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
        normalizedEmail,
        emailTemplate.subject,
        emailTemplate.html,
        dedupeKey,
        waitlistData.locale || 'en-US'
      );

      if (result.error) {
        throw new Error(`Resend API error: ${JSON.stringify(result.error)}`);
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
        email: normalizedEmail,
        messageId: result.id,
        locale: waitlistData.locale
      });

    } catch (error) {
      console.error('Error sending waitlist confirmation:', {
        waitlistId,
        email: waitlistData?.email,
        error: error instanceof Error ? error.message : String(error)
      });

      // Update waitlist document with error
      await updateWaitlistConfirmation(
        waitlistId,
        false,
        null,
        {
          code: 'SEND_FAILED',
          msg: error instanceof Error ? error.message : String(error)
        }
      );

      // Save to dead letter queue for retry
      await saveToDeadLetterQueue(
        waitlistId,
        waitlistData?.email || 'unknown',
        {
          code: 'SEND_FAILED',
          msg: error instanceof Error ? error.message : String(error)
        }
      );

      // Re-throw to trigger retry
      throw error;
    }
  }
);
