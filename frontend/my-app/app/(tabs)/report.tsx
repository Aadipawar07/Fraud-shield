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

export default function ReportScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const insets = useSafeAreaInsets();

  const handleReport = () => {
    if (!phoneNumber.trim() || !message.trim()) {
      Alert.alert("Error", "Please fill in phone number and message");
      return;
    }

    // For now, just show a success message
    Alert.alert(
      "Report Submitted",
      "Thank you for reporting this fraudulent message. It helps protect others!",
      [
        {
          text: "OK",
          onPress: () => {
            setPhoneNumber("");
            setMessage("");
            setAdditionalInfo("");
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      contentContainerStyle={{ paddingBottom: Math.max(24, insets.bottom) }}
    >
      <View className="p-6">
        {/* Header */}
        <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">
          🚩 Report Fraud
        </Text>

        {/* Report Form */}
        <View className="bg-white rounded-2xl p-5 shadow mb-6">
          <Text className="text-lg font-semibold text-gray-700 mb-4">
            Report Suspicious SMS
          </Text>

          {/* Phone Number */}
          <Text className="text-base text-gray-600 mb-2">Sender Phone Number:</Text>
          <TextInput
            className="border border-gray-300 rounded-xl p-4 text-base mb-4"
            placeholder="Enter phone number (e.g., +1234567890)"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />

          {/* Message */}
          <Text className="text-base text-gray-600 mb-2">Fraudulent Message:</Text>
          <TextInput
            className="border border-gray-300 rounded-xl p-4 text-base min-h-[100px] mb-4"
            multiline
            placeholder="Paste the suspicious message here..."
            value={message}
            onChangeText={setMessage}
            textAlignVertical="top"
          />

          {/* Additional Info */}
          <Text className="text-base text-gray-600 mb-2">Additional Information (Optional):</Text>
          <TextInput
            className="border border-gray-300 rounded-xl p-4 text-base min-h-[80px] mb-4"
            multiline
            placeholder="Any additional context or information..."
            value={additionalInfo}
            onChangeText={setAdditionalInfo}
            textAlignVertical="top"
          />

          <TouchableOpacity
            onPress={handleReport}
            className="bg-red-600 rounded-xl p-4"
          >
            <Text className="text-white text-center font-semibold text-base">
              🚩 Submit Report
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View className="bg-blue-50 rounded-2xl p-4 shadow">
          <Text className="text-blue-800 font-semibold mb-2">
            📝 Why Report?
          </Text>
          <Text className="text-blue-700 text-sm mb-1">
            • Help protect other users from scams
          </Text>
          <Text className="text-blue-700 text-sm mb-1">
            • Improve our fraud detection algorithms
          </Text>
          <Text className="text-blue-700 text-sm">
            • Build a community defense against fraud
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
