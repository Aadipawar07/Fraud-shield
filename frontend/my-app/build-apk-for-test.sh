#!/bin/bash
echo "==============================================="
echo "Building Fraud Shield APK for SMS Monitoring Test"
echo "==============================================="

echo "Step 1: Installing dependencies..."
npm install

echo "Step 2: Installing required packages..."
npm install expo-task-manager expo-background-fetch react-native-android-sms-listener

echo "Step 3: Building Android APK..."
npx eas build --platform android --profile preview --non-interactive

echo "Build process initiated. When complete, download the APK from the EAS Dashboard."
echo "For more information, see docs/BUILDING_APK_FOR_TESTING.md"
