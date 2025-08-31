import React from 'react';
import { 
  View, 
  StyleSheet, 
  StyleProp, 
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Shadow, BorderRadius } from '@/constants/Shape';
import { Spacing } from '@/constants/Spacing';

// Define card variant types
export type CardVariant = 'elevated' | 'flat' | 'outlined';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: CardVariant;
  padding?: boolean | number;
  margin?: boolean | number;
  elevated?: boolean | number; // elevation level or boolean
}

// Touchable version of Card props
export interface TouchableCardProps extends Omit<TouchableOpacityProps, 'style'> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: CardVariant;
  padding?: boolean | number;
  margin?: boolean | number;
  elevated?: boolean | number; // elevation level or boolean
  onPress: () => void;
}

// Base Card component
export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'elevated',
  padding = true,
  margin = true,
  elevated = true,
}) => {
  // Get theme colors
  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  
  // Calculate padding based on input
  const paddingValue = padding === true ? Spacing.lg : padding || 0;
  
  // Calculate margin based on input
  const marginValue = margin === true ? Spacing.md : margin || 0;
  
  // Get appropriate shadow based on variant and elevation
  let shadowProps = {};
  
  if (variant === 'elevated') {
    const elevationLevel = elevated === true ? 'sm' : 
                          elevated === false ? 'none' : 
                          elevated <= 1 ? 'xs' :
                          elevated <= 2 ? 'sm' :
                          elevated <= 4 ? 'md' :
                          elevated <= 8 ? 'lg' : 'xl';
                          
    shadowProps = Shadow[elevationLevel as keyof typeof Shadow];
  }
  
  // Build the container styles
  const containerStyle: StyleProp<ViewStyle> = [
    styles.card,
    { 
      backgroundColor,
      padding: paddingValue,
      margin: marginValue,
      borderRadius: BorderRadius.lg,
    },
    variant === 'outlined' && { 
      borderWidth: 1, 
      borderColor,
    },
    variant === 'elevated' && shadowProps,
    style,
  ];
  
  return <View style={containerStyle}>{children}</View>;
};

// Touchable version of Card
export const TouchableCard: React.FC<TouchableCardProps> = ({
  children,
  style,
  variant = 'elevated',
  padding = true,
  margin = true,
  elevated = true,
  onPress,
  activeOpacity = 0.7,
  ...restProps
}) => {
  // Get theme colors
  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  
  // Calculate padding based on input
  const paddingValue = padding === true ? Spacing.lg : padding || 0;
  
  // Calculate margin based on input
  const marginValue = margin === true ? Spacing.md : margin || 0;
  
  // Get appropriate shadow based on variant and elevation
  let shadowProps = {};
  
  if (variant === 'elevated') {
    const elevationLevel = elevated === true ? 'sm' : 
                          elevated === false ? 'none' : 
                          elevated <= 1 ? 'xs' :
                          elevated <= 2 ? 'sm' :
                          elevated <= 4 ? 'md' :
                          elevated <= 8 ? 'lg' : 'xl';
                          
    shadowProps = Shadow[elevationLevel as keyof typeof Shadow];
  }
  
  // Build the container styles
  const containerStyle: StyleProp<ViewStyle> = [
    styles.card,
    { 
      backgroundColor,
      padding: paddingValue,
      margin: marginValue,
      borderRadius: BorderRadius.lg,
    },
    variant === 'outlined' && { 
      borderWidth: 1, 
      borderColor,
    },
    variant === 'elevated' && shadowProps,
    style,
  ];
  
  return (
    <TouchableOpacity 
      style={containerStyle} 
      onPress={onPress}
      activeOpacity={activeOpacity}
      {...restProps}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});

export default Card;
