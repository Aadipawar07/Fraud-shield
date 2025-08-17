// app/index.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { checkMessageSafety } from "@/services/api";

export default function HomeScreen() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!message.trim()) {
      setResult("❌ Please enter a message to check.");
      return;
    }

    const res = await checkMessageSafety(message);
    setResult(res.safe ? `✅ Safe: ${res.reason}` : `⚠️ Fraud: ${res.reason}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fraud Message Checker</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter a message..."
        value={message}
        onChangeText={setMessage}
      />

      <Button title="Check Safety" onPress={handleCheck} />

      {result && <Text style={styles.result}>{result}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  result: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "600",
  },
});
