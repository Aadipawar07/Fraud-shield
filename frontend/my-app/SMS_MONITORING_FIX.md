# SMS Monitoring Fix

To fix the SMS monitoring functionality, follow these steps:

## 1. Install Required Dependencies

The SMS monitoring feature requires these dependencies that need to be installed:

```bash
npm install expo-task-manager expo-background-fetch react-native-android-sms-listener
```

## 2. Build a Development Client

Since SMS access doesn't work in Expo Go, you need to build a development client:

```bash
npx expo prebuild
npx expo run:android
```

## 3. Common Issues and Fixes

If monitoring doesn't work after installing dependencies, check:

1. **Missing Permissions**: Make sure the app has SMS permissions in your Android settings
2. **Native Module Issue**: The error might be because the native module isn't properly linked

## 4. Testing SMS Monitoring

After applying fixes:
1. Open the app and go to the Monitor tab
2. Tap "Start Monitoring" (permissions should be requested)
3. Send a test SMS from another phone
4. The message should be analyzed and appear in your app
