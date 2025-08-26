/**
 * Helper utility functions
 */

/**
 * Generates a unique identifier
 * @returns A string representing a unique ID
 */
export function generateUniqueId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomStr}`;
}

/**
 * Formats a date string into a readable format
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString();
}

/**
 * Truncates a string if it exceeds the maximum length
 * @param str - The string to truncate
 * @param maxLength - Maximum length before truncating
 * @returns Truncated string with ellipsis if needed
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
}

/**
 * Creates an excerpt from a longer text
 * @param text - The full text
 * @param maxLength - Maximum length of the excerpt
 * @returns A shortened excerpt with ellipsis if needed
 */
export function createExcerpt(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  
  // Try to find a sentence break
  const sentenceEnd = text.substring(0, maxLength).lastIndexOf('.');
  if (sentenceEnd > maxLength * 0.7) {
    return text.substring(0, sentenceEnd + 1);
  }
  
  // Try to find a space to break at
  const lastSpace = text.substring(0, maxLength).lastIndexOf(' ');
  if (lastSpace > 0) {
    return `${text.substring(0, lastSpace)}...`;
  }
  
  // Just truncate at maxLength
  return `${text.substring(0, maxLength)}...`;
}
