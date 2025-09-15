import React from "react";
import { View, type ViewProps, ViewStyle, Animated, StyleProp } from "react-native";
import { useThemeColor } from "../hooks/useThemeColor";
import { Shadow } from "../constants/Shape";
import { useTheme } from "../context/ThemeContext";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  lightBorderColor?: string;
  darkBorderColor?: string;
  lightBottomBorderColor?: string;
  darkBottomBorderColor?: string;
  shadow?: keyof typeof Shadow | boolean;
  padding?: number;
  margin?: number;
  center?: boolean;
  card?: boolean;
  animated?: boolean;
  elevation?: number;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  lightBorderColor,
  darkBorderColor,
  lightBottomBorderColor,
  darkBottomBorderColor,
  shadow,
  padding,
  margin,
  center,
  card = false,
  animated = false,
  elevation,
  ...otherProps
}: ThemedViewProps) {
  const { colorScheme } = useTheme();
  
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    card ? "card" : "background",
  );
  
  const borderColor = useThemeColor(
    { light: lightBorderColor, dark: darkBorderColor }, 
    "border"
  );
  
  const borderBottomColor = useThemeColor(
    { light: lightBottomBorderColor, dark: darkBottomBorderColor },
    "border"
  );

  // Get shadow styles if specified
  let shadowStyles = {};
  if (shadow && typeof shadow === 'string') {
    shadowStyles = Shadow[shadow];
  } else if (shadow === true) {
    // Use default shadow if true
    shadowStyles = Shadow.md;
  }
  
  // Build the combined style object
  const viewStyle: StyleProp<ViewStyle> = [
    { backgroundColor },
    lightBorderColor || darkBorderColor ? { borderColor } : undefined,
    lightBottomBorderColor || darkBottomBorderColor ? { borderBottomColor } : undefined,
    shadow ? shadowStyles : undefined,
    padding !== undefined ? { padding } : undefined,
    margin !== undefined ? { margin } : undefined,
    center ? { justifyContent: 'center', alignItems: 'center' } : undefined,
    style,
  ];

  return <View style={viewStyle} {...otherProps} />;
}

// Export as default
export default ThemedView;
