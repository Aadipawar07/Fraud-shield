@echo off
echo Restarting the Fraud Shield Backend...

echo Checking for processes using port 3002...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002') do (
    set pid=%%a
    goto :found
)

:found
if not defined pid (
    echo No process found using port 3002.
) else (
    echo Found process using port 3002: %pid%
    echo Terminating process...
    taskkill /F /PID %pid%
)

echo Starting the backend server...
cd /d %~dp0backend
node index.js
