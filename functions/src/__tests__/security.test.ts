import { rateLimit, waitlistRateLimit, clearRateLimit } from '../lib/rateLimiter';
import { sanitizeString, sanitizeEmail, sanitizeName, isValidEmail, isValidName, isValidLocale } from '../lib/sanitizer';

describe('Security Tests', () => {
  beforeEach(() => {
    clearRateLimit();
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', () => {
      const mockReq = { headers: { 'x-forwarded-for': '192.168.1.1' } };
      const mockRes = { 
        status: jest.fn().mockReturnThis(), 
        json: jest.fn(),
        set: jest.fn()
      };
      
      const middleware = rateLimit({ windowMs: 60000, maxRequests: 5 });
      let nextCalled = false;
      
      middleware(mockReq as any, mockRes as any, () => { nextCalled = true; });
      
      expect(nextCalled).toBe(true);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should block requests exceeding rate limit', () => {
      const mockReq = { headers: { 'x-forwarded-for': '192.168.1.1' } };
      const mockRes = { 
        status: jest.fn().mockReturnThis(), 
        json: jest.fn(),
        set: jest.fn()
      };
      
      const middleware = rateLimit({ windowMs: 60000, maxRequests: 3 });
      
      // Make 4 requests (exceeding limit)
      for (let i = 0; i < 4; i++) {
        let nextCalled = false;
        middleware(mockReq as any, mockRes as any, () => { nextCalled = true; });
        
        if (i < 3) {
          expect(nextCalled).toBe(true);
        } else {
          expect(nextCalled).toBe(false);
          expect(mockRes.status).toHaveBeenCalledWith(429);
        }
      }
    });

    it('should use custom key generator for waitlist rate limit', () => {
      const mockReq = { 
        headers: { 'x-forwarded-for': '192.168.1.1' },
        body: { email: 'test@example.com' }
      };
      const mockRes = { 
        status: jest.fn().mockReturnThis(), 
        json: jest.fn(),
        set: jest.fn()
      };
      
      let nextCalled = false;
      waitlistRateLimit(mockReq as any, mockRes as any, () => { nextCalled = true; });
      
      expect(nextCalled).toBe(true);
    });
  });

  describe('Input Sanitization', () => {
    describe('sanitizeString', () => {
      it('should sanitize malicious input', () => {
        const maliciousInput = '<script>alert("xss")</script>test@example.com';
        const sanitized = sanitizeString(maliciousInput);
        expect(sanitized).toBe('test@example.com');
      });

      it('should trim whitespace and limit length', () => {
        const input = '  ' + 'a'.repeat(2000) + '  ';
        const sanitized = sanitizeString(input);
        expect(sanitized).toHaveLength(1000);
        expect(sanitized).not.toMatch(/^\s/);
      });

      it('should remove event handlers', () => {
        const input = 'test onclick="alert(1)" onload="malicious()"';
        const sanitized = sanitizeString(input);
        expect(sanitized).toBe('test ');
      });
    });

    describe('sanitizeEmail', () => {
      it('should normalize email addresses', () => {
        const email = '  TEST@EXAMPLE.COM  ';
        const sanitized = sanitizeEmail(email);
        expect(sanitized).toBe('test@example.com');
      });

      it('should remove invalid characters', () => {
        const email = 'test<script>@example.com';
        const sanitized = sanitizeEmail(email);
        expect(sanitized).toBe('test@example.com');
      });

      it('should limit email length', () => {
        const email = 'a'.repeat(300) + '@example.com';
        const sanitized = sanitizeEmail(email);
        expect(sanitized.length).toBeLessThanOrEqual(254);
      });
    });

    describe('sanitizeName', () => {
      it('should sanitize name input', () => {
        const name = '<script>alert("xss")</script>John Doe';
        const sanitized = sanitizeName(name);
        expect(sanitized).toBe('John Doe');
      });

      it('should return null for empty input', () => {
        expect(sanitizeName('')).toBeNull();
        expect(sanitizeName(null)).toBeNull();
        expect(sanitizeName(undefined as any)).toBeNull();
      });
    });

    describe('Validation Functions', () => {
      it('should validate email addresses', () => {
        expect(isValidEmail('test@example.com')).toBe(true);
        expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
        expect(isValidEmail('user+tag@example.org')).toBe(true);
        expect(isValidEmail('invalid-email')).toBe(false);
        expect(isValidEmail('@example.com')).toBe(false);
        expect(isValidEmail('test@')).toBe(false);
        expect(isValidEmail('')).toBe(false);
      });

      it('should validate names', () => {
        expect(isValidName('John Doe')).toBe(true);
        expect(isValidName('José María')).toBe(true);
        expect(isValidName('')).toBe(false);
        expect(isValidName('a'.repeat(101))).toBe(false);
        expect(isValidName('<script>')).toBe(false);
      });

      it('should validate locales', () => {
        expect(isValidLocale('en-US')).toBe(true);
        expect(isValidLocale('pt-BR')).toBe(true);
        expect(isValidLocale('it-IT')).toBe(true);
        expect(isValidLocale('fr-FR')).toBe(false);
        expect(isValidLocale('invalid')).toBe(false);
      });
    });
  });
});