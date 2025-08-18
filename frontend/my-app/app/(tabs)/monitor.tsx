import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import smsMonitorService, { SMSMessage, SMSMonitorState } from "../../services/smsMonitor";
import { simulateIncomingSMS, testMessages } from "../../utils/smsTestUtils";

export default function MonitorScreen() {
  const insets = useSafeAreaInsets();
  const [monitorState, setMonitorState] = useState<SMSMonitorState>({
    isMonitoring: false,
    permissionsGranted: false,
    processedCount: 0,
    fraudCount: 0,
  });
  const [recentMessages, setRecentMessages] = useState<SMSMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const state = smsMonitorService.getMonitorState();
      setMonitorState(state);
      
      // Load recent fraud and safe messages
      const fraudMessages = await smsMonitorService.getFraudReports();
      const safeMessages = await smsMonitorService.getSafeMessages();
      
      // Combine and sort by timestamp (most recent first)
      const allMessages = [...fraudMessages, ...safeMessages]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10); // Show only last 10 messages
      
      setRecentMessages(allMessages);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const handleToggleMonitoring = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert(
        'Not Supported',
        'SMS monitoring is only available on Android devices.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsLoading(true);
    
    try {
      if (monitorState.isMonitoring) {
        smsMonitorService.stopMonitoring();
      } else {
        const success = await smsMonitorService.startMonitoring((newSMS) => {
          // Update recent messages when new SMS is processed
          setRecentMessages(prev => [newSMS, ...prev.slice(0, 9)]);
          // Update stats
          const newState = smsMonitorService.getMonitorState();
          setMonitorState(newState);
        });
        
        if (!success) {
          Alert.alert(
            'Failed to Start',
            'SMS monitoring could not be started. Please check permissions.',
            [{ text: 'OK' }]
          );
        }
      }
      
      // Update state
      const newState = smsMonitorService.getMonitorState();
      setMonitorState(newState);
    } catch (error) {
      console.error('Error toggling monitoring:', error);
      Alert.alert(
        'Error',
        'An error occurred while toggling SMS monitoring.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearReports = async () => {
    Alert.alert(
      'Clear Reports',
      'Are you sure you want to clear all SMS reports?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await smsMonitorService.clearReports();
            setRecentMessages([]);
            // Reset stats
            const newState = smsMonitorService.getMonitorState();
            setMonitorState(newState);
          },
        },
      ]
    );
  };

  const handleTestSMS = async () => {
    Alert.alert(
      'Test SMS Detection',
      'Choose a test message type:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Test Fraud',
          onPress: async () => {
            const fraudMsg = testMessages.fraudulent[0];
            try {
              const result = await simulateIncomingSMS(fraudMsg);
              setRecentMessages(prev => [result, ...prev.slice(0, 9)]);
              const newState = smsMonitorService.getMonitorState();
              setMonitorState(newState);
            } catch (error) {
              Alert.alert('Test Failed', 'Could not simulate fraud SMS');
            }
          },
        },
        {
          text: 'Test Safe',
          onPress: async () => {
            const safeMsg = testMessages.safe[0];
            try {
              const result = await simulateIncomingSMS(safeMsg);
              setRecentMessages(prev => [result, ...prev.slice(0, 9)]);
              const newState = smsMonitorService.getMonitorState();
              setMonitorState(newState);
            } catch (error) {
              Alert.alert('Test Failed', 'Could not simulate safe SMS');
            }
          },
        },
      ]
    );
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

        {/* Monitoring Status */}
        <View className="bg-white rounded-2xl p-5 shadow mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-700">
              Real-time Monitoring
            </Text>
            <View className={`w-3 h-3 rounded-full ${
              monitorState.isMonitoring ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          </View>
          
          <TouchableOpacity
            onPress={handleToggleMonitoring}
            disabled={isLoading}
            className={`p-4 rounded-xl mb-4 ${
              monitorState.isMonitoring ? 'bg-red-100' : 'bg-green-100'
            }`}
          >
            <Text className={`text-center font-semibold ${
              monitorState.isMonitoring ? 'text-red-700' : 'text-green-700'
            }`}>
              {isLoading 
                ? 'Processing...' 
                : monitorState.isMonitoring 
                  ? '⏹️ Stop Monitoring' 
                  : '▶️ Start Monitoring'
              }
            </Text>
          </TouchableOpacity>

          {Platform.OS !== 'android' && (
            <View className="bg-orange-50 p-3 rounded-lg">
              <Text className="text-orange-800 text-center text-sm">
                ⚠️ SMS monitoring is only available on Android
              </Text>
            </View>
          )}
          
          {Platform.OS === 'android' && !monitorState.permissionsGranted && (
            <View className="bg-red-50 p-3 rounded-lg">
              <Text className="text-red-800 text-center text-sm">
                ❌ SMS permissions required for monitoring
              </Text>
            </View>
          )}
        </View>

        {/* Stats Section */}
        <View className="bg-white rounded-2xl p-5 shadow mb-6">
          <Text className="text-lg font-semibold text-gray-700 mb-4">
            Monitoring Statistics
          </Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">
                {monitorState.processedCount - monitorState.fraudCount}
              </Text>
              <Text className="text-sm text-gray-600">Safe Messages</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-red-600">
                {monitorState.fraudCount}
              </Text>
              <Text className="text-sm text-gray-600">Fraud Detected</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">
                {monitorState.processedCount}
              </Text>
              <Text className="text-sm text-gray-600">Total Scanned</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-3 mb-6">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={loadInitialData}
              className="flex-1 bg-blue-100 p-3 rounded-xl"
            >
              <Text className="text-blue-700 text-center font-semibold">
                🔄 Refresh
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleClearReports}
              className="flex-1 bg-gray-100 p-3 rounded-xl"
            >
              <Text className="text-gray-700 text-center font-semibold">
                🗑️ Clear Reports
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Test Button for Development */}
          <TouchableOpacity
            onPress={handleTestSMS}
            className="bg-purple-100 p-3 rounded-xl"
          >
            <Text className="text-purple-700 text-center font-semibold">
              🧪 Test SMS Detection
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Scans */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-gray-700">
            Recent Scans
          </Text>
          <Text className="text-sm text-gray-500">
            {recentMessages.length} messages
          </Text>
        </View>
        
        {recentMessages.length > 0 ? (
          recentMessages.map((sms) => (
            <View key={sms.id} className="bg-white rounded-xl p-4 shadow mb-3">
              <View className="flex-row justify-between items-start mb-2">
                <Text
                  className={`text-sm font-semibold ${
                    sms.isFraud ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {sms.isFraud ? "🚨 FRAUD" : "✅ SAFE"}
                </Text>
                <Text className="text-xs text-gray-500">
                  {formatTimeAgo(sms.timestamp)}
                </Text>
              </View>
              
              <Text className="text-sm text-gray-600 mb-1">
                From: {sms.sender}
              </Text>
              
              <Text className="text-gray-700 mb-2" numberOfLines={2}>
                {sms.message}
              </Text>
              
              {sms.isFraud && sms.fraudReason && (
                <View className="bg-red-50 p-2 rounded-lg">
                  <Text className="text-red-800 text-xs">
                    Reason: {sms.fraudReason}
                  </Text>
                  {sms.confidence && (
                    <Text className="text-red-700 text-xs mt-1">
                      Confidence: {(sms.confidence * 100).toFixed(1)}%
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))
        ) : (
          <View className="bg-gray-50 rounded-xl p-6 items-center">
            <Text className="text-gray-500 text-center">
              📱 No SMS messages scanned yet
            </Text>
            <Text className="text-gray-400 text-center text-sm mt-2">
              {Platform.OS === 'android' 
                ? 'Start monitoring to see real-time fraud detection'
                : 'SMS monitoring is only available on Android'
              }
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
