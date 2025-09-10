# SMS Monitoring APK Build Instructions

This document provides instructions for building an APK to test SMS monitoring functionality.

## Quick Start

Run these commands to build an APK for testing:

```bash
# Prepare SMS monitoring environment
node ./scripts/prepare-sms-monitoring.js

# Build APK
npx eas build --platform android --profile preview
```

## Manual Setup

If you prefer to set up manually:

1. Install required dependencies:
   ```bash
   npm install expo-task-manager expo-background-fetch react-native-android-sms-listener --save
   ```

2. Copy production background monitoring implementation:
   ```bash
   cp services/backgroundMonitoring.prod.ts services/backgroundMonitoring.ts
   ```

3. Build the APK:
   ```bash
   npx eas build --platform android --profile preview
   ```

## Testing the APK

1. Install the APK on your Android device
2. Open the app and navigate to the Monitor tab
3. Tap "Start Monitoring" and grant SMS permissions
4. Send a test SMS to your device
5. Verify the message is detected and analyzed correctly

## Troubleshooting

If SMS monitoring doesn't work:

- Make sure all permissions are granted in Android settings
- Check for error messages in the logs
- Test using the built-in SMS Testing component
- Verify that you're running on a physical Android device, not an emulator

## Additional Resources

For more detailed information, see:
- docs/SMS_MONITORING_BUILD_CONFIG.md
- docs/BUILDING_APK_FOR_TESTING.md
