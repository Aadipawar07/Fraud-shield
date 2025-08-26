import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { analyzeMessage } from '../utils/smsAnalyzer';

/**
 * Test component for the fraud detection API
 * Add this to any screen to test the API connection
 */
export default function FraudDetectionTester() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testSamples = [
    "CONGRATULATIONS! You've won $5,000. To claim your prize, send $100 processing fee to account 12345.",
    "Your account has been suspended. Please verify your details at http://fake-bank.scam/verify",
    "Hey, can you pick up milk on your way home? Thanks!",
    "Your monthly bank statement is now available. Please log in to your account to view it.",
  ];

  const detectFraud = async (testMessage) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the same analyzeMessage function that's used in the app
      const analysisResult = await analyzeMessage(testMessage, 'Test Sender');
      setResult(analysisResult);
    } catch (err) {
      console.error('Error in fraud detection:', err);
      setError(err.message || 'Failed to analyze message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Fraud Detection API Tester</Text>
      
      <Text style={styles.label}>Enter a message to test:</Text>
      <TextInput
        style={styles.input}
        multiline
        numberOfLines={4}
        value={message}
        onChangeText={setMessage}
        placeholder="Enter a message to analyze..."
      />
      
      <Button 
        title="Analyze Message" 
        onPress={() => detectFraud(message)} 
        disabled={loading || !message.trim()}
      />
      
      <Text style={styles.sectionTitle}>Or try these samples:</Text>
      <View style={styles.samplesContainer}>
        {testSamples.map((sample, index) => (
          <View key={index} style={styles.sampleItem}>
            <Text numberOfLines={1} style={styles.sampleText}>{sample}</Text>
            <Button
              title="Test"
              onPress={() => detectFraud(sample)}
              disabled={loading}
            />
          </View>
        ))}
      </View>
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Analyzing message...</Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {result && !loading && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Analysis Results</Text>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Classification:</Text>
            <Text style={[
              styles.resultValue, 
              result.isFraud ? styles.fraudText : styles.safeText
            ]}>
              {result.isFraud ? 'FRAUD' : 'SAFE'}
            </Text>
          </View>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Confidence:</Text>
            <Text style={styles.resultValue}>{result.confidence} ({result.score}%)</Text>
          </View>
          
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Reason:</Text>
            <Text style={styles.resultValue}>{result.reason || 'No reason provided'}</Text>
          </View>
          
          {result.matchedPatterns && result.matchedPatterns.length > 0 && (
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Patterns:</Text>
              <Text style={styles.resultValue}>{result.matchedPatterns.join(', ')}</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    minHeight: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  samplesContainer: {
    marginBottom: 20,
  },
  sampleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sampleText: {
    flex: 1,
    marginRight: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 16,
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
  },
  errorContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#d32f2f',
  },
  errorText: {
    color: '#d32f2f',
  },
  resultContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  resultLabel: {
    width: 100,
    fontWeight: 'bold',
  },
  resultValue: {
    flex: 1,
  },
  fraudText: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  safeText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
});
