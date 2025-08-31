/**
 * Fraud Shield Shape System
 * This file defines consistent border radius and other shape properties.
 */

// Border radius scale
export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999, // For pill-shaped elements
  circle: 9999, // For circular elements
};

// Border width scale
export const BorderWidth = {
  none: 0,
  thin: 1, 
  normal: 2,
  thick: 3,
};

// Shadows for different elevations
export const Shadow = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#5A6B87',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#5A6B87',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#5A6B87',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#5A6B87',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  xl: {
    shadowColor: '#5A6B87',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 12,
  },
};

// Standard shape presets that can be used for components
export const Shape = {
  // Button shapes
  buttonPrimary: {
    borderRadius: BorderRadius.md,
  },
  buttonSecondary: {
    borderRadius: BorderRadius.md,
  },
  buttonPill: {
    borderRadius: BorderRadius.pill,
  },
  buttonSmall: {
    borderRadius: BorderRadius.sm,
  },
  
  // Card shapes
  card: {
    borderRadius: BorderRadius.lg,
  },
  cardCompact: {
    borderRadius: BorderRadius.md,
  },
  
  // Input shapes
  input: {
    borderRadius: BorderRadius.md,
  },
  
  // Avatar shapes
  avatarSquare: {
    borderRadius: BorderRadius.sm,
  },
  avatarRound: {
    borderRadius: BorderRadius.circle,
  },
};

// Exports a default shape configuration
export default {
  borderRadius: BorderRadius,
  borderWidth: BorderWidth,
  shadow: Shadow,
  shape: Shape,
};
