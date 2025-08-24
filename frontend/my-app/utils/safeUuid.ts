// utils/safeUuid.ts
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

/**
 * Safely generate a UUID in React Native environment
 * This function handles the crypto.getRandomValues polyfill internally
 */
export function generateUuid(): string {
  // Ensure crypto is available for UUID generation
  ensureCryptoAvailable();
  
  try {
    return uuidv4();
  } catch (error) {
    console.warn('Error generating UUID, using fallback method:', error);
    // Fallback to a simpler UUID-like string if all else fails
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

/**
 * Ensure crypto.getRandomValues is available
 */
export function ensureCryptoAvailable(): void {
  if (Platform.OS === 'web') {
    // Web platform already has crypto
    return;
  }
  
  if (!global.crypto) {
    global.crypto = {} as Crypto;
  }
  
  if (!global.crypto.getRandomValues) {
    global.crypto.getRandomValues = <T extends ArrayBufferView>(array: T): T => {
      const bytes = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
      return array;
    };
  }
}
