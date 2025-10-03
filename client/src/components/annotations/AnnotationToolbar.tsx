import React, { useEffect } from 'react'
import { useAnnotationStore, type AnnotationType } from '../../store/annotationStore'
import { useTheme } from '../../lib/ui/theme'
import { useAudio } from '../../lib/audio/AudioContext'

interface AnnotationToolbarProps {
  planet: 'earth' | 'mars' | 'moon'
  onToast?: (toast: { message: string; type: 'success' | 'error' | 'info' }) => void
}

const AnnotationToolbar: React.FC<AnnotationToolbarProps> = ({ planet, onToast }) => {
  const { theme } = useTheme()
  const { playSound } = useAudio()
  const {
    isEnabled,
    activeMode,
    annotations,
    toggleAnnotationMode,
    setActiveMode,
    getAnnotationsByPlanet,
    clearAnnotations,
    exportAnnotations
  } = useAnnotationStore()

  // Add keyboard shortcut feedback
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isEnabled) {
        if (activeMode) {
          onToast?.({ 
            message: `${activeMode.charAt(0).toUpperCase() + activeMode.slice(1)} tool deselected`, 
            type: 'info' 
          })
        } else {
          onToast?.({ 
            message: 'Annotation mode disabled', 
            type: 'info' 
          })
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isEnabled, activeMode, onToast])

  const planetAnnotations = getAnnotationsByPlanet(planet)

  const tools: Array<{
    id: AnnotationType
    name: string
    icon: string
    description: string
  }> = [
    { id: 'point', name: 'Point', icon: '📍', description: 'Add point annotation' },
    { id: 'area', name: 'Area', icon: '⬜', description: 'Draw area annotation' },
    { id: 'line', name: 'Line', icon: '📏', description: 'Draw line annotation' },
    { id: 'text', name: 'Text', icon: '📝', description: 'Add text annotation' }
  ]

  const handleToolSelect = (tool: AnnotationType) => {
    // Toggle tool - if same tool is clicked, deselect it
    const newMode = activeMode === tool ? null : tool
    setActiveMode(newMode)
    playSound('click')
    
    // Show feedback about tool state
    if (newMode === null) {
      // Tool deselected
      onToast?.({ 
        message: `${tool.charAt(0).toUpperCase() + tool.slice(1)} tool deselected`, 
        type: 'info' 
      })
    } else {
      // Tool selected
      onToast?.({ 
        message: `${tool.charAt(0).toUpperCase() + tool.slice(1)} tool selected - Click on map to create annotation`, 
        type: 'info' 
      })
    }
  }

  const handleToggle = () => {
    toggleAnnotationMode()
    playSound('click')
  }

  const handleExport = () => {
    const data = exportAnnotations()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cosmoscope-annotations-${planet}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    playSound('click')
  }

  const handleClear = () => {
    if (window.confirm(`Clear all annotations for ${planet}? This cannot be undone.`)) {
      clearAnnotations()
      playSound('click')
    }
  }

  if (!isEnabled) {
    return (
      <div style={{
        position: 'absolute',
        top: '120px',
        right: theme.spacing.lg,
        zIndex: 30
      }}>
        <button
          onClick={handleToggle}
          style={{
            background: 'rgba(0, 0, 17, 0.8)',
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.text,
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: theme.typography.fontSize.sm,
            backdropFilter: theme.effects.blur,
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.xs
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 165, 0, 0.1)'
            e.currentTarget.style.boxShadow = theme.effects.glow
            playSound('hover')
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 17, 0.8)'
            e.currentTarget.style.boxShadow = 'none'
          }}
          title="Enable annotation mode"
        >
          <span style={{ fontSize: '16px' }}>✏️</span>
          <span>Annotate</span>
        </button>
      </div>
    )
  }

  return (
    <div style={{
      position: 'absolute',
      top: '120px',
      right: theme.spacing.lg,
      zIndex: 30,
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing.sm
    }}>
      {/* Main toggle button */}
      <button
        onClick={handleToggle}
        style={{
          background: 'rgba(255, 165, 0, 0.9)',
          border: `1px solid #ffa500`,
          color: '#000',
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
          e.currentTarget.style.background = 'rgba(255, 165, 0, 1)'
          playSound('hover')
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 165, 0, 0.9)'
        }}
        title="Disable annotation mode (or press ESC)"
      >
        <span style={{ fontSize: '16px' }}>✏️</span>
        <span>Annotating</span>
        <span style={{ 
          fontSize: theme.typography.fontSize.xs, 
          opacity: 0.7,
          marginLeft: theme.spacing.xs 
        }}>
          (ESC)
        </span>
      </button>

      {/* Tool panel */}
      <div style={{
        background: 'rgba(0, 0, 17, 0.9)',
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '8px',
        padding: theme.spacing.md,
        backdropFilter: theme.effects.blur,
        minWidth: '200px'
      }}>
        <div style={{
          color: theme.colors.primary,
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.bold,
          marginBottom: theme.spacing.sm,
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Annotation Tools
        </div>

        {/* Active tool indicator */}
        {activeMode && (
          <div style={{
            background: 'rgba(0, 255, 255, 0.1)',
            border: `1px solid ${theme.colors.primary}`,
            borderRadius: '4px',
            padding: theme.spacing.sm,
            marginBottom: theme.spacing.sm,
            textAlign: 'center'
          }}>
            <div style={{
              color: theme.colors.primary,
              fontSize: theme.typography.fontSize.xs,
              fontWeight: theme.typography.fontWeight.bold
            }}>
              🎯 {activeMode.toUpperCase()} TOOL ACTIVE
            </div>
            <div style={{
              color: theme.colors.textSecondary,
              fontSize: theme.typography.fontSize.xs,
              marginTop: '2px'
            }}>
              Click same tool or press ESC to deselect
            </div>
          </div>
        )}

        {/* Tools */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: theme.spacing.xs,
          marginBottom: theme.spacing.md
        }}>
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => handleToolSelect(tool.id)}
              style={{
                background: activeMode === tool.id 
                  ? 'rgba(0, 255, 255, 0.4)' 
                  : 'rgba(255, 255, 255, 0.1)',
                border: activeMode === tool.id 
                  ? `2px solid ${theme.colors.primary}` 
                  : `1px solid ${theme.colors.border}`,
                color: activeMode === tool.id ? '#000' : theme.colors.text,
                padding: theme.spacing.sm,
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: theme.typography.fontSize.xs,
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                boxShadow: activeMode === tool.id 
                  ? `0 0 10px rgba(0, 255, 255, 0.5)` 
                  : 'none',
                transform: activeMode === tool.id ? 'scale(1.05)' : 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (activeMode !== tool.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                } else {
                  e.currentTarget.style.background = 'rgba(0, 255, 255, 0.6)'
                }
                playSound('hover')
              }}
              onMouseLeave={(e) => {
                if (activeMode !== tool.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                } else {
                  e.currentTarget.style.background = 'rgba(0, 255, 255, 0.4)'
                }
              }}
              title={tool.description}
            >
              <span style={{ fontSize: '16px' }}>{tool.icon}</span>
              <span>{tool.name}</span>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={{
          color: theme.colors.textSecondary,
          fontSize: theme.typography.fontSize.xs,
          marginBottom: theme.spacing.sm,
          padding: theme.spacing.sm,
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '4px'
        }}>
          <div>📊 {planetAnnotations.length} annotations on {planet}</div>
          <div>🎯 {annotations.length} total annotations</div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: theme.spacing.xs,
          marginBottom: theme.spacing.sm
        }}>
          <button
            onClick={handleExport}
            disabled={planetAnnotations.length === 0}
            style={{
              background: planetAnnotations.length > 0 
                ? 'rgba(0, 255, 0, 0.2)' 
                : 'rgba(128, 128, 128, 0.2)',
              border: `1px solid ${planetAnnotations.length > 0 ? '#00ff00' : '#666'}`,
              color: planetAnnotations.length > 0 ? theme.colors.text : '#666',
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              borderRadius: '4px',
              cursor: planetAnnotations.length > 0 ? 'pointer' : 'not-allowed',
              fontSize: theme.typography.fontSize.xs,
              flex: 1
            }}
            title="Export annotations"
          >
            💾 Export
          </button>
          
          <button
            onClick={handleClear}
            disabled={planetAnnotations.length === 0}
            style={{
              background: planetAnnotations.length > 0 
                ? 'rgba(255, 0, 0, 0.2)' 
                : 'rgba(128, 128, 128, 0.2)',
              border: `1px solid ${planetAnnotations.length > 0 ? '#ff0000' : '#666'}`,
              color: planetAnnotations.length > 0 ? theme.colors.text : '#666',
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              borderRadius: '4px',
              cursor: planetAnnotations.length > 0 ? 'pointer' : 'not-allowed',
              fontSize: theme.typography.fontSize.xs,
              flex: 1
            }}
            title="Clear all annotations"
          >
            🗑️ Clear
          </button>
        </div>

        {/* Keyboard shortcuts */}
        <div style={{
          color: theme.colors.textSecondary,
          fontSize: theme.typography.fontSize.xs,
          padding: theme.spacing.sm,
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '4px',
          borderTop: `1px solid ${theme.colors.border}`
        }}>
          <div style={{ 
            fontWeight: theme.typography.fontWeight.bold, 
            marginBottom: '4px',
            color: theme.colors.primary 
          }}>
            ⌨️ Shortcuts:
          </div>
          <div>ESC - Deselect tool / Exit annotation mode</div>
          <div>Enter - Finish drawing (area/line)</div>
          <div>ESC - Cancel drawing</div>
        </div>
      </div>
    </div>
  )
}

export default AnnotationToolbar
