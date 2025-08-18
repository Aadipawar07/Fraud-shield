import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkMessageSafety } from './api';
import Toast from 'react-native-toast-message';

// Type definitions
export interface SMSMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  isFraud: boolean;
  fraudReason?: string;
  confidence?: number;
}

export interface SMSMonitorState {
  isMonitoring: boolean;
  permissionsGranted: boolean;
  lastProcessedSMS?: SMSMessage;
  processedCount: number;
  fraudCount: number;
}

class SMSMonitorService {
  private isInitialized = false;
  private isMonitoring = false;
  private permissionsGranted = false;
  private smsListener: any = null;
  private onNewSMSCallback?: (sms: SMSMessage) => void;
  private state: SMSMonitorState = {
    isMonitoring: false,
    permissionsGranted: false,
    processedCount: 0,
    fraudCount: 0,
  };

  // Storage keys
  private readonly FRAUD_SMS_KEY = 'fraud_sms_reports';
  private readonly SAFE_SMS_KEY = 'safe_sms_reports';
  private readonly SMS_STATS_KEY = 'sms_monitor_stats';

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    if (Platform.OS !== 'android') {
      console.log('SMS monitoring is only available on Android');
      return;
    }

    try {
      // Load previous stats
      await this.loadStoredStats();
      this.isInitialized = true;
      console.log('SMS Monitor Service initialized');
    } catch (error) {
      console.error('Failed to initialize SMS Monitor Service:', error);
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.log('Permissions not needed on this platform');
      return false;
    }

    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      ];

      const granted = await PermissionsAndroid.requestMultiple(permissions);
      
      const allGranted = Object.values(granted).every(
        permission => permission === PermissionsAndroid.RESULTS.GRANTED
      );

      this.permissionsGranted = allGranted;
      this.state.permissionsGranted = allGranted;

      if (allGranted) {
        Toast.show({
          type: 'success',
          text1: 'SMS Permissions Granted',
          text2: 'Real-time fraud monitoring is now active',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'SMS Permissions Denied',
          text2: 'Real-time monitoring requires SMS permissions',
        });
      }

      return allGranted;
    } catch (error) {
      console.error('Permission request failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Permission Error',
        text2: 'Failed to request SMS permissions',
      });
      return false;
    }
  }

  async startMonitoring(onNewSMS?: (sms: SMSMessage) => void): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initializeService();
    }

    if (Platform.OS !== 'android') {
      console.log('SMS monitoring is only available on Android');
      return false;
    }

    if (!this.permissionsGranted) {
      const granted = await this.requestPermissions();
      if (!granted) {
        return false;
      }
    }

    if (this.isMonitoring) {
      console.log('SMS monitoring is already active');
      return true;
    }

    try {
      // Dynamic import to handle the native dependency
      const SmsListener = require('react-native-android-sms-listener');
      
      this.onNewSMSCallback = onNewSMS;
      
      this.smsListener = SmsListener.addListener((message: any) => {
        this.handleIncomingSMS(message);
      });

      this.isMonitoring = true;
      this.state.isMonitoring = true;

      Toast.show({
        type: 'success',
        text1: 'SMS Monitoring Started',
        text2: 'Now scanning incoming messages for fraud',
      });

      console.log('SMS monitoring started successfully');
      return true;
    } catch (error) {
      console.error('Failed to start SMS monitoring:', error);
      Toast.show({
        type: 'error',
        text1: 'Monitoring Failed',
        text2: 'Could not start SMS monitoring service',
      });
      return false;
    }
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    try {
      if (this.smsListener) {
        this.smsListener.remove();
        this.smsListener = null;
      }

      this.isMonitoring = false;
      this.state.isMonitoring = false;
      this.onNewSMSCallback = undefined;

      Toast.show({
        type: 'info',
        text1: 'SMS Monitoring Stopped',
        text2: 'Real-time fraud detection is now inactive',
      });

      console.log('SMS monitoring stopped');
    } catch (error) {
      console.error('Error stopping SMS monitoring:', error);
    }
  }

  private async handleIncomingSMS(rawMessage: any): Promise<void> {
    try {
      console.log('New SMS received:', rawMessage);

      const smsMessage: SMSMessage = {
        id: Date.now().toString(),
        sender: rawMessage.originatingAddress || rawMessage.address || 'Unknown',
        message: rawMessage.body || rawMessage.messageBody || '',
        timestamp: new Date().toISOString(),
        isFraud: false,
      };

      // Skip empty messages
      if (!smsMessage.message.trim()) {
        console.log('Skipping empty SMS message');
        return;
      }

      // Show toast for new SMS being processed
      Toast.show({
        type: 'info',
        text1: '📱 New SMS Received',
        text2: `From: ${smsMessage.sender}`,
        visibilityTime: 2000,
      });

      // Perform fraud detection
      console.log('Checking message for fraud:', smsMessage.message);
      const fraudResult = await checkMessageSafety(smsMessage.message);

      smsMessage.isFraud = !fraudResult.safe;
      smsMessage.fraudReason = fraudResult.reason;
      smsMessage.confidence = fraudResult.confidence;

      // Update statistics
      this.state.processedCount++;
      if (smsMessage.isFraud) {
        this.state.fraudCount++;
      }
      this.state.lastProcessedSMS = smsMessage;

      // Store the message
      await this.storeSMSMessage(smsMessage);

      // Show appropriate notification
      if (smsMessage.isFraud) {
        Toast.show({
          type: 'error',
          text1: '🚨 FRAUD DETECTED',
          text2: `From: ${smsMessage.sender}`,
          visibilityTime: 5000,
        });
        console.log('FRAUD DETECTED:', smsMessage);
      } else {
        Toast.show({
          type: 'success',
          text1: '✅ Safe Message',
          text2: `From: ${smsMessage.sender}`,
          visibilityTime: 3000,
        });
        console.log('Safe message processed:', smsMessage);
      }

      // Save updated stats
      await this.saveStats();

      // Notify callback if registered
      if (this.onNewSMSCallback) {
        this.onNewSMSCallback(smsMessage);
      }

    } catch (error) {
      console.error('Error processing incoming SMS:', error);
      Toast.show({
        type: 'error',
        text1: 'Processing Error',
        text2: 'Failed to analyze incoming SMS',
      });
    }
  }

  private async storeSMSMessage(sms: SMSMessage): Promise<void> {
    try {
      const storageKey = sms.isFraud ? this.FRAUD_SMS_KEY : this.SAFE_SMS_KEY;
      
      // Get existing messages
      const existingData = await AsyncStorage.getItem(storageKey);
      const existingMessages: SMSMessage[] = existingData ? JSON.parse(existingData) : [];
      
      // Add new message at the beginning (most recent first)
      existingMessages.unshift(sms);
      
      // Keep only last 100 messages to prevent storage bloat
      const trimmedMessages = existingMessages.slice(0, 100);
      
      // Save back to storage
      await AsyncStorage.setItem(storageKey, JSON.stringify(trimmedMessages));
      
      console.log(`SMS stored in ${sms.isFraud ? 'fraud' : 'safe'} storage`);
    } catch (error) {
      console.error('Failed to store SMS message:', error);
    }
  }

  async getFraudReports(): Promise<SMSMessage[]> {
    try {
      const data = await AsyncStorage.getItem(this.FRAUD_SMS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to retrieve fraud reports:', error);
      return [];
    }
  }

  async getSafeMessages(): Promise<SMSMessage[]> {
    try {
      const data = await AsyncStorage.getItem(this.SAFE_SMS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to retrieve safe messages:', error);
      return [];
    }
  }

  async clearReports(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([this.FRAUD_SMS_KEY, this.SAFE_SMS_KEY]);
      Toast.show({
        type: 'success',
        text1: 'Reports Cleared',
        text2: 'All SMS reports have been deleted',
      });
    } catch (error) {
      console.error('Failed to clear reports:', error);
      Toast.show({
        type: 'error',
        text1: 'Clear Failed',
        text2: 'Could not clear SMS reports',
      });
    }
  }

  getMonitorState(): SMSMonitorState {
    return { ...this.state };
  }

  private async loadStoredStats(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.SMS_STATS_KEY);
      if (data) {
        const storedStats = JSON.parse(data);
        this.state = { ...this.state, ...storedStats };
      }
    } catch (error) {
      console.error('Failed to load stored stats:', error);
    }
  }

  private async saveStats(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SMS_STATS_KEY, JSON.stringify({
        processedCount: this.state.processedCount,
        fraudCount: this.state.fraudCount,
        lastProcessedSMS: this.state.lastProcessedSMS,
      }));
    } catch (error) {
      console.error('Failed to save stats:', error);
    }
  }

  // Utility function to manually scan a message (for testing)
  async scanMessage(message: string, sender: string = 'Manual Test'): Promise<SMSMessage> {
    const smsMessage: SMSMessage = {
      id: Date.now().toString(),
      sender,
      message,
      timestamp: new Date().toISOString(),
      isFraud: false,
    };

    const fraudResult = await checkMessageSafety(message);
    smsMessage.isFraud = !fraudResult.safe;
    smsMessage.fraudReason = fraudResult.reason;
    smsMessage.confidence = fraudResult.confidence;

    await this.storeSMSMessage(smsMessage);

    return smsMessage;
  }
}

// Export singleton instance
export const smsMonitorService = new SMSMonitorService();
export default smsMonitorService;
