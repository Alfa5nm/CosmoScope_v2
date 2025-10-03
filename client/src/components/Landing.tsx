import React, { useState, useEffect, useRef } from 'react';

import { useNavigate } from 'react-router-dom';

import { useAudio } from '../lib/audio/AudioContext';

import { useTheme } from '../lib/ui/theme';



const Landing: React.FC = () => {

  const navigate = useNavigate();

  const { playSound, isEnabled, toggleAudio } = useAudio();

  const { accessibilityMode, setAccessibilityMode } = useTheme();

  const [isLoaded, setIsLoaded] = useState(false);

  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const [showAccessibilityMenu, setShowAccessibilityMenu] = useState(false);

  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  const [hoveredLetter, setHoveredLetter] = useState<number | null>(null);

  const [letterAnimations, setLetterAnimations] = useState<{ [key: number]: string }>({});

  const [waveEffect, setWaveEffect] = useState(false);

  const [stars, setStars] = useState<Array<{id: number, x: number, y: number, size: number, brightness: number, twinkleDelay: number}>>([]);

  const [nebulaClouds, setNebulaClouds] = useState<Array<{id: number, width: number, height: number, left: number, top: number, colors: string, delay: number}>>([]);

  const [spaceStationFocus, setSpaceStationFocus] = useState(false);

  const [isTransitioning, setIsTransitioning] = useState(false);

  const [stationHovered, setStationHovered] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const spaceStationRef = useRef<HTMLDivElement>(null);



  useEffect(() => {

    const timer = setTimeout(() => setIsLoaded(true), 500);

    return () => clearTimeout(timer);

  }, []);



  // Generate stars and nebula clouds on component mount

  useEffect(() => {

    const generateStars = () => {

      const starCount = 80; // Reduced from 150 for better performance

      const newStars = [];

      

      for (let i = 0; i < starCount; i++) {

        newStars.push({

          id: i,

          x: Math.random() * 100,

          y: Math.random() * 100,

          size: Math.random() * 3 + 1, // 1-4px

          brightness: Math.random() * 0.8 + 0.2, // 0.2-1.0

          twinkleDelay: Math.random() * 5 // 0-5s delay

        });

      }

      

      setStars(newStars);

    };



    const generateNebulaClouds = () => {

      const cloudCount = 3; // Reduced from 4

      const newClouds = [];

      

      for (let i = 0; i < cloudCount; i++) {

        const r1 = Math.floor(100 + Math.random() * 155);

        const g1 = Math.floor(50 + Math.random() * 100);

        const b1 = Math.floor(200 + Math.random() * 55);

        const r2 = Math.floor(50 + Math.random() * 100);

        const g2 = Math.floor(100 + Math.random() * 155);

        const b2 = Math.floor(200 + Math.random() * 55);

        

        newClouds.push({

          id: i,

          width: 200 + Math.random() * 300,

          height: 150 + Math.random() * 200,

          left: Math.random() * 80,

          top: Math.random() * 80,

          colors: `radial-gradient(ellipse, rgba(${r1}, ${g1}, ${b1}, 0.1) 0%, rgba(${r2}, ${g2}, ${b2}, 0.05) 40%, transparent 70%)`,

          delay: i * 3

        });

      }

      

      setNebulaClouds(newClouds);

    };



    generateStars();

    generateNebulaClouds();

  }, []);



  useEffect(() => {

    const handleMouseMove = (e: MouseEvent) => {

      if (containerRef.current) {

        const rect = containerRef.current.getBoundingClientRect();

        const x = ((e.clientX - rect.left) / rect.width) * 100;

        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setMousePosition({ x, y });

      }

    };



    const container = containerRef.current;

    if (container) {

      container.addEventListener('mousemove', handleMouseMove);

      return () => container.removeEventListener('mousemove', handleMouseMove);

    }

  }, []);



  const handleExploreClick = () => {

    playSound('click');

    setIsTransitioning(true);

    

    // Step 1: Pan camera to space station (2 seconds)

    setSpaceStationFocus(true);

    

    // Step 2: Wait for camera pan to complete, then start cosmic transition

    setTimeout(() => {

      // Add cosmic transition effect after camera pan is done

      const overlay = document.createElement('div');

      overlay.className = 'cosmic-overlay';

      document.body.appendChild(overlay);

      

      // Step 3: Navigate after cosmic transition completes

      setTimeout(() => {

    navigate('/solar-system');

        // Clean up overlay

        if (overlay && overlay.parentNode) {

          overlay.parentNode.removeChild(overlay);

        }

      }, 1200); // Wait for cosmic animations to complete (0.8s + 1.2s)

    }, 2000); // Wait for camera pan to complete first

  };



  const toggleAccessibility = () => {

    setShowAccessibilityMenu(!showAccessibilityMenu);

    playSound('click');

  };



  const handleAccessibilityOption = (option: 'normal' | 'high-contrast' | 'reduced-motion') => {

    setAccessibilityMode(option);

    setShowAccessibilityMenu(false);

    playSound('click');

  };



  const accessibilityOptions: Array<{ key: 'normal' | 'high-contrast' | 'reduced-motion'; label: string }> = [

    { key: 'normal', label: 'Normal Mode' },

    { key: 'reduced-motion', label: 'Reduced Motion' },

    { key: 'high-contrast', label: 'High Contrast' }

  ];



  const handleElementHover = (elementId: string) => {

    setHoveredElement(elementId);

    playSound('hover');

  };



  const handleElementLeave = () => {

    setHoveredElement(null);

  };



  const handleLetterHover = (index: number) => {

    setHoveredLetter(index);

    playSound('hover');

    

    // Add random animation class

    const animations = ['pulse', 'glow', 'bounce', 'rotate', 'scale'];

    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];

    setLetterAnimations(prev => ({ ...prev, [index]: randomAnimation }));

  };



  const handleLetterLeave = (index: number) => {

    setHoveredLetter(null);

    

    // Remove animation after a delay

    setTimeout(() => {

      setLetterAnimations(prev => {

        const newAnimations = { ...prev };

        delete newAnimations[index];

        return newAnimations;

      });

    }, 300);

  };



  const triggerWaveEffect = () => {

    setWaveEffect(true);

    playSound('hover');

    

    // Reset wave effect after animation completes

    setTimeout(() => {

      setWaveEffect(false);

    }, 2000);

  };



  const triggerRandomLetterAnimation = () => {

    const title = "COSMOSCOPE";

    const randomIndex = Math.floor(Math.random() * title.length);

    const animations = ['pulse', 'glow', 'bounce', 'rotate', 'scale'];

    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];

    

    setLetterAnimations(prev => ({ ...prev, [randomIndex]: randomAnimation }));

    

    setTimeout(() => {

      setLetterAnimations(prev => {

        const newAnimations = { ...prev };

        delete newAnimations[randomIndex];

        return newAnimations;

      });

    }, 800);

  };



  const handleStationHover = () => {

    setStationHovered(true);

    playSound('hover');

  };



  const handleStationLeave = () => {

    setStationHovered(false);

  };



  const handleStationClick = () => {

    if (!isTransitioning) {

      playSound('click');

      handleExploreClick(); // Trigger the same exploration sequence

    }

  };



  // Add periodic random letter animations

  useEffect(() => {

    if (isLoaded) {

      const interval = setInterval(() => {

        if (Math.random() < 0.3) { // 30% chance every 3 seconds

          triggerRandomLetterAnimation();

        }

      }, 3000);



      return () => clearInterval(interval);

    }

  }, [isLoaded]);



  const renderInteractiveTitle = () => {

    const title = "COSMOSCOPE";

    return (

      <h1 

        className={`main-title ${isLoaded ? 'loaded' : ''} ${waveEffect ? 'wave-effect' : ''}`}

        onDoubleClick={triggerWaveEffect}

        style={{

          fontSize: 'clamp(2.5rem, 8vw, 5rem)',

          fontWeight: '300',

          color: '#ffffff',

          letterSpacing: '0.1em',

          textTransform: 'uppercase',

          opacity: isLoaded ? 1 : 0,

          transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',

          transition: 'all 0.8s ease-out',

          cursor: 'pointer',

          display: 'flex',

          justifyContent: 'center',

          alignItems: 'center',

          flexWrap: 'wrap',

          gap: '0.05em',

          userSelect: 'none'

        }}

      >

        {title.split('').map((letter, index) => (

          <span

            key={index}

            className={`interactive-letter ${letterAnimations[index] || ''} ${waveEffect ? 'wave-letter' : ''}`}

            onMouseEnter={() => handleLetterHover(index)}

            onMouseLeave={() => handleLetterLeave(index)}

            style={{

              display: 'inline-block',

              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

              transformOrigin: 'center',

              cursor: 'pointer',

              position: 'relative',

              textShadow: hoveredLetter === index 

                ? `0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 60px #00ffff, 0 0 80px #ff00ff` 

                : '0 0 10px rgba(0, 255, 255, 0.5)',

              color: hoveredLetter === index 

                ? `hsl(${(index * 36) % 360}, 100%, 70%)` 

                : '#ffffff',

              transform: hoveredLetter === index 

                ? 'translateY(-10px) scale(1.2) rotateZ(5deg)' 

                : 'translateY(0) scale(1) rotateZ(0deg)',

              filter: hoveredLetter === index 

                ? 'brightness(1.5) saturate(1.5)' 

                : 'brightness(1) saturate(1)',

              animationDelay: waveEffect ? `${index * 0.1}s` : `${index * 0.1}s`

            }}

          >

            {letter}

          </span>

        ))}

      </h1>

    );

  };



  return (

    <div 

      ref={containerRef}

      className="landing-container"

      style={{

        position: 'relative',

        minHeight: '100vh',

        overflow: 'hidden',

        display: 'flex',

        alignItems: 'center',

        justifyContent: 'center',

        padding: '1rem'

      }}

    >

      {/* Dynamic space background with mouse tracking */}

      <div 

        className="space-background"

        style={{

          position: 'fixed',

          top: 0,

          left: 0,

          width: '100%',

          height: '100%',

          backgroundImage: 'url("/src/assets/images/background space.png")',

          backgroundSize: 'cover',

          backgroundPosition: 'center',

          backgroundRepeat: 'no-repeat',

          zIndex: 1,

          transform: `scale(${1 + (mousePosition.x - 50) * 0.001})`,

          transition: 'transform 0.3s ease-out',

          filter: 'brightness(0.3) contrast(1.2)'

        }}

      />

      

      {/* Additional dark overlay for deeper space effect */}

      <div 

        style={{

          position: 'fixed',

          top: 0,

          left: 0,

          width: '100%',

          height: '100%',

          background: 'rgba(0, 0, 0, 0.6)',

          zIndex: 1.5

        }}

      />



      {/* Dynamic neon overlay */}

      <div 

        className="neon-overlay"

        style={{

          position: 'fixed',

          top: 0,

          left: 0,

          width: '100%',

          height: '100%',

          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 

            rgba(0, 255, 255, 0.05) 0%, 

            rgba(255, 0, 255, 0.02) 30%, 

            rgba(0, 0, 0, 0.7) 70%)`,

          zIndex: 2,

          transition: 'background 0.3s ease-out'

        }}

      />



      {/* Star field background */}

      <div 

        className="star-field" 

        style={{ 

          position: 'fixed', 

          top: 0, 

          left: 0, 

          width: '100%', 

          height: '100%', 

          zIndex: 2,

          opacity: spaceStationFocus ? 0 : 1,

          transition: 'opacity 2s ease-in-out'

        }}

      >

        {stars.map((star) => (

          <div

            key={star.id}

            className="star"

            style={{

              position: 'absolute',

              left: `${star.x}%`,

              top: `${star.y}%`,

              width: `${star.size}px`,

              height: `${star.size}px`,

              background: '#ffffff',

              borderRadius: '50%',

              opacity: star.brightness,

              boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${star.brightness})`,

              animation: `starTwinkle ${2 + Math.random() * 3}s ease-in-out infinite`,

              animationDelay: `${star.twinkleDelay}s`

            }}

          />

        ))}

      </div>



      {/* Shooting stars */}

      <div 

        className="shooting-stars" 

        style={{ 

          position: 'fixed', 

          top: 0, 

          left: 0, 

          width: '100%', 

          height: '100%', 

          zIndex: 2.5,

          opacity: spaceStationFocus ? 0 : 1,

          transition: 'opacity 2s ease-in-out'

        }}

      >

        {[...Array(3)].map((_, i) => (

          <div

            key={i}

            className="shooting-star"

            style={{

              position: 'absolute',

              width: '2px',

              height: '2px',

              background: '#ffffff',

              borderRadius: '50%',

              boxShadow: '0 0 6px #ffffff, 0 0 12px #00ffff, 0 0 18px #00ffff',

              animation: `shootingStar ${3 + Math.random() * 2}s linear infinite`,

              animationDelay: `${i * 4 + Math.random() * 3}s`,

              opacity: 0

            }}

          />

        ))}

      </div>



      {/* Nebula clouds */}

      <div 

        className="nebula-effects" 

        style={{ 

          position: 'fixed', 

          top: 0, 

          left: 0, 

          width: '100%', 

          height: '100%', 

          zIndex: 1.8,

          opacity: spaceStationFocus ? 0 : 1,

          transition: 'opacity 2s ease-in-out'

        }}

      >

        {nebulaClouds.map((cloud) => (

          <div

            key={cloud.id}

            className="nebula-cloud"

            style={{

              position: 'absolute',

              width: `${cloud.width}px`,

              height: `${cloud.height}px`,

              left: `${cloud.left}%`,

              top: `${cloud.top}%`,

              background: cloud.colors,

              borderRadius: '50%',

              filter: 'blur(40px)',

              animation: `nebulaDrift ${20}s ease-in-out infinite`,

              animationDelay: `${cloud.delay}s`

            }}

          />

        ))}

      </div>



      {/* Constellation lines */}

      <div 

        className="constellation-lines" 

        style={{

          position: 'fixed', 

          top: 0, 

          left: 0, 

          width: '100%',

          height: '100%', 

          zIndex: 2.2,

          opacity: spaceStationFocus ? 0 : 1,

          transition: 'opacity 2s ease-in-out'

        }}

      >

        <svg width="100%" height="100%" style={{ position: 'absolute' }}>

          {/* Big Dipper constellation */}

          <g className="constellation" style={{ opacity: 0.3 }}>

            <line x1="15%" y1="25%" x2="18%" y2="22%" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

            <line x1="18%" y1="22%" x2="22%" y2="20%" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

            <line x1="22%" y1="20%" x2="26%" y2="23%" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

            <line x1="26%" y1="23%" x2="30%" y2="25%" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

            <line x1="30%" y1="25%" x2="28%" y2="30%" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

            <line x1="28%" y1="30%" x2="24%" y2="32%" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

            <circle cx="15%" cy="25%" r="2" fill="rgba(255,255,255,0.8)" />

            <circle cx="18%" cy="22%" r="2" fill="rgba(255,255,255,0.8)" />

            <circle cx="22%" cy="20%" r="2" fill="rgba(255,255,255,0.8)" />

            <circle cx="26%" cy="23%" r="2" fill="rgba(255,255,255,0.8)" />

            <circle cx="30%" cy="25%" r="2" fill="rgba(255,255,255,0.8)" />

            <circle cx="28%" cy="30%" r="2" fill="rgba(255,255,255,0.8)" />

            <circle cx="24%" cy="32%" r="2" fill="rgba(255,255,255,0.8)" />

          </g>

          

          {/* Orion constellation */}

          <g className="constellation" style={{ opacity: 0.25 }}>

            <line x1="75%" y1="60%" x2="78%" y2="65%" stroke="rgba(0,255,255,0.3)" strokeWidth="1" />

            <line x1="78%" y1="65%" x2="82%" y2="68%" stroke="rgba(0,255,255,0.3)" strokeWidth="1" />

            <line x1="82%" y1="68%" x2="85%" y2="65%" stroke="rgba(0,255,255,0.3)" strokeWidth="1" />

            <line x1="78%" y1="65%" x2="80%" y2="70%" stroke="rgba(0,255,255,0.3)" strokeWidth="1" />

            <circle cx="75%" cy="60%" r="1.5" fill="rgba(0,255,255,0.7)" />

            <circle cx="78%" cy="65%" r="1.5" fill="rgba(0,255,255,0.7)" />

            <circle cx="82%" cy="68%" r="1.5" fill="rgba(0,255,255,0.7)" />

            <circle cx="85%" cy="65%" r="1.5" fill="rgba(0,255,255,0.7)" />

            <circle cx="80%" cy="70%" r="1.5" fill="rgba(0,255,255,0.7)" />

          </g>

        </svg>

      </div>



      {/* Space Station with Trail Effect */}

      <div 

        ref={spaceStationRef}

        className="space-station-container" 

        style={{

          position: 'fixed', 

          top: 0, 

          left: 0, 

          width: '100%',

          height: '100%', 

          zIndex: 4,

          transform: 'scale(1)',

          transition: 'transform 2s ease-in-out',

          transformOrigin: 'center'

        }}

      >

        {/* New Trail Approach - Multiple segments with box-shadow */}

        <div 

          className="space-station-trail-new"

          style={{

            position: 'absolute',

            top: spaceStationFocus ? '50%' : '35.5%',

            left: spaceStationFocus ? '50%' : '-100px',

            width: '4px',

            height: '1px',

            background: 'rgba(0, 255, 255, 0.9)',

            borderRadius: '50%',

            animation: spaceStationFocus ? 'none' : 'spaceStationMove 25s linear infinite',

            zIndex: 4,

            transform: spaceStationFocus ? 'translate(-50%, -50%) scale(8)' : 'scale(1)',

            transition: 'all 2s ease-in-out',

            opacity: spaceStationFocus ? 0.3 : 1,

            boxShadow: `

              -8px 0 0 -1px rgba(0, 255, 255, 0.8),

              -16px 0 0 -2px rgba(0, 255, 255, 0.7),

              -24px 0 0 -2px rgba(0, 255, 255, 0.6),

              -32px 0 0 -3px rgba(0, 255, 255, 0.5),

              -40px 0 0 -3px rgba(0, 255, 255, 0.4),

              -48px 0 0 -3px rgba(0, 255, 255, 0.3),

              -56px 0 0 -4px rgba(0, 255, 255, 0.2),

              -64px 0 0 -4px rgba(0, 255, 255, 0.1)

            `,

            filter: 'blur(0.5px)'

          }}

        />

        

        {/* Space Station - Interactive */}

        <div 

          className="space-station"

          onMouseEnter={handleStationHover}

          onMouseLeave={handleStationLeave}

          onClick={handleStationClick}

          style={{

            position: 'absolute',

            top: spaceStationFocus ? '50%' : '35%',

            left: spaceStationFocus ? '50%' : '-100px',

            width: '80px',

            height: '40px',

            backgroundImage: 'url("/src/assets/images/space-station-with-solar-panel-open-removebg-preview.png")',

            backgroundSize: 'contain',

            backgroundRepeat: 'no-repeat',

            backgroundPosition: 'center',

            animation: spaceStationFocus ? 'none' : 'spaceStationMove 25s linear infinite',

            filter: spaceStationFocus 

              ? 'brightness(1.5) drop-shadow(0 0 20px rgba(0, 255, 255, 0.8))' 

              : stationHovered 

                ? 'brightness(1.4) drop-shadow(0 0 15px rgba(0, 255, 255, 0.6))' 

                : 'brightness(1.2)',

            transition: 'all 2s ease-in-out',

            cursor: 'pointer',

            zIndex: 5,

            transform: spaceStationFocus 

              ? 'translate(-50%, -50%) scale(8)' 

              : stationHovered 

                ? 'scale(1.1)' 

                : 'scale(1)'

          }}

        />

        

        {/* Interactive glow effect */}

        {(stationHovered || spaceStationFocus) && (

          <div 

            className="space-station-glow"

            style={{

              position: 'absolute',

              top: spaceStationFocus ? '50%' : '33%',

              left: spaceStationFocus ? '50%' : '-110px',

              width: '100px',

              height: '60px',

              background: spaceStationFocus 

                ? 'radial-gradient(ellipse, rgba(0, 255, 255, 0.4) 0%, rgba(0, 255, 255, 0.2) 50%, transparent 100%)'

                : 'radial-gradient(ellipse, rgba(0, 255, 255, 0.2) 0%, rgba(0, 255, 255, 0.1) 50%, transparent 100%)',

              borderRadius: '50%',

              animation: spaceStationFocus 

                ? 'stationGlow 2s ease-in-out infinite'

                : 'spaceStationMove 25s linear infinite, stationHoverGlow 1s ease-in-out infinite',

              filter: 'blur(10px)',

              zIndex: 4,

              transform: spaceStationFocus ? 'translate(-50%, -50%) scale(8)' : 'scale(1)',

              transition: 'all 2s ease-in-out'

            }}

          />

        )}

        

        {/* Station information tooltip on hover */}

        {stationHovered && !spaceStationFocus && (

          <div 

            className="station-tooltip"

            style={{

              position: 'absolute',

              top: '25%',

              left: '-80px',

              background: 'rgba(0, 0, 0, 0.9)',

              border: '1px solid rgba(0, 255, 255, 0.5)',

              borderRadius: '8px',

              padding: '8px 12px',

              color: '#00ffff',

              fontSize: '12px',

              fontWeight: '500',

              whiteSpace: 'nowrap',

              animation: 'spaceStationMove 25s linear infinite',

              zIndex: 6,

              boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',

              backdropFilter: 'blur(10px)'

            }}

          >

            🛰️ Click to board station

          </div>

        )}

      </div>



      {/* Floating neon particles */}

      <div 

        className="neon-particles"

        style={{

          opacity: spaceStationFocus ? 0 : 1,

          transition: 'opacity 2s ease-in-out'

        }}

      >

        {[...Array(15)].map((_, i) => (

          <div

            key={i}

            className="particle"

            style={{

              position: 'absolute',

              width: '2px',

              height: '2px',

              background: `hsl(${(i * 18) % 360}, 80%, 40%)`,

              borderRadius: '50%',

              left: `${Math.random() * 100}%`,

              top: `${Math.random() * 100}%`,

              animation: `neonPulse ${2 + Math.random() * 3}s ease-in-out infinite`,

              animationDelay: `${Math.random() * 2}s`,

              boxShadow: `0 0 8px hsl(${(i * 18) % 360}, 100%, 50%)`,

              zIndex: 3

            }}

          />

        ))}

      </div>



      {/* Main content container */}

      <div 

        className="main-content"

        style={{

          position: 'relative',

          zIndex: 10,

          maxWidth: '1200px',

          width: '100%',

          textAlign: 'center',

          display: 'flex',

          flexDirection: 'column',

          alignItems: 'center',

          gap: '2rem',

          transform: spaceStationFocus ? 'translateY(-30vh) scale(0.5)' : 'translateY(0) scale(1)',

          transition: 'all 2s ease-in-out',

          opacity: spaceStationFocus ? 0 : 1

        }}

      >

        {/* Interactive Title with individual letter effects */}

        {renderInteractiveTitle()}



        {/* Subtitle */}

        <p 

          className={`subtitle ${isLoaded ? 'loaded' : ''}`}

          style={{

            fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',

            color: '#b0b0b0',

            maxWidth: '600px',

            lineHeight: 1.6,

            opacity: isLoaded ? 1 : 0,

            transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',

            transition: 'all 0.8s ease-out 0.2s',

            textShadow: '0 0 5px rgba(255, 255, 255, 0.3)'

          }}

        >

          Explore the solar system with real-time data and immersive 3D visualization

        </p>





        {/* CTA Button */}

        <button

          className={`explore-button ${isLoaded ? 'loaded' : ''} ${hoveredElement === 'button' ? 'neon-glow' : ''}`}

          onClick={handleExploreClick}

          onMouseEnter={() => !isTransitioning && handleElementHover('button')}

          onMouseLeave={handleElementLeave}

          disabled={isTransitioning}

          style={{

            padding: '1rem 3rem',

            fontSize: '1.2rem',

            fontWeight: '500',

            color: isTransitioning ? '#888888' : '#ffffff',

            background: isTransitioning ? 'rgba(0, 255, 255, 0.05)' : 'rgba(0, 255, 255, 0.1)',

            border: `2px solid ${isTransitioning ? 'rgba(0, 255, 255, 0.2)' : 'rgba(0, 255, 255, 0.5)'}`,

            borderRadius: '50px',

            cursor: isTransitioning ? 'not-allowed' : 'pointer',

            transition: 'all 0.3s ease',

            backdropFilter: 'blur(10px)',

            opacity: isLoaded ? 1 : 0,

            transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',

            transitionDelay: '0.6s',

            boxShadow: hoveredElement === 'button' && !isTransitioning

              ? '0 0 30px rgba(0, 255, 255, 0.8), inset 0 0 20px rgba(0, 255, 255, 0.2)' 

              : '0 0 15px rgba(0, 255, 255, 0.3)',

            textShadow: isTransitioning ? 'none' : '0 0 10px rgba(0, 255, 255, 0.5)'

          }}

        >

          {isTransitioning ? 'Approaching Station...' : 'Begin Exploration'}

        </button>

      </div>



      {/* Control Panel */}

      <div 

        className="control-panel"

        style={{

          position: 'fixed',

          top: '2rem',

          right: '2rem',

          display: 'flex',

          gap: '1rem',

          zIndex: 100

        }}

      >

        {/* Audio Toggle */}

        <button

          className={`control-button ${isEnabled ? 'active' : ''}`}

          onClick={toggleAudio}

          style={{

            width: '50px',

            height: '50px',

            borderRadius: '50%',

            background: isEnabled ? 'rgba(0, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',

            border: `2px solid ${isEnabled ? 'rgba(0, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.3)'}`,

            color: '#ffffff',

            cursor: 'pointer',

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'center',

            fontSize: '1.2rem',

            transition: 'all 0.3s ease',

            backdropFilter: 'blur(10px)',

            boxShadow: isEnabled 

              ? '0 0 20px rgba(0, 255, 255, 0.5)' 

              : '0 0 10px rgba(255, 255, 255, 0.2)'

          }}

        >

          {isEnabled ? '🔊' : '🔇'}

        </button>



        {/* Accessibility Button */}

        <div style={{ position: 'relative' }}>

          <button

            className="control-button"

            onClick={toggleAccessibility}

            style={{

              width: '50px',

              height: '50px',

              borderRadius: '50%',

              background: 'rgba(255, 255, 255, 0.1)',

              border: '2px solid rgba(255, 255, 255, 0.3)',

              color: '#ffffff',

              cursor: 'pointer',

              display: 'flex',

              alignItems: 'center',

              justifyContent: 'center',

              fontSize: '1.2rem',

              transition: 'all 0.3s ease',

              backdropFilter: 'blur(10px)',

              boxShadow: '0 0 10px rgba(255, 255, 255, 0.2)'

            }}

          >

            ♿

          </button>



          {/* Accessibility Menu */}

          {showAccessibilityMenu && (

            <div

              className="accessibility-menu"

              style={{

                position: 'absolute',

                top: '60px',

                right: '0',

                background: 'rgba(0, 0, 0, 0.9)',

                border: '1px solid rgba(0, 255, 255, 0.3)',

                borderRadius: '12px',

                padding: '1rem',

                minWidth: '200px',

                zIndex: 200,

                backdropFilter: 'blur(10px)',

                boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)'

              }}

            >

              <h4 style={{ color: '#ffffff', marginBottom: '1rem', fontSize: '1rem' }}>

                Accessibility Options

              </h4>

              {accessibilityOptions.map((option) => (

                <button

                  key={option.key}

                  onClick={() => handleAccessibilityOption(option.key)}

                  style={{

                    display: 'block',

                    width: '100%',

                    padding: '0.5rem',

                    marginBottom: '0.5rem',

                    background: accessibilityMode === option.key 

                      ? 'rgba(0, 255, 255, 0.2)' 

                      : 'transparent',

                    border: `1px solid ${accessibilityMode === option.key 

                      ? 'rgba(0, 255, 255, 0.5)' 

                      : 'rgba(255, 255, 255, 0.2)'}`,

                    color: '#ffffff',

                    borderRadius: '6px',

                    cursor: 'pointer',

                    transition: 'all 0.3s ease',

                    fontSize: '0.9rem'

                  }}

                >

                  {option.label}

                </button>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>

  );

};



export default Landing;