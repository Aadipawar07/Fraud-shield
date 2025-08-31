import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfettiCannon from 'react-native-confetti-cannon';
import mockQuizData from '../../services/mockQuizData';

// Backup quiz data 
const backupQuizData = {
  l1: {
    title: 'Fake Advisor Quiz',
    questions: [
      {
        id: 'q1',
        question: 'Which of the following is a red flag for identifying a fake financial advisor?',
        options: [
          'They have proper credentials that can be verified',
          'They guarantee unusually high returns with no risk',
          'They provide detailed documentation of their recommendations',
          'They are registered with regulatory authorities'
        ],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'What should you do before hiring a financial advisor?',
        options: [
          'Accept their first offer immediately',
          'Transfer funds to show your commitment',
          'Verify their credentials and check for complaints',
          'Share your personal identification documents'
        ],
        correctAnswer: 2
      },
      {
        id: 'q3',
        question: 'A legitimate financial advisor would typically:',
        options: [
          'Pressure you to make immediate decisions',
          'Discourage you from reading the fine print',
          'Explain the risks associated with investments',
          'Ask for cash payments only'
        ],
        correctAnswer: 2
      }
    ],
    points: 100,
    badge: 'Fraud Hunter 🕵️',
    color: '#FF6B6B'
  },
  l2: {
    title: 'SMS Scam Detection Quiz',
    questions: [
      {
        id: 'q1',
        question: 'Which of these SMS messages is most likely a scam?',
        options: [
          'Your appointment is confirmed for tomorrow at 2 PM. Reply Y to confirm or N to reschedule.',
          'URGENT: Your account has been compromised. Click this link immediately to secure your funds: bit.ly/12xyz',
          'Your prescription is ready for pickup at Walgreens. Store hours: 8am-10pm',
          'This is a reminder that your bill payment is due on 06/15. Login to your account to make a payment.'
        ],
        correctAnswer: 1
      },
      {
        id: 'q2',
        question: 'What should you do if you receive a suspicious SMS asking for personal information?',
        options: [
          'Reply with the information requested to verify your identity',
          "Call the number back to confirm it's legitimate",
          'Click any links to see where they lead',
          'Contact the company directly through their official channels'
        ],
        correctAnswer: 3
      },
      {
        id: 'q3',
        question: 'Which element is commonly found in SMS phishing attempts?',
        options: [
          'Company logo and official signature',
          'A sense of urgency or threat',
          'Proper grammar and spelling',
          'Clear sender identification'
        ],
        correctAnswer: 1
      },
      {
        id: 'q4',
        question: 'If you accidentally clicked a link in a suspicious SMS, what should you do first?',
        options: [
          'Ignore it and hope nothing happens',
          'Enter your login details to check if the site is legitimate',
          'Disconnect from the internet and scan your device for malware',
          'Share the link with friends to see if they think its a scam'
        ],
        correctAnswer: 2
      }
    ],
    points: 150,
    badge: 'SMS Guardian 📱',
    color: '#4ECDC4'
  },
  l3: {
    title: 'Online Purchase Safety Quiz',
    questions: [
      {
        id: 'q1',
        question: 'Which of these is a sign of a trustworthy online store?',
        options: [
          'The prices are significantly lower than all competitors',
          'They only accept cryptocurrency or wire transfers',
          'They have a secure website (https://) and clear return policy',
          'They require you to make a decision within a limited timeframe'
        ],
        correctAnswer: 2
      },
      {
        id: 'q2',
        question: 'When making an online purchase, which payment method generally offers the best fraud protection?',
        options: [
          'Wire transfer',
          'Cryptocurrency',
          'Credit card',
          'Direct bank transfer'
        ],
        correctAnswer: 2
      },
      {
        id: 'q3',
        question: 'What should you check before entering payment details on an online store?',
        options: [
          'That the website has lots of pop-up advertisements',
          'That the URL begins with "https://" and has a padlock icon',
          'That the store offers the lowest price anywhere online',
          'That the website was created very recently'
        ],
        correctAnswer: 1
      },
      {
        id: 'q4',
        question: 'If an online deal seems too good to be true, what should you do?',
        options: [
          'Purchase immediately before it sells out',
          'Research the seller, read reviews, and verify their legitimacy',
          'Send the link to friends so they can also benefit',
          'Provide your personal details to hold the item'
        ],
        correctAnswer: 1
      },
      {
        id: 'q5',
        question: 'Which of these is a warning sign of an online shopping scam?',
        options: [
          'The store has a professional-looking website with clear contact information',
          'The seller has many detailed positive reviews from verified buyers',
          'The seller only communicates through the platform\'s official messaging system',
          'The seller asks you to complete the transaction outside the original platform'
        ],
        correctAnswer: 3
      }
    ],
    points: 200,
    badge: 'Safe Shopper 🛒',
    color: '#9D8DF1'
  }
};

