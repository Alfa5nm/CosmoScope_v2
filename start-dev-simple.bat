@echo off
echo Starting CosmoScope Development Environment...

echo.
echo Starting Main Server...
start "CosmoScope Server" cmd /k "cd server && node dist/server.js"

echo.
echo Starting Client...
start "CosmoScope Client" cmd /k "cd client && npm run dev"

echo.
echo All services starting...
echo Main Server: http://localhost:5174
echo Client: http://localhost:5173
echo.
echo Press any key to exit...
pause
