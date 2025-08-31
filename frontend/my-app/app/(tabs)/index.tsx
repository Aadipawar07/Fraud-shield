import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { ThemedView } from "../../components/ThemedView";
import { ThemedText } from "../../components/ThemedText";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { Card, TouchableCard } from "../../components/Card";
import { Spacing } from "../../constants/Spacing";
import { BorderRadius, Shadow } from "../../constants/Shape";
import { useTheme } from "../../context/ThemeContext";
import { useThemeColor } from "../../hooks/useThemeColor";

const HomeScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isLoggedIn, loading } = useAuth();
  const { colorScheme } = useTheme();
  const primaryColor = useThemeColor({}, "tint");
  const successColor = useThemeColor({}, "success");
  const warningColor = useThemeColor({}, "warning");
  const dangerColor = useThemeColor({}, "danger");
  const neutralColor = useThemeColor({}, "textSecondary");
  
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
      style={[styles.container, { paddingTop: insets.top + 10 }]}
      contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.userInfo}>
          <ThemedText variant="bodyMedium" style={styles.greeting}>Hello,</ThemedText>
          <ThemedText variant="h2" style={styles.userName}>{user?.displayName || 'User'}</ThemedText>
          <ThemedText variant="bodyMedium" style={styles.subtitle}>Welcome to Fraud Shield</ThemedText>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={() => router.navigate("/profile")}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
          ) : (
            <MaterialIcons name="account-circle" size={44} color={primaryColor} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color={neutralColor} style={styles.searchIcon} />
        <Input
          containerStyle={styles.searchInput}
          placeholder="Search messages or advisors..."
        />
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Card style={[styles.statsCard, { backgroundColor: "#e8f5e9" }]}>
          <ThemedText variant="h3" style={styles.statsNumber}>95%</ThemedText>
          <ThemedText variant="caption" style={styles.statsLabel}>Protection</ThemedText>
          <MaterialIcons
            name="security"
            size={24}
            color={successColor}
            style={styles.statsIcon}
          />
        </Card>

        <Card style={[styles.statsCard, { backgroundColor: "#fff3e0" }]}>
          <ThemedText variant="h3" style={styles.statsNumber}>31</ThemedText>
          <ThemedText variant="caption" style={styles.statsLabel}>Alerts</ThemedText>
          <MaterialIcons
            name="notification-important"
            size={24}
            color={warningColor}
            style={styles.statsIcon}
          />
        </Card>

        <Card style={[styles.statsCard, { backgroundColor: "#e3f2fd" }]}>
          <ThemedText variant="h3" style={styles.statsNumber}>3</ThemedText>
          <ThemedText variant="caption" style={styles.statsLabel}>Actions</ThemedText>
          <MaterialIcons
            name="pending-actions"
            size={24}
            color={primaryColor}
            style={styles.statsIcon}
          />
        </Card>
      </View>

      {/* Recent Activity */}
      <Card style={styles.card}>
        <ThemedText variant="h3" style={styles.cardTitle}>Recent Activity</ThemedText>
        <View style={styles.activityItem}>
          <MaterialIcons name="warning" size={24} color={warningColor} />
          <View style={styles.activityContent}>
            <ThemedText variant="bodyMedium" weight="semibold" style={styles.activityText}>Suspicious SMS detected</ThemedText>
            <ThemedText variant="caption" style={styles.activityTime}>10 minutes ago</ThemedText>
          </View>
          <TouchableOpacity>
            <MaterialIcons name="chevron-right" size={24} color={neutralColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.activityItem}>
          <MaterialIcons name="check-circle" size={24} color={successColor} />
          <View style={styles.activityContent}>
            <ThemedText variant="bodyMedium" weight="semibold" style={styles.activityText}>Weekly scan completed</ThemedText>
            <ThemedText variant="caption" style={styles.activityTime}>3 hours ago</ThemedText>
          </View>
          <TouchableOpacity>
            <MaterialIcons name="chevron-right" size={24} color={neutralColor} />
          </TouchableOpacity>
        </View>
        
        <Button 
          variant="primary"
          size="large"
          title="Scan Now"
          onPress={() => router.navigate("/scan")}
          style={styles.scanButton}
          leftIcon={<MaterialIcons name="search" size={20} color="#ffffff" />}
        />
      </Card>

      {/* Features Grid */}
      <View style={styles.featuresGrid}>
        <TouchableCard
          onPress={() => router.navigate("/(tabs)/monitor")}
          style={styles.featureCard}
        >
          <MaterialIcons name="sms" size={36} color={primaryColor} />
          <ThemedText variant="bodyMedium" weight="semibold" style={styles.featureText}>Monitor SMS</ThemedText>
        </TouchableCard>

        <TouchableCard
          onPress={() => router.navigate("/(tabs)/report")}
          style={styles.featureCard}
        >
          <FontAwesome5 name="flag" size={30} color={dangerColor} />
          <ThemedText variant="bodyMedium" weight="semibold" style={styles.featureText}>Reports</ThemedText>
        </TouchableCard>

        <TouchableCard
          onPress={() => router.navigate("/(tabs)/verify")}
          style={styles.featureCard}
        >
          <MaterialIcons name="verified-user" size={36} color={successColor} />
          <ThemedText variant="bodyMedium" weight="semibold" style={styles.featureText}>Verify</ThemedText>
        </TouchableCard>

        <TouchableCard
          onPress={() => router.navigate("../(tabs)/index")} 
          style={styles.featureCard}
        >
          <MaterialIcons name="settings" size={36} color={neutralColor} />
          <ThemedText variant="bodyMedium" weight="semibold" style={styles.featureText}>Settings</ThemedText>
        </TouchableCard>
      </View>

      {/* Live Alerts */}
      <Card style={[styles.alertCard, { backgroundColor: "#fff3e0" }]}>
        <ThemedText variant="bodyMedium" weight="semibold" style={styles.alertTitle}>⚠️ Suspicious SMS Detected</ThemedText>
        <ThemedText variant="bodyMedium" style={styles.alertText}>
          "Your KYC is expiring, click this link..."
        </ThemedText>
        <TouchableOpacity style={styles.alertAction}>
          <ThemedText variant="button" style={{ color: primaryColor }}>
            Review
          </ThemedText>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
  },
  userName: {
    fontWeight: "bold",
  },
  subtitle: {
    marginTop: 2,
  },
  profileButton: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: 50,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Light gray-blue background instead of default white
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  cardTitle: {
    marginBottom: Spacing.sm,
  },
  scanButton: {
    marginTop: Spacing.md,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  featureCard: {
    width: "48%",
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    height: 120,
    ...Shadow.sm,
  },
  featureText: {
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  alertCard: {
    padding: Spacing.md,
    marginTop: Spacing.md,
    ...Shadow.sm,
  },
  alertTitle: {
    fontWeight: "600",
  },
  alertText: {
    marginTop: Spacing.xs,
    fontStyle: "italic",
  },
  alertAction: {
    marginTop: Spacing.sm,
    alignSelf: "flex-end",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  statsCard: {
    flex: 1,
    padding: Spacing.md,
    marginHorizontal: 4,
    alignItems: "center",
    ...Shadow.sm,
  },
  statsNumber: {
    fontWeight: "bold",
  },
  statsLabel: {
    marginTop: Spacing.xs,
  },
  statsIcon: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    opacity: 0.8,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0", // Slightly darker border for better visibility
  },
  activityContent: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  activityText: {
    fontWeight: "500",
  },
  activityTime: {
    marginTop: 2,
  },
});

export default HomeScreen;
