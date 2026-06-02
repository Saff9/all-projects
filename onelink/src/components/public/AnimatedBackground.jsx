import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * AnimatedBackground Component
 * Provides various animated background effects for profile pages
 * 
 * @param {string} type - Type of animation: 'particles', 'gradient', 'waves', 'stars', 'mesh', 'none'
 * @param {object} colors - Color configuration for the background
 * @param {string} className - Additional CSS classes
 */
const AnimatedBackground = ({
  type = 'gradient',
  colors = {},
  className = '',
}) => {
  const canvasRef = useRef(null);

  // Default color schemes
  const defaultColors = {
    primary: colors.primary || '#3b82f6',
    secondary: colors.secondary || '#6366f1',
    background: colors.background || '#0f172a',
    accent: colors.accent || '#06b6d4',
  };

  // Particle animation using canvas
  useEffect(() => {
    if (type !== 'particles' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.color = Math.random() > 0.5 ? defaultColors.primary : defaultColors.secondary;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // Initialize particles
    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(100, Math.floor((canvas.width * canvas.height) / 15000));
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };
    initParticles();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = defaultColors.primary;
            ctx.globalAlpha = 0.1 * (1 - distance / 120);
            ctx.lineWidth = 0.5;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [type, defaultColors.primary, defaultColors.secondary]);

  // Render different background types
  const renderBackground = () => {
    switch (type) {
      case 'particles':
        return (
          <>
            <div 
              className="absolute inset-0"
              style={{ backgroundColor: defaultColors.background }}
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 pointer-events-none"
            />
          </>
        );

      case 'gradient':
        return (
          <motion.div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${defaultColors.primary}, ${defaultColors.secondary}, ${defaultColors.background})`,
              backgroundSize: '400% 400%',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        );

      case 'waves':
        return (
          <div 
            className="absolute inset-0 overflow-hidden"
            style={{ backgroundColor: defaultColors.background }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-[200%] h-[200%] rounded-[40%]"
                style={{
                  background: `linear-gradient(180deg, transparent, ${defaultColors.primary}20)`,
                  top: '50%',
                  left: '-50%',
                }}
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20 + i * 5,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: i * 2,
                }}
              />
            ))}
          </div>
        );

      case 'stars':
        return (
          <div 
            className="absolute inset-0 overflow-hidden"
            style={{ backgroundColor: defaultColors.background }}
          >
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
            {/* Gradient overlay */}
            <div 
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at center, transparent 0%, ${defaultColors.background} 70%)`,
              }}
            />
          </div>
        );

      case 'mesh':
        return (
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: defaultColors.background }}
          >
            {/* Mesh gradient blobs */}
            <motion.div
              className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-30"
              style={{
                background: defaultColors.primary,
                top: '-10%',
                left: '-10%',
              }}
              animate={{
                x: [0, 100, 0],
                y: [0, 50, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-30"
              style={{
                background: defaultColors.secondary,
                bottom: '-10%',
                right: '-10%',
              }}
              animate={{
                x: [0, -50, 0],
                y: [0, -100, 0],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute w-[300px] h-[300px] rounded-full blur-3xl opacity-20"
              style={{
                background: defaultColors.accent,
                top: '40%',
                right: '20%',
              }}
              animate={{
                x: [0, 30, 0],
                y: [0, -30, 0],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        );

      case 'none':
      default:
        return (
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: defaultColors.background }}
          />
        );
    }
  };

  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden ${className}`}>
      {renderBackground()}
    </div>
  );
};

// Preset configurations for easy use
export const backgroundPresets = {
  particles: {
    type: 'particles',
    colors: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      background: '#0f172a',
    },
  },
  gradient: {
    type: 'gradient',
    colors: {
      primary: '#f97316',
      secondary: '#ec4899',
      background: '#8b5cf6',
    },
  },
  waves: {
    type: 'waves',
    colors: {
      primary: '#06b6d4',
      background: '#0f172a',
    },
  },
  stars: {
    type: 'stars',
    colors: {
      background: '#0f172a',
    },
  },
  mesh: {
    type: 'mesh',
    colors: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      accent: '#ec4899',
      background: '#0f172a',
    },
  },
  sunset: {
    type: 'gradient',
    colors: {
      primary: '#f97316',
      secondary: '#ec4899',
      background: '#8b5cf6',
    },
  },
  ocean: {
    type: 'waves',
    colors: {
      primary: '#06b6d4',
      secondary: '#3b82f6',
      background: '#0c4a6e',
    },
  },
  forest: {
    type: 'particles',
    colors: {
      primary: '#22c55e',
      secondary: '#14b8a6',
      background: '#052e16',
    },
  },
  neon: {
    type: 'mesh',
    colors: {
      primary: '#22d3ee',
      secondary: '#f472b6',
      accent: '#a855f7',
      background: '#0f172a',
    },
  },
};

export default AnimatedBackground;