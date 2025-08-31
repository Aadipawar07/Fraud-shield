/**
 * Fraud Shield Typography System
 * This file defines typography styles used throughout the app.
 */
import { StyleSheet } from 'react-native';
import { Colors } from './Colors';

// Font family definitions
export const FontFamily = {
  primary: undefined, // Use system default font
  // For custom fonts, you would define them here:
  // primary: 'Inter',
  // secondary: 'Roboto',
};

// Font weight definitions for better cross-platform support
// Using literals instead of strings to maintain type compatibility
export const FontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const, 
  bold: "700" as const,
};

// Define base typography sizes
export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 32,
  jumbo: 40,
};

// Line height multipliers
const lineHeights = {
  tight: 1.25,  // For headings
  normal: 1.5,  // For body text
  loose: 1.75,  // For captions, small text
};

// Create typography styles
const createTypography = (colorMode: 'light' | 'dark' = 'light') => {
  const color = Colors[colorMode];
  
  return StyleSheet.create({
    // Display text
    display: {
      fontSize: FontSize.jumbo,
      fontWeight: FontWeight.bold,
      color: color.text,
      lineHeight: FontSize.jumbo * lineHeights.tight,
    },
    
    // Headings
    h1: {
      fontSize: FontSize.display,
      fontWeight: FontWeight.bold,
      color: color.text,
      lineHeight: FontSize.display * lineHeights.tight,
    },
    h2: {
      fontSize: FontSize.xxxl,
      fontWeight: FontWeight.bold,
      color: color.text,
      lineHeight: FontSize.xxxl * lineHeights.tight,
    },
    h3: {
      fontSize: FontSize.xxl,
      fontWeight: FontWeight.bold,
      color: color.text,
      lineHeight: FontSize.xxl * lineHeights.tight,
    },
    h4: {
      fontSize: FontSize.xl,
      fontWeight: FontWeight.bold,
      color: color.text,
      lineHeight: FontSize.xl * lineHeights.tight,
    },
    h5: {
      fontSize: FontSize.lg,
      fontWeight: FontWeight.bold,
      color: color.text,
      lineHeight: FontSize.lg * lineHeights.tight,
    },
    h6: {
      fontSize: FontSize.md,
      fontWeight: FontWeight.bold,
      color: color.text,
      lineHeight: FontSize.md * lineHeights.tight,
    },
    
    // Body text
    bodyLarge: {
      fontSize: FontSize.lg,
      fontWeight: FontWeight.regular,
      color: color.text,
      lineHeight: FontSize.lg * lineHeights.normal,
    },
    bodyMedium: {
      fontSize: FontSize.md,
      fontWeight: FontWeight.regular,
      color: color.text,
      lineHeight: FontSize.md * lineHeights.normal,
    },
    bodySmall: {
      fontSize: FontSize.sm,
      fontWeight: FontWeight.regular,
      color: color.text,
      lineHeight: FontSize.sm * lineHeights.normal,
    },
    
    // Secondary text variations
    bodyLargeSecondary: {
      fontSize: FontSize.lg,
      fontWeight: FontWeight.regular,
      color: color.textSecondary,
      lineHeight: FontSize.lg * lineHeights.normal,
    },
    bodyMediumSecondary: {
      fontSize: FontSize.md,
      fontWeight: FontWeight.regular,
      color: color.textSecondary,
      lineHeight: FontSize.md * lineHeights.normal,
    },
    bodySmallSecondary: {
      fontSize: FontSize.sm,
      fontWeight: FontWeight.regular,
      color: color.textSecondary,
      lineHeight: FontSize.sm * lineHeights.normal,
    },
    
    // Captions
    caption: {
      fontSize: FontSize.xs,
      fontWeight: FontWeight.regular,
      color: color.textTertiary,
      lineHeight: FontSize.xs * lineHeights.loose,
    },
    
    // Special styles
    button: {
      fontSize: FontSize.md,
      fontWeight: FontWeight.medium,
      lineHeight: FontSize.md * lineHeights.tight,
    },
    buttonSmall: {
      fontSize: FontSize.sm,
      fontWeight: FontWeight.medium,
      lineHeight: FontSize.sm * lineHeights.tight,
    },
    buttonLarge: {
      fontSize: FontSize.lg,
      fontWeight: FontWeight.medium,
      lineHeight: FontSize.lg * lineHeights.tight,
    },
    label: {
      fontSize: FontSize.sm,
      fontWeight: FontWeight.medium,
      color: color.textSecondary,
      lineHeight: FontSize.sm * lineHeights.tight,
    },
    
    // Weight variations
    medium: {
      fontWeight: FontWeight.medium,
    },
    semibold: {
      fontWeight: FontWeight.semibold,
    },
    bold: {
      fontWeight: FontWeight.bold,
    },
  });
};

// Export typography for light and dark modes
export const Typography = {
  light: createTypography('light'),
  dark: createTypography('dark'),
};

// Helper function to get appropriate typography for current theme
export const getTypography = (theme: 'light' | 'dark' = 'light') => {
  return Typography[theme];
};
