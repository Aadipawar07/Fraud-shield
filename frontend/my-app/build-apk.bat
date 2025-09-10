@echo off
echo ==========================================
echo Fraud Shield - Fixed Build Script
echo ==========================================

:: Step 1: Ensure we're in the right directory
cd /d "%~dp0"
echo Current directory: %CD%

:: Step 2: Clear out Metro cache
echo Step 2: Clearing Metro cache...
if exist node_modules\.cache\metro rmdir /s /q node_modules\.cache\metro

:: Step 3: Run the fix build errors script
echo Step 3: Running build error fix script...
node ./scripts/fix-build-errors.js

:: Step 4: Use the complete-build-fix batch file with EAS_NO_VCS=1
echo Step 4: Running remote build with EAS...
set EAS_NO_VCS=1
call npx eas build --platform android --profile preview --non-interactive

echo Build process initiated. Follow the build status in the EAS dashboard.
