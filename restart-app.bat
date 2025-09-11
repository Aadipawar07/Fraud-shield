@echo off
echo ===============================================
echo Rebuilding and Starting Fraud Shield App
echo ===============================================

cd frontend\my-app

echo Clearing Metro bundler cache...
npx expo start --clear --reset-cache

echo App should be running now. If you still encounter routing issues, try:
echo 1. Completely closing the Expo app on your device
echo 2. Restarting the development server
echo 3. Reopening the app on your device
