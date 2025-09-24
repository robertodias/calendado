import { ResendClient, createResendClient } from '../lib/resend';
import { ResendWebhookPayload } from '../types/models';

// Mock Resend SDK
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: jest.fn()
      }
    }))
  };
});

describe('ResendClient', () => {
  let resendClient: ResendClient;
  const mockApiKey = 'test-api-key';
  const mockFromEmail = 'test@example.com';
  const mockFromName = 'Test Sender';

  beforeEach(() => {
    resendClient = createResendClient(mockApiKey, mockFromEmail, mockFromName);
  });

  describe('sendWaitlistConfirmation', () => {
    it('should send email with correct payload', async () => {
      const mockResend = require('resend');
      const mockSend = jest.fn().mockResolvedValue({
        data: { id: 'test-message-id' },
        error: null
      });
      mockResend.Resend.mockImplementation(() => ({
        emails: { send: mockSend }
      }));

      const result = await resendClient.sendWaitlistConfirmation(
        'test@example.com',
        'Test Subject',
        '<html>Test HTML</html>',
        'test-dedupe-key',
        'en-US'
      );

      expect(result.id).toBe('test-message-id');
      expect(result.error).toBeNull();
      expect(mockSend).toHaveBeenCalledWith({
        from: 'Test Sender <test@example.com>',
        to: ['test@example.com'],
        subject: 'Test Subject',
        html: '<html>Test HTML</html>',
        headers: {
          'X-Dedupe-Key': 'test-dedupe-key',
          'X-Locale': 'en-US'
        },
        tags: [
          { name: 'type', value: 'waitlist-confirmation' },
          { name: 'locale', value: 'en-US' }
        ]
      });
    });

    it('should handle API errors', async () => {
      const mockResend = require('resend');
      const mockError = { message: 'API Error' };
      const mockSend = jest.fn().mockResolvedValue({
        data: null,
        error: mockError
      });
      mockResend.Resend.mockImplementation(() => ({
        emails: { send: mockSend }
      }));

      const result = await resendClient.sendWaitlistConfirmation(
        'test@example.com',
        'Test Subject',
        '<html>Test HTML</html>',
        'test-dedupe-key',
        'en-US'
      );

      expect(result.id).toBe('');
      expect(result.error).toBe(mockError);
    });

    it('should handle client errors', async () => {
      const mockResend = require('resend');
      const mockError = new Error('Client Error');
      const mockSend = jest.fn().mockRejectedValue(mockError);
      mockResend.Resend.mockImplementation(() => ({
        emails: { send: mockSend }
      }));

      const result = await resendClient.sendWaitlistConfirmation(
        'test@example.com',
        'Test Subject',
        '<html>Test HTML</html>',
        'test-dedupe-key',
        'en-US'
      );

      expect(result.id).toBe('');
      expect(result.error).toBe(mockError);
    });
  });

  describe('parseWebhookPayload', () => {
    it('should parse valid webhook payload', () => {
      const payload = {
        type: 'email.delivered',
        created_at: '2023-01-01T00:00:00Z',
        data: {
          id: 'test-message-id',
          from: 'test@example.com',
          to: ['recipient@example.com'],
          subject: 'Test Subject',
          html: '<html>Test</html>',
          text: 'Test',
          created_at: '2023-01-01T00:00:00Z',
          last_event: 'delivered'
        }
      };

      const result = resendClient.parseWebhookPayload(payload);

      expect(result).toEqual({
        type: 'delivered',
        created_at: '2023-01-01T00:00:00Z',
        data: {
          id: 'test-message-id',
          from: 'test@example.com',
          to: ['recipient@example.com'],
          subject: 'Test Subject',
          html: '<html>Test</html>',
          text: 'Test',
          created_at: '2023-01-01T00:00:00Z',
          last_event: 'delivered'
        }
      });
    });

    it('should return null for invalid payload', () => {
      expect(resendClient.parseWebhookPayload(null)).toBeNull();
      expect(resendClient.parseWebhookPayload({})).toBeNull();
      expect(resendClient.parseWebhookPayload({ type: 'invalid' })).toBeNull();
    });

    it('should return null for invalid event type', () => {
      const payload = {
        type: 'invalid.type',
        created_at: '2023-01-01T00:00:00Z',
        data: {
          id: 'test-message-id',
          from: 'test@example.com',
          to: ['recipient@example.com'],
          subject: 'Test Subject',
          html: '<html>Test</html>',
          text: 'Test',
          created_at: '2023-01-01T00:00:00Z',
          last_event: 'delivered'
        }
      };

      const result = resendClient.parseWebhookPayload(payload);
      expect(result).toBeNull();
    });
  });

  describe('mapEventType', () => {
    it('should map valid event types', () => {
      expect(resendClient.mapEventType('email.delivered')).toBe('delivered');
      expect(resendClient.mapEventType('email.bounced')).toBe('bounced');
      expect(resendClient.mapEventType('email.opened')).toBe('opened');
      expect(resendClient.mapEventType('email.clicked')).toBe('clicked');
      expect(resendClient.mapEventType('email.complained')).toBe('complained');
      expect(resendClient.mapEventType('email.dropped')).toBe('dropped');
    });

    it('should return null for invalid event types', () => {
      expect(resendClient.mapEventType('invalid.type')).toBeNull();
      expect(resendClient.mapEventType('')).toBeNull();
    });
  });

  describe('validateWebhookSignature', () => {
    it('should validate correct signature', async () => {
      const payload = '{"test": "data"}';
      const secret = 'test-secret';
      const signature = 'a1b2c3d4e5f6'; // This would be the actual HMAC in real usage

      // Mock crypto module
      const crypto = require('crypto');
      const originalCreateHmac = crypto.createHmac;
      crypto.createHmac = jest.fn().mockImplementation((algorithm, key) => ({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(signature)
      }));

      const result = await resendClient.validateWebhookSignature(payload, signature, secret);
      expect(result).toBe(true);

      // Restore original function
      crypto.createHmac = originalCreateHmac;
    });

    it('should reject invalid signature', async () => {
      const payload = '{"test": "data"}';
      const secret = 'test-secret';
      const invalidSignature = 'invalid-signature';

      const result = await resendClient.validateWebhookSignature(payload, invalidSignature, secret);
      expect(result).toBe(false);
    });
  });
});
