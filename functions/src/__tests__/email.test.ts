import { 
  buildWaitlistConfirmationEmail, 
  validateEmailTemplateData 
} from '../lib/email';
import type { Locale } from '../types/models';

describe('Email utilities', () => {
  describe('buildWaitlistConfirmationEmail', () => {
    const testEmail = 'test@example.com';
    const testName = 'John Doe';
    const testAppBaseUrl = 'https://calendado.com';

    it('should build email template for en-US locale', () => {
      const template = buildWaitlistConfirmationEmail(
        testEmail,
        testName,
        'en-US' as Locale,
        testAppBaseUrl
      );

      expect(template.subject).toBe("You're on the Calendado waitlist 🎉");
      expect(template.html).toContain('Hi John Doe');
      expect(template.html).toContain('test@example.com');
      expect(template.html).toContain('https://calendado.com/privacy');
    });

    it('should build email template for pt-BR locale', () => {
      const template = buildWaitlistConfirmationEmail(
        testEmail,
        testName,
        'pt-BR' as Locale,
        testAppBaseUrl
      );

      expect(template.subject).toBe('Você entrou na lista de espera do Calendado 🎉');
      expect(template.html).toContain('Olá John Doe');
      expect(template.html).toContain('test@example.com');
    });

    it('should build email template for it-IT locale', () => {
      const template = buildWaitlistConfirmationEmail(
        testEmail,
        testName,
        'it-IT' as Locale,
        testAppBaseUrl
      );

      expect(template.subject).toBe("Sei nella lista d'attesa di Calendado 🎉");
      expect(template.html).toContain('Ciao John Doe');
      expect(template.html).toContain('test@example.com');
    });

    it('should fallback to en-US for unsupported locale', () => {
      const template = buildWaitlistConfirmationEmail(
        testEmail,
        testName,
        'fr-FR' as Locale,
        testAppBaseUrl
      );

      expect(template.subject).toBe("You're on the Calendado waitlist 🎉");
      expect(template.html).toContain('Hi John Doe');
    });

    it('should handle null name with fallback', () => {
      const template = buildWaitlistConfirmationEmail(
        testEmail,
        null,
        'en-US' as Locale,
        testAppBaseUrl
      );

      expect(template.html).toContain('Hi there');
    });

    it('should include all expected sections in HTML', () => {
      const template = buildWaitlistConfirmationEmail(
        testEmail,
        testName,
        'en-US' as Locale,
        testAppBaseUrl
      );

      expect(template.html).toContain('<!DOCTYPE html>');
      expect(template.html).toContain('<html');
      expect(template.html).toContain('<head>');
      expect(template.html).toContain('<body>');
      expect(template.html).toContain('Calendado');
      expect(template.html).toContain('What\'s coming in Calendado');
      expect(template.html).toContain('Privacy Policy');
    });
  });

  describe('validateEmailTemplateData', () => {
    it('should validate correct data', () => {
      const result = validateEmailTemplateData(
        'test@example.com',
        'John Doe',
        'en-US' as Locale
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate data with null name and locale', () => {
      const result = validateEmailTemplateData(
        'test@example.com',
        null,
        null
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid email', () => {
      const result = validateEmailTemplateData(
        'invalid-email',
        'John Doe',
        'en-US' as Locale
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email must be a valid email address');
    });

    it('should reject missing email', () => {
      const result = validateEmailTemplateData(
        '',
        'John Doe',
        'en-US' as Locale
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email is required and must be a string');
    });

    it('should reject non-string name', () => {
      const result = validateEmailTemplateData(
        'test@example.com',
        123 as any,
        'en-US' as Locale
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name must be null or a string');
    });

    it('should reject non-string locale', () => {
      const result = validateEmailTemplateData(
        'test@example.com',
        'John Doe',
        123 as any
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Locale must be null or a string');
    });
  });
});
