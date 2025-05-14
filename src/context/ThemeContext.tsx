'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Start with a default theme that matches what we use on the server
  const [theme, setTheme] = useState<Theme>('light');
  // Track if we're mounted on the client
  const [mounted, setMounted] = useState(false);

  // Mark component as mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Check if theme is stored in localStorage
        const storedTheme = localStorage.getItem('theme') as Theme | null;

        if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
          setTheme(storedTheme);
        } else {
          // Check system preference
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setTheme(prefersDark ? 'dark' : 'light');
        }
      } catch (error) {
        // If localStorage is not available or throws an error, use default theme
        console.error('Error accessing localStorage:', error);
      }
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-bs-theme', theme);
      try {
        localStorage.setItem('theme', theme);
      } catch (error) {
        console.error('Error saving theme to localStorage:', error);
      }
    }
  }, [theme]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Render children only after the component has mounted on the client
  // This prevents hydration mismatch between server and client
  const value = { theme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      {/* Only apply theme changes after mounting to avoid hydration mismatch */}
      {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
