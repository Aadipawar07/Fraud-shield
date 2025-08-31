import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { verifyPhoneNumber, VerifyNumberResponse } from "../../services/api";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import smsMonitorService from "../../services/smsMonitor";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useTheme } from "../../context/ThemeContext";
import { useThemeColor } from "../../hooks/useThemeColor";
import ThemedInput from "../../components/ThemedInput";
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

type TabType = 'phone' | 'intermediary' | 'debarred' | 'circular';

interface RecentSearch {
  type: TabType;
  query: string;
  timestamp: number;
  result: any;
}

export default function VerifyScreen() {
  // Theme hooks
  const { colorScheme } = useTheme();
  const primaryColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");
  const inputBgColor = useThemeColor({}, "backgroundSecondary");
  const cardBgColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({}, "border");
  
  // Search term states
  const [searchTerm, setSearchTerm] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  // Phone number verification
  const [verificationResult, setVerificationResult] = useState<VerifyNumberResponse | null>(null);
  const [phoneVerifyResult, setPhoneVerifyResult] = useState<FraudNumber | null>(null);
  
  // Other verification results
  const [intermediaryResult, setIntermediaryResult] = useState<RegisteredIntermediary | null>(null);
  const [debarredResult, setDebarredResult] = useState<DebarredEntity | null>(null);
  const [circulars, setCirculars] = useState<Circular[]>([]);
  
  // Circular search filters
  const [circularCategories, setCircularCategories] = useState<string[]>([]);
  const [circularYears, setCircularYears] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [circularSearchTerm, setCircularSearchTerm] = useState<string>("");
  
  // Search status tracking
  const [phoneSearched, setPhoneSearched] = useState(false);
  const [intermediarySearched, setIntermediarySearched] = useState(false);
  const [debarredSearched, setDebarredSearched] = useState(false);
  const [debarredSearchTerm, setDebarredSearchTerm] = useState<string>("");
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('phone');
  const [history, setHistory] = useState<VerifyNumberResponse[]>([]);
  const insets = useSafeAreaInsets();
  
  // Helper functions
  const clearResult = () => {
    setPhoneVerifyResult(null);
    setVerificationResult(null);
    setIntermediaryResult(null);
    setDebarredResult(null);
    setCirculars([]);
  };
  
  const clearSearchInputs = () => {
    setPhoneNumber("");
    setSearchTerm("");
    setDebarredSearchTerm("");
    setCircularSearchTerm("");
    setSelectedCategory("");
    setSelectedYear(null);
  };
  
  const handleVerifyPhone = () => {
    if (!phoneNumber.trim()) return;
    
    setIsLoading(true);
    
    // Try searching with different formats of the phone number
    try {
      // Local database check
      console.log("Searching for phone number in local database:", phoneNumber);
      
      // Try multiple formats for better matching
      const formats = [
        phoneNumber,
        phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`,
        phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber,
        phoneNumber.replace(/\D/g, "")
      ];
      
      console.log("Trying phone number formats:", formats);
      
      // Search with original format
      let result = searchPhoneNumber(phoneNumber);
      
      // If no result, try other formats
      if (!result) {
        console.log("No result with original format, trying alternatives");
        for (const format of formats) {
          if (format === phoneNumber) continue; // Skip the original format that we already tried
          
          const alternativeResult = searchPhoneNumber(format);
          if (alternativeResult) {
            console.log(`Found result with alternative format: ${format}`);
            result = alternativeResult;
            break;
          }
        }
      }
      
      console.log("Final phone search result from local database:", result);
      setPhoneVerifyResult(result);
      setPhoneSearched(true);
      
      // If we have a local result, show it immediately
      if (result) {
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error searching phone in local database:", error);
    }
    
    // Fallback to API verification if no local result
    verifyPhoneNumber(phoneNumber)
      .then((result) => {
        setVerificationResult(result);
        // Add to history
        const newHistory = [result, ...history.slice(0, 9)];
        setHistory(newHistory);
        AsyncStorage.setItem("verify_history", JSON.stringify(newHistory));
      })
      .catch((error) => {
        console.error("Error verifying number:", error);
        Alert.alert("Verification Failed", "Could not verify this number. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  
  const pasteFromClipboard = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      // Preserve the + at the beginning for international format
      const cleaned = text.startsWith('+') 
        ? '+' + text.substring(1).replace(/\D/g, "")
        : text.replace(/\D/g, "");
      
      console.log("Pasted from clipboard:", text, "cleaned to:", cleaned);
      setPhoneNumber(cleaned);
    }
  };
  
  // Debarred Entity Search
  const handleSearchDebarredEntity = () => {
    if (!debarredSearchTerm.trim()) return;
    
    setIsLoading(true);
    try {
      console.log("Searching for debarred entity with term:", debarredSearchTerm);
      const result = searchDebarredEntity(debarredSearchTerm);
      console.log("Debarred entity search result:", result);
      setDebarredResult(result);
      setDebarredSearched(true);
    } catch (error) {
      console.error("Error searching debarred entity:", error);
      Alert.alert("Search Failed", "Could not search for debarred entity. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // SEBI Circular Search
  const loadCircularFilters = async () => {
    try {
      console.log("Loading circular filters");
      const categories = getCircularCategories();
      const years = getCircularYears();
      
      setCircularCategories(categories);
      setCircularYears(years);
      
      // Default to most recent year
      if (years.length > 0) {
        setSelectedYear(years[0]);
        console.log("Set default year to:", years[0]);
      }
    } catch (error) {
      console.error("Error loading circular filters:", error);
    }
  };
  
  const handleSearchCirculars = () => {
    setIsLoading(true);
    try {
      // Pass the category and year directly as parameters
      // This matches the function definition in verificationService.ts
      const results = getCirculars(selectedCategory, selectedYear || undefined);
      
      // If search term is provided, filter results further
      let filteredResults = results;
      if (circularSearchTerm.trim()) {
        const searchTerm = circularSearchTerm.toLowerCase().trim();
        filteredResults = results.filter(circular => 
          circular.title.toLowerCase().includes(searchTerm) || 
          circular.description.toLowerCase().includes(searchTerm)
        );
      }
      
      setCirculars(filteredResults);
      console.log(`Found ${filteredResults.length} circulars with search term "${circularSearchTerm}" and filters:`, { category: selectedCategory, year: selectedYear });
    } catch (error) {
      console.error("Error searching circulars:", error);
      Alert.alert("Search Failed", "Could not search for circulars. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initialize components and verify data is loaded
  useEffect(() => {
    console.log("Component mounted, initializing verification data");
    
    // Check if the verification service has loaded data
    try {
      const categories = getCircularCategories();
      const years = getCircularYears();
      const testIntermediary = searchRegisteredIntermediary("ABC");
      const testDebarred = searchDebarredEntity("Fake");
      
      // Test all phone number formats for debugging
      const phoneTests = [
        searchPhoneNumber("+919876543210"),  // With + format
        searchPhoneNumber("919876543210"),   // Without + format
        searchPhoneNumber("9876543210"),     // Without country code
        searchPhoneNumber("+91 9876 543 210") // With spaces
      ];
      
      console.log("Verification service test results:", {
        categories: categories.length,
        years: years.length,
        intermediaryFound: !!testIntermediary,
        debarredFound: !!testDebarred,
        phoneTests: phoneTests.map(test => !!test)
      });
      
      // Log example searches only, don't try to access fraudNumbers directly
    } catch (error) {
      console.error("Error testing verification service:", error);
    }
    
    // If the circular tab is active on component mount, load the filters
    if (activeTab === 'circular') {
      loadCircularFilters();
    }
  }, []);
  
  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ 
          padding: 16, 
          paddingBottom: Math.max(24, insets.bottom) 
        }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.headerContainer}>
          <ThemedView style={{flexDirection: "row", alignItems: "center", flex: 1}}>
            <ThemedView style={[styles.headerIconContainer, {backgroundColor: primaryColor}]}>
              <MaterialIcons name="verified" size={28} color="#fff" />
            </ThemedView>
            <ThemedText style={styles.header}>
              Fraud-Shield Verification
            </ThemedText>
          </ThemedView>
          <ThemeToggle size="small" showLabel={false} />
        </ThemedView>
        
        {/* Tab Navigation */}
        <ThemedView style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => {
              setActiveTab('phone');
              clearResult();
              setPhoneSearched(false);
            }}
            style={[
              styles.tab,
              activeTab === 'phone' && [styles.activeTab, {backgroundColor: primaryColor}]
            ]}
          >
            <MaterialIcons 
              name="phone" 
              size={22} 
              color={activeTab === 'phone' ? "#fff" : textColor} 
            />
            <ThemedText style={[
              styles.tabText,
              activeTab === 'phone' && styles.activeTabText
            ]}>Phone Numbers</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => {
              setActiveTab('intermediary');
              clearResult();
              setIntermediarySearched(false);
            }}
            style={[
              styles.tab,
              activeTab === 'intermediary' && [styles.activeTab, {backgroundColor: primaryColor}]
            ]}
          >
            <Ionicons 
              name="people" 
              size={22} 
              color={activeTab === 'intermediary' ? "#fff" : textColor} 
            />
            <ThemedText style={[
              styles.tabText,
              activeTab === 'intermediary' && styles.activeTabText
            ]}>SEBI Intermediaries</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => {
              setActiveTab('debarred');
              clearResult();
              setDebarredSearched(false);
            }}
            style={[
              styles.tab,
              activeTab === 'debarred' && [styles.activeTab, {backgroundColor: primaryColor}]
            ]}
          >
            <MaterialIcons 
              name="person-off" 
              size={22} 
              color={activeTab === 'debarred' ? "#fff" : textColor} 
            />
            <ThemedText style={[
              styles.tabText,
              activeTab === 'debarred' && styles.activeTabText
            ]}>Debarred Entities</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => {
              setActiveTab('circular');
              clearResult();
              // Load circular categories and years when tab is opened
              loadCircularFilters();
            }}
            style={[
              styles.tab,
              activeTab === 'circular' && [styles.activeTab, {backgroundColor: primaryColor}]
            ]}
          >
            <FontAwesome5 
              name="file-alt" 
              size={20} 
              color={activeTab === 'circular' ? "#fff" : textColor} 
            />
            <ThemedText style={[
              styles.tabText,
              activeTab === 'circular' && styles.activeTabText
            ]}>SEBI Circulars</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        
        {/* Phone Number Verification Section */}
        {activeTab === 'phone' && (
          <ThemedView style={styles.cardElevated}>
            <ThemedView style={styles.cardHeader}>
              <MaterialIcons name="phone-in-talk" size={22} color={primaryColor} />
              <ThemedText style={styles.cardTitle}>Check Phone Number</ThemedText>
            </ThemedView>
            
            <ThemedInput
              label="Phone Number:"
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text);
                setPhoneSearched(false); // Reset search status when input changes
              }}
              placeholder="Enter phone number to verify"
              keyboardType="phone-pad"
              maxLength={15}
              leftIcon="phone"
              showClearButton={true}
            />
              
            <ThemedView style={styles.actionsRow}>
              <TouchableOpacity
                onPress={pasteFromClipboard}
                style={styles.actionButton}
              >
                <MaterialIcons name="content-paste" size={18} color={primaryColor} />
                <ThemedText style={styles.actionButtonText}>Paste</ThemedText>
              </TouchableOpacity>
              
              {/* Quick test buttons - for development only */}
              <TouchableOpacity
                onPress={() => setPhoneNumber("+919876543210")}
                style={styles.actionButton}
              >
                <MaterialIcons name="bug-report" size={18} color={primaryColor} />
                <ThemedText style={styles.actionButtonText}>Test Fraud</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setPhoneNumber("+918888877777")}
                style={styles.actionButton}
              >
                <MaterialIcons name="bug-report" size={18} color={primaryColor} />
                <ThemedText style={styles.actionButtonText}>Test Safe</ThemedText>
              </TouchableOpacity>
            </ThemedView>
            
            <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  setPhoneNumber("");
                  clearResult();
                  setPhoneSearched(false);
                }}
                disabled={!phoneNumber.trim() || isLoading}
                style={[
                  styles.resetButton,
                  !phoneNumber.trim() || isLoading ? styles.buttonDisabled : {},
                ]}
              >
                <MaterialIcons name="refresh" size={20} color={textColor} />
                <ThemedText style={styles.resetButtonText}>Reset</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => handleVerifyPhone()}
                disabled={!phoneNumber.trim() || isLoading}
                style={[
                  styles.verifyButton,
                  {backgroundColor: primaryColor},
                  !phoneNumber.trim() || isLoading ? styles.buttonDisabled : {},
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="verified-user" size={20} color="#ffffff" />
                    <ThemedText style={styles.verifyButtonText}>Verify Number</ThemedText>
                  </>
                )}
              </TouchableOpacity>
            </ThemedView>
            
            {/* Phone Number Search Results */}
            {phoneSearched && (
              <ThemedView style={styles.resultCard}>
                <ThemedText style={styles.resultHeader}>Local Database Results</ThemedText>
                {phoneVerifyResult ? (
                  <>
                    <ThemedView style={[
                      styles.statusBadge, 
                      {
                        backgroundColor: 
                          phoneVerifyResult.status === 'Fraud' ? '#ffcdd2' : 
                          phoneVerifyResult.status === 'Safe' ? '#c8e6c9' : 
                          '#fff9c4'
                      }
                    ]}>
                      <ThemedText style={[
                        styles.statusText, 
                        {
                          color: 
                            phoneVerifyResult.status === 'Fraud' ? '#c62828' : 
                            phoneVerifyResult.status === 'Safe' ? '#2e7d32' : 
                            '#f57f17'
                        }
                      ]}>
                        {phoneVerifyResult.status.toUpperCase()}
                      </ThemedText>
                    </ThemedView>
                    <ThemedText style={styles.resultLabel}>Number:</ThemedText>
                    <ThemedText style={styles.resultValue}>{phoneVerifyResult.number}</ThemedText>
                    
                    {phoneVerifyResult.status === 'Fraud' && (
                      <>
                        <ThemedText style={styles.resultLabel}>Reported By:</ThemedText>
                        <ThemedText style={styles.resultValue}>
                          {phoneVerifyResult.reported_by} {phoneVerifyResult.reported_by === 1 ? 'user' : 'users'}
                        </ThemedText>
                        <ThemedText style={styles.resultLabel}>Last Reported:</ThemedText>
                        <ThemedText style={styles.resultValue}>
                          {phoneVerifyResult.last_reported || 'N/A'}
                        </ThemedText>
                      </>
                    )}
                    
                    <ThemedText style={[styles.resultNote, {marginTop: 16}]}>
                      {phoneVerifyResult.status === 'Fraud' 
                        ? 'This number has been reported as fraudulent. Avoid sharing personal information.'
                        : phoneVerifyResult.status === 'Safe'
                        ? 'This number appears to be legitimate based on our records.'
                        : 'Limited information available about this number. Proceed with caution.'}
                    </ThemedText>
                  </>
                ) : verificationResult ? (
                  <>
                    <ThemedView style={[
                      styles.statusBadge, 
                      { backgroundColor: verificationResult.riskLevel === 'high' ? '#ffcdd2' : 
                                         verificationResult.riskLevel === 'medium' ? '#fff9c4' : '#c8e6c9' }
                    ]}>
                      <ThemedText style={[
                        styles.statusText, 
                        { color: verificationResult.riskLevel === 'high' ? '#c62828' : 
                                 verificationResult.riskLevel === 'medium' ? '#f57f17' : '#2e7d32' }
                      ]}>
                        {verificationResult.riskLevel.toUpperCase()} RISK
                      </ThemedText>
                    </ThemedView>
                    
                    <ThemedText style={styles.resultLabel}>Number:</ThemedText>
                    <ThemedText style={styles.resultValue}>{verificationResult.phoneNumber}</ThemedText>
                    
                    <ThemedText style={styles.resultLabel}>Status:</ThemedText>
                    <ThemedText style={styles.resultValue}>{verificationResult.status || 'Unknown'}</ThemedText>
                    
                    {verificationResult.reportCount && verificationResult.reportCount > 0 && (
                      <>
                        <ThemedText style={styles.resultLabel}>Report Count:</ThemedText>
                        <ThemedText style={styles.resultValue}>{verificationResult.reportCount}</ThemedText>
                      </>
                    )}
                    
                    {verificationResult.matches && verificationResult.matches.length > 0 && (
                      <>
                        <ThemedText style={styles.resultLabel}>Matched Reports:</ThemedText>
                        {verificationResult.matches.map((match, idx) => (
                          <ThemedText key={idx} style={styles.resultValue}>
                            - {match.type}: {match.reason || 'No reason provided'} 
                            ({match.reportCount || 0} reports)
                          </ThemedText>
                        ))}
                      </>
                    )}
                    
                    {verificationResult.riskLevel === 'high' && (
                      <ThemedText style={[styles.resultNote, {marginTop: 16, color: '#c62828'}]}>
                        This number has been flagged as high risk. Avoid sharing personal information.
                      </ThemedText>
                    )}
                  </>
                ) : (
                  <ThemedView style={styles.emptyResultCard}>
                    <MaterialIcons name="search-off" size={40} color="#9e9e9e" />
                    <ThemedText style={styles.emptyResultText}>No information found</ThemedText>
                    <ThemedText style={styles.emptyResultSubtext}>
                      This number is not in our fraud database
                    </ThemedText>
                  </ThemedView>
                )}
              </ThemedView>
            )}
          </ThemedView>
        )}
        
        {/* SEBI Intermediary Section */}
        {activeTab === 'intermediary' && (
          <ThemedView style={styles.cardElevated}>
            <ThemedView style={styles.cardHeader}>
              <Ionicons name="people" size={22} color={primaryColor} />
              <ThemedText style={styles.cardTitle}>Search SEBI Intermediaries</ThemedText>
            </ThemedView>
            
            <ThemedInput
              label="Search by name:"
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Enter intermediary name"
              leftIcon="search"
              showClearButton={true}
            />
            
            <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  setSearchTerm("");
                  setIntermediaryResult(null);
                  setIntermediarySearched(false);
                }}
                disabled={!searchTerm.trim() || isLoading}
                style={[
                  styles.resetButton,
                  !searchTerm.trim() || isLoading ? styles.buttonDisabled : {},
                ]}
              >
                <MaterialIcons name="refresh" size={20} color={textColor} />
                <ThemedText style={styles.resetButtonText}>Reset</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => {
                  setIsLoading(true);
                  try {
                    console.log("Searching for intermediary with term:", searchTerm);
                    const result = searchRegisteredIntermediary(searchTerm);
                    console.log("Intermediary search result:", result);
                    setIntermediaryResult(result);
                    setIntermediarySearched(true);
                  } catch (error) {
                    console.error("Error searching intermediary:", error);
                    Alert.alert("Search Failed", "Could not search for intermediary. Please try again.");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={!searchTerm.trim() || isLoading}
                style={[
                  styles.verifyButton,
                  {backgroundColor: primaryColor},
                  !searchTerm.trim() || isLoading ? styles.buttonDisabled : {},
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="search" size={20} color="#ffffff" />
                    <ThemedText style={styles.verifyButtonText}>Search</ThemedText>
                  </>
                )}
              </TouchableOpacity>
            </ThemedView>
            
            {intermediarySearched && (
              <ThemedView style={styles.resultCard}>
                <ThemedText style={styles.resultHeader}>Search Results</ThemedText>
                {intermediaryResult ? (
                  <>
                    <ThemedView style={[
                      styles.statusBadge, 
                      {backgroundColor: intermediaryResult.status === 'Active' ? '#c8e6c9' : '#ffcdd2'}
                    ]}>
                      <ThemedText style={[
                        styles.statusText, 
                        {color: intermediaryResult.status === 'Active' ? '#2e7d32' : '#c62828'}
                      ]}>
                        {intermediaryResult.status.toUpperCase()}
                      </ThemedText>
                    </ThemedView>
                    <ThemedText style={styles.resultLabel}>Name:</ThemedText>
                    <ThemedText style={styles.resultValue}>{intermediaryResult.name}</ThemedText>
                    <ThemedText style={styles.resultLabel}>Registration Number:</ThemedText>
                    <ThemedText style={styles.resultValue}>{intermediaryResult.registration_number}</ThemedText>
                    <ThemedText style={styles.resultLabel}>Category:</ThemedText>
                    <ThemedText style={styles.resultValue}>{intermediaryResult.category}</ThemedText>
                    <ThemedText style={styles.resultLabel}>Valid Till:</ThemedText>
                    <ThemedText style={styles.resultValue}>{intermediaryResult.valid_till}</ThemedText>
                    <ThemedText style={styles.resultLabel}>Contact:</ThemedText>
                    <ThemedText style={styles.resultValue}>{intermediaryResult.contact}</ThemedText>
                    <ThemedText style={styles.resultLabel}>Address:</ThemedText>
                    <ThemedText style={styles.resultValue}>{intermediaryResult.address}</ThemedText>
                  </>
                ) : (
                  <ThemedView style={styles.emptyResultCard}>
                    <MaterialIcons name="search-off" size={40} color="#9e9e9e" />
                    <ThemedText style={styles.emptyResultText}>No intermediary found</ThemedText>
                    <ThemedText style={styles.emptyResultSubtext}>
                      Try searching with a different name or registration number
                    </ThemedText>
                  </ThemedView>
                )}
              </ThemedView>
            )}
          </ThemedView>
        )}

        {/* Debarred Entity Search Section */}
        {activeTab === 'debarred' && (
          <ThemedView style={styles.cardElevated}>
            <ThemedView style={styles.cardHeader}>
              <MaterialIcons name="person-off" size={22} color={primaryColor} />
              <ThemedText style={styles.cardTitle}>Search Debarred Entities</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.infoCard}>
              <MaterialIcons name="info-outline" size={18} color={primaryColor} />
              <ThemedText style={styles.infoText}>
                Search for individuals or entities that have been debarred by SEBI from accessing the securities market.
              </ThemedText>
            </ThemedView>
            
            <ThemedInput
              label="Search by name:"
              value={debarredSearchTerm}
              onChangeText={setDebarredSearchTerm}
              placeholder="Enter name of person or entity"
              leftIcon="search"
              showClearButton={true}
            />
            
            <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  setDebarredSearchTerm("");
                  setDebarredResult(null);
                  setDebarredSearched(false);
                }}
                disabled={!debarredSearchTerm.trim() || isLoading}
                style={[
                  styles.resetButton,
                  !debarredSearchTerm.trim() || isLoading ? styles.buttonDisabled : {},
                ]}
              >
                <MaterialIcons name="refresh" size={20} color={textColor} />
                <ThemedText style={styles.resetButtonText}>Reset</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleSearchDebarredEntity}
                disabled={!debarredSearchTerm.trim() || isLoading}
                style={[
                  styles.verifyButton,
                  {backgroundColor: primaryColor},
                  !debarredSearchTerm.trim() || isLoading ? styles.buttonDisabled : {},
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="search" size={20} color="#ffffff" />
                    <ThemedText style={styles.verifyButtonText}>Search</ThemedText>
                  </>
                )}
              </TouchableOpacity>
            </ThemedView>
            
            {debarredSearched && (
              <ThemedView style={styles.resultCard}>
                <ThemedText style={styles.resultHeader}>Search Results</ThemedText>
                {debarredResult ? (
                  <>
                    <ThemedView style={[styles.statusBadge, {backgroundColor: '#ffcdd2'}]}>
                      <ThemedText style={[styles.statusText, {color: '#c62828'}]}>DEBARRED</ThemedText>
                    </ThemedView>
                    <ThemedText style={styles.resultLabel}>Name:</ThemedText>
                    <ThemedText style={styles.resultValue}>{debarredResult.name}</ThemedText>
                    <ThemedText style={styles.resultLabel}>Entity Type:</ThemedText>
                    <ThemedText style={styles.resultValue}>{debarredResult.entity_type}</ThemedText>
                    <ThemedText style={styles.resultLabel}>Date of Debarment:</ThemedText>
                    <ThemedText style={styles.resultValue}>{debarredResult.date_of_debarment}</ThemedText>
                    <ThemedText style={styles.resultLabel}>Duration:</ThemedText>
                    <ThemedText style={styles.resultValue}>{debarredResult.duration}</ThemedText>
                    <ThemedText style={styles.resultLabel}>Status:</ThemedText>
                    <ThemedText style={styles.resultValue}>{debarredResult.status}</ThemedText>
                    <ThemedText style={styles.resultLabel}>Reason:</ThemedText>
                    <ThemedText style={styles.resultValue}>{debarredResult.reason}</ThemedText>
                  </>
                ) : (
                  <ThemedView style={[styles.statusBadge, {backgroundColor: '#c8e6c9'}]}>
                    <ThemedText style={[styles.statusText, {color: '#2e7d32'}]}>NOT FOUND</ThemedText>
                    <ThemedText style={styles.resultNote}>
                      No debarred entity found with the specified name.
                    </ThemedText>
                  </ThemedView>
                )}
              </ThemedView>
            )}
          </ThemedView>
        )}
        
        {/* SEBI Circular Section */}
        {activeTab === 'circular' && (
          <ThemedView style={styles.cardElevated}>
            <ThemedView style={styles.cardHeader}>
              <FontAwesome5 name="file-alt" size={20} color={primaryColor} />
              <ThemedText style={styles.cardTitle}>SEBI Circulars & Notifications</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.infoCard}>
              <MaterialIcons name="info-outline" size={18} color={primaryColor} />
              <ThemedText style={styles.infoText}>
                Search for the latest circulars, notifications and guidelines issued by SEBI.
              </ThemedText>
            </ThemedView>
            
            <ThemedInput
              label="Search by keyword:"
              value={circularSearchTerm}
              onChangeText={setCircularSearchTerm}
              placeholder="E.g., mutual funds, insider trading"
              leftIcon="search"
              showClearButton={true}
            />
            
            <ThemedView style={styles.filterSection}>
              <ThemedText style={styles.filterLabel}>Filter by category:</ThemedText>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryChips}
              >
                <TouchableOpacity
                  onPress={() => setSelectedCategory("")}
                  style={[
                    styles.categoryChip,
                    selectedCategory === "" && {backgroundColor: primaryColor}
                  ]}
                >
                  <ThemedText 
                    style={[
                      styles.categoryChipText, 
                      selectedCategory === "" && {color: "#fff"}
                    ]}
                  >
                    All
                  </ThemedText>
                </TouchableOpacity>
                
                {circularCategories.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedCategory(category)}
                    style={[
                      styles.categoryChip,
                      selectedCategory === category && {backgroundColor: primaryColor}
                    ]}
                  >
                    <ThemedText 
                      style={[
                        styles.categoryChipText, 
                        selectedCategory === category && {color: "#fff"}
                      ]}
                    >
                      {category}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <ThemedText style={styles.filterLabel}>Filter by year:</ThemedText>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.yearChips}
              >
                <TouchableOpacity
                  onPress={() => setSelectedYear(null)}
                  style={[
                    styles.yearChip,
                    selectedYear === null && {backgroundColor: primaryColor}
                  ]}
                >
                  <ThemedText 
                    style={[
                      styles.yearChipText, 
                      selectedYear === null && {color: "#fff"}
                    ]}
                  >
                    All
                  </ThemedText>
                </TouchableOpacity>
                
                {circularYears.map((year, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedYear(year)}
                    style={[
                      styles.yearChip,
                      selectedYear === year && {backgroundColor: primaryColor}
                    ]}
                  >
                    <ThemedText 
                      style={[
                        styles.yearChipText, 
                        selectedYear === year && {color: "#fff"}
                      ]}
                    >
                      {year}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ThemedView>
            
            <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  setCircularSearchTerm("");
                  setSelectedCategory("");
                  if (circularYears.length > 0) {
                    setSelectedYear(circularYears[0]);
                  } else {
                    setSelectedYear(null);
                  }
                  setCirculars([]);
                }}
                style={[
                  styles.resetButton,
                ]}
              >
                <MaterialIcons name="refresh" size={20} color={textColor} />
                <ThemedText style={styles.resetButtonText}>Reset</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleSearchCirculars}
                style={[
                  styles.verifyButton,
                  {backgroundColor: primaryColor},
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="search" size={20} color="#ffffff" />
                    <ThemedText style={styles.verifyButtonText}>Search Circulars</ThemedText>
                  </>
                )}
              </TouchableOpacity>
            </ThemedView>
            
            {circulars.length > 0 ? (
              <ThemedView style={styles.circularResultsContainer}>
                <ThemedText style={styles.resultHeader}>
                  Found {circulars.length} Circulars
                </ThemedText>
                
                {circulars.map((circular, index) => (
                  <ThemedView key={index} style={styles.circularCard}>
                    <ThemedText style={styles.circularTitle}>{circular.title}</ThemedText>
                    <ThemedView style={styles.circularMeta}>
                      <ThemedText style={styles.circularCategory}>{circular.category}</ThemedText>
                      <ThemedText style={styles.circularDate}>{circular.date}</ThemedText>
                    </ThemedView>
                    {circular.description && (
                      <ThemedText numberOfLines={2} style={styles.circularDescription}>
                        {circular.description}
                      </ThemedText>
                    )}
                    <TouchableOpacity style={styles.viewButton}>
                      <MaterialIcons name="open-in-new" size={16} color={primaryColor} />
                      <ThemedText style={styles.viewButtonText}>View Circular</ThemedText>
                    </TouchableOpacity>
                  </ThemedView>
                ))}
              </ThemedView>
            ) : circulars.length === 0 && (
              <ThemedView style={styles.emptyResultCard}>
                <FontAwesome5 name="file-alt" size={40} color="#9e9e9e" />
                <ThemedText style={styles.emptyResultText}>No circulars found</ThemedText>
                <ThemedText style={styles.emptyResultSubtext}>
                  Try adjusting your search criteria or filters
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        )}
        
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  wrapper: { padding: 16 },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 8,
    justifyContent: "space-between",
  },
  headerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
  },
  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginBottom: 8,
    borderRadius: 12,
    width: '48%',
    marginHorizontal: '1%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  activeTab: {
    backgroundColor: 'transparent', // Overridden with primaryColor
  },
  tabText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
  },
  // Cards
  cardElevated: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 14,
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  verifyButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  // Info card
  infoCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  // Result styles
  resultCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  resultHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    fontWeight: '700',
    fontSize: 12,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  resultValue: {
    fontSize: 14,
    marginTop: 2,
  },
  resultNote: {
    fontSize: 13,
    marginTop: 8,
  },
  // Filter section
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 4,
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  yearChips: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  yearChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  yearChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Circular results
  circularResultsContainer: {
    marginTop: 16,
  },
  circularCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  circularTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  circularMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  circularCategory: {
    fontSize: 12,
    opacity: 0.8,
  },
  circularDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  circularDescription: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 18,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  viewButtonText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  // Empty result
  emptyResultCard: {
    alignItems: 'center',
    padding: 24,
    marginTop: 16,
  },
  emptyResultText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyResultSubtext: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
    textAlign: 'center',
  },
  // Reset button
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    flex: 1,
  },
  resetButtonText: {
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
});
