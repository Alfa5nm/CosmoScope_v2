import React from 'react'
import { useTheme } from '../lib/ui/theme'
import { useObjectives } from '../lib/hooks/useObjectives'
import { Objective } from '../lib/objectiveSystem'

interface ObjectivesHUDProps {
  objective?: string // Keep for backward compatibility
}

const getStepInstructions = (objective: Objective): string => {
  switch (objective.id) {
    case 'tutorial-001':
      return '1. Look at the solar system in the center\n2. Click on any planet (Mercury, Venus, Earth, etc.)\n3. Watch the camera focus on your chosen planet'
    
    case 'tutorial-002':
      return '1. Click on Earth, Mars, or Moon (the accessible planets)\n2. Wait for the cosmic transition effect\n3. You will be taken to the planet surface view'
    
    case 'exploration-001':
      return '1. Click on Earth to visit it\n2. Click on Mars to visit it\n3. Click on Moon to visit it\n(You can visit them in any order)'
    
    case 'exploration-002':
      return '1. Click on Mercury\n2. Click on Venus\n3. Click on Earth\n4. Click on Mars\n5. Click on Jupiter\n6. Click on Saturn\n7. Click on Uranus\n8. Click on Neptune'
    
    case 'discovery-001':
      return '1. Go to any planet surface\n2. Look for the annotation toolbar (pencil icon)\n3. Click the pencil icon to activate annotation mode\n4. Click on 5 different spots on the planet surface\n5. Each click will place a marker'
    
    case 'discovery-002':
      return '1. Visit different planets\n2. Click around on each planet surface\n3. Each click counts as exploring a new location\n4. Visit 10 unique spots total across all planets'
    
    case 'achievement-001':
      return '1. Complete all tutorial objectives\n2. Complete all exploration objectives\n3. Complete all discovery objectives\n4. This will automatically unlock when you finish 10 total objectives'
    
    case 'achievement-002':
      return '1. Complete missions to earn points\n2. Visit planets to earn points\n3. Use annotation tools to earn points\n4. Keep playing until you reach 1000 total points'
    
    case 'mission-001':
      return '1. Visit Earth\n2. Activate annotation tool (pencil icon)\n3. Mark 3 historical locations on Earth\n4. Complete the time travel sequence\n5. Follow the story prompts'
    
    case 'mission-002':
      return '1. Visit Mars\n2. Activate annotation tool (pencil icon)\n3. Mark 4 potential colony sites on Mars\n4. Analyze each marked location\n5. Complete the colony assessment'
    
    default:
      return 'Follow the description above to complete this objective.'
  }
}

const ObjectivesHUD: React.FC<ObjectivesHUDProps> = ({ objective }) => {
  const { theme } = useTheme()
  const { progress, getCurrentObjective } = useObjectives()
  
  const currentObjective = getCurrentObjective()
  const displayObjective = currentObjective || { 
    title: objective || 'Explore the solar system', 
    description: 'Discover hidden secrets and unlock new missions',
    progress: { current: 0, total: 1 }
  }

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
          {currentObjective ? 'Current Mission' : 'Objective'}
        </div>
        <div style={{
          color: theme.colors.text,
          fontSize: theme.typography.fontSize.md,
          lineHeight: 1.4,
          marginBottom: theme.spacing.sm
        }}>
          {displayObjective.title}
        </div>
        <div style={{
          color: theme.colors.textSecondary,
          fontSize: theme.typography.fontSize.sm,
          lineHeight: 1.3,
          marginBottom: theme.spacing.sm
        }}>
          {displayObjective.description}
        </div>
        
        {/* Step-by-step instructions for current objective */}
        {currentObjective && (
          <div style={{
            marginTop: theme.spacing.sm,
            padding: theme.spacing.sm,
            backgroundColor: 'rgba(0, 255, 255, 0.1)',
            border: `1px solid ${theme.colors.primary}40`,
            borderRadius: '6px',
            borderLeft: `3px solid ${theme.colors.primary}`
          }}>
            <div style={{
              color: theme.colors.primary,
              fontSize: theme.typography.fontSize.xs,
              fontWeight: theme.typography.fontWeight.bold,
              marginBottom: theme.spacing.xs,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              How to Complete:
            </div>
            <div style={{
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.xs,
              lineHeight: 1.4,
              whiteSpace: 'pre-line'
            }}>
              {getStepInstructions(currentObjective)}
            </div>
          </div>
        )}
        
        {/* Progress Bar */}
        {currentObjective && (
          <div style={{
            marginTop: theme.spacing.sm,
            paddingTop: theme.spacing.sm,
            borderTop: `1px solid ${theme.colors.border}`
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: theme.spacing.xs
            }}>
              <span style={{
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.xs,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Progress
              </span>
              <span style={{
                color: theme.colors.primary,
                fontSize: theme.typography.fontSize.xs,
                fontWeight: theme.typography.fontWeight.bold
              }}>
                {displayObjective.progress.current}/{displayObjective.progress.total}
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: 'rgba(0, 255, 255, 0.2)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(displayObjective.progress.current / displayObjective.progress.total) * 100}%`,
                height: '100%',
                backgroundColor: theme.colors.primary,
                borderRadius: '2px',
                transition: 'width 0.3s ease',
                boxShadow: `0 0 8px ${theme.colors.primary}40`
              }} />
            </div>
          </div>
        )}
        
        {/* Level Display */}
        <div style={{
          marginTop: theme.spacing.sm,
          paddingTop: theme.spacing.sm,
          borderTop: `1px solid ${theme.colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{
            color: theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.xs,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Level {progress.level}
          </span>
          <span style={{
            color: theme.colors.primary,
            fontSize: theme.typography.fontSize.xs,
            fontWeight: theme.typography.fontWeight.bold
          }}>
            {progress.totalPoints} pts
          </span>
        </div>
      </div>

    </>
  )
}

export default ObjectivesHUD
