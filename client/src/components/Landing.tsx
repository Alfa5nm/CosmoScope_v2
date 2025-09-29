import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../lib/ui/theme'
import { useAudio } from '../lib/audio/AudioContext'

const Landing: React.FC = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { playSound } = useAudio()
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; speed: number }>>([])
  const [hubblePosition, setHubblePosition] = useState(-100)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Create particle system
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speed: Math.random() * 2 + 1
    }))
    setParticles(newParticles)

    // Animate particles
    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        y: particle.y + particle.speed,
        x: particle.x + Math.sin(particle.y * 0.01) * 0.5
      })).filter(particle => particle.y < window.innerHeight + 10))
    }

    const interval = setInterval(animateParticles, 50)

    // Animate Hubble
    const animateHubble = () => {
      setHubblePosition(prev => {
        if (prev > window.innerWidth + 100) return -100
        return prev + 0.5
      })
    }

    const hubbleInterval = setInterval(animateHubble, 16)

    // Create starfield canvas
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const drawStars = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          
          // Draw stars - Fixed negative radius issue
          for (let i = 0; i < 200; i++) {
            const x = (i * 137.5) % canvas.width
            const y = (i * 137.5) % canvas.height
            const size = Math.max(0.5, Math.abs(Math.sin(i)) * 2 + 1)
            
            ctx.fillStyle = `rgba(0, 255, 255, ${Math.random() * 0.8 + 0.2})`
            ctx.beginPath()
            ctx.arc(x, y, size, 0, Math.PI * 2)
            ctx.fill()
          }
        }
        
        drawStars()
        const starInterval = setInterval(drawStars, 100)
        
        return () => {
          clearInterval(interval)
          clearInterval(hubbleInterval)
          clearInterval(starInterval)
        }
      }
    }

    return () => {
      clearInterval(interval)
      clearInterval(hubbleInterval)
    }
  }, [])

  const handleExploreClick = () => {
    playSound('click')
    navigate('/solar-system')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleExploreClick()
    }
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #000011 0%, #000033 100%)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Starfield Canvas */}
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1
        }}
      />

      {/* Particle System */}
      {particles.map(particle => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            width: '2px',
            height: '2px',
            background: '#00ffff',
            borderRadius: '50%',
            opacity: 0.6,
            zIndex: 2
          }}
        />
      ))}

      {/* Hubble Telescope */}
      <div
        style={{
          position: 'absolute',
          left: hubblePosition,
          top: '20%',
          width: '60px',
          height: '30px',
          background: 'linear-gradient(45deg, #333, #666)',
          borderRadius: '5px',
          zIndex: 3,
          boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
        }}
      />

      {/* Main Content */}
      <div style={{ zIndex: 10, textAlign: 'center' }}>
        {/* Title */}
        <h1
          style={{
            fontSize: theme.typography.fontSize.xxxl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.primary,
            textShadow: theme.effects.glowStrong,
            marginBottom: theme.spacing.xl,
            letterSpacing: '4px',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textShadow = '0 0 30px #00ffff, 0 0 60px #00ffff'
            playSound('hover')
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textShadow = theme.effects.glowStrong
          }}
        >
          COSMOSCOPE
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: theme.typography.fontSize.lg,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.xxl,
            opacity: 0.8
          }}
        >
          Explore the universe through time and space
        </p>

        {/* Explore Button */}
        <button
          onClick={handleExploreClick}
          onKeyDown={handleKeyPress}
          style={{
            background: 'transparent',
            border: `2px solid ${theme.colors.primary}`,
            color: theme.colors.primary,
            padding: `${theme.spacing.lg} ${theme.spacing.xxl}`,
            fontSize: theme.typography.fontSize.xl,
            fontFamily: theme.typography.fontFamily,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: theme.effects.glow,
            borderRadius: '4px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)'
            e.currentTarget.style.boxShadow = theme.effects.glowStrong
            e.currentTarget.style.transform = 'translateY(-2px)'
            playSound('hover')
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.boxShadow = theme.effects.glow
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          EXPLORE
        </button>
      </div>

      {/* Audio Toggle */}
      <AudioToggle />

      {/* Accessibility Options */}
      <AccessibilityOptions />
    </div>
  )
}

const AudioToggle: React.FC = () => {
  const { isEnabled, toggleAudio, playSound } = useAudio()
  const { theme } = useTheme()

  return (
    <button
      onClick={() => {
        toggleAudio()
        playSound('click')
      }}
      style={{
        position: 'absolute',
        bottom: theme.spacing.lg,
        right: theme.spacing.lg,
        background: 'transparent',
        border: `1px solid ${theme.colors.border}`,
        color: theme.colors.text,
        padding: theme.spacing.sm,
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: theme.typography.fontSize.sm,
        zIndex: 10
      }}
      onMouseEnter={() => playSound('hover')}
    >
      {isEnabled ? '🔊 Audio On' : '🔇 Audio Off'}
    </button>
  )
}

const AccessibilityOptions: React.FC = () => {
  const { theme, setAccessibilityMode, accessibilityMode } = useTheme()
  const { playSound } = useAudio()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div style={{
      position: 'absolute',
      bottom: theme.spacing.lg,
      left: theme.spacing.lg,
      zIndex: 10
    }}>
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
          fontSize: theme.typography.fontSize.sm
        }}
        onMouseEnter={() => playSound('hover')}
      >
        ♿ Accessibility
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: 0,
          background: theme.colors.backgroundSecondary,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '4px',
          padding: theme.spacing.sm,
          marginBottom: theme.spacing.sm,
          minWidth: '200px'
        }}>
          <button
            onClick={() => {
              setAccessibilityMode('normal')
              setIsOpen(false)
              playSound('click')
            }}
            style={{
              display: 'block',
              width: '100%',
              background: accessibilityMode === 'normal' ? theme.colors.primary : 'transparent',
              color: accessibilityMode === 'normal' ? theme.colors.background : theme.colors.text,
              border: 'none',
              padding: theme.spacing.sm,
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            Normal
          </button>
          <button
            onClick={() => {
              setAccessibilityMode('high-contrast')
              setIsOpen(false)
              playSound('click')
            }}
            style={{
              display: 'block',
              width: '100%',
              background: accessibilityMode === 'high-contrast' ? theme.colors.primary : 'transparent',
              color: accessibilityMode === 'high-contrast' ? theme.colors.background : theme.colors.text,
              border: 'none',
              padding: theme.spacing.sm,
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            High Contrast
          </button>
          <button
            onClick={() => {
              setAccessibilityMode('reduced-motion')
              setIsOpen(false)
              playSound('click')
            }}
            style={{
              display: 'block',
              width: '100%',
              background: accessibilityMode === 'reduced-motion' ? theme.colors.primary : 'transparent',
              color: accessibilityMode === 'reduced-motion' ? theme.colors.background : theme.colors.text,
              border: 'none',
              padding: theme.spacing.sm,
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            Reduced Motion
          </button>
        </div>
      )}
    </div>
  )
}

export default Landing
