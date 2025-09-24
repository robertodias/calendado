import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import ReCAPTCHA from 'react-google-recaptcha';
import { db } from '../firebase';
import { hasJoinedWaitlist, markWaitlistJoined } from '../lib/cookieUtils';
import { normalizeEmail, isValidEmailFormat } from '../lib/emailUtils';
import { generateDedupeKeySync } from '../lib/crypto';
import { useLanguage } from '../contexts/LanguageContext';
import '../lib/testUtils'; // Import test utilities for development

const Landing: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [hasJoined, setHasJoined] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [duplicateEmailError, setDuplicateEmailError] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [captchaTimeout, setCaptchaTimeout] = useState<NodeJS.Timeout | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  
  // Disable CAPTCHA for local development
  const isLocalDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

  // Check if user has already joined the waitlist on component mount
  useEffect(() => {
    setHasJoined(hasJoinedWaitlist());
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate email in real-time
    if (name === 'email') {
      setEmailTouched(true);
      if (value && !isValidEmailFormat(value)) {
        setEmailError(t('form.emailError'));
      } else {
        setEmailError('');
      }
    }
  };

  // Handle CAPTCHA verification
  const handleCaptchaChange = (value: string | null) => {
    console.log('CAPTCHA value received:', value);
    setCaptchaValue(value);
    setCaptchaError(false); // Clear error when CAPTCHA is completed
    
    // Clear timeout if CAPTCHA completes successfully
    if (captchaTimeout) {
      clearTimeout(captchaTimeout);
      setCaptchaTimeout(null);
    }
    
    // If CAPTCHA is completed and we're in the middle of submission, continue
    if (value && isSubmitting) {
      // Continue with the actual submission
      continueSubmission();
    }
  };

  // Handle CAPTCHA expiration
  const handleCaptchaExpired = () => {
    setCaptchaValue(null);
    setCaptchaError(true);
  };

  // Check if email already exists in Firestore
  const checkEmailExists = async (email: string): Promise<boolean> => {
    if (!db) {
      console.warn('Firestore not available for duplicate check');
      return false; // Allow submission if Firestore is not available
    }
    
    try {
      const normalizedEmail = normalizeEmail(email);
      const waitlistRef = collection(db, 'waitlist');
      const q = query(waitlistRef, where('email', '==', normalizedEmail));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking email:', error);
      // If there's a permission error or other issue, allow submission
      // This prevents the form from being completely blocked due to Firestore issues
      return false;
    }
  };

  // Continue with the actual form submission after CAPTCHA is completed
  const continueSubmission = async () => {
    try {
      // Normalize email for consistent storage
      const normalizedEmail = normalizeEmail(formData.email);
      
      // Debug Firebase configuration
      console.log('Firebase debug:', {
        db: !!db,
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        isDemoKey: import.meta.env.VITE_FIREBASE_API_KEY === 'demo-key',
        isLocalDev: isLocalDevelopment
      });
      
      // Check if Firebase is properly configured
      if (!db || !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === 'demo-key') {
        console.warn('Firebase not configured. Form data:', { ...formData, email: normalizedEmail });
        // Simulate success for development
        setTimeout(() => {
          setSubmitStatus('success');
          setFormData({ name: '', email: '' });
          setCaptchaValue(null);
          markWaitlistJoined(); // Set cookie to prevent future submissions
          setHasJoined(true);
          setIsSubmitting(false);
        }, 1000);
        return;
      }

      // Server-side CAPTCHA verification would go here in a real implementation
      // For now, we'll just validate on the client side
      
      console.log('Attempting to save to Firestore:', {
        name: formData.name,
        email: normalizedEmail,
        language,
        captchaVerified: true
      });
      
      const docRef = await addDoc(collection(db, 'waitlist'), {
        // Required by security rules
        email: normalizedEmail,
        createdAt: serverTimestamp(),
        status: 'pending',
        comms: {
          confirmation: {
            sent: false,
            sentAt: null,
            messageId: null,
            error: null
          }
        },
        dedupeKey: generateDedupeKeySync(normalizedEmail),

        // Optional fields (now allowed by security rules)
        name: formData.name || null,
        language,
        userAgent: navigator.userAgent,
        captchaVerified: true
      });
      
      console.log('Document written with ID: ', docRef.id);
      
      setSubmitStatus('success');
      setFormData({ name: '', email: '' });
      setCaptchaValue(null);
      markWaitlistJoined(); // Set cookie to prevent future submissions
      setHasJoined(true);
    } catch (error) {
      console.error('Error adding document: ', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setCaptchaError(false);
    setEmailError('');
    setDuplicateEmailError(false);

    // Validate email format
    if (!isValidEmailFormat(formData.email)) {
      setEmailError(t('form.emailError'));
      setIsSubmitting(false);
      return;
    }

    // Check if email already exists (only if Firebase is configured)
    if (db && import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_API_KEY !== 'demo-key') {
      setIsCheckingDuplicate(true);
      try {
        const emailExists = await checkEmailExists(formData.email);
        if (emailExists) {
          setDuplicateEmailError(true);
          setIsSubmitting(false);
          setIsCheckingDuplicate(false);
          return;
        }
      } catch (error) {
        console.error('Error during duplicate check:', error);
        // Continue with submission if duplicate check fails
      } finally {
        setIsCheckingDuplicate(false);
      }
    }

    // Skip CAPTCHA validation in local development
    if (isLocalDevelopment) {
      console.log('Local development - skipping CAPTCHA validation');
      setCaptchaValue('local-dev-bypass');
    } else if (!captchaValue) {
      // Execute invisible CAPTCHA only in production
      if (recaptchaRef.current) {
        try {
          recaptchaRef.current.execute();
          
          // Set a timeout fallback in case CAPTCHA doesn't respond
          const timeout = setTimeout(() => {
            console.warn('CAPTCHA timeout - proceeding without verification');
            setCaptchaValue('timeout-fallback');
            continueSubmission();
          }, 10000); // 10 second timeout
          
          setCaptchaTimeout(timeout);
          return; // The onChange handler will continue the submission
        } catch (error) {
          console.error('Error executing CAPTCHA:', error);
          setCaptchaError(true);
          setIsSubmitting(false);
          return;
        }
      } else {
        console.error('reCAPTCHA ref not available');
        setCaptchaError(true);
        setIsSubmitting(false);
        return;
      }
    }

    // If CAPTCHA is already completed, continue with submission
    continueSubmission();
  };

  // Language switching function
  const handleLanguageChange = (newLanguage: 'pt' | 'en') => {
    setLanguage(newLanguage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <div className="flex bg-white/10 backdrop-blur-sm rounded-full p-1">
          <button
            onClick={() => handleLanguageChange('pt')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              language === 'pt' 
                ? 'bg-white text-slate-900 shadow-lg' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            PT
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              language === 'en' 
                ? 'bg-white text-slate-900 shadow-lg' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                {t('hero')}
              </span>
            </h1>
            
            {/* Subtext */}
            <p className="text-xl sm:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              {t('subtext')}
            </p>
            
            {/* CTA Button - Only show if user hasn't joined yet */}
            {!hasJoined && (
              <button 
                onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-lg rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
              >
                {t('cta')}
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Waitlist Form Section */}
      <div id="waitlist-form" className="relative py-12 sm:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-white/20 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {t('form.title')}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full"></div>
            </div>

            {/* Show different content based on whether user has already joined */}
            {hasJoined ? (
              <div className="text-center py-12">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {t('form.alreadyJoined')}
                  </h3>
                  <p className="text-white/70 text-lg">
                    {t('form.waitlistUpdate')}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-500/20 border border-green-400/30 rounded-xl text-green-100 text-center">
                    {t('form.success')}
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl text-red-100 text-center">
                    {t('form.error')}
                  </div>
                )}

                {duplicateEmailError && (
                  <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-xl text-yellow-100 text-center">
                    {t('form.duplicateEmailError')}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2">
                  {t('form.name')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder={t('form.name')}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                  {t('form.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={() => setEmailTouched(true)}
                  required
                  autoComplete="email"
                  inputMode="email"
                  className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    emailError && emailTouched
                      ? 'border-red-400 focus:ring-red-500'
                      : 'border-white/20 focus:ring-purple-500'
                  }`}
                  placeholder={t('form.emailPlaceholder')}
                />
                {emailError && emailTouched && (
                  <p className="mt-2 text-sm text-red-400">
                    {emailError}
                  </p>
                )}
                {/* Removed provider-specific email normalization note */}
              </div>

              {/* CAPTCHA Section - Hidden in local development */}
              {!isLocalDevelopment && (
                <div>
                  <div className="flex justify-center overflow-hidden">
                    <div className="transform scale-90 sm:scale-100">
                      <ReCAPTCHA
                        ref={recaptchaRef}
                        sitekey="6Le6nNArAAAAANxArJSBlIZ1kGrtQ03N8Z1BkI2K"
                        onChange={handleCaptchaChange}
                        onExpired={handleCaptchaExpired}
                        theme="dark"
                        size="invisible"
                      />
                    </div>
                  </div>
                  {captchaError && (
                    <p className="mt-2 text-sm text-red-400 text-center">
                      {t('form.captchaError')}
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || isCheckingDuplicate}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed"
              >
                {isCheckingDuplicate ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {t('form.checkingEmail')}
                  </div>
                ) : isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {t('form.sending')}
                  </div>
                ) : (
                  t('form.submit')
                )}
              </button>
            </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-white/60 text-sm">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
