import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SmsListener from './SmsListener';
import { analyzeMessage } from '../utils/fraudDetection';
import Toast from 'react-native-toast-message';

class SmsMonitoringService {
  active = false;
  subscription = null;
  
  // Cache for analyzed messages to avoid duplicates
  analyzedMessages = new Set();
  
  // Storage keys
  storageKey = 'fraud_shield_messages';
  settingsKey = 'fraud_shield_settings';
  
  /**
   * Initialize the monitoring service
   */
  async initialize() {
    if (Platform.OS !== 'android') {
      console.log('SMS monitoring only supported on Android');
      return false;
    }
    
    // Load settings
    const settings = await this.getSettings();
    
    // Auto-start if enabled in settings
    if (settings.autoStart) {
      this.startMonitoring();
    }
    
    return true;
  }
  
  /**
   * Start monitoring incoming SMS messages
   */
  async startMonitoring() {
    if (this.active || Platform.OS !== 'android') {
      return;
    }
    
    try {
      this.subscription = await SmsListener.monitor(async (message) => {
        await this.processSmsMessage(message);
      });
      
      this.active = true;
      console.log('SMS monitoring started successfully');
      
      // Update settings
      const settings = await this.getSettings();
      settings.lastStartTime = new Date().toISOString();
      await this.saveSettings(settings);
      
      return true;
    } catch (error) {
      console.error('Failed to start SMS monitoring:', error);
      return false;
    }
  }
  
  /**
   * Stop monitoring SMS messages
   */
  async stopMonitoring() {
    if (!this.active || !this.subscription) {
      return;
    }
    
    try {
      await this.subscription.stop();
      this.subscription = null;
      this.active = false;
      console.log('SMS monitoring stopped');
      
      // Update settings
      const settings = await this.getSettings();
      settings.lastStopTime = new Date().toISOString();
      await this.saveSettings(settings);
      
      return true;
    } catch (error) {
      console.error('Failed to stop SMS monitoring:', error);
      return false;
    }
  }
  
  /**
   * Process an incoming SMS message
   * @param {Object} message The SMS message to process
   */
  async processSmsMessage(message) {
    const { originatingAddress, body } = message;
    
    // Skip if we've already analyzed this exact message
    const messageKey = `${originatingAddress}:${body}`;
    if (this.analyzedMessages.has(messageKey)) {
      return;
    }
    
    // Add to analyzed set
    this.analyzedMessages.add(messageKey);
    
    // Analyze the message for fraud indicators
    const analysis = analyzeMessage(body, originatingAddress);
    
    // Create a record of this message
    const messageRecord = {
      sender: originatingAddress,
      body,
      timestamp: new Date().toISOString(),
      analysis: analysis
    };
    
    // Store the message
    await this.storeMessage(messageRecord);
    
    // Show a notification if the message is potentially fraudulent
    if (analysis.isFraudulent) {
      this.showFraudAlert(messageRecord);
    }
  }
  
  /**
   * Show an alert for a fraudulent message
   * @param {Object} message The message record
   */
  showFraudAlert(message) {
    Toast.show({
      type: 'error',
      text1: '⚠️ Potential Fraud Detected',
      text2: `From: ${message.sender}`,
      visibilityTime: 6000,
      autoHide: true,
      topOffset: 30
    });
  }
  
  /**
   * Store a message in persistent storage
   * @param {Object} message Message record to store
   */
  async storeMessage(message) {
    try {
      // Get existing messages
      const existingData = await AsyncStorage.getItem(this.storageKey);
      const messages = existingData ? JSON.parse(existingData) : [];
      
      // Add new message
      messages.push(message);
      
      // Store back to AsyncStorage, limited to last 100 messages
      await AsyncStorage.setItem(
        this.storageKey, 
        JSON.stringify(messages.slice(-100))
      );
    } catch (error) {
      console.error('Failed to store SMS message:', error);
    }
  }
  
  /**
   * Get all stored messages
   * @returns {Array} Array of message records
   */
  async getMessages() {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to retrieve messages:', error);
      return [];
    }
  }
  
  /**
   * Get service settings
   * @returns {Object} Service settings
   */
  async getSettings() {
    try {
      const data = await AsyncStorage.getItem(this.settingsKey);
      return data ? JSON.parse(data) : {
        autoStart: true,
        notifyOnFraud: true,
        sensitivityLevel: 'medium',
        lastStartTime: null,
        lastStopTime: null
      };
    } catch (error) {
      console.error('Failed to retrieve settings:', error);
      return {
        autoStart: true,
        notifyOnFraud: true,
        sensitivityLevel: 'medium'
      };
    }
  }
  
  /**
   * Save service settings
   * @param {Object} settings Settings to save
   */
  async saveSettings(settings) {
    try {
      await AsyncStorage.setItem(this.settingsKey, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }
  
  /**
   * Check if monitoring is currently active
   * @returns {boolean} True if monitoring is active
   */
  isMonitoring() {
    return this.active;
  }
  
  /**
   * Clear all stored messages
   */
  async clearMessages() {
    try {
      await AsyncStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear messages:', error);
    }
  }
}

// Create a singleton instance
const smsMonitoringService = new SmsMonitoringService();

export default smsMonitoringService;
