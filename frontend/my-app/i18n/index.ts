import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import mr from '../locales/mr.json';
import kn from '../locales/kn.json';
import te from '../locales/te.json';
import ml from '../locales/ml.json';
import gu from '../locales/gu.json';

const LANGUAGE_DETECTOR = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // Get saved language from AsyncStorage
      const savedLanguage = await AsyncStorage.getItem('user-language');
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }
      
      // If no saved language, use device locale
      const locales = RNLocalize.getLocales();
      if (locales.length > 0) {
        const deviceLanguage = locales[0].languageCode;
        // Check if device language is supported, otherwise default to English
        const supportedLanguages = ['en', 'hi', 'mr', 'kn', 'te', 'ml', 'gu'];
        callback(supportedLanguages.includes(deviceLanguage) ? deviceLanguage : 'en');
      } else {
        callback('en');
      }
    } catch (error) {
      console.error('Language detection error:', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem('user-language', lng);
    } catch (error) {
      console.error('Language caching error:', error);
    }
  },
};

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  mr: { translation: mr },
  kn: { translation: kn },
  te: { translation: te },
  ml: { translation: ml },
  gu: { translation: gu },
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: __DEV__,
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;