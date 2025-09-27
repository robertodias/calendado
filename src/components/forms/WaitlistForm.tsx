/**
 * Waitlist signup form component
 * 
 * Handles form submission, validation, and user feedback
 */

import React, { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useLanguage } from '../../contexts/LanguageContext';
import { validateWaitlistData, createDebouncedValidator } from '../../lib/validation';
import { createValidationError, logError } from '../../lib/errorHandler';
import { signupForWaitlist } from '../../lib/waitlistUtils';
import { markWaitlistJoined } from '../../lib/cookieUtils';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface WaitlistFormProps {
  onSuccess: (waitlistId: string) => void;
  onError: (error: string) => void;
}

interface FormData {
  name: string;
  email: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  general?: string;
}

const WaitlistForm: React.FC<WaitlistFormProps> = ({ onSuccess, onError }) => {
  const { t } = useLanguage();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState(false);
  
  // Disable CAPTCHA for local development
  const isLocalDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

  // Debounced email validation
  const debouncedEmailValidator = createDebouncedValidator((email: string) => {
    const result = validateWaitlistData({ email, name: formData.name });
    return {
      isValid: result.isValid,
      errors: result.errors.filter(error => error.includes('Email'))
    };
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Real-time email validation
    if (name === 'email') {
      debouncedEmailValidator(value, (result) => {
        if (!result.isValid) {
          setErrors(prev => ({ ...prev, email: result.errors[0] }));
        } else {
          setErrors(prev => ({ ...prev, email: undefined }));
        }
      });
    }
  };

  const handleCaptchaChange = (value: string | null) => {
    setCaptchaValue(value);
    setCaptchaError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setCaptchaError(false);

    try {
      // Validate form data
      const validation = validateWaitlistData({
        email: formData.email,
        name: formData.name,
        locale: t('locale') as 'en-US' | 'pt-BR' | 'it-IT'
      });

      if (!validation.isValid) {
        const fieldErrors: FormErrors = {};
        validation.errors.forEach(error => {
          if (error.includes('Email')) fieldErrors.email = error;
          if (error.includes('Name')) fieldErrors.name = error;
        });
        setErrors(fieldErrors);
        return;
      }

      // Skip CAPTCHA validation in local development
      if (!isLocalDevelopment && !captchaValue) {
        setCaptchaError(true);
        return;
      }

      // Submit to waitlist
      const result = await signupForWaitlist({
        email: formData.email,
        name: formData.name,
        locale: t('locale') as 'en-US' | 'pt-BR' | 'it-IT',
        utm: getUtmParams()
      });

      if (result.success && result.waitlistId) {
        markWaitlistJoined();
        onSuccess(result.waitlistId);
      } else {
        throw createValidationError(result.error || 'Failed to join waitlist');
      }
    } catch (error) {
      logError(error, 'WaitlistForm.submit');
      onError(getErrorDisplayMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getErrorDisplayMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unexpected error occurred';
  };

  const getUtmParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      source: urlParams.get('utm_source') || undefined,
      medium: urlParams.get('utm_medium') || undefined,
      campaign: urlParams.get('utm_campaign') || undefined,
    };
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Input
            type="text"
            name="name"
            placeholder={t('form.namePlaceholder')}
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            disabled={isSubmitting}
            required
          />
        </div>
        
        <div>
          <Input
            type="email"
            name="email"
            placeholder={t('form.emailPlaceholder')}
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      {!isLocalDevelopment && (
        <div className="flex justify-center">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || 'demo-key'}
            onChange={handleCaptchaChange}
            onExpired={() => setCaptchaValue(null)}
            onError={() => setCaptchaError(true)}
          />
          {captchaError && (
            <p className="text-red-500 text-sm mt-2">
              {t('form.captchaError')}
            </p>
          )}
        </div>
      )}

      {errors.general && (
        <div className="text-red-500 text-sm text-center">
          {errors.general}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={isSubmitting || (!isLocalDevelopment && !captchaValue)}
        className="w-full"
      >
        {isSubmitting ? t('form.submitting') : t('form.submit')}
      </Button>
    </form>
  );
};

export default WaitlistForm;
