import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useAnnotationStore, type Annotation } from '../../store/annotationStore'
import { useTheme } from '../../lib/ui/theme'
import { useAudio } from '../../lib/audio/AudioContext'

interface AnnotationLayerProps {
  planet: 'earth' | 'mars' | 'moon'
  mapContainer: HTMLDivElement | null
  map: any // MapLibre map instance
}

const AnnotationLayer: React.FC<AnnotationLayerProps> = ({ planet, mapContainer, map }) => {
  const { theme } = useTheme()
  const { playSound } = useAudio()
  const layerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingPath, setDrawingPath] = useState<number[][]>([])
  const [mapViewState, setMapViewState] = useState(0) // Force re-renders on map changes
  
  const {
    isEnabled,
    activeMode,
    selectedAnnotation,
    addAnnotation,
    selectAnnotation,
    setActiveMode,
    setIsCreating,
    getAnnotationsByPlanet,
    toggleAnnotationMode
  } = useAnnotationStore()

  const planetAnnotations = getAnnotationsByPlanet(planet)

  // Force re-render when map view changes
  const updateMapView = useCallback(() => {
    console.log('Annotation layer: Map view updated')
    setMapViewState(prev => prev + 1)
  }, [])

  // Convert map coordinates to screen coordinates
  const mapToScreen = (lng: number, lat: number) => {
    if (!map || !mapContainer) return { x: 0, y: 0 }
    
    try {
      const point = map.project([lng, lat])
      return {
        x: point.x,
        y: point.y
      }
    } catch (error) {
      console.warn('Error projecting coordinates:', error)
      return { x: 0, y: 0 }
    }
  }

  // Convert screen coordinates to map coordinates
  const screenToMap = (x: number, y: number) => {
    if (!map || !mapContainer) return [0, 0]
    
    const point = map.unproject([x, y])
    
    return [point.lng, point.lat]
  }

  // Handle click events for creating annotations
  const handleLayerClick = (event: React.MouseEvent) => {
    if (!isEnabled || !activeMode || !map) return

    event.preventDefault()
    event.stopPropagation()

    const rect = mapContainer?.getBoundingClientRect()
    if (!rect) return

    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const [lng, lat] = screenToMap(x, y)

    playSound('click')

    switch (activeMode) {
      case 'point':
        handlePointClick(lng, lat)
        break
      case 'text':
        handleTextClick(lng, lat)
        break
      case 'area':
        handleAreaClick(lng, lat)
        break
      case 'line':
        handleLineClick(lng, lat)
        break
    }
  }

  const handlePointClick = (lng: number, lat: number) => {
    const title = prompt('Enter annotation title:')
    if (!title) return

    const description = prompt('Enter description (optional):') || undefined

    addAnnotation({
      type: 'point',
      planet,
      title,
      description,
      coordinates: [lng, lat],
      color: '#ff6b6b',
      tags: []
    })

    // Auto-deselect tool after creating annotation
    setActiveMode(null)
  }

  const handleTextClick = (lng: number, lat: number) => {
    const title = prompt('Enter text content:')
    if (!title) return

    addAnnotation({
      type: 'text',
      planet,
      title,
      coordinates: [lng, lat],
      color: '#4ecdc4',
      tags: []
    })

    // Auto-deselect tool after creating annotation
    setActiveMode(null)
  }

  const handleAreaClick = (lng: number, lat: number) => {
    if (!isDrawing) {
      setIsDrawing(true)
      setDrawingPath([[lng, lat]])
      setIsCreating(true)
    } else {
      setDrawingPath(prev => [...prev, [lng, lat]])
    }
  }

  const handleLineClick = (lng: number, lat: number) => {
    if (!isDrawing) {
      setIsDrawing(true)
      setDrawingPath([[lng, lat]])
      setIsCreating(true)
    } else {
      setDrawingPath(prev => [...prev, [lng, lat]])
    }
  }

  // Finish drawing area or line
  const finishDrawing = () => {
    if (drawingPath.length < 2) return

    const title = prompt(`Enter ${activeMode} annotation title:`)
    if (!title) {
      cancelDrawing()
      return
    }

    const description = prompt('Enter description (optional):') || undefined

    addAnnotation({
      type: activeMode as 'area' | 'line',
      planet,
      title,
      description,
      coordinates: drawingPath.flat(),
      color: activeMode === 'area' ? '#45b7d1' : '#96ceb4',
      tags: []
    })

    cancelDrawing()
    // Auto-deselect tool after creating annotation
    setActiveMode(null)
  }

  const cancelDrawing = () => {
    setIsDrawing(false)
    setDrawingPath([])
    setIsCreating(false)
  }

  // Set up map event listeners for view changes
  useEffect(() => {
    if (!map) return

    // Add event listeners for map view changes
    const events = ['move', 'zoom', 'rotate', 'pitch']
    
    events.forEach(event => {
      map.on(event, updateMapView)
    })

    // Initial update when map is ready
    updateMapView()

    // Cleanup
    return () => {
      events.forEach(event => {
        map.off(event, updateMapView)
      })
    }
  }, [map, updateMapView])

  // Handle keyboard events
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isEnabled) return

      if (event.key === 'Escape') {
        if (isDrawing) {
          // If currently drawing, cancel the drawing
          cancelDrawing()
        } else if (activeMode) {
          // If a tool is active, deselect it
          setActiveMode(null)
        } else {
          // If no tool is active, close annotation mode entirely
          toggleAnnotationMode()
        }
      } else if (event.key === 'Enter' && isDrawing) {
        finishDrawing()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isEnabled, isDrawing, activeMode, setActiveMode, toggleAnnotationMode])

  // Render annotation markers
  const renderAnnotation = (annotation: Annotation) => {
    if (annotation.type === 'point' || annotation.type === 'text') {
      const [lng, lat] = annotation.coordinates
      const { x, y } = mapToScreen(lng, lat)

      return (
        <div
          key={`${annotation.id}-${mapViewState}`}
          style={{
            position: 'absolute',
            left: x - 12,
            top: y - 12,
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: annotation.color,
            border: selectedAnnotation === annotation.id 
              ? `3px solid ${theme.colors.primary}` 
              : '2px solid white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
            zIndex: selectedAnnotation === annotation.id ? 1000 : 100
          }}
          onClick={(e) => {
            e.stopPropagation()
            selectAnnotation(annotation.id)
            playSound('click')
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.2)'
            playSound('hover')
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
          title={`${annotation.title}${annotation.description ? ': ' + annotation.description : ''}`}
        >
          {annotation.type === 'point' ? '📍' : '📝'}
        </div>
      )
    }

    // For area and line annotations, we'd need more complex SVG rendering
    // This is a simplified version
    return null
  }

  // Render drawing path
  const renderDrawingPath = () => {
    if (!isDrawing || drawingPath.length === 0 || !map) return null

    const pathPoints = drawingPath.map(([lng, lat]) => mapToScreen(lng, lat))

    return (
      <svg
        key={`drawing-${mapViewState}`} // Force re-render on map changes
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 200
        }}
      >
        <polyline
          points={pathPoints.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={activeMode === 'area' ? '#45b7d1' : '#96ceb4'}
          strokeWidth="3"
          strokeDasharray="5,5"
        />
        {pathPoints.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={activeMode === 'area' ? '#45b7d1' : '#96ceb4'}
            stroke="white"
            strokeWidth="2"
          />
        ))}
      </svg>
    )
  }

  if (!isEnabled || !mapContainer) return null

  return (
    <div
      ref={layerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: activeMode ? 'auto' : 'none',
        zIndex: 50,
        cursor: activeMode ? 'crosshair' : 'default'
      }}
      onClick={handleLayerClick}
    >
      {/* Render existing annotations */}
      {planetAnnotations.map(renderAnnotation)}
      
      {/* Render drawing path */}
      {renderDrawingPath()}
      
      {/* Drawing instructions */}
      {isDrawing && (
        <div style={{
          position: 'absolute',
          top: theme.spacing.lg,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: theme.spacing.md,
          borderRadius: '8px',
          fontSize: theme.typography.fontSize.sm,
          textAlign: 'center',
          zIndex: 1000
        }}>
          <div>Drawing {activeMode}...</div>
          <div style={{ fontSize: theme.typography.fontSize.xs, marginTop: theme.spacing.xs }}>
            Click to add points • Enter to finish • Escape to cancel
          </div>
        </div>
      )}
    </div>
  )
}

export default AnnotationLayer
