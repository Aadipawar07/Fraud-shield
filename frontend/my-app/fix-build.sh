#!/bin/bash
echo "====================================="
echo "Fixing Fraud Shield Build Issues"
echo "====================================="

# Step 1: Update EAS CLI
echo "Step 1: Updating EAS CLI..."
npm install -g eas-cli

# Step 2: Clear build cache
echo "Step 2: Clearing build cache..."
npx expo start --clear --no-dev --minify
npx expo prebuild --clean

# Step 3: Fix package dependencies
echo "Step 3: Ensuring all dependencies are properly installed..."
npm install

# Step 4: Prepare for build
echo "Step 4: Preparing for build..."
node ./scripts/prepare-sms-monitoring.js

# Step 5: Start build with verbose logging
echo "Step 5: Starting build with verbose logging..."
EAS_NO_VCS=1 npx eas build --platform android --profile preview --verbose

echo "Build process initiated. Monitor the logs for any errors."
