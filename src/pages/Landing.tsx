/**
 * Landing page component
 * 
 * Simplified landing page with modular components
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { hasJoinedWaitlist } from '../lib/cookieUtils';
import WaitlistForm from '../components/forms/WaitlistForm';
import WaitlistSuccess from '../components/WaitlistSuccess';
import { logError } from '../lib/errorHandler';

const Landing: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [hasJoined, setHasJoined] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Calendado</h1>
            </div>
            
            {/* Language Selector */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  language === 'en'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('pt')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  language === 'pt'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                PT
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            {/* Hero Section */}
            <div className="max-w-3xl mx-auto mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                {t('hero.title')}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {t('hero.subtitle')}
              </p>
            </div>

            {/* Waitlist Section */}
            <div className="max-w-md mx-auto">
              {hasJoined || submitStatus === 'success' ? (
                <WaitlistSuccess onReset={handleReset} />
              ) : (
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {t('waitlist.title')}
                    </h2>
                    <p className="text-gray-600">
                      {t('waitlist.description')}
                    </p>
                  </div>

                  <WaitlistForm
                    onSuccess={handleSuccess}
                    onError={handleError}
                  />

                  {submitStatus === 'error' && errorMessage && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{errorMessage}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Features Section */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('features.scheduling.title')}
                </h3>
                <p className="text-gray-600">
                  {t('features.scheduling.description')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('features.team.title')}
                </h3>
                <p className="text-gray-600">
                  {t('features.team.description')}
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('features.automation.title')}
                </h3>
                <p className="text-gray-600">
                  {t('features.automation.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Calendado. {t('footer.rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
