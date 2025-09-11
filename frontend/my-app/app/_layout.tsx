import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
// import "./global.css"; // Temporarily disabled for bundling fix
import "./uuid-fix"; // Import crypto polyfill for UUID

export default function Layout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Stack
          screenOptions={{
            headerTintColor: "#fff",
            headerTitleStyle: { fontWeight: "bold" },
            headerShown: false,
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ title: "Not Found" }} />
          <Stack.Screen name="design-system" options={{ title: "Design System", headerShown: true }} />
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
          <Stack.Screen name="sign-up" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ title: "Profile", headerShown: true }} />
        </Stack>
        <Toast />
      </ThemeProvider>
    </AuthProvider>
  );
}
