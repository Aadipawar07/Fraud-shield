import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import smsMonitorService, { SMSMessage } from "../../services/smsMonitor";

export default function ReportScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [fraudReports, setFraudReports] = useState<SMSMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'manual' | 'detected'>('manual');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadFraudReports();
  }, []);

  const loadFraudReports = async () => {
    try {
      const reports = await smsMonitorService.getFraudReports();
      setFraudReports(reports);
    } catch (error) {
      console.error('Failed to load fraud reports:', error);
    }
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

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

        {/* Tab Selection */}
        <View className="flex-row bg-gray-200 rounded-xl p-1 mb-6">
          <TouchableOpacity
            onPress={() => setActiveTab('manual')}
            className={`flex-1 py-3 px-4 rounded-lg ${
              activeTab === 'manual' ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text className={`text-center font-semibold ${
              activeTab === 'manual' ? 'text-gray-900' : 'text-gray-600'
            }`}>
              Manual Report
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setActiveTab('detected')}
            className={`flex-1 py-3 px-4 rounded-lg ${
              activeTab === 'detected' ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text className={`text-center font-semibold ${
              activeTab === 'detected' ? 'text-gray-900' : 'text-gray-600'
            }`}>
              Auto-Detected ({fraudReports.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'manual' ? (
          <>
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
          </>
        ) : (
          <>
            {/* Auto-Detected Fraud Reports */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-700">
                Detected Fraud Messages
              </Text>
              <TouchableOpacity onPress={loadFraudReports}>
                <Text className="text-blue-600 font-semibold">🔄 Refresh</Text>
              </TouchableOpacity>
            </View>

            {fraudReports.length > 0 ? (
              fraudReports.map((report) => (
                <View key={report.id} className="bg-white rounded-xl p-4 shadow mb-3">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-sm font-semibold text-red-600">
                      🚨 FRAUD DETECTED
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {formatTimeAgo(report.timestamp)}
                    </Text>
                  </View>
                  
                  <Text className="text-sm text-gray-600 mb-1">
                    From: {report.sender}
                  </Text>
                  
                  <Text className="text-gray-700 mb-3">
                    {report.message}
                  </Text>
                  
                  <View className="bg-red-50 p-3 rounded-lg">
                    <Text className="text-red-800 text-sm font-semibold mb-1">
                      Detection Details:
                    </Text>
                    <Text className="text-red-700 text-sm">
                      {report.fraudReason}
                    </Text>
                    {report.confidence && (
                      <Text className="text-red-600 text-xs mt-1">
                        Confidence: {(report.confidence * 100).toFixed(1)}%
                      </Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View className="bg-gray-50 rounded-xl p-6 items-center">
                <Text className="text-gray-500 text-center">
                  🛡️ No fraud detected yet
                </Text>
                <Text className="text-gray-400 text-center text-sm mt-2">
                  Start SMS monitoring to automatically detect fraud
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}
