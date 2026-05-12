// src/components/LoadingSpinner.tsx
"use client";

import { useState, useEffect } from "react";

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  message = 'Loading...', 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const [dots, setDots] = useState('.');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '.';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Main spinner */}
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-full border-2 border-gray-200`} />
        <div className={`absolute top-0 left-0 ${sizeClasses[size]} rounded-full border-2 border-transparent border-t-[#003580] animate-spin`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-[#f7941d] rounded-full animate-pulse" />
        </div>
      </div>
      
      {/* Loading message */}
      <div className={`text-gray-600 font-sans ${textSizeClasses[size]} animate-fade-in`}>
        {message}{dots}
      </div>
      
      {/* Additional visual elements */}
      <div className="flex gap-1">
        <div className="w-1 h-1 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
        <div className="w-1 h-1 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
        <div className="w-1 h-1 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100">
          {content}
        </div>
      </div>
    );
  }

  return content;
}