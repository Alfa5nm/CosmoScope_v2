import React, { useEffect, useRef, useState } from 'react'
import { loadMapLibre, markLibraryLoaded } from '../lib/dynamicImports'
import { getLayerZoomLimits, layerSupportsTime, getPlanetConfig, type PlanetId, type LayerId } from '../config/planetLayers'

const envApiUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const API_BASE_URL = envApiUrl && envApiUrl.length > 0 ? envApiUrl.replace(/\/+$/, '') : ''
const TILE_BASE_PATH = API_BASE_URL ? `${API_BASE_URL}/api/tiles` : '/api/tiles'

const KNOWN_PLANETS: PlanetId[] = ['earth', 'mars', 'moon']

const toPlanetId = (value: string): PlanetId =>
  KNOWN_PLANETS.includes(value as PlanetId) ? (value as PlanetId) : 'earth'

const resolveLayerId = (planetId: PlanetId, candidate: string): LayerId => {
  const planetConfig = getPlanetConfig(planetId)
  const fallback = planetConfig.defaultLayer
  if (planetConfig.layers.some(layer => layer.id === candidate)) {
    return candidate as LayerId
  }
  return fallback
}

const buildTileTemplate = (planetId: PlanetId, layerId: LayerId, date?: string) => {
  const query = layerSupportsTime(planetId, layerId) && date ? `?date=${encodeURIComponent(date)}` : ''
  return `${TILE_BASE_PATH}/${planetId}/${layerId}/{z}/{x}/{y}${query}`
}

// Enhanced error message generation
const generateErrorMessage = (error: any, planet: string, layer: string, date?: string): string => {
  if (typeof error === 'string') {
    return error
  }
  
  if (error?.status) {
    const status = error.status
    const statusText = error.statusText || ''
    
    switch (status) {
      case 404:
        if (date) {
          return `No imagery available for ${planet} on ${date}. Try a different date or check if the layer supports time-series data.`
        }
        return `Layer "${layer}" not found for ${planet}. The server may not support this layer.`
      
      case 403:
        return `Access denied to ${planet} imagery. Check if your NASA API key is configured.`
      
      case 429:
        return `Rate limit exceeded for NASA imagery. Please wait a moment before trying again.`
      
      case 500:
      case 502:
      case 503:
        return `NASA imagery service is temporarily unavailable. Please try again later.`
      
      case 400:
        return `Invalid request for ${planet} imagery. Check the date format and layer parameters.`
      
      default:
        return `Failed to load ${planet} imagery (${status} ${statusText}). Check your connection and try again.`
    }
  }
  
  if (error?.message) {
    if (error.message.includes('ENOBUFS') || error.message.includes('ECONNREFUSED')) {
      return `Cannot connect to the tile server. Make sure the server is running on port 5174.`
    }
    if (error.message.includes('CORS')) {
      return `Cross-origin request blocked. Check server CORS configuration.`
    }
    return error.message
  }
  
  return `Failed to load ${planet} imagery. Check the console for technical details.`
}

const formatErrorDetails = (details: unknown): string | null => {
  if (details == null) {
    return null
  }

  if (typeof details === 'string') {
    return details
  }

  if (details instanceof Error) {
    return `${details.name}: ${details.message}`
  }

  try {
    const seen = new WeakSet<any>()

    return JSON.stringify(
      details,
      (_key, value) => {
        if (value instanceof Error) {
          return {
            name: value.name,
            message: value.message,
            stack: value.stack
          }
        }

        if (typeof Event !== 'undefined' && value instanceof Event) {
          return { type: value.type }
        }

        if (value instanceof Map) {
          return Array.from(value.entries())
        }

        if (value instanceof Set) {
          return Array.from(value.values())
        }

        if (typeof value === 'function') {
          return `[Function ${value.name || 'anonymous'}]`
        }

        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]'
          }
          seen.add(value)
        }

        return value
      },
      2
    )
  } catch (error) {
    console.warn('Failed to format error details', error)
    return 'Unable to display technical details.'
  }
}


interface Map2DProps {
  planet: string
  date: string
  layer: string
  labels: any[]
  onLabelClick: (label: any) => void
}

