/**
 * Fraud Shield Design System Colors
 * This file contains all color definitions used throughout the app.
 */

// Primary color palette
const primary = {
  50: '#e6f3ff',
  100: '#cce7ff',
  200: '#99cfff',
  300: '#66b7ff',
  400: '#339fff',
  500: '#0087ff', // Main primary color
  600: '#006dcc',
  700: '#005499',
  800: '#003a66',
  900: '#001f33',
};

// Accent color
const accent = {
  50: '#fff5e6',
  100: '#ffeacc',
  200: '#ffd699',
  300: '#ffc166',
  400: '#ffad33',
  500: '#ff9800', // Main accent color
  600: '#cc7a00',
  700: '#995c00',
  800: '#663d00',
  900: '#331f00',
};

// Success color
const success = {
  50: '#e8f5e9',
  100: '#c8e6c9',
  200: '#a5d6a7',
  300: '#81c784',
  400: '#66bb6a',
  500: '#4caf50', // Main success color
  600: '#43a047',
  700: '#388e3c',
  800: '#2e7d32',
  900: '#1b5e20',
};

// Warning color
const warning = {
  50: '#fffde7',
  100: '#fff9c4',
  200: '#fff59d',
  300: '#fff176',
  400: '#ffee58',
  500: '#ffeb3b', // Main warning color
  600: '#fdd835',
  700: '#fbc02d',
  800: '#f9a825',
  900: '#f57f17',
};

// Danger color
const danger = {
  50: '#ffebee',
  100: '#ffcdd2',
  200: '#ef9a9a',
  300: '#e57373',
  400: '#ef5350',
  500: '#f44336', // Main danger color
  600: '#e53935',
  700: '#d32f2f',
  800: '#c62828',
  900: '#b71c1c',
};

// Neutral colors
const neutral = {
  50: '#fafafa', 
  100: '#f5f5f5',
  200: '#eeeeee',
  300: '#e0e0e0',
  400: '#bdbdbd',
  500: '#9e9e9e', 
  600: '#757575',
  700: '#616161',
  800: '#424242',
  900: '#212121',
};

export const Colors = {
  light: {
    // Base UI
    text: neutral[900],
    textSecondary: neutral[700],
    textTertiary: neutral[500],
    background: '#ffffff',
    backgroundSecondary: neutral[50],
    backgroundTertiary: neutral[100],
    border: neutral[300],
    borderLight: neutral[200],
    
    // Themed
    tint: primary[500],
    tintLight: primary[100],
    tintDark: primary[800],
    accent: accent[500],
    success: success[500],
    warning: warning[500],
    danger: danger[500],
    
    // Status
    info: primary[500],
    
    // Tab Navigation
    tabBackground: '#ffffff',
    tabIconDefault: neutral[500],
    tabIconSelected: primary[500],
    
    // Additional
    card: '#ffffff',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  dark: {
    // Base UI
    text: '#ffffff',
    textSecondary: neutral[300],
    textTertiary: neutral[400],
    background: '#121212',
    backgroundSecondary: '#1e1e1e',
    backgroundTertiary: '#2a2a2a',
    border: '#333333',
    borderLight: '#444444',
    
    // Themed
    tint: primary[400],
    tintLight: primary[900],
    tintDark: primary[200],
    accent: accent[400],
    success: success[400],
    warning: warning[400],
    danger: danger[400],
    
    // Status
    info: primary[400],
    
    // Tab Navigation
    tabBackground: '#1a1a1a',
    tabIconDefault: neutral[400],
    tabIconSelected: primary[400],
    
    // Additional
    card: '#1a1a1a',
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

// Export the palette for use in other parts of the app
export const Palette = {
  primary,
  accent,
  success,
  warning,
  danger,
  neutral,
};
