# Railway Deployment Guide for CosmoScope

## Overview
This guide will help you deploy CosmoScope to Railway, a modern cloud platform for deploying applications.

## Prerequisites
- GitHub repository with CosmoScope code
- Railway account (free tier available)
- NASA API key

## Step 1: Prepare Your Repository

The repository is already configured for Railway deployment with:
- `railway.json` - Railway configuration
- `nixpacks.toml` - Build configuration
- Proper `package.json` scripts
- Environment variable handling

## Step 2: Deploy to Railway

### Option A: Deploy from GitHub
1. Go to [Railway.app](https://railway.app)
2. Sign in with your GitHub account
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your CosmoScope repository
5. Railway will automatically detect the configuration

### Option B: Deploy with Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy from your project directory
railway up
```

## Step 3: Configure Environment Variables

In the Railway dashboard, go to your project → Variables tab and set:

### Required Variables
```
NODE_ENV=production
PORT=3000
NASA_API_KEY=your_actual_nasa_api_key
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

## Step 4: Build Configuration

Railway will automatically:
1. Install dependencies with `npm run install:all`
2. Build the project with `npm run build`
3. Start the server with `npm start`

## Step 5: Database Setup

The SQLite database will be created automatically on first run. Railway provides persistent storage for the database file.

## Step 6: Custom Domain (Optional)

1. Go to your project → Settings → Domains
2. Add a custom domain if desired
3. Update `ALLOWED_ORIGINS` to include your custom domain

## Railway vs Render Comparison

| Feature | Railway | Render |
|---------|---------|--------|
| Free Tier | 500 hours/month | 750 hours/month |
| Build Time | ~2-3 minutes | ~3-5 minutes |
| Cold Start | ~10-15 seconds | ~30-60 seconds |
| Database | Built-in PostgreSQL | External services |
| File Storage | Persistent volumes | Ephemeral |
| Configuration | `railway.json` | `render.yaml` |

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Ensure TypeScript compilation succeeds
   - Verify Node.js version compatibility

2. **Environment Variables**
   - Make sure all required variables are set
   - Check variable names match exactly
   - Verify NASA API key is valid

3. **Database Issues**
   - SQLite database is created automatically
   - Check file permissions in Railway logs
   - Ensure `DATABASE_PATH` is writable

4. **CORS Issues**
   - Update `ALLOWED_ORIGINS` with your Railway URL
   - Check that the URL format is correct
   - Include both HTTP and HTTPS if needed

### Logs and Debugging

1. View logs in Railway dashboard
2. Use `railway logs` command
3. Check build logs for compilation errors
4. Monitor resource usage

## Cost Optimization

### Free Tier Limits
- 500 hours of execution time per month
- 1GB RAM, 1GB storage
- Automatic sleep after 5 minutes of inactivity

### Paid Plans
- $5/month for always-on service
- More resources and features
- Custom domains and SSL

## Monitoring

Railway provides:
- Real-time logs
- Resource usage metrics
- Deployment history
- Health checks

## Security Considerations

1. **Environment Variables**
   - Never commit API keys to repository
   - Use Railway's secure variable storage
   - Rotate keys regularly

2. **CORS Configuration**
   - Only allow necessary origins
   - Use HTTPS in production
   - Validate all incoming requests

3. **Database Security**
   - SQLite files are stored securely
   - Regular backups recommended
   - Monitor access patterns

## Performance Tips

1. **Build Optimization**
   - Use `npm ci` for faster installs
   - Minimize dependencies
   - Optimize TypeScript compilation

2. **Runtime Optimization**
   - Enable caching where possible
   - Use connection pooling
   - Monitor memory usage

3. **Cold Start Reduction**
   - Keep dependencies minimal
   - Use efficient startup code
   - Consider always-on plan for production

## Support

- Railway Documentation: https://docs.railway.app
- Community Discord: https://discord.gg/railway
- GitHub Issues: Use your repository's issue tracker

## Next Steps

After successful deployment:
1. Test all functionality
2. Set up monitoring
3. Configure custom domain
4. Set up CI/CD pipeline
5. Plan for scaling

Your CosmoScope application should now be running on Railway! 🚀
