# Java Setup for Cantaloupe Image Server

## Prerequisites
To run Cantaloupe (the high-performance image server), you need Java 11 or higher installed.

## Installation Steps

### Option 1: Download from Oracle
1. Go to [Oracle Java Downloads](https://www.oracle.com/java/technologies/downloads/)
2. Download Java 17 or 21 (LTS versions recommended)
3. Run the installer and follow the setup wizard
4. Add Java to your PATH environment variable

### Option 2: Use OpenJDK (Recommended)
1. Go to [Adoptium](https://adoptium.net/)
2. Download OpenJDK 17 or 21 for Windows
3. Run the installer
4. The installer should automatically add Java to your PATH

### Option 3: Use Chocolatey (if you have it)
```powershell
choco install openjdk17
```

### Option 4: Use Scoop (if you have it)
```powershell
scoop install openjdk17
```

## Verify Installation
After installing Java, open a new command prompt and run:
```bash
java -version
```

You should see output like:
```
openjdk version "17.0.9" 2023-10-17
OpenJDK Runtime Environment Temurin-17.0.9+9 (build 17.0.9+9)
OpenJDK 64-Bit Server VM Temurin-17.0.9+9 (build 17.0.9+9, mixed mode, sharing)
```

## After Java Installation
Once Java is installed, you can run:
```bash
npm run dev:full
```

This will start:
- Client (React + Vite) on http://localhost:5173
- Server (Node.js + Express) on http://localhost:5174
- IIIF Server on http://localhost:8080
- Cantaloupe on http://localhost:8182

## Troubleshooting
- If Java is not recognized, restart your command prompt/terminal
- Make sure Java is added to your PATH environment variable
- Check that you have Java 11+ installed (not just JRE)
