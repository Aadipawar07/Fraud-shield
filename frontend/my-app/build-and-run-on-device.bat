@echo off
echo ===============================================
echo Building and Running Fraud Shield on Connected Device
echo ===============================================

echo.
echo Step 1: Checking if device is connected...
adb devices | findstr "device$" > nul
if %ERRORLEVEL% NEQ 0 (
    echo No device found. Please make sure:
    echo - Your device is connected via USB
    echo - USB Debugging is enabled on your device
    echo - You've authorized USB debugging on your device
    echo Exiting...
    exit /b 1
) else (
    echo Device detected! Proceeding with build...
)

echo.
echo Step 2: Installing dependencies...
call npm install

echo.
echo Step 3: Cleaning previous builds...
call npx expo prebuild --clean

echo.
echo Step 4: Building development APK locally...
call npx expo run:android --device

echo.
echo ===============================================
echo If the app doesn't start automatically, check:
echo 1. The app might be installed but not launched
echo 2. Look for "Fraud Shield" in your app drawer
echo 3. Check the terminal output for any errors
echo ===============================================
