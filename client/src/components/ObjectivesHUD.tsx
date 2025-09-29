import React from 'react'
import { useTheme } from '../lib/ui/theme'

interface ObjectivesHUDProps {
  objective: string
  points: number
}

const ObjectivesHUD: React.FC<ObjectivesHUDProps> = ({ objective, points }) => {
  const { theme } = useTheme()

  return (
    <>
      {/* Objective Display */}
      <div
        style={{
          position: 'absolute',
          top: theme.spacing.lg,
          left: theme.spacing.lg,
          background: 'rgba(0, 0, 17, 0.8)',
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '8px',
          padding: theme.spacing.md,
          maxWidth: '400px',
          zIndex: 10,
          backdropFilter: theme.effects.blur,
          transition: 'all 0.3s ease',
          opacity: 0.7
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1'
          e.currentTarget.style.background = 'rgba(0, 0, 17, 0.9)'
          e.currentTarget.style.boxShadow = theme.effects.glow
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.7'
          e.currentTarget.style.background = 'rgba(0, 0, 17, 0.8)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <div style={{
          color: theme.colors.primary,
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.bold,
          marginBottom: theme.spacing.xs,
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Objective
        </div>
        <div style={{
          color: theme.colors.text,
          fontSize: theme.typography.fontSize.md,
          lineHeight: 1.4
        }}>
          {objective}
        </div>
      </div>

      {/* Points Display */}
      <div
        style={{
          position: 'absolute',
          top: theme.spacing.lg,
          right: theme.spacing.lg,
          background: 'rgba(0, 0, 17, 0.8)',
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '8px',
          padding: theme.spacing.md,
          zIndex: 10,
          backdropFilter: theme.effects.blur,
          transition: 'all 0.3s ease',
          opacity: 0.7,
          textAlign: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1'
          e.currentTarget.style.background = 'rgba(0, 0, 17, 0.9)'
          e.currentTarget.style.boxShadow = theme.effects.glow
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.7'
          e.currentTarget.style.background = 'rgba(0, 0, 17, 0.8)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <div style={{
          color: theme.colors.primary,
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.bold,
          marginBottom: theme.spacing.xs,
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Points
        </div>
        <div style={{
          color: theme.colors.text,
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.bold,
          textShadow: theme.effects.glow
        }}>
          {points.toLocaleString()}
        </div>
      </div>
    </>
  )
}

export default ObjectivesHUD
