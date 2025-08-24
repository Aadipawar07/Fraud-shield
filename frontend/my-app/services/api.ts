// services/api.ts
import Constants from "expo-constants";
import { Platform } from "react-native";

const getApiBaseUrl = () => {
  // For Android Emulator, use 10.0.2.2 (special Android DNS)
  if (Platform.OS === "android" && !__DEV__) {
    return "http://10.0.2.2:5000";
  }
  
  // For physical devices, use your computer's IP address
  if (Platform.OS === "android" || Platform.OS === "ios") {
    return "http://192.168.1.5:5000";  // Replace with your computer's IP
  }

  // For web or development
  return "http://localhost:5000";
};

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? getApiBaseUrl();

export interface FraudCheckResponse {
  safe: boolean;
  reason: string;
  confidence?: number;
  method?: string;
}

export async function checkMessageSafety(
  message: string,
): Promise<FraudCheckResponse> {
  try {
    console.log(`Making API request to: ${API_URL}/fraud-check`);
    console.log(`Message: ${message}`);

    const response = await fetch(`${API_URL}/fraud-check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: {
      fraud: boolean;
      reason?: string;
      confidence?: number;
      method?: string;
      timestamp?: string;
    } = await response.json();

    console.log("API Response:", data);

    const result = {
      safe: !data.fraud,
      reason: data.reason || "No reason provided",
      confidence: data.confidence,
      method: data.method,
    };

    console.log("Transformed result:", result);

    return result;
  } catch (error) {
    console.error("API error:", error);
    return {
      safe: false,
      reason: "Failed to connect to fraud detection service. Please try again.",
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
