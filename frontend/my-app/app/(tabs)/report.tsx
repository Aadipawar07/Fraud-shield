import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  TextInput as RNTextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatConfidencePercentage } from "../../utils/formatters";
import smsMonitorService, { SMSMessage } from "../../services/smsMonitor";
import { ThemedText } from "../../components/ThemedText";
import { Card } from "../../components/Card";
import { ThemedView } from "../../components/ThemedView";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { Spacing } from "../../constants/Spacing";
import { BorderRadius, Shadow } from "../../constants/Shape";
import { useTheme } from "../../context/ThemeContext";
import { useThemeColor } from "../../hooks/useThemeColor";

export default function ReportScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [fraudReports, setFraudReports] = useState<SMSMessage[]>([]);
  const [activeTab, setActiveTab] = useState<"manual" | "detected">("manual");
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadFraudReports();
  }, []);

  const loadFraudReports = async () => {
    try {
      const reports = await smsMonitorService.getFraudReports();
      setFraudReports(reports);
    } catch (error) {
      console.error("Failed to load fraud reports:", error);
    }
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

  const handleReport = async () => {
    if (!phoneNumber.trim() || !message.trim()) {
      Alert.alert("Error", "Please fill in phone number and message");
      return;
    }
    try {
      await smsMonitorService.reportFraudManually(
        phoneNumber.trim(),
        message.trim(),
        additionalInfo.trim() || undefined,
      );
      await loadFraudReports();
      setPhoneNumber("");
      setMessage("");
      setAdditionalInfo("");
      Alert.alert(
        "Report Submitted",
        "Thank you for reporting this fraudulent message. It helps protect others!",
      );
    } catch (e) {
      Alert.alert("Failed", "Could not submit the report. Please try again.");
    }
  };

  const deleteReport = async (id: string) => {
    try {
      await smsMonitorService.deleteFraudReport(id);
      await loadFraudReports();
    } catch (e) {
      Alert.alert("Delete Failed", "Could not delete the report");
    }
  };

  const shareReport = async (r: SMSMessage) => {
    try {
      await Share.share({
        message: `Fraud Report\nFrom: ${r.sender}\nWhen: ${new Date(r.timestamp).toLocaleString()}\nReason: ${r.fraudReason ?? "N/A"}\n${r.confidence ? `Confidence: ${formatConfidencePercentage(r.confidence)}\n` : ""}Message: ${r.message}`,
      });
    } catch {}
  };

  const exportAll = async () => {
    const json = await smsMonitorService.exportFraudReports();
    try {
      await Share.share({ message: json });
    } catch {}
  };

  const filteredReports = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return fraudReports;
    return fraudReports.filter(
      (r) =>
        r.sender.toLowerCase().includes(q) ||
        r.message.toLowerCase().includes(q),
    );
  }, [fraudReports, searchQuery]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const { colorScheme } = useTheme();
  const primaryColor = useThemeColor({}, "tint");
  const successColor = useThemeColor({}, "success");
  const warningColor = useThemeColor({}, "warning");
  const dangerColor = useThemeColor({}, "danger");
  const neutralColor = useThemeColor({}, "textSecondary");
  const backgroundColor = useThemeColor({}, "background");

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={{ paddingBottom: Math.max(Spacing.xl, insets.bottom) }}
    >
      <View style={styles.wrapper}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText variant="h2" style={styles.headerText}>🚩 Report Fraud</ThemedText>
        </ThemedView>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            onPress={() => setActiveTab("manual")}
            style={[
              styles.tabBtn,
              activeTab === "manual" && styles.tabBtnActive,
            ]}
          >
            <ThemedText
              variant="button"
              style={[
                styles.tabText,
                activeTab === "manual" && styles.tabTextActive,
              ]}
            >
              Manual Report
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("detected")}
            style={[
              styles.tabBtn,
              activeTab === "detected" && styles.tabBtnActive,
            ]}
          >
            <ThemedText
              variant="button"
              style={[
                styles.tabText,
                activeTab === "detected" && styles.tabTextActive,
              ]}
            >
              Auto-Detected ({fraudReports.length})
            </ThemedText>
          </TouchableOpacity>
        </View>

        {activeTab === "manual" ? (
          <>
            <Card style={styles.card}>
              <ThemedText variant="h3" style={styles.cardTitle}>Report Suspicious SMS</ThemedText>

              <ThemedText variant="bodyMedium" style={styles.label}>Sender Phone Number:</ThemedText>
              <Input
                containerStyle={styles.input}
                placeholder="Enter phone number (e.g., +1234567890)"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />

              <ThemedText variant="bodyMedium" style={styles.label}>Fraudulent Message:</ThemedText>
              <Input
                containerStyle={[styles.input, styles.multiline]}
                multiline
                placeholder="Paste the suspicious message here..."
                value={message}
                onChangeText={setMessage}
                textAlignVertical="top"
              />

              <ThemedText variant="bodyMedium" style={styles.label}>
                Additional Information (Optional):
              </ThemedText>
              <Input
                containerStyle={[styles.input, styles.multiline]}
                multiline
                placeholder="Any additional context or information..."
                value={additionalInfo}
                onChangeText={setAdditionalInfo}
                textAlignVertical="top"
              />

              <Button 
                title="🚩 Submit Report"
                variant="danger"
                size="large"
                onPress={handleReport}
                style={styles.submitBtn}
              />
            </Card>

            <Card style={styles.infoCard}>
              <ThemedText variant="bodyLarge" weight="semibold" style={styles.infoTitle}>📝 Why Report?</ThemedText>
              <ThemedText variant="bodyMedium" style={styles.infoText}>
                • Help protect other users from scams
              </ThemedText>
              <ThemedText variant="bodyMedium" style={styles.infoText}>
                • Improve our fraud detection algorithms
              </ThemedText>
              <ThemedText variant="bodyMedium" style={styles.infoText}>
                • Build a community defense against fraud
              </ThemedText>
            </Card>
          </>
        ) : (
          <>
            <View style={styles.listHeaderRow}>
              <ThemedText variant="h3" style={styles.cardTitle}>Detected Fraud Messages</ThemedText>
              <TouchableOpacity onPress={loadFraudReports}>
                <ThemedText variant="button" style={styles.linkText}>
                  🔄 Refresh
                </ThemedText>
              </TouchableOpacity>
            </View>

            <Input
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by sender or message..."
              containerStyle={styles.search}
            />

            <Button
              title="⬇️ Export All Reports (JSON)"
              variant="outline"
              size="medium"
              onPress={exportAll}
              style={styles.exportBtn}
            />

            {filteredReports.length > 0 ? (
              filteredReports.map((report) => {
                const isExpanded = expandedIds.has(report.id);
                return (
                  <Card key={report.id} style={styles.reportCard}>
                    <View style={styles.reportHeaderRow}>
                      <ThemedText 
                        variant="label" 
                        weight="semibold" 
                        style={[styles.badge, { color: dangerColor }]}
                      >
                        🚨 FRAUD DETECTED
                      </ThemedText>
                      <ThemedText variant="caption" style={styles.timestamp}>
                        {formatTimeAgo(report.timestamp)}
                      </ThemedText>
                    </View>
                    <ThemedText variant="bodyMedium" style={styles.sender}>From: {report.sender}</ThemedText>
                    <ThemedText
                      variant="bodyMedium"
                      style={styles.msg}
                      numberOfLines={isExpanded ? 12 : 3}
                    >
                      {report.message}
                    </ThemedText>

                    <ThemedView style={styles.detailBox}>
                      <ThemedText variant="bodyMedium" weight="semibold" style={styles.detailTitle}>Detection Details</ThemedText>
                      {!!report.fraudReason && (
                        <ThemedText variant="bodySmall" style={styles.detailText}>
                          {report.fraudReason}
                        </ThemedText>
                      )}
                      {report.confidence && (
                        <ThemedText variant="caption" style={styles.detailConfidence}>
                          Confidence: {formatConfidencePercentage(report.confidence)}
                        </ThemedText>
                      )}
                    </ThemedView>

                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        onPress={() => toggleExpanded(report.id)}
                        style={styles.actionBtn}
                      >
                        <ThemedText variant="button" style={styles.actionText}>
                          {isExpanded ? "Collapse" : "Expand"}
                        </ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => shareReport(report)}
                        style={styles.actionBtn}
                      >
                        <ThemedText variant="button" style={styles.actionText}>Share</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert(
                            "Delete Report",
                            "Are you sure you want to delete this report?",
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Delete",
                                style: "destructive",
                                onPress: () => deleteReport(report.id),
                              },
                            ],
                          );
                        }}
                        style={styles.actionBtn}
                      >
                        <ThemedText variant="button" style={[styles.actionText, { color: dangerColor }]}>
                          Delete
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  </Card>
                );
              })
            ) : (
              <Card style={styles.emptyCard}>
                <ThemedText variant="bodyLarge" weight="semibold" style={styles.emptyTitle}>🛡️ No fraud detected yet</ThemedText>
                <ThemedText variant="bodyMedium" secondary style={styles.emptySubtitle}>
                  Start SMS monitoring to automatically detect fraud
                </ThemedText>
              </Card>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  wrapper: { 
    padding: 24 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontWeight: "bold",
    marginBottom: 0,
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  tabBtnActive: {
    backgroundColor: "#ffffff",
    ...Shadow.md,
  },
  tabText: { textAlign: "center", fontWeight: "600", color: "#6b7280" },
  tabTextActive: { color: "#111827" },
  card: {
    marginBottom: Spacing.md,
  },
  cardTitle: {
    marginBottom: Spacing.xs,
  },
  label: { 
    marginBottom: Spacing.xs 
  },
  input: {
    marginBottom: Spacing.sm,
  },
  multiline: { 
    minHeight: 100 
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
  infoCard: { 
    backgroundColor: "#eff6ff",
    marginTop: Spacing.md,
  },
  infoTitle: { 
    marginBottom: Spacing.sm,
  },
  infoText: { 
    marginBottom: Spacing.xs,
  },
  listHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  search: {
    marginBottom: Spacing.sm,
  },
  exportBtn: {
    marginBottom: Spacing.md,
  },
  reportCard: {
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  reportHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.xs,
  },
  badge: {
    fontWeight: "700",
  },
  timestamp: {
    opacity: 0.7,
  },
  sender: {
    marginBottom: Spacing.xs,
  },
  msg: {
    marginBottom: Spacing.xs,
  },
  detailBox: { 
    backgroundColor: "#fef2f2", 
    padding: Spacing.sm, 
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  detailTitle: {
    marginBottom: Spacing.xs,
  },
  detailText: {},
  detailConfidence: { 
    marginTop: Spacing.xs,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  actionBtn: { 
    paddingVertical: Spacing.xs, 
    paddingHorizontal: Spacing.sm,
  },
  actionText: {},
  linkText: {
    color: "#2563eb",
  },
  emptyCard: {
    padding: Spacing.md,
    alignItems: "center",
  },
  emptyTitle: { 
    textAlign: "center",
  },
  emptySubtitle: {
    textAlign: "center",
    marginTop: Spacing.xs,
  },
});
