import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from '../lib/ui/theme'
import { useAudio } from '../lib/audio/AudioContext'
import { getDatasetsForPlanet, getAvailableDates } from '../lib/datasets'
import { layerSupportsTime, type PlanetId, type LayerId } from '../config/planetLayers'

interface TimelineProps {
  currentDate: string
  onDateChange: (date: string) => void
  planet: string
  layer?: string
}

const Timeline: React.FC<TimelineProps> = ({ currentDate, onDateChange, planet, layer }) => {
  const { theme } = useTheme()
  const { playSound } = useAudio()
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [hasTimeData, setHasTimeData] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const initializedRef = useRef(false)

  useEffect(() => {
    const planetId = planet as PlanetId
    const layerId = layer as LayerId
    
    // Check if the current layer supports time
    const supportsTime = layerId ? layerSupportsTime(planetId, layerId) : false
    
    if (supportsTime) {
      const datasets = getDatasetsForPlanet(planet)
      const timeLayers = datasets.filter(d => d.hasTime)
      
      if (timeLayers.length > 0) {
        const dates = getAvailableDates(timeLayers[0]).filter(date => Boolean(date))
        if (dates.length > 0) {
          setHasTimeData(true)
          setAvailableDates(dates)
          // Only call onDateChange on initial load, not on every update
          if (!initializedRef.current && !dates.includes(currentDate)) {
            onDateChange(dates[dates.length - 1])
            initializedRef.current = true
          }
          return
        }
      }
    }
    
    setHasTimeData(false)
    setAvailableDates(currentDate ? [currentDate] : [])
    initializedRef.current = true
  }, [planet, layer]) // Removed currentDate and onDateChange from dependencies

  const handleDateChange = (date: string) => {
    if (!date || date === currentDate) {
      return
    }
    onDateChange(date)
    playSound('click')
  }

  const getCurrentDateIndex = (): number => {
    const index = availableDates.indexOf(currentDate)
    return index >= 0 ? index : 0
  }

  const timelineDisabled = !hasTimeData || availableDates.length <= 1
  const currentIndex = getCurrentDateIndex()
  const safeIndex = Math.min(currentIndex, Math.max(availableDates.length - 1, 0))
  const displayIndex = availableDates.length > 0 ? safeIndex + 1 : 0

  const handlePrevious = () => {
    if (timelineDisabled) return
    const index = getCurrentDateIndex()
    if (index > 0) {
      handleDateChange(availableDates[index - 1])
    }
  }

  const handleNext = () => {
    if (timelineDisabled) return
    const index = getCurrentDateIndex()
    if (index >= 0 && index < availableDates.length - 1) {
      handleDateChange(availableDates[index + 1])
    }
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (timelineDisabled) return
    const index = Number(e.target.value)
    const nextDate = availableDates[index]
    if (nextDate) {
      handleDateChange(nextDate)
    }
  }

  if (availableDates.length === 0) {
    return null
  }

  // If no time data, show a simplified "Latest imagery" state
  if (!hasTimeData) {
    return (
      <div
        style={{
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
          minWidth: '300px',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            color: theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.md,
            opacity: 0.7
          }}
        >
          📅 Latest Imagery
        </div>
        <div
          style={{
            color: theme.colors.text,
            fontSize: theme.typography.fontSize.sm,
            marginTop: theme.spacing.xs
          }}
        >
          {new Date(currentDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
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
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
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

      <div
        style={{
          textAlign: 'center',
          marginBottom: theme.spacing.md
        }}
      >
        <div
          style={{
            color: theme.colors.text,
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.bold,
            textShadow: theme.effects.glow
          }}
        >
          {new Date(currentDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
        <div
          style={{
            color: theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.sm,
            opacity: 0.7
          }}
        >
          {displayIndex} of {availableDates.length} dates
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.md
        }}
      >
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
          {'<'}
        </button>

        <div style={{ flex: 1 }}>
          <input
            type="range"
            min={0}
            max={Math.max(availableDates.length - 1, 0)}
            step={1}
            value={safeIndex}
            onChange={handleSliderChange}
            style={{
              width: '100%',
              accentColor: theme.colors.primary,
              cursor: 'pointer'
            }}
          />
        </div>

        <button
          onClick={handleNext}
          disabled={getCurrentDateIndex() >= availableDates.length - 1}
          style={{
            background: 'transparent',
            border: `1px solid ${theme.colors.border}`,
            color: theme.colors.text,
            padding: theme.spacing.sm,
            borderRadius: '4px',
            cursor: getCurrentDateIndex() >= availableDates.length - 1 ? 'not-allowed' : 'pointer',
            fontSize: theme.typography.fontSize.md,
            opacity: getCurrentDateIndex() >= availableDates.length - 1 ? 0.5 : 1,
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
          {'>'}
        </button>
      </div>

      {isOpen && (
        <div
          style={{
            marginTop: theme.spacing.md,
            color: theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.sm,
            lineHeight: 1.4
          }}
        >
          Use the slider or buttons to navigate available observation dates. Data availability depends on the selected layer.
        </div>
      )}
    </div>
  )
}

export default Timeline