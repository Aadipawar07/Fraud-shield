import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { AuthProvider } from "../context/AuthContext";
// import "./global.css"; // Temporarily disabled for bundling fix
import "./uuid-fix"; // Import crypto polyfill for UUID

export default function Layout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: "Not Found" }} />
      </Stack>
      <Toast />
    </AuthProvider>
  );
}
