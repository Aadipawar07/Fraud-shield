# Android build troubleshooting guide for Fraud Shield

## Common Gradle build issues and solutions

### 1. Check your Gradle version

Make sure you're using a compatible Gradle version with your React Native setup:

```
# In android/gradle/wrapper/gradle-wrapper.properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.1-all.zip
```

### 2. Add SMS Listener configuration

For the `react-native-android-sms-listener` library, add proper configuration to your build.gradle:

```gradle
// In android/app/build.gradle

android {
    // Existing config...
    
    // Add this
    packagingOptions {
        pickFirst 'lib/x86/libc++_shared.so'
        pickFirst 'lib/x86_64/libc++_shared.so'
        pickFirst 'lib/armeabi-v7a/libc++_shared.so'
        pickFirst 'lib/arm64-v8a/libc++_shared.so'
    }
}

dependencies {
    // Make sure this is included
    implementation project(':react-native-android-sms-listener')
}
```

### 3. Update settings.gradle

Ensure the SMS listener module is properly included:

```gradle
// In android/settings.gradle
include ':react-native-android-sms-listener'
project(':react-native-android-sms-listener').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-android-sms-listener/android')
```

### 4. Fix SDK version issues

If you're having compatibility issues:

```gradle
// In android/build.gradle
buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 23
        compileSdkVersion = 34
        targetSdkVersion = 34
        // For SMS listener compatibility
        kotlinVersion = "1.8.0"
    }
}
```

### 5. Increase build memory

If you're hitting memory limits:

```
# In android/gradle.properties
org.gradle.jvmargs=-Xmx4g -XX:MaxPermSize=2048m -XX:+HeapDumpOnOutOfMemoryError
```

### 6. Run clean build

Sometimes clearing the cache helps:

```bash
cd android
./gradlew clean
```

### 7. Check dependency conflicts

If certain libraries conflict:

```gradle
// In android/app/build.gradle
configurations.all {
    resolutionStrategy {
        force 'androidx.core:core-ktx:1.10.0'
        // Add other forced versions here
    }
}
```

### 8. Rebuild with EAS

After making these changes, try rebuilding:

```bash
npx eas build --platform android --profile preview --clear-cache
```
