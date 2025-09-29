@echo off
echo Starting Cosmoscope Development Environment...
echo.

echo Starting Client (React + Vite)...
start "Client" cmd /k "cd client && npm run dev"

echo Starting Server (Node.js + Express)...
start "Server" cmd /k "cd server && npm run dev"

echo Starting Cantaloupe (Java Image Server)...
start "Cantaloupe" cmd /k "\"C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot\bin\java.exe\" -Dcantaloupe.config=./cantaloupe.properties -Xmx2g -jar D:/Softwares/cantaloupe-5.0.7_1/cantaloupe-5.0.7/cantaloupe-5.0.7.jar"

echo Starting IIIF Server...
start "IIIF" cmd /k "cd server && node iiif-server.js"

echo.
echo All services starting...
echo - Client: http://localhost:5173 (or next available port)
echo - Server: http://localhost:5174 (or next available port)  
echo - Cantaloupe: http://localhost:8182
echo - IIIF Server: http://localhost:8080
echo.
echo Press any key to exit...
pause > nul
