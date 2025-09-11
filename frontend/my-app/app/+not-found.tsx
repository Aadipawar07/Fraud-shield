import { StyleSheet, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "../components/ThemedText";
import { ThemedView } from "../components/ThemedView";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeColor } from "../hooks/useThemeColor";

export default function NotFoundScreen() {
  const router = useRouter();
  const primaryColor = useThemeColor({}, "tint");

  return (
    <ThemedView style={styles.container}>
      <MaterialIcons name="error-outline" size={80} color={primaryColor} />
      <ThemedText style={styles.title}>Page Not Found</ThemedText>
      <ThemedText style={styles.message}>
        The page you are looking for doesn't exist or has been moved.
      </ThemedText>
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: primaryColor }]} 
        onPress={() => router.navigate("/(tabs)")}
      >
        <ThemedText style={styles.buttonText}>Go to Home</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 16,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  }
});
