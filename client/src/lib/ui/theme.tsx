import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Theme {
  colors: {
    background: string
    backgroundSecondary: string
    primary: string
    primaryGlow: string
    secondary: string
    accent: string
    text: string
    textSecondary: string
    border: string
    success: string
    warning: string
    error: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    xxl: string
  }
  typography: {
    fontFamily: string
    fontSize: {
      xs: string
      sm: string
      md: string
      lg: string
      xl: string
      xxl: string
      xxxl: string
    }
    fontWeight: {
      normal: number
      medium: number
      bold: number
    }
  }
  effects: {
    glow: string
    glowSoft: string
    glowStrong: string
    shadow: string
    shadowStrong: string
    blur: string
  }
  animations: {
    fast: string
    normal: string
    slow: string
    verySlow: string
  }
  easing: {
    easeIn: string
    easeOut: string
    easeInOut: string
    bounce: string
    elastic: string
  }
}

const defaultTheme: Theme = {
  colors: {
    background: '#000011',
    backgroundSecondary: '#000022',
    primary: '#00ffff',
    primaryGlow: '#00ffff',
    secondary: '#0088ff',
    accent: '#ff0088',
    text: '#00ffff',
    textSecondary: '#88ffff',
    border: '#00ffff',
    success: '#00ff88',
    warning: '#ffaa00',
    error: '#ff4444'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  typography: {
    fontFamily: "'Courier New', 'Monaco', 'Consolas', monospace",
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '24px',
      xxl: '32px',
      xxxl: '48px'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      bold: 700
    }
  },
  effects: {
    glow: '0 0 10px #00ffff',
    glowSoft: '0 0 5px #00ffff',
    glowStrong: '0 0 20px #00ffff',
    shadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
    shadowStrong: '0 4px 20px rgba(0, 0, 0, 0.8)',
    blur: 'blur(10px)'
  },
  animations: {
    fast: '0.1s',
    normal: '0.3s',
    slow: '0.5s',
    verySlow: '1s'
  },
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  }
}

interface ThemeContextType {
  theme: Theme
  isDark: boolean
  toggleTheme: () => void
  setAccessibilityMode: (mode: 'normal' | 'high-contrast' | 'reduced-motion') => void
  accessibilityMode: 'normal' | 'high-contrast' | 'reduced-motion'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(true)
  const [accessibilityMode, setAccessibilityMode] = useState<'normal' | 'high-contrast' | 'reduced-motion'>('normal')

  useEffect(() => {
    // Check for system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches
    
    if (prefersReducedMotion) {
      setAccessibilityMode('reduced-motion')
    } else if (prefersHighContrast) {
      setAccessibilityMode('high-contrast')
    }

    // Load saved preferences
    const savedTheme = localStorage.getItem('cosmoscope_theme')
    if (savedTheme === 'light') {
      setIsDark(false)
    }

    const savedAccessibility = localStorage.getItem('cosmoscope_accessibility')
    if (savedAccessibility && ['normal', 'high-contrast', 'reduced-motion'].includes(savedAccessibility)) {
      setAccessibilityMode(savedAccessibility as any)
    }
  }, [])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    localStorage.setItem('cosmoscope_theme', newIsDark ? 'dark' : 'light')
  }

  const handleSetAccessibilityMode = (mode: 'normal' | 'high-contrast' | 'reduced-motion') => {
    setAccessibilityMode(mode)
    localStorage.setItem('cosmoscope_accessibility', mode)
  }

  // Apply accessibility mode to theme
  const theme: Theme = {
    ...defaultTheme,
    ...(accessibilityMode === 'high-contrast' && {
      colors: {
        ...defaultTheme.colors,
        primary: '#ffffff',
        text: '#ffffff',
        border: '#ffffff',
        background: '#000000'
      }
    }),
    ...(accessibilityMode === 'reduced-motion' && {
      animations: {
        fast: '0s',
        normal: '0s',
        slow: '0s',
        verySlow: '0s'
      }
    })
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      isDark,
      toggleTheme,
      setAccessibilityMode: handleSetAccessibilityMode,
      accessibilityMode
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
