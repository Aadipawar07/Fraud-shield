import React from 'react';
import Button, { ButtonProps } from './Button';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedButtonProps = ButtonProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedButton({
  lightColor,
  darkColor,
  ...rest
}: ThemedButtonProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'tint'
  );

  // Pass the themed background color as part of the button style
  return (
    <Button
      buttonStyle={lightColor || darkColor ? { backgroundColor } : undefined}
      {...rest}
    />
  );
}

export default ThemedButton;
