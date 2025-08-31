/**
 * Enhanced theme hook for Fraud Shield app
 * Uses the ThemeContext for theme-aware styling
 */

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useTheme } from "@/context/ThemeContext";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  // Try to use the theme context first if available
  let theme: "light" | "dark";
  
  try {
    // Get theme from context if available
    const themeContext = useTheme();
    theme = themeContext.colorScheme;
  } catch (e) {
    // Fall back to device color scheme if ThemeContext is not available
    theme = useColorScheme() ?? "light";
  }
  
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
