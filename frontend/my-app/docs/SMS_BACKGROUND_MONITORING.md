# SMS Background Monitoring

This guide explains how to set up SMS background monitoring in the Fraud Shield app.

## Required Dependencies

Install the following packages to enable background monitoring:

```bash
npm install expo-task-manager expo-background-fetch --save
```

## Functionality Overview

The SMS background monitoring feature:

1. Listens for incoming SMS messages even when the app is minimized
2. Analyzes each message using the existing fraud detection logic
3. Alerts the user immediately when fraud is detected
4. Updates monitoring statistics
5. Supports toggling on/off from the Monitor tab

## Implementation Details

- Uses `expo-task-manager` to define a background task for SMS monitoring
- Uses `expo-background-fetch` to ensure the task runs periodically
- Integrates with the existing SMS listener for real-time analysis
- Maintains monitoring state across app restarts

## Permissions

The following Android permissions are required:
- `READ_SMS`: To read SMS content
- `RECEIVE_SMS`: To receive SMS notifications
- `READ_PHONE_STATE`: To access phone state information

## Known Limitations

1. Background SMS monitoring is only available on Android devices
2. Background tasks may be limited by Android's battery optimization
3. SMS access is not available in Expo Go; you must use a custom dev client

## Testing

To test background monitoring:
1. Enable SMS monitoring in the Monitor tab
2. Minimize the app
3. Send a test SMS to your device with suspicious content
4. Check for a notification and updated statistics when reopening the app
