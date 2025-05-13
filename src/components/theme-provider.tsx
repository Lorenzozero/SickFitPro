
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
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return defaultTheme;
    }
    try {
      const storedTheme = localStorage.getItem(storageKey) as Theme;
      return storedTheme || defaultTheme;
    } catch (e) {
      // In case localStorage is unavailable (e.g. private browsing in some browsers)
      console.warn('ThemeProvider: Failed to access localStorage for theme. Using default.', e);
      return defaultTheme;
    }
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (theme === 'light' || theme === 'dark') return theme;
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light'; // Default for SSR if system preference can't be determined
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
  
  // Effect to initialize theme from localStorage on client mount,
  // ensuring consistency if the initial state (from SSR or defaultProp) differs.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let storedTheme: Theme | null = null;
      try {
        storedTheme = localStorage.getItem(storageKey) as Theme;
      } catch (e) {
        console.warn('ThemeProvider: Failed to access localStorage on mount.', e);
      }
      const effectiveInitialTheme = storedTheme || defaultTheme;
      if (effectiveInitialTheme !== theme) {
         setThemeState(effectiveInitialTheme);
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
