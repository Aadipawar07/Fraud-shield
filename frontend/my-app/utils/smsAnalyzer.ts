/**
 * Utility for analyzing SMS messages for potential fraud
 * Uses OpenAI API for advanced fraud detection
 */

import OpenAI from "openai";
import axios from 'axios'; // Keep this for legacy code support
import { localFraudDetection } from './localDetection';

// Note: We no longer initialize the OpenAI client directly in the frontend.
// Instead, we'll use our backend API to make secure calls to OpenAI.
// This prevents API key exposure and disabling by OpenAI.

/**
 * Suspicious patterns to detect in messages
 */
const SUSPICIOUS_PATTERNS = {
  // Time-sensitive and urgent action patterns
  URGENT_ACTION: /urgent|immediate|act now|expires?|limited time|today only|just \d+ days|hurry|don't miss|last chance|deadline|offer ending|soon|quick|fast|rapidly|right now|today/i,
  
  // Financial terms and monetary indicators
  FINANCIAL: /money|bank|account|credit|debit|transfer|payment|deposit|withdraw|transaction|loan|fee|₹|rs\.?|inr|usd|\$|€|£|₹\d+|\$\d+|invest(ment)?|profit|earn(ing)?|income|return|double|triple|[0-9]+%|rupees?|dollars?|cash|funds?|financial|wealth|rich|millionaire/i,
  
  // Personal information requests
  PERSONAL_INFO: /verify|confirm|update|information|details|credentials|password|username|login|ssn|social security|id number|kyc|aadhar|pan card|verification|validate|authenticate/i,
  
  // Prize and lottery scams
  PRIZE_SCAMS: /won|winner|prize|reward|claim|lottery|sweepstakes|drawing|selected|chosen|lucky|jackpot|bonus|free gift|cash prize|lucky draw|contest winner|congratulations|congrats/i,
  
  // Pressure tactics and urgency indicators
  PRESSURE_TACTICS: /must|only|last chance|final notice|warning|alert|attention|risk|danger|threat|security|join now|limited offer|exclusive|restricted access|special invitation|selected few|privileged|opportunity|don't share|confidential|secret/i,
  
  // URLs and web links
  SUSPICIOUS_URLS: /(https?:\/\/|www\.)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}(:[0-9]{1,5})?(\/[^\s]*)?/i,
  
  // Shortened URLs (highly suspicious)
  SHORT_URLS: /(https?:\/\/|www\.)(bit\.ly|tinyurl|t\.co|goo\.gl|is\.gd|cli\.gs|pic\.gd|DwarfURL\.com|ow\.ly|yfrog|migre\.me|ff\.im|tiny\.cc|url4\.eu|tr\.im|twit\.ac|su\.pr|twurl\.nl|snipurl\.com|BudURL\.com|short\.to)[^\s]*/i,
  
  // Account security issues
  ACCOUNT_PROBLEMS: /suspend|disabled|locked|frozen|restricted|limited|problem|issue|verify|unusual activity|suspicious login|security breach|unauthorized|access|restore|reactivate|secure|protect/i,
  
  // Cryptocurrency terminology
  CRYPTO: /crypto|bitcoin|btc|eth|ethereum|wallet|blockchain|token|coin|mining|binance|nft|web3|defi|ico|altcoin|exchange|trade|hodl|doge|shiba|solana|tether|usdt|xrp|ripple|litecoin|ltc/i,
  
  // Tax and government scams
  TAX_SCAMS: /tax|irs|refund|audit|gov|government|authority|official|agency|department|federal|national|state|penalty|due|compliance|legal|law|enforcement|police|investigation|court/i,
  
  // Shipping and package scams
  SHIPPING_SCAMS: /package|delivery|shipping|shipment|ups|fedex|usps|dhl|track|customs|parcel|courier|post|mail|order|dispatch|arrival|delivered|collect|held|duty|clearance/i,
  
  // Stock and investment scams
  STOCK_SCAMS: /stock|shares|trading|insider|tip|hot stock|market|exchange|broker|invest|bull market|bear market|portfolio|dividend|equity|securities|mutual fund|ipos?|listing|unlisted|pre-ipo|penny stock|blue chip|small cap|mid cap|large cap|multibagger|share price/i,
  
  // Group and channel invites
  GROUP_INVITES: /telegram|whatsapp|signal|discord|join (our|the) group|channel|community|group link|chat group|forum|discussion|membership|subscribe|following|followers|private group|exclusive community|vip access/i,
  
  // Job scams
  JOB_SCAMS: /job|career|vacancy|position|opening|employment|work from home|wfh|remote work|hiring|salary|income|earning potential|interview|resume|cv|application|apply now|recruitment|hr|human resources/i,
  
  // Loan and credit scams
  LOAN_SCAMS: /loan|credit|debt|emi|interest|mortgage|financing|pre-?approved|eligible|qualification|quick loan|instant loan|no documentation|low interest|zero interest|debt free|credit score|credit history/i,
  
  // Success stories (often fake testimonials)
  SUCCESS_STORIES: /success story|testimonial|changed my life|financial freedom|quit my job|passive income|real results|proof|millionaire|businessman|billionaire|entrepreneur|success journey|rags to riches|wealth secret/i,
  
  // Marketing language often used in scams
  MARKETING_LANGUAGE: /exclusive|limited|special|vip|premium|elite|guaranteed|proven|secret|hidden|revealed|unlock|discover|amazing|incredible|extraordinary|revolutionary|breakthrough|proprietary|unique method/i
};

