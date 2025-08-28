import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { verifyPhoneNumber, VerifyNumberResponse } from "../../services/api";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import smsMonitorService from "../../services/smsMonitor";
// Import verification service functions and types
import { 
  searchPhoneNumber, 
  searchRegisteredIntermediary, 
  searchDebarredEntity,
  getCirculars,
  getCircularCategories,
  getCircularYears,
  RegisteredIntermediary,
  DebarredEntity,
  Circular,
  FraudNumber
} from "../../services/verificationService";

interface VerificationResult {
  phoneNumber: string;
  isVerified: boolean;
  riskLevel: string;
  status: string;
}

export default function VerifyScreen() {
  // Search term states
  const [searchTerm, setSearchTerm] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  // Phone number verification
  const [verificationResult, setVerificationResult] = 
    useState<VerifyNumberResponse | null>(null);
  const [phoneVerifyResult, setPhoneVerifyResult] = 
    useState<FraudNumber | null>(null);
  
  // Other verification results
  const [intermediaryResult, setIntermediaryResult] = 
    useState<RegisteredIntermediary | null>(null);
  const [debarredResult, setDebarredResult] = 
    useState<DebarredEntity | null>(null);
  const [circulars, setCirculars] = useState<Circular[]>([]);
  
  // Search status tracking (to know if search was actually performed)
  const [phoneSearched, setPhoneSearched] = useState(false);
  const [intermediarySearched, setIntermediarySearched] = useState(false);
  const [debarredSearched, setDebarredSearched] = useState(false);
  
  // Circular filters
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [circularCategories, setCircularCategories] = useState<string[]>([]);
  const [circularYears, setCircularYears] = useState<number[]>([]);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'phone' | 'intermediary' | 'debarred' | 'circular'>('phone');
  const [history, setHistory] = useState<VerifyNumberResponse[]>([]);
  const insets = useSafeAreaInsets();

  const HISTORY_KEY = "verify_history";

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(HISTORY_KEY);
        if (raw) setHistory(JSON.parse(raw));
        
        // Load circular categories and years
        setCircularCategories(getCircularCategories());
        setCircularYears(getCircularYears());
        
        // Load initial circulars (most recent ones)
        setCirculars(getCirculars());
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    })();
  }, []);

  const saveHistory = async (entry: VerifyNumberResponse) => {
    try {
      const next = [
        entry,
        ...history.filter((h) => h.normalized !== entry.normalized),
      ].slice(0, 10);
      setHistory(next);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {}
  };

  const pasteFromClipboard = async () => {
    try {
      const content = await Clipboard.getStringAsync();
      if (activeTab === 'phone') {
        const normalized = content.replace(/[^0-9+]/g, "");
        setPhoneNumber(normalized);
      } else {
        setSearchTerm(content);
      }
    } catch {}
  };

  // Verify phone number using backend API
  const handleVerifyPhone = async (overrideNumber?: string) => {
    const inputNumber = (overrideNumber ?? phoneNumber).trim();
    if (!inputNumber) {
      Alert.alert("Error", "Please enter a phone number to verify");
      return;
    }
    try {
      setIsLoading(true);
      setPhoneSearched(true); // Mark that a search was performed
      
      // First check against our local database
      const localResult = searchPhoneNumber(inputNumber);
      setPhoneVerifyResult(localResult);
      
      // Then check against the backend API
      try {
        const result = await verifyPhoneNumber(inputNumber);
        setVerificationResult(result);
        await saveHistory(result);
      } catch (apiError: any) {
        console.error("API error during phone verification:", apiError);
        // Even if API fails, we can still show local database result
        if (!localResult) {
          console.log(`No information found for phone number "${inputNumber}" in local or API database`);
        }
      }
    } catch (e: any) {
      Alert.alert("Verification Failed", e?.message || "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Search for registered intermediary
  const handleSearchIntermediary = () => {
    if (!searchTerm.trim()) {
      Alert.alert("Error", "Please enter a name or registration number");
      return;
    }
    setIsLoading(true);
    try {
      setIntermediarySearched(true); // Mark that a search was performed
      const result = searchRegisteredIntermediary(searchTerm);
      setIntermediaryResult(result);
      
      // Optional: Show a toast or alert if no result found
      if (!result) {
        console.log(`No registered intermediary found for "${searchTerm}"`);
      }
    } catch (error) {
      console.error("Error searching intermediary:", error);
      Alert.alert("Search Failed", "Could not search for registered intermediary");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Search for debarred entity
  const handleSearchDebarred = () => {
    if (!searchTerm.trim()) {
      Alert.alert("Error", "Please enter a name to search");
      return;
    }
    setIsLoading(true);
    try {
      setDebarredSearched(true); // Mark that a search was performed
      const result = searchDebarredEntity(searchTerm);
      setDebarredResult(result);
      
      // Optional: Show a toast or alert if no result found
      if (!result) {
        console.log(`No debarred entity found for "${searchTerm}"`);
      }
    } catch (error) {
      console.error("Error searching debarred entity:", error);
      Alert.alert("Search Failed", "Could not search for debarred entity");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter circulars
  const handleFilterCirculars = () => {
    setCirculars(getCirculars(selectedCategory, selectedYear));
  };
  
  const clearFilters = () => {
    setSelectedCategory(undefined);
    setSelectedYear(undefined);
    setCirculars(getCirculars());
  };

  const clearResult = () => {
    setVerificationResult(null);
    setPhoneVerifyResult(null);
    setPhoneNumber("");
    setSearchTerm("");
    setIntermediaryResult(null);
    setDebarredResult(null);
    setPhoneSearched(false);
    setIntermediarySearched(false);
    setDebarredSearched(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: Math.max(24, insets.bottom) }}
    >
      <View style={styles.wrapper}>
        <Text style={styles.header}>🔍 Fraud-Shield Verification</Text>
        
        {/* Navigation Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => {
              setActiveTab('phone');
              clearResult();
              setPhoneSearched(false);
            }}
            style={[
              styles.tab,
              activeTab === 'phone' && styles.activeTab
            ]}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'phone' && styles.activeTabText
            ]}>Phone Numbers</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => {
              setActiveTab('intermediary');
              clearResult();
              setIntermediarySearched(false);
            }}
            style={[
              styles.tab,
              activeTab === 'intermediary' && styles.activeTab
            ]}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'intermediary' && styles.activeTabText
            ]}>SEBI Intermediaries</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => {
              setActiveTab('debarred');
              clearResult();
              setDebarredSearched(false);
            }}
            style={[
              styles.tab,
              activeTab === 'debarred' && styles.activeTab
            ]}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'debarred' && styles.activeTabText
            ]}>Debarred Entities</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => {
              setActiveTab('circular');
              clearResult();
            }}
            style={[
              styles.tab,
              activeTab === 'circular' && styles.activeTab
            ]}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'circular' && styles.activeTabText
            ]}>SEBI Circulars</Text>
          </TouchableOpacity>
        </View>
        
        {/* Phone Number Verification Section */}
        {activeTab === 'phone' && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Check Phone Number</Text>
              <Text style={styles.label}>Phone Number:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number to verify"
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  setPhoneSearched(false); // Reset search status when input changes
                }}
                keyboardType="phone-pad"
              />
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  onPress={pasteFromClipboard}
                  style={styles.secondaryBtn}
                >
                  <Text style={styles.secondaryBtnText}>📋 Paste</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setPhoneNumber("")}
                  style={styles.secondaryBtn}
                >
                  <Text style={styles.secondaryBtnText}>Clear</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => handleVerifyPhone()}
                disabled={!phoneNumber.trim() || isLoading}
                style={[
                  styles.primaryBtn,
                  !phoneNumber.trim() || isLoading
                    ? styles.btnDisabled
                    : styles.btnOk,
                ]}
              >
                <Text style={styles.primaryBtnText}>
                  {isLoading ? "Checking..." : "🔍 Verify Number"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Local database result */}
            {phoneVerifyResult && (
              <View
                style={[
                  styles.resultCard,
                  {
                    backgroundColor: 
                      phoneVerifyResult.status.toLowerCase() === "safe" ? "#f0fdf4" :
                      phoneVerifyResult.status.toLowerCase() === "fraud" ? "#fef2f2" : 
                      "#fffbeb"
                  },
                ]}
              >
                <Text style={[
                  styles.resultTitle,
                  {
                    color: 
                      phoneVerifyResult.status.toLowerCase() === "safe" ? "#166534" :
                      phoneVerifyResult.status.toLowerCase() === "fraud" ? "#991b1b" : 
                      "#92400e"
                  },
                ]}>
                  {phoneVerifyResult.status.toLowerCase() === "safe" ? "✅ Safe Number" : 
                   phoneVerifyResult.status.toLowerCase() === "fraud" ? "⚠️ Fraud Number" : 
                   "⚠️ Unknown Status"}
                </Text>
                <View style={{ marginBottom: 12 }}>
                  <Text style={styles.kv}>
                    Phone: <Text style={styles.kvValue}>{phoneVerifyResult.number}</Text>
                  </Text>
                  <Text style={styles.kv}>
                    Status: <Text style={styles.kvValue}>{phoneVerifyResult.status}</Text>
                  </Text>
                  <Text style={styles.kv}>
                    Reports: <Text style={styles.kvValue}>{phoneVerifyResult.reported_by}</Text>
                  </Text>
                  {phoneVerifyResult.last_reported && (
                    <Text style={styles.kv}>
                      Last Reported: <Text style={styles.kvValue}>{phoneVerifyResult.last_reported}</Text>
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* API verification result */}
            {verificationResult && (
              <View
                style={[
                  styles.resultCard,
                  {
                    backgroundColor: verificationResult.isVerified
                      ? "#f0fdf4"
                      : "#fef2f2",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.resultTitle,
                    {
                      color: verificationResult.isVerified ? "#166534" : "#991b1b",
                    },
                  ]}
                >
                  {verificationResult.isVerified
                    ? "✅ Number Verified"
                    : "⚠️ Risk Detected"}
                </Text>
                <View style={{ marginBottom: 12 }}>
                  <Text style={styles.kv}>
                    Phone:{" "}
                    <Text style={styles.kvValue}>
                      {verificationResult.phoneNumber}
                    </Text>
                  </Text>
                  <Text style={styles.kv}>
                    Normalized:{" "}
                    <Text style={styles.kvValue}>
                      {verificationResult.normalized}
                    </Text>
                  </Text>
                  <Text style={styles.kv}>
                    Status:{" "}
                    <Text style={styles.kvValue}>{verificationResult.status}</Text>
                  </Text>
                  {!!verificationResult.reportCount && (
                    <Text style={styles.kv}>
                      Reports:{" "}
                      <Text style={styles.kvValue}>
                        {verificationResult.reportCount}
                      </Text>
                    </Text>
                  )}
                  <Text
                    style={[
                      styles.kv,
                      {
                        fontWeight: "700",
                        color:
                          verificationResult.riskLevel === "high"
                            ? "#dc2626"
                            : verificationResult.riskLevel === "medium"
                              ? "#f59e0b"
                              : "#16a34a",
                      },
                    ]}
                  >
                    Risk Level: {verificationResult.riskLevel.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    onPress={() => {
                      setVerificationResult(null);
                      setPhoneVerifyResult(null);
                    }}
                    style={styles.secondaryBtn}
                  >
                    <Text style={styles.secondaryBtnText}>Verify Another</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        await smsMonitorService.reportFraudManually(
                          verificationResult.phoneNumber,
                          "Reported via Verify page",
                        );
                        Alert.alert(
                          "Reported",
                          "Number added as a manual fraud report",
                        );
                      } catch {
                        Alert.alert("Failed", "Could not report the number");
                      }
                    }}
                    style={styles.secondaryBtn}
                  >
                    <Text style={[styles.secondaryBtnText, { color: "#dc2626" }]}>
                      Report Number
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        await Share.share({
                          message: `Verification Result\nPhone: ${verificationResult.phoneNumber}\nStatus: ${verificationResult.status}\nRisk: ${verificationResult.riskLevel}`,
                        });
                      } catch {}
                    }}
                    style={styles.secondaryBtn}
                  >
                    <Text style={styles.secondaryBtnText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            {/* Not Found Message for Phone Verification */}
            {phoneSearched && !phoneVerifyResult && !verificationResult && !isLoading && (
              <View style={styles.notFoundCard}>
                <Text style={styles.notFoundTitle}>No Results Found</Text>
                <Text style={styles.notFoundText}>No information found for this phone number.</Text>
                <Text style={styles.notFoundText}>This could be a good sign, as the number has not been reported as fraudulent.</Text>
                <Text style={styles.notFoundText}>However, please exercise caution with unknown numbers.</Text>
              </View>
            )}

            {/* Recent Verifications */}
            {history.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>🕘 Recent Verifications</Text>
                {history.map((h) => (
                  <View key={h.normalized} style={styles.historyRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "600", color: "#111827" }}>
                        {h.phoneNumber}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#6b7280" }}>
                        Risk: {h.riskLevel} • {h.status}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={async () => {
                        await handleVerifyPhone(h.phoneNumber);
                      }}
                      style={styles.recheckBtn}
                    >
                      <Text style={styles.recheckText}>Re-check</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* SEBI Registered Intermediaries Section */}
        {activeTab === 'intermediary' && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Search SEBI Registered Intermediaries</Text>
              <Text style={styles.label}>Name or Registration Number:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter name or registration number"
                value={searchTerm}
                onChangeText={(text) => {
                  setSearchTerm(text);
                  setIntermediarySearched(false); // Reset search status when input changes
                }}
              />
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  onPress={pasteFromClipboard}
                  style={styles.secondaryBtn}
                >
                  <Text style={styles.secondaryBtnText}>📋 Paste</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSearchTerm("")}
                  style={styles.secondaryBtn}
                >
                  <Text style={styles.secondaryBtnText}>Clear</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={handleSearchIntermediary}
                disabled={!searchTerm.trim() || isLoading}
                style={[
                  styles.primaryBtn,
                  !searchTerm.trim() || isLoading
                    ? styles.btnDisabled
                    : styles.btnOk,
                ]}
              >
                <Text style={styles.primaryBtnText}>
                  {isLoading ? "Searching..." : "🔍 Search"}
                </Text>
              </TouchableOpacity>
            </View>

            {intermediaryResult && (
              <View
                style={[
                  styles.resultCard,
                  {
                    backgroundColor: 
                      intermediaryResult.status.toLowerCase() === "active" ? "#f0fdf4" : "#fffbeb",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.resultTitle,
                    {
                      color: 
                        intermediaryResult.status.toLowerCase() === "active" ? "#166534" : "#92400e",
                    },
                  ]}
                >
                  {intermediaryResult.status.toLowerCase() === "active" 
                    ? "✅ Registered & Active" 
                    : "⚠️ Registration Inactive"}
                </Text>
                <View style={{ marginBottom: 12 }}>
                  <Text style={styles.kv}>
                    Name: <Text style={styles.kvValue}>{intermediaryResult.name}</Text>
                  </Text>
                  <Text style={styles.kv}>
                    Registration: <Text style={styles.kvValue}>{intermediaryResult.registration_number}</Text>
                  </Text>
                  <Text style={styles.kv}>
                    Category: <Text style={styles.kvValue}>{intermediaryResult.category}</Text>
                  </Text>
                  <Text style={styles.kv}>
                    Status: <Text style={styles.kvValue}>{intermediaryResult.status}</Text>
                  </Text>
                  <Text style={styles.kv}>
                    Valid Till: <Text style={styles.kvValue}>{intermediaryResult.valid_till}</Text>
                  </Text>
                  <Text style={styles.kv}>
                    Contact: <Text style={styles.kvValue}>{intermediaryResult.contact}</Text>
                  </Text>
                  <Text style={styles.kv}>
                    Address: <Text style={styles.kvValue}>{intermediaryResult.address}</Text>
                  </Text>
                </View>
                
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    onPress={() => {
                      setIntermediaryResult(null);
                      setSearchTerm("");
                    }}
                    style={styles.secondaryBtn}
                  >
                    <Text style={styles.secondaryBtnText}>New Search</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        await Share.share({
                          message: `SEBI Registered Intermediary\nName: ${intermediaryResult.name}\nRegistration: ${intermediaryResult.registration_number}\nStatus: ${intermediaryResult.status}\nValid Till: ${intermediaryResult.valid_till}`,
                        });
                      } catch {}
                    }}
                    style={styles.secondaryBtn}
                  >
                    <Text style={styles.secondaryBtnText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            {/* Not Found Message for Intermediary Search */}
            {intermediarySearched && !intermediaryResult && !isLoading && (
              <View style={styles.notFoundCard}>
                <Text style={styles.notFoundTitle}>No Registered Intermediary Found</Text>
                <Text style={styles.notFoundText}>No registered SEBI intermediary found with this name or registration number.</Text>
                <Text style={styles.notFoundText}>Please verify the spelling or try a different search term.</Text>
                <Text style={styles.notFoundText}>If you're dealing with an entity claiming to be SEBI-registered but not found here, exercise caution.</Text>
              </View>
            )}
          </>
        )}

        {/* Debarred Entities Section */}
        {activeTab === 'debarred' && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Search Debarred Entities</Text>
              <Text style={styles.label}>Entity Name:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter entity name to search"
                value={searchTerm}
                onChangeText={(text) => {
                  setSearchTerm(text);
                  setDebarredSearched(false); // Reset search status when input changes
                }}
              />
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  onPress={pasteFromClipboard}
                  style={styles.secondaryBtn}
                >
                  <Text style={styles.secondaryBtnText}>📋 Paste</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSearchTerm("")}
                  style={styles.secondaryBtn}
                >
                  <Text style={styles.secondaryBtnText}>Clear</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={handleSearchDebarred}
                disabled={!searchTerm.trim() || isLoading}
                style={[
                  styles.primaryBtn,
                  !searchTerm.trim() || isLoading
                    ? styles.btnDisabled
                    : styles.btnOk,
                ]}
              >
                <Text style={styles.primaryBtnText}>
                  {isLoading ? "Searching..." : "🔍 Search"}
                </Text>
              </TouchableOpacity>
            </View>

            {debarredResult && (
              <View
                style={[
                  styles.resultCard,
                  {
                    backgroundColor: "#fef2f2",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.resultTitle,
                    {
                      color: "#991b1b",
                    },
                  ]}
                >
                  ⚠️ Entity Found in Debarred List
                </Text>
                <View style={{ marginBottom: 12 }}>
                  <Text style={styles.kv}>
                    Name: <Text style={styles.kvValue}>{debarredResult.name}</Text>
                  </Text>
                  <Text style={styles.kv}>
                    Entity Type: <Text style={styles.kvValue}>{debarredResult.entity_type}</Text>
                  </Text>
                  <Text style={styles.kv}>
                    Date of Debarment: <Text style={styles.kvValue}>{debarredResult.date_of_debarment}</Text>
                  </Text>
                  <Text style={styles.kv}>
                    Duration: <Text style={styles.kvValue}>{debarredResult.duration}</Text>
                  </Text>
                  <Text style={styles.kv}>
                    Reason: <Text style={styles.kvValue}>{debarredResult.reason}</Text>
                  </Text>
                  <Text style={styles.kv}>
                    Status: <Text style={styles.kvValue}>{debarredResult.status}</Text>
                  </Text>
                </View>
                
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    onPress={() => {
                      setDebarredResult(null);
                      setSearchTerm("");
                    }}
                    style={styles.secondaryBtn}
                  >
                    <Text style={styles.secondaryBtnText}>New Search</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        await Share.share({
                          message: `SEBI Debarred Entity\nName: ${debarredResult.name}\nEntity Type: ${debarredResult.entity_type}\nDate of Debarment: ${debarredResult.date_of_debarment}\nReason: ${debarredResult.reason}`,
                        });
                      } catch {}
                    }}
                    style={styles.secondaryBtn}
                  >
                    <Text style={styles.secondaryBtnText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {debarredSearched && !debarredResult && !isLoading && (
              <View style={styles.notFoundCard}>
                <Text style={styles.notFoundTitle}>No Debarred Entity Found</Text>
                <Text style={styles.notFoundText}>No matching entities found in the debarred list.</Text>
                <Text style={styles.notFoundText}>This is generally a good sign, but please verify the spelling of the entity name.</Text>
                <Text style={styles.notFoundText}>The entity you searched for is not currently debarred by SEBI.</Text>
              </View>
            )}
          </>
        )}

        {/* SEBI Circulars Section */}
        {activeTab === 'circular' && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>SEBI Circulars & Notifications</Text>
              
              {/* Filter options */}
              <View style={styles.filterSection}>
                <Text style={styles.label}>Filter by Category:</Text>
                <View style={styles.pickerWrapper}>
                  <TouchableOpacity
                    onPress={() => setSelectedCategory(undefined)}
                    style={[
                      styles.filterChip,
                      !selectedCategory && styles.activeFilterChip
                    ]}
                  >
                    <Text style={[
                      styles.filterChipText,
                      !selectedCategory && styles.activeFilterChipText
                    ]}>All</Text>
                  </TouchableOpacity>
                  
                  {circularCategories.map(category => (
                    <TouchableOpacity
                      key={category}
                      onPress={() => setSelectedCategory(category)}
                      style={[
                        styles.filterChip,
                        selectedCategory === category && styles.activeFilterChip
                      ]}
                    >
                      <Text style={[
                        styles.filterChipText,
                        selectedCategory === category && styles.activeFilterChipText
                      ]}>{category}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Text style={styles.label}>Filter by Year:</Text>
                <View style={styles.pickerWrapper}>
                  <TouchableOpacity
                    onPress={() => setSelectedYear(undefined)}
                    style={[
                      styles.filterChip,
                      !selectedYear && styles.activeFilterChip
                    ]}
                  >
                    <Text style={[
                      styles.filterChipText,
                      !selectedYear && styles.activeFilterChipText
                    ]}>All</Text>
                  </TouchableOpacity>
                  
                  {circularYears.map(year => (
                    <TouchableOpacity
                      key={year}
                      onPress={() => setSelectedYear(year)}
                      style={[
                        styles.filterChip,
                        selectedYear === year && styles.activeFilterChip
                      ]}
                    >
                      <Text style={[
                        styles.filterChipText,
                        selectedYear === year && styles.activeFilterChipText
                      ]}>{year}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    onPress={handleFilterCirculars}
                    style={styles.secondaryBtn}
                  >
                    <Text style={styles.secondaryBtnText}>Apply Filters</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={clearFilters}
                    style={styles.secondaryBtn}
                  >
                    <Text style={styles.secondaryBtnText}>Clear Filters</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Circulars list */}
              <View style={styles.circularsList}>
                <Text style={[styles.label, { marginTop: 10 }]}>
                  {circulars.length} {circulars.length === 1 ? 'Circular' : 'Circulars'} Found
                </Text>
                
                {circulars.length === 0 ? (
                  <View style={styles.notFoundCard}>
                    <Text style={styles.notFoundTitle}>No Matching Circulars</Text>
                    <Text style={styles.notFoundText}>No circulars match the current filters.</Text>
                    <Text style={styles.notFoundText}>Try adjusting the category or year filters to see more results.</Text>
                    <TouchableOpacity
                      onPress={clearFilters}
                      style={[styles.secondaryBtn, { marginTop: 12, alignSelf: 'center' }]}
                    >
                      <Text style={styles.secondaryBtnText}>Clear All Filters</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  circulars.map((circular, index) => (
                    <View key={index} style={styles.circularCard}>
                      <Text style={styles.circularTitle}>{circular.title}</Text>
                      <Text style={styles.circularDate}>
                        Date: {new Date(circular.date).toLocaleDateString()}
                      </Text>
                      <Text style={styles.circularCategory}>
                        Category: {circular.category}
                      </Text>
                      <Text style={styles.circularDescription}>{circular.description}</Text>
                      
                      {circular.link && (
                        <TouchableOpacity
                          onPress={() => Alert.alert("Link", "This would open the SEBI website link: " + circular.link)}
                          style={styles.linkBtn}
                        >
                          <Text style={styles.linkBtnText}>View on SEBI Website</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))
                )}
              </View>
            </View>
          </>
        )}

        {/* Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💬 About Verification Tools</Text>
          <Text style={styles.helpText}>
            • Phone Numbers: Check against known fraud databases and community reports
          </Text>
          <Text style={styles.helpText}>
            • SEBI Intermediaries: Verify if an entity is a registered SEBI intermediary
          </Text>
          <Text style={styles.helpText}>
            • Debarred Entities: Check if an entity has been debarred by SEBI
          </Text>
          <Text style={styles.helpText}>
            • SEBI Circulars: Browse SEBI circulars and notifications
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  wrapper: { padding: 24 },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    minWidth: '48%',
    marginHorizontal: '1%',
  },
  activeTab: {
    backgroundColor: '#16a34a',
  },
  tabText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
    color: '#374151',
  },
  activeTabText: {
    color: 'white',
  },
  // Cards
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  label: { color: "#4b5563", marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    color: "#111827",
  },
  // Buttons
  primaryBtn: { borderRadius: 12, paddingVertical: 12 },
  btnOk: { backgroundColor: "#16a34a" },
  btnDisabled: { backgroundColor: "#9ca3af" },
  primaryBtnText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  // Results
  resultCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  kv: { color: "#374151", marginBottom: 6 },
  kvValue: { fontWeight: "600" },
  actionsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  secondaryBtn: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  secondaryBtnText: { color: "#111827", fontWeight: "600" },
  helpText: { color: "#6b7280", fontSize: 12, marginBottom: 4 },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  recheckBtn: {
    backgroundColor: "#dbeafe",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  recheckText: { color: "#2563eb", fontWeight: "700" },
  // Circulars section
  filterSection: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  pickerWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilterChip: {
    backgroundColor: '#dbeafe',
  },
  filterChipText: {
    fontSize: 12,
    color: '#4b5563',
  },
  activeFilterChipText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  circularsList: {
    marginTop: 12,
  },
  circularCard: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
  },
  circularTitle: {
    fontWeight: '600',
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  circularDate: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  circularCategory: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  circularDescription: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 8,
  },
  linkBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  linkBtnText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  // Not Found Styles
  notFoundCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 12,
    textAlign: "center",
  },
  notFoundText: {
    color: "#64748b",
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});
