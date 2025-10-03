import React from 'react'
import { useCountryStore } from '../../store/countryStore'
import { useTheme } from '../../lib/ui/theme'
import { useAudio } from '../../lib/audio/AudioContext'

interface CountryToggleProps {
  planet: 'earth' | 'mars' | 'moon'
  onToast?: (toast: { message: string; type: 'success' | 'error' | 'info' }) => void
}

const CountryToggle: React.FC<CountryToggleProps> = ({ planet, onToast }) => {
  const { theme } = useTheme()
  const { playSound } = useAudio()
  
  const {
    isEnabled,
    selectedCountry,
    selectedPOI,
    toggleCountryLayer,
    getCountriesWithPOI
  } = useCountryStore()

  // Only show for Earth
  if (planet !== 'earth') return null

  const countriesWithPOI = getCountriesWithPOI()
  const totalPOIs = countriesWithPOI.reduce((sum, country) => sum + country.pointsOfInterest.length, 0)

  const handleToggle = () => {
    toggleCountryLayer()
    playSound('click')
    
    if (!isEnabled) {
      onToast?.({
        message: `Countries & POIs enabled - ${totalPOIs} points of interest available`,
        type: 'success'
      })
    } else {
      onToast?.({
        message: 'Countries & POIs disabled',
        type: 'info'
      })
    }
  }

  return (
    <div style={{
      position: 'absolute',
      top: '240px', // Increased spacing from Warnings Off button
      right: theme.spacing.lg,
      zIndex: 30
    }}>
      <button
        onClick={handleToggle}
        style={{
          background: isEnabled 
            ? 'rgba(51, 154, 240, 0.9)' 
            : 'rgba(0, 0, 17, 0.9)',
          border: isEnabled 
            ? `1px solid #339af0` 
            : `1px solid ${theme.colors.border}`,
          color: isEnabled ? '#000' : theme.colors.text,
          padding: `${theme.spacing.md} ${theme.spacing.lg}`,
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: theme.typography.fontSize.sm,
          backdropFilter: theme.effects.blur,
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm,
          fontWeight: theme.typography.fontWeight.bold,
          minWidth: '140px',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}
        onMouseEnter={(e) => {
          if (isEnabled) {
            e.currentTarget.style.background = 'rgba(51, 154, 240, 1)'
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(51, 154, 240, 0.4)'
          } else {
            e.currentTarget.style.background = 'rgba(51, 154, 240, 0.15)'
            e.currentTarget.style.boxShadow = theme.effects.glow
            e.currentTarget.style.transform = 'translateY(-2px)'
          }
          playSound('hover')
        }}
        onMouseLeave={(e) => {
          if (isEnabled) {
            e.currentTarget.style.background = 'rgba(51, 154, 240, 0.9)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
          } else {
            e.currentTarget.style.background = 'rgba(0, 0, 17, 0.9)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
            e.currentTarget.style.transform = 'translateY(0)'
          }
        }}
        title={isEnabled 
          ? `Hide countries and ${totalPOIs} points of interest` 
          : `Show countries and ${totalPOIs} points of interest`
        }
      >
        <span style={{ fontSize: '16px' }}>
          {isEnabled ? '🌍' : '🗺️'}
        </span>
        <span>
          {isEnabled ? 'Countries' : 'Countries'}
        </span>
      </button>

      {/* Info panel when enabled */}
      {isEnabled && (
        <div style={{
          background: 'rgba(0, 0, 17, 0.95)',
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '8px',
          padding: theme.spacing.md,
          marginTop: theme.spacing.sm,
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
            Countries & POIs
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
            <div>🏛️ {countriesWithPOI.length} countries available</div>
            <div>📍 {totalPOIs} points of interest</div>
            {selectedCountry && (
              <div style={{ marginTop: '4px', color: theme.colors.primary }}>
                🎯 {selectedCountry} selected
              </div>
            )}
            {selectedPOI && (
              <div style={{ marginTop: '2px', color: theme.colors.primary }}>
                ℹ️ POI details shown
              </div>
            )}
          </div>

          {/* Instructions */}
          <div style={{
            color: theme.colors.textSecondary,
            fontSize: theme.typography.fontSize.xs,
            lineHeight: 1.4
          }}>
            <div>🏛️ Click country markers to explore</div>
            <div>📍 Click POI markers for details</div>
            <div>🎯 Camera pans to selected items</div>
          </div>

          {/* Category legend */}
          <div style={{
            marginTop: theme.spacing.sm,
            paddingTop: theme.spacing.sm,
            borderTop: `1px solid ${theme.colors.border}`
          }}>
            <div style={{
              color: theme.colors.textSecondary,
              fontSize: theme.typography.fontSize.xs,
              fontWeight: theme.typography.fontWeight.bold,
              marginBottom: '4px'
            }}>
              POI Categories:
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2px',
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.textSecondary
            }}>
              <div>🏛️ Landmarks</div>
              <div>🏔️ Natural</div>
              <div>🎭 Cultural</div>
              <div>🏺 Historical</div>
              <div>🏢 Modern</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CountryToggle
