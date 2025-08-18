import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface VerificationResult {
  phoneNumber: string;
  isVerified: boolean;
  riskLevel: string;
  status: string;
}

export default function VerifyScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const insets = useSafeAreaInsets();

  const handleVerify = () => {
    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Please enter a phone number to verify");
      return;
    }

    // Mock verification logic
    const isKnownFraud = [
      "+1234567890",
      "+9876543210",
      "123-456-7890",
    ].some(fraudNumber => phoneNumber.includes(fraudNumber.replace(/[^0-9]/g, '')));

    setVerificationResult({
      phoneNumber,
      isVerified: !isKnownFraud,
      riskLevel: isKnownFraud ? "high" : "low",
      status: isKnownFraud ? "Known fraud number" : "No fraud reports found",
    });
  };

  const clearResult = () => {
    setVerificationResult(null);
    setPhoneNumber("");
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      contentContainerStyle={{ paddingBottom: Math.max(24, insets.bottom) }}
    >
      <View className="p-6">
        {/* Header */}
        <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">
          🔍 Verify Sender
        </Text>

        {/* Verify Form */}
        <View className="bg-white rounded-2xl p-5 shadow mb-6">
          <Text className="text-lg font-semibold text-gray-700 mb-4">
            Check Phone Number
          </Text>

          <Text className="text-base text-gray-600 mb-2">Phone Number:</Text>
          <TextInput
            className="border border-gray-300 rounded-xl p-4 text-base mb-4"
            placeholder="Enter phone number to verify"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            onPress={handleVerify}
            disabled={!phoneNumber.trim()}
            className={`rounded-xl p-4 ${
              !phoneNumber.trim() ? "bg-gray-400" : "bg-green-600"
            }`}
          >
            <Text className="text-white text-center font-semibold text-base">
              🔍 Verify Number
            </Text>
          </TouchableOpacity>
        </View>

        {/* Verification Results */}
        {verificationResult && (
          <View
            className={`rounded-2xl p-5 shadow mb-6 ${
              verificationResult.isVerified ? "bg-green-50" : "bg-red-50"
            }`}
          >
            <Text
              className={`text-xl font-bold mb-3 text-center ${
                verificationResult.isVerified ? "text-green-800" : "text-red-800"
              }`}
            >
              {verificationResult.isVerified ? "✅ Number Verified" : "⚠️ Risk Detected"}
            </Text>

            <View className="mb-4">
              <Text className="text-gray-700 font-semibold">Phone: {verificationResult.phoneNumber}</Text>
              <Text className="text-gray-700">Status: {verificationResult.status}</Text>
              <Text
                className={`font-semibold ${
                  verificationResult.riskLevel === "high" ? "text-red-600" : "text-green-600"
                }`}
              >
                Risk Level: {verificationResult.riskLevel.toUpperCase()}
              </Text>
            </View>

            <TouchableOpacity
              onPress={clearResult}
              className="bg-gray-600 rounded-xl p-3"
            >
              <Text className="text-white text-center font-semibold">
                Verify Another Number
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Section */}
        <View className="bg-white rounded-2xl p-5 shadow">
          <Text className="text-lg font-semibold text-gray-700 mb-3">
            💬 How it works:
          </Text>
          <Text className="text-sm text-gray-600 mb-2">
            • Cross-reference with known fraud databases
          </Text>
          <Text className="text-sm text-gray-600 mb-2">
            • Check community reports
          </Text>
          <Text className="text-sm text-gray-600">
            • Analyze number patterns and behavior
          </Text>
        </View>

        {/* Test Numbers */}
        <View className="bg-yellow-50 rounded-2xl p-4 shadow mt-4">
          <Text className="text-yellow-800 font-semibold mb-2">
            🧪 Test Numbers:
          </Text>
          <Text className="text-yellow-700 text-sm mb-1">
            • +1234567890 (Known fraud)
          </Text>
          <Text className="text-yellow-700 text-sm">
            • +1111111111 (Safe)
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
