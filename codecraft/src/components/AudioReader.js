// src/components/AudioReader.js
'use client';
import { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaStop, FaVolumeUp } from 'react-icons/fa';

export default function AudioReader({ text }) {
  const [voices, setVoices] = useState([]);
  const [gender, setGender] = useState('female');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const updateVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const engVoices = allVoices.filter(v => v.lang.startsWith('en'));
      setVoices(engVoices.length > 0 ? engVoices : allVoices);
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getSelectedVoice = () => {
    if (voices.length === 0) return null;

    const femaleKeywords = ['female', 'aria', 'jenny', 'samantha', 'zira', 'karen', 'victoria', 'hazel', 'catherine', 'lisa', 'susan'];
    const maleKeywords = ['male', 'guy', 'christopher', 'david', 'george', 'mark', 'alex', 'daniel', 'arthur', 'brian', 'james'];

    const keywords = gender === 'female' ? femaleKeywords : maleKeywords;

    // 1. Try to find a Natural/Online neural voice matching gender keywords
    const naturalVoice = voices.find(v => 
      v.name.toLowerCase().includes('natural') && 
      keywords.some(k => v.name.toLowerCase().includes(k))
    );
    if (naturalVoice) return naturalVoice;

    // 2. Try to find any voice matching gender keywords
    const genderVoice = voices.find(v => 
      keywords.some(k => v.name.toLowerCase().includes(k))
    );
    if (genderVoice) return genderVoice;

    // 3. Fallback to first available voice
    return voices[0];
  };

  const handlePlay = () => {
    if (!window.speechSynthesis) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[#*`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const selectedVoice = getSelectedVoice();
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Optimize pitch and rate for premium natural feel
    utterance.rate = 0.95;
    utterance.pitch = gender === 'female' ? 1.05 : 0.95;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const toggleGender = (newGender) => {
    if (newGender === gender) return;
    setGender(newGender);
    if (isPlaying || isPaused) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 bg-craft-deep border border-craft-border px-4 py-2.5 rounded-2xl shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold text-craft-muted pr-3 border-r border-craft-border">
        <FaVolumeUp className="text-craft-primary animate-pulse text-sm" />
        <span className="hidden sm:inline font-mono uppercase tracking-wider">AI Reader</span>
      </div>

      {/* Gender Selection Toggle */}
      <div className="flex items-center gap-1 bg-craft-surface p-1 rounded-xl border border-craft-border">
        <button
          onClick={() => toggleGender('female')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
            gender === 'female' 
              ? 'bg-craft-primary text-white shadow-sm' 
              : 'text-craft-muted hover:text-craft-text'
          }`}
          title="Female Premium Voice"
        >
          <span>👩</span>
          <span>Female</span>
        </button>
        <button
          onClick={() => toggleGender('male')}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
            gender === 'male' 
              ? 'bg-craft-primary text-white shadow-sm' 
              : 'text-craft-muted hover:text-craft-text'
          }`}
          title="Male Premium Voice"
        >
          <span>👨</span>
          <span>Male</span>
        </button>
      </div>

      {/* Play / Pause / Stop Controls */}
      <div className="flex items-center gap-2 pl-1">
        {!isPlaying ? (
          <button
            onClick={handlePlay}
            className="p-2.5 bg-craft-primary hover:bg-craft-primary/90 text-white rounded-xl shadow-sm hover:scale-105 transition-all duration-200 cursor-pointer"
            title={isPaused ? "Resume" : "Listen"}
          >
            <FaPlay className="text-xs" />
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="p-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-sm hover:scale-105 transition-all duration-200 cursor-pointer"
            title="Pause"
          >
            <FaPause className="text-xs" />
          </button>
        )}

        {(isPlaying || isPaused) && (
          <button
            onClick={handleStop}
            className="p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-sm hover:scale-105 transition-all duration-200 cursor-pointer"
            title="Stop"
          >
            <FaStop className="text-xs" />
          </button>
        )}
      </div>

      {/* Animated Sound Wave Indicator */}
      {isPlaying && (
        <div className="flex items-center gap-1 pl-2">
          <span className="w-1 h-3 bg-craft-mint rounded-full animate-pulse" />
          <span className="w-1 h-4 bg-craft-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <span className="w-1 h-2 bg-craft-glow rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      )}
    </div>
  );
}
