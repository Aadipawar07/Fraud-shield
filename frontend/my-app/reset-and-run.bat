@echo off
echo Resetting Expo Project...

echo 1. Stopping any running Metro processes...
taskkill /f /im node.exe 2>NUL

echo 2. Clearing project cache...
rd /s /q node_modules\.cache 2>NUL
rd /s /q .expo 2>NUL
rd /s /q %TEMP%\metro-* 2>NUL
rd /s /q %APPDATA%\Temp\metro-* 2>NUL

echo 3. Installing dependencies...
npm install

echo 4. Clearing watchman cache...
watchman watch-del-all 2>NUL || echo Watchman not installed or not in PATH

echo 5. Starting web app with cleared cache...
npm run web -- --clear

echo Done!
