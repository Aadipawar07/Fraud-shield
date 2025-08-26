# Building and Distributing Your Fraud Shield APK

Follow these steps to build your APK and distribute it to users.

## Prerequisites

1. Make sure you have:
   - An Expo account (sign up at [expo.dev](https://expo.dev))
   - The Expo CLI installed: `npm install -g eas-cli`
   - Your backend deployed (see `backend/deployment-guide.md`)

## Step 1: Update Configuration Files

1. Update backend URL in `config/deployment.ts`:
   ```typescript
   export const BACKEND_URL = 'https://your-deployed-backend-url.com';
   ```

2. Make sure your `app.json` has the correct Android permissions:
   ```json
   "android": {
     "permissions": [
       "READ_SMS",
       "RECEIVE_SMS",
       "READ_PHONE_STATE"
     ]
   }
   ```

3. Verify your `eas.json` has a profile for building APKs:
   ```json
   "preview": {
     "distribution": "internal",
     "android": {
       "buildType": "apk"
     }
   }
   ```

## Step 2: Login to EAS

```bash
npx eas login
```

## Step 3: Configure the Build

```bash
npx eas build:configure
```

## Step 4: Build the APK

```bash
npx eas build -p android --profile preview
```

This will start the build process on Expo's servers. When complete, you'll receive a URL to download the APK.

## Step 5: Test the APK

Before distributing to users:

1. Install the APK on your own device
2. Verify all permissions are correctly requested
3. Test SMS monitoring functionality
4. Make sure the app connects to your backend server

## Step 6: Create User Instructions

Create a simple PDF or text file with installation instructions:

1. Download the APK
2. Enable "Install from Unknown Sources" in settings:
   - Android 8+: Settings → Apps → Special Access → Install unknown apps
   - Android 7 and below: Settings → Security → Unknown sources
3. Install the APK
4. Grant all requested permissions at startup
5. Configure auto-start settings:
   - Battery optimization settings (disable for your app)
   - Auto-start permission (varies by device manufacturer)

## Step 7: Distribution Methods

Choose one or more distribution methods:

1. **File Sharing Services**:
   - Upload to Google Drive, Dropbox, or similar
   - Share the link with your users

2. **Your Website**:
   - Host the APK on your website
   - Create a download page with instructions

3. **Email**:
   - Send the APK as an email attachment
   - Include installation instructions

4. **Chat Apps**:
   - Share via WhatsApp, Telegram, etc.

## Step 8: Updating Your App

When you need to update the app:

1. Make your code changes
2. Update the version in `app.json`
3. Rebuild the APK using the same process
4. Distribute the new APK to users

Remember, users will need to manually install updates when distributing outside the Google Play Store.
