import { onRequest } from 'firebase-functions/v2/https';
import type { Request, Response } from 'firebase-functions/v1';
import { withAuth, requireMethod, validateBody } from '../lib/middleware';
import { createResendClient } from '../lib/resend';
import { buildWaitlistConfirmationEmail } from '../lib/email';
import { 
  getWaitlistById, 
  getWaitlistByEmail, 
  updateWaitlistConfirmation,
  wasEmailSentRecently 
} from '../lib/firestore';
import type { AdminResendRequest } from '../types/models';
import { generateDedupeKey, normalizeEmail } from '../lib/crypto';

export const adminResendConfirmation = onRequest(
  withAuth({ requireAdmin: true })(
    requireMethod('POST')(
      validateBody([])(
        async (req: Request, res: Response, user) => {
          console.log('Admin resend confirmation request:', {
            method: req.method,
            body: req.body,
            userId: user.uid
          });

          const requestData: AdminResendRequest = req.body;
          const { waitlistId, email, force = false } = requestData;

          if (!waitlistId && !email) {
            res.status(400).json({ 
              error: 'Either waitlistId or email must be provided' 
            });
            return;
          }

          // Get waitlist document
          let waitlistDoc;
          if (waitlistId) {
            waitlistDoc = await getWaitlistById(waitlistId);
          } else if (email) {
            waitlistDoc = await getWaitlistByEmail(email);
          }

          if (!waitlistDoc) {
            res.status(404).json({ 
              error: 'Waitlist document not found' 
            });
            return;
          }

          // Check if email was sent recently (unless forced)
          if (!force) {
            const wasSentRecently = await wasEmailSentRecently(waitlistDoc.id);
            if (wasSentRecently) {
              res.status(409).json({ 
                error: 'Email was sent recently. Use force=true to override.',
                waitlistId: waitlistDoc.id
              });
              return;
            }
          }

          // Validate email
          const normalizedEmail = normalizeEmail(waitlistDoc.email);
          if (!normalizedEmail || !normalizedEmail.includes('@')) {
            res.status(400).json({ 
              error: 'Invalid email address' 
            });
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

          // Update waitlist document
          await updateWaitlistConfirmation(
            waitlistDoc.id,
            true,
            result.id,
            null
          );

          console.log('Admin resend confirmation successful:', {
            waitlistId: waitlistDoc.id,
            email: normalizedEmail,
            messageId: result.id,
            forced: force
          });

          res.status(200).json({
            success: true,
            waitlistId: waitlistDoc.id,
            email: normalizedEmail,
            messageId: result.id,
            forced: force
          });
        }
      )
    )
  )
);
