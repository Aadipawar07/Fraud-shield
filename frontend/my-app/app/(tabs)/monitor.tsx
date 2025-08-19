import React, { useMemo, useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform, Alert, RefreshControl, TextInput, StyleSheet, Share } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import smsMonitorService, { SMSMessage, SMSMonitorState } from "../../services/smsMonitor";
import { simulateIncomingSMS, testMessages, runFullSMSTest } from "../../utils/smsTestUtils";

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "fraud" | "safe">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [autoStart, setAutoStart] = useState<boolean>(false);

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
        .slice(0, 25); // Show up to last 25 messages
      
      setRecentMessages(allMessages);
      // Load auto-start preference
      try {
        const isAuto = await smsMonitorService.getAutoStart();
        setAutoStart(isAuto);
      } catch {}
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const onRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadInitialData();
    } finally {
      setIsRefreshing(false);
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
          setRecentMessages(prev => [newSMS, ...prev.slice(0, 24)]);
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
              setRecentMessages(prev => [result, ...prev.slice(0, 24)]);
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
              setRecentMessages(prev => [result, ...prev.slice(0, 24)]);
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

  const handleShare = async (sms: SMSMessage) => {
    try {
      await Share.share({
        message: `From: ${sms.sender}\nWhen: ${new Date(sms.timestamp).toLocaleString()}\nStatus: ${sms.isFraud ? 'FRAUD' : 'SAFE'}\n${sms.fraudReason ? `Reason: ${sms.fraudReason}\n` : ''}Message: ${sms.message}`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filteredMessages = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return recentMessages.filter((sms) => {
      if (selectedFilter === 'fraud' && !sms.isFraud) return false;
      if (selectedFilter === 'safe' && sms.isFraud) return false;
      if (!normalizedQuery) return true;
      return (
        sms.sender.toLowerCase().includes(normalizedQuery) ||
        sms.message.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [recentMessages, selectedFilter, searchQuery]);

  const fraudRate = monitorState.processedCount > 0
    ? Math.round((monitorState.fraudCount / monitorState.processedCount) * 100)
    : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: Math.max(24, insets.bottom) }}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.contentWrapper}>
        {/* Header */}
        <Text style={styles.headerText}>📊 SMS Monitor</Text>

        {/* Monitoring Status Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Real-time Monitoring</Text>
            <View
              style={[styles.statusDot, { backgroundColor: monitorState.isMonitoring ? '#22c55e' : '#9ca3af' }]}
            />
          </View>

          <TouchableOpacity
            onPress={handleToggleMonitoring}
            disabled={isLoading}
            style={[
              styles.primaryAction,
              monitorState.isMonitoring ? styles.stopButton : styles.startButton,
            ]}
          >
            <Text style={[styles.primaryActionText, monitorState.isMonitoring ? styles.stopText : styles.startText]}>
              {isLoading
                ? 'Processing...'
                : monitorState.isMonitoring
                ? '⏹️ Stop Monitoring'
                : '▶️ Start Monitoring'}
            </Text>
          </TouchableOpacity>

          {Platform.OS !== 'android' && (
            <View style={styles.infoBannerWarning}>
              <Text style={styles.infoBannerWarningText}>⚠️ SMS monitoring is only available on Android</Text>
            </View>
          )}

          {Platform.OS === 'android' && !monitorState.permissionsGranted && (
            <View style={styles.infoBannerError}>
              <Text style={styles.infoBannerErrorText}>❌ SMS permissions required for monitoring</Text>
            </View>
          )}

          {/* Auto-start toggle */}
          <View style={styles.autoRow}>
            <Text style={styles.autoText}>Auto-start monitoring on app launch</Text>
            <TouchableOpacity
              onPress={async () => {
                const next = !autoStart;
                setAutoStart(next);
                await smsMonitorService.setAutoStart(next);
              }}
              style={[styles.toggle, autoStart ? styles.toggleOn : styles.toggleOff]}
            >
              <View style={[styles.knob, autoStart ? styles.knobOn : styles.knobOff]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monitoring Statistics</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#16a34a' }]}>
                {Math.max(0, monitorState.processedCount - monitorState.fraudCount)}
              </Text>
              <Text style={styles.statLabel}>Safe Messages</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#dc2626' }]}>{monitorState.fraudCount}</Text>
              <Text style={styles.statLabel}>Fraud Detected</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#2563eb' }]}>{monitorState.processedCount}</Text>
              <Text style={styles.statLabel}>Total Scanned</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{fraudRate}%</Text>
              <Text style={styles.statLabel}>Fraud Rate</Text>
            </View>
          </View>
        </View>

        {/* Filters & Search */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            onPress={() => setSelectedFilter('all')}
            style={[styles.filterChip, selectedFilter === 'all' && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, selectedFilter === 'all' && styles.filterChipTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedFilter('fraud')}
            style={[styles.filterChip, selectedFilter === 'fraud' && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, selectedFilter === 'fraud' && styles.filterChipTextActive]}>Fraud</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedFilter('safe')}
            style={[styles.filterChip, selectedFilter === 'safe' && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, selectedFilter === 'safe' && styles.filterChipTextActive]}>Safe</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by sender or message..."
          style={styles.searchInput}
        />

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.secondaryAction, { backgroundColor: '#dbeafe' }]} onPress={loadInitialData}>
            <Text style={[styles.secondaryActionText, { color: '#2563eb' }]}>🔄 Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.secondaryAction, { backgroundColor: '#f3f4f6' }]} onPress={handleClearReports}>
            <Text style={[styles.secondaryActionText, { color: '#374151' }]}>🗑️ Clear Reports</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.secondaryAction, { backgroundColor: '#f3e8ff' }]} onPress={handleTestSMS}>
          <Text style={[styles.secondaryActionText, { color: '#7c3aed' }]}>🧪 Test SMS Detection</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryAction, { backgroundColor: '#fff7ed', marginTop: 8 }]}
          onPress={async () => {
            try {
              await runFullSMSTest();
              await loadInitialData();
            } catch (e) {
              Alert.alert('Test Failed', 'Full SMS test encountered errors.');
            }
          }}
        >
          <Text style={[styles.secondaryActionText, { color: '#c2410c' }]}>🧪 Run Full Test Suite</Text>
        </TouchableOpacity>

        {/* Recent Scans */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.cardTitle}>Recent Scans</Text>
          <Text style={styles.subtleText}>{filteredMessages.length} messages</Text>
        </View>

        {filteredMessages.length > 0 ? (
          filteredMessages.map((sms) => {
            const isExpanded = expandedIds.has(sms.id);
            return (
              <View key={sms.id} style={styles.messageCard}>
                <View style={styles.messageHeaderRow}>
                  <Text style={[styles.badgeText, { color: sms.isFraud ? '#dc2626' : '#16a34a' }]}>
                    {sms.isFraud ? '🚨 FRAUD' : '✅ SAFE'}
                  </Text>
                  <Text style={styles.timestampText}>{formatTimeAgo(sms.timestamp)}</Text>
                </View>

                <Text style={styles.senderText}>From: {sms.sender}</Text>

                <Text style={styles.messageText} numberOfLines={isExpanded ? 10 : 2}>
                  {sms.message}
                </Text>

                {sms.isFraud && sms.fraudReason && (
                  <View style={styles.reasonBox}>
                    <Text style={styles.reasonText}>Reason: {sms.fraudReason}</Text>
                    {sms.confidence && (
                      <Text style={styles.confidenceText}>Confidence: {(sms.confidence * 100).toFixed(1)}%</Text>
                    )}
                  </View>
                )}

                <View style={styles.cardActionsRow}>
                  <TouchableOpacity onPress={() => toggleExpanded(sms.id)} style={styles.cardActionBtn}>
                    <Text style={styles.cardActionText}>{isExpanded ? 'Collapse' : 'Expand'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleShare(sms)} style={styles.cardActionBtn}>
                    <Text style={styles.cardActionText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateTitle}>📱 No SMS messages scanned yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              {Platform.OS === 'android'
                ? 'Start monitoring to see real-time fraud detection'
                : 'SMS monitoring is only available on Android'}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  contentWrapper: {
    padding: 24,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  primaryAction: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  startButton: { backgroundColor: '#dcfce7' },
  stopButton: { backgroundColor: '#fee2e2' },
  primaryActionText: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  startText: { color: '#166534' },
  stopText: { color: '#991b1b' },
  infoBannerWarning: {
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    padding: 8,
  },
  infoBannerWarningText: {
    color: '#92400e',
    fontSize: 12,
    textAlign: 'center',
  },
  infoBannerError: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 8,
  },
  infoBannerErrorText: {
    color: '#991b1b',
    fontSize: 12,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statItem: { alignItems: 'center', minWidth: 70 },
  statNumber: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#6b7280' },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
  },
  filterChipActive: { backgroundColor: '#e0e7ff' },
  filterChipText: { color: '#374151', fontWeight: '600', fontSize: 12 },
  filterChipTextActive: { color: '#3730a3' },
  searchInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    color: '#111827',
  },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  secondaryAction: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  secondaryActionText: { textAlign: 'center', fontWeight: '600' },
  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 8 },
  subtleText: { fontSize: 12, color: '#6b7280' },
  messageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  messageHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  timestampText: { fontSize: 11, color: '#6b7280' },
  senderText: { fontSize: 13, color: '#4b5563', marginBottom: 4 },
  messageText: { fontSize: 14, color: '#111827', marginBottom: 6 },
  reasonBox: { backgroundColor: '#fef2f2', padding: 8, borderRadius: 8 },
  reasonText: { color: '#991b1b', fontSize: 12 },
  confidenceText: { color: '#b91c1c', fontSize: 12, marginTop: 2 },
  cardActionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 6 },
  cardActionBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  cardActionText: { color: '#2563eb', fontWeight: '600', fontSize: 12 },
  emptyStateCard: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, alignItems: 'center' },
  emptyStateTitle: { color: '#6b7280', textAlign: 'center' },
  emptyStateSubtitle: { color: '#9ca3af', textAlign: 'center', fontSize: 12, marginTop: 6 },
  autoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  autoText: { color: '#4b5563', fontSize: 13 },
  toggle: { width: 48, height: 28, borderRadius: 999, padding: 3, justifyContent: 'center' },
  toggleOn: { backgroundColor: '#22c55e' },
  toggleOff: { backgroundColor: '#9ca3af' },
  knob: { width: 22, height: 22, borderRadius: 999, backgroundColor: '#ffffff' },
  knobOn: { marginLeft: 23 },
  knobOff: { marginLeft: 0 },
});
