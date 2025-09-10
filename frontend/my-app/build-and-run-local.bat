@echo off
echo ==========================================
echo Fraud Shield - Local Development Build
echo ==========================================

:: Step 1: Ensure we're in the right directory
cd /d "%~dp0"
echo Current directory: %CD%

:: Step 2: Clear out Metro cache
echo Step 2: Clearing Metro cache...
if exist node_modules\.cache\metro rmdir /s /q node_modules\.cache\metro

:: Step 3: Install dependencies if needed
echo Step 3: Checking dependencies...
call npm install --silent

:: Step 4: Configure Android development environment
echo Step 4: Running Android build...
call npx expo prebuild --platform android --clean
call npx expo run:android --device

echo Build and installation process completed.
