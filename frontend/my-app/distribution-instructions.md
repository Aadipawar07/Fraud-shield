# APK Distribution Instructions for Fraud Shield

## Building the APK

To build a distribution APK that can be shared directly with users:

1. Navigate to your app directory:
```bash
cd d:\Fraud-Shield\frontend\my-app
```

2. Make sure all your changes are committed and your code is ready for distribution.

3. Build the APK using EAS:
```bash
npx eas build --platform android --profile preview
```

4. Follow the prompts to log in to your Expo account if needed.

5. Wait for the build to complete. The build will be processed on Expo's servers, and you'll receive a link to download the APK once it's ready.

## Distributing the APK

Once you have the APK file:

1. You can share it via:
   - Email
   - File sharing services (Google Drive, Dropbox, etc.)
   - Your own website
   - Messaging apps

2. Provide users with installation instructions:
   - Enable "Install from Unknown Sources" in Android settings
   - Open the APK file to install
   - Grant necessary permissions during installation

## Required Permissions

For your SMS monitoring app, make sure users know they need to grant these permissions:

- READ_SMS - To read incoming SMS messages
- RECEIVE_SMS - To be notified when new SMS messages arrive
- READ_CONTACTS - If your app needs to identify senders by name
- INTERNET - For communicating with your backend server

## Backend Connectivity

Ensure your backend is deployed to a public server accessible from the internet. Update the API URL in your app code before building the APK:

```javascript
// In your services/auth.ts or appropriate configuration file
const API_URL = 'https://your-deployed-backend-url.com';
```

## Auto-Start Configuration

To ensure SMS monitoring runs automatically:

1. Include clear instructions for users to:
   - Disable battery optimization for your app
   - Enable auto-start permission (varies by device manufacturer)
   - Keep the app running in the background

2. Consider adding an in-app guide for these settings on first launch
