import React, { createContext, useContext, useState, useEffect, useRef } from 'react'

interface AudioContextType {
  isEnabled: boolean
  isPlaying: boolean
  volume: number
  toggleAudio: () => void
  setVolume: (volume: number) => void
  playSound: (sound: 'click' | 'hover' | 'ambient') => void
  stopAmbient: () => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(0.5)
  
  const ambientRef = useRef<HTMLAudioElement | null>(null)
  const clickRef = useRef<HTMLAudioElement | null>(null)
  const hoverRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Load saved preferences
    const savedEnabled = localStorage.getItem('cosmoscope_audio_enabled')
    const savedVolume = localStorage.getItem('cosmoscope_audio_volume')
    
    if (savedEnabled === 'true') {
      setIsEnabled(true)
    }
    
    if (savedVolume) {
      const vol = parseFloat(savedVolume)
      if (!isNaN(vol) && vol >= 0 && vol <= 1) {
        setVolumeState(vol)
      }
    }

    // Create audio elements with proper paths
    ambientRef.current = new Audio('/src/assets/audio/ambient.mp3')
    clickRef.current = new Audio('/src/assets/audio/click.mp3')
    hoverRef.current = new Audio('/src/assets/audio/hover.mp3')
    
    // Set preload to auto to ensure audio loads
    if (ambientRef.current) ambientRef.current.preload = 'auto'
    if (clickRef.current) clickRef.current.preload = 'auto'
    if (hoverRef.current) hoverRef.current.preload = 'auto'

    // Configure audio elements
    if (ambientRef.current) {
      ambientRef.current.loop = true
      ambientRef.current.volume = volume
    }
    
    if (clickRef.current) {
      clickRef.current.volume = volume * 0.8
    }
    
    if (hoverRef.current) {
      hoverRef.current.volume = volume * 0.6
    }

    // Handle audio context suspension (browser autoplay policy)
    const handleUserInteraction = () => {
      if (!isEnabled && isPlaying) {
        setIsEnabled(true)
        setIsPlaying(true)
        if (ambientRef.current) {
          ambientRef.current.play().catch(console.warn)
        }
      }
    }

    document.addEventListener('click', handleUserInteraction, { once: true })
    document.addEventListener('keydown', handleUserInteraction, { once: true })

    return () => {
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
    }
  }, [])

  useEffect(() => {
    // Update volume on all audio elements
    if (ambientRef.current) {
      ambientRef.current.volume = volume
    }
    if (clickRef.current) {
      clickRef.current.volume = volume * 0.8
    }
    if (hoverRef.current) {
      hoverRef.current.volume = volume * 0.6
    }
    
    localStorage.setItem('cosmoscope_audio_volume', volume.toString())
  }, [volume])

  useEffect(() => {
    // Save enabled state
    localStorage.setItem('cosmoscope_audio_enabled', isEnabled.toString())
  }, [isEnabled])

  const toggleAudio = () => {
    const newEnabled = !isEnabled
    setIsEnabled(newEnabled)
    
    if (newEnabled) {
      setIsPlaying(true)
      if (ambientRef.current) {
        ambientRef.current.play().catch(console.warn)
      }
    } else {
      setIsPlaying(false)
      if (ambientRef.current) {
        ambientRef.current.pause()
        ambientRef.current.currentTime = 0
      }
    }
  }

  const setVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    setVolumeState(clampedVolume)
  }

  const playSound = (sound: 'click' | 'hover' | 'ambient') => {
    if (!isEnabled) return

    // Create Web Audio API context for generated sounds
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    switch (sound) {
      case 'click':
        playTone(audioContext, 800, 0.1, 'sine')
        break
      case 'hover':
        playTone(audioContext, 600, 0.05, 'sine')
        break
      case 'ambient':
        // For ambient, try to play the audio file first, fallback to generated tone
        if (ambientRef.current) {
          ambientRef.current.currentTime = 0
          ambientRef.current.play().catch(() => {
            // Fallback to generated ambient tone
            playTone(audioContext, 200, 2, 'sine')
          })
        } else {
          playTone(audioContext, 200, 2, 'sine')
        }
        break
    }
  }

  const playTone = (audioContext: AudioContext, frequency: number, duration: number, type: OscillatorType) => {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
    oscillator.type = type
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume * 0.3, audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration)
  }

  const stopAmbient = () => {
    if (ambientRef.current) {
      ambientRef.current.pause()
      ambientRef.current.currentTime = 0
    }
    setIsPlaying(false)
  }

  return (
    <AudioContext.Provider value={{
      isEnabled,
      isPlaying,
      volume,
      toggleAudio,
      setVolume,
      playSound,
      stopAmbient
    }}>
      {children}
    </AudioContext.Provider>
  )
}

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}
