'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Sparkles, Home, BookOpen, Cpu } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="relative z-50 py-6">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                <Cpu className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Apex AI</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4">
        <div className="max-w-2xl w-full text-center">
          {/* Animated Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 relative"
          >
            <Search className="w-12 h-12 text-primary" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-3xl border-2 border-primary/20"
            />
          </motion.div>

          {/* Error Code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold text-foreground mb-4 tracking-tight">
              404
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Page Not Found
            </h2>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-muted-foreground text-lg mb-12 max-w-md mx-auto leading-relaxed"
          >
            The page you're looking for doesn't exist or has been moved.
            Let's get you back to exploring the future of AI.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </Link>

            <Link
              href="/blog"
              className="inline-flex items-center justify-center px-8 py-4 bg-card border border-border text-foreground rounded-xl font-semibold hover:bg-accent transition-all duration-300 hover:scale-105"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Read Blog
            </Link>
          </motion.div>

          {/* Navigation Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto"
          >
            {[
              { href: '/#features', label: 'Features', icon: Sparkles },
              { href: '/#pricing', label: 'Pricing', icon: Cpu },
              { href: '/about', label: 'About', icon: Search }
            ].map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
              >
                <Link
                  href={link.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-card/50 transition-colors group"
                >
                  <link.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground">
                    {link.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container px-4 mx-auto py-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Apex AI. Building the future of intelligent systems.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
