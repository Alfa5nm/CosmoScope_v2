import express from 'express'
import fs from 'fs'
import { Agent as UndiciAgent } from 'undici'
import { Readable } from 'stream'

const router = express.Router()

// NASA API configuration
const NASA_BASE_URL = 'https://api.nasa.gov'
const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY'

// Proxy NASA API requests
router.get('/apod', async (req, res) => {
  try {
    const { date, count, thumbs } = req.query
    const params = new URLSearchParams()
    
    if (date) params.append('date', date as string)
    if (count) params.append('count', count as string)
    if (thumbs) params.append('thumbs', thumbs as string)
    params.append('api_key', NASA_API_KEY)
    
    const response = await fetch(`${NASA_BASE_URL}/planetary/apod?${params}`)
    const data = await response.json()
    
    res.json(data)
  } catch (error) {
    console.error('NASA APOD API error:', error)
    res.status(500).json({ error: 'Failed to fetch APOD data' })
  }
})

// Get NASA image of the day
router.get('/apod/today', async (req, res) => {
  try {
    const response = await fetch(`${NASA_BASE_URL}/planetary/apod?api_key=${NASA_API_KEY}`)
    const data = await response.json()
    
    res.json(data)
  } catch (error) {
    console.error('NASA APOD API error:', error)
    res.status(500).json({ error: 'Failed to fetch today\'s APOD' })
  }
})

// Get Mars weather data
router.get('/mars-weather', async (req, res) => {
  try {
    const response = await fetch(`${NASA_BASE_URL}/insight_weather/?api_key=${NASA_API_KEY}&feedtype=json&ver=1.0`)
    const data = await response.json()
    
    res.json(data)
  } catch (error) {
    console.error('Mars weather API error:', error)
    res.status(500).json({ error: 'Failed to fetch Mars weather data' })
  }
})

// Get Earth imagery
router.get('/earth-imagery', async (req, res) => {
  try {
    const { lat, lon, date, dim } = req.query
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' })
    }
    
    const params = new URLSearchParams()
    params.append('lat', lat as string)
    params.append('lon', lon as string)
    if (date) params.append('date', date as string)
    if (dim) params.append('dim', dim as string)
    params.append('api_key', NASA_API_KEY)
    
    const response = await fetch(`${NASA_BASE_URL}/planetary/earth/imagery?${params}`)
    const data = await response.json()
    
    return res.json(data)
  } catch (error) {
    console.error('Earth imagery API error:', error)
    return res.status(500).json({ error: 'Failed to fetch Earth imagery' })
  }
})

// Get Earth assets
router.get('/earth-assets', async (req, res) => {
  try {
    const { lat, lon, begin, end } = req.query
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' })
    }
    
    const params = new URLSearchParams()
    params.append('lat', lat as string)
    params.append('lon', lon as string)
    if (begin) params.append('begin', begin as string)
    if (end) params.append('end', end as string)
    params.append('api_key', NASA_API_KEY)
    
    const response = await fetch(`${NASA_BASE_URL}/planetary/earth/assets?${params}`)
    const data = await response.json()
    
    return res.json(data)
  } catch (error) {
    console.error('Earth assets API error:', error)
    return res.status(500).json({ error: 'Failed to fetch Earth assets' })
  }
})

// Get Mars rover photos
router.get('/mars-photos', async (req, res) => {
  try {
    const { rover, sol, camera, page } = req.query
    
    if (!rover) {
      return res.status(400).json({ error: 'Rover name is required' })
    }
    
    const params = new URLSearchParams()
    params.append('rover', rover as string)
    if (sol) params.append('sol', sol as string)
    if (camera) params.append('camera', camera as string)
    if (page) params.append('page', page as string)
    params.append('api_key', NASA_API_KEY)
    
    const response = await fetch(`${NASA_BASE_URL}/mars-photos/api/v1/rovers/${rover}/photos?${params}`)
    const data = await response.json()
    
    return res.json(data)
  } catch (error) {
    console.error('Mars photos API error:', error)
    return res.status(500).json({ error: 'Failed to fetch Mars photos' })
  }
})

// Get Mars rover manifest
router.get('/mars-manifest/:rover', async (req, res) => {
  try {
    const { rover } = req.params
    
    const response = await fetch(`${NASA_BASE_URL}/mars-photos/api/v1/manifests/${rover}?api_key=${NASA_API_KEY}`)
    const data = await response.json()
    
    res.json(data)
  } catch (error) {
    console.error('Mars manifest API error:', error)
    res.status(500).json({ error: 'Failed to fetch Mars manifest' })
  }
})