/**
 * Known suspicious sender patterns
 */
const SUSPICIOUS_SENDERS = [
  /^[0-9]{5,6}$/,  // 5-6 digit numbers often used in scams
  /bank|credit|paypal|amazon|netflix|apple|google|microsoft|support|service|alert|security|verify|update|info/i
];

/**
 * Message analysis result
 */
interface AnalysisResult {
  isFraud: boolean;
  score: number;
  reason?: string;
  confidence: 'Low' | 'Medium' | 'High';
  matchedPatterns: string[];
}

/**
 * Analyzes an SMS message for potential fraud using OpenAI API
 * @param message - The message text
 * @param sender - The message sender (not used in AI approach)
 * @param useAI - Whether to use AI for analysis (default: true)
 * @returns Analysis result
 */
export async function analyzeMessage(
  message: string, 
  sender: string,
  useAI: boolean = true
): Promise<AnalysisResult> {
  // Default result
  const result: AnalysisResult = {
    isFraud: false,
    score: 0,
    confidence: 'Low',
    matchedPatterns: []
  };
  
  // Primary approach: Use ChatGPT for fraud detection
  if (useAI) {
    try {
      console.log('Analyzing message using ChatGPT API...');
      
      // Get fraud detection result from ChatGPT
      const fraudResult = await detectFraud(message);
      console.log('ChatGPT Fraud Detection Result:', fraudResult);
      
      // Handle error cases - if the API call failed, we'll fall back to rule-based detection
      if (fraudResult.error) {
        console.error('ChatGPT API error:', fraudResult.error);
        console.log('Falling back to rule-based pattern matching...');
        // The fallbackResponse in detectFraud already used rule-based detection
        // We can use the result directly
      }
      
      // Update the result based on classification
      const confidence = 
        fraudResult.confidence_score >= 0.9 ? 'High' : 
        fraudResult.confidence_score >= 0.6 ? 'Medium' : 'Low';
        
      // Convert confidence score to a 0-100 scale
      const scoreValue = Math.round(fraudResult.confidence_score * 100);
      
      if (fraudResult.classification === 'FRAUD') {
        result.isFraud = true;
        result.score = scoreValue;
        result.confidence = confidence;
        result.matchedPatterns.push(fraudResult.error ? 'Rule-based detection' : 'ChatGPT detection');
        result.reason = fraudResult.reason || 'This message was identified as potentially fraudulent';
        return result;
      } 
      else if (fraudResult.classification === 'LEGITIMATE') {
        result.isFraud = false;
        result.score = scoreValue;
        result.confidence = confidence;
        result.reason = fraudResult.reason || 'This appears to be a legitimate message';
        return result;
      }
      else if (fraudResult.classification === 'NORMAL_SMS') {
        result.isFraud = false;
        result.score = scoreValue;
        result.confidence = confidence;
        result.reason = fraudResult.reason || 'This appears to be a normal, non-fraudulent message';
        return result;
      }
    } catch (error) {
      console.log('AI analysis failed:', error);
      // Continue with pattern matching as fallback
    }
  }
  
  // Initialize pattern matches counter
  let patternMatches = 0;
  let weightedScore = 0;
  
  // Check for suspicious sender
  for (const pattern of SUSPICIOUS_SENDERS) {
    if (pattern.test(sender)) {
      weightedScore += 15;
      patternMatches++;
      result.matchedPatterns.push('Suspicious sender pattern');
      break;
    }
  }
  
  // Check message against suspicious patterns
  for (const [name, pattern] of Object.entries(SUSPICIOUS_PATTERNS)) {
    if (pattern.test(message)) {
      patternMatches++;
      result.matchedPatterns.push(name);
      
      // Apply different weights to different patterns
      switch(name) {
        // High severity patterns (very likely fraud indicators)
        case 'PRIZE_SCAMS':
          weightedScore += 35;
          break;
        case 'SHORT_URLS':
          weightedScore += 35;
          break;
        case 'STOCK_SCAMS':
          weightedScore += 35;
          break;
        case 'SUCCESS_STORIES':
          weightedScore += 35;
          break;
          
        // Medium-high severity patterns
        case 'FINANCIAL':
          weightedScore += 30;
          break;
        case 'CRYPTO':
          weightedScore += 30;
          break;
        case 'JOB_SCAMS':
          weightedScore += 30;
          break;
        case 'LOAN_SCAMS':
          weightedScore += 30;
          break;
        
        // Medium severity patterns
        case 'URGENT_ACTION':
          weightedScore += 25;
          break;
        case 'PRESSURE_TACTICS':
          weightedScore += 25;
          break;
        case 'ACCOUNT_PROBLEMS':
          weightedScore += 25;
          break;
        case 'TAX_SCAMS':
          weightedScore += 25;
          break;
        case 'PERSONAL_INFO':
          weightedScore += 25;
          break;
          
        // Lower severity patterns (suspicious but not definitive)
        case 'GROUP_INVITES':
          weightedScore += 20;
          break;
        case 'SUSPICIOUS_URLS':
          weightedScore += 20;
          break;
        case 'SHIPPING_SCAMS':
          weightedScore += 20;
          break;
        case 'MARKETING_LANGUAGE':
          weightedScore += 20;
          break;
        default:
          weightedScore += 15;
      }
    }
  }
  
  // Calculate additional factors and sophisticated pattern combinations
  
  // Unusual message length (very short messages with links are often suspicious)
  if (message.length < 50 && message.includes('http')) {
    weightedScore += 25;
    result.matchedPatterns.push('Short message with link');
  }
  
  // Multiple URLs in the same message
  const urlMatches = message.match(/(https?:\/\/|www\.)/g);
  if (urlMatches && urlMatches.length > 1) {
    weightedScore += 25;
    result.matchedPatterns.push('Multiple URLs');
  }
  
  // ALL CAPS messages are often suspicious
  if (message === message.toUpperCase() && message.length > 20) {
    weightedScore += 15;
    result.matchedPatterns.push('ALL CAPS message');
  }
  
  // Investment scam patterns - these are highly suspicious
  if (/double|triple|[0-9]+x|[0-9]+%|multiple|grow|increase|profit|return/.test(message) && 
      /investment|stock|trading|money|earn|income/.test(message)) {
    weightedScore += 45;
    result.matchedPatterns.push('Investment scam pattern');
  }
  
  // Money request patterns
  if (/fee|payment|pay|send money|deposit|cost|rs\.|\$|₹/.test(message) && 
      /join|register|subscribe|access|entry|membership/.test(message)) {
    weightedScore += 40;
    result.matchedPatterns.push('Payment request pattern');
  }
  
  // Time-limited investment opportunity (very strong fraud indicator)
  if (/urgent|limited|today|now|hurry|quick|fast|act now|expires|soon|deadline/.test(message) && 
      /invest|stock|trading|opportunity|profit|return|double|income/.test(message)) {
    weightedScore += 50;
    result.matchedPatterns.push('Urgent investment opportunity pattern');
  }
  
  // Prize claiming requiring payment (classic scam)
  if (/won|winner|prize|reward|congratulations|selected/.test(message) && 
      /fee|charge|deposit|pay|verify|claim|process|tax/.test(message)) {
    weightedScore += 50;
    result.matchedPatterns.push('Prize with payment pattern');
  }
  
  // Job with upfront payment (definite scam)
  if (/job|employment|work|career|position|vacancy|income/.test(message) && 
      /fee|deposit|investment|pay|registration|training/.test(message)) {
    weightedScore += 50;
    result.matchedPatterns.push('Job with payment pattern');
  }
  
  // Success story with group joining (common in investment scams)
  if (/success|millionaire|rich|wealthy|profit|income/.test(message) && 
      /join|group|community|channel|telegram|whatsapp/.test(message)) {
    weightedScore += 45;
    result.matchedPatterns.push('Success story with group pattern');
  }
  
  // Multiple patterns bonus (scales with number of patterns)
  if (patternMatches >= 2) {
    const multiPatternBonus = Math.min(50, patternMatches * 10); // Cap at 50
    weightedScore += multiPatternBonus;
    result.matchedPatterns.push(`Multiple patterns (${patternMatches})`);
  }
  
  // Numerical bonus - messages with numbers are often scams
  const numberCount = (message.match(/\d+/g) || []).length;
  if (numberCount >= 2) {
    weightedScore += Math.min(20, numberCount * 5); // Cap at 20
    result.matchedPatterns.push('Multiple numbers');
  }
  
  // Currency symbol bonus
  if (/₹|\$|€|£|USD|INR|EUR|GBP|Rs\.?/.test(message)) {
    weightedScore += 15;
    result.matchedPatterns.push('Currency symbols');
  }
  
  // Normalize score to 0-100 scale
  result.score = Math.min(100, weightedScore);
  
  // Determine if message is fraudulent based on score
  if (result.score >= 60) {
    result.isFraud = true;
    result.confidence = 'High';
  } else if (result.score >= 30) {
    result.isFraud = true;
    result.confidence = 'Medium';
  } else if (result.score >= 25) {
    result.isFraud = result.score >= 30;
    result.confidence = 'Low';
  }
  
  // Set reason based on highest-weight matched pattern
  if (result.isFraud && result.matchedPatterns.length > 0) {
    // Use the first matched pattern as the reason
    const mainPattern = result.matchedPatterns[0];
    
    switch(mainPattern) {
      case 'URGENT_ACTION':
      case 'PRESSURE_TACTICS':
        result.reason = 'Urgent action required language';
        break;
      case 'FINANCIAL':
        result.reason = 'Suspicious financial content';
        break;
      case 'PERSONAL_INFO':
        result.reason = 'Requesting personal information';
        break;
      case 'PRIZE_SCAMS':
        result.reason = 'Prize or lottery scam indicators';
        break;
      case 'SUSPICIOUS_URLS':
      case 'SHORT_URLS':
        result.reason = 'Suspicious URL detected';
        break;
      case 'ACCOUNT_PROBLEMS':
        result.reason = 'Account problem scam indicators';
        break;
      case 'CRYPTO':
        result.reason = 'Cryptocurrency scam indicators';
        break;
      case 'TAX_SCAMS':
        result.reason = 'Potential tax scam';
        break;
      case 'SHIPPING_SCAMS':
        result.reason = 'Shipping notification scam';
        break;
      case 'Suspicious sender pattern':
        result.reason = 'Suspicious sender';
        break;
      default:
        result.reason = 'Multiple suspicious patterns detected';
    }
  }
  
  return result;
}

