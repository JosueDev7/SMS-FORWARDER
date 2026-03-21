import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Locale, Strings, translations } from '@shared/i18n/translations';
import { STORAGE_KEYS } from '@infrastructure/storage/keys';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  s: Strings;
}

const DEFAULT_LOCALE: Locale = 'es';

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  s: translations[DEFAULT_LOCALE],
  setLocale: () => undefined,
});

export const useI18n = (): I18nContextValue => useContext(I18nContext);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    void AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE).then((stored) => {
      if (stored && (stored === 'es' || stored === 'en')) {
        setLocaleState(stored as Locale);
      }
    });
  }, []);

  const setLocale = (id: Locale) => {
    setLocaleState(id);
    void AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, id);
  };

  const s = useMemo(() => translations[locale], [locale]);

  const value = useMemo(() => ({ locale, setLocale, s }), [locale, s]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
