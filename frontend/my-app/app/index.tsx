import { Redirect } from "expo-router";

export default function Index() {
  // Redirect from the root route ('/') to your main tab index
  return <Redirect href="/(tabs)" />;
}
