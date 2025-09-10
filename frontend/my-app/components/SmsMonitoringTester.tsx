import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert } from 'react-native';
import Button from '../components/Button';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import smsMonitorService from '../services/smsMonitor';

/**
 * A component to test SMS monitoring by manually simulating incoming SMS
 */
export default function SmsMonitoringTester() {
  const [sender, setSender] = useState('Test Sender');
  const [message, setMessage] = useState('Your account has been suspended. Please click this link immediately: http://fraud-site.com');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSimulateSms = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Message cannot be empty');
      return;
    }
    
    setIsLoading(true);
    try {
      // Call directly into the handle method
      const mockRawMessage = {
        originatingAddress: sender,
        body: message
      };
      
      console.log('Simulating SMS manually:', mockRawMessage);
      
      // Method to simulate SMS at the lowest level (bypass the listener)
      const simulateDirectly = async () => {
        try {
          // Get the monitor instance directly
          // @ts-ignore - we're accessing a private method for testing
          await smsMonitorService.handleIncomingSMS(mockRawMessage);
          Alert.alert('Success', 'SMS processed successfully. Check the monitoring statistics.');
        } catch (error) {
          console.error('Error simulating SMS directly:', error);
          Alert.alert('Error', 'Failed to simulate SMS directly');
        }
      };
      
      // Regular scan using public API
      const smsMessage = await smsMonitorService.scanMessage(message, sender);
      console.log('Scan result:', smsMessage);
      Alert.alert(
        smsMessage.isFraud ? 'Fraud Detected' : 'Message Safe',
        `Sender: ${sender}\n\nMessage: ${message}\n\nResult: ${smsMessage.isFraud ? 'FRAUD' : 'SAFE'}\n\n${smsMessage.fraudReason || ''}`,
        [
          { text: 'OK' },
          { 
            text: 'Simulate Direct Receipt',
            onPress: simulateDirectly
          }
        ]
      );
    } catch (error) {
      console.error('Error testing SMS:', error);
      Alert.alert('Error', 'Failed to test SMS processing');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ThemedView card style={styles.container} lightColor="#ffffff" darkColor="#1c1c1c" shadow="md">
      <ThemedText variant="h3" style={styles.title}>SMS Monitoring Tester</ThemedText>
      
      <ThemedText style={styles.label}>Sender:</ThemedText>
      <TextInput
        style={styles.input}
        value={sender}
        onChangeText={setSender}
        placeholder="Enter sender phone number"
      />
      
      <ThemedText style={styles.label}>Message:</ThemedText>
      <TextInput
        style={[styles.input, styles.messageInput]}
        value={message}
        onChangeText={setMessage}
        placeholder="Enter SMS message to test"
        multiline
        numberOfLines={4}
      />
      
      <Button
        title="Test SMS Processing"
        onPress={handleSimulateSms}
        disabled={isLoading}
        variant="primary"
        size="medium"
        style={styles.button}
      />
      
      <ThemedText style={styles.note}>
        Note: This directly tests the SMS processing logic without requiring actual SMS messages.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 16,
    borderRadius: 12,
  },
  title: {
    marginBottom: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    marginVertical: 16,
  },
  note: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
