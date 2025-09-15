// Safer crypto polyfill implementation
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

// Export a named function that can generate UUIDs as a fallback
export const generateUUID = uuidv4;

// Safely define our types
type SafePartialCrypto = {
  getRandomValues: <T extends ArrayBufferView>(array: T) => T;
  randomUUID?: () => string;
};

// Only apply the polyfill if we're not in a web environment
if (Platform.OS !== 'web') {
  // Create a safer polyfill implementation
  const safeCryptoPolyfill: SafePartialCrypto = {
    getRandomValues: <T extends ArrayBufferView>(array: T): T => {
      // Fill array with random values using a safer approach
      const bytes = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
    // Also provide randomUUID using the uuid package
    randomUUID: () => uuidv4()
  };
  
  // Apply the polyfill safely
  try {
    if (!global.crypto) {
      Object.defineProperty(global, 'crypto', {
        value: safeCryptoPolyfill,
        writable: true,
        configurable: true
      });
    } else if (!global.crypto.getRandomValues) {
      Object.defineProperty(global.crypto, 'getRandomValues', {
        value: safeCryptoPolyfill.getRandomValues,
        writable: true,
        configurable: true
      });
    }
  } catch (err) {
    console.warn('Failed to apply crypto polyfill:', err);
  }
}

export default { generateUUID };