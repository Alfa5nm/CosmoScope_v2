# Environment Variables Setup

## For Render Deployment

Set these environment variables in your Render dashboard:

### Required Variables
```
NODE_ENV=production
PORT=10000
NASA_API_KEY=gXsxpI9UneMEaSbvyVSfd8lFRMKbcicRzdihffxY
ALLOWED_ORIGINS=https://cosmoscope.onrender.com
DATABASE_PATH=/opt/render/project/db.sqlite
```

### Optional Variables
```
TILE_CACHE_ENABLED=false
TILE_CACHE_DIR=/tmp/cache
IIIF_SERVER_PORT=8182
IMAGE_SERVER_PORT=8182
```

## For Railway Deployment

Set these environment variables in your Railway dashboard:

### Required Variables
```
NODE_ENV=production
PORT=3000
NASA_API_KEY=gXsxpI9UneMEaSbvyVSfd8lFRMKbcicRzdihffxY
ALLOWED_ORIGINS=https://your-app-name.railway.app
DATABASE_PATH=/app/db.sqlite
```

### Optional Variables
```
TILE_CACHE_ENABLED=false
TILE_CACHE_DIR=/tmp/cache
IIIF_SERVER_PORT=8182
IMAGE_SERVER_PORT=8182
```

## Important Notes

1. **NASA API Key**: The current key `gXsxpI9UneMEaSbvyVSfd8lFRMKbcicRzdihffxY` is already configured
2. **Database Path**: Make sure the path is writable by the application
3. **CORS Origins**: Update `ALLOWED_ORIGINS` with your actual deployment URL
4. **Port**: Render uses port 10000, Railway uses port 3000
