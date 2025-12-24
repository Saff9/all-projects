import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Image as ImageIcon,
  Move
} from 'lucide-react';

interface ImageViewerProps {
  fileName: string;
  fileSizeFormatted: string;
  src?: string;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  fileName,
  fileSizeFormatted,
  src,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isFitMode, setIsFitMode] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, initialPanX: 0, initialPanY: 0 });

  // Zoom helpers
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 4));
    setIsFitMode(false);
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(Number((prev - 0.25).toFixed(2)), 0.5);
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
    setIsFitMode(true);
  };

  const toggleFitMode = () => {
    if (isFitMode) {
      setIsFitMode(false);
      setZoom(1.5);
    } else {
      handleReset();
    }
  };

  // Double-click toggle
  const handleDoubleClick = () => {
    if (zoom === 1) {
      setZoom(2);
      setIsFitMode(false);
    } else {
      handleReset();
    }
  };

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((prev) => Math.min(Number((prev + 0.15).toFixed(2)), 4));
      setIsFitMode(false);
    } else {
      setZoom((prev) => {
        const next = Math.max(Number((prev - 0.15).toFixed(2)), 0.5);
        if (next <= 1) setPan({ x: 0, y: 0 });
        return next;
      });
    }
  }, []);

  // Pan / Drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: pan.x,
      initialPanY: pan.y,
    };
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPan({
        x: dragStartRef.current.initialPanX + dx,
        y: dragStartRef.current.initialPanY + dy,
      });
    },
    [isDragging]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`relative w-full h-[72vh] bg-[#0c121b] rounded-2xl overflow-hidden flex items-center justify-center select-none border border-white/5 ${
        zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
      }`}
    >
      {/* Visual Canvas Area */}
      <div
        onMouseDown={zoom > 1 ? handleMouseDown : undefined}
        onDoubleClick={handleDoubleClick}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
          transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
        }}
        className="w-full h-full flex items-center justify-center p-2 sm:p-4"
      >
        {src ? (
          <img
            src={src}
            alt={fileName}
            draggable={false}
            className={`transition-all duration-150 rounded-xl shadow-2xl shadow-black/80 ${
              isFitMode
                ? 'max-w-full max-h-[68vh] w-auto h-auto object-contain'
                : 'max-w-none max-h-none object-contain'
            }`}
          />
        ) : (
          <div className="w-[420px] max-w-full h-[300px] rounded-2xl bg-gradient-to-tr from-[#132030] via-[#1c2e42] to-[#253c55] border border-white/10 shadow-2xl flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#2aabee]/15 text-[#2aabee] flex items-center justify-center mb-3">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-semibold text-white truncate max-w-xs">{fileName}</h4>
            <p className="text-xs text-[#7f8c99] mt-1 font-mono">
              {fileSizeFormatted} • Decrypted High-Resolution Photo
            </p>
            <div className="mt-4 px-3 py-1 rounded-full bg-[#4fae4e]/15 text-[#4fae4e] text-[11px] font-semibold">
              AES-256 Authenticated
            </div>
          </div>
        )}
      </div>

      {/* Pan hint when zoomed in */}
      {zoom > 1 && (
        <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] text-[#7f8c99] flex items-center gap-1.5 pointer-events-none z-10">
          <Move className="w-3.5 h-3.5 text-[#2aabee]" />
          <span>Drag to pan image</span>
        </div>
      )}

      {/* Telegram Floating Lightbox Controls Pill */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[#17212b]/95 border border-white/10 shadow-2xl shadow-black/80 backdrop-blur-md flex items-center gap-2.5 text-white text-xs z-20">
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out (Scroll Down)"
          className="p-1 rounded-lg hover:bg-white/10 transition cursor-pointer text-[#7f8c99] hover:text-white"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span className="font-mono text-[11px] text-[#2aabee] min-w-[42px] text-center font-bold">
          {Math.round(zoom * 100)}%
        </span>

        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In (Scroll Up)"
          className="p-1 rounded-lg hover:bg-white/10 transition cursor-pointer text-[#7f8c99] hover:text-white"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-px h-3.5 bg-white/10" />

        <button
          type="button"
          onClick={toggleFitMode}
          title={isFitMode ? 'View Actual Size (100%)' : 'Fit to Window'}
          className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition cursor-pointer ${
            isFitMode
              ? 'bg-[#2aabee]/20 text-[#2aabee] border border-[#2aabee]/30'
              : 'bg-white/10 text-white'
          }`}
        >
          {isFitMode ? 'Fit' : '1:1'}
        </button>

        <button
          type="button"
          onClick={handleRotate}
          title="Rotate 90°"
          className="p-1 rounded-lg hover:bg-white/10 transition cursor-pointer text-[#7f8c99] hover:text-white"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleReset}
          title="Reset Zoom & Position"
          className="p-1 rounded-lg hover:bg-white/10 transition cursor-pointer text-[#7f8c99] hover:text-white"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
