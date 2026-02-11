"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Shield } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative w-full pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-background">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            opacity: [0.01, 0.03, 0.01],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px] opacity-10" 
        />
        <motion.div 
          animate={{ 
            opacity: [0.01, 0.03, 0.01],
            scale: [1.1, 1, 1.1]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1
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
