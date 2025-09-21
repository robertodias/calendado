/**
 * Language detection and management utilities
 */

export type SupportedLanguage = 'pt' | 'en';

/**
 * Detect browser language and return supported language
 * @returns 'pt' for Portuguese, 'en' for English (default)
 */
export const detectBrowserLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') {
    return 'en'; // Default for SSR
  }

  const browserLang = navigator.language || (navigator as any).userLanguage;
  
  // Check if browser language starts with 'pt' (Portuguese)
  if (browserLang.startsWith('pt')) {
    return 'pt';
  }
  
  // Check if browser language starts with 'en' (English)
  if (browserLang.startsWith('en')) {
    return 'en';
  }
  
  // Check for other Portuguese variants
  const portugueseVariants = ['pt-BR', 'pt-PT', 'pt-AO', 'pt-MZ'];
  if (portugueseVariants.some(variant => browserLang.startsWith(variant))) {
    return 'pt';
  }
  
  // Default to English for any other language
  return 'en';
};

/**
 * Get language from localStorage or detect from browser
 * @returns Current language preference
 */
export const getInitialLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') {
    return 'en';
  }

  // Check localStorage first
  const savedLang = localStorage.getItem('calendado-language') as SupportedLanguage;
  if (savedLang && ['pt', 'en'].includes(savedLang)) {
    return savedLang;
  }

  // Fallback to browser detection
  return detectBrowserLanguage();
};

/**
 * Save language preference to localStorage
 * @param language - Language to save
 */
export const saveLanguagePreference = (language: SupportedLanguage): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('calendado-language', language);
  }
};

/**
 * Get all supported languages
 * @returns Array of supported language codes
 */
export const getSupportedLanguages = (): SupportedLanguage[] => {
  return ['pt', 'en'];
};

/**
 * Get language display name
 * @param language - Language code
 * @returns Display name for the language
 */
export const getLanguageDisplayName = (language: SupportedLanguage): string => {
  const names = {
    pt: 'Português',
    en: 'English'
  };
  return names[language];
};
