import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'sms-listener' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

// Get the native module
const SmsListenerModule = NativeModules.SmsListener
  ? NativeModules.SmsListener
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

// Create an event emitter for the native module
const smsEventEmitter = new NativeEventEmitter(SmsListenerModule);

/**
 * SMS Listener API for real-time SMS monitoring
 */
class SmsListener {
  subscriptions = new Map();
  
  /**
   * Start listening for incoming SMS messages
   * @returns {Promise<Object>} Object containing subscription ID
   */
  async startListener() {
    // Android only - SMS listening is not available on iOS
    if (Platform.OS !== 'android') {
      console.warn('SMS listening is only supported on Android devices');
      return { subscriptionId: 'ios-not-supported' };
    }
    
    return await SmsListenerModule.startListener();
  }
  
  /**
   * Stop listening for SMS messages
   * @param {string} subscriptionId The subscription ID from startListener
   * @returns {Promise<void>}
   */
  async stopListener(subscriptionId) {
    if (Platform.OS !== 'android') {
      return;
    }
    
    // Clean up any JS listeners we have for this subscription
    const listener = this.subscriptions.get(subscriptionId);
    if (listener) {
      listener.remove();
      this.subscriptions.delete(subscriptionId);
    }
    
    // Stop the native listener
    return await SmsListenerModule.stopListener(subscriptionId);
  }
  
  /**
   * Add an event listener for incoming SMS messages
   * @param {Function} callback Called with SMS message data when a message arrives
   * @returns {Function} Function to call to remove the listener
   */
  onSmsReceived(callback) {
    const subscription = smsEventEmitter.addListener('sms_received', (event) => {
      callback({
        originatingAddress: event.originatingAddress,
        body: event.body
      });
    });
    
    return subscription;
  }
  
  /**
   * Start monitoring SMS messages with a callback
   * @param {Function} callback Called when SMS messages arrive
   * @returns {Promise<Object>} Object with subscription info and stop function
   */
  async monitor(callback) {
    // Start the native listener
    const { subscriptionId } = await this.startListener();
    
    // Set up the JS event listener
    const subscription = this.onSmsReceived(callback);
    this.subscriptions.set(subscriptionId, subscription);
    
    // Return an object with the subscription ID and a method to stop monitoring
    return {
      subscriptionId,
      stop: async () => {
        await this.stopListener(subscriptionId);
      }
    };
  }
}

export default new SmsListener();
