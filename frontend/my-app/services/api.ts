// services/api.ts
import Constants from "expo-constants";
import { Platform } from "react-native";

const getApiBaseUrl = () => {
  // For Android Emulator, use 10.0.2.2 (special Android DNS)
  if (Platform.OS === "android" && __DEV__) {
    return "http://10.0.2.2:3002";
  }
  
  // For physical devices, try multiple possible IP ranges
  if (Platform.OS === "android" || Platform.OS === "ios") {
    // Use 10.0.2.2 for Android emulator or localhost for iOS simulator
    if (__DEV__) {
      // For emulator/simulator development
      if (Platform.OS === "android") {
        return "http://10.0.2.2:3002"; // Special Android DNS for host loopback
      } else {
        return "http://localhost:3002"; // iOS simulator can access localhost
      }
    } else {
      // For physical devices, return your actual server address
      return "http://192.168.1.5:3002"; // Replace with your network IP
    }
  }

  // For web or development
  return "http://localhost:3002";
};

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? getApiBaseUrl();

export interface FraudCheckResponse {
  safe: boolean;
  reason: string;
  confidence?: number;
  method?: string;
  safetyScore?: number;
  analysis?: string;
  phoneNumber?: string;
}

export async function checkMessageSafety(
  message: string,
): Promise<FraudCheckResponse> {
  try {
    console.log(`Making API request to: ${API_URL}/detect`);
    console.log(`Message: ${message}`);

    // Add timeout to fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_URL}/detect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`API request failed with status ${response.status}`);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    console.log("API Response:", data);

    // Handle the structure from our backend API
    const confidence = (data.confidence_score && typeof data.confidence_score === 'number') 
        ? (data.confidence_score > 1 ? data.confidence_score / 100 : data.confidence_score) 
        : 0.5;
    
    const result = {
      safe: data.classification !== "FRAUD",
      reason: data.reason || "No reason provided",
      confidence: confidence,
      method: data.note || "API Detection",
      safetyScore: data.classification !== "FRAUD" ? confidence * 100 : (1 - confidence) * 100,
      analysis: data.reason || "Message analyzed using AI-powered fraud detection.",
      phoneNumber: (data.phone_number || data.sender || "").toString()
    };

    console.log("Transformed result:", result);

    return result;
  } catch (error) {
    console.error("API error:", error);
    
    // Check for specific error types for better debugging
    let errorMessage = "Failed to connect to fraud detection service. Please try again.";
    
    // Type-safe error handling
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = "Connection timed out. Server may be down or unreachable.";
      } else if (error.message.includes('Network request failed')) {
        errorMessage = "Network error: Check your network connection and server status.";
      }
    }
    
    // For development: show the API URL that failed in the console
    console.log(`Failed API URL: ${API_URL}/detect`);
    
    return {
      safe: false,
      reason: errorMessage,
      method: "Error Handler"
    };
  }
}

export interface VerifyNumberResponse {
  phoneNumber: string;
  normalized: string;
  isVerified: boolean;
  riskLevel: string; // "low" | "medium" | "high"
  status: string;
  reportCount?: number;
  matches?: Array<{
    id: string;
    type: string;
    reason?: string;
    reportCount?: number;
  }>;
}

export async function verifyPhoneNumber(
  phoneNumber: string,
): Promise<VerifyNumberResponse> {
  const response = await fetch(`${API_URL}/verify-number`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber }),
  });
  if (!response.ok) {
    throw new Error(`Verification failed with status ${response.status}`);
  }
  return response.json();
}
