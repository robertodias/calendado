import { Resend } from 'resend';
import { ResendEmailPayload, ResendWebhookPayload, EmailEventType } from '../types/models';

export class ResendClient {
  private client: Resend;
  private fromEmail: string;
  private fromName: string;

  constructor(apiKey: string, fromEmail: string, fromName: string) {
    this.client = new Resend(apiKey);
    this.fromEmail = fromEmail.trim();
    this.fromName = fromName.trim();
  }

  /**
   * Send email via Resend
   */
  async sendEmail(payload: ResendEmailPayload): Promise<{ id: string; error?: any }> {
    try {
      const result = await this.client.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        headers: payload.headers,
        tags: payload.tags
      });

      if (result.error) {
        console.error('Resend API error:', result.error);
        return { id: '', error: result.error };
      }

      return { id: result.data?.id || '', error: null };
    } catch (error) {
      console.error('Resend client error:', error);
      return { id: '', error };
    }
  }

  /**
   * Send waitlist confirmation email
   */
  async sendWaitlistConfirmation(
    email: string,
    subject: string,
    html: string,
    dedupeKey: string,
    locale: string
  ): Promise<{ id: string; error?: any }> {
    const payload: ResendEmailPayload = {
      from: `${this.fromName} <${this.fromEmail}>`,
      to: [email],
      subject,
      html,
      headers: {
        'X-Dedupe-Key': dedupeKey,
        'X-Locale': locale
      },
      tags: [
        { name: 'type', value: 'waitlist-confirmation' },
        { name: 'locale', value: locale }
      ]
    };

    return this.sendEmail(payload);
  }

  /**
   * Parse Resend webhook payload
   */
  parseWebhookPayload(payload: any): ResendWebhookPayload | null {
    try {
      if (!payload || typeof payload !== 'object') {
        return null;
      }

      const { type, created_at, data } = payload;

      if (!type || !created_at || !data) {
        return null;
      }

      // Validate event type
      const validTypes: EmailEventType[] = ['delivered', 'bounced', 'opened', 'clicked', 'complained', 'dropped'];
      if (!validTypes.includes(type)) {
        console.warn('Invalid event type:', type);
        return null;
      }

      return {
        type,
        created_at,
        data: {
          id: data.id || '',
          from: data.from || '',
          to: Array.isArray(data.to) ? data.to : [],
          subject: data.subject || '',
          html: data.html || '',
          text: data.text || '',
          created_at: data.created_at || created_at,
          last_event: data.last_event || type
        }
      };
    } catch (error) {
      console.error('Error parsing webhook payload:', error);
      return null;
    }
  }

  /**
   * Map Resend event type to our internal type
   */
  mapEventType(resendType: string): EmailEventType | null {
    const typeMap: Record<string, EmailEventType> = {
      'email.delivered': 'delivered',
      'email.bounced': 'bounced',
      'email.opened': 'opened',
      'email.clicked': 'clicked',
      'email.complained': 'complained',
      'email.dropped': 'dropped'
    };

    return typeMap[resendType] || null;
  }

  /**
   * Validate webhook signature (placeholder - implement based on Resend docs)
   */
  async validateWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    // This is a placeholder - implement actual signature validation
    // based on Resend's webhook signature verification method
    try {
      const crypto = await import('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      
      return signature === expectedSignature;
    } catch (error) {
      console.error('Error validating webhook signature:', error);
      return false;
    }
  }
}

/**
 * Create Resend client instance
 */
export function createResendClient(
  apiKey: string,
  fromEmail: string,
  fromName: string
): ResendClient {
  return new ResendClient(apiKey, fromEmail, fromName);
}
