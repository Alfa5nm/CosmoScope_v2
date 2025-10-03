import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from '../lib/ui/theme'
import { useAudio } from '../lib/audio/AudioContext'
import { useCosmicTransition } from '../lib/utils'
import { GameState } from '../App'
import Map2D from './Map2D'
import Timeline from './Timeline'
import { getPlanetConfig, type PlanetId, type PlanetLayerConfig } from '../config/planetLayers'
import LabelsPanel from './LabelsPanel'
import Toast from './Toast'
import { useViewStore } from '../store/viewStore'
import { 
  AnnotationToolbar, 
  AnnotationLayer, 
  AnnotationPanel
} from './annotations'
import { 
  CountryToggle,
  type Country,
  type PointOfInterest
} from './countries'

interface PlanetViewProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
}

const PlanetView: React.FC<PlanetViewProps> = ({ gameState, setGameState }) => {
  const { planetId } = useParams<{ planetId: string }>()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { playSound } = useAudio()
  const { triggerTransition } = useCosmicTransition()
  const currentDate = useViewStore(state => state.date)
  const selectedLayer = useViewStore(state => state.layerId)
  const storePlanetId = useViewStore(state => state.planetId)
  const showWarnings = useViewStore(state => state.showWarnings)
  const setStoreLayer = useViewStore(state => state.setLayer)
  const setStoreDate = useViewStore(state => state.setDate)
  const setStorePlanet = useViewStore(state => state.setPlanet)
  const setShowWarnings = useViewStore(state => state.setShowWarnings)
  const [showLabelsPanel, setShowLabelsPanel] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  // const [selectedPOI, setSelectedPOI] = useState<string | null>(null)

  const knownPlanets: PlanetId[] = ['earth', 'mars', 'moon']
  const resolvedPlanetId: PlanetId | null =
    planetId && knownPlanets.includes(planetId as PlanetId) ? (planetId as PlanetId) : null
  const planetLayers = resolvedPlanetId ? getPlanetConfig(resolvedPlanetId).layers : []
  const activeLayer = planetLayers.find(layer => layer.id === selectedLayer) ?? planetLayers[0]

  useEffect(() => {
    // Simulate transition from 3D to 2D
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (storePlanetId !== resolvedPlanetId) {
      setStorePlanet(resolvedPlanetId)
    }
  }, [resolvedPlanetId, storePlanetId, setStorePlanet])

  useEffect(() => {
    const nextPlanet = planetId ?? null

    setGameState(prev => {
      if (prev.currentPlanet === nextPlanet && prev.currentDate === currentDate) {
        return prev
      }

      return {
        ...prev,
        currentPlanet: nextPlanet,
        currentDate
      }
    })
  }, [planetId, currentDate, setGameState])

  const handleDateChange = (date: string) => {
    setStoreDate(date)
    setGameState(prev => ({ ...prev, currentDate: date }))
    playSound('click')
  }

  const handleLayerChange = (layerId: string) => {
    const fallbackLayer = resolvedPlanetId ? getPlanetConfig(resolvedPlanetId).defaultLayer : 'base'
    const allowedLayer = planetLayers.find(layer => layer.id === layerId)?.id ?? fallbackLayer
    setStoreLayer(allowedLayer)
    const layerMeta = planetLayers.find(layer => layer.id === allowedLayer)
    playSound('click')
    setToast({ message: `Switched to ${layerMeta?.name ?? allowedLayer} layer`, type: 'info' })
  }

  const handleCountrySelect = (country: Country) => {
    setToast({ 
      message: `Exploring ${country.name} - ${country.pointsOfInterest.length} POIs available`, 
      type: 'info' 
    })
    playSound('click')
  }

  const handlePOISelect = (poi: PointOfInterest) => {
    // setSelectedPOI(poi.id)
    setToast({ 
      message: `Viewing ${poi.name}`, 
      type: 'info' 
    })
    playSound('click')
  }

  const handleBackToSolarSystem = async () => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    playSound('click')
    
    // Show transition effect
    setToast({ message: '🌌 RETURNING TO SOLAR SYSTEM...', type: 'info' })
    
    // Trigger cosmic transition on the entire container
    const container = document.querySelector('.planet-view-container')
    if (container) {
      await triggerTransition(container as HTMLElement, 'cosmic-blink', true)
    }
    
    // Navigate after transition
    setTimeout(() => {
      navigate('/solar-system')
    }, 800) // Match the cosmic-blink animation duration
  }

  const handleLabelCreate = (label: any) => {
    setGameState(prev => ({
      ...prev,
      labels: [...prev.labels, { ...label, id: crypto.randomUUID() }],
      points: prev.points + 10
    }))
    setToast({ message: 'Label created! +10 points', type: 'success' })
    playSound('click')
  }

  const handleLabelDelete = (labelId: string) => {
    setGameState(prev => ({
      ...prev,
      labels: prev.labels.filter(l => l.id !== labelId)
    }))
    setToast({ message: 'Label deleted', type: 'info' })
    playSound('click')
  }

  if (!planetId) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.colors.background,
        color: theme.colors.error
      }}>
        Invalid planet
      </div>
    )
  }

  return (
    <div 
      className="planet-view-container"
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        background: theme.colors.background
      }}>
      {/* Transition Effect */}
      {isTransitioning && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: '#ffffff',
          zIndex: 100,
          animation: 'fadeOut 1s ease-out forwards'
        }} />
      )}

      {/* Map Component */}
      <Map2D
        planet={planetId}
        date={currentDate}
        layer={selectedLayer}
        labels={gameState.labels}
        showWarnings={showWarnings}
        mapContainerRef={mapContainerRef}
        mapInstanceRef={mapInstanceRef}
        showCountries={resolvedPlanetId === 'earth'}
        onLabelClick={(label) => {
          setToast({ message: `Clicked on ${label.name}`, type: 'info' })
          playSound('click')
        }}
        onCountryClick={handleCountrySelect}
        onPOIClick={handlePOISelect}
      />

      {/* Annotation System - Only for valid planets */}
      {resolvedPlanetId && (
        <>
          <AnnotationToolbar 
            planet={resolvedPlanetId}
            onToast={setToast}
          />
          <AnnotationLayer 
            planet={resolvedPlanetId}
            mapContainer={mapContainerRef.current}
            map={mapInstanceRef.current}
          />
          <AnnotationPanel planet={resolvedPlanetId} />
        </>
      )}

      {/* Country System - Only for Earth */}
      {resolvedPlanetId === 'earth' && (
        <CountryToggle 
          planet={resolvedPlanetId}
          onToast={setToast}
        />
      )}

      {/* Controls */}
      <div style={{
        position: 'absolute',
        top: theme.spacing.lg,
        left: theme.spacing.lg,
        zIndex: 20
      }}>
        <button
          onClick={handleBackToSolarSystem}
          style={{
            background: 'rgba(0, 0, 17, 0.8)',
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.text,
            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: theme.typography.fontSize.md,
            backdropFilter: theme.effects.blur,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)'
            e.currentTarget.style.boxShadow = theme.effects.glow
            playSound('hover')
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 17, 0.8)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          ← Back to Solar System
        </button>
      </div>

      {/* Timeline */}
      <Timeline
        currentDate={currentDate}
        onDateChange={handleDateChange}
        planet={planetId}
        layer={selectedLayer}
      />

      {/* Layer Switcher */}
      <div style={{
        position: 'absolute',
        top: theme.spacing.lg,
        right: theme.spacing.lg,
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.sm
      }}>
        <LayerSwitcher
          layers={planetLayers}
          selectedLayer={selectedLayer}
          onLayerChange={handleLayerChange}
        />
        
        {/* Warning Toggle */}
        <button
          onClick={() => {
            setShowWarnings(!showWarnings)
            playSound('click')
            setToast({ 
              message: showWarnings ? 'Warning messages hidden' : 'Warning messages shown', 
              type: 'info' 
            })
          }}
          style={{
            background: showWarnings ? 'rgba(255, 165, 0, 0.8)' : 'rgba(0, 0, 17, 0.8)',
            border: `1px solid ${showWarnings ? '#ffa500' : theme.colors.border}`,
            color: showWarnings ? '#000' : theme.colors.text,
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: theme.typography.fontSize.sm,
            backdropFilter: theme.effects.blur,
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.xs,
            fontWeight: theme.typography.fontWeight.bold
          }}
          onMouseEnter={(e) => {
            if (showWarnings) {
              e.currentTarget.style.background = 'rgba(255, 165, 0, 1)'
            } else {
              e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)'
              e.currentTarget.style.boxShadow = theme.effects.glow
            }
            playSound('hover')
          }}
          onMouseLeave={(e) => {
            if (showWarnings) {
              e.currentTarget.style.background = 'rgba(255, 165, 0, 0.8)'
            } else {
              e.currentTarget.style.background = 'rgba(0, 0, 17, 0.8)'
              e.currentTarget.style.boxShadow = 'none'
            }
          }}
          title={showWarnings ? 'Hide warning messages' : 'Show warning messages'}
        >
          <span style={{ fontSize: '16px' }}>
            {showWarnings ? '⚠️' : '🔇'}
          </span>
          <span>
            {showWarnings ? 'Warnings' : 'Warnings Off'}
          </span>
        </button>
      </div>

      {/* Labels Panel Toggle */}
      <div style={{
        position: 'absolute',
        bottom: theme.spacing.lg,
        right: theme.spacing.lg,
        zIndex: 20
      }}>
        <button
          onClick={() => {
            setShowLabelsPanel(!showLabelsPanel)
            playSound('click')
          }}
          style={{
            background: 'rgba(0, 0, 17, 0.8)',
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.text,
            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: theme.typography.fontSize.md,
            backdropFilter: theme.effects.blur,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)'
            e.currentTarget.style.boxShadow = theme.effects.glow
            playSound('hover')
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 17, 0.8)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          📍 Labels
        </button>
      </div>

      {/* Labels Panel */}
      {showLabelsPanel && (
        <LabelsPanel
          planet={planetId}
          labels={gameState.labels}
          onCreateLabel={handleLabelCreate}
          onDeleteLabel={handleLabelDelete}
          onClose={() => {
            setShowLabelsPanel(false)
            playSound('click')
          }}
        />
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Planet Info */}
      <div style={{
        position: 'absolute',
        bottom: theme.spacing.lg,
        left: theme.spacing.lg,
        background: 'rgba(0, 0, 17, 0.8)',
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '8px',
        padding: theme.spacing.md,
        zIndex: 20,
        backdropFilter: theme.effects.blur,
        maxWidth: '300px'
      }}>
        <h3 style={{
          color: theme.colors.primary,
          fontSize: theme.typography.fontSize.lg,
          margin: 0,
          marginBottom: theme.spacing.sm,
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {planetId.charAt(0).toUpperCase() + planetId.slice(1)}
        </h3>
        <p style={{
          color: theme.colors.textSecondary,
          fontSize: theme.typography.fontSize.sm,
          margin: 0,
          lineHeight: 1.4
        }}
        >
          {activeLayer?.description || `Explore ${planetId} through NASA archives. Use the timeline to travel through different dates and discover hidden secrets.`}
        </p>
        {activeLayer?.metadata && (
          <div style={{
            marginTop: theme.spacing.sm,
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.xs
          }}>
            {activeLayer.metadata.provider && (
              <div style={{
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.xs
              }}>
                <strong style={{ color: theme.colors.text }}>Provider:</strong> {activeLayer.metadata.provider}
              </div>
            )}
            {activeLayer.metadata.sourceUrl && (
              <div style={{
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.xs
              }}>
                <strong style={{ color: theme.colors.text }}>Source:</strong>{' '}
                <a
                  href={activeLayer.metadata.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: theme.colors.primary }}
                >
                  Open dataset
                </a>
              </div>
            )}
            {activeLayer.metadata.spatialResolution && (
              <div style={{
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.xs
              }}>
                <strong style={{ color: theme.colors.text }}>Resolution:</strong> {activeLayer.metadata.spatialResolution}
              </div>
            )}
            {activeLayer.metadata.temporalCoverage && (
              <div style={{
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.xs
              }}>
                <strong style={{ color: theme.colors.text }}>Coverage:</strong> {activeLayer.metadata.temporalCoverage}
              </div>
            )}
            {activeLayer.metadata.tags && activeLayer.metadata.tags.length > 0 && (
              <div style={{
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.xs
              }}>
                <strong style={{ color: theme.colors.text }}>Tags:</strong> {activeLayer.metadata.tags.join(', ')}
              </div>
            )}
            {activeLayer.metadata.notes && (
              <div style={{
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.xs
              }}>
                <strong style={{ color: theme.colors.text }}>Notes:</strong> {activeLayer.metadata.notes}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const LayerSwitcher: React.FC<{
  layers: PlanetLayerConfig[]
  selectedLayer: string
  onLayerChange: (layerId: string) => void
}> = ({ layers, selectedLayer, onLayerChange }) => {
  const { theme } = useTheme()
  const { playSound } = useAudio()
  const [isOpen, setIsOpen] = useState(false)

  if (layers.length === 0) {
    return null
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          playSound('click')
        }}
        style={{
          background: 'rgba(0, 0, 17, 0.8)',
          border: `1px solid ${theme.colors.border}`,
          color: theme.colors.text,
          padding: `${theme.spacing.md} ${theme.spacing.lg}`,
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: theme.typography.fontSize.md,
          backdropFilter: theme.effects.blur,
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm
        }}
        onMouseEnter={() => playSound('hover')}
      >
        Layers
        <span style={{ fontSize: theme.typography.fontSize.sm }}>
          {isOpen ? 'v' : '^'}
        </span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          background: theme.colors.backgroundSecondary,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '4px',
          marginTop: theme.spacing.sm,
          minWidth: '200px',
          boxShadow: theme.effects.shadow
        }}>
          {layers.map(layer => (
            <button
              key={layer.id}
              onClick={() => {
                onLayerChange(layer.id)
                setIsOpen(false)
                playSound('click')
              }}
              style={{
                display: 'block',
                width: '100%',
                background: selectedLayer === layer.id ? theme.colors.primary : 'transparent',
                color: selectedLayer === layer.id ? theme.colors.background : theme.colors.text,
                border: 'none',
                padding: theme.spacing.md,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (selectedLayer !== layer.id) {
                  e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)'
                }
                playSound('hover')
              }}
              onMouseLeave={(e) => {
                if (selectedLayer !== layer.id) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <div style={{
                fontWeight: theme.typography.fontWeight.bold,
                marginBottom: theme.spacing.xs
              }}>
                {layer.name}
              </div>
              <div style={{
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.sm,
                opacity: 0.85
              }}>
                {layer.description}
              </div>
              <div style={{
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.xs,
                opacity: 0.7
              }}>
                <strong>Category:</strong> {layer.category}
                {layer.metadata?.provider ? ` • ${layer.metadata.provider}` : ''}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Import/Export Modal - TODO: Add trigger button */}
      {/* 
      {resolvedPlanetId && (
        <AnnotationImportExport
          planet={resolvedPlanetId}
          isOpen={showImportExport}
          onClose={() => setShowImportExport(false)}
        />
      )}
      */}

      {/* POI Information Card - TODO: Implement */}
      {/* 
      {selectedPOI && (
        <POICard 
          poiId={selectedPOI}
          onClose={() => setSelectedPOI(null)}
        />
      )}
      */}
    </div>
  )
}

export default PlanetView

