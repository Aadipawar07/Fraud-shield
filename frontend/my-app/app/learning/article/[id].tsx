import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getArticleById } from '../../../services/learningService';

// Helper function to get the right image based on article ID
const getArticleImage = (id: string) => {
  // Map article IDs to their corresponding image files
  switch(id) {
    case 'a1':
      return require('../../../assets/images/articles/article-1.png');
    case 'a2':
      return require('../../../assets/images/articles/article-2.png');
    case 'a3':
      return require('../../../assets/images/articles/article-3.png');
    case 'a4':
      return require('../../../assets/images/articles/article-4.png');
    case 'a5':
      return require('../../../assets/images/articles/article-5.png');
    default:
      // Default image if no match
      return require('../../../assets/images/articles/article-1.png');
  }
};
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Define the Article type according to your data structure
interface Article {
  id: string;
  title?: string;
  content?: string;
  image?: string;
  description?: string;
  category?: string;
  type?: 'free' | 'paid';
  provider?: string;
  readTime?: string;
}

// Article detail screen - to be implemented in the future
export default function ArticleScreen() {
  const { id } = useLocalSearchParams();
  const [article, setArticle] = useState<Article | undefined>(undefined);
  const insets = useSafeAreaInsets();
  
  useEffect(() => {
    if (id) {
      const articleData = getArticleById(id.toString());
      setArticle(articleData);
    }
  }, [id]);

  if (!article) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.navigate("/(tabs)/learning")} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Article</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading article...</Text>
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
        <Text style={styles.headerTitle}>Article</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.content}>
        {article.id && (
          <Image 
            source={getArticleImage(article.id)}
            style={styles.articleImage}
            resizeMode="cover"
          />
        )}
        <Text style={styles.title}>{article.title}</Text>
        
        <View style={styles.metaContainer}>
          {article.provider && (
            <View style={styles.metaItem}>
              <Ionicons name="business-outline" size={14} color="#64748b" />
              <Text style={styles.metaText}>{article.provider}</Text>
            </View>
          )}
          {article.category && (
            <View style={styles.metaItem}>
              <Ionicons name="folder-outline" size={14} color="#64748b" />
              <Text style={styles.metaText}>{article.category}</Text>
            </View>
          )}
          {article.readTime && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#64748b" />
              <Text style={styles.metaText}>{article.readTime} read</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.message}>
          {article.description || "Full article content will be available soon."}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    padding: 16,
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  articleImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 20,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 4,
  },
});