const Map2D: React.FC<Map2DProps> = ({ planet, date, layer, labels, onLabelClick }) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null) // Will be maplibregl.Map after loading
  const apolloMarkersRef = useRef<any[]>([])
  const userMarkersRef = useRef<any[]>([])
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [maplibregl, setMaplibregl] = useState<any>(null)
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(true)

  const planetId = toPlanetId(planet)
  const layerId = resolveLayerId(planetId, layer)

  // Load MapLibre GL dynamically
  useEffect(() => {
    let isMounted = true

    const loadLibrary = async () => {
      try {
        setIsLoadingLibrary(true)
        const maplibreglModule = await loadMapLibre()
        
        if (isMounted) {
          setMaplibregl(maplibreglModule)
          markLibraryLoaded('maplibre')
          
          // Configure MapLibre
          if ((maplibreglModule as any)?.config) {
            (maplibreglModule as any).config.MAX_PARALLEL_IMAGE_REQUESTS = 8
          }
        }
      } catch (error) {
        console.error('Failed to load MapLibre GL:', error)
        if (isMounted) {
          setErrorMessage('Failed to load map library. Please refresh the page.')
          setHasError(true)
        }
      } finally {
        if (isMounted) {
          setIsLoadingLibrary(false)
        }
      }
    }

    loadLibrary()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!mapContainer.current || !maplibregl || isLoadingLibrary) return

    console.log(`Initializing map for planet: ${planet}`)

    const baseLayerLimits = getLayerZoomLimits(planetId, 'base')
    const initialZoom = Math.min(planetId === 'earth' ? 2 : planetId === 'moon' ? 3 : 2, baseLayerLimits.max)

    // Build tile URL for debugging
    const tileTemplate = buildTileTemplate(planetId, 'base', date)
    const testTileUrl = tileTemplate.replace('{z}', '0').replace('{x}', '0').replace('{y}', '0')
    console.log('Tile template:', tileTemplate)

    // Test if the tile URL is accessible
    fetch(testTileUrl)
      .then(async response => {
        console.log('Tile fetch test:', response.status, response.ok)
        if (!response.ok) {
          let message = `${response.status} ${response.statusText}`
          let details = null
          try {
            const data = await response.clone().json() as any
            details = data
            if (typeof data === 'string') {
              message = data
            } else if (data?.details) {
              message = data.details
            } else if (data?.error) {
              message = data.error
            }
          } catch (parseError) {
            console.warn('Failed to parse tile error response:', parseError)
          }
          
          const enhancedMessage = generateErrorMessage(
            { status: response.status, statusText: response.statusText, message, details },
            planet,
            layer,
            date
          )
          
          console.error('Tile URL not accessible:', enhancedMessage)
          setErrorMessage(enhancedMessage)
          setErrorDetails(formatErrorDetails(details))
          setHasError(true)
        } else {
          setErrorMessage(null)
          setErrorDetails(null)
          setHasError(false)
        }
      })
      .catch(error => {
        console.error('Tile fetch error:', error)
        const enhancedMessage = generateErrorMessage(error, planet, layer, date)
        setErrorMessage(enhancedMessage)
        setErrorDetails(formatErrorDetails(error))
        setHasError(true)
      })

    // Initialize MapLibre GL with a fallback style
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'base-layer': {
            type: 'raster',
            tiles: [
              // Use our backend proxy for NASA tiles
              tileTemplate
            ],
            tileSize: 256,
            minzoom: baseLayerLimits.min,
            maxzoom: baseLayerLimits.max
          }
        },
        layers: [
          {
            id: 'base-layer',
            type: 'raster',
            source: 'base-layer',
            paint: {
              'raster-opacity': 1
            }
          }
        ]
      },
      center: planet === 'earth' ? [0, 0] : planet === 'moon' ? [0, 0] : [0, 0],
      zoom: initialZoom,
      maxZoom: baseLayerLimits.max,
      minZoom: baseLayerLimits.min,
      renderWorldCopies: false
    })

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right')

    // Handle map load
    map.current.on('load', () => {
      console.log('Map loaded successfully')
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
        loadTimeoutRef.current = null
      }
      setIsLoaded(true)
      hideError()
      addApolloMarkers()
      addUserLabels()
    })

    const showError = (message?: string, details?: any) => {
      if (message) {
        const enhancedMessage = generateErrorMessage(message, planet, layer, date)
        setErrorMessage(enhancedMessage)
      }
      setErrorDetails(formatErrorDetails(details))
      setHasError(true)
    }

    const hideError = () => {
      setHasError(false)
      setErrorMessage(null)
      setErrorDetails(null)
    }

    loadTimeoutRef.current = window.setTimeout(() => {
      if (!isLoaded) {
        console.warn('Map tiles taking too long to load, showing error')
        showError('Map tiles are taking too long to load. This might indicate a server connection issue.')
      }
    }, 10000)

    // Handle map errors
    map.current.on('error', (e: any) => {
      console.error('Map error:', e)
      showError('Map rendering error', e)
    })

    // Handle source errors
    map.current.on('sourcedata', (e: any) => {
      if (e.isSourceLoaded && e.sourceId === 'base-layer') {
        console.log('Base layer loaded')
        if (loadTimeoutRef.current) {
          clearTimeout(loadTimeoutRef.current)
          loadTimeoutRef.current = null
        }
        hideError()
      }
    })

    // Handle tile loading errors
    map.current.on('sourcedata', (e: any) => {
      if (e.sourceId === 'base-layer') {
        if (e.isSourceLoaded) {
          console.log('Base layer source loaded successfully')
        } else if (e.tile) {
          console.log('Tile loaded:', e.tile.url)
        }
      }
    })

    // Add more detailed tile loading events
    map.current.on('sourcedata', (e: any) => {
      if (e.sourceId === 'base-layer') {
        console.log('Source data event:', e)
        if (e.tile) {
          console.log('Tile event:', e.tile)
          if (e.tile.state === 'errored') {
            console.error('Tile failed to load:', e.tile.url)
            showError('Individual tile failed to load', { tileUrl: e.tile.url })
          }
        }
      }
    })

    // Handle raster source errors
    map.current.on('error', (e: any) => {
      console.error('MapLibre error:', e)
    })

    // Handle window resize
    const handleResize = () => {
      if (map.current) {
        map.current.resize()
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current)
        loadTimeoutRef.current = null
      }
      window.removeEventListener('resize', handleResize)

      apolloMarkersRef.current.forEach(marker => marker.remove())
      apolloMarkersRef.current = []

      userMarkersRef.current.forEach(marker => marker.remove())
      userMarkersRef.current = []

      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [planetId, date, maplibregl, isLoadingLibrary])

  useEffect(() => {
    if (!map.current || !isLoaded) return

    console.log(`Switching to layer: ${layerId} for planet: ${planetId}`)

    const sourceId = 'current-layer'

    if (map.current.getSource(sourceId)) {
      map.current.removeLayer('current-layer')
      map.current.removeSource(sourceId)
    }

    const zoomLimits = getLayerZoomLimits(planetId, layerId)
    const currentZoom = map.current.getZoom()
    const clampedZoom = Math.min(Math.max(currentZoom, zoomLimits.min), zoomLimits.max)
    if (clampedZoom !== currentZoom) {
      map.current.jumpTo({ zoom: clampedZoom })
    }
    map.current.setMaxZoom(zoomLimits.max)
    map.current.setMinZoom(zoomLimits.min)

    map.current.addSource(sourceId, {
      type: 'raster',
      tiles: [`${buildTileTemplate(planetId, layerId, date)}`],
      tileSize: 256,
      minzoom: zoomLimits.min,
      maxzoom: zoomLimits.max
    })

    map.current.addLayer({
      id: 'current-layer',
      type: 'raster',
      source: sourceId,
      paint: {
        'raster-opacity': 0.8
      }
    })
  }, [layerId, date, planetId, isLoaded])

  const addApolloMarkers = () => {
    if (!map.current || planet !== 'moon') return

    apolloMarkersRef.current.forEach(marker => marker.remove())
    apolloMarkersRef.current = []

    const apolloSites = [
      { id: 'apollo-11', name: 'Apollo 11', coordinates: [23.4730, 0.6741], date: '1969-07-20' },
      { id: 'apollo-12', name: 'Apollo 12', coordinates: [-23.4216, -3.0126], date: '1969-11-19' },
      { id: 'apollo-14', name: 'Apollo 14', coordinates: [-17.4714, -3.6453], date: '1971-01-31' },
      { id: 'apollo-15', name: 'Apollo 15', coordinates: [3.6339, 26.1322], date: '1971-07-26' },
      { id: 'apollo-16', name: 'Apollo 16', coordinates: [15.5002, -8.9730], date: '1972-04-16' },
      { id: 'apollo-17', name: 'Apollo 17', coordinates: [30.7717, 20.1908], date: '1972-12-07' }
    ]

    apolloSites.forEach(site => {
      // Create marker element
      const markerElement = document.createElement('div')
      markerElement.className = 'apollo-marker'
      markerElement.style.cssText = `
        width: 20px;
        height: 20px;
        background: #00ffff;
        border: 2px solid #ffffff;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 0 10px #00ffff;
        transition: all 0.3s ease;
      `

      // Add hover effect
      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.transform = 'scale(1.2)'
        markerElement.style.boxShadow = '0 0 20px #00ffff'
      })

      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.transform = 'scale(1)'
        markerElement.style.boxShadow = '0 0 10px #00ffff'
      })

      // Add click handler
      markerElement.addEventListener('click', (e) => {
        e.stopPropagation()
        onLabelClick({
          id: site.id,
          name: site.name,
          type: 'apollo',
          coordinates: site.coordinates,
          date: site.date
        })
      })

      // Create popup
      const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(`
        <div style="color: #00ffff; font-family: 'Courier New', monospace;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">
            ${site.name}
          </h3>
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">
            Landing Date: ${site.date}
          </p>
          <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.6;">
            Click to learn more
          </p>
        </div>
      `)

      const marker = new maplibregl.Marker({
        element: markerElement
      })
        .setLngLat(site.coordinates as [number, number])
        .setPopup(popup)
        .addTo(map.current!)

      apolloMarkersRef.current.push(marker)
    })
  }

  const addUserLabels = () => {
    if (!map.current) return

    userMarkersRef.current.forEach(marker => marker.remove())
    userMarkersRef.current = []

    labels.forEach(label => {
      if (label.planet !== planet) return

      const markerElement = document.createElement('div')
      markerElement.className = 'user-label-marker'
      markerElement.style.cssText = `
        width: 16px;
        height: 16px;
        background: #ff0088;
        border: 2px solid #ffffff;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 0 8px #ff0088;
        transition: all 0.3s ease;
      `

      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.transform = 'scale(1.2)'
        markerElement.style.boxShadow = '0 0 16px #ff0088'
      })

      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.transform = 'scale(1)'
        markerElement.style.boxShadow = '0 0 8px #ff0088'
      })

      markerElement.addEventListener('click', (e) => {
        e.stopPropagation()
        onLabelClick(label)
      })

      const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(`
        <div style="color: #ff0088; font-family: 'Courier New', monospace;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">
            ${label.name}
          </h3>
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">
            ${label.description || 'User annotation'}
          </p>
          <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.6;">
            Created: ${new Date(label.createdAt).toLocaleDateString()}
          </p>
        </div>
      `)

      const marker = new maplibregl.Marker({
        element: markerElement
      })
        .setLngLat(label.coordinates as [number, number])
        .setPopup(popup)
        .addTo(map.current!)

      userMarkersRef.current.push(marker)
    })
  }

  useEffect(() => {
    if (isLoaded) {
      addUserLabels()
    }
  }, [labels, isLoaded])

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: planet === 'earth' ? '#1a4d8c' : planet === 'moon' ? '#8c8c8c' : '#8b4513'
      }}
    >
      {/* Fallback content if map fails to load */}
      {(!isLoaded || isLoadingLibrary) && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#00ffff',
          textAlign: 'center',
          fontFamily: 'Courier New, monospace',
          zIndex: 10
        }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>
            {planet === 'earth' ? '🌍' : planet === 'moon' ? '🌙' : '🔴'}
          </div>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>
            {planet.charAt(0).toUpperCase() + planet.slice(1)}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.7 }}>
            {isLoadingLibrary ? 'Loading map library...' : 'Loading map tiles...'}
          </div>
        </div>
      )}

      {/* Enhanced error overlay with specific messages */}
      {hasError && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            right: '10px',
            background: 'rgba(255, 0, 0, 0.9)',
            color: 'white',
            padding: '16px',
            borderRadius: '8px',
            fontFamily: 'Courier New, monospace',
            fontSize: '14px',
            zIndex: 1000,
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '18px', marginRight: '8px' }}>⚠️</span>
            <strong style={{ fontSize: '16px' }}>Map Loading Error</strong>
          </div>
          
          <div style={{ marginBottom: '12px', lineHeight: 1.4 }}>
            {errorMessage}
          </div>
          
          {/* Action suggestions based on error type */}
          <div style={{ fontSize: '12px', opacity: 0.9, borderTop: '1px solid rgba(255, 255, 255, 0.3)', paddingTop: '8px' }}>
            {errorMessage?.includes('server') && (
              <div>💡 Try refreshing the page or check if the server is running</div>
            )}
            {errorMessage?.includes('date') && (
              <div>💡 Try selecting a different date or layer</div>
            )}
            {errorMessage?.includes('API key') && (
              <div>💡 Check your NASA API key configuration</div>
            )}
            {errorMessage?.includes('Rate limit') && (
              <div>💡 Wait a moment before trying again</div>
            )}
            {errorMessage?.includes('CORS') && (
              <div>💡 Check server CORS settings</div>
            )}
          </div>
          
          {/* Technical details (collapsible) */}
          {errorDetails && (
            <details style={{ marginTop: '8px', fontSize: '11px', opacity: 0.8 }}>
              <summary style={{ cursor: 'pointer', marginBottom: '4px' }}>Technical Details</summary>
              <pre style={{ 
                background: 'rgba(0, 0, 0, 0.3)', 
                padding: '8px', 
                borderRadius: '4px', 
                overflow: 'auto',
                maxHeight: '100px',
                fontSize: '10px'
              }}>
                {errorDetails}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  )
}

export default Map2D