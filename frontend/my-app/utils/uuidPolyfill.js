// utils/uuidPolyfill.js

// Polyfill for crypto.getRandomValues in React Native
import { Platform } from 'react-native';

// Only apply the polyfill if we're not in a browser environment
if (Platform.OS !== 'web' && !global.crypto) {
  // Create a minimal implementation of crypto
  global.crypto = {
    getRandomValues: (arr) => {
      // Fill array with random values
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }
  };
}

// Alternatively, if using expo-random, you could do:
// import * as Random from 'expo-random';
// global.crypto = {
//   getRandomValues: (arr) => Random.getRandomBytes(arr.length)
// };
