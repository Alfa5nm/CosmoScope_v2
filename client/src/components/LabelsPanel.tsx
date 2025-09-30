import React, { useState } from 'react'
import { useTheme } from '../lib/ui/theme'
import { useAudio } from '../lib/audio/AudioContext'
import { useUserLabels, useCreateLabel, useDeleteLabel } from '../lib/api/hooks'

interface LabelsPanelProps {
  planet: string
  labels: any[] // Local labels from game state
  onCreateLabel: (label: any) => void
  onDeleteLabel: (labelId: string) => void
  onClose: () => void
}

const LabelsPanel: React.FC<LabelsPanelProps> = ({
  planet,
  labels: localLabels,
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
    coordinates: [0, 0] as [number, number]
  })

  // Use React Query for server-side labels
  const { data: serverLabels = [], isLoading, error } = useUserLabels(planet)
  const createLabelMutation = useCreateLabel()
  const deleteLabelMutation = useDeleteLabel()

  // Combine local and server labels
  const allLabels = [...localLabels, ...serverLabels]

  const handleCreateLabel = async () => {
    if (!newLabel.name.trim()) {
      playSound('click')
      return
    }

    try {
      // Create on server first
      await createLabelMutation.mutateAsync({
        ...newLabel,
        planet,
        createdAt: new Date().toISOString()
      })

      // Also add to local state for immediate feedback
      onCreateLabel({
        ...newLabel,
        id: crypto.randomUUID(),
        planet,
        createdAt: new Date().toISOString()
      })

      setNewLabel({ name: '', description: '', coordinates: [0, 0] })
      setIsCreating(false)
      playSound('click')
    } catch (error) {
      console.error('Failed to create label:', error)
      // Fallback to local creation
      onCreateLabel({
        ...newLabel,
        id: crypto.randomUUID(),
        planet,
        createdAt: new Date().toISOString()
      })
      setNewLabel({ name: '', description: '', coordinates: [0, 0] })
      setIsCreating(false)
      playSound('click')
    }
  }

  const handleDeleteLabel = async (labelId: string) => {
    try {
      // Try to delete from server first
      await deleteLabelMutation.mutateAsync(labelId)
    } catch (error) {
      console.error('Failed to delete label from server:', error)
    }

    // Always delete from local state
    onDeleteLabel(labelId)
    playSound('click')
  }

  const handleCoordinateChange = (index: number, value: string) => {
    const numValue = parseFloat(value) || 0
    setNewLabel(prev => ({
      ...prev,
      coordinates: [
        index === 0 ? numValue : prev.coordinates[0],
        index === 1 ? numValue : prev.coordinates[1]
      ]
    }))
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '400px',
        height: '100vh',
        background: theme.colors.backgroundSecondary,
        border: `1px solid ${theme.colors.border}`,
        borderRight: 'none',
        borderRadius: '8px 0 0 8px',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: theme.effects.blur,
        boxShadow: theme.effects.shadow
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: theme.spacing.lg,
          borderBottom: `1px solid ${theme.colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h2
          style={{
            color: theme.colors.primary,
            fontSize: theme.typography.fontSize.lg,
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          📍 Labels
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.text,
            padding: theme.spacing.sm,
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: theme.typography.fontSize.md,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 0, 0, 0.1)'
            e.currentTarget.style.boxShadow = theme.effects.glow
            playSound('hover')
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Create New Label */}
        <div
          style={{
            padding: theme.spacing.lg,
            borderBottom: `1px solid ${theme.colors.border}`
          }}
        >
          <button
            onClick={() => {
              setIsCreating(!isCreating)
              playSound('click')
            }}
            style={{
              width: '100%',
              background: isCreating ? theme.colors.primary : 'transparent',
              border: `1px solid ${theme.colors.border}`,
              color: isCreating ? theme.colors.background : theme.colors.text,
              padding: theme.spacing.md,
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: theme.typography.fontSize.md,
              transition: 'all 0.3s ease',
              marginBottom: isCreating ? theme.spacing.md : 0
            }}
            onMouseEnter={(e) => {
              if (!isCreating) {
                e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)'
                e.currentTarget.style.boxShadow = theme.effects.glow
                playSound('hover')
              }
            }}
            onMouseLeave={(e) => {
              if (!isCreating) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.boxShadow = 'none'
              }
            }}
          >
            {isCreating ? 'Cancel' : '+ Create New Label'}
          </button>

          {isCreating && (
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: theme.spacing.md,
                borderRadius: '4px',
                border: `1px solid ${theme.colors.border}`
              }}
            >
              <input
                type="text"
                placeholder="Label name"
                value={newLabel.name}
                onChange={(e) => setNewLabel(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.text,
                  padding: theme.spacing.sm,
                  borderRadius: '4px',
                  fontSize: theme.typography.fontSize.sm,
                  marginBottom: theme.spacing.sm
                }}
              />
              <textarea
                placeholder="Description (optional)"
                value={newLabel.description}
                onChange={(e) => setNewLabel(prev => ({ ...prev, description: e.target.value }))}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.text,
                  padding: theme.spacing.sm,
                  borderRadius: '4px',
                  fontSize: theme.typography.fontSize.sm,
                  marginBottom: theme.spacing.sm,
                  minHeight: '60px',
                  resize: 'vertical'
                }}
              />
              <div
                style={{
                  display: 'flex',
                  gap: theme.spacing.sm,
                  marginBottom: theme.spacing.sm
                }}
              >
                <input
                  type="number"
                  placeholder="Longitude"
                  value={newLabel.coordinates[0]}
                  onChange={(e) => handleCoordinateChange(0, e.target.value)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.text,
                    padding: theme.spacing.sm,
                    borderRadius: '4px',
                    fontSize: theme.typography.fontSize.sm
                  }}
                />
                <input
                  type="number"
                  placeholder="Latitude"
                  value={newLabel.coordinates[1]}
                  onChange={(e) => handleCoordinateChange(1, e.target.value)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.text,
                    padding: theme.spacing.sm,
                    borderRadius: '4px',
                    fontSize: theme.typography.fontSize.sm
                  }}
                />
              </div>
              <button
                onClick={handleCreateLabel}
                disabled={!newLabel.name.trim() || createLabelMutation.isPending}
                style={{
                  width: '100%',
                  background: newLabel.name.trim() ? theme.colors.primary : 'rgba(0, 255, 255, 0.3)',
                  border: 'none',
                  color: theme.colors.background,
                  padding: theme.spacing.sm,
                  borderRadius: '4px',
                  cursor: newLabel.name.trim() ? 'pointer' : 'not-allowed',
                  fontSize: theme.typography.fontSize.sm,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (newLabel.name.trim()) {
                    e.currentTarget.style.boxShadow = theme.effects.glow
                    playSound('hover')
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {createLabelMutation.isPending ? 'Creating...' : 'Create Label'}
              </button>
            </div>
          )}
        </div>

        {/* Labels List */}
        <div style={{ flex: 1, overflow: 'auto', padding: theme.spacing.lg }}>
          {isLoading && (
            <div
              style={{
                color: theme.colors.textSecondary,
                textAlign: 'center',
                padding: theme.spacing.lg
              }}
            >
              Loading labels...
            </div>
          )}

          {error && (
            <div
              style={{
                color: theme.colors.error,
                textAlign: 'center',
                padding: theme.spacing.lg,
                fontSize: theme.typography.fontSize.sm
              }}
            >
              Failed to load labels from server
            </div>
          )}

          {allLabels.length === 0 && !isLoading ? (
            <div
              style={{
                color: theme.colors.textSecondary,
                textAlign: 'center',
                padding: theme.spacing.lg
              }}
            >
              No labels yet. Create your first label to mark interesting locations!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
              {allLabels.map((label) => (
                <div
                  key={label.id}
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '4px',
                    padding: theme.spacing.md
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: theme.spacing.sm
                    }}
                  >
                    <h3
                      style={{
                        color: theme.colors.primary,
                        fontSize: theme.typography.fontSize.md,
                        margin: 0,
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                    >
                      {label.name}
                    </h3>
                    <button
                      onClick={() => handleDeleteLabel(label.id)}
                      disabled={deleteLabelMutation.isPending}
                      style={{
                        background: 'transparent',
                        border: `1px solid ${theme.colors.error}`,
                        color: theme.colors.error,
                        padding: theme.spacing.xs,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: theme.typography.fontSize.sm,
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 0, 0, 0.1)'
                        e.currentTarget.style.boxShadow = theme.effects.glow
                        playSound('hover')
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      {deleteLabelMutation.isPending ? '...' : '✕'}
                    </button>
                  </div>
                  {label.description && (
                    <p
                      style={{
                        color: theme.colors.textSecondary,
                        fontSize: theme.typography.fontSize.sm,
                        margin: 0,
                        marginBottom: theme.spacing.sm,
                        lineHeight: 1.4
                      }}
                    >
                      {label.description}
                    </p>
                  )}
                  <div
                    style={{
                      color: theme.colors.textSecondary,
                      fontSize: theme.typography.fontSize.xs,
                      opacity: 0.7
                    }}
                  >
                    Coordinates: {label.coordinates[0]?.toFixed(4)}, {label.coordinates[1]?.toFixed(4)}
                  </div>
                  <div
                    style={{
                      color: theme.colors.textSecondary,
                      fontSize: theme.typography.fontSize.xs,
                      opacity: 0.7,
                      marginTop: theme.spacing.xs
                    }}
                  >
                    Created: {new Date(label.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LabelsPanel