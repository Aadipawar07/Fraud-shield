import React, { useState } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { BorderRadius, BorderWidth } from '@/constants/Shape';
import { Spacing } from '@/constants/Spacing';
import { FontSize } from '@/constants/Typography';
import { Colors } from '@/constants/Colors';
import { ThemedText } from './ThemedText';
import { MaterialIcons } from '@expo/vector-icons';

export type InputVariant = 'outlined' | 'filled' | 'underlined';
export type InputSize = 'small' | 'medium' | 'large';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: InputVariant;
  size?: InputSize;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  hintStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
  secureToggle?: boolean;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<TextInput, InputProps>(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  variant = 'outlined',
  size = 'medium',
  containerStyle,
  inputStyle,
  labelStyle,
  hintStyle,
  errorStyle,
  secureToggle = false,
  fullWidth = false,
  // style is already covered by inputStyle
  placeholder,
  value,
  secureTextEntry,
  ...rest
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [secureText, setSecureText] = useState(secureTextEntry);

  // Get theme colors
  const backgroundColor = useThemeColor({}, variant === 'filled' ? 'backgroundSecondary' : 'background');
  const borderColor = useThemeColor({}, isFocused ? 'tint' : error ? 'danger' : 'border');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'textTertiary');
  const labelColor = useThemeColor({}, isFocused ? 'tint' : error ? 'danger' : 'textSecondary');
  const errorColor = useThemeColor({}, 'danger');
  const hintColor = useThemeColor({}, 'textTertiary');

  // Handle input focus
  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (rest.onFocus) rest.onFocus(e);
  };

  // Handle input blur
  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (rest.onBlur) rest.onBlur(e);
  };

  // Toggle password visibility
  const toggleSecureEntry = () => {
    setSecureText(!secureText);
  };

  // Get padding based on size
  const getPadding = () => {
    switch (size) {
      case 'small':
        return Spacing.xs;
      case 'large':
        return Spacing.lg;
      default:
        return Spacing.md;
    }
  };

  // Get height based on size
  const getHeight = () => {
    switch (size) {
      case 'small':
        return 40;
      case 'large':
        return 56;
      default:
        return 48;
    }
  };

  // Get font size based on size
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return FontSize.sm;
      case 'large':
        return FontSize.lg;
      default:
        return FontSize.md;
    }
  };

  // Container styles based on variant
  const getContainerStyle = () => {
    const padding = getPadding();
    const height = getHeight();

    switch (variant) {
      case 'outlined':
        return {
          borderWidth: BorderWidth.thin,
          borderColor,
          borderRadius: BorderRadius.md,
          backgroundColor,
          height,
        };
      case 'filled':
        return {
          backgroundColor,
          borderRadius: BorderRadius.md,
          height,
        };
      case 'underlined':
        return {
          borderBottomWidth: BorderWidth.thin,
          borderColor,
          height,
        };
      default:
        return {};
    }
  };

  // Right icon to show
  const renderRightIcon = () => {
    if (secureToggle && secureTextEntry !== undefined) {
      return (
        <TouchableOpacity onPress={toggleSecureEntry} style={styles.iconContainer}>
          <MaterialIcons
            name={secureText ? 'visibility-off' : 'visibility'}
            size={24}
            color={placeholderColor}
          />
        </TouchableOpacity>
      );
    } else if (rightIcon) {
      return <View style={styles.iconContainer}>{rightIcon}</View>;
    }
    return null;
  };

  return (
    <View style={[styles.wrapper, fullWidth && styles.fullWidth, containerStyle]}>
      {label && (
        <ThemedText
          variant="label"
          style={[styles.label, { color: labelColor }, labelStyle]}
        >
          {label}
        </ThemedText>
      )}

      <View style={[styles.container, getContainerStyle()]}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}

        <TextInput
          ref={ref}
          style={[
            styles.input,
            {
              color: textColor,
              fontSize: getFontSize(),
              paddingHorizontal: leftIcon || rightIcon ? Spacing.xs : Spacing.md,
              flex: 1,
            },
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          secureTextEntry={secureText}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />

        {renderRightIcon()}
      </View>

      {error ? (
        <ThemedText
          variant="caption"
          style={[styles.error, { color: errorColor }, errorStyle]}
        >
          {error}
        </ThemedText>
      ) : hint ? (
        <ThemedText
          variant="caption"
          style={[styles.hint, { color: hintColor }, hintStyle]}
        >
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    marginBottom: Spacing.xs,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  input: {
    paddingVertical: 0,
  },
  iconContainer: {
    paddingHorizontal: Spacing.sm,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    marginTop: Spacing.xs,
  },
  hint: {
    marginTop: Spacing.xs,
  },
});

export default Input;
