/**
 * Enhanced Fraud Detection Integration
 * Integrates all new security features with existing system
 */

import { analyzeMessage as originalAnalyzeMessage } from './fraudDetection';
import { analyzeUrlsInMessage } from './urlAnalyzer';
import { adaptiveSecuritySystem } from './adaptiveAlerts';
import { analyzeMessageMultilingual } from './multilingualDetection';
import { analyzeSocialEngineering } from './socialEngineeringDetection';

export interface EnhancedAnalysisResult {
  // Core fraud detection
  isFraud: boolean;
  score: number;
  confidence: string;
  matchedPatterns: string[];
  reason: string;
  
  // Enhanced features
  urlThreats: any;
  socialEngineeringRisks: any;
  languageAnalysis: any;
  personalizedAlert: any;
  
  // Overall assessment
  enhancedRiskScore: number;
  threatLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: string;
}

/**
 * Enhanced analyze message function with all new features
 */
export async function analyzeMessageEnhanced(
  message: string,
  sender: string = "",
  useEnhancedFeatures: boolean = true
): Promise<EnhancedAnalysisResult> {
  
  // Start with original analysis
  const originalResult = await originalAnalyzeMessage(message, sender, true);
  
  if (!useEnhancedFeatures) {
    return {
      ...originalResult,
      reason: originalResult.reason || 'Pattern-based analysis',
      urlThreats: null,
      socialEngineeringRisks: null,
      languageAnalysis: null,
      personalizedAlert: null,
      enhancedRiskScore: originalResult.score,
      threatLevel: originalResult.score >= 70 ? 'HIGH' : originalResult.score >= 40 ? 'MEDIUM' : 'LOW',
      recommendation: originalResult.isFraud ? 'Be cautious with this message' : 'Message appears safe'
    };
  }
  
  try {
    // Run enhanced analyses in parallel for speed
    const [urlAnalysis, socialEngAnalysis, multilangAnalysis] = await Promise.all([
      analyzeUrlsInMessage(message),
      analyzeSocialEngineering(message),
      analyzeMessageMultilingual(message, 'auto')
    ]);
    
    // Generate personalized alert
    await adaptiveSecuritySystem.initializeUserProfile('user123');
    const personalizedAlert = await adaptiveSecuritySystem.generatePersonalizedAlert({
      type: socialEngAnalysis.isManipulative ? 'social_engineering' : 'traditional_fraud',
      severity: originalResult.score >= 70 ? 'HIGH' : originalResult.score >= 40 ? 'MEDIUM' : 'LOW',
      confidence: originalResult.score / 100,
      reasons: [
        ...originalResult.matchedPatterns,
        ...(urlAnalysis.isPhishing ? ['Phishing URL'] : []),
        ...socialEngAnalysis.detectedTactics.map(t => t.name)
      ],
      messageContent: message
    });
    
    // Calculate enhanced risk score
    const enhancedRiskScore = Math.round(
      (originalResult.score * 0.4) +
      (urlAnalysis.isPhishing ? 80 : 10) * 0.3 +
      (socialEngAnalysis.manipulationScore * 0.3)
    );
    
    // Determine threat level
    let threatLevel: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (enhancedRiskScore >= 80 || socialEngAnalysis.riskLevel === 'CRITICAL') {
      threatLevel = 'CRITICAL';
    } else if (enhancedRiskScore >= 65) {
      threatLevel = 'HIGH';
    } else if (enhancedRiskScore >= 45) {
      threatLevel = 'MEDIUM';
    } else if (enhancedRiskScore >= 25) {
      threatLevel = 'LOW';
    } else {
      threatLevel = 'SAFE';
    }
    
    // Enhanced recommendation
    let recommendation = '';
    if (threatLevel === 'CRITICAL') {
      recommendation = '🚨 CRITICAL THREAT: Do not respond or click any links. This message uses advanced manipulation tactics.';
    } else if (threatLevel === 'HIGH') {
      recommendation = '⚠️ HIGH RISK: Multiple threat indicators detected. Verify through official channels before any action.';
    } else if (threatLevel === 'MEDIUM') {
      recommendation = '⚡ MODERATE RISK: Some suspicious elements found. Exercise caution and verify authenticity.';
    } else if (threatLevel === 'LOW') {
      recommendation = 'ℹ️ LOW RISK: Minor concerns detected. Standard verification recommended.';
    } else {
      recommendation = '✅ SAFE: No significant threats detected. Message appears legitimate.';
    }
    
    return {
      // Original results
      isFraud: originalResult.isFraud || enhancedRiskScore >= 45,
      score: enhancedRiskScore,
      confidence: enhancedRiskScore >= 70 ? 'High' : enhancedRiskScore >= 40 ? 'Medium' : 'Low',
      matchedPatterns: [
        ...originalResult.matchedPatterns,
        ...(urlAnalysis.isPhishing ? ['Phishing URL detected'] : []),
        ...socialEngAnalysis.detectedTactics.map(t => t.name)
      ],
      reason: generateEnhancedReason(originalResult, urlAnalysis, socialEngAnalysis),
      
      // Enhanced features
      urlThreats: urlAnalysis,
      socialEngineeringRisks: socialEngAnalysis,
      languageAnalysis: multilangAnalysis,
      personalizedAlert,
      
      // Overall assessment
      enhancedRiskScore,
      threatLevel,
      recommendation
    };
    
  } catch (error) {
    console.error('Enhanced analysis failed, falling back to original:', error);
    
    return {
      ...originalResult,
      reason: originalResult.reason || 'Enhanced analysis failed, using fallback',
      urlThreats: null,
      socialEngineeringRisks: null,
      languageAnalysis: null,
      personalizedAlert: null,
      enhancedRiskScore: originalResult.score,
      threatLevel: originalResult.score >= 70 ? 'HIGH' : originalResult.score >= 40 ? 'MEDIUM' : 'LOW',
      recommendation: originalResult.isFraud ? 'Be cautious with this message' : 'Message appears safe'
    };
  }
}

