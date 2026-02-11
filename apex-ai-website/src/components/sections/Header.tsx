"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Menu, X, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { name: 'Features', href: '#features' },
  { name: 'Playground', href: '#playground' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Docs', href: '#' },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 w-full z-[100] transition-all duration-500 ease-[0.22, 1, 0.36, 1]",
        isScrolled ? "py-3" : "py-6"
      )}
    >
      <div className="container px-4 mx-auto">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "relative flex items-center justify-between px-6 py-2 rounded-full transition-all duration-500 ease-[0.22, 1, 0.36, 1]",
            isScrolled ? "bg-background/40 backdrop-blur-md shadow-2xl border border-border/50" : "bg-transparent"
          )}
        >
          <a href="/" className="flex items-center gap-2 group" aria-label="Apex AI Home">
            <div className="w-8 h-8 bg-foreground text-background rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tighter text-foreground">Apex AI</span>
          </a>

          <nav className="hidden md:flex items-center gap-8" aria-label="Desktop Navigation">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
              >
                {item.name}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <button type="button" className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
              Log In
            </button>
            <button type="button" className="px-6 py-2.5 bg-foreground text-background rounded-full text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2 group">
              Get Started
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button 
              type="button"
              className="p-2 text-foreground/80 hover:text-foreground transition-colors focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-2xl border-b border-border/50 overflow-hidden"
          >
            <nav className="container px-6 py-8 flex flex-col gap-6" aria-label="Mobile Navigation">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-2xl font-bold text-foreground/60 hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-6 border-t border-border/50 flex flex-col gap-4">
                <button type="button" className="w-full py-4 text-foreground font-bold text-center">Log In</button>
                <button type="button" className="w-full py-4 bg-foreground text-background rounded-2xl font-bold">Get Started</button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
