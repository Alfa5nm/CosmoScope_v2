import React, { useEffect } from 'react'
import { useTheme } from '../lib/ui/theme'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'info'
  onClose: () => void
  duration?: number
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  const { theme } = useTheme()

  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const getToastStyle = () => {
    const baseStyle = {
      position: 'fixed' as const,
      top: theme.spacing.lg,
      left: '50%',
      transform: 'translateX(-50%)',
      background: theme.colors.backgroundSecondary,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: '8px',
      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
      zIndex: 50,
      backdropFilter: theme.effects.blur,
      boxShadow: theme.effects.shadowStrong,
      maxWidth: '400px',
      textAlign: 'center' as const,
      animation: 'slideInDown 0.3s ease-out'
    }

    switch (type) {
      case 'success':
        return {
          ...baseStyle,
          borderColor: theme.colors.success,
          boxShadow: `0 0 20px ${theme.colors.success}40`
        }
      case 'error':
        return {
          ...baseStyle,
          borderColor: theme.colors.error,
          boxShadow: `0 0 20px ${theme.colors.error}40`
        }
      case 'info':
        return {
          ...baseStyle,
          borderColor: theme.colors.primary,
          boxShadow: `0 0 20px ${theme.colors.primary}40`
        }
      default:
        return baseStyle
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✗'
      case 'info':
        return 'ℹ'
      default:
        return 'ℹ'
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return theme.colors.success
      case 'error':
        return theme.colors.error
      case 'info':
        return theme.colors.primary
      default:
        return theme.colors.text
    }
  }

  return (
    <div style={getToastStyle()}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm
      }}>
        <div style={{
          fontSize: theme.typography.fontSize.lg,
          color: getTextColor(),
          fontWeight: theme.typography.fontWeight.bold
        }}>
          {getIcon()}
        </div>
        <div style={{
          color: theme.colors.text,
          fontSize: theme.typography.fontSize.md,
          fontWeight: theme.typography.fontWeight.medium
        }}>
          {message}
        </div>
      </div>
    </div>
  )
}

export default Toast