// Quest detail screen
export default function QuestScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [previousPoints, setPreviousPoints] = useState(0);
  const [newTotalPoints, setNewTotalPoints] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  
  // Animation values
  const scoreAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef(null);
  
  // Get the quiz data for the current level
  const quizData = id ? mockQuizData[id.toString() as keyof typeof mockQuizData] : null;
  
  // Current question
  const currentQuestion = quizData && quizData.questions[currentQuestionIndex];
  
  // Get previous points when quiz is completed
  useEffect(() => {
    const getPreviousPoints = async () => {
      if (quizCompleted) {
        try {
          const userProgressData = await AsyncStorage.getItem('USER_PROGRESS');
          if (userProgressData) {
            const parsedData = JSON.parse(userProgressData);
            setPreviousPoints(parsedData.totalPoints || 0);
            setNewTotalPoints((parsedData.totalPoints || 0) + (quizData?.points || 0));
          }
        } catch (error) {
          console.error("Error getting previous points:", error);
        }
      }
    };
    
    getPreviousPoints();
  }, [quizCompleted, quizData?.points]);
  
  // Handle selecting an answer
  const handleSelectAnswer = (index: number) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(index);
    }
  };
  
  // Handle submitting an answer
  const handleSubmitAnswer = () => {
    if (selectedAnswer !== null) {
      setIsAnswerSubmitted(true);
      
      // Check if answer is correct
      if (currentQuestion && selectedAnswer === currentQuestion.correctAnswer) {
        setScore(score + Math.floor(quizData.points / quizData.questions.length));
      }
    }
  };
  
  // Handle moving to the next question
  const handleNextQuestion = () => {
    if (quizData && currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      // Quiz completed - now let's update the progress
      setQuizCompleted(true);
      
      // Calculate feedback message based on score
      if (quizData) {
        const totalPossibleScore = quizData.points;
        const scorePercentage = (score / totalPossibleScore) * 100;
        
        if (scorePercentage >= 90) {
          setFeedbackMessage("Excellent! You're a fraud detection expert!");
        } else if (scorePercentage >= 70) {
          setFeedbackMessage("Great job! You have solid fraud awareness skills.");
        } else if (scorePercentage >= 50) {
          setFeedbackMessage("Good effort! Keep learning to improve your skills.");
        } else {
          setFeedbackMessage("You've completed the quiz. Review the material to improve your score.");
        }
      }
      
      // Animate score counting
      Animated.timing(scoreAnimation, {
        toValue: score,
        duration: 1500,
        useNativeDriver: false
      }).start();
      
      // Fade in completion UI
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      }).start(() => {
        // Show confetti after fade-in
        setShowConfetti(true);
      });
      
      // Store the completion in AsyncStorage
      if (id) {
        try {
          // Update local state to show completion UI
          const levelCompleted = id.toString();
          
          // Save to AsyncStorage for persistence
          // This simulates calling the parent component's completeLevel function
          saveQuizCompletion(levelCompleted, score);
        } catch (error) {
          console.error("Error saving quiz completion:", error);
        }
      }
    }
  };
  
  // Function to save quiz completion data to AsyncStorage
  const saveQuizCompletion = async (levelId: string, finalScore: number) => {
    try {
      // In a real app with proper state management, we would dispatch an action
      // or call a function in the parent component.
      // For now, we'll use AsyncStorage to persist the data
      const completionData = {
        levelId,
        score: finalScore,
        timestamp: new Date().toISOString(),
        completed: true
      };
      
      // Save quiz completion to AsyncStorage so learning tab can access it
      await AsyncStorage.setItem('QUIZ_COMPLETION', JSON.stringify(completionData));
      
      // Get the existing total points if any
      let existingPoints = 0;
      const userProgress = await AsyncStorage.getItem('USER_PROGRESS');
      if (userProgress) {
        const parsedProgress = JSON.parse(userProgress);
        existingPoints = parsedProgress.totalPoints || 0;
      }
      
      // Calculate new total points - quiz score + level reward points
      const earnedPoints = quizData?.points || 0;
      const newTotalPoints = existingPoints + earnedPoints;
      
      await AsyncStorage.setItem('LEVEL_POINTS', JSON.stringify({
        levelId,
        points: earnedPoints,
        totalPoints: newTotalPoints,
        previousPoints: existingPoints
      }));
      console.log("Quiz completed and saved:", completionData);
    } catch (error) {
      console.error("Error saving completion data:", error);
    }
  };
  
  if (!quizData) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.navigate("/(tabs)/learning")} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scam Quest</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Quiz not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{quizData.title}</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.content}>
        {!quizCompleted ? (
          <>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>Question {currentQuestionIndex + 1} of {quizData.questions.length}</Text>
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%` }
                  ]} 
                />
              </View>
            </View>
            
            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>{currentQuestion ? currentQuestion.question : ''}</Text>
              
              {currentQuestion && currentQuestion.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedAnswer === index && styles.selectedOption,
                    isAnswerSubmitted && index === currentQuestion.correctAnswer && styles.correctOption,
                    isAnswerSubmitted && selectedAnswer === index && 
                      index !== currentQuestion.correctAnswer && styles.incorrectOption
                  ]}
                  onPress={() => handleSelectAnswer(index)}
                  disabled={isAnswerSubmitted}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.optionBullet,
                    selectedAnswer === index && styles.selectedBullet,
                    isAnswerSubmitted && index === currentQuestion.correctAnswer && styles.correctBullet,
                    isAnswerSubmitted && selectedAnswer === index && 
                      index !== currentQuestion.correctAnswer && styles.incorrectBullet
                  ]}>
                    <Text style={[
                      styles.optionBulletText,
                      selectedAnswer === index && styles.selectedBulletText,
                      isAnswerSubmitted && index === currentQuestion.correctAnswer && styles.correctBulletText,
                      isAnswerSubmitted && selectedAnswer === index && 
                        index !== currentQuestion.correctAnswer && styles.incorrectBulletText
                    ]}>{String.fromCharCode(65 + index)}</Text>
                  </View>
                  <Text 
                    style={[
                      styles.optionText,
                      selectedAnswer === index && styles.selectedOptionText,
                      isAnswerSubmitted && index === currentQuestion.correctAnswer && styles.correctOptionText,
                      isAnswerSubmitted && selectedAnswer === index && 
                        index !== currentQuestion.correctAnswer && styles.incorrectOptionText
                    ]}
                  >
                    {option}
                  </Text>
                  {isAnswerSubmitted && index === currentQuestion.correctAnswer && (
                    <MaterialIcons name="check-circle" size={24} color="#16a34a" style={styles.resultIcon} />
                  )}
                  {isAnswerSubmitted && selectedAnswer === index && 
                    index !== currentQuestion.correctAnswer && (
                      <MaterialIcons name="cancel" size={24} color="#dc2626" style={styles.resultIcon} />
                    )
                  }
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.actionContainer}>
              {!isAnswerSubmitted ? (
                <TouchableOpacity 
                  style={[styles.actionButton, selectedAnswer === null && styles.disabledButton]}
                  onPress={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                >
                  <Text style={styles.actionButtonText}>Submit Answer</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handleNextQuestion}
                >
                  <Text style={styles.actionButtonText}>
                    {currentQuestionIndex < quizData.questions.length - 1 ? 'Next Question' : 'Complete Quiz'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        ) : (
          <Animated.View 
            style={[
              styles.completionContainer,
              { opacity: fadeAnim }
            ]}
          >
            {showConfetti && (
              <ConfettiCannon
                count={100}
                origin={{ x: -10, y: 0 }}
                autoStart={true}
                fadeOut={true}
                ref={confettiRef}
              />
            )}
            
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeEmoji}>{quizData.badge}</Text>
              <Text style={styles.badgeTitle}>Badge Earned!</Text>
            </View>
            
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Your Score:</Text>
              <Animated.Text style={styles.scoreText}>
                {Math.floor(score)} points
              </Animated.Text>
            </View>
            
            <View style={styles.resultSummary}>
              <View style={styles.feedbackContainer}>
                <FontAwesome5 name="trophy" size={24} color="#F59E0B" style={styles.feedbackIcon} />
                <Text style={styles.resultTitle}>{feedbackMessage}</Text>
              </View>
              <Text style={styles.resultText}>
                You've completed this level and earned {quizData.points} points! Your progress has been updated in your profile.
              </Text>
            </View>

            <View style={styles.resultSummary}>
              <Text style={styles.resultTitle}>Points Added</Text>
              <View style={styles.pointsUpdate}>
                <Text style={styles.pointsOld}>
                  {previousPoints}
                </Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <MaterialIcons name="arrow-forward" size={20} color="#64748b" style={{marginHorizontal: 8}} />
                  <View style={{
                    backgroundColor: '#eef2ff', 
                    borderRadius: 12, 
                    paddingVertical: 2, 
                    paddingHorizontal: 6
                  }}>
                    <Text style={{color: '#4f46e5', fontWeight: '600', fontSize: 12}}>+{quizData?.points || 0}</Text>
                  </View>
                </View>
                <Text style={styles.pointsNew}>
                  {previousPoints + (quizData?.points || 0)}
                </Text>
              </View>
              <Text style={styles.resultText}>
                You've unlocked the next level! Continue your journey to become an expert in fraud protection.
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                // Make sure the ScamQuest tab is active when returning
                router.navigate({
                  pathname: "/(tabs)/learning",
                  params: { activeTab: "scamquest" }
                });
              }}
            >
              <Text style={styles.actionButtonText}>Back to Scam Quest</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  progressContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#4f46e5',
    borderRadius: 4,
  },
  questionContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  optionButton: {
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#4b5563',
    flex: 1,
    paddingRight: 8,
    lineHeight: 22,
  },
  optionBullet: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  selectedBullet: {
    backgroundColor: '#4f46e5',
    borderColor: '#4338ca',
    borderWidth: 1,
  },
  correctBullet: {
    backgroundColor: '#16a34a',
    borderColor: '#15803d',
    borderWidth: 1,
  },
  incorrectBullet: {
    backgroundColor: '#dc2626',
    borderColor: '#b91c1c',
    borderWidth: 1,
  },
  optionBulletText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748b',
  },
  selectedBulletText: {
    color: '#ffffff',
  },
  correctBulletText: {
    color: '#ffffff',
  },
  incorrectBulletText: {
    color: '#ffffff',
  },
  resultIcon: {
    marginLeft: 10,
  },
  selectedOption: {
    borderColor: '#4f46e5',
    backgroundColor: '#eef2ff',
    borderWidth: 2,
  },
  selectedOptionText: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  correctOption: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
  },
  correctOptionText: {
    color: '#16a34a',
    fontWeight: '600',
  },
  incorrectOption: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
    borderWidth: 2,
  },
  incorrectOptionText: {
    color: '#dc2626',
    fontWeight: '600',
  },
  actionContainer: {
    padding: 16,
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: '#cbd5e1',
  },
  completionContainer: {
    padding: 24,
    alignItems: 'center',
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 28,
    backgroundColor: '#fffbeb',
    paddingVertical: 32,
    paddingHorizontal: 40,
    borderRadius: 24,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 4,
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackIcon: {
    marginRight: 8,
  },
  badgeEmoji: {
    fontSize: 80,
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  badgeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoreText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f59e0b',
    marginBottom: 28,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fffbeb',
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  resultSummary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  pointsUpdate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  pointsOld: {
    fontSize: 22,
    fontWeight: '600',
    color: '#94a3b8',
  },
  pointsNew: {
    fontSize: 22,
    fontWeight: '700',
    color: '#10b981',
  },
});