/**
 * Gets a human-readable explanation of the fraud analysis
 * @param analysis - The analysis result
 * @returns Human-readable explanation
 */
export function getReadableAnalysis(analysis: AnalysisResult): string {
  if (!analysis.isFraud) {
    if (analysis.reason) {
      return `This message appears to be safe. ${analysis.reason}`;
    }
    return 'This message appears to be safe.';
  }
  
  let explanation = `This message was flagged as potentially fraudulent`;
  
  if (analysis.reason) {
    // If we have a reason from ChatGPT, use it directly
    if (analysis.matchedPatterns.includes('AI detection')) {
      explanation = analysis.reason;
    } else {
      explanation += ` because it contains ${analysis.reason.toLowerCase()}.`;
    }
  } else {
    explanation += '.';
  }
  
  if (analysis.matchedPatterns.length > 0 && !analysis.matchedPatterns.includes('AI detection')) {
    explanation += ` We detected ${analysis.matchedPatterns.length} suspicious patterns in this message.`;
  }
  
  explanation += ` Fraud confidence: ${analysis.confidence}.`;
  
  return explanation;
}

/**
 * Response object from fraud detection analysis
 */
interface FraudDetectionResponse {
  classification: string;
  confidence_score: number;
  reason: string;
  error?: string;
  raw?: string;
}

