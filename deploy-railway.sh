#!/bin/bash

# Railway Deployment Script for CosmoScope
# This script helps prepare and deploy to Railway

echo "🚀 CosmoScope Railway Deployment Script"
echo "======================================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please log in to Railway:"
    railway login
fi

echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

echo "✅ Build successful!"

echo "🚀 Deploying to Railway..."
railway up

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your app should be available at the Railway URL"
    echo "📊 Check the Railway dashboard for logs and monitoring"
else
    echo "❌ Deployment failed. Check the logs above for errors."
    exit 1
fi
