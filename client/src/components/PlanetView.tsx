import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from '../lib/ui/theme'
import { useAudio } from '../lib/audio/AudioContext'
import { GameState } from '../App'
import Map2D from './Map2D'
import Timeline from './Timeline'
import LabelsPanel from './LabelsPanel'
import Toast from './Toast'

interface PlanetViewProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
}

const PlanetView: React.FC<PlanetViewProps> = ({ gameState, setGameState }) => {
  const { planetId } = useParams<{ planetId: string }>()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { playSound } = useAudio()
  const [currentDate, setCurrentDate] = useState(gameState.currentDate)
  const [selectedLayer, setSelectedLayer] = useState<string>('base')
  const [showLabelsPanel, setShowLabelsPanel] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(true)

  useEffect(() => {
    // Simulate transition from 3D to 2D
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Update game state with current planet
    setGameState(prev => ({
      ...prev,
      currentPlanet: planetId || null
    }))
  }, [planetId, setGameState])

  const handleDateChange = (date: string) => {
    setCurrentDate(date)
    setGameState(prev => ({ ...prev, currentDate: date }))
    playSound('click')
  }

  const handleLayerChange = (layerId: string) => {
    setSelectedLayer(layerId)
    playSound('click')
    setToast({ message: `Switched to ${layerId} layer`, type: 'info' })
  }

  const handleBackToSolarSystem = () => {
    playSound('click')
    navigate('/solar-system')
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
    <div style={{
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
        onLabelClick={(label) => {
          setToast({ message: `Clicked on ${label.name}`, type: 'info' })
          playSound('click')
        }}
      />

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
      />

      {/* Layer Switcher */}
      <div style={{
        position: 'absolute',
        top: theme.spacing.lg,
        right: theme.spacing.lg,
        zIndex: 20
      }}>
        <LayerSwitcher
          planet={planetId}
          selectedLayer={selectedLayer}
          onLayerChange={handleLayerChange}
        />
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
        }}>
          Explore {planetId} through time and space. Use the timeline to travel through different dates and discover hidden secrets.
        </p>
      </div>
    </div>
  )
}

const LayerSwitcher: React.FC<{
  planet: string
  selectedLayer: string
  onLayerChange: (layerId: string) => void
}> = ({ selectedLayer, onLayerChange }) => {
  const { theme } = useTheme()
  const { playSound } = useAudio()
  const [isOpen, setIsOpen] = useState(false)

  const layers = [
    { id: 'base', name: 'Base Map', description: 'Standard imagery' },
    { id: 'thermal', name: 'Thermal', description: 'Temperature data' },
    { id: 'elevation', name: 'Elevation', description: 'Height data' },
    { id: 'night', name: 'Night Lights', description: 'City lights at night' }
  ]

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
          {isOpen ? '▲' : '▼'}
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
                fontSize: theme.typography.fontSize.sm,
                opacity: 0.7
              }}>
                {layer.description}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default PlanetView