// Get NASA image and video library search results
router.get('/search', async (req, res) => {
  try {
    const { q, year_start, year_end, media_type, page } = req.query
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' })
    }
    
    const params = new URLSearchParams()
    params.append('q', q as string)
    if (year_start) params.append('year_start', year_start as string)
    if (year_end) params.append('year_end', year_end as string)
    if (media_type) params.append('media_type', media_type as string)
    if (page) params.append('page', page as string)
    params.append('api_key', NASA_API_KEY)
    
    const response = await fetch(`${NASA_BASE_URL}/search?${params}`)
    const data = await response.json()
    
    return res.json(data)
  } catch (error) {
    console.error('NASA search API error:', error)
    return res.status(500).json({ error: 'Failed to search NASA library' })
  }
})

// Get NASA image of the day for a specific date
router.get('/apod/:date', async (req, res) => {
  try {
    const { date } = req.params
    
    const response = await fetch(`${NASA_BASE_URL}/planetary/apod?date=${date}&api_key=${NASA_API_KEY}`)
    const data = await response.json()
    
    res.json(data)
  } catch (error) {
    console.error('NASA APOD API error:', error)
    res.status(500).json({ error: 'Failed to fetch APOD for date' })
  }
})

// Get NASA image of the day for a date range
router.get('/apod/range/:start/:end', async (req, res) => {
  try {
    const { start, end } = req.params
    
    const response = await fetch(`${NASA_BASE_URL}/planetary/apod?start_date=${start}&end_date=${end}&api_key=${NASA_API_KEY}`)
    const data = await response.json()
    
    res.json(data)
  } catch (error) {
    console.error('NASA APOD range API error:', error)
    res.status(500).json({ error: 'Failed to fetch APOD range' })
  }
})

// Proxy NASA WMTS tiles
const GIBS_BASE_URL = 'https://map1.vis.earthdata.nasa.gov/wmts-geo/wmts.cgi'

type GibsTileConfig = {
  type: 'gibs'
  layer: string
  tileMatrixSet: string
  format: 'jpeg' | 'png'
  supportsTime?: boolean
  defaultTime?: string
}

type ArcgisImageConfig = {
  type: 'arcgis-image'
  endpoint: string
  format?: 'PNG' | 'PNG8' | 'PNG24' | 'PNG32' | 'JPG'
}

type IiifTileConfig = {
  type: 'iiif'
  identifier: string
  baseUrl?: string
  format?: 'jpg' | 'jpeg' | 'png'
  size?: number
}

type TileConfig = GibsTileConfig | ArcgisImageConfig | IiifTileConfig

const IIIF_BASE_URL = (process.env.IIIF_BASE_URL || 'http://localhost:8182/iiif/2').replace(/\/+$/, '')
const keepAliveAgent = new UndiciAgent({ connect: { keepAlive: true } })
const fetchWithAgent = (url: string) => fetch(url, { dispatcher: keepAliveAgent } as any)

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

type IiifInfo = {
  width: number
  height: number
  tiles?: Array<{ width: number; height?: number; scaleFactors: number[] }>
}

const iiifInfoCache = new Map<string, IiifInfo>()

const logTile = (message: string) => {
  const timestamp = new Date().toISOString()
  fs.appendFileSync('tile-proxy.log', `[${timestamp}] ${message}
`)
}

const getIiifInfo = async (config: IiifTileConfig): Promise<IiifInfo> => {
  const base = trimTrailingSlash(config.baseUrl || IIIF_BASE_URL)
  const cacheKey = `${base}/${config.identifier}`
  if (iiifInfoCache.has(cacheKey)) {
    return iiifInfoCache.get(cacheKey)!
  }

  const infoUrl = `${base}/${config.identifier}/info.json`
  const response = await fetch(infoUrl)

  if (!response.ok) {
    throw new Error(`IIIF info request failed: ${response.status} ${response.statusText}`)
  }

  const info = (await response.json()) as IiifInfo

  if (!info.width || !info.height) {
    throw new Error('IIIF info.json missing width/height')
  }

  iiifInfoCache.set(cacheKey, info)
  return info
}

