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
  return {
    articles: learningContent.articles.map(article => ({
      ...article,
      type: article.type as "free" | "paid"
    })),
    courses: learningContent.courses.map(course => ({
      ...course,
      type: course.type as "free" | "paid"
    }))
  };
}

export function getArticleById(id: string): Article | undefined {
  const article = learningContent.articles.find(article => article.id === id);
  return article ? { ...article, type: article.type as "free" | "paid" } : undefined;
}

export function getCourseById(id: string): Course | undefined {
  const course = learningContent.courses.find(course => course.id === id);
  return course
    ? { ...course, type: course.type as "free" | "paid" }
    : undefined;
}

export function getArticlesByCategory(category: string): Article[] {
  return learningContent.articles
    .filter(article => article.category === category)
    .map(article => ({
      ...article,
      type: article.type as "free" | "paid"
    }));
}

export function getCoursesByCategory(category: string): Course[] {
  return learningContent.courses
    .filter(course => course.category === category)
    .map(course => ({
      ...course,
      type: course.type as "free" | "paid"
    }));
}

export function getArticlesByProvider(provider: string): Article[] {
  return learningContent.articles
    .filter(article => article.provider === provider)
    .map(article => ({
      ...article,
      type: article.type as "free" | "paid"
    }));
}

export function getCoursesByProvider(provider: string): Course[] {
  return learningContent.courses
    .filter(course => course.provider === provider)
    .map(course => ({
      ...course,
      type: course.type as "free" | "paid"
    }));
}

export function getFeaturedContent(): { articles: Article[], courses: Course[] } {
  const featuredArticles = learningContent.articles
    .filter(article => article.featured)
    .map(article => ({
      ...article,
      type: article.type as "free" | "paid"
    }));
  const featuredCourses = learningContent.courses
    .filter(course => course.featured)
    .map(course => ({
      ...course,
      type: course.type as "free" | "paid"
    }));
  
  return {
    articles: featuredArticles,
    courses: featuredCourses
  };
}
