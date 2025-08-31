import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ThemeToggleProps {
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function ThemeToggle({ showLabel = true, size = 'medium' }: ThemeToggleProps) {
  const { colorScheme, themeMode, setThemeMode } = useTheme();
  const iconSize = size === 'small' ? 18 : size === 'medium' ? 24 : 30;
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  
  const cycleModes = () => {
    // Cycle through modes: light -> dark -> system -> light
    if (themeMode === 'light') {
      setThemeMode('dark');
    } else if (themeMode === 'dark') {
      setThemeMode('system');
    } else {
      setThemeMode('light');
    }
  };
  
  const getIconName = () => {
    if (themeMode === 'system') {
      return colorScheme === 'dark' ? 'phone-portrait' : 'phone-portrait-outline';
    }
    return colorScheme === 'dark' ? 'moon' : 'sunny';
  };
  
  const getLabelText = () => {
    if (themeMode === 'system') return 'System';
    return themeMode.charAt(0).toUpperCase() + themeMode.slice(1);
  };
  
  return (
    <TouchableOpacity 
      onPress={cycleModes}
      style={[
        styles.container,
        { backgroundColor, paddingVertical: size === 'small' ? 4 : 8 }
      ]}
    >
      <View style={styles.content}>
        <Ionicons 
          name={getIconName()} 
          size={iconSize} 
          color={textColor} 
        />
        {showLabel && (
          <ThemedText style={styles.label}>{getLabelText()}</ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  }
});
