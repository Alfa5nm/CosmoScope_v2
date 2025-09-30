import React, { useRef, useEffect, ReactNode } from 'react'
import { useCosmicTransition, CosmicTransitionType } from '../lib/utils'

interface CosmicTransitionProps {
  children: ReactNode
  trigger?: boolean
  type?: CosmicTransitionType
  showOverlay?: boolean
  onComplete?: () => void
  className?: string
}

const CosmicTransition: React.FC<CosmicTransitionProps> = ({
  children,
  trigger = false,
  type = 'cosmic-blink',
  showOverlay = false,
  onComplete,
  className = ''
}) => {
  const elementRef = useRef<HTMLDivElement>(null)
  const { triggerTransition } = useCosmicTransition()
  
  useEffect(() => {
    if (trigger && elementRef.current) {
      triggerTransition(elementRef.current, type, showOverlay)
        .then(() => {
          onComplete?.()
        })
    }
  }, [trigger, type, showOverlay, onComplete, triggerTransition])
  
  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  )
}

export default CosmicTransition
