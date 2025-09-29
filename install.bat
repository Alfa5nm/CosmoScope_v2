@echo off
echo Installing Cosmoscope dependencies...

echo.
echo Installing root dependencies...
npm install

echo.
echo Installing client dependencies...
cd client
npm install
cd ..

echo.
echo Installing server dependencies...
cd server
npm install
cd ..

echo.
echo Creating configuration file...
if not exist "server\config.json" (
    copy "server\config.sample.json" "server\config.json"
    echo Created server\config.json - please edit it with your NASA API key
) else (
    echo Configuration file already exists
)

echo.
echo Installation complete!
echo.
echo Next steps:
echo 1. Edit server\config.json and add your NASA API key
echo 2. Run: npm run dev
echo 3. Open http://localhost:5173
echo.
pause
