@echo off
echo ===============================================
echo Exporting and Deploying Fraud Shield App
echo ===============================================

cd frontend\my-app

echo Step 1: Exporting app for Android...
call npx expo export -p android

echo Step 2: Deploying app...
call eas deploy

echo Process completed. Check the console output for any errors or success messages.
