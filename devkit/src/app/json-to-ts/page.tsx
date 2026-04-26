'use client';

import { useState, useCallback } from 'react';
import TextArea from '@/components/TextArea';
import { Copy, Check } from 'lucide-react';

export default function JsonToTs() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [rootName, setRootName] = useState('Root');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const getType = (value: unknown, key?: string): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'unknown';
    
    const type = typeof value;
    
    if (type === 'string') return 'string';
    if (type === 'number') return 'number';
    if (type === 'boolean') return 'boolean';
    if (type === 'bigint') return 'bigint';
    if (type === 'symbol') return 'symbol';
    
    if (Array.isArray(value)) {
      if (value.length === 0) return 'unknown[]';
      const types = new Set(value.map(v => getType(v)));
      if (types.size === 1) {
        return `${Array.from(types)[0]}[]`;
      }
      return `(${Array.from(types).join(' | ')})[]`;
    }
    
    if (type === 'object') {
      if (typeof value === 'string' && new Date(value).toString() !== 'Invalid Date') {
        return 'Date';
      }
      return 'object';
    }
    
    return 'unknown';
  };

  const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const toPascalCase = (str: string): string => {
    return str.replace(/[-_]/g, ' ').split(' ').map(capitalize).join('');
  };

  const generateInterface = (obj: Record<string, unknown>, name: string): string => {
    const interfaces: string[] = [];
    
    const processObject = (obj: Record<string, unknown>, interfaceName: string) => {
      let lines: string[] = [`export interface ${interfaceName} {`];
      
      for (const [key, value] of Object.entries(obj)) {
        const type = getType(value);
        
        if (type === 'object') {
          const subInterfaceName = toPascalCase(key);
          const subObj = value as Record<string, unknown>;
          const keys = Object.keys(subObj);
          if (keys.length > 0 && typeof subObj[keys[0]] === 'object' && subObj[keys[0]] !== null) {
            lines.push(`  ${key}: ${subInterfaceName};`);
            processObject(subObj, subInterfaceName);
          } else {
            lines.push(`  ${key}: Record<string, unknown>;`);
          }
        } else if (type === 'object[]') {
          const subInterfaceName = toPascalCase(key);
          const arr = value as unknown[];
          if (arr.length > 0 && typeof arr[0] === 'object' && arr[0] !== null) {
            lines.push(`  ${key}: ${subInterfaceName}[];`);
            processObject(arr[0] as Record<string, unknown>, subInterfaceName);
          } else {
            lines.push(`  ${key}: unknown[];`);
          }
        } else {
          lines.push(`  ${key}: ${type};`);
        }
      }
      
      lines.push('}');
      lines.push('');
      interfaces.push(lines.join('\n'));
    };
    
    processObject(obj, name);
    return interfaces.join('\n');
  };

  const convertToTs = useCallback(() => {
    try {
      if (!input.trim()) {
        setOutput('');
        setError('');
        return;
      }
      
      const parsed = JSON.parse(input);
      const result = generateInterface(parsed as Record<string, unknown>, rootName || 'Root');
      setOutput(result);
      setError('');
    } catch (err) {
      setError(`Invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setOutput('');
    }
  }, [input, rootName]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          JSON to TypeScript
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Convert JSON objects to TypeScript interfaces.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={convertToTs}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Convert
        </button>
        <input
          type="text"
          value={rootName}
          onChange={(e) => setRootName(e.target.value)}
          placeholder="Root interface name"
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TextArea
          label="Input JSON"
          value={input}
          onChange={setInput}
          placeholder="Paste your JSON here..."
          error={error}
          rows={16}
        />
        <div className="relative">
          <TextArea
            label="TypeScript Interfaces"
            value={output}
            onChange={setOutput}
            placeholder="TypeScript interfaces will appear here..."
            readOnly
            rows={16}
          />
          {output && (
            <button
              onClick={copyToClipboard}
              className="absolute top-9 right-4 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
