import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { getLearningContent } from "../../services/learningService";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { educationalResources } from '../services/educationalResources';
import { ThemedText } from "../../components/ThemedText";
import { Card, TouchableCard } from "../../components/Card";
import { ThemedView } from "../../components/ThemedView";
import Button from "../../components/Button";
import { Spacing } from "../../constants/Spacing";
import { BorderRadius, Shadow } from "../../constants/Shape";
import { useTheme } from "../../context/ThemeContext";
import { useThemeColor } from "../../hooks/useThemeColor";



// Types for learning content

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
  const { activeTab: initialTab } = useLocalSearchParams<{ activeTab?: string }>();
  const [activeTab, setActiveTab] = useState<"courses" | "scamquest" | "resources">(
    initialTab === "scamquest" ? "scamquest" : (initialTab === "resources" ? "resources" : "courses")
  );
  const [courses, setCourses] = useState<Course[]>([]);
  const [scamLevels, setScamLevels] = useState<ScamLevel[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalPoints: 0,
    badges: [],
    completedLevels: [],
    currentLevel: 'l1',
  });
  
  // Theme colors
  const { colorScheme } = useTheme();
  const primaryColor = useThemeColor({}, "tint");
  const successColor = useThemeColor({}, "success");
  const warningColor = useThemeColor({}, "warning");
  const dangerColor = useThemeColor({}, "danger");
  const neutralColor = useThemeColor({}, "textSecondary");
  const backgroundColor = useThemeColor({}, "background");
  
  // Fetch learning content
  // Extract loadUserProgress function to make it reusable
  const loadUserProgress = async () => {
    try {
      const savedProgress = await AsyncStorage.getItem('USER_PROGRESS');
      if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress);
        console.log("Loaded user progress from storage:", parsedProgress);
        setUserProgress(parsedProgress);
      }
    } catch (error) {
      console.error("Error loading user progress:", error);
    }
  };

  useEffect(() => {
    const content = getLearningContent();
    setCourses(content.courses);
    
    // Load user progress from AsyncStorage
    loadUserProgress();
    
    // Categories section has been removed
    
    // Get scam levels - defining the default levels
    const mockLevels: ScamLevel[] = [
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
    ];
    
    // Initialize and then update levels based on user progress
    const loadScamLevels = async () => {
      try {
        const savedProgress = await AsyncStorage.getItem('USER_PROGRESS');
        if (savedProgress) {
          const parsedProgress = JSON.parse(savedProgress);
          console.log("Loading progress:", parsedProgress);
          
          // Make sure we have valid data
          if (!parsedProgress.completedLevels || !Array.isArray(parsedProgress.completedLevels)) {
            console.log("Invalid or missing completedLevels, using default levels");
            setScamLevels(mockLevels as ScamLevel[]);
            return;
          }
          
          // Update level status based on completed levels
          const updatedLevels = mockLevels.map((level, index) => {
            // Only mark as completed if explicitly in the completedLevels array
            if (parsedProgress.completedLevels.includes(level.id)) {
              return { ...level, status: 'completed' as const };
            } 
            // Only the current level should be in_progress
            else if (level.id === parsedProgress.currentLevel) {
              return { ...level, status: 'in_progress' as const };
            } 
            // Previous levels that aren't marked completed should be unlocked
            else if (index < parseInt(parsedProgress.currentLevel.substring(1)) - 1) {
              return { ...level, status: 'in_progress' as const };
            }
            // All other levels remain locked
            else {
              return { ...level, status: 'locked' as const };
            }
          });
          
          console.log("Updated levels:", updatedLevels.map(l => `${l.id}: ${l.status}`).join(', '));
          setScamLevels(updatedLevels as ScamLevel[]);
        } else {
          // Default initialization - only first level is unlocked
          setScamLevels(mockLevels.map((level, index) => ({
            ...level,
            status: index === 0 ? 'in_progress' as const : 'locked' as const
          })) as ScamLevel[]);
        }
      } catch (error) {
        console.error("Error loading scam levels:", error);
        setScamLevels(mockLevels as ScamLevel[]);
      }
    };
    
    loadScamLevels();
    
    // User progress is now loaded from AsyncStorage in the earlier useEffect
    // This is just a fallback in case no saved progress is found
  }, []);
  
  // Add function to update points when completing a level
  const completeLevel = async (levelId: string) => {
    console.log("Completing level:", levelId);
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
      
      // Try to get stored points from AsyncStorage
      let pointsToAdd = completedLevel?.points || 0;
      let newTotalPoints = userProgress.totalPoints + pointsToAdd;
      
      try {
        const pointsData = await AsyncStorage.getItem('LEVEL_POINTS');
        if (pointsData) {
          const parsedData = JSON.parse(pointsData);
          if (parsedData.levelId === levelId) {
            // Use the points from the quiz completion
            pointsToAdd = parsedData.points;
            
            // If we have a totalPoints value, use it directly instead of calculating
            if (parsedData.totalPoints) {
              newTotalPoints = parsedData.totalPoints;
              console.log("Using total points from storage:", newTotalPoints);
            } else {
              // Fall back to calculation if no total provided
              newTotalPoints = userProgress.totalPoints + pointsToAdd;
            }
            
            console.log("Using points from storage:", pointsToAdd);
          }
        }
      } catch (error) {
        console.error("Error getting points data:", error);
      }
      
      console.log("Adding points:", pointsToAdd, "New total:", newTotalPoints);
      
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
      
      // Save to AsyncStorage for persistence
      try {
        await AsyncStorage.setItem('USER_PROGRESS', JSON.stringify({
          totalPoints: newTotalPoints,
          badges: newBadges,
          completedLevels: [...userProgress.completedLevels, levelId],
          currentLevel: `l${parseInt(levelId.substring(1)) + 1}`,
        }));
      } catch (error) {
        console.error("Error saving user progress:", error);
      }
    }
  };

  // Use all content directly since we removed the category filters
  const filteredCourses = courses;
  const filteredScamLevels = scamLevels;
  
  // Effect to complete the in-progress level when coming back from quiz completion
  // Add a refreshTrigger state to force progress bar updates
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  
  useEffect(() => {
    const checkQuizCompletion = async () => {
      if (activeTab === "scamquest") {
        try {
          // Check if there's a saved quiz completion
          const completionData = await AsyncStorage.getItem('QUIZ_COMPLETION');
          const pointsData = await AsyncStorage.getItem('LEVEL_POINTS');
          
          if (completionData && pointsData) {
            const completion = JSON.parse(completionData);
            const points = JSON.parse(pointsData);
            console.log("Found quiz completion data:", completion);
            console.log("Found points data:", points);
            
            // Clear the data so we don't process it again
            await AsyncStorage.removeItem('QUIZ_COMPLETION');
            await AsyncStorage.removeItem('LEVEL_POINTS');
            
            // Complete the level
            if (completion.completed && completion.levelId) {
              await completeLevel(completion.levelId);
              
              // Reload user progress to ensure latest data
              await loadUserProgress();
              
              // Force progress bar refresh after updating points
              setRefreshTrigger(prev => prev + 1);
            }
          } 
        } catch (error) {
          console.error("Error checking quiz completion:", error);
        }
      }
    };
    
    checkQuizCompletion();
  }, [activeTab]);



  // Define the Educational Resource type
  interface EducationalResource {
    id: string;
    title: string;
    category: string;
    readTime: string;
    content: string;
    imageUrl: string;
  }

  // Helper function to get resource image based on ID
  const getResourceImage = (id: string) => {
    // Map resource IDs to corresponding image files
    switch(id) {
      case 'article1':
        return require('../../assets/images/articles/article-1.png');
      case 'article2':
        return require('../../assets/images/articles/article-2.png');
      case 'article3':
        return require('../../assets/images/articles/article-3.png');
      case 'article4':
        return require('../../assets/images/articles/article-4.png');
      case 'article5':
        return require('../../assets/images/articles/article-5.png');
      default:
        // Default image if no match is found
        return require('../../assets/images/articles/article-1.png');
    }
  };

  // Render an educational resource card
  const renderResourceCard = ({ item }: { item: EducationalResource }) => (
    <TouchableOpacity
      style={styles.contentCard}
      onPress={() => {
        // Navigate to the article view with the resource ID
        router.navigate(`/learning/article/${item.id}`);
      }}
    >
      <View style={styles.cardHeader}>
        <Image 
          source={getResourceImage(item.id)}
          style={styles.cardImage}
          resizeMode="cover"
          defaultSource={require('../../assets/images/articles/article-1.png')}
        />
        <View style={styles.cardBadge}>
          <ThemedText style={styles.cardBadgeText}>Free</ThemedText>
        </View>
      </View>
      <View style={styles.cardBody}>
        <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.cardDescription} numberOfLines={2}>
          Educational resource with detailed information
        </ThemedText>
        <View style={styles.cardMeta}>
          <ThemedText style={styles.cardProvider}>{item.category}</ThemedText>
          <ThemedText style={styles.cardReadTime}>• {item.readTime} read</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render a course card
  // Helper function to get course image based on ID
  const getCourseImage = (id: string) => {
    // Map course IDs to corresponding image files
    switch(id) {
      case 'c1':
        return require('../../assets/images/articles/article-1.png');
      case 'c2':
        return require('../../assets/images/articles/article-2.png');
      case 'c3':
        return require('../../assets/images/articles/article-3.png');
      case 'c4':
        return require('../../assets/images/articles/article-4.png');
      case 'c5':
        return require('../../assets/images/articles/article-5.png');
      default:
        // Default image if no match is found
        return require('../../assets/images/articles/article-1.png');
    }
  };

  const renderCourseCard = ({ item }: { item: Course }) => (
    <TouchableOpacity
      style={styles.contentCard}
      onPress={() => {
        // Using the proper format for dynamic routes in Expo Router
        router.navigate(`/learning/course/${item.id}`);
      }}
    >
      <View style={styles.cardHeader}>
        <Image 
          source={getCourseImage(item.id)}
          style={styles.cardImage}
          resizeMode="cover"
          defaultSource={require('../../assets/images/articles/article-1.png')}
        />
        <View 
          style={[
            styles.cardBadge, 
            item.type === 'paid' ? styles.paidBadge : styles.freeBadge
          ]}
        >
          <ThemedText 
            style={[
              styles.cardBadgeText,
              item.type === 'paid' ? styles.paidBadgeText : styles.freeBadgeText
            ]}
          >
            {item.type}
          </ThemedText>
        </View>
      </View>
      <View style={styles.cardBody}>
        <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </ThemedText>
        <View style={styles.cardMeta}>
          <ThemedText style={styles.cardProvider}>{item.provider}</ThemedText>
          <ThemedText style={styles.cardReadTime}>• {item.duration}</ThemedText>
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
          <ThemedText style={styles.scamLevelTitle}>{item.title}</ThemedText>
          <MaterialIcons name={statusIcon} size={24} color={statusColor} />
        </View>
        <View style={styles.scamLevelBody}>
          <ThemedText style={styles.scamLevelDescription}>{item.description}</ThemedText>
          <View style={styles.scamLevelMeta}>
            <View style={styles.pointsBadge}>
              <MaterialIcons name="stars" size={16} color="#f59e0b" />
              <ThemedText style={styles.pointsText}>{item.points} pts</ThemedText>
            </View>
            {item.badge && (
              <View style={styles.badgePill}>
                <ThemedText style={styles.badgeText}>{item.badge}</ThemedText>
              </View>
            )}
          </View>
        </View>
        <View style={styles.scamLevelFooter}>
          <ThemedText style={styles.scamLevelStatus}>
            {item.status === 'completed' ? 'Completed' : 
             item.status === 'in_progress' ? 'In Progress' : 'Locked'}
          </ThemedText>
        </View>
      </View>
    );
  };

  // Function to reset progress (for testing purposes)
  const resetProgress = async () => {
    try {
      await AsyncStorage.removeItem('USER_PROGRESS');
      await AsyncStorage.removeItem('QUIZ_COMPLETION');
      await AsyncStorage.removeItem('LEVEL_POINTS');
      
      // Reset to initial state
      setUserProgress({
        totalPoints: 0,
        badges: [],
        completedLevels: [],
        currentLevel: 'l1',
      });
      
      // Reset levels
      setScamLevels(prev => prev.map((level, index) => ({
        ...level,
        status: index === 0 ? 'in_progress' as const : 'locked' as const
      })));
      
      console.log("Progress reset complete");
    } catch (error) {
      console.error("Error resetting progress:", error);
    }
  };
  
  // Render a Scam Quest progress dashboard
  const renderScamQuestProgress = () => (
    <View style={styles.progressDashboard}>
      <View style={styles.progressHeader}>
        <View style={styles.progressInfo}>
          <ThemedText style={styles.progressTitle}>Your Progress</ThemedText>
          <View style={styles.pointsContainer}>
            <MaterialIcons name="stars" size={18} color="#f59e0b" />
            <ThemedText style={styles.totalPoints}>{userProgress.totalPoints} Points</ThemedText>
          </View>
        </View>
        
        {/* Add reset button in dev mode */}
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={resetProgress}
        >
          <MaterialIcons name="refresh" size={16} color="#fff" />
          <ThemedText style={styles.resetButtonText}>Reset</ThemedText>
        </TouchableOpacity>
      </View>
      <View style={styles.overallProgressContainer}>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${Math.min((userProgress.totalPoints / 1000) * 100, 100)}%` }
            ]} 
            key={`progress-bar-${refreshTrigger.toString()}-${userProgress.totalPoints.toString()}`}
          />
        </View>
        <View style={styles.progressLabels}>
          <ThemedText style={styles.progressLabel}>Beginner</ThemedText>
          <ThemedText style={styles.progressLabel}>Intermediate</ThemedText>
          <ThemedText style={styles.progressLabel}>Expert</ThemedText>
        </View>
      </View>
      
      {/* Badge Collection Section */}
      {userProgress.badges.length > 0 ? (
        <View style={styles.badgesSection}>
          <ThemedText style={styles.badgesSectionTitle}>Your Badges</ThemedText>
          <View style={styles.badgesList}>
            {userProgress.badges.map((badge, index) => (
              <View key={index} style={styles.badgeCard}>
                <ThemedText style={styles.badgeCardEmoji}>{badge.split(' ')[1]}</ThemedText>
                <ThemedText style={styles.badgeCardName}>{badge.split(' ')[0]}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.noBadgesContainer}>
          <View style={styles.trophyIcon}>
            <MaterialIcons name="emoji-events" size={40} color="#cbd5e1" />
          </View>
          <ThemedText style={styles.noBadgesText}>Complete levels to earn badges</ThemedText>
        </View>
      )}
    </View>
  );
  
  // Render the language switcher
  const renderLanguageSwitcher = () => (
    <View style={styles.languageSwitcher}>
      <TouchableOpacity style={[styles.languageButton, styles.languageButtonActive]}>
        <ThemedText style={[styles.languageButtonText, styles.languageButtonTextActive]}>English</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity style={styles.languageButton}>
        <ThemedText style={styles.languageButtonText}>हिंदी</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity style={styles.languageButton}>
        <ThemedText style={styles.languageButtonText}>मराठी</ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor }]}>
      <ThemedView style={styles.centerTitleContainer}>
        <ThemedText variant="h2" style={styles.headerTitle}>Learning Center</ThemedText>
      </ThemedView>

      {/* Shared Progress Bar */}
      <ThemedView style={styles.sharedProgressContainer}>
        <View style={styles.sharedProgressBar}>
          <View 
            style={[
              styles.sharedProgressFill, 
              { width: `${Math.min((userProgress.totalPoints / 1000) * 100, 100)}%`, backgroundColor: primaryColor }
            ]} 
            key={`shared-progress-bar-${refreshTrigger.toString()}-${userProgress.totalPoints.toString()}`}
          />
        </View>
        <ThemedText variant="bodyMedium" style={[styles.sharedProgressText, { color: primaryColor }]}>
          {Math.min(Math.round((userProgress.totalPoints / 1000) * 100), 100)}% Complete
        </ThemedText>
      </ThemedView>

      {/* Content Tabs */}
      <ThemedView style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "courses" && styles.activeTab]}
          onPress={() => setActiveTab("courses")}
        >
          <View style={styles.tabInner}>
            <ThemedText 
              variant="button" 
              style={[styles.tabText, activeTab === "courses" && { color: primaryColor }]}
            >
              Courses
            </ThemedText>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "resources" && styles.activeTab]}
          onPress={() => setActiveTab("resources")}
        >
          <View style={styles.tabInner}>
            <ThemedText 
              variant="button" 
              style={[styles.tabText, activeTab === "resources" && { color: primaryColor }]}
            >
              Resources
            </ThemedText>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab, 
            styles.scamQuestTab,
            activeTab === "scamquest" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("scamquest")}
        >
          <View style={styles.tabInner}>
            <ThemedText 
              variant="button" 
              weight="semibold"
              style={[
                styles.tabText, 
                styles.scamQuestTabText,
              activeTab === "scamquest" && { color: primaryColor },
            ]}>
              Scam Quest
            </ThemedText>
          </View>
        </TouchableOpacity>
      </ThemedView>

      {/* Content List */}
      {activeTab === "courses" ? (
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
                <ThemedText style={styles.miniQuizTitle}>Apply your learning!</ThemedText>
                <ThemedText style={styles.miniQuizDescription}>
                  Complete challenges based on course materials
                </ThemedText>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#4f46e5" />
            </TouchableOpacity>
          )}
        />
      ) : activeTab === "resources" ? (
        <FlatList
          data={educationalResources}
          renderItem={renderResourceCard}
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
                <ThemedText style={styles.miniQuizTitle}>Test your knowledge!</ThemedText>
                <ThemedText style={styles.miniQuizDescription}>
                  Apply what you've learned from these resources
                </ThemedText>
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
          
          <ThemedText style={styles.sectionTitle}>Challenge Map</ThemedText>
          
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
                  <ThemedText style={styles.levelNumber}>{index + 1}</ThemedText>
                </View>
              </View>
            ))}
          </View>
          
          <ThemedText style={styles.sectionTitle}>Available Levels</ThemedText>
          
          {filteredScamLevels.map(level => (
            <TouchableOpacity 
              key={level.id}
              disabled={level.status === 'locked'}
              onPress={() => {
                if (level.status !== 'locked') {
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
    textAlign: "center",
  },
  centerTitleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
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
    paddingVertical: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  sharedProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    marginRight: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  sharedProgressFill: {
    height: 8,
    backgroundColor: "#4f46e5",
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2, // for Android shadow
  },
  sharedProgressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4f46e5",
    minWidth: 80,
    textAlign: "right",
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
    height: 54, // Increased height for better touch targets
    elevation: 2, // Add shadow for Android
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center", // Center content vertically
    height: "100%", // Full height of container
    paddingHorizontal: 4, // Add some horizontal padding
  },
  tabInner: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  activeTab: {
    borderBottomWidth: 3, // Slightly thicker for emphasis
    borderBottomColor: "#4f46e5",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    textAlign: "center", // Ensure text is centered
  },
  activeTabText: {
    color: "#4f46e5",
    fontWeight: "700", // Make active tab text bolder
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
    backgroundColor: "#fff0e5", // Keep the custom background color
  },
  scamQuestTabText: {
    color: "#ea580c", // Keep the custom text color
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
    marginBottom: 16, // Increased margin for better separation
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16, // Increased margin for better spacing
    borderBottomWidth: 1, // Add a separator
    borderBottomColor: "#f1f5f9",
    paddingBottom: 12, // Add padding to the bottom
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 18, // Larger title
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8, // More space below title
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb", // Light yellow background
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20, // Pill shape
    borderWidth: 1,
    borderColor: "#fef3c7",
    alignSelf: "flex-start", // Ensures the container only takes the needed width
  },
  totalPoints: {
    fontSize: 14,
    fontWeight: "700", // Bolder for emphasis
    color: "#d97706", // Darker orange for better contrast
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
    marginTop: 16,
  },
  progressBarContainer: {
    height: 10, // Slightly taller
    backgroundColor: "#e2e8f0",
    borderRadius: 6, // Slightly more rounded
    overflow: "hidden",
    borderWidth: 1, // Add border
    borderColor: "#cbd5e1",
  },
  progressBar: {
    height: 10,
    backgroundColor: "#4f46e5",
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2, // for Android shadow
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6, // Space between bar and labels
    paddingHorizontal: 4, // Align labels better
  },
  progressLabel: {
    fontSize: 13, // Slightly larger
    fontWeight: "600", // Bolder
    color: "#475569", // Darker for better visibility
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
    marginTop: 24,
    marginBottom: 24,  // More margin for separation
    backgroundColor: "#fff",
    borderRadius: 16, // Larger radius for consistency
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  badgesSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
    borderBottomWidth: 1, // Add separator
    borderBottomColor: "#f1f5f9",
    paddingBottom: 12,
  },
  badgesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginHorizontal: -8, // Compensate for badge card margin
  },
  badgeCard: {
    width: 84, // Slightly wider
    height: 110, // Slightly taller
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    margin: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    zIndex: 1,
    shadowColor: "#000", // Add subtle shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  badgeCardEmoji: {
    fontSize: 36, // Larger emoji
    marginBottom: 10,
  },
  badgeCardName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155", // Darker for better readability
    textAlign: "center",
  },
  noBadgesContainer: {
    marginTop: 20,
    padding: 30,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  trophyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  noBadgesText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#94a3b8",
    textAlign: "center",
  },
  // Reset button styles
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 4,
  },
});
