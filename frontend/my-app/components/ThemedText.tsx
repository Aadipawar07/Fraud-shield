import React, { useContext } from "react";
import { Text, type TextProps, Animated } from "react-native";
import { useThemeColor } from "../hooks/useThemeColor";
import { getTypography } from "../constants/Typography";
import { useTheme } from "../context/ThemeContext";

export type ThemedTextVariant = 
  | "display"
  | "h1"
  | "h2"
  | "h3" 
  | "h4"
  | "h5"
  | "h6"
  | "bodyLarge"
  | "bodyMedium"
  | "bodySmall"
  | "bodyLargeSecondary"
  | "bodyMediumSecondary"
  | "bodySmallSecondary"
  | "caption"
  | "button"
  | "buttonSmall"
  | "buttonLarge"
  | "label";

export type ThemedTextWeight = "medium" | "semibold" | "bold";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: ThemedTextVariant;
  weight?: ThemedTextWeight;
  secondary?: boolean;
  animated?: boolean;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  variant = "bodyMedium",
  weight,
  secondary = false,
  animated = false,
  ...rest
}: ThemedTextProps) {
  const { colorScheme } = useTheme();
  
  const color = useThemeColor(
    { light: lightColor, dark: darkColor }, 
    secondary ? "textSecondary" : "text"
  );
  
  // Get typography styles from the theme
  const typography = getTypography(colorScheme);
  
  // Create style array
  const textStyle = [
    // Apply variant styling
    typography[variant as keyof typeof typography],
    
    // Apply custom color if provided
    { color },
    
    // Apply custom weight if provided
    weight ? typography[weight as keyof typeof typography] : undefined,
    
    // Apply custom styles
    style,
  ];

  // If animated, use Animated.Text for smoother transitions
  if (animated) {
    return <Animated.Text style={textStyle} {...rest} />;
  }

  return <Text style={textStyle} {...rest} />;
}

export default ThemedText;
