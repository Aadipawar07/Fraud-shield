import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { checkMessageSafety, FraudCheckResponse, analyzeImageWithChatGPT } from "../services/api";
import { formatConfidencePercentage } from "../utils/formatters";
import { router } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';

export default function ScanScreen() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FraudCheckResponse | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<'text' | 'image'>('text');
  const insets = useSafeAreaInsets();

  const handleScan = async () => {
    if (!message.trim()) {
      Alert.alert("Error", "Please enter a message to scan");
      return;
    }

    setIsLoading(true);
    try {
      const scanResult = await checkMessageSafety(message);
      setResult(scanResult);
    } catch (error) {
      Alert.alert("Error", "Failed to scan message. Please try again.");
      console.error("Scan error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setScanMode('image');
    }
  };

  const takePhoto = async () => {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need camera permissions to make this work!');
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setScanMode('image');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      "Select Image",
      "Choose how you want to add a screenshot",
      [
        {
          text: "Camera",
          onPress: takePhoto,
        },
        {
          text: "Gallery",
          onPress: pickImage,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const handleImageScan = async () => {
    if (!selectedImage) {
      Alert.alert("Error", "Please select an image to analyze");
      return;
    }

    setIsLoading(true);
    try {
      // Here we'll call a new API endpoint for image analysis
      const scanResult = await analyzeImageWithChatGPT(selectedImage);
      setResult(scanResult);
    } catch (error) {
      Alert.alert("Error", "Failed to analyze image. Please try again.");
      console.error("Image scan error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResult = () => {
    setResult(null);
    setMessage("");
    setSelectedImage(null);
    setScanMode('text');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: Math.max(24, insets.bottom) }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.navigate("/(tabs)")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {scanMode === 'image' ? '🔍 AI Chat Scanner' : '🔍 SMS Fraud Scanner'}
        </Text>
        <View style={styles.placeholder}></View>
      </View>
      
      <View style={styles.content}>
        {/* Mode Toggle */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Choose Scan Mode:</Text>
          <View style={styles.modeToggle}>
            <TouchableOpacity
              onPress={() => setScanMode('text')}
              style={[
                styles.modeButton,
                scanMode === 'text' && styles.modeButtonActive,
              ]}
            >
              <MaterialIcons 
                name="message" 
                size={20} 
                color={scanMode === 'text' ? '#fff' : '#4f46e5'} 
              />
              <Text style={[
                styles.modeButtonText,
                scanMode === 'text' && styles.modeButtonTextActive,
              ]}>
                Text Message
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setScanMode('image')}
              style={[
                styles.modeButton,
                scanMode === 'image' && styles.modeButtonActive,
              ]}
            >
              <MaterialIcons 
                name="image" 
                size={20} 
                color={scanMode === 'image' ? '#fff' : '#4f46e5'} 
              />
              <Text style={[
                styles.modeButtonText,
                scanMode === 'image' && styles.modeButtonTextActive,
              ]}>
                Chat Screenshot
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Input Section */}
        {scanMode === 'text' ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Enter SMS Message:</Text>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Paste or type the SMS message you want to check for fraud..."
              value={message}
              onChangeText={setMessage}
              textAlignVertical="top"
            />

            <TouchableOpacity
              onPress={handleScan}
              disabled={isLoading || !message.trim()}
              style={[
                styles.scanButton,
                (isLoading || !message.trim()) && styles.scanButtonDisabled,
              ]}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={styles.loadingText}>Scanning...</Text>
                </View>
              ) : (
                <Text style={styles.scanButtonText}>🔍 Scan for Fraud</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Upload Chat Screenshot:</Text>
            <Text style={styles.cardSubtitle}>
              Upload a screenshot of a suspicious chat conversation for AI analysis
            </Text>
            
            {selectedImage ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                <View style={styles.imageActions}>
                  <TouchableOpacity
                    onPress={showImageOptions}
                    style={styles.changeImageButton}
                  >
                    <MaterialIcons name="edit" size={16} color="#4f46e5" />
                    <Text style={styles.changeImageText}>Change Image</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedImage(null);
                      setResult(null);
                    }}
                    style={styles.removeImageButton}
                  >
                    <MaterialIcons name="delete" size={16} color="#dc2626" />
                    <Text style={styles.removeImageText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={showImageOptions}
                style={styles.imageUploadArea}
              >
                <MaterialIcons name="cloud-upload" size={40} color="#9ca3af" />
                <Text style={styles.uploadText}>Tap to upload screenshot</Text>
                <Text style={styles.uploadSubtext}>Camera or Gallery</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleImageScan}
              disabled={isLoading || !selectedImage}
              style={[
                styles.scanButton,
                (isLoading || !selectedImage) && styles.scanButtonDisabled,
              ]}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={styles.loadingText}>Analyzing...</Text>
                </View>
              ) : (
                <Text style={styles.scanButtonText}>🤖 Analyze with AI</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Results Section */}
        {result && (
          <View
            style={[
              styles.resultCard,
              result.safe ? styles.resultCardSafe : styles.resultCardDanger,
            ]}
          >
            <Text
              style={[
                styles.resultTitle,
                result.safe ? styles.resultTitleSafe : styles.resultTitleDanger,
              ]}
            >
              {scanMode === 'image' ? 
                (result.safe ? "✅ Chat Screenshot Appears Safe" : "⚠️ Potential Fraud Detected in Chat") :
                (result.safe ? "✅ Message is Safe" : "⚠️ Fraud Detected")
              }
            </Text>

            {/* Safety Score */}
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Safety Score:</Text>
              <View style={styles.scoreRow}>
                <View
                  style={[
                    styles.scoreBar,
                    {
                      backgroundColor: result.safe ? "#dcfce7" : "#fee2e2",
                      borderColor: result.safe ? "#15803d" : "#b91c1c",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.scoreValue,
                      result.safetyScore !== undefined
                        ? {
                            width: `${result.safe
                              ? result.safetyScore
                              : 100 - result.safetyScore}%`,
                            backgroundColor: result.safe ? "#15803d" : "#b91c1c",
                          }
                        : { width: "0%", backgroundColor: result.safe ? "#15803d" : "#b91c1c" },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.scorePercentage,
                    {
                      color: result.safe ? "#15803d" : "#b91c1c",
                    },
                  ]}
                >
                  {formatConfidencePercentage(
                    result.safe
                      ? (result.safetyScore ?? 0)
                      : (100 - (result.safetyScore ?? 0))
                  )}
                </Text>
              </View>
            </View>

            {/* Analysis Results */}
            <View style={styles.analysisContainer}>
              <Text style={styles.analysisTitle}>Analysis:</Text>
              <Text style={styles.analysisText}>{result.analysis}</Text>
            </View>

            {/* Enhanced Analysis for Image Mode */}
            {scanMode === 'image' && result.method === 'AI Image Analysis' && (
              <>
                {/* Fraud Indicators */}
                {(result as any).fraud_indicators && (result as any).fraud_indicators.length > 0 && (
                  <View style={styles.fraudIndicatorsContainer}>
                    <Text style={styles.fraudIndicatorsTitle}>🚨 Fraud Indicators Found:</Text>
                    {(result as any).fraud_indicators.map((indicator: string, index: number) => (
                      <View key={index} style={styles.fraudIndicatorItem}>
                        <MaterialIcons name="warning" size={16} color="#dc2626" />
                        <Text style={styles.fraudIndicatorText}>{indicator}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* AI Recommendations */}
                {(result as any).recommendations && (result as any).recommendations.length > 0 && (
                  <View style={styles.aiRecommendationsContainer}>
                    <Text style={styles.aiRecommendationsTitle}>💡 AI Recommendations:</Text>
                    {(result as any).recommendations.map((recommendation: string, index: number) => (
                      <View key={index} style={styles.aiRecommendationItem}>
                        <MaterialIcons name="lightbulb" size={16} color="#4f46e5" />
                        <Text style={styles.aiRecommendationText}>{recommendation}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}

            {/* Standard Recommendations */}
            <View style={styles.recommendationsContainer}>
              <Text style={styles.recommendationsTitle}>Recommendations:</Text>
              {result.safe ? (
                <Text style={styles.recommendationText}>
                  This message appears to be safe. However, always remain
                  vigilant against fraud attempts.
                </Text>
              ) : (
                <View style={styles.recommendationsList}>
                  <View style={styles.recommendationItem}>
                    <Ionicons
                      name="close-circle-outline"
                      size={20}
                      color="#b91c1c"
                    />
                    <Text style={styles.recommendationText}>
                      Do not respond to this message
                    </Text>
                  </View>
                  <View style={styles.recommendationItem}>
                    <Ionicons
                      name="close-circle-outline"
                      size={20}
                      color="#b91c1c"
                    />
                    <Text style={styles.recommendationText}>
                      Do not click on any links in the message
                    </Text>
                  </View>
                  <View style={styles.recommendationItem}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={20}
                      color="#b91c1c"
                    />
                    <Text style={styles.recommendationText}>
                      Report this message through the Report tab
                    </Text>
                  </View>
                  <View style={styles.recommendationItem}>
                    <Ionicons name="shield-outline" size={20} color="#b91c1c" />
                    <Text style={styles.recommendationText}>
                      Block this number on your phone
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.reportButton}
                onPress={() => {
                  if (result.phoneNumber) {
                    router.navigate(
                      `/(tabs)/report?phoneNumber=${encodeURIComponent(result.phoneNumber)}&message=${encodeURIComponent(message)}`
                    );
                  } else {
                    router.navigate("/(tabs)/report");
                  }
                }}
              >
                <Text style={styles.reportButtonText}>Report This Message</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearResult}
              >
                <Text style={styles.clearButtonText}>Clear Results</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 16,
    height: 120,
    fontSize: 16,
    backgroundColor: "#f8fafc",
    color: "#334155",
    marginBottom: 16,
  },
  scanButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  scanButtonDisabled: {
    backgroundColor: "#a5b4fc",
  },
  scanButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  resultCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resultCardSafe: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  resultCardDanger: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  resultTitleSafe: {
    color: "#15803d",
  },
  resultTitleDanger: {
    color: "#b91c1c",
  },
  scoreContainer: {
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreBar: {
    flex: 1,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    overflow: "hidden",
  },
  scoreValue: {
    height: "100%",
  },
  scorePercentage: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "700",
  },
  analysisContainer: {
    marginBottom: 20,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 15,
    color: "#334155",
    lineHeight: 22,
  },
  recommendationsContainer: {
    marginBottom: 20,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  recommendationsList: {
    marginTop: 8,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 15,
    color: "#334155",
    marginLeft: 8,
    flex: 1,
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: "column",
    gap: 12,
  },
  reportButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  reportButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  clearButton: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    backgroundColor: "white",
  },
  clearButtonText: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "600",
  },
  // New styles for image functionality
  modeToggle: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "transparent",
    gap: 8,
  },
  modeButtonActive: {
    backgroundColor: "#4f46e5",
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4f46e5",
  },
  modeButtonTextActive: {
    color: "#fff",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
    lineHeight: 20,
  },
  imageUploadArea: {
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
  },
  imageContainer: {
    marginBottom: 16,
  },
  selectedImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  imageActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  changeImageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#eff6ff",
    gap: 4,
  },
  changeImageText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4f46e5",
  },
  removeImageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
    gap: 4,
  },
  removeImageText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#dc2626",
  },
  // Enhanced Analysis Styles
  fraudIndicatorsContainer: {
    marginBottom: 20,
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  fraudIndicatorsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dc2626",
    marginBottom: 12,
  },
  fraudIndicatorItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  fraudIndicatorText: {
    fontSize: 14,
    color: "#7f1d1d",
    flex: 1,
    lineHeight: 20,
  },
  aiRecommendationsContainer: {
    marginBottom: 20,
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  aiRecommendationsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1d4ed8",
    marginBottom: 12,
  },
  aiRecommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  aiRecommendationText: {
    fontSize: 14,
    color: "#1e40af",
    flex: 1,
    lineHeight: 20,
  },
});
