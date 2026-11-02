import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Theme state: Enforce 'light' mode by default to match Image 1
  const [themePreference, setThemePreference] = useState(() => {
    const saved = localStorage.getItem('ci_theme_preference');
    return saved === 'dark' ? 'light' : (saved || 'light');
  });

  const [activeTheme, setActiveTheme] = useState('light');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNetworkNotice, setShowNetworkNotice] = useState(false);

  // System Adaptability: Responsive Window Size
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  // 1. Theme Adaptability listener
  useEffect(() => {
    const applyTheme = () => {
      // Landing page and overall investor portal defaults to light theme matching Image 1
      const resolvedTheme = themePreference === 'dark' ? 'dark' : 'light';
      setActiveTheme(resolvedTheme);
      document.documentElement.setAttribute('data-theme', resolvedTheme);
      localStorage.setItem('ci_theme_preference', resolvedTheme);
    };

    applyTheme();
  }, [themePreference]);

  // 2. Network Adaptability listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNetworkNotice(true);
      const timer = setTimeout(() => setShowNetworkNotice(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNetworkNotice(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 3. Viewport Adaptability listener
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  const toggleTheme = (newPref) => {
    setThemePreference(newPref);
  };

  return (
    <ThemeContext.Provider
      value={{
        themePreference,
        activeTheme,
        toggleTheme,
        isOnline,
        showNetworkNotice,
        dismissNetworkNotice: () => setShowNetworkNotice(false),
        windowWidth,
        isMobile,
        isTablet,
        isDesktop
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
