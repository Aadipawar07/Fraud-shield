// This file centralizes all deployment-related configuration

// Backend API URL - change this before building your APK!
export const BACKEND_URL = 'https://your-deployed-backend-url.com';

// Version information
export const APP_VERSION = '1.0.0';

// Feature flags
export const FEATURES = {
  SMS_MONITORING: true,
  PHONE_VERIFICATION: true,
  USER_REPORTING: true,
  ANALYTICS: true,
};

// SMS detection settings
export const SMS_SETTINGS = {
  CHECK_FREQUENCY: 'immediate', // 'immediate', 'batched'
  NOTIFICATION_LEVEL: 'all',    // 'all', 'fraud-only', 'none'
  STORAGE_DAYS: 30,             // How many days to keep SMS history
};

/**
 * Updates the configuration for different environments
 * Call this function during app initialization
 */
export function configureForEnvironment(env = 'production') {
  let apiUrl = BACKEND_URL;
  
  if (env === 'development') {
    // Use a local development URL
    apiUrl = 'http://localhost:5000';
  }
  
  return {
    apiUrl,
    version: APP_VERSION,
    features: FEATURES,
    smsSettings: SMS_SETTINGS,
  };
}
