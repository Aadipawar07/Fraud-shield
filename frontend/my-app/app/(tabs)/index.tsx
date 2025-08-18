import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

const HomeScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: Math.max(24, insets.bottom + 72) }}
    >
      {/* Header */}
      <Text style={styles.header}>
        🛡️ SMS Fraud Detector
      </Text>

      {/* Last Scan Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Last SMS Scanned:
        </Text>
        <Text style={styles.statusSafe}>✅ Safe</Text>

        <TouchableOpacity
          onPress={() => router.push("/scan")}
          style={styles.scanButton}
        >
          <Text style={styles.scanButtonText}>
            🔍 Scan Now
          </Text>
        </TouchableOpacity>
      </View>

      {/* Features Grid */}
      <View style={styles.featuresGrid}>
        <TouchableOpacity
          onPress={() => router.push("/monitor")}
          style={styles.featureCard}
        >
          <MaterialIcons name="sms" size={36} color="#2563eb" />
          <Text style={styles.featureText}>
            Monitor SMS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/report")}
          style={styles.featureCard}
        >
          <FontAwesome5 name="flag" size={30} color="#dc2626" />
          <Text style={styles.featureText}>
            Reports
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/verify")}
          style={styles.featureCard}
        >
          <MaterialIcons name="verified-user" size={36} color="#16a34a" />
          <Text style={styles.featureText}>
            Verify
          </Text>
        </TouchableOpacity>
      </View>

      {/* Live Alerts */}
      <View style={styles.alertCard}>
        <Text style={styles.alertTitle}>
          ⚠️ Suspicious SMS Detected
        </Text>
        <Text style={styles.alertText}>
          "Your KYC is expiring, click this link..."
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  statusSafe: {
    fontSize: 16,
    color: '#16a34a',
    marginTop: 4,
  },
  scanButton: {
    marginTop: 16,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 12,
  },
  scanButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    backgroundColor: 'white',
    width: '48%',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  featureText: {
    marginTop: 8,
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 16,
  },
  alertCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400e',
  },
  alertText: {
    color: '#374151',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default HomeScreen;
