import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { analyzeMessageEnhanced, quickDemo } from "../utils/enhancedAnalyzer";
import { DEMO_SCENARIOS } from "../utils/comprehensiveDemo";

const { width } = Dimensions.get('window');

interface TestResult {
  message: string;
  threatLevel: string;
  riskScore: number;
  recommendation: string;
  detectedTactics: string[];
  urlThreats: any;
  languageDetected: string;
  personalizedAlert: any;
  processingTime: number;
}

export default function EnhancedTestScreen() {
  const [inputMessage, setInputMessage] = useState("");
  const [sender, setSender] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const demoMessages = [
    {
      key: 'advanced_phishing',
      title: '🎯 Advanced Phishing',
      description: 'Authority + Urgency + Malicious URL',
      message: DEMO_SCENARIOS.advanced_phishing.message,
      sender: DEMO_SCENARIOS.advanced_phishing.sender
    },
    {
      key: 'multilingual_scam',
      title: '🌍 Multilingual Scam',
      description: 'Hinglish lottery with info harvesting',
      message: DEMO_SCENARIOS.multilingual_scam.message,
      sender: DEMO_SCENARIOS.multilingual_scam.sender
    },
    {
      key: 'investment_scam',
      title: '💰 Investment Fraud',
      description: 'Trust building + Authority impersonation',
      message: DEMO_SCENARIOS.investment_scam.message,
      sender: DEMO_SCENARIOS.investment_scam.sender
    },
    {
      key: 'government_scam',
      title: '🏛️ Government Impersonation',
      description: 'Fear tactics + Payment demands',
      message: DEMO_SCENARIOS.government_scam.message,
      sender: DEMO_SCENARIOS.government_scam.sender
    },
    {
      key: 'legitimate_message',
      title: '✅ Legitimate Message',
      description: 'Control scenario for comparison',
      message: DEMO_SCENARIOS.legitimate_message.message,
      sender: DEMO_SCENARIOS.legitimate_message.sender
    }
  ];

  const handleAnalyze = async () => {
    if (!inputMessage.trim()) {
      Alert.alert("Error", "Please enter a message to analyze");
      return;
    }

    setIsAnalyzing(true);
    const startTime = Date.now();

    try {
      console.log('🔍 Starting enhanced analysis...');
      const analysis = await analyzeMessageEnhanced(inputMessage, sender, true);
      const processingTime = Date.now() - startTime;

      const testResult: TestResult = {
        message: inputMessage,
        threatLevel: analysis.threatLevel,
        riskScore: analysis.enhancedRiskScore,
        recommendation: analysis.recommendation,
        detectedTactics: analysis.socialEngineeringRisks?.detectedTactics?.map((t: any) => t.name) || [],
        urlThreats: analysis.urlThreats,
        languageDetected: analysis.languageAnalysis?.language_detected || 'en',
        personalizedAlert: analysis.personalizedAlert,
        processingTime
      };

      setResult(testResult);
      
      console.log('✅ Analysis complete:', testResult);
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      Alert.alert("Error", "Failed to analyze message. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadDemoMessage = (demo: any) => {
    setInputMessage(demo.message);
    setSender(demo.sender);
    setShowDemoModal(false);
    setResult(null);
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'SAFE': return '#4CAF50';
      case 'LOW': return '#8BC34A';
      case 'MEDIUM': return '#FF9800';
      case 'HIGH': return '#FF5722';
      case 'CRITICAL': return '#D32F2F';
      default: return '#9E9E9E';
    }
  };

  const getThreatIcon = (level: string) => {
    switch (level) {
      case 'SAFE': return 'shield-checkmark';
      case 'LOW': return 'information-circle';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'alert';
      case 'CRITICAL': return 'skull';
      default: return 'help';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛡️ Enhanced Security Test</Text>
        <TouchableOpacity 
          style={styles.demoButton}
          onPress={() => setShowDemoModal(true)}
        >
          <Ionicons name="play-circle" size={24} color="#2196F3" />
          <Text style={styles.demoButtonText}>Demo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>📱 Message to Analyze</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Sender (optional)</Text>
            <TextInput
              style={styles.senderInput}
              value={sender}
              onChangeText={setSender}
              placeholder="e.g., HDFC-BANK, +91-9876543210"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Message Content</Text>
            <TextInput
              style={styles.messageInput}
              value={inputMessage}
              onChangeText={setInputMessage}
              placeholder="Paste the suspicious message here..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
            onPress={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <ActivityIndicator color="white" size="small" />
                <Text style={styles.analyzeButtonText}>Analyzing...</Text>
              </>
            ) : (
              <>
                <Ionicons name="search" size={20} color="white" />
                <Text style={styles.analyzeButtonText}>Analyze Message</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        {result && (
          <View style={styles.resultsSection}>
            {/* Threat Level Card */}
            <View style={[styles.threatCard, { borderLeftColor: getThreatColor(result.threatLevel) }]}>
              <View style={styles.threatHeader}>
                <Ionicons 
                  name={getThreatIcon(result.threatLevel) as any} 
                  size={32} 
                  color={getThreatColor(result.threatLevel)} 
                />
                <View style={styles.threatInfo}>
                  <Text style={styles.threatLevel}>
                    {result.threatLevel} THREAT
                  </Text>
                  <Text style={styles.riskScore}>
                    Risk Score: {result.riskScore}/100
                  </Text>
                </View>
                <Text style={styles.processingTime}>
                  {result.processingTime}ms
                </Text>
              </View>
              
              <Text style={styles.recommendation}>
                {result.recommendation}
              </Text>
            </View>

            {/* Social Engineering Tactics */}
            {result.detectedTactics.length > 0 && (
              <View style={styles.tacticsCard}>
                <Text style={styles.cardTitle}>🎭 Social Engineering Tactics</Text>
                {result.detectedTactics.map((tactic, index) => (
                  <View key={index} style={styles.tacticItem}>
                    <Ionicons name="warning" size={16} color="#FF5722" />
                    <Text style={styles.tacticText}>{tactic}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* URL Threats */}
            {result.urlThreats?.detectedUrls?.length > 0 && (
              <View style={styles.urlCard}>
                <Text style={styles.cardTitle}>🔗 URL Analysis</Text>
                <View style={styles.urlInfo}>
                  <Text style={styles.urlCount}>
                    {result.urlThreats.detectedUrls.length} URL(s) detected
                  </Text>
                  <Text style={[styles.urlRisk, { 
                    color: result.urlThreats.isPhishing ? '#FF5722' : '#4CAF50' 
                  }]}>
                    {result.urlThreats.isPhishing ? '🚨 PHISHING RISK' : '✅ SAFE'}
                  </Text>
                </View>
                {result.urlThreats.detectedUrls.map((url: string, index: number) => (
                  <Text key={index} style={styles.urlText}>
                    • {url.length > 50 ? url.substring(0, 50) + '...' : url}
                  </Text>
                ))}
              </View>
            )}

            {/* Language Detection */}
            {result.languageDetected !== 'en' && (
              <View style={styles.languageCard}>
                <Text style={styles.cardTitle}>🌍 Language Analysis</Text>
                <Text style={styles.languageText}>
                  Detected: {result.languageDetected}
                </Text>
                <Text style={styles.languageNote}>
                  ✅ Multilingual fraud patterns analyzed
                </Text>
              </View>
            )}

            {/* Personalized Alert Info */}
            {result.personalizedAlert && (
              <View style={styles.personalizedCard}>
                <Text style={styles.cardTitle}>⚡ Personalized Alert</Text>
                <Text style={styles.alertSeverity}>
                  Severity: {result.personalizedAlert.severity}
                </Text>
                <Text style={styles.alertType}>
                  Type: {result.personalizedAlert.type}
                </Text>
                {result.personalizedAlert.actionItems && (
                  <View style={styles.actionItems}>
                    <Text style={styles.actionTitle}>Recommended Actions:</Text>
                    {result.personalizedAlert.actionItems.slice(0, 3).map((action: string, index: number) => (
                      <Text key={index} style={styles.actionItem}>
                        • {action}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Message Preview */}
            <View style={styles.messagePreview}>
              <Text style={styles.cardTitle}>📝 Analyzed Message</Text>
              <Text style={styles.messageText}>
                {result.message.length > 200 ? 
                  result.message.substring(0, 200) + '...' : 
                  result.message
                }
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Demo Modal */}
      <Modal
        visible={showDemoModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🎯 Demo Scenarios</Text>
            <TouchableOpacity onPress={() => setShowDemoModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Try these pre-built scenarios to see different threat detection capabilities:
            </Text>

            {demoMessages.map((demo, index) => (
              <TouchableOpacity
                key={index}
                style={styles.demoCard}
                onPress={() => loadDemoMessage(demo)}
              >
                <Text style={styles.demoTitle}>{demo.title}</Text>
                <Text style={styles.demoDescription}>{demo.description}</Text>
                <Text style={styles.demoPreview} numberOfLines={2}>
                  {demo.message}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  demoButtonText: {
    color: '#2196F3',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
  },
  inputSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  senderInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    minHeight: 120,
  },
  analyzeButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  analyzeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  resultsSection: {
    margin: 16,
  },
  threatCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  threatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  threatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  threatLevel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  riskScore: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  processingTime: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  recommendation: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  tacticsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  tacticItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tacticText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  urlCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  urlInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  urlCount: {
    fontSize: 14,
    color: '#666',
  },
  urlRisk: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  urlText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  languageCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  languageText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  languageNote: {
    fontSize: 12,
    color: '#4CAF50',
  },
  personalizedCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  alertSeverity: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  alertType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  actionItems: {
    marginTop: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  actionItem: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
  },
  messagePreview: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  demoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  demoDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  demoPreview: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});