import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getArticleById } from '../../../services/learningService';
import { educationalResources } from '../../../app/services/educationalResources';
import Markdown from 'react-native-markdown-display';

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
  imageUrl?: string;
  description?: string;
  category?: string;
  type?: 'free' | 'paid';
  provider?: string;
  readTime?: string;
}

// Define Educational Resource type
interface EducationalResource {
  id: string;
  title: string;
  category: string;
  readTime: string;
  content: string;
  imageUrl: string;
  provider?: string;
  description?: string;
}

// Article detail screen with support for educational resources
export default function ArticleScreen() {
  const { id } = useLocalSearchParams();
  const [article, setArticle] = useState<Article | undefined>(undefined);
  const [educationalResource, setEducationalResource] = useState<EducationalResource | undefined>(undefined);
  const insets = useSafeAreaInsets();
  
  useEffect(() => {
    if (id) {
      // First check if it's a regular article from learning service
      const articleData = getArticleById(id.toString());
      
      // If it's not a regular article, check if it's an educational resource
      if (!articleData) {
        const educResource = educationalResources.find(resource => resource.id === id);
        if (educResource) {
          setEducationalResource(educResource);
        }
      } else {
        setArticle(articleData);
      }
    }
  }, [id]);

  // Show loading if neither article nor educational resource is loaded
  if (!article && !educationalResource) {
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

  // Use either the article or educational resource data
  const displayData = educationalResource || article;

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
        {/* Display the article image */}
        {displayData?.imageUrl ? (
          <Image 
            source={{ uri: displayData.imageUrl }} 
            style={styles.articleImage}
            resizeMode="cover"
          />
        ) : displayData?.id && !educationalResource ? (
          <Image 
            source={getArticleImage(displayData.id)}
            style={styles.articleImage}
            resizeMode="cover"
          />
        ) : null}
        
        <Text style={styles.title}>{displayData?.title}</Text>
        
        <View style={styles.metaContainer}>
          {displayData?.provider && (
            <View style={styles.metaItem}>
              <Ionicons name="business-outline" size={14} color="#64748b" />
              <Text style={styles.metaText}>{displayData.provider}</Text>
            </View>
          )}
          {displayData?.category && (
            <View style={styles.metaItem}>
              <Ionicons name="folder-outline" size={14} color="#64748b" />
              <Text style={styles.metaText}>{displayData.category}</Text>
            </View>
          )}
          {displayData?.readTime && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#64748b" />
              <Text style={styles.metaText}>{displayData.readTime} read</Text>
            </View>
          )}
        </View>
        
        {/* Display content depending on type */}
        {educationalResource ? (
          <View style={styles.markdownContainer}>
            <Markdown style={markdownStyles}>
              {educationalResource.content}
            </Markdown>
          </View>
        ) : (
          <Text style={styles.message}>
            {displayData?.description || "Full article content will be available soon."}
          </Text>
        )}
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
  markdownContainer: {
    marginTop: 10,
  }
});

const markdownStyles = {
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1f2937',
  },
  heading1: {
    fontSize: 24,
    marginTop: 24,
    marginBottom: 12,
    fontWeight: 'bold',
    color: '#111827',
  },
  heading2: {
    fontSize: 20,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  heading3: {
    fontSize: 18,
    marginTop: 18,
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#374151',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    color: '#4b5563',
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
  },
  listUnorderedItemIcon: {
    fontSize: 18,
    marginRight: 10,
    color: '#3b82f6',
  },
  strong: {
    fontWeight: 'bold' as 'bold',
  },
  link: {
    color: '#2563eb',
    textDecorationLine: 'underline' as 'underline',
  },
};
