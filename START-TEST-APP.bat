@echo off
echo 🚀 Starting Enhanced Fraud Shield App for Testing...
echo.
echo ✅ Make sure you have:
echo   - Node.js installed
echo   - Expo CLI installed (npm install -g @expo/cli)
echo   - Expo Go app on your phone
echo.

cd /d "d:\Fraud-Shield\frontend\my-app"

echo 📦 Installing dependencies...
call npm install

echo.
echo 🎯 Starting Expo development server...
echo.
echo 📱 How to test:
echo   1. Open Expo Go app on your phone
echo   2. Scan the QR code that appears
echo   3. Navigate to "Enhanced Test" tab
echo   4. Try the demo scenarios or enter your own messages
echo.

call npx expo start --clear

pause