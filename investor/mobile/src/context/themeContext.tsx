import React, { createContext, useContext, useState, ReactNode } from 'react';
import { COLORS } from '../constants/colors';
import THEME from '../theme';

interface ThemeContextType {
  isDark: boolean;
  colors: typeof COLORS;
  toggleTheme: () => void;
  theme: typeof THEME;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(false);

  const activeColors = isDark
    ? {
        ...COLORS,
        background: COLORS.backgroundDark,
        surface: COLORS.surfaceDark,
        surfaceSubtle: COLORS.surfaceSubtleDark,
        surfaceElevated: COLORS.surfaceDark,
        border: COLORS.borderDark,
        textPrimary: COLORS.white,
        textSecondary: COLORS.textMuted,
      }
    : COLORS;

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        colors: activeColors,
        toggleTheme,
        theme: {
          ...THEME,
          colors: activeColors,
        },
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
