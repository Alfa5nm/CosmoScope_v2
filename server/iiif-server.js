import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const DEFAULT_PORT = 8080
const PORT = Number(process.env.IIIF_SERVER_PORT ?? DEFAULT_PORT)

// Enable CORS for all routes
app.use(cors())

// Serve static files from the public directory
app.use(express.static(join(__dirname, '../public')))

// IIIF Image API endpoint
app.get('/iiif/2/:identifier/:region/:size/:rotation/:quality.:format', (req, res) => {
  const { identifier, region, size, rotation, quality, format } = req.params

  // Placeholder response
  res.json({
    '@context': 'http://iiif.io/api/image/2/context.json',
    '@id': `http://localhost:${PORT}/iiif/2/${identifier}`,
    protocol: 'http://iiif.io/api/image',
    width: 2048,
    height: 2048,
    tiles: [
      {
        width: 512,
        height: 512,
        scaleFactors: [1, 2, 4, 8]
      }
    ],
    profile: [
      'http://iiif.io/api/image/2/level2.json',
      {
        formats: ['jpg', 'png'],
        qualities: ['native', 'color', 'gray', 'bitonal'],
        supports: ['regionByPx', 'regionByPct', 'sizeByW', 'sizeByH', 'sizeByPct', 'sizeByConfinedWh', 'sizeByWh', 'rotationBy90s', 'mirroring']
      }
    ]
  })
})

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', service: 'IIIF Server' })
})

const server = app.listen(PORT, () => {
  console.log(`IIIF Server running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})

server.on('error', (error) => {
  if (error && typeof error === 'object' && 'code' in error && error.code === 'EADDRINUSE') {
    console.error(`IIIF Server port ${PORT} is already in use. Set IIIF_SERVER_PORT to a free port.`)
  } else {
    console.error('IIIF Server error:', error)
  }
  process.exit(1)
})
