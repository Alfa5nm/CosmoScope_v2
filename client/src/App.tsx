import React, { useState, useEffect, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import Landing from './components/Landing'
import PointsDisplay from './components/PointsDisplay'
import { ThemeProvider } from './lib/ui/theme'
import { AudioProvider } from './lib/audio/AudioContext'
import { generateId } from './lib/utils'
import { queryClient } from './lib/queryClient'

// Conditionally import devtools only in development
const ReactQueryDevtools = process.env.NODE_ENV === 'development' 
  ? React.lazy(() => import('@tanstack/react-query-devtools').then(d => ({ default: d.ReactQueryDevtools })))
  : null

// Demo data
const DEMO_LABELS = [
  {
    id: 'demo-apollo-11',
    name: 'Apollo 11 Landing Site',
    description: 'First human landing on the Moon - July 20, 1969',
    type: 'point',
    coordinates: [23.4730, 0.6741],
    planet: 'moon',
    color: '#00ffff',
    createdAt: new Date().toISOString(),
    tags: ['apollo', 'historic', 'moon']
  },
  {
    id: 'demo-olympus-mons',
    name: 'Olympus Mons',
    description: 'Largest volcano in the solar system',
    type: 'point',
    coordinates: [226.2, 18.65],
    planet: 'mars',
    color: '#ff4444',
    createdAt: new Date().toISOString(),
    tags: ['volcano', 'mars', 'geology']
  },
  {
    id: 'demo-amazon',
    name: 'Amazon Rainforest',
    description: 'Largest tropical rainforest on Earth',
    type: 'area',
    coordinates: [[-70, -10], [-60, -10], [-60, -5], [-70, -5], [-70, -10]],
    planet: 'earth',
    color: '#44ff44',
    createdAt: new Date().toISOString(),
    tags: ['forest', 'earth', 'environment']
  }
]

// Lazy load heavy components
const SolarSystem = lazy(() => import('./components/SolarSystem'))
const PlanetView = lazy(() => import('./components/PlanetView'))

// Loading component for lazy-loaded routes
const LoadingSpinner: React.FC = () => (
  <div style={{
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000011',
    color: '#00ffff',
    fontFamily: 'Courier New, monospace',
    flexDirection: 'column',
    gap: '20px'
  }}>
    <div style={{ fontSize: '48px' }}>🌌</div>
    <div style={{ fontSize: '18px', textTransform: 'uppercase', letterSpacing: '2px' }}>
      Loading CosmoScope...
    </div>
    <div style={{ 
      width: '200px', 
      height: '2px', 
      background: 'rgba(0, 255, 255, 0.2)',
      borderRadius: '1px',
      overflow: 'hidden'
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, #00ffff, transparent)',
        animation: 'loading 2s ease-in-out infinite'
      }} />
    </div>
  </div>
)

export type GameState = {
  currentPlanet: string | null
  currentDate: string
  points: number
  objective: string
  userId: string
  checkpoints: any[]
  labels: any[]
}

const App: React.FC = () => {
  // Check if demo mode is enabled via URL parameter
  const isDemoMode = new URLSearchParams(window.location.search).get('demo') === 'true'
  
  const [gameState, setGameState] = useState<GameState>({
    currentPlanet: null,
    currentDate: new Date().toISOString().split('T')[0],
    points: isDemoMode ? 150 : 0,
    objective: isDemoMode ? 'Demo Mode: Explore preloaded data and features' : 'Explore the solar system and discover hidden secrets',
    userId: generateId(),
    checkpoints: isDemoMode ? [
      { id: 'checkpoint-001', name: 'Earth Explorer', completed: true, points: 50 },
      { id: 'checkpoint-002', name: 'Moon Walker', completed: true, points: 75 },
      { id: 'checkpoint-003', name: 'Mars Pioneer', completed: false, points: 100 }
    ] : [],
    labels: isDemoMode ? DEMO_LABELS : []
  })

  useEffect(() => {
    if (isDemoMode) {
      // Demo mode: Use preloaded data
      console.log('🎬 Demo Mode Enabled - Preloaded data ready')
      return
    }
    
    // Load saved game state from localStorage
    const savedState = localStorage.getItem('cosmoscope-game-state')
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        setGameState(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.warn('Failed to load saved game state:', error)
      }
    }
  }, [isDemoMode])

  useEffect(() => {
    // Save game state to localStorage whenever it changes
    localStorage.setItem('cosmoscope-game-state', JSON.stringify(gameState))
  }, [gameState])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AudioProvider>
          <Router>
            <div className="app">
              {/* Demo Mode Indicator */}
              {isDemoMode && (
                <div style={{
                  position: 'fixed',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(0, 255, 0, 0.9)',
                  color: '#000',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  fontFamily: 'Courier New, monospace',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  zIndex: 9999,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  animation: 'pulse 2s ease-in-out infinite'
                }}>
                  🎬 DEMO MODE
                </div>
              )}
              
              <PointsDisplay />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route 
                  path="/solar-system" 
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <SolarSystem gameState={gameState} setGameState={setGameState} />
                    </Suspense>
                  } 
                />
                <Route 
                  path="/planet/:planetId" 
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <PlanetView gameState={gameState} setGameState={setGameState} />
                    </Suspense>
                  } 
                />
              </Routes>
            </div>
          </Router>
        </AudioProvider>
      </ThemeProvider>
      {/* React Query DevTools - only in development */}
      {ReactQueryDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      )}
    </QueryClientProvider>
  )
}

export default App