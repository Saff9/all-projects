"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const BackgroundAnimation = () => {
  const [scrollY, setScrollY] = useState(0);
  const [shapes, setShapes] = useState<any[]>([]);
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Generate shapes and particles client-side only to avoid hydration mismatch
  useEffect(() => {
    const generatedShapes = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      size: 120 + (i * 23) % 100,
      x: (i * 13) % 90 + 5,
      y: (i * 17) % 90 + 5,
      rotation: (i * 45) % 360,
      delay: (i * 0.3) % 2,
    }));

    const generatedParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }));

    setShapes(generatedShapes);
    setParticles(generatedParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Geometric Shapes */}
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute opacity-[0.02] dark:opacity-[0.05]"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
          }}
          animate={{
            rotate: [shape.rotation, shape.rotation + 360],
            scale: [1, 1.1, 1],
            x: [0, Math.sin(scrollY * 0.001) * 20],
            y: [0, Math.cos(scrollY * 0.001) * 20],
          }}
          transition={{
            rotate: {
              duration: 20 + shape.delay * 5,
              repeat: Infinity,
              ease: "linear"
            },
            scale: {
              duration: 8 + shape.delay * 2,
              repeat: Infinity,
              ease: "easeInOut"
            },
            x: {
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            },
            y: {
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: shape.delay
            }
          }}
        >
          <div
            className="border border-primary/20 dark:border-primary/30"
            style={{
              width: shape.size,
              height: shape.size,
              clipPath: shape.id % 4 === 0
                ? 'polygon(50% 0%, 0% 100%, 100% 100%)' // Triangle
                : shape.id % 4 === 1
                ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' // Hexagon
                : shape.id % 4 === 2
                ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' // Octagon
                : 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)', // Octagon variant
            }}
          />
        </motion.div>
      ))}

      {/* Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={`particle-${particle.id}`}
          className="absolute w-1 h-1 bg-primary/10 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.sin(scrollY * 0.01 + particle.id) * 50, 0],
            opacity: [0.1, 0.3, 0.1],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 8 + (particle.id * 0.2) % 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay,
          }}
        />
      ))}

      {/* Morphing Grid */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]">
        <motion.div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
          animate={{
            backgroundPosition: [
              '0px 0px',
              '60px 60px',
              '0px 0px'
            ],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>


    </div>
  );
};

export default BackgroundAnimation;
