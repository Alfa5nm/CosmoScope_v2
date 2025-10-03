@echo off
REM Railway Deployment Script for CosmoScope
REM This script helps prepare and deploy to Railway

echo 🚀 CosmoScope Railway Deployment Script
echo ======================================

REM Check if Railway CLI is installed
where railway >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Railway CLI not found. Installing...
    npm install -g @railway/cli
)

REM Check if user is logged in
railway whoami >nul 2>nul
if %errorlevel% neq 0 (
    echo 🔐 Please log in to Railway:
    railway login
)

echo 📦 Building project...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed. Please fix errors and try again.
    pause
    exit /b 1
)

echo ✅ Build successful!

echo 🚀 Deploying to Railway...
railway up

if %errorlevel% eq 0 (
    echo ✅ Deployment successful!
    echo 🌐 Your app should be available at the Railway URL
    echo 📊 Check the Railway dashboard for logs and monitoring
) else (
    echo ❌ Deployment failed. Check the logs above for errors.
    pause
    exit /b 1
)

pause
