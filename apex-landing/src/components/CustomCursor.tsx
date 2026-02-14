"use client";

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [cursorVariant, setCursorVariant] = useState('default');

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { damping: 30, stiffness: 500 });
  const springY = useSpring(mouseY, { damping: 30, stiffness: 500 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('button, a, [role="button"], input[type="submit"], .cursor-pointer')) {
        setCursorVariant('button');
      } else if (target.matches('input, textarea, select, [contenteditable]')) {
        setCursorVariant('input');
      } else {
        setCursorVariant('default');
      }
    };

    document.addEventListener('mousemove', updateMousePosition);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.removeEventListener('mousemove', updateMousePosition);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [mouseX, mouseY]);

  const variants = {
    default: {
      width: 8,
      height: 8,
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      border: 'none',
      borderRadius: '50%',
      scale: 1,
    },
    button: {
      width: 24,
      height: 24,
      backgroundColor: 'rgba(59, 130, 246, 0.9)',
      border: '2px solid rgba(59, 130, 246, 0.6)',
      borderRadius: '50%',
      scale: 1.5,
    },
    input: {
      width: 4,
      height: 16,
      backgroundColor: 'rgba(59, 130, 246, 1)',
      border: 'none',
      borderRadius: '2px',
      scale: 1,
    },
  };

  return (
    <>
      {/* Main Cursor */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={cursorVariant}
        variants={variants}
        transition={{
          type: 'spring',
          damping: 20,
          stiffness: 400,
        }}
      />

      {/* Subtle trail effect */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] opacity-30"
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-2 h-2 bg-primary/40 rounded-full" />
      </motion.div>
    </>
  );
};

export default CustomCursor;
