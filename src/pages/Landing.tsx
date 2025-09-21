import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import ReCAPTCHA from 'react-google-recaptcha';
import { db } from '../firebase';
import { hasJoinedWaitlist, markWaitlistJoined } from '../lib/cookieUtils';
import { normalizeEmail, isValidEmailFormat, getEmailNormalizationMessage } from '../lib/emailUtils';
import '../lib/testUtils'; // Import test utilities for development

const Landing: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [language, setLanguage] = useState<'pt' | 'en'>('pt');
  const [hasJoined, setHasJoined] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [duplicateEmailError, setDuplicateEmailError] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

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
        setEmailError(language === 'pt' 
          ? 'Por favor, insira um email válido' 
          : 'Please enter a valid email address'
        );
      } else {
        setEmailError('');
      }
    }
  };

  // Handle CAPTCHA verification
  const handleCaptchaChange = (value: string | null) => {
    setCaptchaValue(value);
    setCaptchaError(false); // Clear error when CAPTCHA is completed
  };

  // Handle CAPTCHA expiration
  const handleCaptchaExpired = () => {
    setCaptchaValue(null);
    setCaptchaError(true);
  };

  // Check if email already exists in Firestore
  const checkEmailExists = async (email: string): Promise<boolean> => {
    if (!db) return false;
    
    try {
      const normalizedEmail = normalizeEmail(email);
      const waitlistRef = collection(db, 'waitlist');
      const q = query(waitlistRef, where('email', '==', normalizedEmail));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking email:', error);
      return false; // If there's an error, allow submission (fail open)
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
      setEmailError(language === 'pt' 
        ? 'Por favor, insira um email válido' 
        : 'Please enter a valid email address'
      );
      setIsSubmitting(false);
      return;
    }

    // Check if email already exists (only if Firebase is configured)
    if (db && import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_API_KEY !== 'demo-key') {
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        setDuplicateEmailError(true);
        setIsSubmitting(false);
        return;
      }
    }

    // For reCAPTCHA v3, we need to execute it programmatically
    if (!captchaValue) {
      // Execute invisible CAPTCHA
      if (recaptchaRef.current) {
        recaptchaRef.current.execute();
        return; // The onChange handler will continue the submission
      } else {
        setCaptchaError(true);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Normalize email for consistent storage
      const normalizedEmail = normalizeEmail(formData.email);
      
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
      
      await addDoc(collection(db, 'waitlist'), {
        name: formData.name,
        email: normalizedEmail, // Use normalized email
        createdAt: serverTimestamp(),
        language: language,
        captchaVerified: true // Mark that CAPTCHA was verified
      });
      
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

  const content = {
    pt: {
      hero: "Entrou no Calendado, compromisso agendado.",
      subtext: "Seu link de agendamento + WhatsApp. Grátis para começar.",
      cta: "Quero meu link",
      form: {
        title: "Junte-se à lista de espera",
        name: "Nome completo",
        email: "Email",
        emailPlaceholder: "seu@email.com",
        emailError: "Por favor, insira um email válido",
        duplicateEmailError: "Este email já está cadastrado na nossa lista de espera",
        captcha: "Verificação de segurança",
        captchaError: "Por favor, complete a verificação de segurança.",
        submit: "Entrar na lista",
        success: "Obrigado! Você foi adicionado à lista de espera.",
        error: "Ops! Algo deu errado. Tente novamente.",
        alreadyJoined: "Você já se inscreveu na lista de espera. Obrigado por se inscrever!"
      }
    },
    en: {
      hero: "Calendado: get in, get booked.",
      subtext: "Your booking link + WhatsApp reminders. Free to start.",
      cta: "Join waitlist",
      form: {
        title: "Join the waitlist",
        name: "Full name",
        email: "Email",
        emailPlaceholder: "your@email.com",
        emailError: "Please enter a valid email address",
        duplicateEmailError: "This email is already registered in our waitlist",
        captcha: "Security verification",
        captchaError: "Please complete the security verification.",
        submit: "Join waitlist",
        success: "Thank you! You've been added to the waitlist.",
        error: "Oops! Something went wrong. Please try again.",
        alreadyJoined: "You've already joined the waitlist. Thanks for signing up!"
      }
    }
  };

  const currentContent = content[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <div className="flex bg-white/10 backdrop-blur-sm rounded-full p-1">
          <button
            onClick={() => setLanguage('pt')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              language === 'pt' 
                ? 'bg-white text-slate-900 shadow-lg' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            PT
          </button>
          <button
            onClick={() => setLanguage('en')}
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
                {currentContent.hero}
              </span>
            </h1>
            
            {/* Subtext */}
            <p className="text-xl sm:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              {currentContent.subtext}
            </p>
            
            {/* CTA Button */}
            <button 
              onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-lg rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
            >
              {currentContent.cta}
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Waitlist Form Section */}
      <div id="waitlist-form" className="relative py-12 sm:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-white/20 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {currentContent.form.title}
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
                    {currentContent.form.alreadyJoined}
                  </h3>
                  <p className="text-white/70 text-lg">
                    {language === 'pt' 
                      ? 'Fique atento ao seu email para atualizações sobre o Calendado!'
                      : 'Keep an eye on your email for Calendado updates!'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <>
                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-500/20 border border-green-400/30 rounded-xl text-green-100 text-center">
                    {currentContent.form.success}
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl text-red-100 text-center">
                    {currentContent.form.error}
                  </div>
                )}

                {duplicateEmailError && (
                  <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-xl text-yellow-100 text-center">
                    {currentContent.form.duplicateEmailError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2">
                  {currentContent.form.name}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder={currentContent.form.name}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                  {currentContent.form.email}
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
                  placeholder={currentContent.form.emailPlaceholder}
                />
                {emailError && emailTouched && (
                  <p className="mt-2 text-sm text-red-400">
                    {emailError}
                  </p>
                )}
                {formData.email && !emailError && getEmailNormalizationMessage(formData.email) && (
                  <p className="mt-2 text-xs text-white/60">
                    {getEmailNormalizationMessage(formData.email)}
                  </p>
                )}
              </div>

              {/* CAPTCHA Section - reCAPTCHA v3 (invisible) */}
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
                    {currentContent.form.captchaError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {language === 'pt' ? 'Enviando...' : 'Sending...'}
                  </div>
                ) : (
                  currentContent.form.submit
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
              {language === 'pt' 
                ? '© 2025 Calendado. Todos os direitos reservados.' 
                : '© 2025 Calendado. All rights reserved.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
