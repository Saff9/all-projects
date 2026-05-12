// src/components/StatsBar.tsx
"use client";

import { useState, useEffect } from "react";

const STATS = [
  { label: "JEE Aspirants 2026", value: "13L+", icon: "👥", color: "from-blue-500 to-purple-600" },
  { label: "Exam Cities", value: "500+", icon: "🏙️", color: "from-green-500 to-emerald-600" },
  { label: "Test Centres", value: "3000+", icon: "🏫", color: "from-orange-500 to-red-600" },
  { label: "Session 2 Date", value: "Apr 2026", icon: "📅", color: "from-pink-500 to-rose-600" },
];

interface StatItemProps {
  label: string;
  value: string;
  icon: string;
  color: string;
  delay: number;
}

function StatItem({ label, value, icon, color, delay }: StatItemProps) {
  const [count, setCount] = useState(0);
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
      // Animate number counting
      const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
      if (!isNaN(numericValue)) {
        let current = 0;
        const increment = numericValue / 50;
        const interval = setInterval(() => {
          current += increment;
          if (current >= numericValue) {
            setCount(numericValue);
            clearInterval(interval);
          } else {
            setCount(Math.floor(current));
          }
        }, 20);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className="group relative">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 rounded-xl transition-opacity duration-500`} />
      
      <div className="relative bg-white dark:bg-[#1e293b] rounded-xl p-6 shadow-sm hover:shadow-lg dark:hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-[#334155] card-premium">
        {/* Icon with animation */}
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${color} text-white text-xl mb-3 ${isAnimated ? 'animate-bounce' : ''}`}
             style={{ animationDelay: '1s', animationDuration: '2s' }}>
          {icon}
        </div>
        
        {/* Value with counting animation */}
        <div className="font-heading font-extrabold text-2xl text-[#003580] dark:text-[#60a5fa] mb-1">
          {value.includes('+') && isAnimated ? (
            <>
              <span className="inline-block min-w-[2rem] text-center">
                {count.toLocaleString()}
              </span>
              <span className="text-lg ml-1">+</span>
            </>
          ) : (
            <span className={isAnimated ? 'fade-in' : ''}>
              {value}
            </span>
          )}
        </div>
        
        {/* Label */}
        <div className="text-xs text-gray-600 dark:text-[#94a3b8] font-sans font-medium">
          {label}
        </div>
        
        {/* Hover effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white via-transparent to-white opacity-0 group-hover:opacity-20 dark:from-[#334155] dark:to-transparent transition-opacity duration-300" />
      </div>
    </div>
  );
}

export default function StatsBar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative bg-gradient-to-b from-gray-50 to-white dark:from-[#0f172a] dark:to-[#1e293b] border-b border-gray-200 dark:border-[#334155] shadow-lg overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-400/5 to-purple-400/5 dark:from-blue-400/10 dark:to-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-orange-400/5 to-pink-400/5 dark:from-orange-400/10 dark:to-pink-400/10 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="text-center mb-8">
          <h2 className="font-heading font-bold text-2xl text-gray-800 dark:text-[#f1f5f9] mb-2">
            JEE Main 2026 at a Glance
          </h2>
          <p className="text-sm text-gray-600 dark:text-[#94a3b8]">
            India's largest engineering entrance examination
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat, index) => (
            <div
              key={stat.label}
              className={`fade-in ${isVisible ? 'visible' : ''}`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <StatItem 
                {...stat} 
                delay={index * 200}
              />
            </div>
          ))}
        </div>
        
        {/* Progress bar */}
        <div className="mt-8 bg-white dark:bg-[#1e293b] rounded-full p-2 shadow-inner">
          <div className="bg-gradient-to-r from-[#003580] to-[#f7941d] dark:from-[#1e40af] dark:to-[#fb923c] h-3 rounded-full relative overflow-hidden">
            <div className="absolute inset-0 bg-white opacity-20 animate-pulse" />
            <div 
              className="h-full bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"
              style={{ animationDuration: '2s' }}
            />
          </div>
        </div>
        
        <p className="text-center text-xs text-gray-500 dark:text-[#64748b] mt-3 font-sans">
          Preparing for success • One exam at a time
        </p>
      </div>
    </div>
  );
}
