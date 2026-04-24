'use client';

import { useState, useCallback, useRef } from 'react';
import BackButton from '@/components/BackButton';
import Breadcrumbs from '@/components/Breadcrumbs';
import { sanitizeBase64 } from '@/utils/security';
import { Image, Upload, Copy, Check, Download, RefreshCw, Eye, FileImage } from 'lucide-react';

export default function Base64ImageConverter() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFile = useCallback((file: File) => {
    setError('');
    setFileName(file.name);
    setFileSize(file.size);

    if (mode === 'encode') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const base64WithoutPrefix = base64.replace(/^data:image\/\w+;base64,/, '');
        setOutput(base64WithoutPrefix);
        setImagePreview(base64);
      };
      reader.onerror = () => {
        setError('Error reading file');
      };
      reader.readAsDataURL(file);
    } else {
      // For decode mode, read as text
      const reader = new FileReader();
      reader.onload = (e) => {
        setInput(e.target?.result as string);
      };
      reader.onerror = () => {
        setError('Error reading file');
      };
      reader.readAsText(file);
    }
  }, [mode]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    setError('');
    
    if (mode === 'decode' && value.trim()) {
      const sanitized = sanitizeBase64(value);
      const dataUrl = `data:image/png;base64,${sanitized}`;
      setImagePreview(dataUrl);
      setOutput(sanitized);
    }
  }, [mode]);

  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const downloadOutput = useCallback(() => {
    if (mode === 'decode' && output) {
      const blob = new Blob([output], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName || 'image'}.base64.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (mode === 'encode' && imagePreview) {
      const a = document.createElement('a');
      a.href = imagePreview;
      a.download = fileName || 'image.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }, [mode, output, imagePreview, fileName]);

  const clearAll = useCallback(() => {
    setInput('');
    setOutput('');
    setImagePreview(null);
    setFileName('');
    setFileSize(0);
    setError('');
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        if (item.types.some(type => type.startsWith('image/'))) {
          const blob = await item.getType(item.types.find(type => type.startsWith('image/'))!);
          handleFile(new File([blob], 'clipboard-image.png', { type: blob.type }));
          return;
        }
      }
      setError('No image found in clipboard');
    } catch {
      setError('Unable to read from clipboard');
    }
  }, [handleFile]);

  return (
    <div className="max-w-6xl mx-auto">
      <Breadcrumbs />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Image className="w-8 h-8 text-orange-400" />
            Base64 Image Converter
          </h1>
          <p className="text-gray-400">
            Convert images to Base64 and vice versa
          </p>
        </div>
        <BackButton />
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setMode('encode');
            clearAll();
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'encode'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          Image → Base64
        </button>
        <button
          onClick={() => {
            setMode('decode');
            clearAll();
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'decode'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          Base64 → Image
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {mode === 'encode' ? 'Upload Image' : 'Base64 Input'}
            </h3>
            {fileName && (
              <span className="text-sm text-zinc-400">{formatBytes(fileSize)}</span>
            )}
          </div>

          {mode === 'encode' ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-zinc-700 hover:border-zinc-600'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Upload image"
              />
              <Upload className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
              <p className="text-zinc-400 mb-2">
                Drag & drop an image or click to browse
              </p>
              <p className="text-sm text-zinc-500">
                Supports PNG, JPG, GIF, WebP, SVG
              </p>
              <button
                onClick={handlePaste}
                className="mt-4 px-4 py-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Paste from Clipboard
              </button>
            </div>
          ) : (
            <textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste Base64 string here..."
              className="w-full h-64 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono text-sm resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          )}
        </div>

        {/* Output Section */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {mode === 'encode' ? 'Base64 Output' : 'Image Preview'}
            </h3>
            <div className="flex gap-2">
              {output && (
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 transition-colors"
                  aria-label="Copy to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
              {output && (
                <button
                  onClick={downloadOutput}
                  className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 transition-colors"
                  aria-label="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
              {output && (
                <button
                  onClick={clearAll}
                  className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 transition-colors"
                  aria-label="Clear"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-4">
              <div className="relative rounded-lg overflow-hidden bg-zinc-900">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-64 mx-auto object-contain"
                />
              </div>
            </div>
          )}

          {/* Base64 Output */}
          {mode === 'encode' && output && (
            <div className="relative">
              <textarea
                value={output}
                readOnly
                className="w-full h-64 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono text-xs resize-none"
              />
            </div>
          )}

          {!imagePreview && !output && (
            <div className="h-64 flex flex-col items-center justify-center text-zinc-500">
              <Eye className="w-12 h-12 mb-4 opacity-50" />
              <p>{mode === 'encode' ? 'Upload an image to convert' : 'Paste Base64 to preview'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Info */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4">
          <h4 className="text-sm font-medium text-zinc-400 mb-2">Quick Tips</h4>
          <ul className="text-xs text-zinc-500 space-y-1">
            <li>• Base64 increases size by ~33%</li>
            <li>• Great for inline images in CSS/HTML</li>
            <li>• Use in data URIs for quick embedding</li>
          </ul>
        </div>
        <div className="glass rounded-xl p-4">
          <h4 className="text-sm font-medium text-zinc-400 mb-2">Data URI Format</h4>
          <code className="text-xs text-zinc-500 block">
            data:image/png;base64,{'{data}'}
          </code>
        </div>
        <div className="glass rounded-xl p-4">
          <h4 className="text-sm font-medium text-zinc-400 mb-2">Max File Size</h4>
          <p className="text-xs text-zinc-500">
            Recommended: Under 5MB for best performance
          </p>
        </div>
      </div>
    </div>
  );
}
