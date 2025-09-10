# SMS Monitoring Build Configuration

This guide explains how to prepare your project for building with SMS monitoring capabilities.

## Before Building

1. Replace the backgroundMonitoring.ts file with the production version:

```
cp services/backgroundMonitoring.prod.ts services/backgroundMonitoring.ts
```

2. Verify that the following dependencies are installed:

```json
"dependencies": {
  "expo-task-manager": "~11.3.0",
  "expo-background-fetch": "~11.3.0",
  "react-native-android-sms-listener": "^0.8.0"
}
```

3. Ensure app.json has the necessary permissions:

```json
"android": {
  "permissions": [
    "READ_SMS",
    "RECEIVE_SMS",
    "READ_PHONE_STATE"
  ]
}
```

## Building the APK

Run one of these commands based on your platform:

- Windows: `.\build-apk-for-test.bat`
- Mac/Linux: `sh ./build-apk-for-test.sh`

## After Building

1. Download the APK from the EAS dashboard
2. Install it on an Android device
3. Test SMS monitoring functionality

## Testing Procedure

1. Open the app and go to the Monitor tab
2. Tap "Start Monitoring"
3. Grant SMS permissions when prompted
4. Send a test SMS with suspicious content
5. Verify that the SMS is detected and analyzed correctly

## Verifying Background Operation

To verify that monitoring works in the background:

1. Start monitoring
2. Minimize the app (don't close it completely)
3. Send a test SMS
4. After a few minutes, return to the app
5. Check that the new SMS was detected and added to the list

## Troubleshooting

If SMS monitoring doesn't work:

1. Check Android logs for any errors related to SMS reception
2. Verify permissions in Settings > Apps > Fraud Shield > Permissions
3. Try using the built-in SMS testing tool in the Monitor tab
