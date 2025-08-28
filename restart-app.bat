@echo off
echo Restarting Metro Server and App...

:: Kill any running Metro processes
taskkill /f /im node.exe 2>NUL

:: Wait a moment
timeout /t 2 /nobreak > NUL

:: Clear Metro cache
cd frontend\my-app
echo Clearing cache...
npx expo start --clear

:: Done
echo App should restart with the new changes.
