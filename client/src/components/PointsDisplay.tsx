import React, { useState, useEffect } from 'react';
import { usePointsStore, PointsEvent } from '../store/pointsStore';

const PointsDisplay: React.FC = () => {
  const { totalPoints, recentEvents } = usePointsStore();
  const [isVisible, setIsVisible] = useState(true);
  const [displayPoints, setDisplayPoints] = useState(0);

  // Animate points counter
  useEffect(() => {
    const targetPoints = totalPoints;
    const increment = Math.ceil((targetPoints - displayPoints) / 20);
    
    if (displayPoints < targetPoints) {
      const timer = setTimeout(() => {
        setDisplayPoints(prev => Math.min(prev + increment, targetPoints));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [totalPoints, displayPoints]);

  // Show/hide based on recent activity
  useEffect(() => {
    if (recentEvents.length > 0) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [recentEvents.length]);

  return (
    <>
      {/* Main Points Display */}
      <div 
        className="points-display"
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'all 0.3s ease-out'
        }}
      >
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            border: '2px solid rgba(0, 255, 255, 0.6)',
            borderRadius: '15px',
            padding: '12px 20px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '200px'
          }}
        >
          {/* Points Icon */}
          <div
            style={{
              fontSize: '24px',
              animation: 'pointsGlow 2s ease-in-out infinite'
            }}
          >
            ⭐
          </div>
          
          {/* Points Counter */}
          <div
            style={{
              color: '#00ffff',
              fontSize: '20px',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              textShadow: '0 0 10px rgba(0, 255, 255, 0.8)'
            }}
          >
            {displayPoints.toLocaleString()}
          </div>
          
          {/* Points Label */}
          <div
            style={{
              color: '#ffffff',
              fontSize: '14px',
              opacity: 0.8
            }}
          >
            POINTS
          </div>
        </div>
      </div>

      {/* Floating Points Events */}
      {recentEvents.map((event) => (
        <FloatingPointsEvent key={event.id} event={event} />
      ))}
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
