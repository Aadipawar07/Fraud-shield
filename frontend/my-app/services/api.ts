// services/api.ts
import Constants from "expo-constants";
import { Platform } from "react-native";

const getApiBaseUrl = () => {
  const hostUri = (Constants.expoConfig?.hostUri ?? "").toString();
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:5000`;
  }
  if (typeof window !== "undefined" && (window as any)?.location?.hostname) {
    return `http://${(window as any).location.hostname}:5000`;
  }
  if (Platform.OS === "android") return "http://10.0.2.2:5000";
  return "http://localhost:5000";
};

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? getApiBaseUrl();

export interface FraudCheckResponse {
  safe: boolean;
  reason: string;
  confidence?: number;
  method?: string;
}

export async function checkMessageSafety(message: string): Promise<FraudCheckResponse> {
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
    
    console.log('API Response:', data);

    const result = {
      safe: !data.fraud,
      reason: data.reason || "No reason provided",
      confidence: data.confidence,
      method: data.method,
    };
    
    console.log('Transformed result:', result);
    
    return result;
  } catch (error) {
    console.error("API error:", error);
    return { 
      safe: false, 
      reason: "Failed to connect to fraud detection service. Please try again."
    };
  }
}
