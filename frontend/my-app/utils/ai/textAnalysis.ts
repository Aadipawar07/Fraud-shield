/**
 * Advanced text analysis utilities for fraud detection
 * Implements ML-inspired techniques for better pattern detection
 */

/**
 * Calculates Shannon entropy for a text string
 * Higher entropy may indicate randomly generated text or obfuscation techniques
 * @param text - The text to analyze
 * @returns entropy score (0-1 scale)
 */
export function calculateEntropy(text: string): number {
  // Get frequency of each character
  const len = text.length;
  const freqs: Record<string, number> = {};
  
  for (let i = 0; i < len; i++) {
    const char = text[i];
    freqs[char] = (freqs[char] || 0) + 1;
  }
  
  // Calculate entropy using Shannon entropy formula
  return Object.values(freqs).reduce((entropy, freq) => {
    const p = freq / len;
    return entropy - p * Math.log2(p);
  }, 0) / Math.log2(Object.keys(freqs).length || 1); // Normalize to 0-1
}

/**
 * Analyzes message for unusual character distributions
 * Identifies messages with abnormal character patterns
 * @param text - The text to analyze
 * @returns A score representing the abnormality (higher = more suspicious)
 */
export function analyzeCharacterDistribution(text: string): number {
  // Calculate letter frequencies
  const letterFreq: Record<string, number> = {};
  const cleanText = text.toLowerCase().replace(/[^a-z]/g, '');
  
  if (cleanText.length === 0) return 0;
  
  // Expected frequencies in natural English
  const expectedFreq: Record<string, number> = {
    'a': 0.082, 'b': 0.015, 'c': 0.028, 'd': 0.043, 'e': 0.127, 
    'f': 0.022, 'g': 0.020, 'h': 0.061, 'i': 0.070, 'j': 0.002, 
    'k': 0.008, 'l': 0.040, 'm': 0.024, 'n': 0.067, 'o': 0.075, 
    'p': 0.019, 'q': 0.001, 'r': 0.060, 's': 0.063, 't': 0.091, 
    'u': 0.028, 'v': 0.010, 'w': 0.023, 'x': 0.001, 'y': 0.020, 'z': 0.001
  };
  
  // Calculate actual frequencies
  for (const char of cleanText) {
    letterFreq[char] = (letterFreq[char] || 0) + 1;
  }
  
  // Calculate chi-square distance from expected distribution
  let chiSquare = 0;
  for (const char of Object.keys(expectedFreq)) {
    const expected = expectedFreq[char] * cleanText.length;
    const observed = letterFreq[char] || 0;
    chiSquare += Math.pow(observed - expected, 2) / expected;
  }
  
  // Normalize to a 0-1 scale for anomaly score
  return Math.min(1, chiSquare / 500);
}

/**
 * Creates a vector representation of the message based on important features
 * @param message - The message to analyze
 * @returns Feature vector
 */
export function computeMessageVector(message: string): number[] {
  const vector = [];
  
  // Feature 1: Message length
  vector.push(Math.min(1, message.length / 500));
  
  // Feature 2: Ratio of uppercase letters
  const uppercaseRatio = message.replace(/[^A-Z]/g, '').length / 
                         Math.max(1, message.replace(/[^A-Za-z]/g, '').length);
  vector.push(uppercaseRatio);
  
  // Feature 3: Number of URLs
  const urlCount = (message.match(/(https?:\/\/|www\.)/g) || []).length;
  vector.push(Math.min(1, urlCount / 3));
  
  // Feature 4: Number density (numbers per character)
  const numberDensity = (message.match(/\d/g) || []).length / Math.max(1, message.length);
  vector.push(numberDensity);
  
  // Feature 5: Special character density
  const specialCharDensity = (message.match(/[^a-zA-Z0-9\s]/g) || []).length / Math.max(1, message.length);
  vector.push(specialCharDensity);
  
  // Feature 6: Word-to-character ratio (lower in spammy messages)
  const wordCount = message.split(/\s+/).length;
  const wordCharRatio = wordCount / Math.max(1, message.length);
  vector.push(wordCharRatio);
  
  // Feature 7: Entropy
  vector.push(calculateEntropy(message));
  
  // Feature 8: Character distribution anomaly
  vector.push(analyzeCharacterDistribution(message));
  
  return vector;
}

/**
 * Calculates similarity between two vectors (cosine similarity)
 * @param vec1 - First vector
 * @param vec2 - Second vector
 * @returns Similarity score (0-1)
 */
export function calculateVectorSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) return 0;
  
  // Dot product
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  
  // Handle zero vectors
  if (norm1 === 0 || norm2 === 0) return 0;
  
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

// Pre-defined fraud vectors (hand-crafted from known fraud patterns)
const FRAUD_VECTORS = [
  // Investment scam vector
  [0.4, 0.1, 0.3, 0.6, 0.2, 0.15, 0.7, 0.5],
  
  // Prize scam vector
  [0.3, 0.2, 0.2, 0.4, 0.3, 0.12, 0.6, 0.4],
  
  // Job scam vector
  [0.6, 0.1, 0.2, 0.3, 0.1, 0.18, 0.5, 0.3],
  
  // Phishing vector
  [0.3, 0.05, 0.7, 0.2, 0.3, 0.14, 0.6, 0.5]
];

/**
 * Calculate fraud probability using vector similarity approach
 * @param messageVector - The vector representation of the message
 * @returns Score indicating likelihood of fraud (0-1)
 */
export function calculateFraudProbability(messageVector: number[]): number {
  // Calculate highest similarity to known fraud vectors
  const similarities = FRAUD_VECTORS.map(
    fraudVec => calculateVectorSimilarity(messageVector, fraudVec)
  );
  
  return Math.max(...similarities);
}

/**
 * Creates a composite fraud score using ensemble methods
 * @param patternScore - Score from pattern-based detection
 * @param vectorScore - Score from vector-based detection
 * @param aiScore - Score from AI classification (if available)
 * @returns Weighted ensemble score (0-100)
 */
export function createEnsembleScore(
  patternScore: number, 
  vectorScore: number, 
  aiScore: number | null = null
): number {
  // Weights for ensemble
  const weights = {
    pattern: aiScore !== null ? 0.6 : 0.7,  // 60% or 70% weight on pattern detection
    vector: aiScore !== null ? 0.2 : 0.3,   // 20% or 30% weight on vector-based detection
    ai: 0.2                                // 20% weight on AI (if available)
  };
  
  // Calculate weighted score
  let weightedScore = (patternScore * weights.pattern) + 
                     (vectorScore * 100 * weights.vector);
  
  // Add AI score if available
  if (aiScore !== null) {
    weightedScore += (aiScore * weights.ai);
  }
  
  return weightedScore;
}
