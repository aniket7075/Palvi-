import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from './translations';

type LanguageContextType = {
  language: 'en' | 'mr';
  setLanguage: (lang: 'en' | 'mr') => void;
  t: (key: string, fallback?: string) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<'en' | 'mr'>('en');

  useEffect(() => {
    const loadLanguage = async () => {
      const storedLang = await AsyncStorage.getItem('app_language');
      if (storedLang === 'mr' || storedLang === 'en') {
        setLanguageState(storedLang);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = async (lang: 'en' | 'mr') => {
    setLanguageState(lang);
    await AsyncStorage.setItem('app_language', lang);
  };

  const t = (key: string, fallback?: string) => {
    const dict = translations[language];
    if (dict && dict[key]) {
      return dict[key];
    }
    // If not found in current language, try English
    if (translations['en'][key]) {
      return translations['en'][key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
