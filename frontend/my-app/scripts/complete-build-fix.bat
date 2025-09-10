@echo off
echo ==========================================
echo Fraud Shield - Complete Build Fix ^& Deploy
echo ==========================================

:: Step 1: Ensure we're in the right directory
cd /d "%~dp0"
cd ..
echo Current directory: %CD%

:: Step 2: Clear out node_modules and install fresh dependencies
echo Step 2: Cleaning up project and installing fresh dependencies...
if exist node_modules rmdir /s /q node_modules
call npm install

:: Step 3: Install required packages for SMS monitoring
echo Step 3: Installing SMS monitoring dependencies...
call npm install expo-task-manager expo-background-fetch react-native-android-sms-listener --save

:: Step 4: Fix any build-related issues
echo Step 4: Running build error fix script...
node ./scripts/fix-build-errors.js

:: Step 5: Update EAS CLI
echo Step 5: Updating EAS CLI...
call npm install -g eas-cli@latest

:: Step 6: Clear build cache
echo Step 6: Clearing Expo cache...
if exist .expo rmdir /s /q .expo
call npx expo start --clear --no-dev --minify --non-interactive
taskkill /f /im node.exe /fi "WINDOWTITLE eq Metro" 2>nul
call npx expo prebuild --clean

:: Step 7: Use the production version of the background monitoring service
echo Step 7: Setting up production background monitoring...
copy /y services\backgroundMonitoring.prod.ts services\backgroundMonitoring.ts

:: Step 8: Start build with verbose logging
echo Step 8: Starting build with verbose logging...
set EAS_NO_VCS=1
call npx eas build --platform android --profile preview --verbose --non-interactive --clear-cache

echo Build process initiated. Monitor the logs for any errors.
