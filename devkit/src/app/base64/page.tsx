'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import TextArea from '@/components/TextArea';

export default function Base64Tool() {
  const [text, setText] = useState('');
  const [base64, setBase64] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [isUrlSafe, setIsUrlSafe] = useState(false);
  const [isValidBase64, setIsValidBase64] = useState<boolean | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [batchInput, setBatchInput] = useState<string[]>(['']);
  const [batchResults, setBatchResults] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
  const [customAlphabet, setCustomAlphabet] = useState('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const encode = useCallback(() => {
    try {
      if (!text) {
        setBase64('');
        setError('');
        return;
      }
      let encoded: string;
      if (isUrlSafe) {
        encoded = btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      } else {
        encoded = btoa(text);
      }
      setBase64(encoded);
      setError('');
      setIsValidBase64(null);
    } catch (err) {
      setError('Encoding failed: Input contains non-ASCII characters. Use Unicode encoding.');
    }
  }, [text, isUrlSafe]);

  const decode = useCallback(() => {
    try {
      if (!base64) {
        setText('');
        setError('');
        setImagePreview(null);
        setIsValidBase64(null);
        return;
      }
      const decoded = atob(base64);
      setText(decoded);
      setError('');
      setIsValidBase64(true);
      
      // Try to preview as image
      try {
        const dataUrl = isUrlSafe 
          ? `data:image/png;base64,${base64.replace(/-/g, '+').replace(/_/g, '/')}`
          : `data:image/png;base64,${base64}`;
        setImagePreview(dataUrl);
      } catch {
        setImagePreview(null);
      }
    } catch (err) {
      setError('Decoding failed: Invalid Base64 string');
      setIsValidBase64(false);
      setImagePreview(null);
    }
  }, [base64, isUrlSafe]);

  const encodeUnicode = useCallback(() => {
    try {
      if (!text) {
        setBase64('');
        setError('');
        return;
      }
      const encoded = btoa(encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
      setBase64(isUrlSafe ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : encoded);
      setError('');
      setIsValidBase64(null);
    } catch (err) {
      setError('Encoding failed');
    }
  }, [text, isUrlSafe]);

  const decodeUnicode = useCallback(() => {
    try {
      if (!base64) {
        setText('');
        setError('');
        return;
      }
      const decoded = decodeURIComponent(atob(base64.replace(/-/g, '+').replace(/_/g, '/')).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      setText(decoded);
      setError('');
      setIsValidBase64(true);
    } catch (err) {
      setError('Decoding failed: Invalid Base64 string');
      setIsValidBase64(false);
    }
  }, [base64]);

  const validateBase64 = useCallback((value: string) => {
    try {
      if (!value.trim()) {
        setIsValidBase64(null);
        return;
      }
      // Check for valid Base64 characters
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      const isValid = base64Regex.test(value.replace(/-/g, '+').replace(/_/g, '/'));
      setIsValidBase64(isValid);
      if (isValid) {
        atob(value.replace(/-/g, '+').replace(/_/g, '/'));
      }
    } catch {
      setIsValidBase64(false);
    }
  }, []);

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setBase64(result.split(',')[1]);
      setMode('decode');
      setError('');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Batch processing
  const addBatchInput = () => {
    setBatchInput([...batchInput, '']);
  };

  const removeBatchInput = (index: number) => {
    setBatchInput(batchInput.filter((_, i) => i !== index));
  };

  const updateBatchInput = (index: number, value: string) => {
    const newInput = [...batchInput];
    newInput[index] = value;
    setBatchInput(newInput);
  };

  const processBatch = useCallback(() => {
    const results = batchInput.map(item => {
      if (!item.trim()) return '';
      try {
        if (mode === 'encode') {
          return isUrlSafe 
            ? btoa(item).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
            : btoa(item);
        } else {
          return atob(item.replace(/-/g, '+').replace(/_/g, '/'));
        }
      } catch {
        return 'ERROR';
      }
    });
    setBatchResults(results);
  }, [batchInput, mode, isUrlSafe]);

  useEffect(() => {
    if (activeTab === 'single') {
      if (mode === 'encode' && text) encode();
      else if (mode === 'decode' && base64) {
        decode();
        validateBase64(base64);
      }
    }
  }, [text, base64, mode, isUrlSafe, activeTab]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Base64 Encoder/Decoder
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Encode and decode Base64 strings. Supports both ASCII and Unicode text.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('single')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'single'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Single
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'batch'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Batch
        </button>
      </div>

      {activeTab === 'single' ? (
        <>
          {/* Options */}
          <div className="flex flex-wrap gap-2 mb-6">
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isUrlSafe}
                onChange={(e) => setIsUrlSafe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-900 dark:text-white text-sm">URL Safe (Base64URL)</span>
            </label>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              📁 Upload File
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Image Preview</h3>
              <img 
                src={imagePreview} 
                alt="Base64 Preview" 
                className="max-w-xs rounded-lg border border-gray-200 dark:border-gray-700"
                onError={() => setImagePreview(null)}
              />
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = imagePreview;
                  link.download = 'decoded-image.png';
                  link.click();
                }}
                className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Download Image
              </button>
            </div>
          )}

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="mb-6 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Drag and drop a file here to encode it as Base64
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setMode('encode')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                mode === 'encode'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Encode
            </button>
            <button
              onClick={() => setMode('decode')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                mode === 'decode'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Decode
            </button>
            <button
              onClick={encodeUnicode}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Encode Unicode →
            </button>
            <button
              onClick={decodeUnicode}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ← Decode Unicode
            </button>
            {isValidBase64 !== null && (
              <span className={`px-4 py-2 rounded-lg text-sm ${
                isValidBase64 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}>
                {isValidBase64 ? '✓ Valid Base64' : '✗ Invalid Base64'}
              </span>
            )}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TextArea
              label={mode === 'encode' ? 'Text' : 'Base64'}
              value={mode === 'encode' ? text : base64}
              onChange={mode === 'encode' ? setText : setBase64}
              placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
              rows={15}
            />
            <div>
              <TextArea
                label={mode === 'encode' ? 'Base64 Output' : 'Text Output'}
                value={mode === 'encode' ? base64 : text}
                onChange={mode === 'encode' ? setBase64 : setText}
                placeholder={mode === 'encode' ? 'Base64 output will appear here...' : 'Decoded text will appear here...'}
                rows={15}
              />
              {(base64 || text) && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => copyToClipboard(base64 || text)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Copy Output
                  </button>
                  <button
                    onClick={() => {
                      setBase64('');
                      setText('');
                      setImagePreview(null);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Batch Mode */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setMode('encode')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  mode === 'encode'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Encode
              </button>
              <button
                onClick={() => setMode('decode')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  mode === 'decode'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Decode
              </button>
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUrlSafe}
                  onChange={(e) => setIsUrlSafe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-900 dark:text-white text-sm">URL Safe</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addBatchInput}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                + Add Line
              </button>
              <button
                onClick={processBatch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Process All
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {batchInput.map((input, index) => (
              <div key={index} className="flex gap-2 items-start">
                <span className="px-2 py-2 text-sm text-gray-500 w-8">{index + 1}.</span>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => updateBatchInput(index, e.target.value)}
                  placeholder={mode === 'encode' ? `Enter text ${index + 1}...` : `Enter Base64 ${index + 1}...`}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                />
                {batchInput.length > 1 && (
                  <button
                    onClick={() => removeBatchInput(index)}
                    className="px-2 py-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {batchResults.length > 0 && (
            <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Results</h3>
                <button
                  onClick={() => copyToClipboard(batchResults.join('\n'))}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Copy All
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-auto">
                {batchResults.map((result, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-xs text-gray-500 w-8">{index + 1}.</span>
                    <code className="flex-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-900 dark:text-white break-all">
                      {result || '(empty)'}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
