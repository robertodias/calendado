/**
 * Waitlist signup form component
 *
 * Handles form submission, validation, and user feedback
 */

import React, { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  validateWaitlistData,
  createDebouncedValidator,
} from '../../lib/validation';
import { createValidationError, logError } from '../../lib/errorHandler';
import { signupForWaitlist } from '../../lib/waitlistUtils';
import { markWaitlistJoined } from '../../lib/cookieUtils';

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
  const isLocalDevelopment =
    import.meta.env.DEV || window.location.hostname === 'localhost';

  // Debounced email validation
  const debouncedEmailValidator = createDebouncedValidator((email: string) => {
    const result = validateWaitlistData({ email, name: formData.name });
    return {
      isValid: result.isValid,
      errors: result.errors.filter(error => error.includes('Email')),
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
      debouncedEmailValidator(value, result => {
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
        locale: t('locale') as 'en-US' | 'pt-BR' | 'it-IT',
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
        utm: getUtmParams(),
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
    <div className='relative'>
      {/* Clean minimal glassmorphism card */}
      <div className='relative bg-slate-800/40 backdrop-blur-2xl rounded-3xl p-8 border border-slate-600/40 shadow-2xl shadow-purple-500/10'>
        {/* Subtle gradient overlay */}
        <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-3xl' />

        {/* Form content */}
        <div className='relative z-10'>
          <form onSubmit={handleSubmit} className='space-y-8'>
            {/* Modern input fields */}
            <div className='space-y-6'>
              <div className='group'>
                <label className='block text-sm font-medium text-slate-300 mb-3 transition-colors group-focus-within:text-white'>
                  {t('form.nameLabel') || 'Full Name'}
                </label>
                <div className='relative'>
                  <input
                    type='text'
                    name='name'
                    placeholder={t('form.namePlaceholder')}
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    required
                    className='w-full h-14 px-6 bg-slate-700/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed'
                  />
                  <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none' />
                </div>
                {errors.name && (
                  <p className='mt-2 text-sm text-red-400 flex items-center'>
                    <svg
                      className='w-4 h-4 mr-1'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                        clipRule='evenodd'
                      />
                    </svg>
                    {errors.name}
                  </p>
                )}
              </div>

              <div className='group'>
                <label className='block text-sm font-medium text-slate-300 mb-3 transition-colors group-focus-within:text-white'>
                  {t('form.emailLabel') || 'Email Address'}
                </label>
                <div className='relative'>
                  <input
                    type='email'
                    name='email'
                    placeholder={t('form.emailPlaceholder')}
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    required
                    className='w-full h-14 px-6 bg-slate-700/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed'
                  />
                  <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none' />
                </div>
                {errors.email && (
                  <p className='mt-2 text-sm text-red-400 flex items-center'>
                    <svg
                      className='w-4 h-4 mr-1'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                        clipRule='evenodd'
                      />
                    </svg>
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* CAPTCHA */}
            {!isLocalDevelopment && (
              <div className='flex justify-center'>
                <div className='transform scale-90'>
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={
                      import.meta.env.VITE_RECAPTCHA_SITE_KEY || 'demo-key'
                    }
                    onChange={handleCaptchaChange}
                    onExpired={() => setCaptchaValue(null)}
                    onError={() => setCaptchaError(true)}
                  />
                </div>
                {captchaError && (
                  <p className='text-red-400 text-sm mt-2 flex items-center'>
                    <svg
                      className='w-4 h-4 mr-1'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                        clipRule='evenodd'
                      />
                    </svg>
                    {t('form.captchaError')}
                  </p>
                )}
              </div>
            )}

            {/* General errors */}
            {errors.general && (
              <div className='text-red-400 text-sm text-center flex items-center justify-center'>
                <svg
                  className='w-4 h-4 mr-2'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
                {errors.general}
              </div>
            )}

            {/* Modern submit button */}
            <button
              type='submit'
              disabled={isSubmitting || (!isLocalDevelopment && !captchaValue)}
              className='group relative w-full h-16 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-semibold text-lg rounded-2xl transition-all duration-300 shadow-2xl shadow-purple-600/25 hover:shadow-3xl hover:shadow-purple-600/40 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 overflow-hidden'
            >
              <span className='relative z-10 flex items-center justify-center'>
                {isSubmitting ? (
                  <>
                    <svg
                      className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                    {t('form.submitting')}
                  </>
                ) : (
                  <>
                    {t('form.submit')}
                    <svg
                      className='ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M13 7l5 5m0 0l-5 5m5-5H6'
                      />
                    </svg>
                  </>
                )}
              </span>
              <div className='absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WaitlistForm;
