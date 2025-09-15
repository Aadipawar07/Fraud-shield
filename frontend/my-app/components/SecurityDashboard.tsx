import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adaptiveSecuritySystem, UserProfile } from '../utils/adaptiveAlerts';
import { getLocalizedTips } from '../utils/multilingualDetection';

const { width } = Dimensions.get('window');

interface ThreatTrend {
  type: string;
  count: number;
  change: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface SecurityTip {
  id: string;
  title: string;
  description: string;
  category: 'PHISHING' | 'SOCIAL_ENGINEERING' | 'FINANCIAL' | 'GENERAL';
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  isPersonalized: boolean;
}

export default function SecurityDashboard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'trends' | 'education' | 'tips'>('overview');
  const [threatTrends, setThreatTrends] = useState<ThreatTrend[]>([]);
  const [personalizedTips, setPersonalizedTips] = useState<SecurityTip[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load user profile
      const profile = await adaptiveSecuritySystem.initializeUserProfile('user123');
      setUserProfile(profile);

      // Load threat trends
      setThreatTrends(generateThreatTrends(profile));

      // Load personalized tips
      setPersonalizedTips(generatePersonalizedSecurityTips(profile));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const generateThreatTrends = (profile: UserProfile): ThreatTrend[] => {
    const commonThreats = profile.behaviorData.commonThreats;
    
    return [
      {
        type: 'Phishing URLs',
        count: 245,
        change: 15,
        severity: 'HIGH'
      },
      {
        type: 'Social Engineering',
        count: 189,
        change: 23,
        severity: 'CRITICAL'
      },
      {
        type: 'Financial Scams',
        count: 312,
        change: -8,
        severity: 'HIGH'
      },
      {
        type: 'Prize/Lottery Scams',
        count: 156,
        change: 42,
        severity: 'MEDIUM'
      },
      {
        type: 'Authority Impersonation',
        count: 98,
        change: 67,
        severity: 'CRITICAL'
      }
    ];
  };

  const generatePersonalizedSecurityTips = (profile: UserProfile): SecurityTip[] => {
    const tips: SecurityTip[] = [
      {
        id: '1',
        title: 'Recognize Urgency Tactics',
        description: 'Scammers create false urgency. Take time to verify before acting.',
        category: 'SOCIAL_ENGINEERING',
        difficulty: 'BEGINNER',
        isPersonalized: profile.behaviorData.commonThreats.includes('URGENT_ACTION')
      },
      {
        id: '2',
        title: 'Verify Bank Communications',
        description: 'Banks never ask for OTP, PIN, or passwords via SMS. Always call official numbers.',
        category: 'FINANCIAL',
        difficulty: 'BEGINNER',
        isPersonalized: profile.behaviorData.commonThreats.includes('FINANCIAL')
      },
      {
        id: '3',
        title: 'Spot Authority Impersonation',
        description: 'Government officials don\'t threaten arrest via SMS. Verify through official channels.',
        category: 'SOCIAL_ENGINEERING',
        difficulty: 'INTERMEDIATE',
        isPersonalized: profile.behaviorData.commonThreats.includes('AUTHORITY_EXPLOITATION')
      },
      {
        id: '4',
        title: 'URL Safety Check',
        description: 'Hover over links to see actual destination. Be wary of shortened URLs.',
        category: 'PHISHING',
        difficulty: 'INTERMEDIATE',
        isPersonalized: profile.behaviorData.commonThreats.includes('SUSPICIOUS_URLS')
      },
      {
        id: '5',
        title: 'Multi-factor Authentication',
        description: 'Enable 2FA on all important accounts. This prevents unauthorized access even if passwords are compromised.',
        category: 'GENERAL',
        difficulty: 'ADVANCED',
        isPersonalized: false
      }
    ];

    return tips.sort((a, b) => {
      if (a.isPersonalized && !b.isPersonalized) return -1;
      if (!a.isPersonalized && b.isPersonalized) return 1;
      return 0;
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return '#4CAF50';
      case 'MEDIUM': return '#FF9800';
      case 'HIGH': return '#FF5722';
      case 'CRITICAL': return '#D32F2F';
      default: return '#9E9E9E';
    }
  };

  const getThreatIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'phishing urls': return 'link';
      case 'social engineering': return 'people';
      case 'financial scams': return 'card';
      case 'prize/lottery scams': return 'gift';
      case 'authority impersonation': return 'shield';
      default: return 'warning';
    }
  };

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Risk Assessment Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Security Profile</Text>
        {userProfile && (
          <>
            <View style={styles.riskIndicator}>
              <View style={[styles.riskBadge, { backgroundColor: getRiskColor(userProfile.riskLevel) }]}>
                <Text style={styles.riskText}>{userProfile.riskLevel} RISK</Text>
              </View>
              <Text style={styles.vulnerabilityScore}>
                Vulnerability Score: {userProfile.vulnerabilityScore}/100
              </Text>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userProfile.behaviorData.totalMessagesAnalyzed}</Text>
                <Text style={styles.statLabel}>Messages Analyzed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userProfile.behaviorData.fraudDetected}</Text>
                <Text style={styles.statLabel}>Threats Blocked</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {Math.round((userProfile.behaviorData.userFeedback.correct / Math.max(1, userProfile.behaviorData.userFeedback.correct + userProfile.behaviorData.userFeedback.incorrect)) * 100)}%
                </Text>
                <Text style={styles.statLabel}>Accuracy Rate</Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Recent Threats */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Threat Activity</Text>
        {userProfile?.behaviorData.commonThreats.slice(0, 3).map((threat, index) => (
          <View key={index} style={styles.threatItem}>
            <Ionicons name="warning" size={20} color="#FF5722" />
            <Text style={styles.threatText}>{threat.replace(/_/g, ' ')}</Text>
            <Text style={styles.threatFrequency}>Common</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="scan" size={24} color="#2196F3" />
            <Text style={styles.actionText}>Scan Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="school" size={24} color="#4CAF50" />
            <Text style={styles.actionText}>Learn More</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="settings" size={24} color="#9E9E9E" />
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderTrendsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Current Threat Landscape</Text>
      <Text style={styles.sectionSubtitle}>Stay informed about emerging threats</Text>
      
      {threatTrends.map((trend, index) => (
        <View key={index} style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <Ionicons name={getThreatIcon(trend.type) as any} size={24} color={getRiskColor(trend.severity)} />
            <View style={styles.trendInfo}>
              <Text style={styles.trendType}>{trend.type}</Text>
              <Text style={[styles.trendSeverity, { color: getRiskColor(trend.severity) }]}>
                {trend.severity} RISK
              </Text>
            </View>
            <View style={styles.trendStats}>
              <Text style={styles.trendCount}>{trend.count}</Text>
              <Text style={[styles.trendChange, { color: trend.change > 0 ? '#FF5722' : '#4CAF50' }]}>
                {trend.change > 0 ? '+' : ''}{trend.change}%
              </Text>
            </View>
          </View>
        </View>
      ))}

      <View style={styles.insightCard}>
        <Text style={styles.insightTitle}>🔍 Threat Intelligence Insight</Text>
        <Text style={styles.insightText}>
          Social engineering attacks have increased by 67% this month, with scammers using more sophisticated 
          authority impersonation tactics. Stay vigilant and always verify through official channels.
        </Text>
      </View>
    </ScrollView>
  );

  const renderEducationTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Security Education</Text>
      <Text style={styles.sectionSubtitle}>Learn how to protect yourself</Text>

      {/* Educational Categories */}
      <View style={styles.educationGrid}>
        <TouchableOpacity style={[styles.educationCard, { backgroundColor: '#E3F2FD' }]}>
          <Ionicons name="link" size={32} color="#2196F3" />
          <Text style={styles.educationTitle}>Phishing Detection</Text>
          <Text style={styles.educationDesc}>Learn to identify suspicious links and emails</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.educationCard, { backgroundColor: '#F3E5F5' }]}>
          <Ionicons name="people" size={32} color="#9C27B0" />
          <Text style={styles.educationTitle}>Social Engineering</Text>
          <Text style={styles.educationDesc}>Understand psychological manipulation tactics</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.educationCard, { backgroundColor: '#E8F5E8' }]}>
          <Ionicons name="card" size={32} color="#4CAF50" />
          <Text style={styles.educationTitle}>Financial Security</Text>
          <Text style={styles.educationDesc}>Protect your money and banking information</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.educationCard, { backgroundColor: '#FFF3E0' }]}>
          <Ionicons name="shield-checkmark" size={32} color="#FF9800" />
          <Text style={styles.educationTitle}>Digital Safety</Text>
          <Text style={styles.educationDesc}>General cybersecurity best practices</Text>
        </TouchableOpacity>
      </View>

      {/* Interactive Quiz */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🧠 Security Knowledge Quiz</Text>
        <Text style={styles.quizDescription}>
          Test your ability to identify fraud patterns with real-world examples
        </Text>
        <TouchableOpacity style={styles.quizButton}>
          <Text style={styles.quizButtonText}>Start Quiz</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderTipsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Personalized Security Tips</Text>
      <Text style={styles.sectionSubtitle}>Based on your risk profile and behavior</Text>

      {personalizedTips.map((tip) => (
        <View key={tip.id} style={[styles.tipCard, tip.isPersonalized && styles.personalizedTip]}>
          {tip.isPersonalized && (
            <View style={styles.personalizedBadge}>
              <Ionicons name="person" size={16} color="white" />
              <Text style={styles.personalizedText}>For You</Text>
            </View>
          )}
          
          <View style={styles.tipHeader}>
            <Text style={styles.tipTitle}>{tip.title}</Text>
            <View style={[styles.difficultyBadge, {
              backgroundColor: tip.difficulty === 'BEGINNER' ? '#4CAF50' : 
                              tip.difficulty === 'INTERMEDIATE' ? '#FF9800' : '#FF5722'
            }]}>
              <Text style={styles.difficultyText}>{tip.difficulty}</Text>
            </View>
          </View>
          
          <Text style={styles.tipDescription}>{tip.description}</Text>
          
          <View style={styles.tipFooter}>
            <Text style={styles.tipCategory}>{tip.category.replace(/_/g, ' ')}</Text>
            <TouchableOpacity style={styles.learnMoreButton}>
              <Text style={styles.learnMoreText}>Learn More</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Localized Tips */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌍 Safety Tips in Your Language</Text>
        {getLocalizedTips('en').map((tip, index) => (
          <Text key={index} style={styles.localizedTip}>{tip}</Text>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Security Dashboard</Text>
        <TouchableOpacity style={styles.alertButton}>
          <Ionicons name="notifications" size={24} color="#2196F3" />
          {userProfile?.behaviorData.fraudDetected && userProfile.behaviorData.fraudDetected > 0 && (
            <View style={styles.alertBadge}>
              <Text style={styles.alertBadgeText}>{userProfile.behaviorData.fraudDetected}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        {[
          { key: 'overview', label: 'Overview', icon: 'home' },
          { key: 'trends', label: 'Trends', icon: 'trending-up' },
          { key: 'education', label: 'Learn', icon: 'school' },
          { key: 'tips', label: 'Tips', icon: 'bulb' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={selectedTab === tab.key ? '#2196F3' : '#9E9E9E'} 
            />
            <Text style={[styles.tabLabel, selectedTab === tab.key && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {selectedTab === 'overview' && renderOverviewTab()}
      {selectedTab === 'trends' && renderTrendsTab()}
      {selectedTab === 'education' && renderEducationTab()}
      {selectedTab === 'tips' && renderTipsTab()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  alertButton: {
    position: 'relative',
  },
  alertBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF5722',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabBar: {
    backgroundColor: 'white',
    flexDirection: 'row',
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#9E9E9E',
  },
  activeTabLabel: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  riskIndicator: {
    alignItems: 'center',
    marginBottom: 16,
  },
  riskBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  riskText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  vulnerabilityScore: {
    fontSize: 16,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  threatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  threatText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
  },
  threatFrequency: {
    fontSize: 12,
    color: '#FF5722',
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
  },
  actionText: {
    fontSize: 12,
    marginTop: 8,
    color: '#333',
  },
  trendCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trendType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  trendSeverity: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  trendStats: {
    alignItems: 'flex-end',
  },
  trendCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  trendChange: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  insightCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  educationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  educationCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  educationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  educationDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  quizDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  quizButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  quizButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginRight: 8,
  },
  tipCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  personalizedTip: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  personalizedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  personalizedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tipDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  tipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipCategory: {
    fontSize: 12,
    color: '#9E9E9E',
    textTransform: 'uppercase',
  },
  learnMoreButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
  },
  learnMoreText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: 'bold',
  },
  localizedTip: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
});