import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  td: (zhText: string, enText?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && Object.keys(translations).includes(savedLanguage)) {
        return savedLanguage;
      }
    }
    return 'zh';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.title =
      language === 'en'
        ? 'Huang Yixuan | Yixuan.Dev · Personal Portfolio'
        : '黄奕轩 | 奕轩.Dev · 个人全栈门户';
  }, [language]);

  const t = (key: string): string => {
    const dict = translations[language] as Record<string, string>;
    return dict[key] || key;
  };

  const td = (zhText: string, enText?: string): string => {
    if (language === 'en' && enText) {
      return enText;
    }
    return zhText;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, td }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    return {
      language: 'zh',
      setLanguage: () => {},
      t: (key: string) => (translations.zh as Record<string, string>)[key] || key,
      td: (zhText: string) => zhText,
    };
  }
  return context;
};
