/**
 * Fallback fraud detection that works without API access
 * Only use this when the OpenAI API cannot be accessed
 */

/**
 * Simple result interface for the fallback method
 */
export interface LocalFraudResult {
  classification: string;
  confidence_score: number;
  reason: string;
}

/**
 * Analyzes a message for fraud indicators without using external APIs
 * @param message - The message to analyze
 * @returns A simple classification result
 */
export function localFraudDetection(message: string): LocalFraudResult {
  // Normalize the message for analysis
  const normalizedMsg = message.toLowerCase();
  let score = 0;
  const matches: string[] = [];

  // High-risk patterns (strong fraud indicators)
  const highRiskPatterns = [
    { pattern: /invest.*(\d+%|double|triple|x\d+)/, name: "Investment return claims" },
    { pattern: /urgent|hurry|act now|limited time|expires/, name: "Urgency tactics" },
    { pattern: /fee|payment|deposit|money|cost|send|pay|\$|₹|€|£/, name: "Payment requests" },
    { pattern: /prize|won|winner|lottery|claim|reward|cash/, name: "Prize scams" },
    { pattern: /(verify|update|confirm).*(account|details|information|password)/, name: "Verification scams" },
    { pattern: /bitcoin|crypto|wallet|investment|stocks|forex|trading/, name: "Investment scams" }
  ];

  // Medium-risk patterns (might be fraud)
  const mediumRiskPatterns = [
    { pattern: /job|income|earn|salary|work from home|wfh/, name: "Job offers" },
    { pattern: /loan|credit|debt|approved|interest/, name: "Loan offers" },
    { pattern: /click|link|https?:\/\/|www\./, name: "Links" },
    { pattern: /free|discount|offer|deal|sale/, name: "Promotions" },
    { pattern: /group|community|join|telegram|whatsapp|channel/, name: "Group invitations" }
  ];

  // Check high-risk patterns
  for (const { pattern, name } of highRiskPatterns) {
    if (pattern.test(normalizedMsg)) {
      score += 25;
      matches.push(name);
    }
  }

  // Check medium-risk patterns
  for (const { pattern, name } of mediumRiskPatterns) {
    if (pattern.test(normalizedMsg)) {
      score += 15;
      matches.push(name);
    }
  }

  // Combination bonuses - multiple matches are stronger indicators
  if (matches.length > 1) {
    score += (matches.length - 1) * 10; // +10 for each additional match
  }
  
  // Apply a cautious bias when using local detection
  // We want to be more conservative with our confidence since this is a fallback
  const cautionFactor = 0.85; // Reduce confidence slightly as we're not using AI
  
  // Normalize score to 0-1 range
  const normalizedScore = Math.min(100, score) / 100 * cautionFactor;

  // Determine classification
  let classification, reason;
  if (normalizedScore >= 0.6) {
    classification = "FRAUD";
    reason = `Message contains multiple fraud indicators: ${matches.join(", ")}`;
  } else if (normalizedScore >= 0.3) {
    classification = "LEGITIMATE";
    reason = "Message contains some suspicious elements but may be legitimate";
  } else {
    classification = "NORMAL_SMS";
    reason = "Message appears to be normal communication";
  }

  return {
    classification,
    confidence_score: normalizedScore,
    reason
  };
}
