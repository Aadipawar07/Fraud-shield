@echo off
echo ==========================================
echo Fraud Shield - Development Server
echo ==========================================

:: Step 1: Ensure we're in the right directory
cd /d "%~dp0"
echo Current directory: %CD%

:: Step 2: Clear out Metro cache
echo Step 2: Clearing Metro cache...
if exist node_modules\.cache\metro rmdir /s /q node_modules\.cache\metro

:: Step 3: Configure SMS monitoring components
echo Step 3: Setting up SMS monitoring components...
node ./scripts/prepare-sms-monitoring.js

:: Step 4: Start the Expo development server
echo Step 4: Starting Expo development server...
call npx expo start --clear

echo When running on a device, make sure to use the development build with "npx expo start --dev-client"
