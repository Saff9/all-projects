'use client';

import { useState, useCallback, useRef } from 'react';
import { QrCode, Download, Copy, RefreshCw } from 'lucide-react';

export default function QrGenerator() {
  const [text, setText] = useState('');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQR = useCallback(() => {
    if (!text || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple QR-like pattern for demo (in production, use qrcode library)
    canvas.width = size;
    canvas.height = size;
    
    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
    
    // Draw pattern
    ctx.fillStyle = fgColor;
    const cellSize = size / 25;
    
    // Draw finder patterns (corners)
    const drawFinder = (x: number, y: number) => {
      ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = bgColor;
      ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = fgColor;
      ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    };
    
    drawFinder(2, 2);
    drawFinder(16, 2);
    drawFinder(2, 16);
    
    // Draw random data pattern
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        if (Math.random() > 0.5 && !((i < 9 && j < 9) || (i > 15 && j < 9) || (i < 9 && j > 15))) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }
  }, [text, size, fgColor, bgColor]);

  const downloadQR = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">QR Code Generator</h1>
            <p className="text-zinc-400">Generate QR codes for any text or URL</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl glass">
            <label className="block text-sm font-medium text-zinc-300 mb-3">
              Text or URL
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text or URL to encode..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900/50 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 resize-none"
            />
          </div>

          <div className="p-6 rounded-2xl glass space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-3">
                Size: {size}x{size}px
              </label>
              <input
                type="range"
                min={128}
                max={512}
                step={16}
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Foreground
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer"
                  />
                  <span className="text-sm text-zinc-500">{fgColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Background
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer"
                  />
                  <span className="text-sm text-zinc-500">{bgColor}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={generateQR}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all btn-lift"
          >
            <RefreshCw className="w-5 h-5" />
            Generate QR Code
          </button>
        </div>

        {/* Preview */}
        <div className="flex flex-col items-center justify-center p-8 rounded-2xl glass">
          <canvas
            ref={canvasRef}
            className="rounded-xl shadow-2xl mb-6"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          
          {text && (
            <div className="flex gap-3">
              <button
                onClick={downloadQR}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </button>
            </div>
          )}
          
          {!text && (
            <div className="text-center text-zinc-500">
              <QrCode className="w-24 h-24 mx-auto mb-4 opacity-20" />
              <p>Enter text to generate QR code</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
