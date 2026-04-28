'use client';

import { useState, useCallback } from 'react';
import xml2js from 'xml2js';
import TextArea from '@/components/TextArea';

type ConversionMode = 'format' | 'validate';

export default function XmlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<ConversionMode>('format');

  const processXml = useCallback(async () => {
    try {
      if (!input.trim()) {
        setOutput('');
        setError('');
        return;
      }

      const parser = new xml2js.Parser({ explicitArray: false });
      const builder = new (xml2js.Builder as any)({ indent: '  ' });

      const parsed = await parser.parseStringPromise(input);
      const formatted = builder.buildObject(parsed);
      
      setOutput(formatted);
      setError('');
    } catch (err) {
      setError(`Invalid XML: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setOutput('');
    }
  }, [input]);

  const handleModeChange = (newMode: ConversionMode) => {
    setMode(newMode);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          XML Formatter
        </h1>
        <p className="text-gray-400">
          Format and validate XML with proper indentation.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={processXml}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          {mode === 'format' ? 'Format XML' : 'Validate XML'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TextArea
          label="XML Input"
          value={input}
          onChange={(val) => {
            setInput(val);
            setError('');
          }}
          placeholder={`<?xml version="1.0" encoding="UTF-8"?>
<root>
  <item>
    <name>Example</name>
    <value>123</value>
  </item>
</root>`}
          rows={15}
        />
        <TextArea
          label="Formatted XML"
          value={output}
          onChange={setOutput}
          placeholder="Formatted XML will appear here..."
          readOnly
          rows={15}
        />
      </div>
    </div>
  );
}
