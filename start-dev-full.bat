@echo off
echo Starting CosmoScope Full Development Environment...

echo.
echo Starting Cantaloupe Image Server...
start "Cantaloupe" cmd /k "java -Dcantaloupe.config=cantaloupe.properties -Xmx2g -jar cantaloupe-5.0.7.jar"

echo.
echo Starting IIIF Server...
start "IIIF Server" cmd /k "cd server && node iiif-server.js"

echo.
echo Starting Main Server...
start "CosmoScope Server" cmd /k "cd server && node dist/server.js"

echo.
echo Starting Client...
start "CosmoScope Client" cmd /k "cd client && npm run dev"

echo.
echo All services starting...
echo Cantaloupe: http://localhost:8182
echo IIIF Server: http://localhost:8080
echo Main Server: http://localhost:5174
echo Client: http://localhost:5173
echo.
echo Press any key to exit...
pause
