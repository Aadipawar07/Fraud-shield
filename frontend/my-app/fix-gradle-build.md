# Fixing Your Gradle Build Error

Follow these steps in order to resolve your current Gradle build failure:

## Step 1: Update Native Module Configuration

The error is likely related to the SMS listener module. Let's fix the integration:

1. Create or modify `d:\Fraud-Shield\frontend\my-app\android\settings.gradle`:

```gradle
rootProject.name = 'fraudshield'

apply from: new File(["node", "--print", "require.resolve('expo/package.json')"].execute(null, rootDir).text.trim(), "../scripts/autolinking.gradle");
useExpoModules()

include ':react-native-android-sms-listener'
project(':react-native-android-sms-listener').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-android-sms-listener/android')

apply from: new File(["node", "--print", "require.resolve('@react-native/gradle-plugin/package.json', { paths: [require.resolve('react-native/package.json')] })"].execute(null, rootDir).text.trim(), "../package/react-native.config.gradle");
```

2. Update `d:\Fraud-Shield\frontend\my-app\android\app\build.gradle` to add SMS listener configuration:

```gradle
// Add this in the dependencies section
dependencies {
    implementation project(':react-native-android-sms-listener')
    // ... other dependencies
}

// Add this inside the android { } block
packagingOptions {
    pickFirst 'lib/x86/libc++_shared.so'
    pickFirst 'lib/x86_64/libc++_shared.so'
    pickFirst 'lib/armeabi-v7a/libc++_shared.so'
    pickFirst 'lib/arm64-v8a/libc++_shared.so'
}
```

## Step 2: Fix Memory Issues

Create or modify `d:\Fraud-Shield\frontend\my-app\android\gradle.properties`:

```
# Project-wide Gradle settings
org.gradle.jvmargs=-Xmx4g -XX:MaxPermSize=2048m -XX:+HeapDumpOnOutOfMemoryError
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.configureondemand=true
android.useAndroidX=true
android.enableJetifier=true
```

## Step 3: Clean the Build

Run these commands:

```bash
cd d:\Fraud-Shield\frontend\my-app
npx expo prebuild --clean
```

## Step 4: Update the SMS Listener Import

Make sure your SMS service properly imports the module. In `services/smsMonitor.ts`:

```typescript
// Dynamic import with error handling
let SmsListener: any = null;
if (Platform.OS === "android") {
  try {
    SmsListener = require("react-native-android-sms-listener").default;
  } catch (error) {
    console.error("Error importing SMS listener:", error);
  }
}
```

## Step 5: Update EAS Configuration

Modify your `eas.json` to include the necessary build options:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease",
        "withoutCredentials": true
      },
      "env": {
        "ANDROID_NDK_HOME": "..."  // Optional: Only if you know your NDK path
      }
    }
  }
}
```

## Step 6: Rebuild with Clear Cache

Run the build command with clear cache option:

```bash
npx eas build --platform android --profile preview --clear-cache
```

## Additional Troubleshooting

If the issue persists:

1. Check the full build logs at the URL in the error message
2. Look for specific error messages like:
   - Missing dependencies
   - Version conflicts
   - SDK compatibility issues

3. Try building with the development profile first:
   ```bash
   npx eas build --platform android --profile development
   ```

4. Consider simplifying your app temporarily by commenting out the SMS listener functionality just to get a successful build, then reintroduce it gradually.
