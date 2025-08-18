import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MonitorScreen() {
  const insets = useSafeAreaInsets();

  // Mock data for monitoring
  const recentScans = [
    { id: 1, message: "Hi, how are you?", status: "safe", time: "2 minutes ago" },
    { id: 2, message: "You've won $1000! Click here...", status: "fraud", time: "5 minutes ago" },
    { id: 3, message: "Meeting at 3 PM today", status: "safe", time: "10 minutes ago" },
  ];

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      contentContainerStyle={{ paddingBottom: Math.max(24, insets.bottom) }}
    >
      <View className="p-6">
        {/* Header */}
        <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">
          📊 SMS Monitor
        </Text>

        {/* Stats Section */}
        <View className="bg-white rounded-2xl p-5 shadow mb-6">
          <Text className="text-lg font-semibold text-gray-700 mb-4">
            Today's Activity
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">12</Text>
              <Text className="text-sm text-gray-600">Safe Messages</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-red-600">3</Text>
              <Text className="text-sm text-gray-600">Fraud Detected</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">15</Text>
              <Text className="text-sm text-gray-600">Total Scanned</Text>
            </View>
          </View>
        </View>

        {/* Recent Scans */}
        <Text className="text-lg font-semibold text-gray-700 mb-4">
          Recent Scans
        </Text>
        {recentScans.map((scan) => (
          <View key={scan.id} className="bg-white rounded-xl p-4 shadow mb-3">
            <View className="flex-row justify-between items-start mb-2">
              <Text
                className={`text-sm font-semibold ${
                  scan.status === "safe" ? "text-green-600" : "text-red-600"
                }`}
              >
                {scan.status === "safe" ? "✅ SAFE" : "⚠️ FRAUD"}
              </Text>
              <Text className="text-xs text-gray-500">{scan.time}</Text>
            </View>
            <Text className="text-gray-700" numberOfLines={2}>
              {scan.message}
            </Text>
          </View>
        ))}

        {/* Coming Soon Notice */}
        <View className="bg-blue-50 rounded-2xl p-4 shadow mt-4">
          <Text className="text-blue-800 font-semibold text-center">
            🚧 Real-time monitoring coming soon!
          </Text>
          <Text className="text-blue-600 text-center text-sm mt-1">
            Currently showing demo data
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
