import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useCountryStore, type Country, type PointOfInterest } from '../../store/countryStore'
import { useTheme } from '../../lib/ui/theme'
import { useAudio } from '../../lib/audio/AudioContext'

interface CountryOverlayProps {
  planet: 'earth' | 'mars' | 'moon'
  mapContainer: HTMLDivElement | null
  map: any // MapLibre map instance
  onCountrySelect?: (country: Country) => void
  onPOISelect?: (poi: PointOfInterest) => void
}

const CountryOverlay: React.FC<CountryOverlayProps> = ({ 
  planet, 
  mapContainer, 
  map, 
  onCountrySelect, 
  onPOISelect 
}) => {
  const { theme } = useTheme()
  const { playSound } = useAudio()
  // Removed unused layerRef and mapViewState since we're using MapLibre markers
  const [mapLoaded, setMapLoaded] = useState(false)
  const countryMarkersRef = useRef<any[]>([])
  const poiMarkersRef = useRef<any[]>([])
  
  const {
    isEnabled,
    selectedCountry,
    selectedPOI,
    hoveredCountry,
    setSelectedCountry,
    setSelectedPOI,
    setHoveredCountry,
    getCountryByCode,
    getCountriesWithPOI
  } = useCountryStore()

  // Only show for Earth
  if (planet !== 'earth') return null

  const countriesWithPOI = getCountriesWithPOI()

  // Force re-render when map view changes
  const updateMapView = useCallback(() => {
    // Markers will automatically update with map view changes
    // since they're managed by MapLibre
  }, [])

  // Set up map event listeners for view changes
  useEffect(() => {
    if (!map) return

    const events = ['move', 'zoom', 'rotate', 'pitch']
    
    events.forEach(event => {
      map.on(event, updateMapView)
    })

    // Listen for map load event
    const handleMapLoad = () => {
      console.log('Country overlay: Map loaded')
      setMapLoaded(true)
      updateMapView()
    }

    if (map.loaded()) {
      handleMapLoad()
    } else {
      map.on('load', handleMapLoad)
    }

    updateMapView()

    return () => {
      events.forEach(event => {
        map.off(event, updateMapView)
      })
      map.off('load', handleMapLoad)
    }
  }, [map, updateMapView])

  // Add country markers using MapLibre markers
  const addCountryMarkers = useCallback(() => {
    if (!map || !mapLoaded) return

    // Clear existing markers
    countryMarkersRef.current.forEach(marker => marker.remove())
    countryMarkersRef.current = []

    countriesWithPOI.forEach(country => {
      const isSelected = selectedCountry === country.code
      const isHovered = hoveredCountry === country.code

      const markerElement = document.createElement('div')
      markerElement.style.cssText = `
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: ${isSelected 
          ? 'rgba(0, 255, 255, 0.3)' 
          : isHovered 
            ? 'rgba(255, 255, 255, 0.2)' 
            : 'rgba(255, 255, 255, 0.1)'};
        border: ${isSelected 
          ? '3px solid #00ffff' 
          : '2px solid rgba(255, 255, 255, 0.5)'};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        color: white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
        z-index: ${isSelected ? 200 : 100};
        backdrop-filter: blur(2px);
      `
      markerElement.innerHTML = '<span style="font-size: 10px;">🏛️</span>'
      markerElement.title = `${country.name} (${country.pointsOfInterest.length} POIs)`

      markerElement.addEventListener('click', (e) => {
        e.stopPropagation()
        handleCountryClick(country, e as any)
      })

      markerElement.addEventListener('mouseenter', () => {
        setHoveredCountry(country.code)
        playSound('hover')
      })

      markerElement.addEventListener('mouseleave', () => {
        setHoveredCountry(null)
      })

      // Use MapLibre's Marker class for proper positioning
      const marker = new (window as any).maplibregl.Marker({
        element: markerElement
      })
        .setLngLat(country.center)
        .addTo(map)

      countryMarkersRef.current.push(marker)
    })
  }, [map, mapLoaded, countriesWithPOI, selectedCountry, hoveredCountry])

  // Add POI markers using MapLibre markers
  const addPOIMarkers = useCallback(() => {
    if (!map || !mapLoaded) return

    // Clear existing markers
    poiMarkersRef.current.forEach(marker => marker.remove())
    poiMarkersRef.current = []

    countriesWithPOI.forEach(country => {
      country.pointsOfInterest.forEach(poi => {
        const showPOI = selectedCountry === poi.countryCode || selectedCountry === null
        if (!showPOI) return

        const isSelected = selectedPOI === poi.id

        const getCategoryIcon = (category: string) => {
          switch (category) {
            case 'landmark': return '🏛️'
            case 'natural': return '🏔️'
            case 'cultural': return '🎭'
            case 'historical': return '🏺'
            case 'modern': return '🏢'
            default: return '📍'
          }
        }

        const getCategoryColor = (category: string) => {
          switch (category) {
            case 'landmark': return '#ff6b6b'
            case 'natural': return '#51cf66'
            case 'cultural': return '#845ef7'
            case 'historical': return '#fd7e14'
            case 'modern': return '#339af0'
            default: return '#868e96'
          }
        }

        const markerElement = document.createElement('div')
        markerElement.style.cssText = `
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: ${getCategoryColor(poi.category)};
          border: ${isSelected 
            ? '3px solid #00ffff' 
            : '2px solid white'};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          transition: all 0.3s ease;
          z-index: ${isSelected ? 300 : 150};
          transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
        `
        markerElement.innerHTML = getCategoryIcon(poi.category)
        markerElement.title = `${poi.name} - ${poi.category}`

        markerElement.addEventListener('click', (e) => {
          e.stopPropagation()
          handlePOIClick(poi, e as any)
        })

        markerElement.addEventListener('mouseenter', () => {
          markerElement.style.transform = isSelected ? 'scale(1.3)' : 'scale(1.1)'
          playSound('hover')
        })

        markerElement.addEventListener('mouseleave', () => {
          markerElement.style.transform = isSelected ? 'scale(1.2)' : 'scale(1)'
        })

        // Use MapLibre's Marker class for proper positioning
        const marker = new (window as any).maplibregl.Marker({
          element: markerElement
        })
          .setLngLat(poi.coordinates)
          .addTo(map)

        poiMarkersRef.current.push(marker)
      })
    })
  }, [map, mapLoaded, countriesWithPOI, selectedCountry, selectedPOI])

  // Handle country area click
  const handleCountryClick = (country: Country, event: React.MouseEvent) => {
    event.stopPropagation()
    
    if (selectedCountry === country.code) {
      // If already selected, deselect
      setSelectedCountry(null)
    } else {
      // Select country and pan to it
      setSelectedCountry(country.code)
      onCountrySelect?.(country)
      
      // Pan map to country center
      if (map) {
        map.flyTo({
          center: country.center,
          zoom: Math.max(map.getZoom(), 5), // Ensure minimum zoom level
          duration: 1500
        })
      }
    }
    
    playSound('click')
  }

  // Handle POI click
  const handlePOIClick = (poi: PointOfInterest, event: React.MouseEvent) => {
    event.stopPropagation()
    
    if (selectedPOI === poi.id) {
      setSelectedPOI(null)
    } else {
      setSelectedPOI(poi.id)
      onPOISelect?.(poi)
      
      // Pan map to POI location
      if (map) {
        map.flyTo({
          center: poi.coordinates,
          zoom: Math.max(map.getZoom(), 8), // Closer zoom for POI
          duration: 1000
        })
      }
    }
    
    playSound('click')
  }

  // Update markers when dependencies change
  useEffect(() => {
    if (mapLoaded) {
      addCountryMarkers()
    }
  }, [mapLoaded, addCountryMarkers])

  useEffect(() => {
    if (mapLoaded) {
      addPOIMarkers()
    }
  }, [mapLoaded, addPOIMarkers])

  // Cleanup markers on unmount
  useEffect(() => {
    return () => {
      countryMarkersRef.current.forEach(marker => marker.remove())
      poiMarkersRef.current.forEach(marker => marker.remove())
    }
  }, [])


  if (!isEnabled || !mapContainer || !map || !mapLoaded) return null

  return (
    <>
      {/* Country info overlay */}
      {selectedCountry && (
        <div style={{
          position: 'absolute',
          top: theme.spacing.lg,
          left: theme.spacing.lg,
          background: 'rgba(0, 0, 17, 0.95)',
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '8px',
          padding: theme.spacing.md,
          maxWidth: '300px',
          zIndex: 400,
          backdropFilter: theme.effects.blur
        }}>
          {(() => {
            const country = getCountryByCode(selectedCountry)
            if (!country) return null
            
            return (
              <>
                <div style={{
                  color: theme.colors.primary,
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.bold,
                  marginBottom: theme.spacing.sm
                }}>
                  {country.name}
                </div>
                <div style={{
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.fontSize.sm,
                  marginBottom: theme.spacing.sm
                }}>
                  📍 {country.capital} • 👥 {country.population?.toLocaleString()}
                </div>
                <div style={{
                  color: theme.colors.text,
                  fontSize: theme.typography.fontSize.sm,
                  marginBottom: theme.spacing.sm
                }}>
                  🎯 {country.pointsOfInterest.length} Points of Interest
                </div>
                <div style={{
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.fontSize.xs
                }}>
                  Click POI markers to learn more
                </div>
              </>
            )
          })()}
        </div>
      )}
    </>
  )
}

export default CountryOverlay
