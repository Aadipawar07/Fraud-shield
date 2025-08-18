import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { checkMessageSafety, FraudCheckResponse } from "../../services/api";

export default function ScanScreen() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FraudCheckResponse | null>(null);
  const insets = useSafeAreaInsets();

  const handleScan = async () => {
    if (!message.trim()) {
      Alert.alert("Error", "Please enter a message to scan");
      return;
    }

    setIsLoading(true);
    try {
      const scanResult = await checkMessageSafety(message);
      setResult(scanResult);
    } catch (error) {
      Alert.alert("Error", "Failed to scan message. Please try again.");
      console.error("Scan error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResult = () => {
    setResult(null);
    setMessage("");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: Math.max(24, insets.bottom) }}
    >
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.header}>
          🔍 SMS Fraud Scanner
        </Text>

        {/* Input Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Enter SMS Message:
          </Text>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Paste or type the SMS message you want to check for fraud..."
            value={message}
            onChangeText={setMessage}
            textAlignVertical="top"
          />

          <TouchableOpacity
            onPress={handleScan}
            disabled={isLoading || !message.trim()}
            style={[
              styles.scanButton,
              (isLoading || !message.trim()) && styles.scanButtonDisabled
            ]}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="white" size="small" />
                <Text style={styles.loadingText}>
                  Scanning...
                </Text>
              </View>
            ) : (
              <Text style={styles.scanButtonText}>
                🔍 Scan for Fraud
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        {result && (
          <View
            style={[
              styles.resultCard,
              result.safe ? styles.resultCardSafe : styles.resultCardDanger
            ]}
          >
            <Text
              style={[
                styles.resultTitle,
                result.safe ? styles.resultTitleSafe : styles.resultTitleDanger
              ]}
            >
              {result.safe ? "✅ Message is Safe" : "⚠️ Fraud Detected"}
            </Text>

            <Text
              style={[
                styles.resultReason,
                result.safe ? styles.resultReasonSafe : styles.resultReasonDanger
              ]}
            >
              {result.reason}
            </Text>
            
            {result.confidence && (
              <Text style={styles.confidenceText}>
                Confidence: {(result.confidence * 100).toFixed(1)}%
                {result.method && ` | Method: ${result.method}`}
              </Text>
            )}

            <TouchableOpacity
              onPress={clearResult}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>
                Scan Another Message
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Example Messages */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            📋 Test Examples:
          </Text>
          <Text style={styles.exampleText}>
            • "Congratulations! You've won $1000! Click here to claim..."
          </Text>
          <Text style={styles.exampleText}>
            • "Your account has been suspended. Verify now or lose access."
          </Text>
          <Text style={styles.exampleText}>
            • "Hi, how are you doing today?"
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 16,
  },
  scanButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  scanButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  scanButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  resultCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultCardSafe: {
    backgroundColor: '#f0fdf4',
  },
  resultCardDanger: {
    backgroundColor: '#fef2f2',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  resultTitleSafe: {
    color: '#166534',
  },
  resultTitleDanger: {
    color: '#991b1b',
  },
  resultReason: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  resultReasonSafe: {
    color: '#15803d',
  },
  resultReasonDanger: {
    color: '#dc2626',
  },
  clearButton: {
    backgroundColor: '#4b5563',
    borderRadius: 12,
    padding: 12,
  },
  clearButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  exampleText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  confidenceText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },
});
