import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles.css'

// Remove loading screen once React loads
const loadingElement = document.querySelector('.loading')
if (loadingElement) {
  loadingElement.remove()
}

// Error boundary to catch crashes
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error?: Error}> {
  constructor(props: {children: React.ReactNode}) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
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
          <h1 style={{color: '#ff4444', marginBottom: '20px'}}>COSMOSCOPE ERROR</h1>
          <p style={{marginBottom: '20px'}}>The application crashed. Check the browser console for details.</p>
          <div style={{
            background: '#000022',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #ff4444',
            marginBottom: '20px',
            maxWidth: '600px',
            wordBreak: 'break-word'
          }}>
            <strong>Error:</strong> {this.state.error?.message || 'Unknown error'}
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: 'transparent',
              border: '2px solid #ff4444',
              color: '#ff4444',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '16px',
              borderRadius: '4px'
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
