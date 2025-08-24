# SMS Monitoring Setup Guide

## Important Note: Expo Managed Workflow Limitation

Since Expo managed workflow doesn't support direct SMS access, you need to use one of these approaches:

### Option 1: Custom Development Build (Recommended)

This allows you to keep using Expo services while adding native dependencies.

### Option 2: Eject to Bare React Native

This gives you full control but you lose some Expo conveniences.

## Setup Instructions

### For Custom Development Build:

1. **Install EAS CLI** (if not already installed):

   ```bash
   npm install -g eas-cli
   ```

2. **Configure EAS Build**:

   ```bash
   eas build:configure
   ```

3. **Create custom dev client**:

   ```bash
   eas build --platform android --profile development
   ```

4. **Install the custom dev client** on your Android device.

5. **Start the development server**:
   ```bash
   npx expo start --dev-client
   ```

### For Bare React Native (Alternative):

1. **Eject from Expo**:

   ```bash
   npx expo eject
   ```

2. **Install additional dependencies**:

   ```bash
   npx react-native link react-native-android-sms-listener
   ```

3. **Run the app**:
   ```bash
   npx react-native run-android
   ```

## Android Permissions Required

The following permissions are automatically configured in app.json:

- `READ_SMS`: To read SMS messages
- `RECEIVE_SMS`: To listen for incoming SMS
- `READ_PHONE_STATE`: To access device information

## Testing the SMS Monitoring

1. Enable SMS monitoring in the Monitor tab
2. Send a test SMS to your device with suspicious content like:
   - "Congratulations! You've won $1000! Click here to claim: http://suspicious-link.com"
   - "Your account has been suspended. Verify immediately by clicking: www.fake-bank.com"

## Configuration Files Modified

- `app.json`: Added Android SMS permissions
- `services/smsMonitor.ts`: Main SMS monitoring service
- `app/(tabs)/monitor.tsx`: Real-time monitoring interface
- `app/(tabs)/report.tsx`: Enhanced with auto-detected fraud reports
- `app/_layout.tsx`: Added Toast notification support

## Troubleshooting

### Permission Issues

- Make sure to allow SMS permissions when prompted
- Check device settings if permissions were denied
- Restart the app after granting permissions

### Library Issues

- Ensure you're using a custom development build or bare React Native
- The `react-native-android-sms-listener` package requires native code

### API Connection Issues

- Make sure your backend is running on `http://localhost:5000`
- Check network connectivity between device and backend

## Security Considerations

- SMS content is only processed locally and sent to your own backend
- No SMS data is shared with third parties
- Users can disable monitoring at any time
- All stored data uses local AsyncStorage

## Performance Notes

- SMS monitoring runs in the background with minimal battery impact
- Only fraud-related SMS are stored for reports
- Storage is limited to 100 messages per category to prevent bloat
