// This file ensures that crypto.getRandomValues() is polyfilled before UUID is used

// Polyfill for crypto.getRandomValues in React Native
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

// Only apply the polyfill if we're not in a web environment
if (Platform.OS !== 'web') {
  // Type declaration to handle missing properties
  interface PartialCrypto {
    getRandomValues: <T extends ArrayBufferView>(array: T) => T;
    randomUUID?: () => string;
    subtle?: any;
  }

  // Create polyfill implementation
  const cryptoPolyfill: PartialCrypto = {
    getRandomValues: <T extends ArrayBufferView>(array: T): T => {
      // Fill array with random values
      const bytes = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
    // Also provide randomUUID using the uuid package
    randomUUID: () => uuidv4()
  };
  
  // Apply the polyfill
  if (!global.crypto) {
    global.crypto = cryptoPolyfill as Crypto;
  } else {
    // If crypto exists but doesn't have getRandomValues, add it
    if (!global.crypto.getRandomValues) {
      global.crypto.getRandomValues = cryptoPolyfill.getRandomValues;
    }
  }
}

export default {}; // Export something to avoid TypeScript errors
