# Integrating the Fraud Detection API with your Frontend App

This guide shows you how to connect your React Native app to the backend fraud detection API.

## Step 1: Update your environment

The backend API is now running on port 3002. The frontend has already been updated to use this port.

## Step 2: Testing the Integration

A test component has been created to help you verify that the integration is working correctly. Here's how to use it:

1. Import the `FraudDetectionTester` component in one of your screens:

```jsx
import FraudDetectionTester from '../components/FraudDetectionTester';
```

2. Add it to your screen:

```jsx
// Inside your screen component's render method
return (
  <View style={styles.container}>
    <Text style={styles.title}>Fraud Detection Test</Text>
    <FraudDetectionTester />
  </View>
);
```

3. Run your app and navigate to the screen with the tester component.

4. Test with the provided sample messages or enter your own text.

## Step 3: Using in Production

Your app's `smsAnalyzer.ts` already has all the needed code to work with the backend API. It will automatically:

1. Send SMS messages to the backend `/detect` endpoint
2. Parse the response with the classification, confidence score, and reason
3. Fall back to rule-based detection if the API call fails

## Troubleshooting

If you encounter issues:

1. Make sure the backend server is running (`node index.js` in the backend folder)
2. Check that the API URL in `smsAnalyzer.ts` is correct for your environment
3. Ensure your device/emulator can reach the backend server (proper IP address/network)

For Android emulators, use `10.0.2.2` instead of `localhost`.
For physical devices, use your computer's actual IP address on your local network.

## Default API URLs (already configured)

- Android emulator: `http://10.0.2.2:3002`
- Physical devices: `http://192.168.1.5:3002` (update this to your computer's IP)
- Web/development: `http://localhost:3002`
