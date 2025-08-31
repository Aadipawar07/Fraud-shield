import React from 'react';
import { 
  StyleSheet,
  StyleProp, 
  ViewStyle,
  TouchableOpacityProps,
  TouchableOpacity
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { BorderRadius, Shadow } from '@/constants/Shape';
import { Spacing } from '@/constants/Spacing';
import { useTheme } from '@/context/ThemeContext';

// Define touchable card props
export interface ThemedTouchableCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  lightColor?: string;
  darkColor?: string;
  lightBorderColor?: string;
  darkBorderColor?: string;
  shadow?: keyof typeof Shadow | boolean;
  padding?: number | boolean;
  margin?: number | boolean;
  center?: boolean;
}

export const ThemedTouchableCard: React.FC<ThemedTouchableCardProps> = ({
  children,
  style,
  lightColor,
  darkColor,
  lightBorderColor,
  darkBorderColor,
  shadow = 'md',
  padding = true,
  margin = true,
  center = false,
  activeOpacity = 0.7,
  ...restProps
}) => {
  const { colorScheme } = useTheme();
  
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'card'
  );
  
  const borderColor = useThemeColor(
    { light: lightBorderColor, dark: darkBorderColor },
    'border'
  );

  // Calculate padding based on input
  const paddingValue = padding === true ? Spacing.md : padding || 0;
  
  // Calculate margin based on input
  const marginValue = margin === true ? Spacing.sm : margin || 0;
  
  // Get shadow styles if specified
  let shadowStyles = {};
  if (shadow && typeof shadow === 'string') {
    shadowStyles = Shadow[shadow];
  } else if (shadow === true) {
    // Use default shadow if true
    shadowStyles = Shadow.md;
  }
  
  // Build the combined style object
  const touchableStyle: StyleProp<ViewStyle> = [
    styles.card,
    { 
      backgroundColor,
      padding: paddingValue,
      margin: marginValue,
      borderRadius: BorderRadius.lg
    },
    lightBorderColor || darkBorderColor ? { borderWidth: 1, borderColor } : undefined,
    shadow ? shadowStyles : undefined,
    center ? { justifyContent: 'center', alignItems: 'center' } : undefined,
    style,
  ];

  return (
    <TouchableOpacity 
      style={touchableStyle} 
      activeOpacity={activeOpacity}
      {...restProps}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
  },
});

export default ThemedTouchableCard;
