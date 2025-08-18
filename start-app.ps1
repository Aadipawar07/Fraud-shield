# Fraud Shield Startup Script
Write-Host "🛡️  Starting Fraud Shield Application..." -ForegroundColor Green

# Start backend
Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "backend/index.js" -WorkingDirectory "D:\Fraud-Shield"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting frontend application..." -ForegroundColor Yellow
Set-Location "D:\Fraud-Shield\frontend\my-app"
npm start

Write-Host "🚀 Application started successfully!" -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:8081" -ForegroundColor Cyan