const tileSources: Record<string, Record<string, TileConfig>> = {
  earth: {
    base: {
      type: 'gibs',
      layer: 'MODIS_Terra_CorrectedReflectance_TrueColor',
      tileMatrixSet: '250m',
      format: 'jpeg',
      supportsTime: true
    },
    thermal: {
      type: 'gibs',
      layer: 'AIRS_L3_Surface_Air_Temperature_Daily_Day',
      tileMatrixSet: '2km',
      format: 'png',
      supportsTime: true,
      defaultTime: '2021-02-01'
    },
    night: {
      type: 'gibs',
      layer: 'VIIRS_CityLights_2012',
      tileMatrixSet: '500m',
      format: 'jpeg',
      defaultTime: '2012-01-01'
    },
    elevation: {
      type: 'gibs',
      layer: 'SRTM_Color_Index',
      tileMatrixSet: '31.25m',
      format: 'png'
    }
  },
  mars: {
    base: {
      type: 'arcgis-image',
      endpoint: 'https://trek.nasa.gov/mars/trekarcgis/rest/services/Mars_Viking_MDIM21_ClrMosaic_global_232m/ImageServer',
      format: 'PNG'
    },
    thermal: {
      type: 'arcgis-image',
      endpoint: 'https://trek.nasa.gov/mars/trekarcgis/rest/services/Mars_MGS_MOLA_Colorized_DEM_Global_463m/ImageServer',
      format: 'PNG'
    },
    elevation: {
      type: 'arcgis-image',
      endpoint: 'https://trek.nasa.gov/mars/trekarcgis/rest/services/mola128_mola64_merge_90Nto90S_SimpleC_clon0/ImageServer',
      format: 'PNG32'
    },
    night: {
      type: 'arcgis-image',
      endpoint: 'https://trek.nasa.gov/mars/trekarcgis/rest/services/Mars_MGS_MOLA_Colorized_DEM_Global_463m/ImageServer',
      format: 'PNG'
    }
  },
  moon: {
    base: {
      type: 'arcgis-image',
      endpoint: 'https://trek.nasa.gov/moon/trekarcgis/rest/services/LRO_WAC_Mosaic_Global_303ppd_v02/ImageServer',
      format: 'PNG'
    },
    elevation: {
      type: 'arcgis-image',
      endpoint: 'https://trek.nasa.gov/moon/trekarcgis/rest/services/LRO_LOLA_DEM_Global_256ppd_v06/ImageServer',
      format: 'PNG32'
    }
  }
}

type PlanetKey = keyof typeof tileSources
const defaultLayers: Record<string, string> = {
  earth: 'base',
  mars: 'base',
  moon: 'base'
}

const tileToBBox4326 = (z: number, x: number, y: number) => {
  const n = Math.pow(2, z)
  const lonMin = (x / n) * 360 - 180
  const lonMax = ((x + 1) / n) * 360 - 180
  const latRadMax = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)))
  const latRadMin = Math.atan(Math.sinh(Math.PI * (1 - (2 * (y + 1)) / n)))
  const latMax = (latRadMax * 180) / Math.PI
  const latMin = (latRadMin * 180) / Math.PI
  return [lonMin, latMin, lonMax, latMax]
}

const xyzToIiifRegion = (info: IiifInfo, z: number, x: number, y: number) => {
  const tilesPerAxis = Math.pow(2, z)
  const regionWidth = Math.ceil(info.width / tilesPerAxis)
  const regionHeight = Math.ceil(info.height / tilesPerAxis)
  const minX = Math.min(x * regionWidth, info.width)
  const minY = Math.min(y * regionHeight, info.height)
  const width = Math.max(Math.min(regionWidth, info.width - minX), 0)
  const height = Math.max(Math.min(regionHeight, info.height - minY), 0)

  return {
    region: `${minX},${minY},${width},${height}`,
    width,
    height
  }
}

