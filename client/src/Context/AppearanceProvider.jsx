import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  applyAppearance,
  loadStoredAppearance,
  STORAGE_KEYS,
  THEMES,
  FONTS,
  DEFAULT_THEME,
  DEFAULT_FONT,
} from '../config/appearance';

const AppearanceContext = createContext(null);

export const AppearanceProvider = ({ children }) => {
  const stored = loadStoredAppearance();
  const [themeId, setThemeId] = useState(stored.themeId);
  const [fontId, setFontId] = useState(stored.fontId);

  useEffect(() => {
    applyAppearance(themeId, fontId);
    localStorage.setItem(STORAGE_KEYS.theme, themeId);
    localStorage.setItem(STORAGE_KEYS.font, fontId);
  }, [themeId, fontId]);

  const value = useMemo(() => ({
    themeId,
    fontId,
    themes: THEMES,
    fonts: FONTS,
    setThemeId,
    setFontId,
  }), [themeId, fontId]);

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
};

export const useAppearance = () => {
  const ctx = useContext(AppearanceContext);
  if (!ctx) {
    return {
      themeId: DEFAULT_THEME,
      fontId: DEFAULT_FONT,
      themes: THEMES,
      fonts: FONTS,
      setThemeId: () => {},
      setFontId: () => {},
    };
  }
  return ctx;
};
