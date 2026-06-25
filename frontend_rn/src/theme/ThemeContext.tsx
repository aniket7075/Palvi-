import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  primaryDark: string;
  accent: string;
  success: string;
  error: string;
}

const lightColors: ThemeColors = {
  background: '#fbf8f3',
  surface: '#ffffff',
  card: '#ffffff',
  text: '#3d251e',
  textSecondary: '#8c6e65',
  border: '#ebdcd3',
  primary: '#146e4e',
  primaryDark: '#0d4e37',
  accent: '#a67c6d',
  success: '#10b981',
  error: '#d32f2f',
};

const darkColors: ThemeColors = {
  background: '#121212',
  surface: '#1e1e1e',
  card: '#1e1e1e',
  text: '#f5f0ed',
  textSecondary: '#bcaaa4',
  border: '#3d2d27',
  primary: '#34d399',
  primaryDark: '#10b981',
  accent: '#c4a499',
  success: '#059669',
  error: '#f87171',
};

interface ThemeContextType {
  isDark: boolean;
  theme: ThemeColors;
  toggleTheme: () => void;
  themeMode: ThemeMode;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  theme: lightColors,
  toggleTheme: () => {},
  themeMode: 'light',
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await AsyncStorage.getItem('themeMode');
      if (storedTheme === 'dark') {
        setThemeMode('dark');
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const nextMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(nextMode);
    await AsyncStorage.setItem('themeMode', nextMode);
  };

  const theme = themeMode === 'dark' ? darkColors : lightColors;
  const isDark = themeMode === 'dark';

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme, themeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
