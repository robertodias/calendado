import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getInitialLanguage, saveLanguagePreference } from '../lib/languageUtils';
import type { SupportedLanguage } from '../lib/languageUtils';

// Import language bundles
import ptTranslations from '../locales/pt.json';
import enTranslations from '../locales/en.json';

type Translations = typeof ptTranslations;

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation bundles
const translations: Record<SupportedLanguage, Translations> = {
  pt: ptTranslations,
  en: enTranslations
};

// Helper function to get nested translation value
const getNestedValue = (obj: any, path: string): string => {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => getInitialLanguage());

  // Load translations for current language
  const currentTranslations = translations[language];

  // Translation function
  const t = (key: string): string => {
    return getNestedValue(currentTranslations, key);
  };

  // Set language and save preference
  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    saveLanguagePreference(lang);
  };

  // Update document language attribute
  useEffect(() => {
    document.documentElement.lang = language === 'pt' ? 'pt-BR' : 'en';
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    translations: currentTranslations
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
