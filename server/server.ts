import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import { z } from 'zod'

// Import route handlers
import nasaRoutes from './routes/nasa.js'
import userRoutes from './routes/user-simple.js'
import labelsRoutes from './routes/labels-simple.js'

type ExpressError = Error & { type?: string }

// Zod schema for server configuration validation
const ServerConfigSchema = z.object({
  NASA_API_KEY: z.string().min(1, 'NASA_API_KEY is required'),
  PORT: z.number().int().min(1).max(65535, 'PORT must be between 1 and 65535'),
  ALLOWED_ORIGINS: z.array(z.string().url('Each origin must be a valid URL')).min(1, 'At least one origin must be specified'),
  DATABASE_PATH: z.string().min(1, 'DATABASE_PATH is required')
})

type ServerConfig = z.infer<typeof ServerConfigSchema>

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const defaultConfig: ServerConfig = {
  NASA_API_KEY: process.env.NASA_API_KEY ?? 'SET_ME',
  PORT: Number(process.env.PORT ?? 5174),
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:5173'],
  DATABASE_PATH: process.env.DATABASE_PATH ?? './db.sqlite'
}

const loadConfig = (): ServerConfig => {
  const configPath = join(__dirname, 'config.json')
  
  let fileConfig: Partial<ServerConfig> = {}
  
  if (fs.existsSync(configPath)) {
    try {
      const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'))
      fileConfig = rawConfig as Partial<ServerConfig>
      console.log('[config] Loaded configuration from config.json')
    } catch (error) {
      console.error('[config] Error parsing config.json:', error)
      console.log('[config] Falling back to environment variables and defaults')
    }
  } else {
    console.log('[config] No config.json found, using environment variables and defaults')
  }

  // Merge with defaults
  const mergedConfig = {
    NASA_API_KEY: fileConfig.NASA_API_KEY ?? defaultConfig.NASA_API_KEY,
    PORT: fileConfig.PORT ?? defaultConfig.PORT,
    ALLOWED_ORIGINS: fileConfig.ALLOWED_ORIGINS ?? defaultConfig.ALLOWED_ORIGINS,
    DATABASE_PATH: fileConfig.DATABASE_PATH ?? defaultConfig.DATABASE_PATH
  }

  // Validate configuration
  try {
    const validatedConfig = ServerConfigSchema.parse(mergedConfig)
    
    // Log configuration status
    console.log('[config] Configuration validated successfully')
    console.log(`[config] Port: ${validatedConfig.PORT}`)
    console.log(`[config] Database: ${validatedConfig.DATABASE_PATH}`)
    console.log(`[config] Allowed origins: ${validatedConfig.ALLOWED_ORIGINS.join(', ')}`)
    console.log(`[config] NASA API Key: ${validatedConfig.NASA_API_KEY === 'SET_ME' ? 'NOT SET (using default)' : 'CONFIGURED'}`)
    
    // Additional validation warnings
    if (validatedConfig.NASA_API_KEY === 'SET_ME') {
      console.warn('[config] ⚠️  NASA_API_KEY is not configured. Set NASA_API_KEY to avoid rate limits or failures.')
    }
    
    if (validatedConfig.PORT < 1024 && process.getuid && process.getuid() !== 0) {
      console.warn('[config] ⚠️  Port is below 1024 but not running as root. This may cause permission issues.')
    }
    
    if (validatedConfig.ALLOWED_ORIGINS.includes('*')) {
      console.warn('[config] ⚠️  Wildcard origin (*) detected. This allows requests from any domain.')
    }
    
    return validatedConfig
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[config] ❌ Configuration validation failed:')
      error.issues.forEach((err: z.ZodIssue) => {
        console.error(`[config]   - ${err.path.join('.')}: ${err.message}`)
      })
      console.error('[config] Please fix the configuration and restart the server.')
    } else {
      console.error('[config] ❌ Unexpected configuration error:', error)
    }
    process.exit(1)
  }
}

const config = loadConfig()
const app = express()
const PORT = config.PORT

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https:", "http:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}))

app.use(cors({
  origin: config.ALLOWED_ORIGINS,
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Serve static files from client build
app.use(express.static(join(__dirname, '../client/dist')))

// API Routes
app.use('/api', nasaRoutes)
app.use('/api/user', userRoutes)
app.use('/api/labels', labelsRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    config: {
      port: config.PORT,
      hasNasaKey: config.NASA_API_KEY !== 'SET_ME',
      allowedOrigins: config.ALLOWED_ORIGINS.length
    }
  })
})

// Configuration endpoint
app.get('/api/config', (req, res) => {
  res.json({
    supportedLayers: {
      earth: ['blue-marble', 'night-lights', 'thermal', 'elevation'],
      moon: ['lroc', 'elevation'],
      mars: ['ctx', 'elevation']
    },
    timeRanges: {
      earth: {
        start: '2000-01-01',
        end: new Date().toISOString().split('T')[0]
      },
      moon: {
        start: '2009-01-01',
        end: new Date().toISOString().split('T')[0]
      },
      mars: {
        start: '2006-01-01',
        end: new Date().toISOString().split('T')[0]
      }
    }
  })
})

// Catch-all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../client/dist/index.html'))
})

// Error handling middleware
app.use((err: ExpressError, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err)
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON in request body'
    })
  }
  
  const message = process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'

  return res.status(500).json({
    error: 'Internal server error',
    message
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Cosmoscope server running on port ${PORT}`)
  console.log(`📡 NASA API Key: ${config.NASA_API_KEY === 'SET_ME' ? 'NOT SET' : 'CONFIGURED'}`)
  console.log(`🌐 Allowed origins: ${config.ALLOWED_ORIGINS.join(', ')}`)
  console.log(`📁 Database: ${config.DATABASE_PATH}`)
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`)
})

export default app