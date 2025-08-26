/**
 * Utility functions for formatting values consistently across the app
 */

/**
 * Formats a confidence score to display as a percentage
 * Ensures the input is in 0-1 range before conversion
 * 
 * @param {number} confidenceScore - The confidence score (0-1 or 0-100)
 * @returns {string} The formatted percentage with 1 decimal place
 */
export function formatConfidencePercentage(confidenceScore: number | undefined): string {
  if (confidenceScore === undefined || confidenceScore === null) {
    return "0.0%";
  }
  
  // Normalize to 0-1 range if needed
  const normalizedScore = confidenceScore > 1 ? confidenceScore / 100 : confidenceScore;
  
  // Convert to percentage and format with 1 decimal place
  return (normalizedScore * 100).toFixed(1) + '%';
}

/**
 * Gets text color based on confidence level
 * 
 * @param {number} confidenceScore - The confidence score (0-1)
 * @param {boolean} isFraud - Whether the message is fraudulent
 * @returns {string} The hex color code
 */
export function getConfidenceColor(confidenceScore: number, isFraud: boolean): string {
  // Normalize score if needed
  const normalizedScore = confidenceScore > 1 ? confidenceScore / 100 : confidenceScore;
  
  if (isFraud) {
    // Red colors for fraud with varying intensity based on confidence
    if (normalizedScore >= 0.9) return '#b91c1c'; // Darker red for high confidence
    if (normalizedScore >= 0.7) return '#dc2626'; // Medium red
    return '#ef4444'; // Light red for lower confidence
  } else {
    // Green colors for safe messages with varying intensity based on confidence
    if (normalizedScore >= 0.9) return '#15803d'; // Darker green for high confidence
    if (normalizedScore >= 0.7) return '#16a34a'; // Medium green
    return '#22c55e'; // Light green for lower confidence
  }
}