router.get('/tiles/:planet/:layer/:z/:x/:y', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { planet, layer, z, x, y } = req.params
    const { date } = req.query

    const querySuffix = typeof date === 'string' && date.trim().length > 0 ? `?date=${date}` : ''
    console.log(`Proxying tile request: ${planet}/${layer}/${z}/${x}/${y}${querySuffix}`)
    logTile(`Proxying ${planet}/${layer}/${z}/${x}/${y}${querySuffix}`)

    const planetKey = planet as PlanetKey
    const planetSources = tileSources[planetKey]
    if (!planetSources) {
      res.status(404).json({ error: `Planet ${planet} not supported` })
      return
    }

    const fallbackLayer = defaultLayers[planetKey] ?? Object.keys(planetSources)[0]
    const hasRequestedLayer = typeof layer === 'string' && Object.prototype.hasOwnProperty.call(planetSources, layer)
    const targetLayerKey = (hasRequestedLayer ? layer : fallbackLayer) as keyof typeof planetSources | undefined

    if (!targetLayerKey) {
      res.status(404).json({ error: `No tile layers configured for planet ${planet}` })
      return
    }

    const layerConfig = planetSources[targetLayerKey]

    if (!layerConfig) {
      res.status(404).json({ error: `Layer ${layer} not supported for planet ${planet}` })
      return
    }

    const zNum = Number(z)
    const xNum = Number(x)
    const yNum = Number(y)

    if (![zNum, xNum, yNum].every(Number.isFinite)) {
      res.status(400).json({ error: 'Invalid tile coordinates supplied' })
      return
    }

    let upstreamResponse: Response

    if (layerConfig.type === 'gibs') {
      const params = new URLSearchParams({
        SERVICE: 'WMTS',
        REQUEST: 'GetTile',
        VERSION: '1.0.0',
        LAYER: layerConfig.layer,
        STYLE: 'default',
        TILEMATRIXSET: layerConfig.tileMatrixSet,
        TILEMATRIX: String(z),
        TILEROW: String(y),
        TILECOL: String(x),
        FORMAT: `image/${layerConfig.format}`
      })

      const isoDate = typeof date === 'string' ? date.trim() : ''
      if (layerConfig.supportsTime) {
        if (isoDate) {
          params.append('TIME', isoDate)
        } else if (layerConfig.defaultTime) {
          params.append('TIME', layerConfig.defaultTime)
        }
      }

      const gibsUrl = `${GIBS_BASE_URL}?${params.toString()}`
      logTile(`Fetching GIBS tile: ${gibsUrl}`)
      upstreamResponse = await fetchWithAgent(gibsUrl)
    } else if (layerConfig.type === 'arcgis-image') {
      const bbox = tileToBBox4326(zNum, xNum, yNum)
      const params = new URLSearchParams({
        bbox: bbox.join(','),
        bboxSR: '4326',
        imageSR: '4326',
        size: '256,256',
        format: layerConfig.format || 'PNG32',
        transparent: 'true',
        f: 'image'
      })

      const arcgisUrl = `${trimTrailingSlash(layerConfig.endpoint)}/exportImage?${params.toString()}`
      logTile(`Fetching ArcGIS tile: ${arcgisUrl}`)
      upstreamResponse = await fetchWithAgent(arcgisUrl)
    } else {
      const info = await getIiifInfo(layerConfig)
      const { region, width, height } = xyzToIiifRegion(info, zNum, xNum, yNum)

      if (width === 0 || height === 0) {
        res.status(404).json({ error: 'Tile out of bounds' })
      return
      }

      const size = layerConfig.size ?? 256
      const format = layerConfig.format ?? 'jpg'
      const iiifBase = trimTrailingSlash(layerConfig.baseUrl || IIIF_BASE_URL)
      const iiifUrl = `${iiifBase}/${layerConfig.identifier}/${region}/${size},/0/default.${format}`

      logTile(`Fetching IIIF tile: ${iiifUrl}`)
      upstreamResponse = await fetchWithAgent(iiifUrl)
    }

    logTile(`Upstream status: ${upstreamResponse.status}`)
    if (!upstreamResponse.ok) {
      let upstreamBody = ''
      try {
        upstreamBody = await upstreamResponse.text()
      } catch (readError) {
        console.error('Failed to read upstream error body:', readError)
      }

      const errorMsg = `Failed to fetch tile: ${upstreamResponse.status} ${upstreamResponse.statusText} - ${upstreamBody.slice(0, 200)}`
      console.error(errorMsg)
      logTile(errorMsg)
      res.status(upstreamResponse.status).json({ error: 'Failed to fetch tile' })
      return
    }

    const contentType =
      upstreamResponse.headers.get('content-type') ||
      (layerConfig.type === 'gibs' && layerConfig.format === 'jpeg'
        ? 'image/jpeg'
        : layerConfig.type === 'iiif'
          ? `image/${layerConfig.format === 'png' ? 'png' : 'jpeg'}`
          : 'image/png')

    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    })

    if (upstreamResponse.body) {
      try {
        Readable.fromWeb(upstreamResponse.body as any).pipe(res)
        return
      } catch (streamError) {
        console.error('Streaming error:', streamError)
        logTile(`Streaming error: ${streamError instanceof Error ? streamError.message : String(streamError)}`)
      }
    }

    res.status(500).json({ error: 'No response body from upstream tile provider' })
    return
  } catch (error) {
    console.error('Tile proxy error:', error)
    res.status(500).json({ error: 'Failed to proxy tile' })
    return
    return
  }
})


export default router







