import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeColors, ThemeId, THEME_PRESETS } from '@presentation/theme/colors';
import { STORAGE_KEYS } from '@infrastructure/storage/keys';

interface ThemeContextValue {
  themeId: ThemeId;
  t: ThemeColors;
  setThemeId: (id: ThemeId) => void;
}

const DEFAULT_THEME: ThemeId = 'dark';

const ThemeContext = createContext<ThemeContextValue>({
  themeId: DEFAULT_THEME,
  t: THEME_PRESETS[0].colors,
  setThemeId: () => undefined,
});

export const useTheme = (): ThemeContextValue => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    void AsyncStorage.getItem(STORAGE_KEYS.THEME).then((stored) => {
      if (stored && THEME_PRESETS.some((p) => p.id === stored)) {
        setThemeIdState(stored as ThemeId);
      }
    });
  }, []);

  const setThemeId = (id: ThemeId) => {
    setThemeIdState(id);
    void AsyncStorage.setItem(STORAGE_KEYS.THEME, id);
  };

  const t = useMemo(
    () => THEME_PRESETS.find((p) => p.id === themeId)?.colors ?? THEME_PRESETS[0].colors,
    [themeId],
  );

  const value = useMemo(() => ({ themeId, t, setThemeId }), [themeId, t]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
