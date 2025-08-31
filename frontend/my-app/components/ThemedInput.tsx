import React, { useState } from 'react';
import { TextInput, TouchableOpacity, StyleSheet, TextInputProps, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useThemeColor } from '../hooks/useThemeColor';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

interface ThemedInputProps extends TextInputProps {
  label?: string;
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightIconPress?: () => void;
  onLeftIconPress?: () => void;
  error?: string;
  showClearButton?: boolean;
  containerStyle?: any;
  inputStyle?: any;
}

export default function ThemedInput({
  label,
  leftIcon,
  rightIcon,
  onRightIconPress,
  onLeftIconPress,
  error,
  showClearButton = true,
  containerStyle,
  inputStyle,
  value,
  onChangeText,
  ...props
}: ThemedInputProps) {
  const { colorScheme } = useTheme();
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'textSecondary');
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const primaryColor = useThemeColor({}, 'tint');
  const errorColor = useThemeColor({}, 'warning');
  const borderColor = useThemeColor({}, 'border');
  
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <ThemedView style={[styles.container, containerStyle]}>
      {label && (
        <ThemedText style={styles.label}>{label}</ThemedText>
      )}
      
      <ThemedView 
        style={[
          styles.inputContainer, 
          isFocused && { borderColor: primaryColor },
          error && { borderColor: errorColor },
          { backgroundColor }
        ]}
      >
        {leftIcon && (
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={onLeftIconPress}
            disabled={!onLeftIconPress}
          >
            <MaterialIcons name={leftIcon} size={20} color={isFocused ? primaryColor : placeholderColor} />
          </TouchableOpacity>
        )}
        
        <TextInput
          style={[
            styles.input,
            { color: textColor },
            inputStyle
          ]}
          placeholderTextColor={placeholderColor}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={value}
          onChangeText={onChangeText}
          {...props}
        />
        
        {showClearButton && value && value.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => onChangeText?.('')}
          >
            <MaterialIcons name="cancel" size={18} color={placeholderColor} />
          </TouchableOpacity>
        )}
        
        {rightIcon && (
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            <MaterialIcons name={rightIcon} size={20} color={isFocused ? primaryColor : placeholderColor} />
          </TouchableOpacity>
        )}
      </ThemedView>
      
      {error && (
        <ThemedText style={[styles.errorText, { color: errorColor }]}>{error}</ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  iconContainer: {
    padding: 4,
  },
  clearButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  }
});