// Our detection system prompt
const fraudDetectionPrompt = `
You are a fraud detection AI specializing in analyzing text messages with extremely high accuracy (95%+).  
Classify any given message into one of three categories:  
1. FRAUD  
2. LEGITIMATE  
3. NORMAL_SMS  

Definitions:  
- FRAUD: scams like stock tips, fake loans, lottery winnings, phishing links, deposit requests, unrealistic profit promises.  
- LEGITIMATE: real financial/business updates, genuine bank alerts, market news.  
- NORMAL_SMS: casual/personal/service messages (friends, family, delivery, OTPs).  

Output strictly in JSON format:
{
  "classification": "FRAUD" or "LEGITIMATE" or "NORMAL_SMS",
  "confidence_score": number,
  "reason": "short explanation"
}
`;

/**
 * Detects fraud in messages using OpenAI's API
 * @param message - The SMS message text
 * @returns Promise<FraudDetectionResponse> - Structured fraud detection result
 */
export async function detectFraud(message: string): Promise<FraudDetectionResponse> {
  // For development fallback when API calls fail
  const fallbackResponse = (errorMsg: string): FraudDetectionResponse => {
    console.log("Using local rule-based detection as fallback due to:", errorMsg);
    // Use local detection as fallback
    const localResult = localFraudDetection(message);
    return {
      classification: localResult.classification,
      confidence_score: localResult.confidence_score,
      reason: `${localResult.reason} (Rule-based detection - ChatGPT API error: ${errorMsg})`,
      error: errorMsg
    };
  };

  // Don't proceed with empty messages
  if (!message || message.trim() === '') {
    return fallbackResponse("Empty message");
  }

  try {
    console.log("Starting ChatGPT AI detection via secure backend...");
    
    // Get API base URL (same as in api.ts)
    const getApiBaseUrl = () => {
      if (typeof window === 'undefined') return 'http://localhost:5000';
      
      const platform = require('react-native').Platform;
      // For Android Emulator, use 10.0.2.2 (special Android DNS)
      if (platform.OS === "android" && !__DEV__) {
        return "http://10.0.2.2:5000";
      }
      
      // For physical devices, use your computer's IP address
      if (platform.OS === "android" || platform.OS === "ios") {
        return "http://192.168.1.5:5000";  // Replace with your computer's IP
      }
      
      // For web or development
      return "http://localhost:5000";
    };
    
    const API_URL = process.env.EXPO_PUBLIC_API_URL ?? getApiBaseUrl();
    
      // Send message to new backend endpoint
      const response = await fetch(`${API_URL}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

    if (!response.ok) {
      throw new Error(`Backend API request failed with status ${response.status}`);
    }
    
    const result = await response.json();
    console.log("Backend ChatGPT response:", result);
    
    // If the backend has provided a properly formatted response
    if (result.classification) {
      return {
        classification: result.classification,
        confidence_score: result.confidence_score || 0.8,
        reason: result.reason || 'Analysis performed via backend API',
      };
    }
    
    // If we got an unexpected response format
    throw new Error('Unexpected response format from backend');
    
  } catch (error) {
    console.error("Backend API error:", error);
    
    // Handle various error types with appropriate fallbacks
    const errorMessage = (error as Error).message || "Unknown error";
    
    // Categorize the error for better diagnostics
    let errorType: string;
    
    // If it's a network error
    if (errorMessage.includes("network") || errorMessage.includes("connect") || 
        errorMessage.includes("CORS") || errorMessage.includes("timeout") ||
        errorMessage.includes("failed with status")) {
      console.error("Network issue:", error);
      errorType = "Network issue connecting to backend API";
    }
    // If backend reports rate limit errors
    else if (errorMessage.includes("rate") || errorMessage.includes("limit") || 
             errorMessage.includes("429")) {
      console.error("Rate limit issue:", error);
      errorType = "ChatGPT API rate limit exceeded";
    }
    // Backend service unavailable
    else if (errorMessage.includes("503") || errorMessage.includes("502") || 
             errorMessage.includes("service unavailable")) {
      console.error("Backend service unavailable:", error);
      errorType = "Backend service temporarily unavailable";
    }
    // Timeout issues
    else if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
      console.error("Timeout issue:", error);
      errorType = "Backend API request timed out";
    }
    // Generic error fallback
    else {
      console.error("Unspecified backend API error:", error);
      errorType = `Backend API error: ${errorMessage.substring(0, 100)}`;
    }
    
    console.log("Falling back to rule-based SMS verification...");
    // Return a fallback response with the specific error type
    return fallbackResponse(errorType);
  }
}

/**
 * Legacy response object from ChatGPT analysis
 * @deprecated Use detectFraud instead
 */
interface ChatGPTResponse {
  classification: string;
  explanation: string;
  rawResponse?: string;
}

/**
 * Legacy method for getting a detailed response from ChatGPT
 * @deprecated Use detectFraud instead
 * @param message - The SMS message text
 * @returns Promise<ChatGPTResponse> - Object containing classification and explanation
 */
export async function getFullChatGPTResponse(message: string): Promise<ChatGPTResponse> {
  console.warn("getFullChatGPTResponse is deprecated. Use detectFraud instead.");
  
  try {
    // Use the new detectFraud function and convert the response format
    const result = await detectFraud(message);
    
    return {
      classification: result.classification,
      explanation: result.reason,
      rawResponse: result.raw
    };
  } catch (error) {
    console.error('ChatGPT API error:', error);
    return { 
      classification: "ERROR", 
      explanation: "Error communicating with AI service"
    };
  }
}

/**
 * Simple classification function (legacy)
 * @deprecated - Use detectFraud instead
 * @param message - The SMS message text
 * @returns Promise<string> - The classification result
 */
export async function classifySMSWithChatGPT(message: string): Promise<string> {
  console.warn("classifySMSWithChatGPT is deprecated. Use detectFraud instead.");
  
  try {
    const result = await detectFraud(message);
    return result.classification;
  } catch (error) {
    console.error('ChatGPT classification error:', error);
    return 'ERROR';
  }
}
