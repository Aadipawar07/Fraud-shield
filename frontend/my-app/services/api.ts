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
}

export async function checkMessageSafety(message: string): Promise<FraudCheckResponse> {
  try {
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

    const data: { fraud: boolean; reason?: string } = await response.json();

    return {
      safe: !data.fraud,
      reason: data.reason || "No reason provided",
    };
  } catch (error) {
    console.error("API error:", error);
    return { safe: false, reason: "API error" };
  }
}