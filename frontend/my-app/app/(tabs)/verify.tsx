import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { verifyPhoneNumber, VerifyNumberResponse } from "../../services/api";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import smsMonitorService from "../../services/smsMonitor";

interface VerificationResult {
  phoneNumber: string;
  isVerified: boolean;
  riskLevel: string;
  status: string;
}

export default function VerifyScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationResult, setVerificationResult] =
    useState<VerifyNumberResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<VerifyNumberResponse[]>([]);
  const insets = useSafeAreaInsets();

  const HISTORY_KEY = "verify_history";

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(HISTORY_KEY);
        if (raw) setHistory(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  const saveHistory = async (entry: VerifyNumberResponse) => {
    try {
      const next = [
        entry,
        ...history.filter((h) => h.normalized !== entry.normalized),
      ].slice(0, 10);
      setHistory(next);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {}
  };

  const pasteFromClipboard = async () => {
    try {
      const content = await Clipboard.getStringAsync();
      const normalized = content.replace(/[^0-9+]/g, "");
      setPhoneNumber(normalized);
    } catch {}
  };

  const handleVerify = async (overrideNumber?: string) => {
    const inputNumber = (overrideNumber ?? phoneNumber).trim();
    if (!inputNumber) {
      Alert.alert("Error", "Please enter a phone number to verify");
      return;
    }
    try {
      setIsLoading(true);
      const result = await verifyPhoneNumber(inputNumber);
      setVerificationResult(result);
      await saveHistory(result);
    } catch (e: any) {
      Alert.alert("Verification Failed", e?.message || "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const clearResult = () => {
    setVerificationResult(null);
    setPhoneNumber("");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: Math.max(24, insets.bottom) }}
    >
      <View style={styles.wrapper}>
        <Text style={styles.header}>🔍 Verify Sender</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Check Phone Number</Text>
          <Text style={styles.label}>Phone Number:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter phone number to verify"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={pasteFromClipboard}
              style={styles.secondaryBtn}
            >
              <Text style={styles.secondaryBtnText}>📋 Paste</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPhoneNumber("")}
              style={styles.secondaryBtn}
            >
              <Text style={styles.secondaryBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => handleVerify()}
            disabled={!phoneNumber.trim() || isLoading}
            style={[
              styles.primaryBtn,
              !phoneNumber.trim() || isLoading
                ? styles.btnDisabled
                : styles.btnOk,
            ]}
          >
            <Text style={styles.primaryBtnText}>
              {isLoading ? "Checking..." : "🔍 Verify Number"}
            </Text>
          </TouchableOpacity>
        </View>

        {verificationResult && (
          <View
            style={[
              styles.resultCard,
              {
                backgroundColor: verificationResult.isVerified
                  ? "#f0fdf4"
                  : "#fef2f2",
              },
            ]}
          >
            <Text
              style={[
                styles.resultTitle,
                {
                  color: verificationResult.isVerified ? "#166534" : "#991b1b",
                },
              ]}
            >
              {verificationResult.isVerified
                ? "✅ Number Verified"
                : "⚠️ Risk Detected"}
            </Text>
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.kv}>
                Phone:{" "}
                <Text style={styles.kvValue}>
                  {verificationResult.phoneNumber}
                </Text>
              </Text>
              <Text style={styles.kv}>
                Normalized:{" "}
                <Text style={styles.kvValue}>
                  {verificationResult.normalized}
                </Text>
              </Text>
              <Text style={styles.kv}>
                Status:{" "}
                <Text style={styles.kvValue}>{verificationResult.status}</Text>
              </Text>
              {!!verificationResult.reportCount && (
                <Text style={styles.kv}>
                  Reports:{" "}
                  <Text style={styles.kvValue}>
                    {verificationResult.reportCount}
                  </Text>
                </Text>
              )}
              <Text
                style={[
                  styles.kv,
                  {
                    fontWeight: "700",
                    color:
                      verificationResult.riskLevel === "high"
                        ? "#dc2626"
                        : verificationResult.riskLevel === "medium"
                          ? "#f59e0b"
                          : "#16a34a",
                  },
                ]}
              >
                Risk Level: {verificationResult.riskLevel.toUpperCase()}
              </Text>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={() => setVerificationResult(null)}
                style={styles.secondaryBtn}
              >
                <Text style={styles.secondaryBtnText}>Verify Another</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await smsMonitorService.reportFraudManually(
                      verificationResult.phoneNumber,
                      "Reported via Verify page",
                    );
                    Alert.alert(
                      "Reported",
                      "Number added as a manual fraud report",
                    );
                  } catch {
                    Alert.alert("Failed", "Could not report the number");
                  }
                }}
                style={styles.secondaryBtn}
              >
                <Text style={[styles.secondaryBtnText, { color: "#dc2626" }]}>
                  Report Number
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await Share.share({
                      message: `Verification Result\nPhone: ${verificationResult.phoneNumber}\nStatus: ${verificationResult.status}\nRisk: ${verificationResult.riskLevel}`,
                    });
                  } catch {}
                }}
                style={styles.secondaryBtn}
              >
                <Text style={styles.secondaryBtnText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Recent Verifications */}
        {history.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🕘 Recent Verifications</Text>
            {history.map((h) => (
              <View key={h.normalized} style={styles.historyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "600", color: "#111827" }}>
                    {h.phoneNumber}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#6b7280" }}>
                    Risk: {h.riskLevel} • {h.status}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={async () => {
                    await handleVerify(h.phoneNumber);
                  }}
                  style={styles.recheckBtn}
                >
                  <Text style={styles.recheckText}>Re-check</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>💬 How it works:</Text>
          <Text style={styles.helpText}>
            • Cross-reference with known fraud databases
          </Text>
          <Text style={styles.helpText}>• Check community reports</Text>
          <Text style={styles.helpText}>
            • Analyze number patterns and behavior
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: "#fffbeb" }]}>
          <Text style={[styles.cardTitle, { color: "#92400e" }]}>
            🧪 Test Numbers:
          </Text>
          <Text style={[styles.helpText, { color: "#92400e" }]}>
            • +919876543210 (Known fraud from dataset)
          </Text>
          <Text style={[styles.helpText, { color: "#92400e" }]}>
            • +1111111111 (Safe)
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  wrapper: { padding: 24 },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  label: { color: "#4b5563", marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    color: "#111827",
  },
  primaryBtn: { borderRadius: 12, paddingVertical: 12 },
  btnOk: { backgroundColor: "#16a34a" },
  btnDisabled: { backgroundColor: "#9ca3af" },
  primaryBtnText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  resultCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  kv: { color: "#374151", marginBottom: 6 },
  kvValue: { fontWeight: "600" },
  actionsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  secondaryBtn: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  secondaryBtnText: { color: "#111827", fontWeight: "600" },
  helpText: { color: "#6b7280", fontSize: 12, marginBottom: 4 },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  recheckBtn: {
    backgroundColor: "#dbeafe",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  recheckText: { color: "#2563eb", fontWeight: "700" },
});
