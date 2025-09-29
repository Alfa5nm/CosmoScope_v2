import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './components/Landing'
import SolarSystem from './components/SolarSystem'
import PlanetView from './components/PlanetView'
import { ThemeProvider } from './lib/ui/theme'
import { AudioProvider } from './lib/audio/AudioContext'
import { generateId } from './lib/utils'

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
    objective: "Begin your journey as a time-traveling astronaut",
    userId: '',
    checkpoints: [],
    labels: []
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize user ID
    const userId = localStorage.getItem('cosmoscope_user_id') || generateId()
    localStorage.setItem('cosmoscope_user_id', userId)
    
    setGameState(prev => ({ ...prev, userId }))
    
    // Load saved game state
    const savedState = localStorage.getItem('cosmoscope_game_state')
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        setGameState(prev => ({ ...prev, ...parsed, userId }))
      } catch (e) {
        console.warn('Failed to load saved game state:', e)
      }
    }
    
    setIsLoading(false)
  }, [])

  // Auto-save game state
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('cosmoscope_game_state', JSON.stringify(gameState))
    }
  }, [gameState, isLoading])

  if (isLoading) {
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        background: '#000011', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#00ffff',
        fontSize: '24px'
      }}>
        Initializing Cosmoscope...
      </div>
    )
  }

  return (
    <ThemeProvider>
      <AudioProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route 
              path="/solar-system" 
              element={
                <SolarSystem 
                  gameState={gameState} 
                  setGameState={setGameState} 
                />
              } 
            />
            <Route 
              path="/planet/:planetId" 
              element={
                <PlanetView 
                  gameState={gameState} 
                  setGameState={setGameState} 
                />
              } 
            />
          </Routes>
        </Router>
      </AudioProvider>
    </ThemeProvider>
  )
}

export default App
