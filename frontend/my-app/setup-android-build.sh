#!/bin/bash
# setup-android-build.sh
# A helper script to configure Android builds for Fraud Shield

echo "Setting up Android build environment for Fraud Shield..."

# Create needed directories if they don't exist
mkdir -p android/app/src/main/assets

# Ensure we have the latest dependencies
echo "Installing dependencies..."
npm install

# Install specific versions that work well together
echo "Installing compatible versions of native dependencies..."
npm install react-native-android-sms-listener@0.8.0

# Update prebuild configuration
echo "Updating prebuild configuration..."
npx expo prebuild -p android --clean

echo "Modifying Gradle files for SMS listener support..."

# Check if we need to update settings.gradle
if ! grep -q "react-native-android-sms-listener" android/settings.gradle; then
  echo "Updating settings.gradle..."
  echo "include ':react-native-android-sms-listener'" >> android/settings.gradle
  echo "project(':react-native-android-sms-listener').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-android-sms-listener/android')" >> android/settings.gradle
fi

# Check if we need to update app/build.gradle
if ! grep -q "implementation project(':react-native-android-sms-listener')" android/app/build.gradle; then
  echo "Updating app/build.gradle..."
  sed -i '/dependencies {/a \    implementation project(":react-native-android-sms-listener")' android/app/build.gradle
fi

# Increase gradle memory
echo "Updating gradle.properties with more memory..."
echo "org.gradle.jvmargs=-Xmx4g -XX:MaxPermSize=2048m -XX:+HeapDumpOnOutOfMemoryError" > android/gradle.properties
echo "org.gradle.daemon=true" >> android/gradle.properties
echo "org.gradle.parallel=true" >> android/gradle.properties
echo "android.useAndroidX=true" >> android/gradle.properties
echo "android.enableJetifier=true" >> android/gradle.properties

echo "Setup complete! You can now build your APK with:"
echo "npx eas build --platform android --profile preview --clear-cache"
