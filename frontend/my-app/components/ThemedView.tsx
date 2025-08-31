import { View, type ViewProps, StyleProp, ViewStyle } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Shadow } from "@/constants/Shape";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  lightBorderColor?: string;
  darkBorderColor?: string;
  shadow?: keyof typeof Shadow | boolean;
  padding?: number;
  margin?: number;
  center?: boolean;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  lightBorderColor,
  darkBorderColor,
  shadow,
  padding,
  margin,
  center,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background",
  );
  
  const borderColor = useThemeColor(
    { light: lightBorderColor, dark: darkBorderColor }, 
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
