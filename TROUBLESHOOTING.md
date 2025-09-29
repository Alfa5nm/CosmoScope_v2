# Troubleshooting Guide

## Common Installation Issues

### 1. Better-sqlite3 Build Errors (Windows)

**Problem**: `better-sqlite3` fails to build with node-gyp errors.

**Solution**: The project has been updated to use the standard `sqlite3` package instead, which is more compatible across platforms.

If you still encounter issues:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
rm -rf client/node_modules
rm -rf server/node_modules
npm run install:all
```

### 2. Python/Visual Studio Build Tools Issues

**Problem**: Missing Python or Visual Studio Build Tools for native modules.

**Solution**: 
- Install Python 3.x from python.org
- Install Visual Studio Build Tools 2019 or later
- Or use the simplified installation:

```bash
# Use the installation script
# Windows:
install.bat

# Linux/Mac:
chmod +x install.sh
./install.sh
```

### 3. Node.js Version Issues

**Problem**: Incompatible Node.js version.

**Solution**: Use Node.js 18+ (LTS recommended)

```bash
# Check your Node.js version
node --version

# If using nvm, switch to Node 18+
nvm use 18
```

### 4. Port Already in Use

**Problem**: Ports 5173 or 5174 are already in use.

**Solution**: 
```bash
# Kill processes using the ports
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:5173 | xargs kill -9
```

### 5. NASA API Key Issues

**Problem**: NASA API calls failing.

**Solution**:
1. Get a free API key from [NASA API Portal](https://api.nasa.gov/)
2. Edit `server/config.json`:
```json
{
  "NASA_API_KEY": "your_actual_api_key_here",
  "PORT": 5174,
  "ALLOWED_ORIGINS": ["http://localhost:5173"]
}
```

### 6. Database Issues

**Problem**: SQLite database errors.

**Solution**:
```bash
# Delete the database file to recreate it
rm server/db.sqlite

# Or on Windows:
del server\db.sqlite
```

### 7. CORS Issues

**Problem**: CORS errors when accessing the API.

**Solution**: Check that the client is running on the correct port and the server allows the origin in `config.json`.

### 8. Three.js/MapLibre GL Issues

**Problem**: 3D graphics or maps not loading.

**Solution**:
- Ensure WebGL is supported in your browser
- Check browser console for errors
- Try a different browser (Chrome/Firefox recommended)

### 9. Audio Issues

**Problem**: Audio not playing.

**Solution**:
- Modern browsers block autoplay - click the "Enable sound" button
- Check browser audio settings
- Ensure audio files exist in `client/src/assets/audio/`

### 10. Build Issues

**Problem**: Build fails with TypeScript or ESLint errors.

**Solution**:
```bash
# Run type checking
npm run typecheck

# Run linting
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

## Development Tips

### Hot Reload Issues
If changes aren't reflected:
1. Hard refresh the browser (Ctrl+F5)
2. Clear browser cache
3. Restart the development server

### Performance Issues
- Close other applications to free up memory
- Use Chrome DevTools to profile performance
- Check the Network tab for slow requests

### Debug Mode
Enable debug logging:
```bash
# Set environment variable
export DEBUG=cosmoscope:*
npm run dev
```

## Getting Help

1. Check the browser console for errors
2. Check the server logs in the terminal
3. Verify all dependencies are installed correctly
4. Ensure your NASA API key is valid
5. Check that ports 5173 and 5174 are available

## Alternative Installation Methods

### Using Yarn
```bash
# Install yarn if not already installed
npm install -g yarn

# Install dependencies
yarn install
cd client && yarn install && cd ..
cd server && yarn install && cd ..
```

### Using pnpm
```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install dependencies
pnpm install
cd client && pnpm install && cd ..
cd server && pnpm install && cd ..
```

### Docker (Alternative)
If you continue having issues, you can use Docker:

```dockerfile
# Create Dockerfile in project root
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5174
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t cosmoscope .
docker run -p 5174:5174 cosmoscope
```

## Platform-Specific Notes

### Windows
- Use PowerShell or Command Prompt as Administrator if needed
- Ensure Windows Defender isn't blocking the application
- Install Visual Studio Build Tools for native modules

### macOS
- Install Xcode Command Line Tools: `xcode-select --install`
- May need to install Python 3.x

### Linux
- Install build essentials: `sudo apt-get install build-essential`
- Install Python 3.x and development headers
- May need to install additional packages for native modules

## Still Having Issues?

1. Check the GitHub issues page
2. Create a new issue with:
   - Your operating system
   - Node.js version
   - Error messages
   - Steps to reproduce
3. Include the full error log from the terminal
