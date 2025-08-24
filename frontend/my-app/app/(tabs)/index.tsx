import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { callProtectedApi } from "../../services/auth";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";

const HomeScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isLoggedIn, loading } = useAuth();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace('/sign-in');
    }
  }, [isLoggedIn, loading]);

  const { logout } = useAuth();
  
  const handleSignOut = async () => {
    try {
      await logout();
      router.replace("/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Don't render the main content until we have user data
  if (loading || !user) {
    return null;
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
          ) : (
            <MaterialIcons name="account-circle" size={40} color={Colors.light.tint} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages or advisors..."
          placeholderTextColor="#666"
        />
      </View>

    {/* Rest of your existing content */}
    {/* Header */}
    <Text style={styles.header}>🛡️ SMS Fraud Detector</Text>

      {/* Last Scan Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Last SMS Scanned:</Text>
        <Text style={styles.statusSafe}>✅ Safe</Text>

        <TouchableOpacity
          onPress={() => router.push("/scan")}
          style={styles.scanButton}
        >
          <Text style={styles.scanButtonText}>🔍 Scan Now</Text>
        </TouchableOpacity>
      </View>

      {/* Features Grid */}
      <View style={styles.featuresGrid}>
        <TouchableOpacity
          onPress={() => router.push("/monitor")}
          style={styles.featureCard}
        >
          <MaterialIcons name="sms" size={36} color="#2563eb" />
          <Text style={styles.featureText}>Monitor SMS</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/report")}
          style={styles.featureCard}
        >
          <FontAwesome5 name="flag" size={30} color="#dc2626" />
          <Text style={styles.featureText}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/verify")}
          style={styles.featureCard}
        >
          <MaterialIcons name="verified-user" size={36} color="#16a34a" />
          <Text style={styles.featureText}>Verify</Text>
        </TouchableOpacity>
      </View>

      {/* Live Alerts */}
      <View style={styles.alertCard}>
        <Text style={styles.alertTitle}>⚠️ Suspicious SMS Detected</Text>
        <Text style={styles.alertText}>
          "Your KYC is expiring, click this link..."
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  profileButton: {
    marginLeft: 15,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 24,
    textAlign: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  statusSafe: {
    fontSize: 16,
    color: "#16a34a",
    marginTop: 4,
  },
  scanButton: {
    marginTop: 16,
    backgroundColor: "#2563eb",
    borderRadius: 12,
    padding: 12,
  },
  scanButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    backgroundColor: "white",
    width: "48%",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  featureText: {
    marginTop: 8,
    color: "#1f2937",
    fontWeight: "600",
    fontSize: 16,
  },
  alertCard: {
    backgroundColor: "#fef3c7",
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#92400e",
  },
  alertText: {
    color: "#374151",
    marginTop: 8,
    fontStyle: "italic",
  },
});

// Ensure this is properly exported as the default export
export default HomeScreen;
