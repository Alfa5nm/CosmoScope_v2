import React, { useState } from 'react'
import { useTheme } from '../lib/ui/theme'
import { useAudio } from '../lib/audio/AudioContext'

interface LabelsPanelProps {
  planet: string
  labels: any[]
  onCreateLabel: (label: any) => void
  onDeleteLabel: (labelId: string) => void
  onClose: () => void
}

const LabelsPanel: React.FC<LabelsPanelProps> = ({
  planet,
  labels,
  onCreateLabel,
  onDeleteLabel,
  onClose
}) => {
  const { theme } = useTheme()
  const { playSound } = useAudio()
  const [isCreating, setIsCreating] = useState(false)
  const [newLabel, setNewLabel] = useState({
    name: '',
    description: '',
    category: 'note',
    coordinates: { lat: 0, lon: 0 }
  })

  const categories = [
    { id: 'note', name: 'Note', color: '#ff0088' },
    { id: 'crater', name: 'Crater', color: '#ffaa00' },
    { id: 'anomaly', name: 'Anomaly', color: '#ff4444' },
    { id: 'site', name: 'Site', color: '#00ff88' }
  ]

  const handleCreateLabel = () => {
    if (!newLabel.name.trim()) return

    const label = {
      ...newLabel,
      id: crypto.randomUUID(),
      planet,
      createdAt: new Date().toISOString()
    }

    onCreateLabel(label)
    setNewLabel({ name: '', description: '', category: 'note', coordinates: { lat: 0, lon: 0 } })
    setIsCreating(false)
    playSound('click')
  }

  const handleDeleteLabel = (labelId: string) => {
    onDeleteLabel(labelId)
    playSound('click')
  }

  const getCategoryColor = (category: string): string => {
    const cat = categories.find(c => c.id === category)
    return cat ? cat.color : '#ff0088'
  }

  const getCategoryName = (category: string): string => {
    const cat = categories.find(c => c.id === category)
    return cat ? cat.name : 'Note'
  }

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: theme.colors.backgroundSecondary,
      border: `2px solid ${theme.colors.primary}`,
      borderRadius: '12px',
      padding: theme.spacing.xl,
      minWidth: '500px',
      maxWidth: '600px',
      maxHeight: '80vh',
      zIndex: 30,
      boxShadow: theme.effects.shadowStrong,
      backdropFilter: theme.effects.blur,
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.lg
      }}>
        <h2 style={{
          color: theme.colors.primary,
          fontSize: theme.typography.fontSize.xl,
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Labels & Annotations
        </h2>
        
        <button
          onClick={onClose}
          style={{
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
      </div>

      {/* Create New Label */}
      <div style={{
        marginBottom: theme.spacing.xl,
        padding: theme.spacing.md,
        background: 'rgba(0, 255, 255, 0.05)',
        border: `1px solid ${theme.colors.border}`,
        borderRadius: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.md
        }}>
          <h3 style={{
            color: theme.colors.text,
            fontSize: theme.typography.fontSize.md,
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Create New Label
          </h3>
          
          <button
            onClick={() => {
              setIsCreating(!isCreating)
              playSound('click')
            }}
            style={{
              background: isCreating ? theme.colors.primary : 'transparent',
              color: isCreating ? theme.colors.background : theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              padding: theme.spacing.sm,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: theme.typography.fontSize.sm,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={() => playSound('hover')}
          >
            {isCreating ? 'Cancel' : 'New Label'}
          </button>
        </div>

        {isCreating && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            <div>
              <label style={{
                display: 'block',
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.sm,
                marginBottom: theme.spacing.xs,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Name
              </label>
              <input
                type="text"
                value={newLabel.name}
                onChange={(e) => setNewLabel(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  width: '100%',
                  background: 'rgba(0, 255, 255, 0.05)',
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.text,
                  padding: theme.spacing.sm,
                  borderRadius: '4px',
                  fontFamily: theme.typography.fontFamily,
                  fontSize: theme.typography.fontSize.md,
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(0, 255, 255, 0.1)'
                  e.target.style.boxShadow = theme.effects.glow
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(0, 255, 255, 0.05)'
                  e.target.style.boxShadow = 'none'
                }}
                placeholder="Enter label name..."
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.sm,
                marginBottom: theme.spacing.xs,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Description
              </label>
              <textarea
                value={newLabel.description}
                onChange={(e) => setNewLabel(prev => ({ ...prev, description: e.target.value }))}
                style={{
                  width: '100%',
                  background: 'rgba(0, 255, 255, 0.05)',
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.text,
                  padding: theme.spacing.sm,
                  borderRadius: '4px',
                  fontFamily: theme.typography.fontFamily,
                  fontSize: theme.typography.fontSize.md,
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '60px',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(0, 255, 255, 0.1)'
                  e.target.style.boxShadow = theme.effects.glow
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(0, 255, 255, 0.05)'
                  e.target.style.boxShadow = 'none'
                }}
                placeholder="Enter description..."
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.sm,
                marginBottom: theme.spacing.xs,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Category
              </label>
              <select
                value={newLabel.category}
                onChange={(e) => setNewLabel(prev => ({ ...prev, category: e.target.value }))}
                style={{
                  width: '100%',
                  background: 'rgba(0, 255, 255, 0.05)',
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.text,
                  padding: theme.spacing.sm,
                  borderRadius: '4px',
                  fontFamily: theme.typography.fontFamily,
                  fontSize: theme.typography.fontSize.md,
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(0, 255, 255, 0.1)'
                  e.target.style.boxShadow = theme.effects.glow
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(0, 255, 255, 0.05)'
                  e.target.style.boxShadow = 'none'
                }}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCreateLabel}
              disabled={!newLabel.name.trim()}
              style={{
                background: newLabel.name.trim() ? theme.colors.primary : 'transparent',
                color: newLabel.name.trim() ? theme.colors.background : theme.colors.text,
                border: `1px solid ${theme.colors.border}`,
                padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                borderRadius: '4px',
                cursor: newLabel.name.trim() ? 'pointer' : 'not-allowed',
                fontSize: theme.typography.fontSize.md,
                fontWeight: theme.typography.fontWeight.bold,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                transition: 'all 0.3s ease',
                opacity: newLabel.name.trim() ? 1 : 0.5
              }}
              onMouseEnter={() => {
                if (newLabel.name.trim()) {
                  playSound('hover')
                }
              }}
            >
              Create Label
            </button>
          </div>
        )}
      </div>

      {/* Existing Labels */}
      <div>
        <h3 style={{
          color: theme.colors.text,
          fontSize: theme.typography.fontSize.md,
          margin: 0,
          marginBottom: theme.spacing.md,
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Existing Labels ({labels.length})
        </h3>

        {labels.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.sm,
            padding: theme.spacing.lg,
            opacity: 0.7
          }}>
            No labels created yet. Create your first label above!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
            {labels.map(label => (
              <div
                key={label.id}
                style={{
                  background: 'rgba(0, 255, 255, 0.05)',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  padding: theme.spacing.md,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)'
                  e.currentTarget.style.boxShadow = theme.effects.glow
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 255, 255, 0.05)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: theme.spacing.sm
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: getCategoryColor(label.category),
                        boxShadow: `0 0 8px ${getCategoryColor(label.category)}`
                      }}
                    />
                    <h4 style={{
                      color: theme.colors.text,
                      fontSize: theme.typography.fontSize.md,
                      margin: 0,
                      fontWeight: theme.typography.fontWeight.bold
                    }}>
                      {label.name}
                    </h4>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteLabel(label.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: theme.colors.error,
                      cursor: 'pointer',
                      padding: theme.spacing.sm,
                      borderRadius: '4px',
                      fontSize: theme.typography.fontSize.sm,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 68, 68, 0.2)'
                      playSound('hover')
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    Delete
                  </button>
                </div>
                
                {label.description && (
                  <p style={{
                    color: theme.colors.textSecondary,
                    fontSize: theme.typography.fontSize.sm,
                    margin: 0,
                    marginBottom: theme.spacing.sm,
                    lineHeight: 1.4
                  }}>
                    {label.description}
                  </p>
                )}
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.textSecondary,
                  opacity: 0.7
                }}>
                  <span>{getCategoryName(label.category)}</span>
                  <span>{new Date(label.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LabelsPanel
