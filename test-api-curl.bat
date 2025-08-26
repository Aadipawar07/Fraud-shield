@echo off
echo Testing the fraud detection API...
echo.
echo Sending test message: "Congratulations! You've won $5,000 in our lottery!"
echo.

curl -X POST -H "Content-Type: application/json" -d "{\"message\":\"Congratulations! You've won $5,000 in our lottery!\"}" http://localhost:3002/detect

echo.
echo.
echo Test completed.
pause
