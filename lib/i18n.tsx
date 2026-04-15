'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { type Language, type TranslationKey, t as translate } from './translations';

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'pariwar_language';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('hi');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored === 'hi' || stored === 'en') {
      setLangState(stored);
    }
    setMounted(true);
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translate(key, lang),
    [lang]
  );

  // Avoid hydration mismatch by not rendering children until mounted
  if (!mounted) {
    return (
      <I18nContext.Provider value={{ lang: 'hi', setLang, t: (key) => translate(key, 'hi') }}>
        <div style={{ opacity: 0 }}>{children}</div>
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider');
  return ctx;
}

export function hasLanguageStored(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'hi' || stored === 'en';
}
