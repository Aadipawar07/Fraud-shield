import { Stack } from "expo-router";
// import "./global.css"; // Temporarily disabled for bundling fix

export default function Layout() {
  return (
    <Stack screenOptions={{
      headerTintColor: "#fff",
      headerTitleStyle: { fontWeight: "bold" },
      headerShown: false,
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" options={{ title: "Not Found" }} />
    </Stack>
  );
}
