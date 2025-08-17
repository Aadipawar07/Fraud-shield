// services/api.ts
const API_URL = "http://192.168.1.5:5000"; // sirf base URL rakho

export interface FraudCheckResponse {
  safe: boolean;
  reason: string;
}

export async function checkMessageSafety(message: string): Promise<FraudCheckResponse> {
  try {
    const response = await fetch(`${API_URL}/fraud-check`, {   // ab sahi h
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
