import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Music,
  RotateCcw
} from 'lucide-react';

interface AudioViewerProps {
  fileName: string;
  fileSizeFormatted: string;
  src?: string;
}

export const AudioViewer: React.FC<AudioViewerProps> = ({
  fileName,
  fileSizeFormatted,
  src,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(214); // default fallback
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [hasError, setHasError] = useState(false);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.muted = false;
        audioRef.current.volume = 1.0;
        setIsMuted(false);
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const next = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(next);
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (audioRef.current) {
      audioRef.current.muted = next;
      audioRef.current.volume = next ? 0 : volume;
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  // Fallback demo timer if no src is supplied
  useEffect(() => {
    let interval: any;
    if (!src && isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => (prev >= duration ? 0 : prev + 1));
      }, 1000 / playbackRate);
    }
    return () => clearInterval(interval);
  }, [isPlaying, src, duration, playbackRate]);

  // Generate 48 waveform bar heights
  const waveformHeights = [
    25, 40, 65, 80, 50, 30, 75, 95, 60, 45, 85, 100, 70, 40, 55, 90, 65, 35, 80,
    95, 50, 30, 60, 85, 40, 20, 70, 90, 60, 45, 80, 95, 65, 35, 55, 75, 50, 30,
    65, 90, 55, 40, 80, 70, 45, 30, 50, 25,
  ];

  return (
    <div className="w-full p-6 rounded-2xl bg-[#0e1621] border border-white/5 flex flex-col items-center justify-center space-y-6 select-none">
      {/* Hidden native audio element */}
      {src && (
        <audio
          ref={audioRef}
          src={src}
          onError={() => setHasError(true)}
          onTimeUpdate={() => {
            if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (audioRef.current && audioRef.current.duration) {
              setDuration(audioRef.current.duration);
            }
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Album / Audio Avatar */}
      <div className="relative">
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-[#2aabee] via-[#54a9eb] to-[#7b1fa2] flex items-center justify-center shadow-2xl shadow-[#2aabee]/20">
          <Music className="w-12 h-12 text-white" />
        </div>
        {isPlaying && (
          <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-[#4fae4e] text-black text-[10px] font-bold shadow-md animate-pulse">
            PLAYING
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="text-center">
        <h3 className="text-base font-bold text-white max-w-sm truncate">{fileName}</h3>
        <p className="text-xs text-[#7f8c99] mt-1 font-mono">
          {fileSizeFormatted} • Lossless Audio Stream (320 kbps)
        </p>
        {hasError && (
          <p className="text-xs text-[#ef5350] mt-2 font-semibold">
            Unable to play audio. The source could not be loaded.
          </p>
        )}
      </div>

      {/* Telegram Waveform Scrubber */}
      <div className="w-full max-w-md space-y-2">
        <div className="h-14 flex items-center justify-between gap-1 px-3 py-2 rounded-xl bg-[#17212b] border border-white/5">
          {waveformHeights.map((h, i) => {
            const barProgress = (i / waveformHeights.length) * duration;
            const isPassed = barProgress <= currentTime;

            return (
              <div
                key={i}
                onClick={() => handleSeek(barProgress)}
                style={{ height: `${h}%` }}
                className={`w-1 rounded-full cursor-pointer transition-all duration-150 ${
                  isPassed
                    ? 'bg-[#2aabee]'
                    : 'bg-white/20 hover:bg-white/40'
                }`}
              />
            );
          })}
        </div>

        {/* Time Bar */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[#7f8c99] px-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Telegram-style Playback Bar */}
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => handleSeek(0)}
          title="Restart"
          className="p-2.5 rounded-xl bg-[#17212b] hover:bg-white/10 text-[#7f8c99] hover:text-white transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={togglePlay}
          className="w-14 h-14 rounded-full bg-[#2aabee] hover:bg-[#229ed9] text-white flex items-center justify-center shadow-lg shadow-[#2aabee]/30 transition transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={cycleSpeed}
          title="Change playback speed"
          className="px-3 py-2 rounded-xl bg-[#17212b] hover:bg-white/10 text-xs font-mono font-bold text-[#2aabee] transition cursor-pointer"
        >
          {playbackRate}X
        </button>

        <div className="flex items-center gap-2">
          <button type="button" onClick={toggleMute} className="p-2.5 rounded-xl bg-[#17212b] hover:bg-white/10 text-[#7f8c99] hover:text-white transition cursor-pointer">
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setVolume(val);
              setIsMuted(val === 0);
              if (audioRef.current) {
                audioRef.current.volume = val;
                audioRef.current.muted = val === 0;
              }
            }}
            className="w-20 h-1 rounded-lg appearance-none cursor-pointer accent-[#2aabee] bg-white/20"
          />
        </div>
      </div>
    </div>
  );
};
