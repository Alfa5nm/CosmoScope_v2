import React, { useState, useEffect, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Landing from './components/Landing'
import { ThemeProvider } from './lib/ui/theme'
import { AudioProvider } from './lib/audio/AudioContext'
import { generateId } from './lib/utils'
import { queryClient } from './lib/queryClient'

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
  const [gameState, setGameState] = useState<GameState>({
    currentPlanet: null,
    currentDate: new Date().toISOString().split('T')[0],
    points: 0,
    objective: 'Explore the solar system and discover hidden secrets',
    userId: generateId(),
    checkpoints: [],
    labels: []
  })

  useEffect(() => {
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
  }, [])

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
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}

export default App