import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';
import { BorderRadius } from '@/constants/Shape';
import { Spacing } from '@/constants/Spacing';
import { FontSize, FontWeight } from '@/constants/Typography';

// Define variants
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

// Define sizes
export type ButtonSize = 'small' | 'medium' | 'large';

// Define button props extending TouchableOpacity props
export interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  title: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  textStyle?: StyleProp<TextStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary',
  size = 'medium',
  title,
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  fullWidth = false,
  textStyle,
  buttonStyle,
  style,
  ...restProps 
}) => {
  // Get theme colors
  const backgroundColor = useThemeColor({ 
    light: getButtonBackgroundColor(variant, 'light', disabled), 
    dark: getButtonBackgroundColor(variant, 'dark', disabled) 
  }, 'background');
  
  const textColor = useThemeColor({ 
    light: getButtonTextColor(variant, 'light', disabled),
    dark: getButtonTextColor(variant, 'dark', disabled)
  }, 'text');
  
  const borderColor = useThemeColor({ 
    light: getButtonBorderColor(variant, 'light', disabled),
    dark: getButtonBorderColor(variant, 'dark', disabled)
  }, 'border');

  // Merge styles
  const containerStyle: StyleProp<ViewStyle> = [
    styles.button,
    styles[`${size}Button`],
    { backgroundColor },
    variant === 'outline' && { borderColor, borderWidth: 1 },
    variant === 'ghost' && { backgroundColor: 'transparent' },
    disabled && { opacity: 0.6 },
    fullWidth && { width: '100%' },
    buttonStyle,
    style,
  ];

  const labelStyle: StyleProp<TextStyle> = [
    styles.text,
    styles[`${size}Text`],
    { color: textColor },
    textStyle,
  ];

  // Get appropriate size for loading indicator
  const loaderSize = size === 'small' ? 'small' : 'small';
  const iconSize = size === 'small' ? 16 : size === 'medium' ? 20 : 24;
  const iconMargin = size === 'small' ? Spacing.xs : Spacing.sm;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={containerStyle}
      disabled={disabled || loading}
      {...restProps}
    >
      <View style={styles.contentContainer}>
        {leftIcon && !loading && (
          <View style={{ marginRight: iconMargin }}>
            {leftIcon}
          </View>
        )}
        
        {loading ? (
          <ActivityIndicator 
            size={loaderSize} 
            color={textColor} 
          />
        ) : (
          <Text style={labelStyle}>{title}</Text>
        )}
        
        {rightIcon && !loading && (
          <View style={{ marginLeft: iconMargin }}>
            {rightIcon}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Helper functions for styling based on variant
function getButtonBackgroundColor(
  variant: ButtonVariant, 
  theme: 'light' | 'dark',
  disabled: boolean
): string {
  if (disabled) {
    return theme === 'light' ? Colors.light.backgroundTertiary : Colors.dark.backgroundTertiary;
  }

  switch (variant) {
    case 'primary':
      return theme === 'light' ? Colors.light.tint : Colors.dark.tint;
    case 'secondary':
      return theme === 'light' ? Colors.light.backgroundSecondary : Colors.dark.backgroundSecondary;
    case 'outline':
    case 'ghost':
      return 'transparent';
    case 'danger':
      return theme === 'light' ? Colors.light.danger : Colors.dark.danger;
    default:
      return theme === 'light' ? Colors.light.tint : Colors.dark.tint;
  }
}

function getButtonTextColor(
  variant: ButtonVariant, 
  theme: 'light' | 'dark',
  disabled: boolean
): string {
  if (disabled) {
    return theme === 'light' ? Colors.light.textTertiary : Colors.dark.textTertiary;
  }

  switch (variant) {
    case 'primary':
      return '#ffffff';
    case 'secondary':
      return theme === 'light' ? Colors.light.text : Colors.dark.text;
    case 'outline':
    case 'ghost':
      return theme === 'light' ? Colors.light.tint : Colors.dark.tint;
    case 'danger':
      return '#ffffff';
    default:
      return theme === 'light' ? Colors.light.text : Colors.dark.text;
  }
}

function getButtonBorderColor(
  variant: ButtonVariant, 
  theme: 'light' | 'dark',
  disabled: boolean
): string {
  if (disabled) {
    return theme === 'light' ? Colors.light.borderLight : Colors.dark.borderLight;
  }

  switch (variant) {
    case 'outline':
      return theme === 'light' ? Colors.light.tint : Colors.dark.tint;
    case 'danger':
      return theme === 'light' ? Colors.light.danger : Colors.dark.danger;
    default:
      return 'transparent';
  }
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  smallButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  mediumButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  largeButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  smallText: {
    fontSize: FontSize.sm,
  },
  mediumText: {
    fontSize: FontSize.md,
  },
  largeText: {
    fontSize: FontSize.lg,
  },
});

export default Button;
