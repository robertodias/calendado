import { 
  sha256, 
  generateDedupeKey, 
  verifyResendSignature, 
  extractSignature,
  isValidEmail,
  normalizeEmail 
} from '../lib/crypto';

describe('Crypto utilities', () => {
  describe('sha256', () => {
    it('should generate correct SHA256 hash', () => {
      const input = 'test@example.com';
      const expected = '973dfe463ec85785f5f95af5ba3906eedb2d931c24e69824a89ea65dba4e813b';
      expect(sha256(input)).toBe(expected);
    });

    it('should generate different hashes for different inputs', () => {
      const input1 = 'test1@example.com';
      const input2 = 'test2@example.com';
      expect(sha256(input1)).not.toBe(sha256(input2));
    });
  });

  describe('generateDedupeKey', () => {
    it('should generate consistent dedupe keys for same email', () => {
      const email = 'Test@Example.COM';
      const key1 = generateDedupeKey(email);
      const key2 = generateDedupeKey(email);
      expect(key1).toBe(key2);
    });

    it('should generate same key for different case emails', () => {
      const email1 = 'test@example.com';
      const email2 = 'TEST@EXAMPLE.COM';
      const key1 = generateDedupeKey(email1);
      const key2 = generateDedupeKey(email2);
      expect(key1).toBe(key2);
    });

    it('should generate same key for emails with whitespace', () => {
      const email1 = 'test@example.com';
      const email2 = ' test@example.com ';
      const key1 = generateDedupeKey(email1);
      const key2 = generateDedupeKey(email2);
      expect(key1).toBe(key2);
    });
  });

  describe('verifyResendSignature', () => {
    it('should verify valid signature', () => {
      const payload = '{"test": "data"}';
      const secret = 'test-secret';
      // const signature = 'a1b2c3d4e5f6'; // This would be the actual HMAC in real usage
      
      // Mock the HMAC creation for testing
      const crypto = require('crypto');
      const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
      
      expect(verifyResendSignature(payload, expectedSignature, secret)).toBe(true);
    });

    it('should reject invalid signature', () => {
      const payload = '{"test": "data"}';
      const secret = 'test-secret';
      const invalidSignature = 'invalid-signature';
      
      expect(verifyResendSignature(payload, invalidSignature, secret)).toBe(false);
    });
  });

  describe('extractSignature', () => {
    it('should extract signature from valid Bearer token', () => {
      const authHeader = 'Bearer test-signature';
      expect(extractSignature(authHeader)).toBe('test-signature');
    });

    it('should return null for invalid header format', () => {
      expect(extractSignature('Invalid header')).toBeNull();
      expect(extractSignature('')).toBeNull();
      expect(extractSignature('Basic token')).toBeNull();
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('normalizeEmail', () => {
    it('should normalize email to lowercase', () => {
      expect(normalizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
    });

    it('should trim whitespace', () => {
      expect(normalizeEmail(' test@example.com ')).toBe('test@example.com');
    });

    it('should handle empty string', () => {
      expect(normalizeEmail('')).toBe('');
    });
  });
});
