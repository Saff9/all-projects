// src/components/Footer.tsx
"use client";

import { useState, useEffect } from "react";

interface FooterProps {
  uniqueVisitors: number;
}

export default function Footer({ uniqueVisitors }: FooterProps) {
  const [animatedVisitors, setAnimatedVisitors] = useState(0);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    // Animate visitor count
    const duration = 2000;
    const start = 0;
    const increment = uniqueVisitors / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= uniqueVisitors) {
        setAnimatedVisitors(uniqueVisitors);
        clearInterval(timer);
      } else {
        setAnimatedVisitors(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [uniqueVisitors]);

  useEffect(() => {
    const timeTimer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timeTimer);
  }, []);

  const socialLinks = [
    { icon: "🌐", label: "NTA Official", href: "https://nta.ac.in" },
    { icon: "📝", label: "JEE Portal", href: "https://jeemain.nta.ac.in" },
    { icon: "📊", label: "Results", href: "https://ntaresults.nic.in" },
    { icon: "📧", label: "Support", href: "mailto:support@example.com" },
  ];

  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "Find Hall", href: "#search" },
    { label: "News", href: "#news" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-[#001f4d] via-[#002a66] to-[#001f4d] dark:from-[#0a0a0f] dark:via-[#0f172a] dark:to-[#0a0a0f] text-white mt-16 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-orange-400/10 to-pink-400/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-8">
          {/* Brand section */}
          <div className="fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#f7941d] to-[#d97c0c] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg card-premium">
                JEE
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-yellow-300">JEE Hall Finder</h3>
                <p className="text-blue-200 text-xs">Session 2 - 2026</p>
              </div>
            </div>
            <p className="text-blue-200 text-xs leading-relaxed mb-4">
              Your trusted companion for JEE Main 2026 examination hall finding and admit card assistance.
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-300">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Portal Status: Online</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="fade-in" style={{ animationDelay: '0.2s' }}>
            <h4 className="font-heading font-bold text-base mb-4 text-yellow-300">Quick Links</h4>
            <div className="grid grid-cols-2 gap-2">
              {quickLinks.map((link, index) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-2 text-blue-200 text-xs hover:text-white transition-all duration-300 hover:scale-105 transform group hover:translate-x-1"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Official Resources */}
          <div className="fade-in" style={{ animationDelay: '0.4s' }}>
            <h4 className="font-heading font-bold text-base mb-4 text-yellow-300">Official Resources</h4>
            <div className="space-y-2">
              {socialLinks.map((link, index) => (
                <a
                  key={link.href}
                  href={link.href}
                  target={link.href.startsWith('http') ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-blue-200 text-xs hover:text-white transition-all duration-300 hover:translate-x-1 transform group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="text-lg group-hover:scale-110 transition-transform duration-300">{link.icon}</span>
                  <span>{link.label}</span>
                  {link.href.startsWith('http') && (
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">↗</span>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Stats & Info */}
          <div className="fade-in" style={{ animationDelay: '0.6s' }}>
            <h4 className="font-heading font-bold text-base mb-4 text-yellow-300">Portal Statistics</h4>
            <div className="space-y-3">
              <div className="bg-white/10 dark:bg-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/20 dark:border-white/10 card-premium">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-blue-200">Unique Visitors</span>
                  <span className="text-yellow-300">👥</span>
                </div>
                <div className="font-bold text-lg text-white">
                  {animatedVisitors.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-white/10 dark:bg-white/5 rounded-lg p-3 backdrop-blur-sm border border-white/20 dark:border-white/10 card-premium">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-blue-200">Current Time</span>
                  <span className="text-yellow-300">🕐</span>
                </div>
                <div className="font-bold text-sm text-white">
                  {currentTime}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-white/5 dark:bg-white/[0.02] rounded-xl p-4 backdrop-blur-sm border border-white/10 dark:border-white/5 mb-6 glass-premium">
          <div className="flex items-start gap-2">
            <span className="text-yellow-300 text-lg mt-0.5">⚠️</span>
            <div>
              <h4 className="font-heading font-bold text-sm text-yellow-300 mb-1">Important Disclaimer</h4>
              <p className="text-blue-200 text-xs leading-relaxed">
                This is not an official NTA website. All exam-related data must be verified from the official NTA portal (jeemain.nta.ac.in). We do not store any personal data and this portal is for informational purposes only.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="text-center lg:text-left">
              <p className="text-xs text-blue-300">
                © {currentYear} JEE Hall Finder. Not affiliated with NTA.
              </p>
              <p className="text-xs text-blue-400 mt-1">
                Made with ❤️ for JEE Aspirants
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-[#003580] to-[#0055a5] dark:from-[#1e40af] dark:to-[#3b82f6] border border-blue-700 dark:border-blue-500 rounded-full px-4 py-2 text-white text-xs font-heading font-semibold flex items-center gap-2 shadow-lg card-premium">
                <span className="animate-pulse">👥</span>
                <span>Live Visitors:</span>
                <span className="text-yellow-300 font-bold">{animatedVisitors.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
