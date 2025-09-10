#!/bin/bash
set -e # Exit on error

echo "=========================================="
echo "Fraud Shield - Complete Build Fix & Deploy"
echo "=========================================="

# Step 1: Ensure we're in the right directory
cd "$(dirname "$0")" # Navigate to script directory
cd .. # Navigate to project root

echo "Current directory: $(pwd)"

# Step 2: Clear out node_modules and install fresh dependencies
echo "Step 2: Cleaning up project and installing fresh dependencies..."
rm -rf node_modules
npm install

# Step 3: Install required packages for SMS monitoring
echo "Step 3: Installing SMS monitoring dependencies..."
npm install expo-task-manager expo-background-fetch react-native-android-sms-listener --save

# Step 4: Fix any build-related issues
echo "Step 4: Running build error fix script..."
node ./scripts/fix-build-errors.js

# Step 5: Update EAS CLI
echo "Step 5: Updating EAS CLI..."
npm install -g eas-cli@latest

# Step 6: Clear build cache
echo "Step 6: Clearing Expo cache..."
rm -rf .expo
npx expo start --clear --no-dev --minify --non-interactive || true
pkill -f "expo|metro" || true
npx expo prebuild --clean

# Step 7: Use the production version of the background monitoring service
echo "Step 7: Setting up production background monitoring..."
cp -f services/backgroundMonitoring.prod.ts services/backgroundMonitoring.ts

# Step 8: Start build with verbose logging
echo "Step 8: Starting build with verbose logging..."
export EAS_NO_VCS=1
npx eas build --platform android --profile preview --verbose --non-interactive --clear-cache

echo "Build process initiated. Monitor the logs for any errors."
