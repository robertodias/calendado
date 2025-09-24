import { onRequest } from 'firebase-functions/v2/https';
import { Request, Response } from 'firebase-functions/v1';
import { Timestamp } from 'firebase-admin/firestore';
import { createResendClient } from '../lib/resend';
import { saveEmailEvent, markWaitlistBlocked } from '../lib/firestore';
import { extractSignature, verifyResendSignature } from '../lib/crypto';
import { EmailEventDoc } from '../types/models';
import { 
  setSecurityHeaders, 
  sanitizeLogData, 
  validateRequestSize, 
  isSuspiciousRequest,
  createErrorResponse,
  validateWebhookPayload,
  getClientIP
} from '../lib/security';

export const resendWebhook = onRequest(
  async (req: Request, res: Response) => {
    const clientIP = getClientIP(req);
    
    console.log('Received Resend webhook:', sanitizeLogData({
      method: req.method,
      clientIP,
      userAgent: req.headers['user-agent'],
      contentLength: req.headers['content-length']
    }));

    try {
      // Set security headers
      setSecurityHeaders(res);
      
      // Validate request size
      if (!validateRequestSize(req, 10240)) { // 10KB limit
        console.warn('Request too large:', clientIP);
        createErrorResponse(res, 413, 'Request too large');
        return;
      }
      
      // Check for suspicious requests
      if (isSuspiciousRequest(req)) {
        console.warn('Suspicious request detected:', clientIP);
        createErrorResponse(res, 403, 'Forbidden');
        return;
      }
      
      // Only accept POST requests
      if (req.method !== 'POST') {
        console.warn('Invalid method for webhook:', req.method, clientIP);
        createErrorResponse(res, 405, 'Method not allowed');
        return;
      }
      
      // Validate webhook payload
      if (!validateWebhookPayload(req.body)) {
        console.warn('Invalid webhook payload:', clientIP);
        createErrorResponse(res, 400, 'Invalid payload');
        return;
      }

      // Verify webhook signature
      const authHeader = req.headers.authorization || req.headers.Authorization;
      const signature = extractSignature(authHeader as string);
      
      if (!signature) {
        console.warn('Missing or invalid authorization header');
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const payload = JSON.stringify(req.body);
      const isValidSignature = verifyResendSignature(
        payload,
        signature,
        process.env.RESEND_WEBHOOK_SECRET!
      );

      if (!isValidSignature) {
        console.warn('Invalid webhook signature');
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Parse webhook payload
      const resendClient = createResendClient('', '', '');
      const webhookData = resendClient.parseWebhookPayload(req.body);

      if (!webhookData) {
        console.warn('Invalid webhook payload');
        res.status(400).json({ error: 'Invalid payload' });
        return;
      }

      console.log('Processing webhook event:', {
        type: webhookData.type,
        messageId: webhookData.data.id,
        email: webhookData.data.to[0]
      });

      // Save email event
      const emailEvent: Omit<EmailEventDoc, 'id'> = {
        messageId: webhookData.data.id,
        type: webhookData.type,
        email: webhookData.data.to[0] || '',
        ts: Timestamp.fromDate(new Date(webhookData.created_at)),
        meta: {
          from: webhookData.data.from,
          subject: webhookData.data.subject,
          lastEvent: webhookData.data.last_event,
          createdAt: webhookData.data.created_at
        }
      };

      await saveEmailEvent(emailEvent);

      // Handle bounce and complaint events
      if (webhookData.type === 'bounced' || webhookData.type === 'complained') {
        const email = webhookData.data.to[0];
        if (email) {
          await markWaitlistBlocked(email);
          console.log('Marked user as blocked due to:', webhookData.type, email);
        }
      }

      console.log('Webhook processed successfully:', {
        type: webhookData.type,
        messageId: webhookData.data.id
      });

      res.status(200).json({ success: true });

    } catch (error) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }
);
