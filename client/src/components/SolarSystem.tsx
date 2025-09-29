import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../lib/ui/theme'
import { useAudio } from '../lib/audio/AudioContext'
import { SolarSystemScene } from '../lib/three/solarScene'
import { GameState } from '../App'
import RightDrawer from './RightDrawer'
import PlanetHUD from './PlanetHUD'
import ObjectivesHUD from './ObjectivesHUD'
import Toast from './Toast'

interface SolarSystemProps {
  gameState: GameState
  setGameState: React.Dispatch<React.SetStateAction<GameState>>
}

const SolarSystem: React.FC<SolarSystemProps> = ({ gameState, setGameState }) => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const { playSound } = useAudio()
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<SolarSystemScene | null>(null)
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null)
  const [showPlanetHUD, setShowPlanetHUD] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize Three.js scene
    sceneRef.current = new SolarSystemScene(containerRef.current)

    // Start ambient music
    playSound('ambient')
    
    // Start continuous ambient music
    const startAmbientMusic = () => {
      const audio = new Audio('/src/assets/audio/ambient.mp3')
      audio.loop = true
      audio.volume = 0.3
      audio.play().catch(console.warn)
      
      // Store reference for cleanup
      ;(sceneRef.current as any).ambientAudio = audio
    }
    
    // Start music after a short delay to ensure user interaction
    setTimeout(startAmbientMusic, 1000)

    // Handle window resize
    const handleResize = () => {
      if (sceneRef.current && containerRef.current) {
        sceneRef.current.resize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        )
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (sceneRef.current) {
        // Stop ambient music
        const ambientAudio = (sceneRef.current as any).ambientAudio
        if (ambientAudio) {
          ambientAudio.pause()
          ambientAudio.currentTime = 0
        }
        sceneRef.current.dispose()
      }
    }
  }, [playSound])

  const handlePlanetClick = (planetName: string) => {
    playSound('click')
    setSelectedPlanet(planetName)
    setShowPlanetHUD(true)
    
    // Focus camera on planet
    if (sceneRef.current) {
      sceneRef.current.focusOnPlanet(planetName)
    }
  }

  const handleTravelToPlanet = (planetName: string) => {
    playSound('click')
    
    // Update game state
    setGameState(prev => ({
      ...prev,
      currentPlanet: planetName,
      points: prev.points + 10
    }))

    // Show transition effect
    setToast({ message: `Traveling to ${planetName}...`, type: 'info' })
    
    // Navigate to planet view after a short delay
    setTimeout(() => {
      navigate(`/planet/${planetName}`)
    }, 1000)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sceneRef.current) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const planet = sceneRef.current.getPlanetAtPosition(x, y)
    if (planet && planet !== selectedPlanet) {
      playSound('hover')
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!sceneRef.current) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const planet = sceneRef.current.getPlanetAtPosition(x, y)
    if (planet) {
      handlePlanetClick(planet)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowPlanetHUD(false)
      setSelectedPlanet(null)
    }
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        background: theme.colors.background,
        overflow: 'hidden'
      }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* HUD Elements */}
      <ObjectivesHUD 
        objective={gameState.objective}
        points={gameState.points}
      />

      {/* Right Drawer */}
      <RightDrawer
        onPlanetSelect={handlePlanetClick}
        onModeChange={(mode) => {
          playSound('click')
          setToast({ message: `Switched to ${mode} mode`, type: 'info' })
        }}
      />

      {/* Planet HUD */}
      {showPlanetHUD && selectedPlanet && (
        <PlanetHUD
          planetName={selectedPlanet}
          onTravel={() => handleTravelToPlanet(selectedPlanet)}
          onClose={() => {
            setShowPlanetHUD(false)
            setSelectedPlanet(null)
            playSound('click')
          }}
        />
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: theme.spacing.lg,
        left: '50%',
        transform: 'translateX(-50%)',
        color: theme.colors.textSecondary,
        fontSize: theme.typography.fontSize.sm,
        textAlign: 'center',
        opacity: 0.7,
        zIndex: 5
      }}>
        Click on planets to explore • WASD to move • Mouse to orbit • Q/E to move up/down • +/- to zoom • ESC to close panels
      </div>
    </div>
  )
}

export default SolarSystem
