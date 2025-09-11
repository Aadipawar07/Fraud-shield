@echo off
echo ===============================================
echo Building Fraud Shield APK (With SMS Monitoring)
echo ===============================================

cd frontend\my-app
call npm run prepare-sms-monitoring
call npx eas build --platform android --profile preview

echo Build process initiated. When complete, download the APK from the EAS Dashboard.
echo.
echo NOTE: This process might take several minutes. EAS Build will provide a URL
echo where you can monitor the build progress and download the APK when ready.
