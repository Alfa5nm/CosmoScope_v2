import React, { useState, useEffect } from 'react';
import { usePointsStore, PointsEvent } from '../store/pointsStore';
import { usePoints } from '../lib/hooks/usePoints';
import { useTheme } from '../lib/ui/theme';
import { useAudio } from '../lib/audio/AudioContext';
import Shop from './Shop';

const PointsDisplay: React.FC = () => {
  const { totalPoints, recentEvents } = usePointsStore();
  const { totalPoints: hookPoints } = usePoints();
  const { theme } = useTheme();
  const { playSound } = useAudio();
  const [isVisible, setIsVisible] = useState(true);
  const [displayPoints, setDisplayPoints] = useState(0);
  const [showShop, setShowShop] = useState(false);

  // Animate points counter
  useEffect(() => {
    const targetPoints = hookPoints || totalPoints || 0;
    const increment = Math.ceil((targetPoints - displayPoints) / 20);
    
    if (displayPoints < targetPoints) {
      const timer = setTimeout(() => {
        setDisplayPoints(prev => Math.min(prev + increment, targetPoints));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [hookPoints, totalPoints, displayPoints]);

  // Show/hide based on recent activity
  useEffect(() => {
    if (recentEvents.length > 0) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [recentEvents.length]);

  // Show visual feedback when points change
  useEffect(() => {
    if (hookPoints !== totalPoints) {
      setIsVisible(true);
      // Flash effect when points change
      const flashElement = document.querySelector('.points-display');
      if (flashElement) {
        flashElement.style.animation = 'pointsFlash 0.5s ease-in-out';
        setTimeout(() => {
          if (flashElement) {
            flashElement.style.animation = '';
          }
        }, 500);
      }
    }
  }, [hookPoints, totalPoints]);

  return (
    <>
      {/* Main Points Display */}
      <div 
        className="points-display"
        style={{
          position: 'fixed',
          top: '120px',
          right: theme.spacing.lg,
          zIndex: 1000,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'all 0.3s ease-out'
        }}
      >
        <div
          style={{
            background: 'rgba(0, 0, 17, 0.8)',
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '8px',
            padding: theme.spacing.md,
            backdropFilter: theme.effects.blur,
            boxShadow: theme.effects.glow,
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm,
            minWidth: '200px',
            transition: 'all 0.3s ease',
            opacity: 0.7
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.background = 'rgba(0, 0, 17, 0.9)'
            e.currentTarget.style.boxShadow = theme.effects.glow
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.7'
            e.currentTarget.style.background = 'rgba(0, 0, 17, 0.8)'
            e.currentTarget.style.boxShadow = theme.effects.glow
          }}
        >
          {/* Points Icon */}
          <div
            style={{
              fontSize: theme.typography.fontSize.xxl,
              color: theme.colors.primary,
              animation: 'pointsGlow 2s ease-in-out infinite',
              textShadow: theme.effects.glow
            }}
          >
            ⭐
          </div>
          
          {/* Points Counter */}
          <div
            style={{
              color: theme.colors.primary,
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.bold,
              fontFamily: theme.typography.fontFamily,
              textShadow: theme.effects.glow
            }}
          >
            {displayPoints.toLocaleString()}
          </div>
          
          {/* Points Label */}
          <div
            style={{
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.bold,
              fontFamily: theme.typography.fontFamily,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              opacity: 0.8
            }}
          >
            POINTS
          </div>

          {/* Shop Button */}
          <button
            onClick={() => {
              setShowShop(true);
              playSound('click');
            }}
            style={{
              background: 'rgba(51, 154, 240, 0.2)',
              border: `1px solid ${theme.colors.primary}`,
              color: theme.colors.primary,
              padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: theme.typography.fontSize.xs,
              fontWeight: theme.typography.fontWeight.bold,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.xs,
              marginLeft: theme.spacing.sm
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(51, 154, 240, 0.3)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              playSound('hover');
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(51, 154, 240, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            title="Open Shop"
          >
            🛒 Shop
          </button>
        </div>
      </div>

      {/* Floating Points Events */}
      {recentEvents.map((event) => (
        <FloatingPointsEvent key={event.id} event={event} />
      ))}

      {/* Shop Modal */}
      <Shop 
        isOpen={showShop} 
        onClose={() => setShowShop(false)} 
      />
    </>
  );
};

// Floating points event component
const FloatingPointsEvent: React.FC<{ event: PointsEvent }> = ({ event }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const getPointsColor = (points: number) => {
    if (points >= 50) return '#ffd700'; // Gold for high points
    if (points >= 20) return '#00ff00'; // Green for medium points
    if (points >= 0) return '#00ffff'; // Cyan for normal points
    return '#ff4444'; // Red for negative points
  };

  const getPointsIcon = (points: number) => {
    if (points >= 50) return '🌟';
    if (points >= 20) return '✨';
    if (points >= 0) return '⭐';
    return '💥';
  };

  return (
    <div
      className="floating-points-event"
      style={{
        position: 'fixed',
        left: event.x ? `${event.x}px` : '50%',
        top: event.y ? `${event.y}px` : '50%',
        zIndex: 1001,
        pointerEvents: 'none',
        opacity: isVisible ? 1 : 0,
        transform: isVisible 
          ? 'translate(-50%, -50%) scale(1)' 
          : 'translate(-50%, -50%) scale(0.5) translateY(-50px)',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: 'pointsFloat 3s ease-out forwards'
      }}
    >
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.9)',
          border: `2px solid ${getPointsColor(event.points)}`,
          borderRadius: '25px',
          padding: '8px 16px',
          backdropFilter: 'blur(10px)',
          boxShadow: `0 0 20px ${getPointsColor(event.points)}40`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          whiteSpace: 'nowrap'
        }}
      >
        {/* Points Icon */}
        <span
          style={{
            fontSize: '18px',
            animation: 'pointsBounce 0.6s ease-out'
          }}
        >
          {getPointsIcon(event.points)}
        </span>
        
        {/* Points Value */}
        <span
          style={{
            color: getPointsColor(event.points),
            fontSize: '16px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            textShadow: `0 0 10px ${getPointsColor(event.points)}80`
          }}
        >
          +{event.points}
        </span>
        
        {/* Reason */}
        <span
          style={{
            color: '#ffffff',
            fontSize: '12px',
            opacity: 0.8
          }}
        >
          {event.reason}
        </span>
      </div>
    </div>
  );
};

export default PointsDisplay;
