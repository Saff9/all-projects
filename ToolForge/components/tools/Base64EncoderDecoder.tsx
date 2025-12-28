'use client';

import { useState } from 'react';
import { Binary, Copy, Check, Upload, Image as ImageIcon, FileText, ArrowRightLeft } from 'lucide-react';

export default function Base64EncoderDecoder() {
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [direction, setDirection] = useState<'encode' | 'decode'>('encode');
  const [textInput, setTextInput] = useState('Hello World! 🚀 ToolForge is super fast.');
  const [textOutput, setTextOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fileDataUri, setFileDataUri] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // UTF-8 safe encode/decode
  const utf8ToBase64 = (str: string) => {
    try {
      const bytes = new TextEncoder().encode(str);
      const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
      return btoa(binString);
    } catch (e: any) {
      throw new Error('Encoding failed: ' + e.message);
    }
  };

  const base64ToUtf8 = (str: string) => {
    try {
      const binString = atob(str.trim());
      const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    } catch (e: any) {
      throw new Error('Invalid Base64 string');
    }
  };

  const handleProcess = () => {
    setError(null);
    if (!textInput.trim()) {
      setTextOutput('');
      return;
    }
    try {
      if (direction === 'encode') {
        const res = utf8ToBase64(textInput);
        setTextOutput(res);
      } else {
        const res = base64ToUtf8(textInput);
        setTextOutput(res);
      }
    } catch (e: any) {
      setError(e.message);
      setTextOutput('');
    }
  };

  // File to Base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFileDataUri(result);
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Mode & Direction Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
          <button
            onClick={() => setMode('text')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors ${
              mode === 'text'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Text Mode
          </button>
          <button
            onClick={() => setMode('file')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors ${
              mode === 'file'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Image / File Mode
          </button>
        </div>

        {mode === 'text' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setDirection(direction === 'encode' ? 'decode' : 'encode');
                setTextInput(textOutput || textInput);
                setTextOutput('');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" /> Switch to {direction === 'encode' ? 'Decode' : 'Encode'}
            </button>
          </div>
        )}
      </div>

      {mode === 'text' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>{direction === 'encode' ? 'Plain Text Input (UTF-8)' : 'Base64 Input String'}</span>
                <span className="text-[11px] font-normal text-slate-400">{textInput.length} chars</span>
              </label>
              <textarea
                rows={10}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={direction === 'encode' ? 'Type text to encode...' : 'Paste Base64 string to decode...'}
                className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-mono border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none leading-relaxed"
              />
              <button
                onClick={handleProcess}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
              >
                {direction === 'encode' ? 'Encode to Base64' : 'Decode to Plain Text'}
              </button>
            </div>

            {/* Output Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {direction === 'encode' ? 'Base64 Output' : 'Decoded Text Result'}
                </label>
                {textOutput && (
                  <button
                    onClick={() => handleCopy(textOutput)}
                    className="flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
              <textarea
                readOnly
                rows={10}
                value={textOutput}
                placeholder="Result will appear here..."
                className="w-full p-4 rounded-2xl bg-slate-950 text-emerald-400 text-xs font-mono border border-slate-800 focus:outline-none resize-none leading-relaxed"
              />
              {error && (
                <p className="text-xs text-red-500 font-mono">Error: {error}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Image / File to Base64 Mode */
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-indigo-500 transition-colors">
            <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Select or Drop an Image / File
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              PNG, JPG, SVG, WebP, GIF, or any binary file
            </p>
            <input
              type="file"
              onChange={handleFileUpload}
              className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950 dark:file:text-indigo-300 cursor-pointer"
            />
          </div>

          {fileDataUri && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Base64 Data URI ({fileDataUri.length} characters)
                </span>
                <button
                  onClick={() => handleCopy(fileDataUri)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied Data URI!' : 'Copy Data URI'}
                </button>
              </div>

              <textarea
                readOnly
                rows={5}
                value={fileDataUri}
                className="w-full p-3 bg-slate-950 text-slate-300 text-xs font-mono rounded-xl border border-slate-800 resize-none"
              />

              {fileDataUri.startsWith('data:image') && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    Live Decoded Image Preview:
                  </span>
                  <img
                    src={fileDataUri}
                    alt="Decoded preview"
                    className="max-h-48 rounded-lg shadow-sm mx-auto"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
