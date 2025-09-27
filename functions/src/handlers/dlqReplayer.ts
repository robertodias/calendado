import { onRequest } from 'firebase-functions/v2/https';
import type { Request, Response } from 'firebase-functions/v1';
import { withAuth, requireMethod } from '../lib/middleware';
import { createResendClient } from '../lib/resend';
import { buildWaitlistConfirmationEmail } from '../lib/email';
import { 
  getWaitlistById,
  updateWaitlistConfirmation,
  getDeadLetterQueueDocuments,
  deleteDeadLetterQueueDocument,
  updateDeadLetterQueueAttempts
} from '../lib/firestore';
import type { DeadLetterQueueDoc } from '../types/models';
import { generateDedupeKey, normalizeEmail } from '../lib/crypto';

export const dlqReplayer = onRequest(
  withAuth({ requireAdmin: true })(
    requireMethod('POST')(
      async (req: Request, res: Response, user) => {
        console.log('DLQ replayer request:', {
          method: req.method,
          body: req.body,
          userId: user.uid
        });

      // Get dead letter queue documents
      const dlqDocs = await getDeadLetterQueueDocuments();
      
      if (dlqDocs.length === 0) {
        res.status(200).json({ 
          success: true, 
          message: 'No items in dead letter queue',
          processed: 0
        });
        return;
      }

      console.log(`Processing ${dlqDocs.length} items from dead letter queue`);

      const results = {
        processed: 0,
        successful: 0,
        failed: 0,
        errors: [] as string[]
      };

      // Process each DLQ item
      for (const dlqDoc of dlqDocs) {
        try {
          await processDLQItem(dlqDoc);
          results.successful++;
          results.processed++;
        } catch (error) {
          results.failed++;
          results.processed++;
          const errorMsg = `Failed to process DLQ item ${dlqDoc.waitlistId}: ${error instanceof Error ? error.message : String(error)}`;
          results.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      console.log('DLQ replayer completed:', results);

        res.status(200).json({
          success: true,
          ...results
        });
      }
    )
  )
);

/**
 * Process a single DLQ item
 */
async function processDLQItem(dlqDoc: DeadLetterQueueDoc): Promise<void> {
  const { waitlistId, attempts, maxAttempts } = dlqDoc;

  // Check if we've exceeded max attempts
  if (attempts >= maxAttempts) {
    console.warn(`Max attempts exceeded for DLQ item: ${waitlistId}`);
    await deleteDeadLetterQueueDocument(waitlistId);
    return;
  }

  // Get waitlist document
  const waitlistDoc = await getWaitlistById(waitlistId);
  if (!waitlistDoc) {
    console.warn(`Waitlist document not found for DLQ item: ${waitlistId}`);
    await deleteDeadLetterQueueDocument(waitlistId);
    return;
  }

  // Validate email
  const normalizedEmail = normalizeEmail(waitlistDoc.email);
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    console.warn(`Invalid email for DLQ item: ${waitlistId}`);
    await deleteDeadLetterQueueDocument(waitlistId);
    return;
  }

  // Generate dedupe key
  const dedupeKey = generateDedupeKey(normalizedEmail);

  // Build email template
  const emailTemplate = buildWaitlistConfirmationEmail(
    normalizedEmail,
    waitlistDoc.name,
    waitlistDoc.locale,
    process.env.APP_BASE_URL || 'https://calendado.com'
  );

  // Create Resend client
  const resendClient = createResendClient(
    process.env.RESEND_API_KEY!,
    process.env.FROM_EMAIL!,
    process.env.FROM_NAME!
  );

  try {
    // Send email
    const result = await resendClient.sendWaitlistConfirmation(
      normalizedEmail,
      emailTemplate.subject,
      emailTemplate.html,
      dedupeKey,
      waitlistDoc.locale || 'en-US'
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

    // Remove from DLQ
    await deleteDeadLetterQueueDocument(waitlistId);

    console.log('Successfully processed DLQ item:', {
      waitlistId,
      email: normalizedEmail,
      messageId: result.id
    });

  } catch (error) {
    // Update attempt count
    await updateDeadLetterQueueAttempts(
      waitlistId,
      {
        code: 'RETRY_FAILED',
        msg: error instanceof Error ? error.message : String(error)
      }
    );

    throw error;
  }
}