/**
 * Generate enhanced explanation combining all analysis types
 */
function generateEnhancedReason(
  originalResult: any,
  urlAnalysis: any,
  socialEngAnalysis: any
): string {
  const reasons: string[] = [];
  
  // Add original reason
  if (originalResult.reason) {
    reasons.push(originalResult.reason);
  }
  
  // Add URL threats
  if (urlAnalysis.isPhishing) {
    reasons.push(`Phishing URL detected (${urlAnalysis.riskLevel} risk)`);
  }
  
  // Add social engineering tactics
  if (socialEngAnalysis.detectedTactics.length > 0) {
    const topTactic = socialEngAnalysis.detectedTactics[0];
    reasons.push(`Social engineering: ${topTactic.name}`);
  }
  
  // Add psychological profile if significant
  if (socialEngAnalysis.manipulationScore >= 40) {
    reasons.push(`Psychological manipulation detected`);
  }
  
  return reasons.length > 0 ? reasons.join('; ') : 'Multiple threat indicators detected';
}

/**
 * Quick demo function for hackathon
 */
export async function quickDemo(message: string, sender: string = ""): Promise<string> {
  const result = await analyzeMessageEnhanced(message, sender, true);
  
  let output = `📱 **MESSAGE ANALYSIS**\n`;
  output += `Message: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"\n\n`;
  
  output += `🎯 **THREAT LEVEL: ${result.threatLevel}** (${result.enhancedRiskScore}/100)\n`;
  output += `${result.recommendation}\n\n`;
  
  if (result.socialEngineeringRisks?.detectedTactics.length > 0) {
    output += `🎭 **Social Engineering Tactics:**\n`;
    result.socialEngineeringRisks.detectedTactics.forEach((tactic: any) => {
      output += `• ${tactic.name} (${tactic.severity})\n`;
    });
    output += '\n';
  }
  
  if (result.urlThreats?.detectedUrls.length > 0) {
    output += `🔗 **URL Analysis:**\n`;
    output += `• ${result.urlThreats.detectedUrls.length} URL(s) found\n`;
    output += `• Risk Level: ${result.urlThreats.riskLevel}\n`;
    if (result.urlThreats.isPhishing) {
      output += `• ⚠️ PHISHING URLs detected!\n`;
    }
    output += '\n';
  }
  
  if (result.languageAnalysis?.language_detected !== 'en') {
    output += `🌍 **Language:** ${result.languageAnalysis.language_detected}\n`;
    output += `Classification: ${result.languageAnalysis.classification}\n\n`;
  }
  
  if (result.personalizedAlert) {
    output += `⚡ **Personalized Alert:** ${result.personalizedAlert.severity} severity\n`;
    output += `Action Items: ${result.personalizedAlert.actionItems.length} personalized recommendations\n\n`;
  }
  
  output += `🔍 **Detected Patterns:** ${result.matchedPatterns.join(', ')}\n`;
  
  return output;
}

// Export the enhanced function as the main analyzer
export { analyzeMessageEnhanced as analyzeMessage };