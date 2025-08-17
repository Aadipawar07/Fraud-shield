// app/index.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from "react-native";
import Toast from 'react-native-toast-message';
import { checkMessageSafety } from "@/services/api";

const BASE_URL = "http://localhost:5000"; // Update this with your backend URL

export default function HomeScreen() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!message.trim()) {
      setResult("❌ Please enter a message to check.");
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter a message to check.',
        position: 'bottom'
      });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await checkMessageSafety(message);
      setResult(res.safe ? `✅ Safe: ${res.reason}` : `⚠️ Fraud: ${res.reason}`);
      Toast.show({
        type: res.safe ? 'success' : 'error',
        text1: res.safe ? 'Message is Safe' : 'Potential Fraud Detected!',
        text2: res.reason,
        position: 'bottom'
      });
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred while checking the message';
      setResult(`❌ Error: ${errorMessage}`);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
        position: 'bottom'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setMessage("");
    setResult(null);
    Toast.show({
      type: 'info',
      text1: 'Message Cleared',
      text2: 'The message has been cleared successfully.',
      position: 'bottom'
    });
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Fraud Message Checker</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter a message..."
          value={message}
          onChangeText={setMessage}
        />

        <Button title="Check Safety" onPress={handleCheck} />
        <View style={{ marginTop: 10 }}>
          <Button title="Delete Message" color="#d9534f" onPress={handleDelete} />
        </View>

    {loading && <ActivityIndicator size="large" color="#0a7ea4" style={{ marginTop: 20 }} />}
    {!loading && result && <Text style={styles.result}>{result}</Text>}
      </View>
      <Toast />
    </>
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
