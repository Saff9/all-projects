'use client';

import { useState, useCallback } from 'react';
import TextArea from '@/components/TextArea';
import { Code, FileCode, ArrowRightLeft } from 'lucide-react';

export default function HtmlEncoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const encodeHtml = useCallback((text: string) => {
    return text
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }, []);

  const decodeHtml = useCallback((text: string) => {
    return text
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/'/g, "'")
      .replace(/&nbsp;/g, ' ');
  }, []);

  const process = useCallback(() => {
    if (!input) {
      setOutput('');
      return;
    }
    const result = mode === 'encode' ? encodeHtml(input) : decodeHtml(input);
    setOutput(result);
  }, [input, mode, encodeHtml, decodeHtml]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Code className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">HTML Encoder/Decoder</h1>
            <p className="text-zinc-400">Encode and decode HTML entities</p>
          </div>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl w-fit">
        <button
          onClick={() => setMode('encode')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
            mode === 'encode'
              ? 'bg-blue-600 text-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Encode
        </button>
        <button
          onClick={() => setMode('decode')}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
            mode === 'decode'
              ? 'bg-blue-600 text-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Decode
        </button>
      </div>

      {/* Action Button */}
      <button
        onClick={process}
        className="mb-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all btn-lift"
      >
        <ArrowRightLeft className="w-5 h-5" />
        {mode === 'encode' ? 'Encode HTML' : 'Decode HTML'}
      </button>

      {/* Input/Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TextArea
          label={mode === 'encode' ? 'HTML Input' : 'Encoded Input'}
          value={input}
          onChange={setInput}
          placeholder={mode === 'encode' ? '<div class="example">Hello & Welcome!</div>' : '<div class="example">Hello & Welcome!</div>'}
          rows={15}
        />
        <TextArea
          label={mode === 'encode' ? 'Encoded Output' : 'Decoded Output'}
          value={output}
          onChange={setOutput}
          placeholder="Result will appear here..."
          readOnly
          rows={15}
        />
      </div>

      {/* Info */}
      <div className="mt-8 p-6 rounded-2xl glass">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FileCode className="w-5 h-5 text-blue-400" />
          HTML Entities Reference
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {[
            { char: '&', entity: '&' },
            { char: '<', entity: '<' },
            { char: '>', entity: '>' },
            { char: '"', entity: '"' },
            { char: "'", entity: '&#x27;' },
            { char: '/', entity: '&#x2F;' },
          ].map(({ char, entity }) => (
            <div key={char} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <code className="text-zinc-400">{char}</code>
              <code className="text-blue-400">{entity}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
