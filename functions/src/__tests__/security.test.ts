/**
 * Security tests for Firebase Functions
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Request, Response } from 'firebase-functions/v1';
import { 
  checkRateLimit, 
  getClientIP, 
  sanitizeLogData, 
  validateRequestSize, 
  isSuspiciousRequest,
  validateWebhookPayload 
} from '../lib/security';
import { validateEmail, validateName, validateLocale, validateUtmData } from '../lib/validation';

// Mock Request and Response objects
const createMockRequest = (overrides: Partial<Request> = {}): Request => ({
  method: 'POST',
  headers: {},
  body: {},
  ip: '127.0.0.1',
  ...overrides
} as Request);

const createMockResponse = (): Response => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
};

describe('Security Utilities', () => {
  beforeEach(() => {
    // Clear rate limit store before each test
    jest.clearAllMocks();
  });

  describe('checkRateLimit', () => {
    it('should allow requests within rate limit', () => {
      const identifier = 'test-user';
      const config = { windowMs: 1000, maxRequests: 5 };
      
      // First 5 requests should be allowed
      for (let i = 0; i < 5; i++) {
        expect(checkRateLimit(identifier, config)).toBe(true);
      }
    });

    it('should block requests exceeding rate limit', () => {
      const identifier = 'test-user';
      const config = { windowMs: 1000, maxRequests: 3 };
      
      // First 3 requests should be allowed
      for (let i = 0; i < 3; i++) {
        expect(checkRateLimit(identifier, config)).toBe(true);
      }
      
      // 4th request should be blocked
      expect(checkRateLimit(identifier, config)).toBe(false);
    });

    it('should reset rate limit after window expires', async () => {
      const identifier = 'test-user';
      const config = { windowMs: 100, maxRequests: 2 };
      
      // Use up the rate limit
      expect(checkRateLimit(identifier, config)).toBe(true);
      expect(checkRateLimit(identifier, config)).toBe(true);
      expect(checkRateLimit(identifier, config)).toBe(false);
      
      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should be allowed again
      expect(checkRateLimit(identifier, config)).toBe(true);
    });
  });

  describe('getClientIP', () => {
    it('should return CF-Connecting-IP if available', () => {
      const req = createMockRequest({
        headers: { 'cf-connecting-ip': '1.2.3.4' }
      });
      expect(getClientIP(req)).toBe('1.2.3.4');
    });

    it('should return X-Real-IP if CF-Connecting-IP is not available', () => {
      const req = createMockRequest({
        headers: { 'x-real-ip': '5.6.7.8' }
      });
      expect(getClientIP(req)).toBe('5.6.7.8');
    });

    it('should return first IP from X-Forwarded-For', () => {
      const req = createMockRequest({
        headers: { 'x-forwarded-for': '9.10.11.12, 13.14.15.16' }
      });
      expect(getClientIP(req)).toBe('9.10.11.12');
    });

    it('should return req.ip as fallback', () => {
      const req = createMockRequest({ ip: '192.168.1.1' });
      expect(getClientIP(req)).toBe('192.168.1.1');
    });
  });

  describe('sanitizeLogData', () => {
    it('should redact sensitive fields', () => {
      const data = {
        email: 'test@example.com',
        password: 'secret123',
        token: 'abc123',
        name: 'John Doe'
      };
      
      const sanitized = sanitizeLogData(data);
      
      expect(sanitized.email).toBe('test@example.com');
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.token).toBe('[REDACTED]');
      expect(sanitized.name).toBe('John Doe');
    });

    it('should handle null and undefined values', () => {
      expect(sanitizeLogData(null)).toBe(null);
      expect(sanitizeLogData(undefined)).toBe(undefined);
      expect(sanitizeLogData('string')).toBe('string');
    });
  });

  describe('validateRequestSize', () => {
    it('should allow requests within size limit', () => {
      const req = createMockRequest({
        headers: { 'content-length': '1000' }
      });
      expect(validateRequestSize(req, 2000)).toBe(true);
    });

    it('should reject requests exceeding size limit', () => {
      const req = createMockRequest({
        headers: { 'content-length': '5000' }
      });
      expect(validateRequestSize(req, 2000)).toBe(false);
    });

    it('should allow requests without content-length header', () => {
      const req = createMockRequest({ headers: {} });
      expect(validateRequestSize(req, 1000)).toBe(true);
    });
  });

  describe('isSuspiciousRequest', () => {
    it('should detect bot user agents', () => {
      const req = createMockRequest({
        headers: { 'user-agent': 'Googlebot/2.1' }
      });
      expect(isSuspiciousRequest(req)).toBe(true);
    });

    it('should detect missing user agent', () => {
      const req = createMockRequest({ headers: {} });
      expect(isSuspiciousRequest(req)).toBe(true);
    });

    it('should detect short user agent', () => {
      const req = createMockRequest({
        headers: { 'user-agent': 'bot' }
      });
      expect(isSuspiciousRequest(req)).toBe(true);
    });

    it('should allow normal user agents', () => {
      const req = createMockRequest({
        headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      expect(isSuspiciousRequest(req)).toBe(false);
    });
  });

  describe('validateWebhookPayload', () => {
    it('should validate correct webhook payload', () => {
      const payload = {
        type: 'email.delivered',
        data: { messageId: '123', email: 'test@example.com' }
      };
      expect(validateWebhookPayload(payload)).toBe(true);
    });

    it('should reject invalid payload structure', () => {
      expect(validateWebhookPayload(null)).toBe(false);
      expect(validateWebhookPayload({})).toBe(false);
      expect(validateWebhookPayload({ type: 'test' })).toBe(false);
    });

    it('should reject oversized payloads', () => {
      const largePayload = {
        type: 'email.delivered',
        data: { messageId: '123', email: 'test@example.com', largeField: 'x'.repeat(10000) }
      };
      expect(validateWebhookPayload(largePayload)).toBe(false);
    });
  });
});

describe('Input Validation', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name+tag@domain.co.uk',
        'user@sub.domain.com'
      ];
      
      validEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@domain',
        ''
      ];
      
      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it('should reject non-string inputs', () => {
      const result = validateEmail(123);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email must be a string');
    });
  });

  describe('validateName', () => {
    it('should validate correct names', () => {
      const validNames = ['John Doe', 'Jane', null, undefined];
      
      validNames.forEach(name => {
        const result = validateName(name);
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject names with invalid characters', () => {
      const invalidNames = ['John<script>', 'Jane&Co', 'Test<tag>'];
      
      invalidNames.forEach(name => {
        const result = validateName(name);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Name contains invalid characters');
      });
    });
  });

  describe('validateLocale', () => {
    it('should validate correct locales', () => {
      const validLocales = ['en-US', 'pt-BR', 'it-IT', null, undefined];
      
      validLocales.forEach(locale => {
        const result = validateLocale(locale);
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject invalid locales', () => {
      const invalidLocales = ['en', 'pt', 'invalid', 'en-us'];
      
      invalidLocales.forEach(locale => {
        const result = validateLocale(locale);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Invalid locale');
      });
    });
  });

  describe('validateUtmData', () => {
    it('should validate correct UTM data', () => {
      const validUtm = {
        source: 'google',
        medium: 'cpc',
        campaign: 'summer-sale'
      };
      
      const result = validateUtmData(validUtm);
      expect(result.isValid).toBe(true);
    });

    it('should reject UTM data with invalid characters', () => {
      const invalidUtm = {
        source: 'google<script>',
        medium: 'cpc&tag',
        campaign: 'summer<tag>'
      };
      
      const result = validateUtmData(invalidUtm);
      expect(result.isValid).toBe(false);
    });

    it('should accept null UTM data', () => {
      const result = validateUtmData(null);
      expect(result.isValid).toBe(true);
    });
  });
});
