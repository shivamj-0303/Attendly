import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    card: string;
    shadow: string;
  };
}

const lightTheme: Theme = {
  mode: 'light',
  colors: {
    primary: '#2563eb',      // Blue-600
    primaryDark: '#1e40af',  // Blue-700
    primaryLight: '#3b82f6', // Blue-500
    background: '#f9fafb',   // Gray-50
    surface: '#ffffff',      // White
    text: '#111827',         // Gray-900
    textSecondary: '#6b7280',// Gray-500
    border: '#e5e7eb',       // Gray-200
    error: '#ef4444',        // Red-500
    success: '#10b981',      // Green-500
    warning: '#f59e0b',      // Amber-500
    card: '#ffffff',
    shadow: '#00000020',
  },
};

const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    primary: '#3b82f6',      // Blue-500
    primaryDark: '#2563eb',  // Blue-600
    primaryLight: '#60a5fa', // Blue-400
    background: '#111827',   // Gray-900
    surface: '#1f2937',      // Gray-800
    text: '#f9fafb',         // Gray-50
    textSecondary: '#9ca3af',// Gray-400
    border: '#374151',       // Gray-700
    error: '#f87171',        // Red-400
    success: '#34d399',      // Green-400
    warning: '#fbbf24',      // Amber-400
    card: '#1f2937',         // Gray-800
    shadow: '#00000040',
  },
};

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored && (stored === 'light' || stored === 'dark')) {
        setThemeModeState(stored);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  };

  const theme = themeMode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
