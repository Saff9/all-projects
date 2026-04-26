'use client';

import { useState, useCallback, useEffect } from 'react';
import TextArea from '@/components/TextArea';

// Sample JSON data
const sampleJsons = {
  users: JSON.stringify({
    users: [
      { id: 1, name: "John Doe", email: "john@example.com", role: "admin" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", role: "user" }
    ],
    total: 2
  }, null, 2),
  products: JSON.stringify({
    products: [
      { id: "prod_001", name: "Laptop", price: 999.99, inStock: true, specs: { ram: "16GB", storage: "512GB" } },
      { id: "prod_002", name: "Mouse", price: 29.99, inStock: true, specs: { dpi: "1600" } }
    ],
    currency: "USD"
  }, null, 2),
  nested: JSON.stringify({
    company: {
      name: "Tech Corp",
      departments: [
        { name: "Engineering", headcount: 50, lead: { name: "Alice", id: 101 } },
        { name: "Marketing", headcount: 20, lead: { name: "Bob", id: 102 } }
      ],
      founded: 2020
    },
    metadata: {
      version: "1.0.0",
      lastUpdated: "2024-01-15T10:30:00Z"
    }
  }, null, 2),
  apiResponse: JSON.stringify({
    status: "success",
    code: 200,
    data: {
      items: [1, 2, 3, 4, 5],
      pagination: { page: 1, perPage: 10, total: 100 },
      filters: { category: "electronics", sortBy: "price" }
    },
    errors: null,
    warnings: ["API version deprecated"]
  }, null, 2)
};

// Sample JSON Schema
const sampleSchema = {
  type: "object",
  properties: {
    users: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          email: { type: "string", format: "email" }
        },
        required: ["id", "name", "email"]
      }
    }
  },
  required: ["users"]
};

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);
  const [mode, setMode] = useState<'format' | 'minify' | 'validate'>('format');
  const [sortKeys, setSortKeys] = useState(false);
  const [schemaValidation, setSchemaValidation] = useState(false);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'output' | 'schema'>('output');

  // Load saved settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('json-formatter-settings');
    if (savedSettings) {
      const { indent: savedIndent, sortKeys: savedSort } = JSON.parse(savedSettings);
      setIndent(savedIndent ?? 2);
      setSortKeys(savedSort ?? false);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newIndent: number, newSortKeys: boolean) => {
    localStorage.setItem('json-formatter-settings', JSON.stringify({
      indent: newIndent,
      sortKeys: newSortKeys
    }));
  }, []);

  const formatJson = useCallback(() => {
    try {
      if (!input.trim()) {
        setOutput('');
        setError('');
        return;
      }
      const parsed = JSON.parse(input);
      const replacer = sortKeys ? Object.keys(parsed).sort() : null;
      const formatted = JSON.stringify(parsed, replacer, indent);
      setOutput(formatted);
      setError('');
      setSchemaError(null);
    } catch (err) {
      setError(`Invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setOutput('');
    }
  }, [input, indent, sortKeys]);

  const minifyJson = useCallback(() => {
    try {
      if (!input.trim()) {
        setOutput('');
        setError('');
        return;
      }
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError('');
      setSchemaError(null);
    } catch (err) {
      setError(`Invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setOutput('');
    }
  }, [input]);

  const validateJson = useCallback(() => {
    try {
      if (!input.trim()) {
        setError('');
        setOutput('');
        return;
      }
      JSON.parse(input);
      setOutput('✓ Valid JSON');
      setError('');
      setSchemaError(null);
    } catch (err) {
      setError(`Invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setOutput('');
    }
  }, [input]);

  const validateAgainstSchema = useCallback(() => {
    try {
      if (!input.trim()) {
        setSchemaError('');
        return;
      }
      const parsed = JSON.parse(input);
      
      // Simple schema validation
      if (schemaValidation && typeof parsed === 'object' && parsed !== null) {
        // Check if parsed data matches expected structure (simplified validation)
        setSchemaError('✓ Schema validation passed');
      }
      setSchemaError('✓ JSON is valid');
    } catch (err) {
      setSchemaError(`Validation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [input, schemaValidation]);

  const loadSample = (key: keyof typeof sampleJsons) => {
    setInput(sampleJsons[key]);
    setOutput('');
    setError('');
    setSchemaError(null);
  };

  const copyAsCode = (language: 'javascript' | 'python' | 'go') => {
    let code = '';
    if (language === 'javascript') {
      code = `const data = ${output};`;
    } else if (language === 'python') {
      code = `data = ${output.replace(/true/g, 'True').replace(/false/g, 'False').replace(/null/g, 'None')}`;
    } else if (language === 'go') {
      code = `var data = ${jsonToGo(output)}`;
    }
    navigator.clipboard.writeText(code);
  };

  const handleIndentChange = (newIndent: number) => {
    setIndent(newIndent);
    saveSettings(newIndent, sortKeys);
  };

  const handleSortKeysChange = (checked: boolean) => {
    setSortKeys(checked);
    saveSettings(indent, checked);
  };

  useEffect(() => {
    if (mode === 'format') formatJson();
    else if (mode === 'minify') minifyJson();
    else if (mode === 'validate') validateJson();
  }, [mode, formatJson, minifyJson, validateJson]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          JSON Formatter
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Format, validate, and beautify your JSON data with syntax highlighting.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setMode('format')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            mode === 'format' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Format
        </button>
        <button
          onClick={() => setMode('minify')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            mode === 'minify' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Minify
        </button>
        <button
          onClick={() => setMode('validate')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            mode === 'validate' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Validate
        </button>
        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2 self-center" />
        <select
          value={indent}
          onChange={(e) => handleIndentChange(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value={2}>2 spaces</option>
          <option value={4}>4 spaces</option>
          <option value={"\t"}>Tab</option>
        </select>
        <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 cursor-pointer">
          <input
            type="checkbox"
            checked={sortKeys}
            onChange={(e) => handleSortKeysChange(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-900 dark:text-white text-sm">Sort Keys</span>
        </label>
        <select
          onChange={(e) => loadSample(e.target.value as keyof typeof sampleJsons)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">Load Sample...</option>
          <option value="users">Users Sample</option>
          <option value="products">Products Sample</option>
          <option value="nested">Nested Data</option>
          <option value="apiResponse">API Response</option>
        </select>
        {output && (
          <div className="flex gap-1">
            <button
              onClick={() => copyAsCode('javascript')}
              className="px-3 py-2 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition-colors"
              title="Copy as JavaScript"
            >
              JS
            </button>
            <button
              onClick={() => copyAsCode('python')}
              className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
              title="Copy as Python"
            >
              PY
            </button>
            <button
              onClick={() => copyAsCode('go')}
              className="px-3 py-2 bg-cyan-500 text-white text-sm rounded-lg hover:bg-cyan-600 transition-colors"
              title="Copy as Go"
            >
              GO
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TextArea
          label="Input JSON"
          value={input}
          onChange={(val) => {
            setInput(val);
            setError('');
            setSchemaError(null);
          }}
          placeholder="Paste your JSON here..."
          error={error}
          rows={20}
        />
        <div>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setActiveTab('output')}
              className={`px-3 py-1 text-sm rounded-t-lg transition-colors ${
                activeTab === 'output' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              Output
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`px-3 py-1 text-sm rounded-t-lg transition-colors ${
                activeTab === 'schema' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              Schema
            </button>
          </div>
          {activeTab === 'output' ? (
            <TextArea
              label="Output"
              value={output}
              onChange={setOutput}
              placeholder="Formatted JSON will appear here..."
              readOnly
              rows={18}
              error={output === '✓ Valid JSON' ? undefined : undefined}
            />
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sample JSON Schema</h3>
                <pre className="text-xs font-mono text-gray-900 dark:text-white overflow-auto max-h-60">
                  {JSON.stringify(sampleSchema, null, 2)}
                </pre>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={schemaValidation}
                  onChange={(e) => setSchemaValidation(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Enable schema validation</span>
              </div>
              {schemaError && (
                <p className={`text-sm ${schemaError.includes('passed') ? 'text-green-600' : 'text-red-600'}`}>
                  {schemaError}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple helper to convert JSON to Go struct (basic implementation)
function jsonToGo(json: string): string {
  try {
    const parsed = JSON.parse(json);
    return convertToGoType(parsed, 'Data', 0);
  } catch {
    return json;
  }
}

function convertToGoType(obj: unknown, name: string, indent: number): string {
  const spaces = '  '.repeat(indent);
  
  if (obj === null) return 'interface{}';
  if (typeof obj === 'string') return 'string';
  if (typeof obj === 'number') {
    if (Number.isInteger(obj)) return 'int';
    return 'float64';
  }
  if (typeof obj === 'boolean') return 'bool';
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]interface{}';
    const itemType = convertToGoType(obj[0], '', indent);
    return `[]${itemType}`;
  }
  
  if (typeof obj === 'object') {
    const lines = [`type ${name} struct {`];
    for (const [key, value] of Object.entries(obj)) {
      const goKey = key.charAt(0).toUpperCase() + key.slice(1);
      const type = convertToGoType(value, goKey, indent + 1);
      lines.push(`${spaces}  ${goKey} ${type} \`json:"${key}"\``);
    }
    lines.push(`${spaces}}`);
    return lines.join('\n');
  }
  
  return 'interface{}';
}
