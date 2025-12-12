// components/Menu.tsx
'use client';

import { useState, useEffect } from 'react';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Menu({ isOpen, onClose }: MenuProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [autoLocation, setAutoLocation] = useState(true);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedUnits = localStorage.getItem('units') as 'metric' | 'imperial' || 'metric';
    const savedAutoLocation = localStorage.getItem('autoLocation') !== 'false';
    
    setDarkMode(savedDarkMode);
    setUnits(savedUnits);
    setAutoLocation(savedAutoLocation);
  }, []);

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleUnitsChange = (newUnits: 'metric' | 'imperial') => {
    setUnits(newUnits);
    localStorage.setItem('units', newUnits);
    window.location.reload();
  };

  const handleAutoLocationToggle = () => {
    const newAutoLocation = !autoLocation;
    setAutoLocation(newAutoLocation);
    localStorage.setItem('autoLocation', newAutoLocation.toString());
    window.location.reload();
  };

  const handleInstall = () => {
    const installEvent = new Event('showInstallPrompt');
    window.dispatchEvent(installEvent);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="absolute right-0 top-0 h-full w-80 bg-white/95 dark:bg-kashmir-dark-neutral-100/95 backdrop-blur-xl shadow-2xl">
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-kashmir-light-blue-600 dark:text-kashmir-dark-blue-400">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-kashmir-light-neutral-100 dark:hover:bg-kashmir-dark-neutral-200 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 space-y-2">
            <div className="menu-item">
              <span className="text-sm text-kashmir-light-neutral-500 dark:text-kashmir-dark-neutral-500">Version</span>
              <p className="font-semibold text-kashmir-light-neutral-800 dark:text-kashmir-dark-neutral-200">2.0.0</p>
            </div>

            <div className="menu-item">
              <span className="text-sm text-kashmir-light-neutral-500 dark:text-kashmir-dark-neutral-500">About App</span>
              <p className="text-kashmir-light-neutral-700 dark:text-kashmir-dark-neutral-300">
                Kashmir-inspired weather app with  advanced features
              </p>
            </div>

            <div className="menu-item">
              <span className="text-sm text-kashmir-light-neutral-500 dark:text-kashmir-dark-neutral-500">About Developer</span>
              <p className="text-kashmir-light-neutral-700 dark:text-kashmir-dark-neutral-300">
                Built with ❤️ by Saffan 
              </p>
            </div>

          
<div className="menu-item">
  <span className="text-sm text-kashmir-light-neutral-500 dark:text-kashmir-dark-neutral-500">Contact Us</span>
  <div className="space-y-2">
    <p className="text-kashmir-light-neutral-700 dark:text-kashmir-dark-neutral-300">saffanakbar942@gmail.com</p>
    <div className="flex space-x-3 mt-2">
      <a href="https://www.instagram.com/saff9?igsh=MWV6d21lbjVpNXh6Yg==" target="_blank" rel="noopener noreferrer" 
         className="flex items-center space-x-1 text-kashmir-light-blue-600 dark:text-kashmir-dark-blue-400 hover:underline text-sm">
        <img src="/instagram-icon.png" alt="Instagram" className="w-4 h-4" />
        <span>Instagram</span>
      </a>
      <a href="http://www.youtube.com/@saff9" target="_blank" rel="noopener noreferrer"
         className="flex items-center space-x-1 text-kashmir-light-blue-600 dark:text-kashmir-dark-blue-400 hover:underline text-sm">
        <img src="/youtube-icon.png" alt="YouTube" className="w-4 h-4" />
        <span>YouTube</span>
      </a>
    </div>
  </div>
</div>
            

            {/* Settings */}
            <div className="menu-item">
              <span className="text-sm text-kashmir-light-neutral-500 dark:text-kashmir-dark-neutral-500">Settings</span>
              <div className="space-y-4 mt-2">
                {/* Dark Mode Toggle */}
                <div className="flex justify-between items-center">
                  <span className="text-kashmir-light-neutral-700 dark:text-kashmir-dark-neutral-300">Dark Mode</span>
                  <button
                    onClick={handleDarkModeToggle}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                      darkMode ? 'bg-kashmir-light-blue-500 dark:bg-kashmir-dark-blue-500' : 'bg-kashmir-light-neutral-300 dark:bg-kashmir-dark-neutral-400'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        darkMode ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Units Toggle */}
                <div className="flex justify-between items-center">
                  <span className="text-kashmir-light-neutral-700 dark:text-kashmir-dark-neutral-300">Units</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUnitsChange('metric')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        units === 'metric' 
                          ? 'bg-kashmir-light-blue-500 dark:bg-kashmir-dark-blue-500 text-white' 
                          : 'bg-kashmir-light-neutral-200 dark:bg-kashmir-dark-neutral-300 text-kashmir-light-neutral-700 dark:text-kashmir-dark-neutral-300'
                      }`}
                    >
                      °C
                    </button>
                    <button
                      onClick={() => handleUnitsChange('imperial')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        units === 'imperial' 
                          ? 'bg-kashmir-light-blue-500 dark:bg-kashmir-dark-blue-500 text-white' 
                          : 'bg-kashmir-light-neutral-200 dark:bg-kashmir-dark-neutral-300 text-kashmir-light-neutral-700 dark:text-kashmir-dark-neutral-300'
                      }`}
                    >
                      °F
                    </button>
                  </div>
                </div>

                {/* Auto Location Toggle */}
                <div className="flex justify-between items-center">
                  <span className="text-kashmir-light-neutral-700 dark:text-kashmir-dark-neutral-300">Auto Location</span>
                  <button
                    onClick={handleAutoLocationToggle}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                      autoLocation ? 'bg-kashmir-light-green-500 dark:bg-kashmir-dark-green-500' : 'bg-kashmir-light-neutral-300 dark:bg-kashmir-dark-neutral-400'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        autoLocation ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Install App */}
                <button
                  onClick={handleInstall}
                  className="w-full bg-kashmir-light-green-500 hover:bg-kashmir-light-green-600 dark:bg-kashmir-dark-green-500 dark:hover:bg-kashmir-dark-green-600 text-white font-semibold py-2 px-4 rounded-xl transition-colors duration-300 shadow-lg text-sm"
                >
                  📲 Install App
                </button>
              </div>
            </div>

            {/* Privacy Policy */}
            <div className="menu-item">
              <a href="/privacy" className="text-kashmir-light-blue-600 dark:text-kashmir-dark-blue-400 hover:underline font-medium flex items-center space-x-2">
                <span>📄</span>
                <span>Privacy Policy</span>
              </a>
            </div>

            {/* Disclaimer */}
            <div className="menu-item">
              <a href="/disclaimer" className="text-kashmir-light-neutral-600 dark:text-kashmir-dark-neutral-400 hover:underline">
                ⚠️ Disclaimer
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-kashmir-light-neutral-200 dark:border-kashmir-dark-neutral-300">
            <p className="text-center text-sm text-kashmir-light-neutral-500 dark:text-kashmir-dark-neutral-500">
              Made with ❄️ for Kashmir\World
            </p>
            <p className="text-center text-xs text-kashmir-light-neutral-400 dark:text-kashmir-dark-neutral-500 mt-1">
              SkyKash v2.0 • All features active
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .menu-item {
          @apply p-4 rounded-lg hover:bg-kashmir-light-neutral-100 dark:hover:bg-kashmir-dark-neutral-200 transition-colors border-b border-kashmir-light-neutral-100 dark:border-kashmir-dark-neutral-300;
        }
      `}</style>
    </div>
  );
}
