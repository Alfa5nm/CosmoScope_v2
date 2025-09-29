import React from 'react'

const App: React.FC = () => {
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
      fontSize: '24px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ margin: 0, marginBottom: '20px' }}>COSMOSCOPE</h1>
        <p style={{ margin: 0, opacity: 0.8 }}>Loading the universe...</p>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: 0.6 }}>
          If you see this, the app is working!
        </p>
      </div>
    </div>
  )
}

export default App
