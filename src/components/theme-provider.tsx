
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme; // User's selected preference: 'light', 'dark', or 'system'
  resolvedTheme: 'light' | 'dark'; // Actual theme applied to the document
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'app-theme',
}: ThemeProviderProps) {
  // Initialize with defaultTheme consistently for server and initial client render
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    // For initial resolvedTheme, if theme is 'system', try to determine from window if available, else default.
    // This part runs on client before first full render, but after useState for `theme` is set.
    if (theme === 'light' || theme === 'dark') return theme;
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    // Default for SSR or if window is not available when this runs (should be 'system' theme case)
    // Assuming a light default if system preference cannot be determined on server for 'system' theme.
    return 'light'; 
  });

  const applyThemePreference = useCallback(() => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let currentAppliedTheme: 'light' | 'dark';
    if (theme === 'system') {
      currentAppliedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } else {
      currentAppliedTheme = theme;
    }
    root.classList.add(currentAppliedTheme);
    setResolvedTheme(currentAppliedTheme);
  }, [theme]);

  useEffect(() => {
    applyThemePreference();
  }, [theme, applyThemePreference]);

  useEffect(() => {
    if (typeof window === 'undefined' || theme !== 'system') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyThemePreference(); 
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyThemePreference]);

  const setTheme = (newTheme: Theme) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch (e) {
        console.warn('ThemeProvider: Failed to save theme to localStorage.', e);
      }
    }
    setThemeState(newTheme);
  };
  
  // Effect to load theme from localStorage on client mount,
  // and update if it differs from the initial (defaultTheme).
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let clientInitialTheme = defaultTheme;
      try {
        const storedTheme = localStorage.getItem(storageKey) as Theme | null;
        if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
          clientInitialTheme = storedTheme;
        } else {
           localStorage.setItem(storageKey, defaultTheme);
        }
      } catch (e) {
        console.warn('ThemeProvider: Failed to access localStorage on mount.', e);
      }
      
      // `theme` in this closure is `defaultTheme` from the initial useState.
      if (clientInitialTheme !== theme) {
         setThemeState(clientInitialTheme);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Runs once on mount on the client.

  const contextValue = {
    theme,
    resolvedTheme,
    setTheme,
  };

  return (
    <ThemeProviderContext.Provider value={contextValue}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
