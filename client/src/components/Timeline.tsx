import React, { useState, useEffect } from 'react'
import { useTheme } from '../lib/ui/theme'
import { useAudio } from '../lib/audio/AudioContext'
import { getDatasetsForPlanet, getAvailableDates } from '../lib/datasets'

interface TimelineProps {
  currentDate: string
  onDateChange: (date: string) => void
  planet: string
}

const Timeline: React.FC<TimelineProps> = ({ currentDate, onDateChange, planet }) => {
  const { theme } = useTheme()
  const { playSound } = useAudio()
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Get available dates for the planet
    const datasets = getDatasetsForPlanet(planet)
    const timeLayers = datasets.filter(d => d.hasTime)
    
    if (timeLayers.length > 0) {
      const dates = getAvailableDates(timeLayers[0])
      setAvailableDates(dates)
    } else {
      // Generate some default dates if no time layers
      const dates: string[] = []
      const startDate = new Date('2020-01-01')
      const endDate = new Date()
      
      for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
        dates.push(d.toISOString().split('T')[0])
      }
      
      setAvailableDates(dates)
    }
  }, [planet])

  const handleDateChange = (date: string) => {
    onDateChange(date)
    playSound('click')
  }

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getCurrentDateIndex = (): number => {
    return availableDates.findIndex(date => date === currentDate)
  }

  const handlePrevious = () => {
    const currentIndex = getCurrentDateIndex()
    if (currentIndex > 0) {
      handleDateChange(availableDates[currentIndex - 1])
    }
  }

  const handleNext = () => {
    const currentIndex = getCurrentDateIndex()
    if (currentIndex < availableDates.length - 1) {
      handleDateChange(availableDates[currentIndex + 1])
    }
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value)
    handleDateChange(availableDates[index])
  }

  if (availableDates.length === 0) {
    return null
  }

  return (
    <div style={{
      position: 'absolute',
      bottom: theme.spacing.lg,
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0, 0, 17, 0.9)',
      border: `1px solid ${theme.colors.border}`,
      borderRadius: '8px',
      padding: theme.spacing.md,
      zIndex: 20,
      backdropFilter: theme.effects.blur,
      boxShadow: theme.effects.shadow,
      minWidth: '400px',
      maxWidth: '600px'
    }}>
      {/* Timeline Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm
      }}>
        <h3 style={{
          color: theme.colors.primary,
          fontSize: theme.typography.fontSize.md,
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Timeline
        </h3>
        
        <button
          onClick={() => {
            setIsOpen(!isOpen)
            playSound('click')
          }}
          style={{
            background: 'transparent',
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.text,
            padding: theme.spacing.sm,
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: theme.typography.fontSize.sm,
            transition: 'all 0.3s ease'
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
          {isOpen ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {/* Current Date Display */}
      <div style={{
        textAlign: 'center',
        marginBottom: theme.spacing.md
      }}>
        <div style={{
          color: theme.colors.text,
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.bold,
          textShadow: theme.effects.glow
        }}>
          {formatDate(currentDate)}
        </div>
        <div style={{
          color: theme.colors.textSecondary,
          fontSize: theme.typography.fontSize.sm,
          opacity: 0.7
        }}>
          {getCurrentDateIndex() + 1} of {availableDates.length} dates
        </div>
      </div>

      {/* Timeline Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing.md
      }}>
        <button
          onClick={handlePrevious}
          disabled={getCurrentDateIndex() === 0}
          style={{
            background: 'transparent',
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.text,
            padding: theme.spacing.sm,
            borderRadius: '4px',
            cursor: getCurrentDateIndex() === 0 ? 'not-allowed' : 'pointer',
            fontSize: theme.typography.fontSize.md,
            opacity: getCurrentDateIndex() === 0 ? 0.5 : 1,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (getCurrentDateIndex() > 0) {
              e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)'
              e.currentTarget.style.boxShadow = theme.effects.glow
              playSound('hover')
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          ◀
        </button>

        {/* Timeline Slider */}
        <div style={{ flex: 1 }}>
          <input
            type="range"
            min="0"
            max={availableDates.length - 1}
            value={getCurrentDateIndex()}
            onChange={handleSliderChange}
            style={{
              width: '100%',
              height: '4px',
              background: 'rgba(0, 255, 255, 0.2)',
              outline: 'none',
              borderRadius: '2px',
              cursor: 'pointer'
            }}
            onMouseEnter={() => playSound('hover')}
          />
        </div>

        <button
          onClick={handleNext}
          disabled={getCurrentDateIndex() === availableDates.length - 1}
          style={{
            background: 'transparent',
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.text,
            padding: theme.spacing.sm,
            borderRadius: '4px',
            cursor: getCurrentDateIndex() === availableDates.length - 1 ? 'not-allowed' : 'pointer',
            fontSize: theme.typography.fontSize.md,
            opacity: getCurrentDateIndex() === availableDates.length - 1 ? 0.5 : 1,
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (getCurrentDateIndex() < availableDates.length - 1) {
              e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)'
              e.currentTarget.style.boxShadow = theme.effects.glow
              playSound('hover')
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          ▶
        </button>
      </div>

      {/* Date Details */}
      {isOpen && (
        <div style={{
          marginTop: theme.spacing.md,
          padding: theme.spacing.md,
          background: 'rgba(0, 255, 255, 0.05)',
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '4px'
        }}>
          <div style={{
            color: theme.colors.text,
            fontSize: theme.typography.fontSize.sm,
            marginBottom: theme.spacing.sm
          }}>
            Available dates: {availableDates.length}
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: theme.spacing.sm,
            maxHeight: '150px',
            overflowY: 'auto'
          }}>
            {availableDates.slice(0, 20).map((date) => (
              <button
                key={date}
                onClick={() => handleDateChange(date)}
                style={{
                  background: date === currentDate ? theme.colors.primary : 'transparent',
                  color: date === currentDate ? theme.colors.background : theme.colors.text,
                  border: `1px solid ${theme.colors.border}`,
                  padding: theme.spacing.sm,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: theme.typography.fontSize.sm,
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  if (date !== currentDate) {
                    e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)'
                    e.currentTarget.style.boxShadow = theme.effects.glow
                  }
                  playSound('hover')
                }}
                onMouseLeave={(e) => {
                  if (date !== currentDate) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                {formatDate(date)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Timeline
