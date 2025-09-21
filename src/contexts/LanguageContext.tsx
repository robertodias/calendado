import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getInitialLanguage, saveLanguagePreference, type SupportedLanguage } from '../lib/languageUtils';

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
const getNestedValue = (obj: Record<string, unknown>, path: string): string => {
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && current !== null && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // Return the path if key not found
    }
  }
  
  return typeof current === 'string' ? current : path;
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
