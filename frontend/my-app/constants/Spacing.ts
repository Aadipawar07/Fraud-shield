/**
 * Fraud Shield Spacing System
 * This file defines the spacing values used throughout the app for consistent layout.
 */

// Base unit in pixels
const BASE_UNIT = 4;

// Spacing scale
export const Spacing = {
  // Core spacing values
  none: 0,
  xxs: BASE_UNIT, // 4
  xs: BASE_UNIT * 2, // 8
  sm: BASE_UNIT * 3, // 12
  md: BASE_UNIT * 4, // 16
  lg: BASE_UNIT * 6, // 24
  xl: BASE_UNIT * 8, // 32
  xxl: BASE_UNIT * 12, // 48
  xxxl: BASE_UNIT * 16, // 64
  
  // Custom aliases for common uses
  gutter: BASE_UNIT * 4, // 16 - standard padding for containers
  screenPadding: BASE_UNIT * 4, // 16 - standard padding for screens
  sectionSpacing: BASE_UNIT * 6, // 24 - spacing between major sections
  componentSpacing: BASE_UNIT * 4, // 16 - spacing between components
  itemSpacing: BASE_UNIT * 2, // 8 - spacing between items in a list
  
  // Function to get multiples of the base unit
  // Useful for one-off custom spacing needs
  units: (multiplier: number) => BASE_UNIT * multiplier,
};

// Export the base unit for reference
export const BASE_SPACING = BASE_UNIT;
