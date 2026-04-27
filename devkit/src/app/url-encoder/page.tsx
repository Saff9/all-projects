'use client';

import { useState, useCallback } from 'react';
import TextArea from '@/components/TextArea';

export default function UrlEncoder() {
  const [text, setText] = useState('');
  const [encoded, setEncoded] = useState('');
  const [error, setError] = useState('');

  const encode = useCallback(() => {
    try {
      if (!text) {
        setEncoded('');
        setError('');
        return;
      }
      const result = encodeURIComponent(text);
      setEncoded(result);
      setError('');
    } catch (err) {
      setError(`Encoding failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [text]);

  const decode = useCallback(() => {
    try {
      if (!encoded) {
        setText('');
        setError('');
        return;
      }
      const result = decodeURIComponent(encoded);
      setText(result);
      setError('');
    } catch (err) {
      setError(`Decoding failed: ${err instanceof Error ? err.message : 'Invalid URL encoding'}`);
    }
  }, [encoded]);

  const encodeFull = useCallback(() => {
    try {
      if (!text) {
        setEncoded('');
        setError('');
        return;
      }
      const result = encodeURI(text);
      setEncoded(result);
      setError('');
    } catch (err) {
      setError(`Encoding failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [text]);

  const decodeFull = useCallback(() => {
    try {
      if (!encoded) {
        setText('');
        setError('');
        return;
      }
      const result = decodeURI(encoded);
      setText(result);
      setError('');
    } catch (err) {
      setError(`Decoding failed: ${err instanceof Error ? err.message : 'Invalid URL encoding'}`);
    }
  }, [encoded]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          URL Encoder/Decoder
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Encode and decode URL parameters and full URLs.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={encode}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Encode Component →
        </button>
        <button
          onClick={decode}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ← Decode Component
        </button>
        <button
          onClick={encodeFull}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Encode Full URL →
        </button>
        <button
          onClick={decodeFull}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          ← Decode Full URL
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TextArea
          label="Text"
          value={text}
          onChange={setText}
          placeholder="Enter text to encode..."
          rows={15}
        />
        <TextArea
          label="URL Encoded"
          value={encoded}
          onChange={setEncoded}
          placeholder="Enter URL encoded text to decode..."
          rows={15}
        />
      </div>
    </div>
  );
}
