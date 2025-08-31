import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define theme modes
export type ThemeMode = 'light' | 'dark' | 'system';

// Create theme context
interface ThemeContextType {
  colorScheme: 'light' | 'dark';
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colorScheme: 'light',
  themeMode: 'system',
  setThemeMode: () => {},
});

// Storage key
const THEME_MODE_KEY = '@fraud_shield/theme_mode';

// Provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get device color scheme
  const deviceColorScheme = useDeviceColorScheme() || 'light';
  
  // State for user selected theme mode
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  
  // Derived color scheme based on theme mode
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(deviceColorScheme);
  
  // Load saved theme mode on mount
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem(THEME_MODE_KEY);
        if (savedThemeMode) {
          setThemeMode(savedThemeMode as ThemeMode);
        }
      } catch (error) {
        console.error('Failed to load theme mode:', error);
      }
    };
    
    loadThemeMode();
  }, []);
  
  // Update color scheme whenever theme mode changes
  useEffect(() => {
    const updateColorScheme = () => {
      if (themeMode === 'system') {
        setColorScheme(deviceColorScheme);
      } else {
        setColorScheme(themeMode);
      }
    };
    
    updateColorScheme();
    
    // Listen for appearance changes
    const subscription = Appearance.addChangeListener(({ colorScheme: newColorScheme }) => {
      if (themeMode === 'system' && newColorScheme) {
        setColorScheme(newColorScheme as 'light' | 'dark');
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, [themeMode, deviceColorScheme]);
  
  // Update theme mode and save to storage
  const handleSetThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_MODE_KEY, mode);
      setThemeMode(mode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  };
  
  const value = {
    colorScheme,
    themeMode,
    setThemeMode: handleSetThemeMode,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for accessing theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
