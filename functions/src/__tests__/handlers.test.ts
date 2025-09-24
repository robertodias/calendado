// import { testEnv } from './setup';
import { sendWaitlistConfirmationFnFn } from '../handlers/sendWaitlistConfirmationFn';
import { resendWebhook } from '../handlers/resendWebhook';
import { adminResendConfirmation } from '../handlers/adminResendConfirmation';
import { WaitlistDoc } from '../types/models';

// Mock dependencies
jest.mock('../lib/resend');
jest.mock('../lib/firestore');
jest.mock('../lib/crypto');

describe('Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendWaitlistConfirmationFn', () => {
    it('should send confirmation email for new waitlist entry', async () => {
      const mockWaitlistData: WaitlistDoc = {
        email: 'test@example.com',
        name: 'John Doe',
        locale: 'en-US',
        utm: null,
        userAgent: null,
        ip: null,
        createdAt: new Date() as any,
        status: 'pending',
        comms: {
          confirmation: {
            sent: false,
            sentAt: null,
            messageId: null,
            error: null
          }
        },
        dedupeKey: 'test-dedupe-key',
        id: 'test-waitlist-id'
      };

      const mockEvent = {
        params: { waitlistId: 'test-waitlist-id' },
        data: {
          data: () => mockWaitlistData
        }
      };

      // Mock dependencies
      const { createResendClient } = require('../lib/resend');
      const mockResendClient = {
        sendWaitlistConfirmationFn: jest.fn().mockResolvedValue({
          id: 'test-message-id',
          error: null
        })
      };
      createResendClient.mockReturnValue(mockResendClient);

      const { updateWaitlistConfirmation } = require('../lib/firestore');
      updateWaitlistConfirmation.mockResolvedValue(undefined);

      // Set environment variables
      process.env.RESEND_API_KEY = 'test-api-key';
      process.env.FROM_EMAIL = 'test@example.com';
      process.env.FROM_NAME = 'Test Sender';
      process.env.APP_BASE_URL = 'https://calendado.com';

      await sendWaitlistConfirmationFn(mockEvent as any);

      expect(mockResendClient.sendWaitlistConfirmationFn).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(String),
        expect.any(String),
        'test-dedupe-key',
        'en-US'
      );
      expect(updateWaitlistConfirmation).toHaveBeenCalledWith(
        'test-waitlist-id',
        true,
        'test-message-id',
        null
      );
    });

    it('should skip if confirmation already sent', async () => {
      const mockWaitlistData: WaitlistDoc = {
        email: 'test@example.com',
        name: 'John Doe',
        locale: 'en-US',
        utm: null,
        userAgent: null,
        ip: null,
        createdAt: new Date() as any,
        status: 'pending',
        comms: {
          confirmation: {
            sent: true,
            sentAt: new Date() as any,
            messageId: 'existing-message-id',
            error: null
          }
        },
        dedupeKey: 'test-dedupe-key',
        id: 'test-waitlist-id'
      };

      const mockEvent = {
        params: { waitlistId: 'test-waitlist-id' },
        data: {
          data: () => mockWaitlistData
        }
      };

      const { createResendClient } = require('../lib/resend');
      const mockResendClient = {
        sendWaitlistConfirmationFn: jest.fn()
      };
      createResendClient.mockReturnValue(mockResendClient);

      await sendWaitlistConfirmationFn(mockEvent as any);

      expect(mockResendClient.sendWaitlistConfirmationFn).not.toHaveBeenCalled();
    });
  });

  describe('resendWebhook', () => {
    it('should process valid webhook payload', async () => {
      const mockReq = {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-signature'
        },
        body: {
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
        }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock dependencies
      const { verifyResendSignature } = require('../lib/crypto');
      verifyResendSignature.mockReturnValue(true);

      const { createResendClient } = require('../lib/resend');
      const mockResendClient = {
        parseWebhookPayload: jest.fn().mockReturnValue({
          type: 'delivered',
          created_at: '2023-01-01T00:00:00Z',
          data: {
            id: 'test-message-id',
            to: ['recipient@example.com']
          }
        })
      };
      createResendClient.mockReturnValue(mockResendClient);

      const { saveEmailEvent } = require('../lib/firestore');
      saveEmailEvent.mockResolvedValue('test-event-id');

      process.env.RESEND_WEBHOOK_SECRET = 'test-secret';

      await resendWebhook(mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
      expect(saveEmailEvent).toHaveBeenCalled();
    });

    it('should reject invalid signature', async () => {
      const mockReq = {
        method: 'POST',
        headers: {
          authorization: 'Bearer invalid-signature'
        },
        body: {}
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const { verifyResendSignature } = require('../lib/crypto');
      verifyResendSignature.mockReturnValue(false);

      process.env.RESEND_WEBHOOK_SECRET = 'test-secret';

      await resendWebhook(mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });
  });

  describe('adminResendConfirmation', () => {
    it('should resend confirmation for admin user', async () => {
      const mockReq = {
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-admin-token'
        },
        body: {
          waitlistId: 'test-waitlist-id'
        }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock Firebase Auth
      const { getAuth } = require('firebase-admin/auth');
      const mockAuth = {
        verifyIdToken: jest.fn().mockResolvedValue({
          admin: true
        })
      };
      getAuth.mockReturnValue(mockAuth);

      // Mock Firestore
      const { getWaitlistById, wasEmailSentRecently, updateWaitlistConfirmation } = require('../lib/firestore');
      const mockWaitlistData: WaitlistDoc = {
        email: 'test@example.com',
        name: 'John Doe',
        locale: 'en-US',
        utm: null,
        userAgent: null,
        ip: null,
        createdAt: new Date() as any,
        status: 'pending',
        comms: {
          confirmation: {
            sent: false,
            sentAt: null,
            messageId: null,
            error: null
          }
        },
        dedupeKey: 'test-dedupe-key',
        id: 'test-waitlist-id'
      };
      getWaitlistById.mockResolvedValue(mockWaitlistData);
      wasEmailSentRecently.mockResolvedValue(false);
      updateWaitlistConfirmation.mockResolvedValue(undefined);

      // Mock Resend
      const { createResendClient } = require('../lib/resend');
      const mockResendClient = {
        sendWaitlistConfirmationFn: jest.fn().mockResolvedValue({
          id: 'test-message-id',
          error: null
        })
      };
      createResendClient.mockReturnValue(mockResendClient);

      process.env.RESEND_API_KEY = 'test-api-key';
      process.env.FROM_EMAIL = 'test@example.com';
      process.env.FROM_NAME = 'Test Sender';
      process.env.APP_BASE_URL = 'https://calendado.com';

      await adminResendConfirmation(mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        waitlistId: 'test-waitlist-id',
        email: 'test@example.com',
        messageId: 'test-message-id',
        forced: false
      });
    });

    it('should reject non-admin user', async () => {
      const mockReq = {
        method: 'POST',
        headers: {
          authorization: 'Bearer non-admin-token'
        },
        body: {
          waitlistId: 'test-waitlist-id'
        }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const { getAuth } = require('firebase-admin/auth');
      const mockAuth = {
        verifyIdToken: jest.fn().mockResolvedValue({
          admin: false
        })
      };
      getAuth.mockReturnValue(mockAuth);

      await adminResendConfirmation(mockReq as any, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Admin access required' });
    });
  });
});
