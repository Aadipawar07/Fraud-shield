import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { SMSMessage } from './smsMonitor';

/**
 * Configure notification settings and handlers
 */
export async function configureNotifications() {
  // Set notification handler for when app is in foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // Request notification permissions if not already granted
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('fraud-alerts', {
      name: 'Fraud Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF453A',
    });
  }

  return await requestNotificationPermissions();
}

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
}

/**
 * Send a notification about a potentially fraudulent SMS
 * @param message The SMS message that was analyzed
 */
export async function sendFraudAlertNotification(message: SMSMessage) {
  try {
    if (!message.isFraud) {
      return; // Don't send notifications for safe messages
    }
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Potential Fraud Alert',
        body: `Message from ${message.sender} appears fraudulent. Tap to view details.`,
        data: { message },
      },
      trigger: null, // Send immediately
    });
    
    console.log('Fraud alert notification sent');
  } catch (error) {
    console.error('Failed to send fraud alert notification:', error);
  }
}

/**
 * Register a notification response handler
 * @param handler Function to call when a notification is tapped
 */
export function registerNotificationHandler(
  handler: (response: Notifications.NotificationResponse) => void
) {
  const subscription = Notifications.addNotificationResponseReceivedListener(handler);
  return subscription;
}
