/**
 * Unit tests for invite consumption Cloud Function
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { consumeInvite } from '../invite';

// Mock Firebase Admin
jest.mock('firebase-admin/firestore');
jest.mock('firebase-admin/auth');

const mockDoc = {
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  id: 'test-doc-id',
};

const mockCollection = {
  doc: jest.fn(() => mockDoc),
  add: jest.fn(),
};

const mockFirestore = {
  collection: jest.fn(() => mockCollection),
  doc: jest.fn(() => mockDoc),
  runTransaction: jest.fn((callback: any) => callback(mockTransaction)),
};

const mockTransaction = {
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
};

const mockGetUser = jest.fn();
const mockGetUserByEmail = jest.fn();
const mockCreateUser = jest.fn();
const mockSetCustomUserClaims = jest.fn();

// Mock the Firestore instance
(getFirestore as jest.Mock).mockReturnValue(mockFirestore);

// Mock auth functions
(getAuth as jest.Mock).mockReturnValue({
  getUser: mockGetUser,
  getUserByEmail: mockGetUserByEmail,
  createUser: mockCreateUser,
  setCustomUserClaims: mockSetCustomUserClaims,
});

// Mock the tokens module
jest.mock('../tokens', () => ({
  validateMagicLinkToken: jest.fn(),
}));

import { validateMagicLinkToken } from '../tokens';

describe('Invite Consumption Function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDoc.get.mockReset();
    mockDoc.set.mockReset();
    mockDoc.update.mockReset();
    mockCollection.doc.mockReset().mockImplementation(() => mockDoc);
    mockFirestore.collection.mockReset().mockImplementation(() => mockCollection);
    mockFirestore.doc.mockReset().mockImplementation(() => mockDoc);
    mockFirestore.runTransaction.mockReset().mockImplementation((callback: any) => callback(mockTransaction));
    mockTransaction.get.mockReset();
    mockTransaction.set.mockReset();
    mockTransaction.update.mockReset();
    mockGetUser.mockReset();
    mockGetUserByEmail.mockReset();
    mockCreateUser.mockReset();
    mockSetCustomUserClaims.mockReset();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Function Exports', () => {
    test('should export consumeInvite function', () => {
      expect(consumeInvite).toBeDefined();
    });
  });

  describe('Function Configuration', () => {
    test('consumeInvite should be configured as HTTP function', () => {
      expect(consumeInvite).toBeDefined();
      expect(typeof consumeInvite).toBe('function');
    });
  });

  describe('Request Validation', () => {
    test('should reject non-POST requests', async () => {
      const mockReq = {
        method: 'GET',
        body: { token: 'valid-token' },
        rawBody: Buffer.from('{}'),
      } as any;

      const mockRes = {
        set: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        end: jest.fn(),
      } as any;

      await consumeInvite(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Method not allowed. Use POST.',
      });
    });

    test('should handle OPTIONS requests for CORS', async () => {
      const mockReq = {
        method: 'OPTIONS',
        body: {},
        rawBody: Buffer.from('{}'),
      } as any;

      const mockRes = {
        set: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        end: jest.fn(),
      } as any;

      await consumeInvite(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.end).toHaveBeenCalled();
    });

    test('should reject requests without token', async () => {
      const mockReq = {
        method: 'POST',
        body: {},
      } as Request;

      const mockRes = {
        set: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await consumeInvite(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Token is required and must be a string.',
      });
    });

    test('should reject requests with invalid token type', async () => {
      const mockReq = {
        method: 'POST',
        body: { token: 123 },
      } as Request;

      const mockRes = {
        set: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await consumeInvite(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Token is required and must be a string.',
      });
    });
  });

  describe('Token Validation', () => {
    test('should reject invalid tokens', async () => {
      (validateMagicLinkToken as jest.Mock).mockReturnValue({
        success: false,
        valid: false,
        error: 'Invalid token',
      });

      const mockReq = {
        method: 'POST',
        body: { token: 'invalid-token' },
      } as Request;

      const mockRes = {
        set: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await consumeInvite(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid or expired token.',
      });
    });

    test('should reject non-invite tokens', async () => {
      (validateMagicLinkToken as jest.Mock).mockReturnValue({
        success: true,
        valid: true,
        payload: {
          inviteId: 'invite-123',
          email: 'test@example.com',
          type: 'password_reset',
        },
      });

      const mockReq = {
        method: 'POST',
        body: { token: 'valid-token' },
      } as Request;

      const mockRes = {
        set: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await consumeInvite(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid token type. This endpoint only handles invitation tokens.',
      });
    });
  });

  describe('Invite Validation', () => {
    test('should reject non-existent invites', async () => {
      (validateMagicLinkToken as jest.Mock).mockReturnValue({
        success: true,
        valid: true,
        payload: {
          inviteId: 'non-existent',
          email: 'test@example.com',
          type: 'invite',
        },
      });

      mockDoc.get.mockResolvedValue({ exists: false });

      const mockReq = {
        method: 'POST',
        body: { token: 'valid-token' },
      } as Request;

      const mockRes = {
        set: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await consumeInvite(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invitation not found.',
      });
    });

    test('should reject already used invites', async () => {
      (validateMagicLinkToken as jest.Mock).mockReturnValue({
        success: true,
        valid: true,
        payload: {
          inviteId: 'used-invite',
          email: 'test@example.com',
          type: 'invite',
        },
      });

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => ({
          id: 'used-invite',
          email: 'test@example.com',
          status: 'used',
          usedAt: new Date(),
        }),
      });

      const mockReq = {
        method: 'POST',
        body: { token: 'valid-token' },
      } as Request;

      const mockRes = {
        set: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await consumeInvite(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'This invitation has already been used.',
      });
    });

    test('should reject expired invites', async () => {
      (validateMagicLinkToken as jest.Mock).mockReturnValue({
        success: true,
        valid: true,
        payload: {
          inviteId: 'expired-invite',
          email: 'test@example.com',
          type: 'invite',
        },
      });

      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1); // Yesterday

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => ({
          id: 'expired-invite',
          email: 'test@example.com',
          status: 'pending',
          expiresAt: { toDate: () => expiredDate },
        }),
      });

      const mockReq = {
        method: 'POST',
        body: { token: 'valid-token' },
      } as Request;

      const mockRes = {
        set: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await consumeInvite(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'This invitation has expired.',
      });
    });
  });

  describe('Type Definitions', () => {
    test('should have correct request/response types', () => {
      // This test primarily ensures that the TypeScript definitions compile correctly.
      type ConsumeRequest = Parameters<typeof consumeInvite>[0]['body'];
      type ConsumeResponse = Awaited<ReturnType<typeof consumeInvite>>;

      const request: ConsumeRequest = {
        token: 'test-token',
        userData: {
          displayName: 'Test User',
          preferences: { theme: 'dark' },
        },
      };

      expect(request).toBeDefined();
    });
  });
});
