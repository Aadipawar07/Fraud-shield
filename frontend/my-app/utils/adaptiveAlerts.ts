/**
 * Adaptive User-Centric Security Alert System
 * Personalizes alerts based on user behavior, risk profile, and threat context
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  alertPreferences: AlertPreferences;
  behaviorData: UserBehaviorData;
  vulnerabilityScore: number;
  lastUpdated: string;
}

export interface AlertPreferences {
  severity: {
    low: boolean;
    medium: boolean;
    high: boolean;
    critical: boolean;
  };
  channels: {
    notification: boolean;
    sound: boolean;
    vibration: boolean;
    popup: boolean;
  };
  frequency: 'IMMEDIATE' | 'BATCHED' | 'DAILY_SUMMARY';
  language: 'en' | 'hi' | 'auto';
  educationalTips: boolean;
}

export interface UserBehaviorData {
  totalMessagesAnalyzed: number;
  fraudDetected: number;
  falsePositives: number;
  userFeedback: {
    correct: number;
    incorrect: number;
  };
  commonThreats: string[];
  riskPatterns: string[];
  lastActiveTime: string;
  deviceInfo: {
    model: string;
    os: string;
    location?: string;
  };
}

export interface PersonalizedAlert {
  id: string;
  type: 'PHISHING' | 'SOCIAL_ENGINEERING' | 'FINANCIAL_FRAUD' | 'EDUCATIONAL';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  detailedExplanation: string;
  actionItems: string[];
  personalizedTips: string[];
  riskContext: string;
  timestamp: string;
  isUrgent: boolean;
  educationalContent?: EducationalContent;
}

export interface EducationalContent {
  topic: string;
  description: string;
  preventionTips: string[];
  exampleScenarios: string[];
  resources: string[];
}

class AdaptiveSecuritySystem {
  private static instance: AdaptiveSecuritySystem;
  private userProfile: UserProfile | null = null;

  public static getInstance(): AdaptiveSecuritySystem {
    if (!AdaptiveSecuritySystem.instance) {
      AdaptiveSecuritySystem.instance = new AdaptiveSecuritySystem();
    }
    return AdaptiveSecuritySystem.instance;
  }

  /**
   * Initialize user profile with adaptive learning
   */
  async initializeUserProfile(userId: string): Promise<UserProfile> {
    try {
      const stored = await AsyncStorage.getItem(`userProfile_${userId}`);
      if (stored) {
        this.userProfile = JSON.parse(stored);
        return this.userProfile!;
      }

      // Create new profile with defaults
      this.userProfile = {
        id: userId,
        riskLevel: 'MEDIUM',
        alertPreferences: this.getDefaultAlertPreferences(),
        behaviorData: this.getDefaultBehaviorData(),
        vulnerabilityScore: 50,
        lastUpdated: new Date().toISOString()
      };

      await this.saveUserProfile();
      return this.userProfile;
    } catch (error) {
      console.error('Error initializing user profile:', error);
      throw error;
    }
  }

  /**
   * Generate personalized alert based on threat and user context
   */
  async generatePersonalizedAlert(
    threatData: {
      type: string;
      severity: string;
      confidence: number;
      reasons: string[];
      messageContent: string;
    }
  ): Promise<PersonalizedAlert> {
    if (!this.userProfile) {
      throw new Error('User profile not initialized');
    }

    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Adapt alert based on user's risk profile and preferences
    const adaptedSeverity = this.adaptSeverityBasedOnUserProfile(threatData.severity);
    const personalizedMessage = this.generatePersonalizedMessage(threatData);
    const actionItems = this.generateContextualActionItems(threatData);
    const tips = this.generatePersonalizedTips(threatData);
    const riskContext = this.generateRiskContext(threatData);

    const alert: PersonalizedAlert = {
      id: alertId,
      type: this.mapThreatTypeToAlertType(threatData.type),
      severity: adaptedSeverity,
      title: this.generateAdaptiveTitle(threatData),
      message: personalizedMessage,
      detailedExplanation: this.generateDetailedExplanation(threatData),
      actionItems,
      personalizedTips: tips,
      riskContext,
      timestamp: new Date().toISOString(),
      isUrgent: this.determineUrgency(threatData, adaptedSeverity),
      educationalContent: this.generateEducationalContent(threatData)
    };

    // Update user behavior data
    await this.updateUserBehaviorData(threatData);

    return alert;
  }

  /**
   * Adapt alert severity based on user's vulnerability profile
   */
  private adaptSeverityBasedOnUserProfile(originalSeverity: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (!this.userProfile) return originalSeverity as any;

    const userVulnerability = this.userProfile.vulnerabilityScore;
    const baseScore = this.severityToScore(originalSeverity);
    
    // Adjust based on user vulnerability
    let adjustedScore = baseScore;
    
    if (userVulnerability > 70) {
      // High vulnerability users get elevated alerts
      adjustedScore = Math.min(100, baseScore + 20);
    } else if (userVulnerability < 30) {
      // Low vulnerability users get slightly reduced alerts
      adjustedScore = Math.max(25, baseScore - 10);
    }

    // Factor in user's past false positive rate
    const falsePositiveRate = this.userProfile.behaviorData.falsePositives / 
                              Math.max(1, this.userProfile.behaviorData.totalMessagesAnalyzed);
    
    if (falsePositiveRate > 0.3) {
      // User has high false positive rate, be more conservative
      adjustedScore = Math.max(25, adjustedScore - 15);
    }

    return this.scoreToSeverity(adjustedScore);
  }

  /**
   * Generate personalized message based on user's behavior patterns
   */
  private generatePersonalizedMessage(threatData: any): string {
    if (!this.userProfile) return "Potential threat detected in your message.";

    const userRisk = this.userProfile.riskLevel;
    const commonThreats = this.userProfile.behaviorData.commonThreats;
    
    let message = "";
    
    if (userRisk === 'HIGH') {
      message = "🚨 IMMEDIATE ATTENTION REQUIRED: ";
    } else if (userRisk === 'MEDIUM') {
      message = "⚠️ Security Alert: ";
    } else {
      message = "ℹ️ Security Notice: ";
    }

    // Personalize based on common threat patterns
    if (commonThreats.includes('FINANCIAL') && threatData.type.includes('financial')) {
      message += "This appears to be another financial scam similar to ones you've encountered before. ";
    } else if (commonThreats.includes('PHISHING') && threatData.type.includes('phishing')) {
      message += "This message shows phishing characteristics that target users like you. ";
    } else {
      message += "We've detected a potentially fraudulent message. ";
    }

    message += this.getContextualWarning(threatData);

    return message;
  }

  /**
   * Generate contextual action items based on threat and user profile
   */
  private generateContextualActionItems(threatData: any): string[] {
    const actions: string[] = [];
    
    // Universal actions
    actions.push("🚫 Do NOT click on any links in this message");
    actions.push("📞 Contact the organization directly using official channels");
    
    // Threat-specific actions
    if (threatData.reasons.includes('Suspicious URL')) {
      actions.push("🔍 Verify the website URL before entering any information");
      actions.push("🛡️ Use official apps instead of clicking links");
    }
    
    if (threatData.reasons.includes('Personal information')) {
      actions.push("🔐 Never share personal details via SMS");
      actions.push("📋 Check if the request is legitimate through official channels");
    }
    
    if (threatData.reasons.includes('Financial')) {
      actions.push("💳 Check your account through official banking app");
      actions.push("📞 Call your bank's official customer service number");
    }

    // User-specific actions based on vulnerability
    if (this.userProfile?.vulnerabilityScore && this.userProfile.vulnerabilityScore > 60) {
      actions.push("👥 Consider asking a tech-savvy friend or family member for advice");
      actions.push("🕐 Take time to think - scammers create artificial urgency");
    }

    return actions;
  }

  /**
   * Generate personalized security tips
   */
  private generatePersonalizedTips(threatData: any): string[] {
    const tips: string[] = [];
    
    if (!this.userProfile) return tips;

    // Tips based on user's common vulnerabilities
    const commonThreats = this.userProfile.behaviorData.commonThreats;
    
    if (commonThreats.includes('URGENT_ACTION')) {
      tips.push("💡 Legitimate organizations rarely require immediate action via SMS");
    }
    
    if (commonThreats.includes('FINANCIAL')) {
      tips.push("🏦 Banks will never ask for passwords or PINs via SMS");
    }
    
    if (commonThreats.includes('PRIZE_SCAMS')) {
      tips.push("🎁 Real prizes don't require upfront payments or fees");
    }

    // General adaptive tips
    tips.push("🔍 When in doubt, verify independently through official channels");
    tips.push("🛡️ Enable two-factor authentication on important accounts");
    
    return tips;
  }

  /**
   * Generate risk context based on current threat landscape
   */
  private generateRiskContext(threatData: any): string {
    let context = "";
    
    // Time-based context
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 6) {
      context += "⏰ Scammers often target users during late hours when they might be less alert. ";
    }
    
    // Threat trend context
    if (threatData.type.includes('banking')) {
      context += "📈 Banking scams have increased by 40% this quarter. ";
    }
    
    // Seasonal context
    const month = new Date().getMonth();
    if (month === 2 || month === 3) { // March-April (tax season in India)
      context += "🗓️ Tax season sees a spike in government impersonation scams. ";
    }
    
    return context || "Stay vigilant against evolving fraud tactics.";
  }

  /**
   * Generate educational content based on detected threat
   */
  private generateEducationalContent(threatData: any): EducationalContent | undefined {
    if (!this.userProfile?.alertPreferences.educationalTips) return undefined;

    const threatType = threatData.type.toLowerCase();
    
    if (threatType.includes('phishing')) {
      return {
        topic: "Understanding Phishing Attacks",
        description: "Phishing attacks trick users into sharing personal information by impersonating trusted entities.",
        preventionTips: [
          "Always verify sender identity through official channels",
          "Look for spelling errors and suspicious URLs",
          "Never share passwords or OTPs via SMS",
          "Use official apps instead of clicking links"
        ],
        exampleScenarios: [
          "Fake bank messages asking to 'verify' your account",
          "Prize notifications requiring personal details",
          "Urgent security alerts with suspicious links"
        ],
        resources: [
          "https://www.rbi.org.in/scripts/PublicationReportDetails.aspx?UrlPage=&ID=1166",
          "Government cybersecurity awareness portal"
        ]
      };
    }

    return undefined;
  }

  /**
   * Update user behavior data for adaptive learning
   */
  private async updateUserBehaviorData(threatData: any): Promise<void> {
    if (!this.userProfile) return;

    this.userProfile.behaviorData.totalMessagesAnalyzed++;
    
    if (threatData.severity === 'HIGH' || threatData.severity === 'CRITICAL') {
      this.userProfile.behaviorData.fraudDetected++;
    }

    // Update common threat patterns
    const threatType = threatData.type;
    if (!this.userProfile.behaviorData.commonThreats.includes(threatType)) {
      this.userProfile.behaviorData.commonThreats.push(threatType);
    }

    // Recalculate vulnerability score
    this.userProfile.vulnerabilityScore = this.calculateVulnerabilityScore();
    this.userProfile.lastUpdated = new Date().toISOString();

    await this.saveUserProfile();
  }

  /**
   * Calculate user vulnerability score based on behavior patterns
   */
  private calculateVulnerabilityScore(): number {
    if (!this.userProfile) return 50;

    const behaviorData = this.userProfile.behaviorData;
    let score = 50; // Base score

    // Factor in fraud detection rate
    const fraudRate = behaviorData.fraudDetected / Math.max(1, behaviorData.totalMessagesAnalyzed);
    if (fraudRate > 0.1) score += 20; // High fraud exposure increases vulnerability

    // Factor in false positive feedback
    const falsePositiveRate = behaviorData.falsePositives / Math.max(1, behaviorData.totalMessagesAnalyzed);
    if (falsePositiveRate > 0.3) score -= 10; // Good at identifying false positives

    // Factor in user feedback accuracy
    const feedbackTotal = behaviorData.userFeedback.correct + behaviorData.userFeedback.incorrect;
    if (feedbackTotal > 0) {
      const accuracyRate = behaviorData.userFeedback.correct / feedbackTotal;
      if (accuracyRate > 0.8) score -= 15; // Good accuracy reduces vulnerability
      if (accuracyRate < 0.5) score += 15; // Poor accuracy increases vulnerability
    }

    return Math.max(10, Math.min(90, score));
  }

  // Helper methods
  private getDefaultAlertPreferences(): AlertPreferences {
    return {
      severity: { low: true, medium: true, high: true, critical: true },
      channels: { notification: true, sound: true, vibration: true, popup: true },
      frequency: 'IMMEDIATE',
      language: 'auto',
      educationalTips: true
    };
  }

  private getDefaultBehaviorData(): UserBehaviorData {
    return {
      totalMessagesAnalyzed: 0,
      fraudDetected: 0,
      falsePositives: 0,
      userFeedback: { correct: 0, incorrect: 0 },
      commonThreats: [],
      riskPatterns: [],
      lastActiveTime: new Date().toISOString(),
      deviceInfo: { model: 'unknown', os: 'unknown' }
    };
  }

  private severityToScore(severity: string): number {
    switch (severity.toUpperCase()) {
      case 'LOW': return 25;
      case 'MEDIUM': return 50;
      case 'HIGH': return 75;
      case 'CRITICAL': return 100;
      default: return 50;
    }
  }

  private scoreToSeverity(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  }

  private mapThreatTypeToAlertType(threatType: string): 'PHISHING' | 'SOCIAL_ENGINEERING' | 'FINANCIAL_FRAUD' | 'EDUCATIONAL' {
    if (threatType.toLowerCase().includes('phishing')) return 'PHISHING';
    if (threatType.toLowerCase().includes('social')) return 'SOCIAL_ENGINEERING';
    if (threatType.toLowerCase().includes('financial')) return 'FINANCIAL_FRAUD';
    return 'SOCIAL_ENGINEERING';
  }

  private generateAdaptiveTitle(threatData: any): string {
    const severity = threatData.severity.toUpperCase();
    const type = threatData.type.toLowerCase();
    
    if (severity === 'CRITICAL') {
      return "🚨 URGENT SECURITY THREAT DETECTED";
    } else if (severity === 'HIGH') {
      if (type.includes('phishing')) return "⚠️ Phishing Attack Detected";
      if (type.includes('financial')) return "💰 Financial Fraud Alert";
      return "🛡️ Security Threat Detected";
    } else {
      return "ℹ️ Security Notice";
    }
  }

  private generateDetailedExplanation(threatData: any): string {
    let explanation = `Our advanced AI analysis has identified this message as potentially fraudulent with ${threatData.confidence}% confidence.\n\n`;
    
    explanation += "🔍 **Detection Reasons:**\n";
    threatData.reasons.forEach((reason: string) => {
      explanation += `• ${reason}\n`;
    });
    
    explanation += "\n🧠 **How We Detected This:**\n";
    explanation += "• Advanced AI pattern recognition\n";
    explanation += "• Real-time threat intelligence\n";
    explanation += "• Behavioral analysis algorithms\n";
    
    return explanation;
  }

  private getContextualWarning(threatData: any): string {
    if (threatData.reasons.includes('Urgent action')) {
      return "Scammers create false urgency to pressure quick decisions.";
    }
    if (threatData.reasons.includes('Personal info')) {
      return "Legitimate organizations won't ask for sensitive info via SMS.";
    }
    if (threatData.reasons.includes('Financial')) {
      return "Your financial security may be at risk.";
    }
    return "Please verify before taking any action.";
  }

  private determineUrgency(threatData: any, severity: string): boolean {
    return severity === 'CRITICAL' || 
           (severity === 'HIGH' && threatData.reasons.includes('Urgent action'));
  }

  private async saveUserProfile(): Promise<void> {
    if (this.userProfile) {
      await AsyncStorage.setItem(
        `userProfile_${this.userProfile.id}`,
        JSON.stringify(this.userProfile)
      );
    }
  }

  /**
   * Record user feedback for continuous learning
   */
  async recordUserFeedback(alertId: string, isCorrect: boolean): Promise<void> {
    if (!this.userProfile) return;

    if (isCorrect) {
      this.userProfile.behaviorData.userFeedback.correct++;
    } else {
      this.userProfile.behaviorData.userFeedback.incorrect++;
      this.userProfile.behaviorData.falsePositives++;
    }

    // Recalculate vulnerability score
    this.userProfile.vulnerabilityScore = this.calculateVulnerabilityScore();
    await this.saveUserProfile();
  }

  /**
   * Update alert preferences
   */
  async updateAlertPreferences(preferences: Partial<AlertPreferences>): Promise<void> {
    if (!this.userProfile) return;

    this.userProfile.alertPreferences = {
      ...this.userProfile.alertPreferences,
      ...preferences
    };

    await this.saveUserProfile();
  }

  /**
   * Get current user profile
   */
  getUserProfile(): UserProfile | null {
    return this.userProfile;
  }
}

export const adaptiveSecuritySystem = AdaptiveSecuritySystem.getInstance();