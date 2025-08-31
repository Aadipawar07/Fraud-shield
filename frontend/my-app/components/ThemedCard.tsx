import React from 'react';
import { Card, CardProps, TouchableCard, TouchableCardProps } from './Card';
import { useThemeColor } from '@/hooks/useThemeColor';

export interface ThemedCardProps extends CardProps {
  lightColor?: string;
  darkColor?: string;
}

export interface ThemedTouchableCardProps extends TouchableCardProps {
  lightColor?: string;
  darkColor?: string;
}

// Non-touchable themed card
export function ThemedCard({ 
  lightColor, 
  darkColor, 
  style,
  ...rest 
}: ThemedCardProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor }, 
    'card'
  );
  
  return (
    <Card
      style={[{ backgroundColor }, style]}
      {...rest}
    />
  );
}

// Touchable themed card
export function ThemedTouchableCard({ 
  lightColor, 
  darkColor, 
  style,
  ...rest 
}: ThemedTouchableCardProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor }, 
    'card'
  );
  
  return (
    <TouchableCard
      style={[{ backgroundColor }, style]}
      {...rest}
    />
  );
}

export default ThemedCard;
