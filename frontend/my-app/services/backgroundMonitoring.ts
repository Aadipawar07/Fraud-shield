import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { Platform } from 'react-native';
import SmsListener from './SmsListener';
import smsMonitorService from './smsMonitor';

// Define the background task name
export const SMS_MONITORING_TASK = 'SMS_MONITORING_TASK';

// The background task handler for SMS monitoring
TaskManager.defineTask(SMS_MONITORING_TASK, async () => {
  try {
    console.log('[BackgroundTask] Running SMS monitoring task');
    
    // Check if we're still supposed to be monitoring
    const monitorState = smsMonitorService.getMonitorState();
    if (!monitorState.isMonitoring) {
      console.log('[BackgroundTask] Monitoring is disabled, stopping task');
      await stopBackgroundMonitoring();
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
    
    // Android only
    if (Platform.OS !== 'android') {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Our monitoring is already handled by the SMS listener,
    // so we just need to keep the task active
    console.log('[BackgroundTask] SMS monitoring task completed successfully');
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('[BackgroundTask] Error in SMS monitoring task:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/**
 * Register the background task for SMS monitoring
 * @returns {Promise<boolean>} True if registration was successful
 */
export async function registerBackgroundMonitoring() {
  try {
    // Register the background fetch task
    await BackgroundFetch.registerTaskAsync(SMS_MONITORING_TASK, {
      minimumInterval: 900, // 15 minutes (in seconds)
      stopOnTerminate: false,
      startOnBoot: true,
    });
    
    console.log('Background SMS monitoring registered');
    return true;
  } catch (error) {
    console.error('Failed to register background SMS monitoring:', error);
    return false;
  }
}

/**
 * Stop the background SMS monitoring task
 * @returns {Promise<boolean>} True if unregistration was successful
 */
export async function stopBackgroundMonitoring() {
  try {
    // Check if the task is registered
    const isRegistered = await TaskManager.isTaskRegisteredAsync(SMS_MONITORING_TASK);
    if (isRegistered) {
      // Unregister the task
      await BackgroundFetch.unregisterTaskAsync(SMS_MONITORING_TASK);
      console.log('Background SMS monitoring unregistered');
    }
    return true;
  } catch (error) {
    console.error('Failed to unregister background SMS monitoring:', error);
    return false;
  }
}

/**
 * Check if background SMS monitoring is currently active
 * @returns {Promise<boolean>} True if monitoring is active
 */
export async function isBackgroundMonitoringActive() {
  try {
    return await TaskManager.isTaskRegisteredAsync(SMS_MONITORING_TASK);
  } catch (error) {
    console.error('Error checking background monitoring status:', error);
    return false;
  }
}
