# Fraud Shield Startup Script
Write-Host "🛡️  Starting Fraud Shield Application..." -ForegroundColor Green

# Start backend
Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "backend/index.js" -WorkingDirectory "d:\Fraud-Shield"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend
Write-Host "Starting frontend application..." -ForegroundColor Yellow
Push-Location "d:\Fraud-Shield\frontend\my-app"
Start-Process powershell -ArgumentList "-Command", "npm start -- --tunnel"
Pop-Location

Write-Host "🚀 Application started successfully!" -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "A new window has been opened for the frontend. Scan the QR code in that window with your Expo Go app." -ForegroundColor Cyan