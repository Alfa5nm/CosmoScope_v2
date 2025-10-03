import React, { useState } from 'react'
import { useTheme } from '../lib/ui/theme'
import { useAudio } from '../lib/audio/AudioContext'

interface RightDrawerProps {
  onPlanetSelect: (planet: string) => void
  onModeChange: (mode: string) => void
}

const RightDrawer: React.FC<RightDrawerProps> = ({ onPlanetSelect, onModeChange }) => {
  const { theme } = useTheme()
  const { playSound } = useAudio()
  const [isOpen, setIsOpen] = useState(false)
  const [activeMode, setActiveMode] = useState('story')

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

          {/* Layers Shortcut */}
          <div>
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
              style={{
                background: 'transparent',
                border: `1px solid ${theme.colors.border}`,
                color: theme.colors.text,
                padding: theme.spacing.md,
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                width: '100%',
                textAlign: 'left'
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
              Layer Switcher
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default RightDrawer
