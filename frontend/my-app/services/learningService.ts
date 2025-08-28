// Services for getting learning content
import learningContent from "../data/learningContent.json";

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

interface LearningContent {
  articles: Article[];
  courses: Course[];
}

export function getLearningContent(): LearningContent {
  return learningContent;
}

export function getArticleById(id: string): Article | undefined {
  return learningContent.articles.find(article => article.id === id);
}

export function getCourseById(id: string): Course | undefined {
  return learningContent.courses.find(course => course.id === id);
}

export function getArticlesByCategory(category: string): Article[] {
  return learningContent.articles.filter(article => article.category === category);
}

export function getCoursesByCategory(category: string): Course[] {
  return learningContent.courses.filter(course => course.category === category);
}

export function getArticlesByProvider(provider: string): Article[] {
  return learningContent.articles.filter(article => article.provider === provider);
}

export function getCoursesByProvider(provider: string): Course[] {
  return learningContent.courses.filter(course => course.provider === provider);
}

export function getFeaturedContent(): { articles: Article[], courses: Course[] } {
  const featuredArticles = learningContent.articles.filter(article => article.featured);
  const featuredCourses = learningContent.courses.filter(course => course.featured);
  
  return {
    articles: featuredArticles,
    courses: featuredCourses
  };
}
