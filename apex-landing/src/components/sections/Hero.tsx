"use client";

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';

const FloatingElement = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    animate={{
      y: [0, -10, 0],
      rotate: [0, 2, -2, 0]
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
      delay
    }}
    className="absolute opacity-20"
  >
    {children}
  </motion.div>
);

const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative w-full pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-background">
      {/* Floating Elements */}
      <FloatingElement delay={0}>
        <div className="absolute top-20 left-10 w-16 h-16 bg-primary/10 rounded-full blur-sm" />
      </FloatingElement>
      <FloatingElement delay={2}>
        <div className="absolute top-40 right-20 w-12 h-12 bg-primary-purple/10 rounded-full blur-sm" />
      </FloatingElement>
      <FloatingElement delay={4}>
        <div className="absolute bottom-40 left-20 w-20 h-20 bg-primary/5 rounded-full blur-sm" />
      </FloatingElement>

      {/* Mouse Follow Glow */}
      <motion.div
        animate={{
          x: mousePosition.x * 0.02,
          y: mousePosition.y * 0.02,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 200 }}
        className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"
      />

      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            opacity: [0.01, 0.05, 0.01],
            scale: [1, 1.2, 1],
            x: [0, 50, 0]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px] opacity-10"
        />
        <motion.div
          animate={{
            opacity: [0.01, 0.04, 0.01],
            scale: [1.1, 1, 1.1],
            x: [0, -30, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-purple rounded-full blur-[120px] opacity-10"
        />
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-foreground/[0.03] border border-foreground/10 text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-8"
          >
            <Sparkles className="w-3 h-3 text-foreground/60" />
            <span>Apex AI V3.2 is now live</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-foreground leading-[0.9]"
          >
            Intelligence for <br />
            <span className="text-foreground/20 italic">The New Era</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg md:text-xl text-foreground/50 mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Built for agents, powered by a multi-model ecosystem. Experience specialized reasoning, creative, and vision models designed for high-speed innovation.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button className="w-full sm:w-auto px-10 py-4 bg-foreground text-background rounded-full font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 group">
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-10 py-4 bg-foreground/[0.03] border border-foreground/10 rounded-full font-bold text-lg hover:bg-foreground/[0.08] transition-all text-foreground/80">
              API Reference
            </button>
          </motion.div>

          {/* Stats/Trust */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-24 grid grid-cols-2 md:grid-cols-3 gap-8 border-t border-foreground/5 pt-12"
          >
            <div className="text-left">
              <div className="text-2xl font-bold mb-1 flex items-center gap-2 text-foreground">
                <Zap className="w-4 h-4 text-foreground/40" />
                <span>2ms</span>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-foreground/20">Latency avg.</div>
            </div>
            <div className="text-left border-l border-foreground/5 pl-8">
              <div className="text-2xl font-bold mb-1 flex items-center gap-2 text-foreground">
                <Shield className="w-4 h-4 text-foreground/40" />
                <span>99.9%</span>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-foreground/20">Uptime SLA</div>
            </div>
            <div className="hidden md:block text-left border-l border-foreground/5 pl-8">
              <div className="text-2xl font-bold mb-1 flex items-center gap-2 text-foreground">
                <Sparkles className="w-4 h-4 text-foreground/40" />
                <span>1M+</span>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-foreground/20">Daily Requests</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
