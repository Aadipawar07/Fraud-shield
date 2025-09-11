# Fraud Shield: Android Device Setup Guide

## Building and Running the App on a Connected Android Device

This guide provides detailed instructions for building and running the Fraud Shield application on an Android device connected via USB.

## Prerequisites

Before starting, ensure you have:

- Android device connected via USB cable
- USB debugging enabled on your device
- Node.js and npm installed on your computer
- Android SDK installed (comes with Android Studio)
- ADB (Android Debug Bridge) available in your PATH

## Step-by-Step Instructions

### Step 1: Enable Developer Options and USB Debugging

1. On your Android device, go to **Settings** > **About phone**
2. Tap on **Build number** 7 times to enable Developer options
3. Go back to **Settings** > **System** > **Developer options**
4. Enable **USB debugging**
5. Connect your device to your computer via USB
6. Accept the authorization prompt on your device

### Step 2: Verify Device Connection

Open a command prompt and run:

```
adb devices
```

You should see output similar to:

```
List of devices attached
XXXXXXXXXXXX    device
```

If your device doesn't appear, try:
- Reconnecting the USB cable
- Using a different USB port
- Ensuring USB debugging is enabled
- Accepting any permission dialogs on your device

### Step 3: Navigate to Project Directory

```
cd d:\Fraud-Shield\frontend\my-app
```

### Step 4: Install Dependencies

Ensure all project dependencies are up to date:

```
npm install
```

### Step 5: Clean Previous Builds

Clear any previous builds to ensure a fresh environment:

```
npx expo prebuild --clean
```

When prompted about uncommitted changes, type `Y` and press Enter.

### Step 6: Build and Run on Connected Device

This command will build the app and deploy it directly to your connected device:

```
npx expo run:android --device
```

This single command:
- Creates the Android build
- Compiles the JavaScript code
- Builds the APK
- Installs the APK on your connected device
- Launches the app

## Troubleshooting

### Device Not Detected
If your device isn't showing up:
```
adb devices
```
If no devices appear:
1. Try a different USB cable
2. Restart ADB with `adb kill-server` followed by `adb start-server`
3. Make sure you've accepted the USB debugging authorization on your device

### Build Issues
If the build fails:
```
cd d:\Fraud-Shield\frontend\my-app
npx expo doctor
```
This will identify and help resolve common configuration issues.

### Metro Bundler Issues
If the app crashes or doesn't load JavaScript properly:
```
npx expo start --clear
```
Then press 'a' to run on Android.

### Manual APK Installation
If you have a pre-built APK that you need to install:
```
adb install -r D:\Fraud-Shield\frontend\my-app\android\app\build\outputs\apk\debug\app-debug.apk
```

## For Regular Development

After initial setup, use these commands for your day-to-day development workflow:

1. Start the development server:
```
cd d:\Fraud-Shield\frontend\my-app
npx expo start
```

2. With the dev server running, build and run on the connected device:
```
npx expo run:android --device
```

## Notes

- The first build may take several minutes to complete
- Subsequent builds will be faster due to caching
- Changes to native code require rebuilding the app
- JavaScript-only changes can be applied through hot reload when using the development server

---

*This guide was created for the Fraud Shield project, September 2025.*
