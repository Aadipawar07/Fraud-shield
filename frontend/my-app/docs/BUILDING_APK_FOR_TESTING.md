# Building an APK for SMS Monitoring Testing

This guide will help you build a standalone APK to test the SMS monitoring functionality in Fraud-Shield.

## Prerequisites

1. Make sure you have set up your development environment for React Native/Expo development
2. Install required dependencies
3. Configure your app for proper SMS monitoring

## Step 1: Install Required Packages

First, make sure you have all required dependencies:

```bash
# Install packages for background tasks and SMS monitoring
npm install expo-task-manager expo-background-fetch react-native-android-sms-listener

# Install EAS CLI if not already installed
npm install -g eas-cli
```

## Step 2: Configure EAS Build

Initialize EAS Build configuration:

```bash
npx eas build:configure
```

## Step 3: Update your app.json

Make sure your app.json has the proper Android permissions configured:

```json
{
  "expo": {
    "android": {
      "permissions": [
        "READ_SMS",
        "RECEIVE_SMS",
        "READ_PHONE_STATE"
      ]
    }
  }
}
```

## Step 4: Create a development build

For testing purposes, you can create a development build:

```bash
npx eas build --platform android --profile development
```

Or create a production APK:

```bash
npx eas build --platform android --profile preview
```

## Step 5: Install the APK on your device

Once the build is complete, you can download the APK from the EAS Build dashboard or use the direct link provided at the end of the build process.

## Step 6: Test SMS Monitoring

1. Install the APK on your Android device
2. Open the app and navigate to the Monitor tab
3. Tap "Start Monitoring" and grant permissions when prompted
4. Send a test SMS to your device
5. Verify that the message is detected and analyzed correctly

## Troubleshooting

If SMS monitoring doesn't work:

1. Check that all permissions are granted in your device settings
2. Look for error messages in the logs
3. Make sure you're testing on a real Android device, not an emulator
4. Verify that the SMS listener is properly initialized
5. Try using the SMS Testing component to manually verify detection logic
