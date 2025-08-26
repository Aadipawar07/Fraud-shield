@echo off
echo Testing fraud detection API...
echo.
echo Sending fraud message test...
curl -X POST -H "Content-Type: application/json" -d "{\"message\":\"CONGRATULATIONS! You've won $5,000 in our lottery.\"}" http://localhost:3002/detect
echo.
echo.
echo Sending normal message test...
curl -X POST -H "Content-Type: application/json" -d "{\"message\":\"Hey, can you pick up milk on your way home?\"}" http://localhost:3002/detect
echo.
echo.
pause
