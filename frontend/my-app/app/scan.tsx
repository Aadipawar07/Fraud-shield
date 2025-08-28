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
import { checkMessageSafety, FraudCheckResponse } from "../services/api";
import { formatConfidencePercentage } from "../utils/formatters";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔍 SMS Fraud Scanner</Text>
        <View style={styles.placeholder}></View>
      </View>
      
      <View style={styles.content}>
        {/* Input Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Enter SMS Message:</Text>
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
              (isLoading || !message.trim()) && styles.scanButtonDisabled,
            ]}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="white" size="small" />
                <Text style={styles.loadingText}>Scanning...</Text>
              </View>
            ) : (
              <Text style={styles.scanButtonText}>🔍 Scan for Fraud</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        {result && (
          <View
            style={[
              styles.resultCard,
              result.safe ? styles.resultCardSafe : styles.resultCardDanger,
            ]}
          >
            <Text
              style={[
                styles.resultTitle,
                result.safe ? styles.resultTitleSafe : styles.resultTitleDanger,
              ]}
            >
              {result.safe ? "✅ Message is Safe" : "⚠️ Fraud Detected"}
            </Text>

            {/* Safety Score */}
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Safety Score:</Text>
              <View style={styles.scoreRow}>
                <View
                  style={[
                    styles.scoreBar,
                    {
                      backgroundColor: result.safe ? "#dcfce7" : "#fee2e2",
                      borderColor: result.safe ? "#15803d" : "#b91c1c",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.scoreValue,
                      {
                        width: `${
                          result.safe
                            ? result.safetyScore
                            : 100 - result.safetyScore
                        }%`,
                        backgroundColor: result.safe ? "#15803d" : "#b91c1c",
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.scorePercentage,
                    {
                      color: result.safe ? "#15803d" : "#b91c1c",
                    },
                  ]}
                >
                  {formatConfidencePercentage(
                    result.safe ? result.safetyScore : 100 - result.safetyScore
                  )}
                </Text>
              </View>
            </View>

            {/* Analysis Results */}
            <View style={styles.analysisContainer}>
              <Text style={styles.analysisTitle}>Analysis:</Text>
              <Text style={styles.analysisText}>{result.analysis}</Text>
            </View>

            {/* Recommendations */}
            <View style={styles.recommendationsContainer}>
              <Text style={styles.recommendationsTitle}>Recommendations:</Text>
              {result.safe ? (
                <Text style={styles.recommendationText}>
                  This message appears to be safe. However, always remain
                  vigilant against fraud attempts.
                </Text>
              ) : (
                <View style={styles.recommendationsList}>
                  <View style={styles.recommendationItem}>
                    <Ionicons
                      name="close-circle-outline"
                      size={20}
                      color="#b91c1c"
                    />
                    <Text style={styles.recommendationText}>
                      Do not respond to this message
                    </Text>
                  </View>
                  <View style={styles.recommendationItem}>
                    <Ionicons
                      name="close-circle-outline"
                      size={20}
                      color="#b91c1c"
                    />
                    <Text style={styles.recommendationText}>
                      Do not click on any links in the message
                    </Text>
                  </View>
                  <View style={styles.recommendationItem}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={20}
                      color="#b91c1c"
                    />
                    <Text style={styles.recommendationText}>
                      Report this message through the Report tab
                    </Text>
                  </View>
                  <View style={styles.recommendationItem}>
                    <Ionicons name="shield-outline" size={20} color="#b91c1c" />
                    <Text style={styles.recommendationText}>
                      Block this number on your phone
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.reportButton}
                onPress={() => {
                  if (result.phoneNumber) {
                    router.push({
                      pathname: "/report",
                      params: {
                        phoneNumber: result.phoneNumber,
                        message: message,
                      },
                    });
                  } else {
                    router.push("/report");
                  }
                }}
              >
                <Text style={styles.reportButtonText}>Report This Message</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearResult}
              >
                <Text style={styles.clearButtonText}>Clear Results</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 16,
    height: 120,
    fontSize: 16,
    backgroundColor: "#f8fafc",
    color: "#334155",
    marginBottom: 16,
  },
  scanButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  scanButtonDisabled: {
    backgroundColor: "#a5b4fc",
  },
  scanButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  resultCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resultCardSafe: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  resultCardDanger: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  resultTitleSafe: {
    color: "#15803d",
  },
  resultTitleDanger: {
    color: "#b91c1c",
  },
  scoreContainer: {
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreBar: {
    flex: 1,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    overflow: "hidden",
  },
  scoreValue: {
    height: "100%",
  },
  scorePercentage: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "700",
  },
  analysisContainer: {
    marginBottom: 20,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 22,
  },
  recommendationsContainer: {
    marginBottom: 20,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  recommendationsList: {
    marginTop: 8,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 15,
    color: "#334155",
    marginLeft: 8,
    flex: 1,
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: "column",
    gap: 12,
  },
  reportButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  reportButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  clearButton: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    backgroundColor: "white",
  },
  clearButtonText: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "600",
  },
});
