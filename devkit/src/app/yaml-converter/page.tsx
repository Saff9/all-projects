'use client';

import { useState, useCallback } from 'react';
import * as yaml from 'yaml';
import TextArea from '@/components/TextArea';

type ConversionMode = 'yaml-to-json' | 'json-to-yaml';

export default function YamlConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<ConversionMode>('yaml-to-json');
  const [error, setError] = useState('');

  const convert = useCallback(() => {
    try {
      if (!input.trim()) {
        setOutput('');
        setError('');
        return;
      }

      if (mode === 'yaml-to-json') {
        const parsed = yaml.parse(input);
        setOutput(JSON.stringify(parsed, null, 2));
        setError('');
      } else {
        const parsed = JSON.parse(input);
        setOutput(yaml.stringify(parsed));
        setError('');
      }
    } catch (err) {
      if (mode === 'yaml-to-json') {
        setError(`Invalid YAML: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } else {
        setError(`Invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
      setOutput('');
    }
  }, [input, mode]);

  const handleModeChange = (newMode: ConversionMode) => {
    setMode(newMode);
    setInput('');
    setOutput('');
    setError('');
  };

  const inputPlaceholder = mode === 'yaml-to-json'
    ? 'name: John Doe\nage: 30\ntags:\n  - developer\n  - designer'
    : '{\n  "name": "John Doe",\n  "age": 30,\n  "tags": ["developer", "designer"]\n}';

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          YAML Converter
        </h1>
        <p className="text-gray-400">
          Convert between YAML and JSON formats with validation.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <select
          value={mode}
          onChange={(e) => handleModeChange(e.target.value as ConversionMode)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white 
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="yaml-to-json">YAML → JSON</option>
          <option value="json-to-yaml">JSON → YAML</option>
        </select>
        <button
          onClick={convert}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          Convert
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TextArea
          label={mode === 'yaml-to-json' ? 'YAML Input' : 'JSON Input'}
          value={input}
          onChange={(val) => {
            setInput(val);
            setError('');
          }}
          placeholder={inputPlaceholder}
          rows={15}
        />
        <TextArea
          label={mode === 'yaml-to-json' ? 'JSON Output' : 'YAML Output'}
          value={output}
          onChange={setOutput}
          placeholder="Result will appear here..."
          readOnly
          rows={15}
        />
      </div>
    </div>
  );
}
