import React, { useState } from 'react'
import { useTheme } from '../lib/ui/theme'
import { useAudio } from '../lib/audio/AudioContext'
import { useViewStore } from '../store/viewStore'
import { getPlanetConfig, type PlanetId } from '../config/planetLayers'

interface RightDrawerProps {
  onPlanetSelect: (planet: string) => void
  onModeChange: (mode: string) => void
}

const RightDrawer: React.FC<RightDrawerProps> = ({ onPlanetSelect, onModeChange }) => {
  const { theme } = useTheme()
  const { playSound } = useAudio()
  const [isOpen, setIsOpen] = useState(false)
  const [activeMode, setActiveMode] = useState('story')
  const [showLayerSwitcher, setShowLayerSwitcher] = useState(false)
  
  // Get current planet and layers
  const currentPlanet = useViewStore(state => state.planetId) as PlanetId
  const selectedLayer = useViewStore(state => state.layerId)
  const setStoreLayer = useViewStore(state => state.setLayer)
  const planetLayers = currentPlanet ? getPlanetConfig(currentPlanet).layers : []

  const planets = [
    { id: 'mercury', name: 'Mercury', color: '#8c7853' },
    { id: 'venus', name: 'Venus', color: '#ffc649' },
    { id: 'earth', name: 'Earth', color: '#4488ff' },
    { id: 'moon', name: 'Moon', color: '#cccccc' },
    { id: 'mars', name: 'Mars', color: '#ff4444' },
    { id: 'jupiter', name: 'Jupiter', color: '#d8ca9d' },
    { id: 'saturn', name: 'Saturn', color: '#fad5a5' },
    { id: 'uranus', name: 'Uranus', color: '#4fd0e7' },
    { id: 'neptune', name: 'Neptune', color: '#4b70dd' }
  ]

  const modes = [
    { id: 'story', name: 'Story Mode', description: 'Follow the main quest' },
    { id: 'explore', name: 'Endless Explore', description: 'Free exploration' }
  ]

  const handlePlanetClick = (planet: string) => {
    playSound('click')
    onPlanetSelect(planet)
    setIsOpen(false)
  }

  const handleModeChange = (mode: string) => {
    playSound('click')
    setActiveMode(mode)
    onModeChange(mode)
  }

  const handleLayerChange = (layerId: string) => {
    playSound('click')
    setStoreLayer(layerId)
    setShowLayerSwitcher(false)
  }

  return (
    <>
      {/* Tab */}
      <div
        style={{
          position: 'absolute',
          right: isOpen ? '300px' : '0',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '30px',
          height: '100px',
          background: theme.colors.backgroundSecondary,
          border: `1px solid ${theme.colors.border}`,
          borderRight: 'none',
          borderTopLeftRadius: '8px',
          borderBottomLeftRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
          transition: 'all 0.3s ease',
          boxShadow: theme.effects.glow
        }}
        onClick={() => {
          setIsOpen(!isOpen)
          playSound('click')
        }}
        onMouseEnter={() => playSound('hover')}
      >
        <div style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.text,
          fontWeight: theme.typography.fontWeight.bold
        }}>
          MENU
        </div>
      </div>

      {/* Drawer Content */}
      <div
        style={{
          position: 'absolute',
          right: isOpen ? '0' : '-300px',
          top: 0,
          width: '300px',
          height: '100vh',
          background: theme.colors.backgroundSecondary,
          border: `1px solid ${theme.colors.border}`,
          borderRight: 'none',
          zIndex: 15,
          transition: 'all 0.3s ease',
          overflowY: 'auto',
          boxShadow: theme.effects.shadow
        }}
      >
        <div style={{ padding: theme.spacing.lg }}>
          {/* Header */}
          <div style={{
            marginBottom: theme.spacing.lg,
            textAlign: 'center'
          }}>
            <h3 style={{
              color: theme.colors.primary,
              fontSize: theme.typography.fontSize.lg,
              marginBottom: theme.spacing.sm,
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Navigation
            </h3>
          </div>

          {/* Destinations */}
          <div style={{ marginBottom: theme.spacing.xl }}>
            <h4 style={{
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.md,
              marginBottom: theme.spacing.md,
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Destinations
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
              {planets.map(planet => (
                <button
                  key={planet.id}
                  onClick={() => handlePlanetClick(planet.id)}
                  style={{
                    background: 'transparent',
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.text,
                    padding: theme.spacing.md,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.sm
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)'
                    e.currentTarget.style.boxShadow = theme.effects.glow
                    playSound('hover')
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: planet.color,
                      boxShadow: `0 0 10px ${planet.color}`
                    }}
                  />
                  {planet.name}
                </button>
              ))}
            </div>
          </div>

          {/* Modes */}
          <div style={{ marginBottom: theme.spacing.xl }}>
            <h4 style={{
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.md,
              marginBottom: theme.spacing.md,
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Modes
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
              {modes.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => handleModeChange(mode.id)}
                  style={{
                    background: activeMode === mode.id ? theme.colors.primary : 'transparent',
                    color: activeMode === mode.id ? theme.colors.background : theme.colors.text,
                    border: `1px solid ${theme.colors.border}`,
                    padding: theme.spacing.md,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (activeMode !== mode.id) {
                      e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)'
                      e.currentTarget.style.boxShadow = theme.effects.glow
                    }
                    playSound('hover')
                  }}
                  onMouseLeave={(e) => {
                    if (activeMode !== mode.id) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.boxShadow = 'none'
                    }
                  }}
                >
                  <div style={{
                    fontWeight: theme.typography.fontWeight.bold,
                    marginBottom: theme.spacing.xs
                  }}>
                    {mode.name}
                  </div>
                  <div style={{
                    fontSize: theme.typography.fontSize.sm,
                    opacity: 0.7
                  }}>
                    {mode.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Layer Switcher */}
          {planetLayers.length > 0 && (
            <div style={{ marginBottom: theme.spacing.xl }}>
              <h4 style={{
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.md,
                marginBottom: theme.spacing.md,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Layers
              </h4>
              
              <button
                onClick={() => setShowLayerSwitcher(!showLayerSwitcher)}
                style={{
                  background: 'rgba(0, 0, 17, 0.8)',
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.text,
                  padding: theme.spacing.md,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.bold
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
                <span>Layer Switcher</span>
                <span style={{ fontSize: theme.typography.fontSize.sm }}>
                  {showLayerSwitcher ? '▼' : '▶'}
                </span>
              </button>

              {showLayerSwitcher && (
                <div style={{
                  marginTop: theme.spacing.sm,
                  background: 'rgba(0, 0, 17, 0.6)',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  padding: theme.spacing.sm,
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {planetLayers.map(layer => (
                    <button
                      key={layer.id}
                      onClick={() => handleLayerChange(layer.id)}
                      style={{
                        display: 'block',
                        width: '100%',
                        background: selectedLayer === layer.id ? theme.colors.primary : 'transparent',
                        color: selectedLayer === layer.id ? theme.colors.background : theme.colors.text,
                        border: 'none',
                        padding: theme.spacing.sm,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.3s ease',
                        marginBottom: theme.spacing.xs
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
                        marginBottom: theme.spacing.xs,
                        fontSize: theme.typography.fontSize.sm
                      }}>
                        {layer.name}
                      </div>
                      <div style={{
                        color: selectedLayer === layer.id ? theme.colors.background : theme.colors.textSecondary,
                        fontSize: theme.typography.fontSize.xs,
                        opacity: 0.85
                      }}>
                        {layer.description}
                      </div>
                      <div style={{
                        color: selectedLayer === layer.id ? theme.colors.background : theme.colors.textSecondary,
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
            </div>
          )}

        </div>
      </div>
    </>
  )
}

export default RightDrawer
