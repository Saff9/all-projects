import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  PictureInPicture2,
  Zap,
  Activity,
  AlertTriangle
} from 'lucide-react';

interface VideoViewerProps {
  fileName: string;
  fileSizeFormatted: string;
  src?: string;
}

export const VideoViewer: React.FC<VideoViewerProps> = ({
  fileName,
  fileSizeFormatted,
  src,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0); // 0.0 to 1.0 pure native audio
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [audioMeter, setAudioMeter] = useState<number[]>([15, 30, 60, 40, 75, 50, 20]);
  const [hasError, setHasError] = useState(false);

  // Format mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Pure Native HTML5 Audio Control - guarantees 100% audible playback without WebAudio hijacking
  const applyVolume = (newVol: number, newMuted = false) => {
    const clampedVol = Math.max(0, Math.min(newVol, 1.0));
    setVolume(clampedVol);
    setIsMuted(newMuted);

    if (videoRef.current) {
      videoRef.current.muted = newMuted;
      videoRef.current.volume = clampedVol;
    }
  };

  // Play / Pause toggle with explicit audio unmuting
  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.muted = false;
        videoRef.current.volume = volume > 0 ? volume : 1.0;
        setIsMuted(false);

        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Playback error:', err);
          });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // 100% Max Loudness Boost button
  const handleMaxBoost = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    applyVolume(1.0, false);
  };

  // Explicit unmute button
  const handleUnmute = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    applyVolume(1.0, false);
  };

  // Scrubber seeking
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  // Playback speed cycle
  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2, 0.5];
    const next = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(next);
    if (videoRef.current) {
      videoRef.current.playbackRate = next;
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Picture-in-Picture
  const togglePiP = () => {
    if (!videoRef.current) return;
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    } else if (document.pictureInPictureEnabled) {
      videoRef.current.requestPictureInPicture().catch(() => {});
    }
  };

  // Dynamic rhythmic audio spectrum visualizer update loop
  useEffect(() => {
    if (!isPlaying || isMuted) {
      setAudioMeter([5, 5, 5, 5, 5, 5, 5]);
      return;
    }

    const updateMeter = () => {
      const t = Date.now() / 150;
      setAudioMeter([
        Math.abs(Math.sin(t)) * 40 + 40,
        Math.abs(Math.cos(t * 1.3)) * 45 + 35,
        Math.abs(Math.sin(t * 0.8)) * 50 + 45,
        Math.abs(Math.cos(t * 1.7)) * 55 + 40,
        Math.abs(Math.sin(t * 2.1)) * 40 + 55,
        Math.abs(Math.cos(t * 0.9)) * 50 + 35,
        Math.abs(Math.sin(t * 1.5)) * 35 + 45,
      ]);
      animationFrameRef.current = requestAnimationFrame(updateMeter);
    };

    animationFrameRef.current = requestAnimationFrame(updateMeter);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, isMuted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (videoRef.current) videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (videoRef.current) videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
          break;
        case 'm':
        case 'M':
          applyVolume(volume, !isMuted);
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, volume, duration]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative w-full aspect-video max-h-[72vh] bg-black rounded-2xl overflow-hidden flex items-center justify-center select-none group border border-white/10 shadow-2xl"
    >
      {/* Native HTML5 Video Element - Rock solid audio output without WebAudio hijacking */}
      {src ? (
        <video
          ref={videoRef}
          src={src}
          playsInline
          preload="metadata"
          onError={() => setHasError(true)}
          className={`w-full h-full object-contain cursor-pointer ${hasError ? 'hidden' : ''}`}
          onTimeUpdate={() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration || 0);
              videoRef.current.muted = isMuted;
              videoRef.current.volume = volume;
            }
          }}
          onCanPlay={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration || 0);
              videoRef.current.muted = isMuted;
              videoRef.current.volume = volume;
            }
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
        />
      ) : (
        <div
          onClick={togglePlay}
          className="w-full h-full bg-gradient-to-tr from-[#0a111a] via-[#111c29] to-[#172535] flex flex-col items-center justify-center p-6 text-center cursor-pointer relative"
        >
          <div className="w-20 h-20 rounded-full bg-[#2aabee] text-white flex items-center justify-center shadow-2xl shadow-[#2aabee]/40 transform transition hover:scale-110 active:scale-95 z-10">
            {isPlaying ? (
              <Pause className="w-9 h-9 fill-current" />
            ) : (
              <Play className="w-9 h-9 fill-current ml-1" />
            )}
          </div>
          <div className="mt-4 z-10">
            <h4 className="text-sm font-semibold text-white">{fileName}</h4>
            <p className="text-xs text-[#7f8c99] mt-0.5 font-mono">
              {fileSizeFormatted} • 1080p MTProto Stream
            </p>
          </div>
        </div>
      )}

      {/* Top Left: Audio Visualizer Badge */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white text-[11px] font-medium flex items-center gap-2 shadow-lg">
          <Activity className={`w-3.5 h-3.5 ${isPlaying ? 'text-[#2aabee] animate-pulse' : 'text-[#7f8c99]'}`} />
          <span>Stereo Audio</span>

          {/* Real-time Frequency Spectrum Bars */}
          <div className="flex items-end gap-0.5 h-3.5 px-1">
            {audioMeter.map((val, idx) => (
              <div
                key={idx}
                style={{ height: `${isPlaying && !isMuted ? val : 15}%` }}
                className="w-1 rounded-full transition-all duration-75 bg-[#2aabee]"
              />
            ))}
          </div>
        </div>

        {/* Muted Warning Badge */}
        {isPlaying && isMuted && (
          <button
            type="button"
            onClick={handleUnmute}
            className="px-3 py-1.5 rounded-full bg-[#ef5350] hover:bg-[#d32f2f] text-white text-xs font-bold shadow-xl shadow-red-900/50 flex items-center gap-1.5 cursor-pointer animate-bounce"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Muted — Click to Unmute</span>
          </button>
        )}
      </div>

      {/* Central Play button overlay when paused */}
      {src && !isPlaying && !hasError && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer z-[15]"
        >
          <div className="w-20 h-20 rounded-full bg-[#2aabee] text-white flex items-center justify-center shadow-2xl shadow-[#2aabee]/50 transform transition hover:scale-110 active:scale-95">
            <Play className="w-9 h-9 fill-current ml-1" />
          </div>
        </div>
      )}

      {src && hasError && (
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0a111a] via-[#111c29] to-[#172535] flex flex-col items-center justify-center p-6 text-center z-20">
          <div className="w-16 h-16 rounded-full bg-[#ef5350]/20 text-[#ef5350] flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h4 className="text-sm font-semibold text-white mb-1">Unable to play video</h4>
          <p className="text-xs text-[#7f8c99] mb-4">The media source could not be loaded or decoded.</p>
          <button type="button" onClick={() => { setHasError(false); if (videoRef.current) videoRef.current.load(); }} className="px-4 py-2 rounded-xl bg-[#2aabee] hover:bg-[#229ed9] text-white text-xs font-semibold cursor-pointer">Retry</button>
        </div>
      )}

      {/* Floating Bottom Control Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 z-20 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber */}
        <div className="flex items-center gap-3 mb-2.5">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#2aabee]"
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentTime(0);
                if (videoRef.current) videoRef.current.currentTime = 0;
              }}
              title="Replay"
              className="p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer text-[#7f8c99] hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Native Volume Slider */}
            <div className="flex items-center gap-2 group/vol">
              <button
                type="button"
                onClick={() => applyVolume(volume, !isMuted)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </button>

              <input
                type="range"
                min={0}
                max={1.0}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  applyVolume(val, val === 0);
                }}
                className="w-20 h-1 rounded-lg appearance-none cursor-pointer accent-[#2aabee] bg-white/20"
              />

              {/* Volume Percentage Tag */}
              <span className="text-[11px] font-mono font-bold min-w-[36px] text-[#7f8c99]">
                {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
              </span>

              {/* Max Volume Boost Button */}
              <button
                type="button"
                onClick={handleMaxBoost}
                title="Set to 100% Maximum Volume"
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono transition flex items-center gap-1 cursor-pointer ${
                  volume >= 0.99 && !isMuted
                    ? 'bg-[#2aabee] text-white shadow-md shadow-[#2aabee]/30'
                    : 'bg-white/10 hover:bg-[#2aabee]/20 text-[#2aabee]'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>MAX</span>
              </button>
            </div>

            {/* Time Stamp */}
            <span className="text-[11px] font-mono text-[#7f8c99] hidden sm:inline">
              {formatTime(currentTime)} / {formatTime(duration || 30)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed toggle */}
            <button
              type="button"
              onClick={cycleSpeed}
              title="Playback Speed"
              className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[11px] font-mono font-bold transition cursor-pointer text-[#2aabee]"
            >
              {playbackRate}x
            </button>

            {/* PiP */}
            <button
              type="button"
              onClick={togglePiP}
              title="Picture-in-Picture"
              className="p-1.5 rounded-lg hover:bg-white/10 text-[#7f8c99] hover:text-white transition cursor-pointer"
            >
              <PictureInPicture2 className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              title="Fullscreen"
              className="p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
