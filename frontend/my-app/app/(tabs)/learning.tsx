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

export default function LearningScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"articles" | "courses">("articles");
  const [articles, setArticles] = useState<Article[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Fetch learning content
  useEffect(() => {
    const content = getLearningContent();
    setArticles(content.articles);
    setCourses(content.courses);
    
    // Extract unique categories from articles and courses
    const allCategories = [
      ...new Set([
        ...content.articles.map((article) => article.category),
        ...content.courses.map((course) => course.category),
      ]),
    ];
    setCategories(allCategories);
  }, []);

  // Filter content by selected category
  const filteredArticles = selectedCategory
    ? articles.filter((article) => article.category === selectedCategory)
    : articles;
    
  const filteredCourses = selectedCategory
    ? courses.filter((course) => course.category === selectedCategory)
    : courses;

  // Render an article card
  const renderArticleCard = ({ item }: { item: Article }) => (
    <TouchableOpacity
      style={styles.contentCard}
      onPress={() => {
        // Using the proper format for dynamic routes in Expo Router
        router.navigate(`../learning/article/${item.id}`);
      }}
    >
      <View style={styles.cardHeader}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, styles.placeholderImage]}>
            <MaterialIcons name="article" size={30} color="#a1a1aa" />
          </View>
        )}
        <View style={styles.cardBadge}>
          <Text style={styles.cardBadgeText}>{item.type}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardCategory}>{item.category}</Text>
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
        router.navigate(`../learning/course/${item.id}`);
      }}
    >
      <View style={styles.cardHeader}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, styles.placeholderImage]}>
            <MaterialIcons name="school" size={30} color="#a1a1aa" />
          </View>
        )}
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
        <Text style={styles.cardCategory}>{item.category}</Text>
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learning Center</Text>
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryContainer}
      >
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === null && styles.categoryButtonActive,
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text
            style={[
              styles.categoryButtonText,
              selectedCategory === null && styles.categoryButtonTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
      </View>

      {/* Content List */}
      {activeTab === "articles" ? (
        <FlatList
          data={filteredArticles}
          renderItem={renderArticleCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={filteredCourses}
          renderItem={renderCourseCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        />
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
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: "#4f46e5",
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
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
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
    textTransform: "uppercase",
    marginBottom: 4,
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
});
