import React, { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

if ((maplibregl as any)?.config) {
  ;(maplibregl as any).config.MAX_PARALLEL_IMAGE_REQUESTS = 8
}

const envApiUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const API_BASE_URL = envApiUrl && envApiUrl.length > 0 ? envApiUrl.replace(/\/+$/, '') : ''
const TILE_BASE_PATH = API_BASE_URL ? `${API_BASE_URL}/api/tiles` : '/api/tiles'

const buildTileTemplate = (planet: string, layerId: string, date?: string) => {
  const query = date ? `?date=${encodeURIComponent(date)}` : ''
  return `${TILE_BASE_PATH}/${planet}/${layerId}/{z}/{x}/{y}${query}`
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
  const map = useRef<maplibregl.Map | null>(null)
  const apolloMarkersRef = useRef<maplibregl.Marker[]>([])
  const userMarkersRef = useRef<maplibregl.Marker[]>([])
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!mapContainer.current) return

    console.log(`Initializing map for planet: ${planet}`)

    const initialZoom = planet === 'earth' ? 2 : planet === 'moon' ? 3 : 2
    const maxZoom = planet === 'earth' ? 9 : planet === 'moon' ? 11 : 11

    // Build tile URL for debugging
    const tileUrl = buildTileTemplate(planet, 'base', date)
    console.log('Tile URL:', tileUrl)

    // Test if the tile URL is accessible
    fetch(tileUrl)
      .then(response => {
        console.log('Tile fetch test:', response.status, response.ok)
        if (!response.ok) {
          console.error('Tile URL not accessible:', response.status, response.statusText)
          setHasError(true)
        }
      })
      .catch(error => {
        console.error('Tile fetch error:', error)
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
              tileUrl
            ],
            tileSize: 256,
            minzoom: 0,
            maxzoom: 18
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
      maxZoom,
      minZoom: 0,
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

    const showError = () => {
      setHasError(true)
      const errorDiv = document.getElementById('map-error')
      if (errorDiv) {
        errorDiv.style.display = 'block'
      }
    }

    const hideError = () => {
      setHasError(false)
      const errorDiv = document.getElementById('map-error')
      if (errorDiv) {
        errorDiv.style.display = 'none'
      }
    }

    loadTimeoutRef.current = window.setTimeout(() => {
      if (!isLoaded) {
        console.warn('Map tiles taking too long to load, showing error')
        showError()
      }
    }, 10000)

    // Handle map errors
    map.current.on('error', (e) => {
      console.error('Map error:', e)
      showError()
    })

    // Handle source errors
    map.current.on('sourcedata', (e) => {
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
    map.current.on('sourcedata', (e) => {
      if (e.sourceId === 'base-layer') {
        if (e.isSourceLoaded) {
          console.log('Base layer source loaded successfully')
        } else if (e.tile) {
          console.log('Tile loaded:', e.tile.url)
        }
      }
    })

    // Add more detailed tile loading events
    map.current.on('sourcedata', (e) => {
      if (e.sourceId === 'base-layer') {
        console.log('Source data event:', e)
        if (e.tile) {
          console.log('Tile event:', e.tile)
          if (e.tile.state === 'errored') {
            console.error('Tile failed to load:', e.tile.url)
            showError()
          }
        }
      }
    })

    // Handle raster source errors
    map.current.on('error', (e) => {
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
  }, [planet, date])

  useEffect(() => {
    if (!map.current || !isLoaded) return

    console.log(`Switching to layer: ${layer} for planet: ${planet}`)

    // Update layer when layer prop changes
    const sourceId = 'current-layer'
    
    // Remove existing source if it exists
    if (map.current.getSource(sourceId)) {
      map.current.removeLayer('current-layer')
      map.current.removeSource(sourceId)
    }

    // Add new source using our backend proxy
    map.current.addSource(sourceId, {
      type: 'raster',
      tiles: [`${buildTileTemplate(planet, layer, date)}`],
      tileSize: 256
    })

    // Add new layer
    map.current.addLayer({
      id: 'current-layer',
      type: 'raster',
      source: sourceId,
      paint: {
        'raster-opacity': 0.8
      }
    })
  }, [layer, date, planet, isLoaded])

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
      {!isLoaded && (
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
            Loading map tiles...
          </div>
        </div>
      )}

      {/* Error overlay if tiles fail to load */}
      {hasError && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          right: '10px',
          background: 'rgba(255, 0, 0, 0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '4px',
          fontFamily: 'Courier New, monospace',
          fontSize: '12px',
          zIndex: 1000
        }}>
          Map tiles failed to load. Check console for details.
        </div>
      )}
    </div>
  )
}

export default Map2D








