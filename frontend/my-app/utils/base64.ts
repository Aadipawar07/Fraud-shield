// utils/base64.ts

/**
 * Encodes a string to base64 in a way that works in both Node.js and React Native
 * @param str - The string to encode
 * @returns The base64 encoded string
 */
export function encodeBase64(str: string): string {
  try {
    // In browser/React Native
    return btoa(unescape(encodeURIComponent(str)));
  } catch (error) {
    console.error('Base64 encoding error:', error);
    // Fallback implementation
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    const input = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    });
    
    let i = 0;
    while (i < input.length) {
      const chr1 = input.charCodeAt(i++);
      const chr2 = i < input.length ? input.charCodeAt(i++) : 0;
      const chr3 = i < input.length ? input.charCodeAt(i++) : 0;
      
      const enc1 = chr1 >> 2;
      const enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      const enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      const enc4 = chr3 & 63;
      
      output += chars.charAt(enc1) + chars.charAt(enc2) +
        (isNaN(chr2) ? '=' : chars.charAt(enc3)) +
        (isNaN(chr3) ? '=' : chars.charAt(enc4));
    }
    
    return output;
  }
}

/**
 * Decodes a base64 string in a way that works in both Node.js and React Native
 * @param str - The base64 string to decode
 * @returns The decoded string
 */
export function decodeBase64(str: string): string {
  try {
    // In browser/React Native
    return decodeURIComponent(escape(atob(str)));
  } catch (error) {
    console.error('Base64 decoding error:', error);
    // Implement fallback if needed for specific use cases
    throw new Error('Base64 decoding failed');
  }
}
