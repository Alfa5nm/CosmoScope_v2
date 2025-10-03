import React, { useState } from 'react'
import { useAnnotationStore, type Annotation } from '../../store/annotationStore'
import { useTheme } from '../../lib/ui/theme'
import { useAudio } from '../../lib/audio/AudioContext'

interface AnnotationPanelProps {
  planet: 'earth' | 'mars' | 'moon'
}

const AnnotationPanel: React.FC<AnnotationPanelProps> = ({ planet }) => {
  const { theme } = useTheme()
  const { playSound } = useAudio()
  const [isExpanded, setIsExpanded] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Annotation>>({})

  const {
    isEnabled,
    selectedAnnotation,
    updateAnnotation,
    deleteAnnotation,
    selectAnnotation,
    getAnnotationsByPlanet
  } = useAnnotationStore()

  const planetAnnotations = getAnnotationsByPlanet(planet)
  const selectedAnn = planetAnnotations.find(ann => ann.id === selectedAnnotation)

  const handleEdit = (annotation: Annotation) => {
    setEditingId(annotation.id)
    setEditForm({
      title: annotation.title,
      description: annotation.description,
      color: annotation.color,
      tags: annotation.tags
    })
    playSound('click')
  }

  const handleSaveEdit = () => {
    if (!editingId) return

    updateAnnotation(editingId, editForm)
    setEditingId(null)
    setEditForm({})
    playSound('click')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
    playSound('click')
  }

  const handleDelete = (annotation: Annotation) => {
    if (window.confirm(`Delete annotation "${annotation.title}"?`)) {
      deleteAnnotation(annotation.id)
      playSound('click')
    }
  }

  const formatCoordinates = (coords: number[]) => {
    if (coords.length === 2) {
      return `${coords[1].toFixed(4)}°, ${coords[0].toFixed(4)}°`
    }
    return `${coords.length / 2} points`
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'point': return '📍'
      case 'area': return '⬜'
      case 'line': return '📏'
      case 'text': return '📝'
      default: return '❓'
    }
  }

  if (!isEnabled) return null

  return (
    <div style={{
      position: 'absolute',
      bottom: theme.spacing.lg,
      left: theme.spacing.lg,
      zIndex: 40,
      maxWidth: '400px',
      minWidth: '300px'
    }}>
      {/* Toggle button */}
      <button
        onClick={() => {
          setIsExpanded(!isExpanded)
          playSound('click')
        }}
        style={{
          background: 'rgba(0, 0, 17, 0.9)',
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
          gap: theme.spacing.sm,
          marginBottom: isExpanded ? theme.spacing.sm : 0
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)'
          playSound('hover')
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 17, 0.9)'
        }}
      >
        <span style={{ fontSize: '16px' }}>📋</span>
        <span>Annotations ({planetAnnotations.length})</span>
        <span style={{ marginLeft: 'auto', fontSize: '12px' }}>
          {isExpanded ? '▼' : '▲'}
        </span>
      </button>

      {/* Panel content */}
      {isExpanded && (
        <div style={{
          background: 'rgba(0, 0, 17, 0.95)',
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '8px',
          backdropFilter: theme.effects.blur,
          maxHeight: '400px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{
            padding: theme.spacing.md,
            borderBottom: `1px solid ${theme.colors.border}`,
            color: theme.colors.primary,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.bold
          }}>
            {planet.toUpperCase()} ANNOTATIONS
          </div>

          {/* Selected annotation details */}
          {selectedAnn && (
            <div style={{
              padding: theme.spacing.md,
              borderBottom: `1px solid ${theme.colors.border}`,
              background: 'rgba(0, 255, 255, 0.1)'
            }}>
              {editingId === selectedAnn.id ? (
                // Edit form
                <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Title"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: `1px solid ${theme.colors.border}`,
                      color: theme.colors.text,
                      padding: theme.spacing.sm,
                      borderRadius: '4px',
                      fontSize: theme.typography.fontSize.sm
                    }}
                  />
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description"
                    rows={2}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: `1px solid ${theme.colors.border}`,
                      color: theme.colors.text,
                      padding: theme.spacing.sm,
                      borderRadius: '4px',
                      fontSize: theme.typography.fontSize.sm,
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                    <button
                      onClick={handleSaveEdit}
                      style={{
                        background: 'rgba(0, 255, 0, 0.2)',
                        border: '1px solid #00ff00',
                        color: theme.colors.text,
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: theme.typography.fontSize.xs,
                        flex: 1
                      }}
                    >
                      💾 Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        background: 'rgba(255, 0, 0, 0.2)',
                        border: '1px solid #ff0000',
                        color: theme.colors.text,
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: theme.typography.fontSize.xs,
                        flex: 1
                      }}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.sm,
                    marginBottom: theme.spacing.sm
                  }}>
                    <span style={{ fontSize: '16px' }}>{getTypeIcon(selectedAnn.type)}</span>
                    <span style={{
                      color: theme.colors.text,
                      fontSize: theme.typography.fontSize.md,
                      fontWeight: theme.typography.fontWeight.bold,
                      flex: 1
                    }}>
                      {selectedAnn.title}
                    </span>
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: selectedAnn.color,
                        border: '1px solid white'
                      }}
                    />
                  </div>
                  
                  {selectedAnn.description && (
                    <div style={{
                      color: theme.colors.textSecondary,
                      fontSize: theme.typography.fontSize.sm,
                      marginBottom: theme.spacing.sm,
                      lineHeight: 1.4
                    }}>
                      {selectedAnn.description}
                    </div>
                  )}
                  
                  <div style={{
                    color: theme.colors.textSecondary,
                    fontSize: theme.typography.fontSize.xs,
                    marginBottom: theme.spacing.sm
                  }}>
                    📍 {formatCoordinates(selectedAnn.coordinates)}
                  </div>
                  
                  <div style={{
                    color: theme.colors.textSecondary,
                    fontSize: theme.typography.fontSize.xs,
                    marginBottom: theme.spacing.sm
                  }}>
                    🕒 {new Date(selectedAnn.createdAt).toLocaleString()}
                  </div>

                  <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                    <button
                      onClick={() => handleEdit(selectedAnn)}
                      style={{
                        background: 'rgba(255, 165, 0, 0.2)',
                        border: '1px solid #ffa500',
                        color: theme.colors.text,
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: theme.typography.fontSize.xs,
                        flex: 1
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(selectedAnn)}
                      style={{
                        background: 'rgba(255, 0, 0, 0.2)',
                        border: '1px solid #ff0000',
                        color: theme.colors.text,
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: theme.typography.fontSize.xs,
                        flex: 1
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Annotations list */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            maxHeight: '200px'
          }}>
            {planetAnnotations.length === 0 ? (
              <div style={{
                padding: theme.spacing.md,
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.sm,
                textAlign: 'center'
              }}>
                No annotations yet. Use the tools above to create some!
              </div>
            ) : (
              planetAnnotations.map(annotation => (
                <div
                  key={annotation.id}
                  onClick={() => {
                    selectAnnotation(annotation.id === selectedAnnotation ? null : annotation.id)
                    playSound('click')
                  }}
                  style={{
                    padding: theme.spacing.sm,
                    borderBottom: `1px solid ${theme.colors.border}`,
                    cursor: 'pointer',
                    background: selectedAnnotation === annotation.id 
                      ? 'rgba(0, 255, 255, 0.1)' 
                      : 'transparent',
                    transition: 'background 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedAnnotation !== annotation.id) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    }
                    playSound('hover')
                  }}
                  onMouseLeave={(e) => {
                    if (selectedAnnotation !== annotation.id) {
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.sm
                  }}>
                    <span style={{ fontSize: '14px' }}>{getTypeIcon(annotation.type)}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        color: theme.colors.text,
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.medium
                      }}>
                        {annotation.title}
                      </div>
                      <div style={{
                        color: theme.colors.textSecondary,
                        fontSize: theme.typography.fontSize.xs
                      }}>
                        {annotation.type} • {formatCoordinates(annotation.coordinates)}
                      </div>
                    </div>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: annotation.color,
                        border: '1px solid white'
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AnnotationPanel



