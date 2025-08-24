import React, { useState } from "react";
import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
import { checkMessageSafety, FraudCheckResponse } from "../services/api";

// Define the result type
interface TestResult {
  message: string;
  result: FraudCheckResponse;
  timestamp: string;
}

export default function TestApiScreen() {
  const [results, setResults] = useState<TestResult[]>([]);

  const testMessages = [
    "Congratulations! You have won $10000! Click here to claim now!",
    "Your account has been suspended. Verify now or lose access.",
    "Hi there! How are you doing today?",
    "Meeting at 3 PM today. See you there!",
  ];

  const runTest = async (message: string) => {
    try {
      const result = await checkMessageSafety(message);
      const newResult = {
        message,
        result,
        timestamp: new Date().toLocaleTimeString(),
      };
      setResults((prev) => [newResult, ...prev]);
    } catch (error) {
      console.error("Test error:", error);
    }
  };

  const runAllTests = async () => {
    setResults([]);
    for (const message of testMessages) {
      await runTest(message);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second between tests
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>🧪 API Test Page</Text>

      <Button title="Run All Tests" onPress={runAllTests} />

      {testMessages.map((message, index) => (
        <View key={index} style={styles.testButton}>
          <Text style={styles.messageText} numberOfLines={2}>
            {message}
          </Text>
          <Button title="Test" onPress={() => runTest(message)} />
        </View>
      ))}

      <Text style={styles.resultsHeader}>Results:</Text>
      {results.map((item, index) => (
        <View
          key={index}
          style={[
            styles.resultItem,
            item.result.safe ? styles.safeResult : styles.fraudResult,
          ]}
        >
          <Text style={styles.timestamp}>{item.timestamp}</Text>
          <Text style={styles.messageText} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.resultText}>
            Status: {item.result.safe ? "SAFE" : "FRAUD"}
          </Text>
          <Text style={styles.reasonText}>{item.result.reason}</Text>
          {item.result.confidence && (
            <Text style={styles.confidenceText}>
              Confidence: {(item.result.confidence * 100).toFixed(1)}%
            </Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: "white",
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  messageText: {
    flex: 1,
    marginRight: 8,
    fontSize: 14,
  },
  resultsHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  resultItem: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
  },
  safeResult: {
    backgroundColor: "#e6ffe6",
  },
  fraudResult: {
    backgroundColor: "#ffe6e6",
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  resultText: {
    fontWeight: "bold",
    marginVertical: 4,
  },
  reasonText: {
    fontSize: 14,
    marginVertical: 2,
  },
  confidenceText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
});
