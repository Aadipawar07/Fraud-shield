import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { getLearningContent } from "../../services/learningService";

// Helper function to get the right image based on article ID
const getArticleImage = (id: string) => {
  // Map article IDs to their corresponding image files
  switch(id) {
    case 'a1':
      return require('../../assets/images/articles/article-1.png');
    case 'a2':
      return require('../../assets/images/articles/article-2.png');
    case 'a3':
      return require('../../assets/images/articles/article-3.png');
    case 'a4':
      return require('../../assets/images/articles/article-4.png');
    case 'a5':
      return require('../../assets/images/articles/article-5.png');
    default:
      // Default image if no match
      return require('../../assets/images/articles/article-1.png');
  }
};

// Types for learning content
interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "free" | "paid";
  provider: string;
  readTime: string;
  imageUrl: string;
  link: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "free" | "paid";
  provider: string;
  duration: string;
  imageUrl: string;
  link: string;
}

// Define ScamQuest interfaces
interface ScamLevel {
  id: string;
  title: string;
  description: string;
  status: "locked" | "in_progress" | "completed";
  points: number;
  badge?: string;
  color: string;
  category: string;
}

interface UserProgress {
  totalPoints: number;
  badges: string[];
  completedLevels: string[];
  currentLevel: string;
}

