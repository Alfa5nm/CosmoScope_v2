import React, { useState, useEffect } from 'react'

const App: React.FC = () => {
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      console.log('App: Starting initialization...')
      setStep(1)
      
      // Test basic React functionality
      console.log('App: React is working')
      setStep(2)
      
      // Test localStorage with fallback UUID generator
      const generateUUID = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          return crypto.randomUUID()
        }
        // Fallback for older browsers
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0
          const v = c === 'x' ? r : (r & 0x3 | 0x8)
          return v.toString(16)
        })
      }
      
      const userId = localStorage.getItem('cosmoscope_user_id') || generateUUID()
      localStorage.setItem('cosmoscope_user_id', userId)
      console.log('App: LocalStorage working, userId:', userId)
      setStep(3)
      
      // Test if we can access window
      console.log('App: Window object available:', typeof window)
      setStep(4)
      
      console.log('App: All basic tests passed')
      setStep(5)
      
    } catch (err) {
      console.error('App: Error during initialization:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [])

  if (error) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: '#000011',
        color: '#ff4444',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Courier New, monospace',
        fontSize: '18px',
        textAlign: 'center',
        padding: '20px',
        flexDirection: 'column'
      }}>
        <h1>INITIALIZATION ERROR</h1>
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>
          Reload Page
        </button>
      </div>
    )
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#000011',
      color: '#00ffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Courier New, monospace',
      fontSize: '24px',
      flexDirection: 'column'
    }}>
      <h1 style={{ marginBottom: '20px' }}>COSMOSCOPE DEBUG</h1>
      <p>Initialization Step: {step}/5</p>
      <p style={{ fontSize: '16px', opacity: 0.7, marginTop: '20px' }}>
        If you see this, the basic React app is working.
        <br />
        Check the browser console for detailed logs.
      </p>
      <button 
        onClick={() => {
          console.log('Button clicked - React events working')
          setStep(6)
        }}
        style={{
          background: 'transparent',
          border: '2px solid #00ffff',
          color: '#00ffff',
          padding: '12px 24px',
          cursor: 'pointer',
          fontSize: '16px',
          marginTop: '20px'
        }}
      >
        Test Button
      </button>
    </div>
  )
}

export default App
