import React, { useMemo, useState, useEffect } from "react";
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
import smsMonitorService, { SMSMessage } from "../../services/smsMonitor";

export default function ReportScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [fraudReports, setFraudReports] = useState<SMSMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'manual' | 'detected'>('manual');
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

  const handleReport = async () => {
    if (!phoneNumber.trim() || !message.trim()) {
      Alert.alert("Error", "Please fill in phone number and message");
      return;
    }
    try {
      await smsMonitorService.reportFraudManually(phoneNumber.trim(), message.trim(), additionalInfo.trim() || undefined);
      await loadFraudReports();
      setPhoneNumber("");
      setMessage("");
      setAdditionalInfo("");
      Alert.alert("Report Submitted", "Thank you for reporting this fraudulent message. It helps protect others!");
    } catch (e) {
      Alert.alert("Failed", "Could not submit the report. Please try again.");
    }
  };

  const deleteReport = async (id: string) => {
    try {
      await smsMonitorService.deleteFraudReport(id);
      await loadFraudReports();
    } catch (e) {
      Alert.alert('Delete Failed', 'Could not delete the report');
    }
  };

  const shareReport = async (r: SMSMessage) => {
    try {
      await Share.share({
        message: `Fraud Report\nFrom: ${r.sender}\nWhen: ${new Date(r.timestamp).toLocaleString()}\nReason: ${r.fraudReason ?? 'N/A'}\n${r.confidence ? `Confidence: ${(r.confidence * 100).toFixed(1)}%\n` : ''}Message: ${r.message}`,
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
    return fraudReports.filter(r => r.sender.toLowerCase().includes(q) || r.message.toLowerCase().includes(q));
  }, [fraudReports, searchQuery]);

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: Math.max(24, insets.bottom) }}
    >
      <View style={styles.wrapper}>
        <Text style={styles.header}>🚩 Report Fraud</Text>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity onPress={() => setActiveTab('manual')} style={[styles.tabBtn, activeTab === 'manual' && styles.tabBtnActive]}>
            <Text style={[styles.tabText, activeTab === 'manual' && styles.tabTextActive]}>Manual Report</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('detected')} style={[styles.tabBtn, activeTab === 'detected' && styles.tabBtnActive]}>
            <Text style={[styles.tabText, activeTab === 'detected' && styles.tabTextActive]}>Auto-Detected ({fraudReports.length})</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'manual' ? (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Report Suspicious SMS</Text>

              <Text style={styles.label}>Sender Phone Number:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number (e.g., +1234567890)"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Fraudulent Message:</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                multiline
                placeholder="Paste the suspicious message here..."
                value={message}
                onChangeText={setMessage}
                textAlignVertical="top"
              />

              <Text style={styles.label}>Additional Information (Optional):</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                multiline
                placeholder="Any additional context or information..."
                value={additionalInfo}
                onChangeText={setAdditionalInfo}
                textAlignVertical="top"
              />

              <TouchableOpacity onPress={handleReport} style={styles.submitBtn}>
                <Text style={styles.submitBtnText}>🚩 Submit Report</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>📝 Why Report?</Text>
              <Text style={styles.infoText}>• Help protect other users from scams</Text>
              <Text style={styles.infoText}>• Improve our fraud detection algorithms</Text>
              <Text style={styles.infoText}>• Build a community defense against fraud</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.listHeaderRow}>
              <Text style={styles.cardTitle}>Detected Fraud Messages</Text>
              <TouchableOpacity onPress={loadFraudReports}>
                <Text style={[styles.linkText, { color: '#2563eb' }]}>🔄 Refresh</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by sender or message..."
              style={styles.search}
            />

            <TouchableOpacity onPress={exportAll} style={styles.exportBtn}>
              <Text style={styles.exportBtnText}>⬇️ Export All Reports (JSON)</Text>
            </TouchableOpacity>

            {filteredReports.length > 0 ? (
              filteredReports.map((report) => {
                const isExpanded = expandedIds.has(report.id);
                return (
                  <View key={report.id} style={styles.reportCard}>
                    <View style={styles.reportHeaderRow}>
                      <Text style={[styles.badge, { color: '#dc2626' }]}>🚨 FRAUD DETECTED</Text>
                      <Text style={styles.timestamp}>{formatTimeAgo(report.timestamp)}</Text>
                    </View>
                    <Text style={styles.sender}>From: {report.sender}</Text>
                    <Text style={styles.msg} numberOfLines={isExpanded ? 12 : 3}>{report.message}</Text>

                    <View style={styles.detailBox}>
                      <Text style={styles.detailTitle}>Detection Details</Text>
                      {!!report.fraudReason && <Text style={styles.detailText}>{report.fraudReason}</Text>}
                      {report.confidence && (
                        <Text style={styles.detailConfidence}>Confidence: {(report.confidence * 100).toFixed(1)}%</Text>
                      )}
                    </View>

                    <View style={styles.actionsRow}>
                      <TouchableOpacity onPress={() => toggleExpanded(report.id)} style={styles.actionBtn}>
                        <Text style={styles.actionText}>{isExpanded ? 'Collapse' : 'Expand'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => shareReport(report)} style={styles.actionBtn}>
                        <Text style={styles.actionText}>Share</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert('Delete Report', 'Are you sure you want to delete this report?', [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => deleteReport(report.id) },
                          ]);
                        }}
                        style={styles.actionBtn}
                      >
                        <Text style={[styles.actionText, { color: '#dc2626' }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>🛡️ No fraud detected yet</Text>
                <Text style={styles.emptySubtitle}>Start SMS monitoring to automatically detect fraud</Text>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  wrapper: { padding: 24 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 16, textAlign: 'center' },
  tabsRow: { flexDirection: 'row', backgroundColor: '#e5e7eb', borderRadius: 12, padding: 4, marginBottom: 16 },
  tabBtn: { flex: 1, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10 },
  tabBtnActive: { backgroundColor: '#ffffff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  tabText: { textAlign: 'center', fontWeight: '600', color: '#6b7280' },
  tabTextActive: { color: '#111827' },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 8 },
  label: { color: '#4b5563', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, fontSize: 14, color: '#111827' },
  multiline: { minHeight: 100 },
  submitBtn: { backgroundColor: '#dc2626', borderRadius: 12, paddingVertical: 12 },
  submitBtnText: { color: '#ffffff', textAlign: 'center', fontWeight: '700', fontSize: 16 },
  infoCard: { backgroundColor: '#eff6ff', borderRadius: 16, padding: 16 },
  infoTitle: { color: '#1d4ed8', fontWeight: '700', marginBottom: 8 },
  infoText: { color: '#1e40af', fontSize: 12, marginBottom: 4 },
  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  search: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, fontSize: 14, color: '#111827' },
  exportBtn: { backgroundColor: '#f3f4f6', borderRadius: 12, paddingVertical: 10, marginBottom: 12 },
  exportBtnText: { textAlign: 'center', fontWeight: '600', color: '#111827' },
  reportCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  reportHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  badge: { fontSize: 12, fontWeight: '700' },
  timestamp: { fontSize: 11, color: '#6b7280' },
  sender: { fontSize: 13, color: '#4b5563', marginBottom: 4 },
  msg: { fontSize: 14, color: '#111827', marginBottom: 6 },
  detailBox: { backgroundColor: '#fef2f2', padding: 8, borderRadius: 8 },
  detailTitle: { color: '#991b1b', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  detailText: { color: '#991b1b', fontSize: 12 },
  detailConfidence: { color: '#b91c1c', fontSize: 12, marginTop: 2 },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 6 },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  actionText: { color: '#2563eb', fontWeight: '600', fontSize: 12 },
  linkText: { fontWeight: '600' },
  emptyCard: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, alignItems: 'center' },
  emptyTitle: { color: '#6b7280', textAlign: 'center' },
  emptySubtitle: { color: '#9ca3af', textAlign: 'center', fontSize: 12, marginTop: 6 },
});
