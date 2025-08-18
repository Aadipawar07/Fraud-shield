@echo off
echo 🛡️ Starting Fraud Shield Application...
echo.

echo Starting backend server...
start "Fraud Shield Backend" cmd /k "cd /d D:\Fraud-Shield && npm run backend"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo Starting frontend application...
cd /d "D:\Fraud-Shield\frontend\my-app"
npm start

echo.
echo 🚀 Application started successfully!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:8081
pause
