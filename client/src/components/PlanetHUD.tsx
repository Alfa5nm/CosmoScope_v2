import React from 'react'
import { useTheme } from '../lib/ui/theme'
import { useAudio } from '../lib/audio/AudioContext'

interface PlanetHUDProps {
  planetName: string
  onTravel: () => void
  onClose: () => void
}

const PlanetHUD: React.FC<PlanetHUDProps> = ({ planetName, onTravel, onClose }) => {
  const { theme } = useTheme()
  const { playSound } = useAudio()

  const planetData = {
    earth: {
      name: 'Earth',
      mass: '5.97 × 10²⁴ kg',
      gravity: '9.81 m/s²',
      age: '4.54 billion years',
      missions: '6 Apollo missions',
      description: 'Our home planet, the only known world with life.',
      color: '#4488ff'
    },
    moon: {
      name: 'Moon',
      mass: '7.34 × 10²² kg',
      gravity: '1.62 m/s²',
      age: '4.51 billion years',
      missions: '6 Apollo missions',
      description: 'Earth\'s natural satellite, target of human exploration.',
      color: '#cccccc'
    },
    mars: {
      name: 'Mars',
      mass: '6.39 × 10²³ kg',
      gravity: '3.71 m/s²',
      age: '4.6 billion years',
      missions: 'Multiple robotic missions',
      description: 'The red planet, future target for human exploration.',
      color: '#ff4444'
    }
  }

  const planet = planetData[planetName as keyof typeof planetData]

  if (!planet) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: theme.colors.backgroundSecondary,
        border: `2px solid ${theme.colors.primary}`,
        borderRadius: '12px',
        padding: theme.spacing.xl,
        minWidth: '400px',
        maxWidth: '500px',
        zIndex: 30,
        boxShadow: theme.effects.shadowStrong,
        backdropFilter: theme.effects.blur
      }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: theme.spacing.md,
          right: theme.spacing.md,
          background: 'transparent',
          border: 'none',
          color: theme.colors.text,
          fontSize: theme.typography.fontSize.xl,
          cursor: 'pointer',
          padding: theme.spacing.sm,
          borderRadius: '4px',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 0, 0, 0.2)'
          e.currentTarget.style.color = theme.colors.error
          playSound('hover')
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = theme.colors.text
        }}
      >
        ×
      </button>

      {/* Planet Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
        gap: theme.spacing.md
      }}>
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: planet.color,
            boxShadow: `0 0 20px ${planet.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.background
          }}
        >
          {planet.name.charAt(0)}
        </div>
        
        <div>
          <h2 style={{
            color: theme.colors.primary,
            fontSize: theme.typography.fontSize.xl,
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {planet.name}
          </h2>
          <p style={{
            color: theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.sm,
            margin: 0,
            opacity: 0.8
          }}>
            {planet.description}
          </p>
        </div>
      </div>

      {/* Planet Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.lg
      }}>
        <div style={{
          background: 'rgba(0, 255, 255, 0.05)',
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '8px',
          padding: theme.spacing.md,
          textAlign: 'center'
        }}>
          <div style={{
            color: theme.colors.primary,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.bold,
            marginBottom: theme.spacing.xs,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Mass
          </div>
          <div style={{
            color: theme.colors.text,
            fontSize: theme.typography.fontSize.md
          }}>
            {planet.mass}
          </div>
        </div>

        <div style={{
          background: 'rgba(0, 255, 255, 0.05)',
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '8px',
          padding: theme.spacing.md,
          textAlign: 'center'
        }}>
          <div style={{
            color: theme.colors.primary,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.bold,
            marginBottom: theme.spacing.xs,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Gravity
          </div>
          <div style={{
            color: theme.colors.text,
            fontSize: theme.typography.fontSize.md
          }}>
            {planet.gravity}
          </div>
        </div>

        <div style={{
          background: 'rgba(0, 255, 255, 0.05)',
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '8px',
          padding: theme.spacing.md,
          textAlign: 'center'
        }}>
          <div style={{
            color: theme.colors.primary,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.bold,
            marginBottom: theme.spacing.xs,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Age
          </div>
          <div style={{
            color: theme.colors.text,
            fontSize: theme.typography.fontSize.md
          }}>
            {planet.age}
          </div>
        </div>

        <div style={{
          background: 'rgba(0, 255, 255, 0.05)',
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '8px',
          padding: theme.spacing.md,
          textAlign: 'center'
        }}>
          <div style={{
            color: theme.colors.primary,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.bold,
            marginBottom: theme.spacing.xs,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Missions
          </div>
          <div style={{
            color: theme.colors.text,
            fontSize: theme.typography.fontSize.md
          }}>
            {planet.missions}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: theme.spacing.md,
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.text,
            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: theme.typography.fontSize.md
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
          Cancel
        </button>
        
        <button
          onClick={onTravel}
          style={{
            background: theme.colors.primary,
            border: `1px solid ${theme.colors.primary}`,
            color: theme.colors.background,
            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: theme.typography.fontSize.md,
            fontWeight: theme.typography.fontWeight.bold,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 255, 255, 0.8)'
            e.currentTarget.style.boxShadow = theme.effects.glowStrong
            e.currentTarget.style.transform = 'translateY(-2px)'
            playSound('hover')
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = theme.colors.primary
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          Travel
        </button>
      </div>
    </div>
  )
}

export default PlanetHUD
