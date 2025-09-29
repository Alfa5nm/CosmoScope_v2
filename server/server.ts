import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

// Import route handlers
import nasaRoutes from './routes/nasa.js'
import userRoutes from './routes/user-simple.js'
import labelsRoutes from './routes/labels-simple.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5174

// Load configuration
let config: any = {}
try {
  const configPath = join(__dirname, 'config.json')
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
  } else {
    // Load from environment variables
    config = {
      NASA_API_KEY: process.env.NASA_API_KEY || 'SET_ME',
      PORT: process.env.PORT || 5174,
      ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
      DATABASE_PATH: process.env.DATABASE_PATH || './db.sqlite'
    }
  }
} catch (error) {
  console.error('Error loading configuration:', error)
  process.exit(1)
}

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
    version: '1.0.0'
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
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON in request body'
    })
  }
  
  return res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
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
})

export default app
