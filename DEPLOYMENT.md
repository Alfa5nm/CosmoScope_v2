# CosmoScope Deployment Guide

## 🚀 Render Deployment

### Prerequisites
- GitHub repository with your code
- NASA API key (get from https://api.nasa.gov/)
- Render account (free tier available)

### Step 1: Prepare Your Repository

1. **Remove sensitive files:**
   ```bash
   # These should already be in .gitignore
   rm server/config.json
   rm *.sqlite
   rm *.log
   ```

2. **Set up environment variables:**
   - Copy `env.example` to `.env` (for local development)
   - Set your NASA API key in the environment variables

### Step 2: Deploy to Render

1. **Connect your GitHub repository to Render**
2. **Create a new Web Service**
3. **Configure the service:**
   - **Build Command:** `npm run install:all && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node

4. **Set Environment Variables in Render:**
   ```
   NASA_API_KEY=your_nasa_api_key_here
   NODE_ENV=production
   PORT=10000
   ALLOWED_ORIGINS=https://your-app-name.onrender.com
   DATABASE_PATH=/opt/render/project/src/db.sqlite
   TILE_CACHE_ENABLED=false
   ```

### Step 3: Verify Deployment

1. **Check the logs** for any errors
2. **Test the health endpoint:** `https://your-app-name.onrender.com/api/health`
3. **Test the main application:** `https://your-app-name.onrender.com`

## 🔧 Local Development

### Quick Start
```bash
# Install dependencies
npm run install:all

# Start development servers
npm run dev:full

# Or start with image processing
npm run dev:with-images
```

### Available Commands
- `npm run dev` - Basic development (client + server)
- `npm run dev:full` - Full development with all services
- `npm run dev:with-images` - Development with image processing
- `npm run build` - Build for production
- `npm start` - Start production server

## 📁 Project Structure

```
cosmoscope/
├── client/                 # React frontend
├── server/                 # Node.js backend
├── images/                 # Static images
├── public/                 # Public assets
├── render.yaml            # Render configuration
├── env.example            # Environment variables template
└── package.json           # Root package configuration
```

## 🚨 Troubleshooting

### Common Issues

1. **NASA API Key not set:**
   - Get a free key from https://api.nasa.gov/
   - Set it in Render environment variables

2. **Database issues:**
   - SQLite database is created automatically
   - Check file permissions on Render

3. **CORS errors:**
   - Update ALLOWED_ORIGINS in environment variables
   - Include your Render domain

4. **Build failures:**
   - Check Node.js version (18+ required)
   - Verify all dependencies are installed

### Support
- Check the logs in Render dashboard
- Review the troubleshooting guide
- Check NASA API status if tiles aren't loading
