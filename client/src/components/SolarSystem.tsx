import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../lib/ui/theme'
import { useAudio } from '../lib/audio/AudioContext'
import { loadThree, markLibraryLoaded } from '../lib/dynamicImports'
import { useCosmicTransition } from '../lib/utils'
import { usePoints } from '../lib/hooks/usePoints'
import { useObjectives } from '../lib/hooks/useObjectives'
import { useSettings } from '../lib/hooks/useSettings'
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
  const { triggerTransition } = useCosmicTransition()
  const { awardPoints } = usePoints()
  const { updateProgress, visitPlanet, completeObjective } = useObjectives()
  const { visual, performance } = useSettings()
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<any>(null) // Will be SolarSystemScene after loading
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null)
  const [showPlanetHUD, setShowPlanetHUD] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [three, setThree] = useState<any>(null)
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Load Three.js dynamically
  useEffect(() => {
    let isMounted = true

    const loadLibrary = async () => {
      try {
        setIsLoadingLibrary(true)
        const threeModule = await loadThree()
        
        if (isMounted) {
          setThree(threeModule)
          markLibraryLoaded('three')
        }
      } catch (error) {
        console.error('Failed to load Three.js:', error)
        if (isMounted) {
          setToast({ message: 'Failed to load 3D library. Please refresh the page.', type: 'error' })
        }
      } finally {
        if (isMounted) {
          setIsLoadingLibrary(false)
        }
      }
    }

    loadLibrary()

    return () => {
      isMounted = false
    }
  }, [])

  // Apply settings when they change
  useEffect(() => {
    if (sceneRef.current && sceneRef.current.applySettings) {
      sceneRef.current.applySettings({
        visual,
        performance
      })
    }
  }, [visual, performance])

  useEffect(() => {
    if (!containerRef.current || !three || isLoadingLibrary) return

    // Initialize Three.js scene
    if (containerRef.current) {
      import('../lib/three/solarScene').then(({ SolarSystemScene }) => {
        sceneRef.current = new SolarSystemScene(containerRef.current!)
        
        // Apply visual and performance settings
        if (sceneRef.current && sceneRef.current.applySettings) {
          sceneRef.current.applySettings({
            visual,
            performance
          })
        }
        
        // Start ambient music only after scene is loaded
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
      })
    }

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
  }, [playSound, three, isLoadingLibrary])

  const handlePlanetClick = async (planetName: string) => {
    if (isTransitioning) return
    
    // Define accessible planets that have cosmic transitions
    const accessiblePlanets = ['earth', 'mars', 'moon']
    const isAccessible = accessiblePlanets.includes(planetName.toLowerCase())
    
    setIsTransitioning(true)
    playSound('click')
    
    // Update objective progress for all planet clicks (accessible and non-accessible)
    updateProgress('tutorial-002', 1) // First planet visit
    visitPlanet(planetName) // Track unique planet visits for exploration objectives
    
    if (isAccessible) {
      // Award points for deep exploration
      awardPoints('PLANET_EXPLORE')
      
      // Show initial message for accessible planets
      setToast({ message: `🎯 FOCUSING ON ${planetName.toUpperCase()}...`, type: 'info' })
      
      // First, focus camera on planet and wait for pan to complete
      if (sceneRef.current) {
        sceneRef.current.focusOnPlanet(planetName)
        
        // Wait for camera pan to complete (adjust timing based on your camera animation)
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
      
      // Now show the cosmic transition message
      setToast({ message: `🌌 EMBIGGENING YOUR EYES TO ${planetName.toUpperCase()}...`, type: 'info' })
      
      // Trigger cosmic transition on the entire container
      if (containerRef.current) {
        await triggerTransition(containerRef.current, 'embiggen-eyes', true)
      }
      
      // Navigate to planet view after transition
      setTimeout(() => {
        navigate(`/planet/${planetName}`)
      }, 1200) // Match the embiggen-eyes animation duration
    } else {
      // For non-accessible planets, just show a simple message and focus camera
      setToast({ message: `🔍 OBSERVING ${planetName.toUpperCase()}...`, type: 'info' })
      
      // Focus camera on planet without cosmic transition
      if (sceneRef.current) {
        sceneRef.current.focusOnPlanet(planetName)
      }
      
      // Reset transitioning state after a short delay
      setTimeout(() => {
        setIsTransitioning(false)
      }, 1000)
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
      // Award points for planet click
      awardPoints('PLANET_CLICK', e.clientX, e.clientY)
      
      // Update tutorial objective for first interaction
      updateProgress('tutorial-001', 1)
      
      // Track planet visit for exploration objectives
      visitPlanet(planet)
      
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
      {/* Loading state */}
      {isLoadingLibrary && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#00ffff',
          textAlign: 'center',
          fontFamily: 'Courier New, monospace',
          zIndex: 100
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🌌</div>
          <div style={{ fontSize: '18px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Loading Solar System...
          </div>
          <div style={{ 
            width: '200px', 
            height: '2px', 
            background: 'rgba(0, 255, 255, 0.2)',
            borderRadius: '1px',
            overflow: 'hidden',
            margin: '20px auto 0'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, #00ffff, transparent)',
              animation: 'loading 2s ease-in-out infinite'
            }} />
          </div>
        </div>
      )}

      {/* HUD Elements */}
      <ObjectivesHUD />

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
