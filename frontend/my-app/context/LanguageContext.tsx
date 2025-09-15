import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize';

export type Language = 'en' | 'hi' | 'mr' | 'kn' | 'te' | 'ml' | 'gu';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
];

interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (language: Language) => Promise<void>;
  isLoading: boolean;
  supportedLanguages: LanguageInfo[];
  getLanguageName: (code: Language) => string;
  getCurrentLanguageInfo: () => LanguageInfo;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  useEffect(() => {
    initializeLanguage();
  }, []);

  const initializeLanguage = async () => {
    try {
      setIsLoading(true);
      
      // Get saved language from AsyncStorage
      const savedLanguage = await AsyncStorage.getItem('user-language');
      
      if (savedLanguage && isValidLanguage(savedLanguage)) {
        setCurrentLanguage(savedLanguage as Language);
        await i18n.changeLanguage(savedLanguage);
      } else {
        // If no saved language, detect device language
        const deviceLanguage = getDeviceLanguage();
        setCurrentLanguage(deviceLanguage);
        await i18n.changeLanguage(deviceLanguage);
        await AsyncStorage.setItem('user-language', deviceLanguage);
      }
    } catch (error) {
      console.error('Error initializing language:', error);
      // Fallback to English
      setCurrentLanguage('en');
      await i18n.changeLanguage('en');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidLanguage = (lang: string): lang is Language => {
    return SUPPORTED_LANGUAGES.some(supportedLang => supportedLang.code === lang);
  };

  const getDeviceLanguage = (): Language => {
    const locales = RNLocalize.getLocales();
    if (locales.length > 0) {
      const deviceLangCode = locales[0].languageCode;
      // Check if device language is supported
      if (isValidLanguage(deviceLangCode)) {
        return deviceLangCode as Language;
      }
    }
    return 'en'; // Default fallback
  };

  const changeLanguage = async (language: Language): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Change i18n language
      await i18n.changeLanguage(language);
      
      // Update state
      setCurrentLanguage(language);
      
      // Persist to storage
      await AsyncStorage.setItem('user-language', language);
      
      console.log(`Language changed to: ${language}`);
    } catch (error) {
      console.error('Error changing language:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getLanguageName = (code: Language): string => {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code);
    return language?.nativeName || code;
  };

  const getCurrentLanguageInfo = (): LanguageInfo => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  };

  const contextValue: LanguageContextType = {
    currentLanguage,
    changeLanguage,
    isLoading,
    supportedLanguages: SUPPORTED_LANGUAGES,
    getLanguageName,
    getCurrentLanguageInfo,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Custom hook for common translations
export const useTranslations = () => {
  const { t } = useTranslation();
  
  return {
    t,
    // Common translations
    common: {
      loading: t('common.loading'),
      error: t('common.error'),
      success: t('common.success'),
      cancel: t('common.cancel'),
      ok: t('common.ok'),
      save: t('common.save'),
      delete: t('common.delete'),
      edit: t('common.edit'),
      back: t('common.back'),
      next: t('common.next'),
      done: t('common.done'),
      retry: t('common.retry'),
      close: t('common.close'),
      open: t('common.open'),
      search: t('common.search'),
      filter: t('common.filter'),
      settings: t('common.settings'),
      help: t('common.help'),
      about: t('common.about'),
      version: t('common.version'),
      update: t('common.update'),
      share: t('common.share'),
      copy: t('common.copy'),
      paste: t('common.paste'),
      yes: t('common.yes'),
      no: t('common.no'),
    },
    // Navigation translations
    navigation: {
      home: t('navigation.home'),
      monitor: t('navigation.monitor'),
      report: t('navigation.report'),
      learning: t('navigation.learning'),
      scan: t('navigation.scan'),
      verify: t('navigation.verify'),
      profile: t('navigation.profile'),
      account: t('navigation.account'),
    },
    // Auth translations
    auth: {
      signIn: t('auth.signIn'),
      signUp: t('auth.signUp'),
      signOut: t('auth.signOut'),
      signOutConfirm: t('auth.signOutConfirm'),
      email: t('auth.email'),
      password: t('auth.password'),
      confirmPassword: t('auth.confirmPassword'),
      forgotPassword: t('auth.forgotPassword'),
      createAccount: t('auth.createAccount'),
      alreadyHaveAccount: t('auth.alreadyHaveAccount'),
      dontHaveAccount: t('auth.dontHaveAccount'),
      invalidCredentials: t('auth.invalidCredentials'),
      signInSuccess: t('auth.signInSuccess'),
      signUpSuccess: t('auth.signUpSuccess'),
      signOutSuccess: t('auth.signOutSuccess'),
    },
    // Fraud detection translations
    fraudDetection: {
      fraudDetected: t('fraudDetection.fraudDetected'),
      suspiciousMessage: t('fraudDetection.suspiciousMessage'),
      safeMessage: t('fraudDetection.safeMessage'),
      lowRisk: t('fraudDetection.lowRisk'),
      mediumRisk: t('fraudDetection.mediumRisk'),
      highRisk: t('fraudDetection.highRisk'),
      phishing: t('fraudDetection.phishing'),
      spam: t('fraudDetection.spam'),
      scam: t('fraudDetection.scam'),
      malware: t('fraudDetection.malware'),
      identity: t('fraudDetection.identity'),
      financial: t('fraudDetection.financial'),
    },
  };
};