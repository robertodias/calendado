/**
 * Modern Landing page component
 *
 * Beautiful, modern landing page with hero section, value propositions,
 * testimonials, and enhanced waitlist form
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { hasJoinedWaitlist } from '../lib/cookieUtils';
import WaitlistForm from '../components/forms/WaitlistForm';
import WaitlistSuccess from '../components/WaitlistSuccess';
import { Card, CardContent } from '../components/ui/Card';
import { logError } from '../lib/errorHandler';

const Landing: React.FC = () => {
  const { language, setLanguage, t, translations } = useLanguage();
  const [hasJoined, setHasJoined] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Check if user has already joined the waitlist on component mount
  useEffect(() => {
    setHasJoined(hasJoinedWaitlist());
  }, []);

  const handleSuccess = (waitlistId: string) => {
    setHasJoined(true);
    setSubmitStatus('success');
    setErrorMessage('');
    logError(`Waitlist signup successful: ${waitlistId}`, 'Landing.success');
  };

  const handleError = (error: string) => {
    setSubmitStatus('error');
    setErrorMessage(error);
    logError(error, 'Landing.error');
  };

  const handleReset = () => {
    setHasJoined(false);
    setSubmitStatus('idle');
    setErrorMessage('');
  };

  const scrollToWaitlist = () => {
    const waitlistSection = document.getElementById('waitlist-section');
    waitlistSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden'>
      {/* Unified dark mode background system - covers entire page */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        {/* Primary large gradient orbs */}
        <div className='absolute -top-40 -right-40 w-[1200px] h-[1200px] bg-gradient-to-br from-purple-500/40 to-pink-500/40 rounded-full blur-3xl animate-pulse' />
        <div className='absolute -bottom-40 -left-40 w-[1300px] h-[1300px] bg-gradient-to-tr from-pink-500/40 to-blue-500/40 rounded-full blur-3xl animate-pulse delay-1000' />
        <div className='absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-gradient-to-r from-purple-400/50 to-pink-400/50 rounded-full blur-2xl animate-pulse delay-500' />
        <div className='absolute bottom-1/3 right-1/3 w-[900px] h-[900px] bg-gradient-to-l from-blue-400/45 to-purple-400/45 rounded-full blur-3xl animate-pulse delay-700' />

        {/* Secondary accent elements */}
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-300/60 to-purple-300/60 rounded-full blur-2xl animate-pulse delay-300' />
        <div className='absolute top-1/6 right-1/6 w-[500px] h-[500px] bg-gradient-to-br from-blue-300/50 to-pink-300/50 rounded-full blur-xl animate-pulse delay-900' />

        {/* Header area elements */}
        <div className='absolute top-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-purple-400/35 to-pink-400/35 rounded-full blur-2xl animate-pulse delay-200' />
        <div className='absolute top-0 right-1/3 w-[350px] h-[350px] bg-gradient-to-bl from-blue-400/30 to-purple-400/30 rounded-full blur-xl animate-pulse delay-600' />

        {/* Middle section elements */}
        <div className='absolute top-1/3 left-1/6 w-[300px] h-[300px] bg-gradient-to-br from-purple-300/40 to-pink-300/40 rounded-full blur-2xl animate-pulse delay-400' />
        <div className='absolute top-2/3 right-1/6 w-[350px] h-[350px] bg-gradient-to-bl from-pink-300/35 to-blue-300/35 rounded-full blur-2xl animate-pulse delay-800' />

        {/* Bottom section elements */}
        <div className='absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-gradient-to-tr from-blue-300/45 to-purple-300/45 rounded-full blur-2xl animate-pulse delay-100' />
        <div className='absolute bottom-1/6 right-1/4 w-[300px] h-[300px] bg-gradient-to-br from-purple-300/40 to-pink-300/40 rounded-full blur-xl animate-pulse delay-500' />

        {/* Subtle overlay for depth and consistency */}
        <div className='absolute inset-0 bg-gradient-to-br from-slate-900/30 via-transparent to-purple-900/20' />
      </div>
      {/* Header */}
      <header className='relative z-50 bg-transparent backdrop-blur-xl'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center'>
              <div className='flex items-center space-x-2'>
                <div className='w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center'>
                  <svg
                    className='w-5 h-5 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                </div>
                <h1 className='text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent'>
                  Calendado
                </h1>
              </div>
            </div>

            {/* Language Selector */}
            <div className='flex items-center space-x-1 bg-slate-700/50 backdrop-blur-sm rounded-xl p-1 border border-purple-500/30'>
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  language === 'en'
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg shadow-primary-600/25'
                    : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('pt')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  language === 'pt'
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg shadow-primary-600/25'
                    : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
                }`}
              >
                PT
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className='relative overflow-hidden pt-8 pb-32'>
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <div className='max-w-4xl mx-auto'>
              <h1 className='text-5xl md:text-7xl font-bold text-white mb-6 leading-tight'>
                <span className='bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent'>
                  {t('hero.title')}
                </span>
              </h1>
              <p className='text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed'>
                {t('hero.subtitle')}
              </p>

              <div className='flex flex-col sm:flex-row gap-6 justify-center items-center mb-12'>
                <button
                  onClick={scrollToWaitlist}
                  className='group relative px-10 py-5 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold text-lg rounded-2xl transition-all duration-300 shadow-2xl shadow-primary-600/30 hover:shadow-3xl hover:shadow-primary-600/50 hover:scale-105 active:scale-95 overflow-hidden'
                >
                  <span className='relative z-10'>{t('hero.cta')}</span>
                  <div className='absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                </button>
                <button className='px-8 py-5 border-2 border-white/30 hover:border-white/50 text-white font-semibold text-lg rounded-2xl transition-all duration-300 hover:bg-white/10 backdrop-blur-sm'>
                  {t('hero.secondaryCta')}
                </button>
              </div>

              {/* Social Proof */}
              <div className='text-center mb-8'>
                <p className='text-slate-300 text-lg mb-6'>
                  {t('hero.socialProof')}
                </p>
                <div className='flex items-center justify-center space-x-3 text-neutral-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/50 inline-flex'>
                  <svg
                    className='w-5 h-5 text-green-500'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='text-sm font-medium'>
                    {t('hero.noCreditCard')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className='py-24 relative'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>
              {t('demo.title')}
            </h2>
            <p className='text-lg text-slate-300 max-w-2xl mx-auto'>
              {t('demo.subtitle')}
            </p>
          </div>

          {/* Demo Steps */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-16'>
            {(translations.demo?.steps || []).map(
              (step: any, index: number) => (
                <Card
                  key={index}
                  variant='elevated'
                  className='text-center p-8 hover:scale-105 transition-transform duration-300 bg-slate-800/50 backdrop-blur-sm border-slate-700/50'
                >
                  <CardContent className='pt-0'>
                    <div className='w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-6 text-white text-2xl font-bold'>
                      {index + 1}
                    </div>
                    <h3 className='text-xl font-semibold text-white mb-4'>
                      {step.title}
                    </h3>
                    <p className='text-slate-300 leading-relaxed'>
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              )
            )}
          </div>

          {/* Visual Demo Mockup */}
          <div className='relative max-w-4xl mx-auto'>
            <div className='bg-white rounded-2xl shadow-2xl overflow-hidden'>
              {/* Mockup Header */}
              <div className='bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center space-x-3'>
                <div className='w-3 h-3 bg-red-400 rounded-full'></div>
                <div className='w-3 h-3 bg-yellow-400 rounded-full'></div>
                <div className='w-3 h-3 bg-green-400 rounded-full'></div>
                <div className='ml-4 text-slate-600 text-sm font-medium'>
                  calendado.com/your-link
                </div>
              </div>

              {/* Mockup Content */}
              <div className='p-8'>
                <div className='text-center mb-6'>
                  <h3 className='text-2xl font-bold text-slate-900 mb-2'>
                    Book a meeting with João
                  </h3>
                  <p className='text-slate-600'>
                    Choose a time that works for you
                  </p>
                </div>

                {/* Calendar Mockup */}
                <div className='grid grid-cols-7 gap-2 mb-6'>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                    day => (
                      <div
                        key={day}
                        className='text-center text-sm font-medium text-slate-500 py-2'
                      >
                        {day}
                      </div>
                    )
                  )}
                  {Array.from({ length: 35 }, (_, i) => (
                    <div
                      key={i}
                      className={`h-12 flex items-center justify-center text-sm rounded-lg ${
                        i >= 15 && i <= 20
                          ? 'bg-primary-100 text-primary-700 font-medium cursor-pointer hover:bg-primary-200'
                          : i < 15
                            ? 'text-slate-300'
                            : 'text-slate-300'
                      }`}
                    >
                      {i < 15 ? '' : i - 14}
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                <div className='space-y-2'>
                  <h4 className='font-medium text-slate-900 mb-3'>
                    Available times
                  </h4>
                  {['9:00 AM', '10:30 AM', '2:00 PM', '3:30 PM'].map(time => (
                    <div
                      key={time}
                      className='p-3 border border-slate-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-colors'
                    >
                      <span className='text-slate-700 font-medium'>{time}</span>
                      <span className='text-slate-500 text-sm ml-2'>
                        - 30 min
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id='waitlist-section' className='py-24 relative'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>
              {t('waitlist.title')}
            </h2>
            <p className='text-lg text-slate-300 max-w-2xl mx-auto'>
              {t('waitlist.description')}
            </p>
          </div>

          <div className='max-w-md mx-auto'>
            {hasJoined || submitStatus === 'success' ? (
              <WaitlistSuccess onReset={handleReset} />
            ) : (
              <Card variant='elevated' className='p-8'>
                <WaitlistForm onSuccess={handleSuccess} onError={handleError} />

                {submitStatus === 'error' && errorMessage && (
                  <div className='mt-6 p-4 bg-error-50 border border-error-200 rounded-lg'>
                    <p className='text-error-600 text-sm'>{errorMessage}</p>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section className='py-24 relative'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>
              {t('trust.title')}
            </h2>
            <p className='text-lg text-slate-300 max-w-2xl mx-auto'>
              {t('trust.subtitle')}
            </p>
          </div>

          {/* Stats Grid */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-16'>
            {(translations.trust?.stats || []).map(
              (stat: any, index: number) => (
                <div key={index} className='text-center'>
                  <div className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent mb-2'>
                    {stat.number}
                  </div>
                  <div className='text-lg text-slate-300'>{stat.label}</div>
                </div>
              )
            )}
          </div>

          {/* Trust Badges */}
          <div className='flex flex-wrap justify-center items-center gap-8 opacity-60'>
            <div className='flex items-center space-x-2 text-slate-400'>
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                  clipRule='evenodd'
                />
              </svg>
              <span className='text-sm font-medium'>SOC 2 Compliant</span>
            </div>
            <div className='flex items-center space-x-2 text-slate-400'>
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              <span className='text-sm font-medium'>GDPR Ready</span>
            </div>
            <div className='flex items-center space-x-2 text-slate-400'>
              <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
              <span className='text-sm font-medium'>SSL Encrypted</span>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className='py-28 relative'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>
              {t('valueProposition.title')}
            </h2>
            <p className='text-lg text-slate-300 max-w-2xl mx-auto'>
              {t('valueProposition.description')}
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {/* Feature 1 */}
            <Card
              variant='elevated'
              className='text-center p-8 hover:scale-105 transition-transform duration-300 bg-slate-800/50 backdrop-blur-sm border-slate-700/50'
            >
              <CardContent className='pt-0'>
                <div className='w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6'>
                  <svg
                    className='w-8 h-8 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold text-white mb-4'>
                  {t('features.scheduling.title')}
                </h3>
                <p className='text-slate-300 leading-relaxed'>
                  {t('features.scheduling.description')}
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card
              variant='elevated'
              className='text-center p-8 hover:scale-105 transition-transform duration-300 bg-slate-800/50 backdrop-blur-sm border-slate-700/50'
            >
              <CardContent className='pt-0'>
                <div className='w-16 h-16 mx-auto bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center mb-6'>
                  <svg
                    className='w-8 h-8 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold text-white mb-4'>
                  {t('features.team.title')}
                </h3>
                <p className='text-slate-300 leading-relaxed'>
                  {t('features.team.description')}
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card
              variant='elevated'
              className='text-center p-8 hover:scale-105 transition-transform duration-300 bg-slate-800/50 backdrop-blur-sm border-slate-700/50'
            >
              <CardContent className='pt-0'>
                <div className='w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6'>
                  <svg
                    className='w-8 h-8 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-semibold text-white mb-4'>
                  {t('features.automation.title')}
                </h3>
                <p className='text-slate-300 leading-relaxed'>
                  {t('features.automation.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className='py-24 relative'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>
              {t('integrations.title')}
            </h2>
            <p className='text-lg text-slate-300 max-w-2xl mx-auto'>
              {t('integrations.subtitle')}
            </p>
          </div>

          {/* Integration Tools Grid */}
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6'>
            {(translations.integrations?.tools || []).map(
              (tool: string, index: number) => (
                <div
                  key={index}
                  className='bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 text-center hover:bg-slate-700/50 transition-colors duration-300'
                >
                  <div className='w-12 h-12 mx-auto bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center mb-3'>
                    <svg
                      className='w-6 h-6 text-white'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div className='text-sm font-medium text-white'>{tool}</div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className='py-24 relative'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>
              {t('pricing.title')}
            </h2>
            <p className='text-lg text-slate-300 max-w-2xl mx-auto'>
              {t('pricing.subtitle')}
            </p>
          </div>

          {/* Pricing Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto'>
            {(translations.pricing?.plans || []).map(
              (plan: any, index: number) => (
                <Card
                  key={index}
                  variant='elevated'
                  className={`relative p-8 hover:scale-105 transition-transform duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border-primary-500/50'
                      : 'bg-slate-800/50 backdrop-blur-sm border-slate-700/50'
                  }`}
                >
                  {plan.popular && (
                    <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                      <span className='bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-1 rounded-full text-sm font-medium'>
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardContent className='pt-0'>
                    <div className='text-center mb-6'>
                      <h3 className='text-2xl font-bold text-white mb-2'>
                        {plan.name}
                      </h3>
                      <div className='text-4xl font-bold text-white mb-2'>
                        {plan.price}
                        {plan.period && (
                          <span className='text-lg text-slate-400'>
                            {plan.period}
                          </span>
                        )}
                      </div>
                      <p className='text-slate-300'>{plan.description}</p>
                    </div>

                    <ul className='space-y-3 mb-8'>
                      {((plan.features as string[]) || []).map(
                        (feature: string, featureIndex: number) => (
                          <li
                            key={featureIndex}
                            className='flex items-center space-x-3'
                          >
                            <svg
                              className='w-5 h-5 text-green-400 flex-shrink-0'
                              fill='currentColor'
                              viewBox='0 0 20 20'
                            >
                              <path
                                fillRule='evenodd'
                                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                clipRule='evenodd'
                              />
                            </svg>
                            <span className='text-slate-300'>{feature}</span>
                          </li>
                        )
                      )}
                    </ul>

                    <button
                      className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/40'
                          : 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gradient-to-br from-slate-900 via-neutral-900 to-purple-900 text-white relative overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-r from-primary-900/20 via-transparent to-secondary-900/20' />
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
            {/* Logo and Description */}
            <div className='md:col-span-2'>
              <div className='flex items-center space-x-2 mb-4'>
                <div className='w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center'>
                  <svg
                    className='w-5 h-5 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-bold'>Calendado</h3>
              </div>
              <p className='text-neutral-400 mb-6 max-w-md'>
                {t('footer.description')}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className='text-lg font-semibold mb-4'>
                {t('footer.quickLinks')}
              </h4>
              <ul className='space-y-2'>
                <li>
                  <a
                    href='#'
                    className='text-neutral-400 hover:text-white transition-colors'
                  >
                    {t('footer.about')}
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='text-neutral-400 hover:text-white transition-colors'
                  >
                    {t('footer.contact')}
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='text-neutral-400 hover:text-white transition-colors'
                  >
                    {t('footer.privacy')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className='text-lg font-semibold mb-4'>
                {t('footer.stayUpdated')}
              </h4>
              <p className='text-neutral-400 text-sm mb-4'>
                {t('footer.stayUpdatedDescription')}
              </p>
              <button
                onClick={scrollToWaitlist}
                className='w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105 active:scale-95'
              >
                {t('footer.joinWaitlist')}
              </button>
            </div>
          </div>

          <div className='border-t border-neutral-800 mt-8 pt-8 text-center'>
            <p className='text-neutral-400 text-sm'>
              © 2025 Calendado. {t('footer.rights')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
