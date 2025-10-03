import React, { useState } from 'react'
import { useCountryStore } from '../../store/countryStore'
import { useTheme } from '../../lib/ui/theme'
import { useAudio } from '../../lib/audio/AudioContext'

interface POICardProps {
  poiId: string | null
  onClose: () => void
}

const POICard: React.FC<POICardProps> = ({ poiId, onClose }) => {
  const { theme } = useTheme()
  const { playSound } = useAudio()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  
  const { getPOIById, getCountryByCode } = useCountryStore()
  
  if (!poiId) return null
  
  const poi = getPOIById(poiId)
  if (!poi) return null
  
  const country = getCountryByCode(poi.countryCode)
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'landmark': return '🏛️'
      case 'natural': return '🏔️'
      case 'cultural': return '🎭'
      case 'historical': return '🏺'
      case 'modern': return '🏢'
      default: return '📍'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'landmark': return '#ff6b6b'
      case 'natural': return '#51cf66'
      case 'cultural': return '#845ef7'
      case 'historical': return '#fd7e14'
      case 'modern': return '#339af0'
      default: return '#868e96'
    }
  }

  const formatCoordinates = (coords: [number, number]) => {
    const [lng, lat] = coords
    const latDir = lat >= 0 ? 'N' : 'S'
    const lngDir = lng >= 0 ? 'E' : 'W'
    return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`
  }

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: theme.colors.backgroundSecondary,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: '12px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
      maxWidth: '400px',
      width: '90vw',
      maxHeight: '80vh',
      overflow: 'hidden',
      zIndex: 1000,
      backdropFilter: theme.effects.blur
    }}>
      {/* Header */}
      <div style={{
        position: 'relative',
        height: '200px',
        overflow: 'hidden'
      }}>
        {/* Image */}
        {poi.imageUrl && !imageError && (
          <img
            src={poi.imageUrl}
            alt={poi.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
        
        {/* Fallback gradient if no image */}
        {(!poi.imageUrl || imageError) && (
          <div style={{
            width: '100%',
            height: '100%',
            background: `linear-gradient(135deg, ${getCategoryColor(poi.category)}40, ${getCategoryColor(poi.category)}80)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px'
          }}>
            {getCategoryIcon(poi.category)}
          </div>
        )}
        
        {/* Overlay gradient */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60%',
          background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))'
        }} />
        
        {/* Close button */}
        <button
          onClick={() => {
            onClose()
            playSound('click')
          }}
          style={{
            position: 'absolute',
            top: theme.spacing.sm,
            right: theme.spacing.sm,
            background: 'rgba(0, 0, 0, 0.5)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)'
            playSound('hover')
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'
          }}
        >
          ✕
        </button>
        
        {/* Category badge */}
        <div style={{
          position: 'absolute',
          top: theme.spacing.sm,
          left: theme.spacing.sm,
          background: getCategoryColor(poi.category),
          color: 'white',
          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
          borderRadius: '16px',
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.bold,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {getCategoryIcon(poi.category)} {poi.category}
        </div>
        
        {/* Title overlay */}
        <div style={{
          position: 'absolute',
          bottom: theme.spacing.md,
          left: theme.spacing.md,
          right: theme.spacing.md
        }}>
          <h2 style={{
            color: 'white',
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            margin: 0,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)'
          }}>
            {poi.name}
          </h2>
          {country && (
            <div style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: theme.typography.fontSize.sm,
              marginTop: theme.spacing.xs,
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)'
            }}>
              📍 {country.name}
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div style={{
        padding: theme.spacing.lg
      }}>
        {/* Description */}
        <p style={{
          color: theme.colors.text,
          fontSize: theme.typography.fontSize.md,
          lineHeight: 1.6,
          margin: `0 0 ${theme.spacing.md} 0`
        }}>
          {poi.description}
        </p>
        
        {/* Details grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.md
        }}>
          {poi.established && (
            <div>
              <div style={{
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.xs,
                fontWeight: theme.typography.fontWeight.bold,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Established
              </div>
              <div style={{
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.sm
              }}>
                {poi.established}
              </div>
            </div>
          )}
          
          {poi.visitorsPerYear && (
            <div>
              <div style={{
                color: theme.colors.textSecondary,
                fontSize: theme.typography.fontSize.xs,
                fontWeight: theme.typography.fontWeight.bold,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Annual Visitors
              </div>
              <div style={{
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.sm
              }}>
                {poi.visitorsPerYear.toLocaleString()}
              </div>
            </div>
          )}
        </div>
        
        {/* Rating */}
        {poi.rating && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.md
          }}>
            <div style={{
              color: theme.colors.textSecondary,
              fontSize: theme.typography.fontSize.xs,
              fontWeight: theme.typography.fontWeight.bold,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Rating:
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}>
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  style={{
                    color: i < Math.floor(poi.rating!) ? '#ffd43b' : '#495057',
                    fontSize: '16px'
                  }}
                >
                  ⭐
                </span>
              ))}
              <span style={{
                color: theme.colors.text,
                fontSize: theme.typography.fontSize.sm,
                marginLeft: theme.spacing.xs
              }}>
                {poi.rating.toFixed(1)}
              </span>
            </div>
          </div>
        )}
        
        {/* Coordinates */}
        <div style={{
          color: theme.colors.textSecondary,
          fontSize: theme.typography.fontSize.xs,
          padding: theme.spacing.sm,
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '4px',
          fontFamily: 'monospace'
        }}>
          📍 {formatCoordinates(poi.coordinates)}
        </div>
        
        {/* Website link */}
        {poi.website && (
          <div style={{
            marginTop: theme.spacing.md
          }}>
            <a
              href={poi.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: theme.colors.primary,
                fontSize: theme.typography.fontSize.sm,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: theme.spacing.xs
              }}
              onMouseEnter={() => playSound('hover')}
            >
              🌐 Visit Website
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default POICard