export default function LearningScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"articles" | "courses" | "scamquest">("articles");
  const [articles, setArticles] = useState<Article[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [scamLevels, setScamLevels] = useState<ScamLevel[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalPoints: 0,
    badges: [],
    completedLevels: [],
    currentLevel: 'l1',
  });
  
  // Fetch learning content
  useEffect(() => {
    const content = getLearningContent();
    setArticles(content.articles);
    setCourses(content.courses);
    
    // Categories section has been removed
    
    // Initialize Scam Quest levels
    setScamLevels([
      {
        id: 'l1',
        title: 'Fake Advisor',
        description: 'Learn to identify fake financial advisors and their tactics',
        status: 'in_progress',
        points: 100,
        badge: 'Fraud Hunter 🕵️',
        color: '#FF6B6B',
        category: 'Investment Scams',
      },
      {
        id: 'l2',
        title: 'Ponzi Trap',
        description: 'Understand how Ponzi schemes work and how to avoid them',
        status: 'locked',
        points: 150,
        badge: 'Scam Shield 🛡️',
        color: '#4ECDC4',
        category: 'Investment Scams',
      },
      {
        id: 'l3',
        title: 'Phishing SMS',
        description: 'Identify and protect yourself from SMS phishing attempts',
        status: 'locked',
        points: 200,
        badge: 'Digital Guardian 🔒',
        color: '#FFD166',
        category: 'Digital Fraud',
      },
      {
        id: 'l4',
        title: 'KYC Fraud',
        description: 'Learn about KYC fraud and how to keep your identity safe',
        status: 'locked',
        points: 250,
        badge: 'Identity Protector 🔐',
        color: '#06D6A0',
        category: 'Identity Theft',
      },
      {
        id: 'l5',
        title: 'ATM Scams',
        description: 'Protect yourself from common ATM and card scams',
        status: 'locked',
        points: 300,
        badge: 'Security Master 🏆',
        color: '#118AB2',
        category: 'Card Fraud',
      },
    ]);
    
    // Initialize user progress data with zero points
    setUserProgress({
      totalPoints: 0,
      badges: [],
      completedLevels: [],
      currentLevel: 'l1',
    });
  }, []);
  
  // Add function to update points when completing a level
  const completeLevel = (levelId: string) => {
    // Find the level that was completed
    const completedLevel = scamLevels.find(level => level.id === levelId);
    
    if (completedLevel && !userProgress.completedLevels.includes(levelId)) {
      // Update the level status to completed
      const updatedLevels = scamLevels.map(level => {
        if (level.id === levelId) {
          return { ...level, status: 'completed' as const };
        } else if (level.id === `l${parseInt(levelId.substring(1)) + 1}`) {
          // Unlock the next level
          return { ...level, status: 'in_progress' as const };
        }
        return level;
      });
      
      setScamLevels(updatedLevels);
      
      // Add points
      const newTotalPoints = userProgress.totalPoints + (completedLevel?.points || 0);
      
      // Check if user earned a new badge
      let newBadges = [...userProgress.badges];
      if (completedLevel?.badge && !newBadges.includes(completedLevel.badge)) {
        newBadges.push(completedLevel.badge);
      }
      
      // Update user progress
      setUserProgress({
        ...userProgress,
        totalPoints: newTotalPoints,
        badges: newBadges,
        completedLevels: [...userProgress.completedLevels, levelId],
        currentLevel: `l${parseInt(levelId.substring(1)) + 1}`,
      });
    }
  };

  // Use all content directly since we removed the category filters
  const filteredArticles = articles;
  const filteredCourses = courses;
  const filteredScamLevels = scamLevels;

  // Render an article card
  const renderArticleCard = ({ item }: { item: Article }) => (
    <TouchableOpacity
      style={styles.contentCard}
      onPress={() => {
        // Using the proper format for dynamic routes in Expo Router
        router.navigate(`/learning/article/${item.id}`);
      }}
    >
      <View style={styles.cardHeader}>
        <Image 
          source={getArticleImage(item.id)}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.cardBadge}>
          <Text style={styles.cardBadgeText}>{item.type}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.cardMeta}>
          <Text style={styles.cardProvider}>{item.provider}</Text>
          <Text style={styles.cardReadTime}>• {item.readTime} read</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render a course card
  const renderCourseCard = ({ item }: { item: Course }) => (
    <TouchableOpacity
      style={styles.contentCard}
      onPress={() => {
        // Using the proper format for dynamic routes in Expo Router
        router.navigate(`/learning/course/${item.id}`);
      }}
    >
      <View style={styles.cardHeader}>
        {/* Since we don't have course images yet, use a placeholder */}
        <View style={[styles.cardImage, styles.placeholderImage]}>
          <MaterialIcons name="school" size={30} color="#a1a1aa" />
        </View>
        <View 
          style={[
            styles.cardBadge, 
            item.type === 'paid' ? styles.paidBadge : styles.freeBadge
          ]}
        >
          <Text 
            style={[
              styles.cardBadgeText,
              item.type === 'paid' ? styles.paidBadgeText : styles.freeBadgeText
            ]}
          >
            {item.type}
          </Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.cardMeta}>
          <Text style={styles.cardProvider}>{item.provider}</Text>
          <Text style={styles.cardReadTime}>• {item.duration}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  // Render a Scam Quest level card
  const renderScamLevelCard = ({ item }: { item: ScamLevel }) => {
    // Determine the status icon
    let statusIcon: any;
    let statusColor: string;
    
    switch(item.status) {
      case 'completed':
        statusIcon = "check-circle";
        statusColor = "#16a34a";
        break;
      case 'in_progress':
        statusIcon = "play-circle-outline";
        statusColor = "#ea580c";
        break;
      case 'locked':
        statusIcon = "lock";
        statusColor = "#64748b";
        break;
    }
    
    return (
      <View
        style={[styles.scamLevelCard, { borderColor: item.color }]}
      >
        <View style={[styles.scamLevelHeader, { backgroundColor: item.color }]}>
          <Text style={styles.scamLevelTitle}>{item.title}</Text>
          <MaterialIcons name={statusIcon} size={24} color={statusColor} />
        </View>
        <View style={styles.scamLevelBody}>
          <Text style={styles.scamLevelDescription}>{item.description}</Text>
          <View style={styles.scamLevelMeta}>
            <View style={styles.pointsBadge}>
              <MaterialIcons name="stars" size={16} color="#f59e0b" />
              <Text style={styles.pointsText}>{item.points} pts</Text>
            </View>
            {item.badge && (
              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.scamLevelFooter}>
          <Text style={styles.scamLevelStatus}>
            {item.status === 'completed' ? 'Completed' : 
             item.status === 'in_progress' ? 'In Progress' : 'Locked'}
          </Text>
        </View>
      </View>
    );
  };

  // Render a Scam Quest progress dashboard
  const renderScamQuestProgress = () => (
    <View style={styles.progressDashboard}>
      <View style={styles.progressHeader}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressTitle}>Your Progress</Text>
          <View style={styles.pointsContainer}>
            <MaterialIcons name="stars" size={18} color="#f59e0b" />
            <Text style={styles.totalPoints}>{userProgress.totalPoints} Points</Text>
          </View>
        </View>
      </View>
      <View style={styles.overallProgressContainer}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${(userProgress.totalPoints / 1000) * 100}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>Beginner</Text>
          <Text style={styles.progressLabel}>Intermediate</Text>
          <Text style={styles.progressLabel}>Expert</Text>
        </View>
      </View>
      
      {/* Badge Collection Section */}
      {userProgress.badges.length > 0 ? (
        <View style={styles.badgesSection}>
          <Text style={styles.badgesSectionTitle}>Your Badges</Text>
          <View style={styles.badgesList}>
            {userProgress.badges.map((badge, index) => (
              <View key={index} style={styles.badgeCard}>
                <Text style={styles.badgeCardEmoji}>{badge.split(' ')[1]}</Text>
                <Text style={styles.badgeCardName}>{badge.split(' ')[0]}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.noBadgesContainer}>
          <MaterialIcons name="emoji-events" size={48} color="#cbd5e1" />
          <Text style={styles.noBadgesText}>Complete levels to earn badges</Text>
        </View>
      )}
    </View>
  );
  
  // Render the language switcher
  const renderLanguageSwitcher = () => (
    <View style={styles.languageSwitcher}>
      <TouchableOpacity style={[styles.languageButton, styles.languageButtonActive]}>
        <Text style={[styles.languageButtonText, styles.languageButtonTextActive]}>English</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.languageButton}>
        <Text style={styles.languageButtonText}>हिंदी</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.languageButton}>
        <Text style={styles.languageButtonText}>मराठी</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learning Center</Text>
        {renderLanguageSwitcher()}
      </View>

      {/* Shared Progress Bar */}
      <View style={styles.sharedProgressContainer}>
        <View style={styles.sharedProgressBar}>
          <View style={[styles.sharedProgressFill, { width: '35%' }]} />
        </View>
        <Text style={styles.sharedProgressText}>35% Complete</Text>
      </View>

      {/* Content Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "articles" && styles.activeTab]}
          onPress={() => setActiveTab("articles")}
        >
          <Text style={[styles.tabText, activeTab === "articles" && styles.activeTabText]}>
            Articles
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "courses" && styles.activeTab]}
          onPress={() => setActiveTab("courses")}
        >
          <Text style={[styles.tabText, activeTab === "courses" && styles.activeTabText]}>
            Courses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab, 
            activeTab === "scamquest" && styles.activeTab,
            styles.scamQuestTab
          ]}
          onPress={() => setActiveTab("scamquest")}
        >
          <Text style={[
            styles.tabText, 
            activeTab === "scamquest" && styles.activeTabText,
            styles.scamQuestTabText
          ]}>
            Scam Quest
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content List */}
      {activeTab === "articles" ? (
        <FlatList
          data={filteredArticles}
          renderItem={renderArticleCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => (
            <TouchableOpacity
              style={styles.miniQuizCard}
              onPress={() => setActiveTab("scamquest")}
            >
              <View style={styles.miniQuizIcon}>
                <MaterialIcons name="quiz" size={24} color="#fff" />
              </View>
              <View style={styles.miniQuizContent}>
                <Text style={styles.miniQuizTitle}>Test your knowledge!</Text>
                <Text style={styles.miniQuizDescription}>
                  Take a quick quiz based on what you've learned
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#4f46e5" />
            </TouchableOpacity>
          )}
        />
      ) : activeTab === "courses" ? (
        <FlatList
          data={filteredCourses}
          renderItem={renderCourseCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => (
            <TouchableOpacity
              style={styles.miniQuizCard}
              onPress={() => setActiveTab("scamquest")}
            >
              <View style={styles.miniQuizIcon}>
                <MaterialIcons name="quiz" size={24} color="#fff" />
              </View>
              <View style={styles.miniQuizContent}>
                <Text style={styles.miniQuizTitle}>Apply your learning!</Text>
                <Text style={styles.miniQuizDescription}>
                  Complete challenges based on course materials
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#4f46e5" />
            </TouchableOpacity>
          )}
        />
      ) : (
        // Scam Quest View
        <ScrollView 
          style={styles.scamQuestContainer}
          contentContainerStyle={styles.scamQuestContent}
          showsVerticalScrollIndicator={false}
        >
          {renderScamQuestProgress()}
          
          <Text style={styles.sectionTitle}>Challenge Map</Text>
          
          <View style={styles.levelMapContainer}>
            {scamLevels.map((level, index) => (
              <View key={level.id} style={styles.levelMapItem}>
                {index > 0 && (
                  <View 
                    style={[
                      styles.levelConnector,
                      level.status !== 'locked' ? styles.activeConnector : {}
                    ]} 
                  />
                )}
                <View 
                  style={[
                    styles.levelDot,
                    level.status === 'completed' ? styles.completedDot : 
                    level.status === 'in_progress' ? styles.inProgressDot : styles.lockedDot
                  ]}
                >
                  <Text style={styles.levelNumber}>{index + 1}</Text>
                </View>
              </View>
            ))}
          </View>
          
          <Text style={styles.sectionTitle}>Available Levels</Text>
          
          {filteredScamLevels.map(level => (
            <TouchableOpacity 
              key={level.id}
              disabled={level.status === 'locked'}
              onPress={() => {
                if (level.status !== 'locked') {
                  // This simulates completing a level when clicked for demo purposes
                  // In a real app, you'd complete the level after quiz completion
                  // For now, we'll add a simple dialog to demonstrate points adding
                  if (level.status === 'in_progress') {
                    completeLevel(level.id);
                  }
                  
                  router.push({
                    pathname: '/learning/quest/[id]',
                    params: { id: level.id }
                  });
                }
              }}
            >
              {renderScamLevelCard({ item: level })}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  // Language switcher styles
  languageSwitcher: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    overflow: "hidden",
  },
  languageButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  languageButtonActive: {
    backgroundColor: "#4f46e5",
  },
  languageButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
  },
  languageButtonTextActive: {
    color: "#fff",
  },
  
  // Shared progress bar
  sharedProgressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  sharedProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    marginRight: 12,
    overflow: "hidden",
  },
  sharedProgressFill: {
    height: 6,
    backgroundColor: "#4f46e5",
    borderRadius: 3,
  },
  sharedProgressText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4f46e5",
  },
  // Category styles removed but keeping empty definitions for compatibility
  categoryContainer: {
    display: 'none',
  },
  categoryButton: {
    display: 'none',
  },
  categoryButtonActive: {
    display: 'none',
  },
  categoryButtonText: {
    display: 'none',
  },
  categoryButtonTextActive: {
    display: 'none',
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#fff",
    height: 52, // Fixed height for consistency
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center", // Center content vertically
    height: "100%", // Full height of container
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#4f46e5",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
  },
  activeTabText: {
    color: "#4f46e5",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  contentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    position: "relative",
  },
  cardImage: {
    height: 160,
    width: "100%",
    backgroundColor: "#f1f5f9",
    resizeMode: "cover",
  },
  placeholderImage: {
    alignItems: "center",
    justifyContent: "center",
  },
  cardBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#4f46e5",
  },
  freeBadge: {
    backgroundColor: "#15803d",
  },
  paidBadge: {
    backgroundColor: "#0369a1",
  },
  cardBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  freeBadgeText: {
    color: "#fff",
  },
  paidBadgeText: {
    color: "#fff",
  },
  cardBody: {
    padding: 16,
  },
  cardCategory: {
    display: 'none',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 12,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardProvider: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  cardReadTime: {
    fontSize: 13,
    color: "#64748b",
    marginLeft: 4,
  },
  
  // ScamQuest tab styling
  scamQuestTab: {
    backgroundColor: "#fff0e5",
    borderRadius: 0, // Remove border radius for consistency
    marginHorizontal: 0, // Remove margin for consistency
    shadowColor: "transparent", // Remove shadow for consistency
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  scamQuestTabText: {
    color: "#ea580c",
    fontWeight: "700",
  },
  
  // ScamQuest container and content
  scamQuestContainer: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  scamQuestContent: {
    padding: 16,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 24,
    marginBottom: 16,
  },
  
  // Progress dashboard
  progressDashboard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalPoints: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f59e0b",
    marginLeft: 6,
  },
  progressBadges: {
    flexDirection: "row",
  },
  badgeItem: {
    marginLeft: 8,
  },
  badgeEmoji: {
    fontSize: 20,
  },
  overallProgressContainer: {
    marginTop: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#4f46e5",
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  
  // Level Map
  levelMapContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  levelMapItem: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    flex: 1,
    zIndex: 1,
  },
  levelConnector: {
    height: 3,
    backgroundColor: "#e2e8f0",
    flex: 1,
    marginHorizontal: -4,
  },
  activeConnector: {
    backgroundColor: "#4f46e5",
  },
  levelDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#fff",
    zIndex: 2,
  },
  completedDot: {
    backgroundColor: "#16a34a",
  },
  inProgressDot: {
    backgroundColor: "#ea580c",
  },
  lockedDot: {
    backgroundColor: "#cbd5e1",
  },
  levelNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  
  // Scam Level Cards
  scamLevelCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
    borderLeftWidth: 5,
    transform: [{ translateY: 0 }], // Added for animation capability
  },
  scamLevelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  scamLevelTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scamLevelBody: {
    padding: 16,
  },
  scamLevelCategory: {
    display: 'none',
  },
  scamLevelDescription: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 12,
  },
  scamLevelMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#f59e0b",
    marginLeft: 4,
  },
  badgePill: {
    backgroundColor: "#f3e8ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9333ea",
  },
  scamLevelFooter: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    padding: 12,
    alignItems: "center",
  },
  scamLevelStatus: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
  },
  
  // Mini Quiz Card
  miniQuizCard: {
    backgroundColor: "#eef2ff",
    borderRadius: 16,
    padding: 18,
    marginTop: 24,
    marginBottom: 16,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    flexDirection: "row",
    alignItems: "center",
    borderLeftWidth: 4,
    borderLeftColor: "#4f46e5",
  },
  miniQuizIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  miniQuizContent: {
    flex: 1,
  },
  miniQuizTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  miniQuizDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  
  // Badge section styles
  badgesSection: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  badgesSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
  },
  badgesList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  badgeCard: {
    width: 80,
    height: 100,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    margin: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  badgeCardEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeCardName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    textAlign: "center",
  },
  noBadgesContainer: {
    marginTop: 20,
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  noBadgesText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
    color: "#94a3b8",
  },
});
