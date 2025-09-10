# Fraud Shield - Background Monitoring Implementation

## Implementation Overview

The background SMS monitoring feature for Fraud Shield has been successfully implemented. This allows the app to monitor incoming SMS messages even when minimized and immediately alert the user if fraud is detected.

## Required Dependencies

Install these new dependencies:

```bash
npm install expo-task-manager expo-background-fetch --save
```

## Files Created or Modified

1. **New Files:**
   - `services/backgroundMonitoring.ts`: Implements the background task for SMS monitoring

2. **Modified Files:**
   - `services/smsMonitor.ts`: Updated with background task integration
   - `app/(tabs)/monitor.tsx`: Enhanced to use background monitoring
   - `app.json`: Added background task configurations

## Key Features Implemented

- **Permission Handling**: Automatically requests SMS permissions when monitoring is started
- **Background Task Integration**: Using expo-task-manager to keep monitoring active when the app is minimized
- **Background Fetch**: Using expo-background-fetch to ensure periodic task execution
- **Synchronization**: Keeps background task status and UI state synchronized
- **Toggle Functionality**: User can start/stop monitoring with a single button press
- **Fraud Alerts**: Immediate notification when fraud is detected
- **Statistics Update**: Real-time updates to safe/fraud message counts

## Implementation Details

### Background Task Registration

The implementation uses TaskManager.defineTask to create a background task that keeps SMS monitoring active. The task:

1. Checks if monitoring should still be active
2. Maintains the SMS listener connection
3. Reports success/failure to the system

### SMS Processing

When an SMS is received:

1. The content is analyzed using the existing `analyzeMessage` function
2. Fraud detection results are stored and statistics are updated
3. If fraud is detected, an alert is shown via Toast notification
4. The UI is updated with the new message and statistics

### Monitoring Toggle

The Monitor tab provides a simple toggle button that:

1. When turned on:
   - Requests necessary permissions
   - Starts SMS listener
   - Registers background task

2. When turned off:
   - Stops SMS listener
   - Unregisters background task

## Testing Instructions

1. Install the dependencies listed above
2. Build and install a development build of the app on an Android device
3. Open the Monitor tab and press "Start Monitoring"
4. Grant the requested permissions
5. Send test SMS messages to verify detection works
6. Minimize the app and send another test message
7. Check that monitoring continues and notifications appear

## Known Limitations

- Background monitoring is only available on Android
- The app must be built as a development client or production build (not compatible with Expo Go)
- Background tasks may be restricted by Android's battery optimization settings
