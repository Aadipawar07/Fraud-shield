/**
 * Fraud Shield Theme System
 * This file combines all design tokens into a cohesive theme object.
 */

import { Colors, Palette } from './Colors';
import { Typography, getTypography } from './Typography';
import { Spacing } from './Spacing';
import { BorderRadius, BorderWidth, Shadow, Shape } from './Shape';

// Create a complete theme object
export const Theme = {
  colors: Colors,
  palette: Palette,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  borderWidth: BorderWidth,
  shadow: Shadow,
  shape: Shape,
  
  // Add any additional theme properties here
};

// Helper to get the complete theme object for the current mode
export const getTheme = (colorMode: 'light' | 'dark' = 'light') => {
  return {
    ...Theme,
    colors: Colors[colorMode],
    typography: Typography[colorMode],
  };
};

// Export theme types for TypeScript
export type ThemeColors = typeof Colors.light;
export type ThemeTypography = typeof Typography.light;

export default Theme;
