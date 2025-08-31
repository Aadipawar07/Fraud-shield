import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  RefreshControl,
  StyleSheet,
  Share,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { formatConfidencePercentage } from "../../utils/formatters";
import smsMonitorService, {
  SMSMessage,
  SMSMonitorState,
} from "../../services/smsMonitor";
import {
  simulateIncomingSMS,
  testMessages,
  runFullSMSTest,
} from "../../utils/smsTestUtils";
import { ThemedText } from "../../components/ThemedText";
import { Card, TouchableCard } from "../../components/Card";
import { ThemedView } from "../../components/ThemedView";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { Spacing } from "../../constants/Spacing";
import { BorderRadius, Shadow } from "../../constants/Shape";
import { useTheme } from "../../context/ThemeContext";
import { useThemeColor } from "../../hooks/useThemeColor";

export default function MonitorScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useTheme();
  const primaryColor = useThemeColor({}, "tint");
  const successColor = useThemeColor({}, "success");
  const warningColor = useThemeColor({}, "warning");
  const dangerColor = useThemeColor({}, "danger");
  const neutralColor = useThemeColor({}, "textSecondary");
  const backgroundColor = useThemeColor({}, "background");

  const [monitorState, setMonitorState] = useState<SMSMonitorState>({
    isMonitoring: false,
    permissionsGranted: false,
    processedCount: 0,
    fraudCount: 0,
  });
  const [recentMessages, setRecentMessages] = useState<SMSMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "fraud" | "safe"
  >("all");
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
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )
        .slice(0, 25); // Show up to last 25 messages

      setRecentMessages(allMessages);
      // Load auto-start preference
      try {
        const isAuto = await smsMonitorService.getAutoStart();
        setAutoStart(isAuto);
      } catch {}
    } catch (error) {
      console.error("Failed to load initial data:", error);
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
    if (Platform.OS !== "android") {
      Alert.alert(
        "Not Supported",
        "SMS monitoring is only available on Android devices.",
        [{ text: "OK" }],
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
          setRecentMessages((prev) => [newSMS, ...prev.slice(0, 24)]);
          // Update stats
          const newState = smsMonitorService.getMonitorState();
          setMonitorState(newState);
        });

        if (!success) {
          Alert.alert(
            "Failed to Start",
            "SMS monitoring could not be started. Please check permissions.",
            [{ text: "OK" }],
          );
        }
      }

      // Update state
      const newState = smsMonitorService.getMonitorState();
      setMonitorState(newState);
    } catch (error) {
      console.error("Error toggling monitoring:", error);
      Alert.alert("Error", "An error occurred while toggling SMS monitoring.", [
        { text: "OK" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearReports = async () => {
    Alert.alert(
      "Clear Reports",
      "Are you sure you want to clear all SMS reports?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await smsMonitorService.clearReports();
            setRecentMessages([]);
            // Reset stats
            const newState = smsMonitorService.getMonitorState();
            setMonitorState(newState);
          },
        },
      ],
    );
  };

  const handleTestSMS = async () => {
    Alert.alert("Test SMS Detection", "Choose a test message type:", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Test Fraud",
        onPress: async () => {
          const fraudMsg = testMessages.fraudulent[0];
          try {
            const result = await simulateIncomingSMS(fraudMsg);
            setRecentMessages((prev) => [result, ...prev.slice(0, 24)]);
            const newState = smsMonitorService.getMonitorState();
            setMonitorState(newState);
          } catch (error) {
            Alert.alert("Test Failed", "Could not simulate fraud SMS");
          }
        },
      },
      {
        text: "Test Safe",
        onPress: async () => {
          const safeMsg = testMessages.safe[0];
          try {
            const result = await simulateIncomingSMS(safeMsg);
            setRecentMessages((prev) => [result, ...prev.slice(0, 24)]);
            const newState = smsMonitorService.getMonitorState();
            setMonitorState(newState);
          } catch (error) {
            Alert.alert("Test Failed", "Could not simulate safe SMS");
          }
        },
      },
    ]);
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - messageTime.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleShare = async (sms: SMSMessage) => {
    try {
      await Share.share({
        message: `From: ${sms.sender}\nWhen: ${new Date(sms.timestamp).toLocaleString()}\nStatus: ${sms.isFraud ? "FRAUD" : "SAFE"}\n${sms.fraudReason ? `Reason: ${sms.fraudReason}\n` : ""}Message: ${sms.message}`,
      });
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredMessages = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return recentMessages.filter((sms) => {
      if (selectedFilter === "fraud" && !sms.isFraud) return false;
      if (selectedFilter === "safe" && sms.isFraud) return false;
      if (!normalizedQuery) return true;
      return (
        sms.sender.toLowerCase().includes(normalizedQuery) ||
        sms.message.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [recentMessages, selectedFilter, searchQuery]);

  const fraudRate =
    monitorState.processedCount > 0
      ? Math.round(
          (monitorState.fraudCount / monitorState.processedCount) * 100,
        )
      : 0;

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: Math.max(Spacing.xl, insets.bottom) }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
      <View style={styles.contentWrapper}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText variant="h2" style={styles.headerText}>SMS Monitor</ThemedText>
          <MaterialIcons name="analytics" size={24} color={primaryColor} style={styles.headerIcon} />
        </ThemedView>

        {/* Monitoring Status Card */}
        <ThemedView card style={styles.card} lightColor="#ffffff" darkColor="#1c1c1c" shadow="md">
          <View style={styles.cardHeaderRow}>
            <ThemedText variant="h3" style={styles.cardTitle}>Real-time Monitoring</ThemedText>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: monitorState.isMonitoring
                    ? successColor
                    : neutralColor,
                },
              ]}
            />
          </View>

          <Button
            title={isLoading
              ? "Processing..."
              : monitorState.isMonitoring
                ? "Stop Monitoring"
                : "Start Monitoring"
            }
            variant={monitorState.isMonitoring ? "danger" : "primary"}
            size="large"
            onPress={handleToggleMonitoring}
            disabled={isLoading}
            leftIcon={monitorState.isMonitoring 
              ? <Ionicons name="stop" size={20} color="#fff" /> 
              : <Ionicons name="play" size={20} color="#fff" />
            }
            style={styles.monitoringButton}
          />

          {Platform.OS !== "android" && (
            <ThemedView style={styles.infoBannerWarning} lightColor="#fffbeb" darkColor="#332200">
              <ThemedText style={styles.infoBannerWarningText}>
                ⚠️ SMS monitoring is only available on Android
              </ThemedText>
            </ThemedView>
          )}

          {Platform.OS === "android" && !monitorState.permissionsGranted && (
            <ThemedView style={styles.infoBannerError} lightColor="#fef2f2" darkColor="#330000">
              <ThemedText style={styles.infoBannerErrorText}>
                ❌ SMS permissions required for monitoring
              </ThemedText>
            </ThemedView>
          )}

          {/* Auto-start toggle */}
          <View style={styles.autoRow}>
            <ThemedText variant="bodyMedium" style={styles.autoText}>
              Auto-start monitoring on app launch
            </ThemedText>
            <TouchableOpacity
              onPress={async () => {
                const next = !autoStart;
                setAutoStart(next);
                await smsMonitorService.setAutoStart(next);
              }}
              style={[
                styles.toggle,
                autoStart ? styles.toggleOn : styles.toggleOff,
              ]}
            >
              <View
                style={[
                  styles.knob,
                  autoStart ? styles.knobOn : styles.knobOff,
                ]}
              />
            </TouchableOpacity>
          </View>
        </ThemedView>

        {/* Stats */}
        <ThemedView card style={styles.card} lightColor="#ffffff" darkColor="#1c1c1c" shadow="md">
          <ThemedText variant="h3" style={styles.cardTitle}>Monitoring Statistics</ThemedText>
          <View style={styles.statsRow}>
            <ThemedView style={styles.statItem}>
              <ThemedText variant="h3" style={[styles.statNumber, { color: successColor }]}>
                {Math.max(
                  0,
                  monitorState.processedCount - monitorState.fraudCount,
                )}
              </ThemedText>
              <ThemedText variant="caption" style={styles.statLabel}>Safe Messages</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <ThemedText variant="h3" style={[styles.statNumber, { color: dangerColor }]}>
                {monitorState.fraudCount}
              </ThemedText>
              <ThemedText variant="caption" style={styles.statLabel}>Fraud Detected</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <ThemedText variant="h3" style={[styles.statNumber, { color: primaryColor }]}>
                {monitorState.processedCount}
              </ThemedText>
              <ThemedText variant="caption" style={styles.statLabel}>Total Scanned</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <ThemedText variant="h3" style={[styles.statNumber, { color: warningColor }]}>
                {fraudRate}%
              </ThemedText>
              <ThemedText variant="caption" style={styles.statLabel}>Fraud Rate</ThemedText>
            </ThemedView>
          </View>
        </ThemedView>

        {/* Filters & Search */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            onPress={() => setSelectedFilter("all")}
          >
            <ThemedView 
              lightColor={selectedFilter === "all" ? "#e0e7ff" : "#e5e7eb"} 
              darkColor={selectedFilter === "all" ? "#3730a3" : "#333333"} 
              style={styles.filterChip}
            >
              <ThemedText
                variant="label"
                style={styles.filterChipText}
              >
                All
              </ThemedText>
            </ThemedView>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedFilter("fraud")}
          >
            <ThemedView 
              lightColor={selectedFilter === "fraud" ? "#e0e7ff" : "#e5e7eb"} 
              darkColor={selectedFilter === "fraud" ? "#3730a3" : "#333333"}
              style={styles.filterChip}
            >
              <ThemedText
                variant="label"
                style={styles.filterChipText}
              >
                Fraud
              </ThemedText>
            </ThemedView>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedFilter("safe")}
          >
            <ThemedView 
              lightColor={selectedFilter === "safe" ? "#e0e7ff" : "#e5e7eb"} 
              darkColor={selectedFilter === "safe" ? "#3730a3" : "#333333"}
              style={styles.filterChip}
            >
              <ThemedText
                variant="label"
                style={styles.filterChipText}
              >
                Safe
              </ThemedText>
            </ThemedView>
          </TouchableOpacity>
        </View>

        <ThemedView lightColor="#ffffff" darkColor="#333333" style={styles.searchInputContainer}>
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by sender or message..."
          />
        </ThemedView>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <Button
            title="🔄 Refresh"
            variant="secondary"
            size="medium"
            onPress={loadInitialData}
            style={styles.secondaryAction}
          />
          <Button
            title="🗑️ Clear Reports"
            variant="secondary"
            size="medium"
            onPress={handleClearReports}
            style={styles.secondaryAction}
          />
        </View>

        <Button
          title="🧪 Test SMS Detection"
          variant="outline"
          size="medium"
          onPress={handleTestSMS}
          style={[styles.secondaryAction, { marginBottom: 8 }]}
        />

        <Button
          title="🧪 Run Full Test Suite"
          variant="outline"
          size="medium"
          onPress={async () => {
            try {
              await runFullSMSTest();
              await loadInitialData();
            } catch (e) {
              Alert.alert("Test Failed", "Full SMS test encountered errors.");
            }
          }}
          style={styles.secondaryAction}
        />

        {/* Recent Scans */}
        <View style={styles.listHeaderRow}>
          <ThemedText variant="h3" style={styles.cardTitle}>Recent Scans</ThemedText>
          <ThemedText variant="caption" style={styles.subtleText}>
            {filteredMessages.length} messages
          </ThemedText>
        </View>

        {filteredMessages.length > 0 ? (
          filteredMessages.map((sms) => {
            const isExpanded = expandedIds.has(sms.id);
            return (
              <ThemedView key={sms.id} style={styles.messageCard} lightColor="#ffffff" darkColor="#1c1c1c" shadow="sm">
                <View style={styles.messageHeaderRow}>
                  <ThemedText
                    variant="label"
                    weight="semibold"
                    style={[
                      styles.badgeText,
                      { color: sms.isFraud ? dangerColor : successColor },
                    ]}
                  >
                    {sms.isFraud ? "🚨 FRAUD" : "✅ SAFE"}
                  </ThemedText>
                  <ThemedText variant="caption" style={styles.timestampText}>
                    {formatTimeAgo(sms.timestamp)}
                  </ThemedText>
                </View>

                <ThemedText variant="bodyMedium" style={styles.senderText}>From: {sms.sender}</ThemedText>

                <ThemedText
                  variant="bodyMedium"
                  style={styles.messageText}
                  numberOfLines={isExpanded ? 10 : 2}
                >
                  {sms.message}
                </ThemedText>

                {sms.isFraud && sms.fraudReason && (
                  <ThemedView style={styles.reasonBox} lightColor="#fef2f2" darkColor="#330000">
                    <ThemedText variant="bodySmall" style={styles.reasonText}>
                      Reason: {sms.fraudReason}
                    </ThemedText>
                    {sms.confidence && (
                      <ThemedText variant="caption" style={styles.confidenceText}>
                        Confidence: {formatConfidencePercentage(sms.confidence)}
                      </ThemedText>
                    )}
                  </ThemedView>
                )}

                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    onPress={() => toggleExpanded(sms.id)}
                    style={styles.cardActionBtn}
                  >
                    <ThemedText variant="button" style={styles.cardActionText}>
                      {isExpanded ? "Collapse" : "Expand"}
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleShare(sms)}
                    style={styles.cardActionBtn}
                  >
                    <ThemedText variant="button" style={styles.cardActionText}>Share</ThemedText>
                  </TouchableOpacity>
                </View>
              </ThemedView>
            );
          })
        ) : (
          <ThemedView card style={styles.emptyStateCard} lightColor="#f9fafb" darkColor="#222222">
            <ThemedText variant="bodyLarge" weight="semibold" style={styles.emptyStateTitle}>
              📱 No SMS messages scanned yet
            </ThemedText>
            <ThemedText variant="bodyMedium" secondary style={styles.emptyStateSubtitle}>
              {Platform.OS === "android"
                ? "Start monitoring to see real-time fraud detection"
                : "SMS monitoring is only available on Android"}
            </ThemedText>
          </ThemedView>
        )}
      </View>
    </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 0,
  },
  headerIcon: {
    marginLeft: 8,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
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
  monitoringButton: {
    marginVertical: 8,
  },
  startButton: { backgroundColor: "#dcfce7" },
  stopButton: { backgroundColor: "#fee2e2" },
  primaryActionText: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  startText: { color: "#166534" },
  stopText: { color: "#991b1b" },
  infoBannerWarning: {
    borderRadius: 8,
    padding: 8,
  },
  infoBannerWarningText: {
    fontSize: 12,
    textAlign: "center",
  },
  infoBannerError: {
    borderRadius: 8,
    padding: 8,
  },
  infoBannerErrorText: {
    fontSize: 12,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    flexWrap: "wrap",
  },
  statItem: { 
    alignItems: "center", 
    minWidth: 70,
    paddingHorizontal: 5, 
    marginVertical: 5,
    width: '23%',
  },
  statNumber: { 
    fontSize: 20, 
    fontWeight: "bold", 
    textAlign: "center",
    marginBottom: 4,
  },
  statLabel: { 
    fontSize: 11, 
    textAlign: "center",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  filterChipActive: { backgroundColor: "#e0e7ff" },
  filterChipText: { fontWeight: "600", fontSize: 12 },
  filterChipTextActive: { color: "#3730a3" },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  searchInputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionsRow: { flexDirection: "row", gap: 12, marginBottom: 8 },
  secondaryAction: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  secondaryActionText: { textAlign: "center", fontWeight: "600" },
  listHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  subtleText: { fontSize: 12, color: "#6b7280" },
  messageCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  messageHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  badgeText: { fontSize: 12, fontWeight: "700" },
  timestampText: { fontSize: 11, color: "#6b7280" },
  senderText: { fontSize: 13, color: "#4b5563", marginBottom: 4 },
  messageText: { fontSize: 14, color: "#111827", marginBottom: 6 },
  reasonBox: { padding: 8, borderRadius: 8 },
  reasonText: { fontSize: 12 },
  confidenceText: { fontSize: 12, marginTop: 2 },
  cardActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 6,
  },
  cardActionBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  cardActionText: { color: "#2563eb", fontWeight: "600", fontSize: 12 },
  emptyStateCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  emptyStateTitle: { textAlign: "center" },
  emptyStateSubtitle: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 6,
  },
  autoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  autoText: { color: "#4b5563", fontSize: 13 },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 999,
    padding: 3,
    justifyContent: "center",
  },
  toggleOn: { backgroundColor: "#22c55e" },
  toggleOff: { backgroundColor: "#9ca3af" },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: "#ffffff",
  },
  knobOn: { marginLeft: 23 },
  knobOff: { marginLeft: 0 },
});