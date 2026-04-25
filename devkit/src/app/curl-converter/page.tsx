'use client';

import { useState, useCallback } from 'react';
import TextArea from '@/components/TextArea';

export default function CurlConverter() {
  const [curl, setCurl] = useState('');
  const [output, setOutput] = useState('');
  const [format, setFormat] = useState<'fetch' | 'axios'>('fetch');
  const [error, setError] = useState('');

  const parseCurl = useCallback((curlCommand: string) => {
    const result: {
      url?: string;
      method?: string;
      headers: Record<string, string>;
      body?: string;
    } = { headers: {} };

    let cmd = curlCommand.trim();
    if (cmd.toLowerCase().startsWith('curl')) {
      cmd = cmd.slice(4).trim();
    }

    const urlMatch = cmd.match(/['"](https?:\/\/[^'"]+)['"]|\s(https?:\/\/\S+)/);
    if (urlMatch) {
      result.url = urlMatch[1] || urlMatch[2];
    }

    const methodMatch = cmd.match(/-X\s+(\w+)/i);
    if (methodMatch) {
      result.method = methodMatch[1].toUpperCase();
    } else if (cmd.includes('-d ') || cmd.includes('--data ')) {
      result.method = 'POST';
    } else {
      result.method = 'GET';
    }

    const headerRegex = /-H\s+['"]([^:]+):\s*([^'"]+)['"]/g;
    let match;
    while ((match = headerRegex.exec(cmd)) !== null) {
      result.headers[match[1]] = match[2];
    }

    const bodyMatch = cmd.match(/-d\s+['"]([\s\S]*?)['"](?:\s+-|$)/) || 
                      cmd.match(/--data\s+['"]([\s\S]*?)['"](?:\s+-|$)/);
    if (bodyMatch) {
      result.body = bodyMatch[1];
    }

    return result;
  }, []);

  const convert = useCallback(() => {
    try {
      if (!curl.trim()) {
        setOutput('');
        setError('');
        return;
      }

      const parsed = parseCurl(curl);
      
      if (!parsed.url) {
        setError('Could not parse URL from curl command');
        return;
      }

      let code = '';

      if (format === 'fetch') {
        const headersStr = Object.keys(parsed.headers).length > 0
          ? `headers: ${JSON.stringify(parsed.headers, null, 2).replace(/"/g, "'")}`
          : '';
        
        const bodyStr = parsed.body ? `body: '${parsed.body}'` : '';
        
        const options = [
          `method: '${parsed.method}'`,
          headersStr,
          bodyStr
        ].filter(Boolean).join(',\n  ');

        code = `fetch('${parsed.url}', {
  ${options}
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;
      } else {
        const config: Record<string, unknown> = {
          method: parsed.method?.toLowerCase(),
          url: parsed.url,
        };
        
        if (Object.keys(parsed.headers).length > 0) {
          config.headers = parsed.headers;
        }
        
        if (parsed.body) {
          try {
            config.data = JSON.parse(parsed.body);
          } catch {
            config.data = parsed.body;
          }
        }

        code = `axios(${JSON.stringify(config, null, 2)})
  .then(response => console.log(response.data))
  .catch(error => console.error('Error:', error));`;
      }

      setOutput(code);
      setError('');
    } catch (err) {
      setError(`Conversion failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [curl, format, parseCurl]);

  const placeholderText = "curl -X POST https://api.example.com/data -H 'Content-Type: application/json' -d '{key:value}'";

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Curl Converter
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Convert curl commands to JavaScript fetch or axios code.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as 'fetch' | 'axios')}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="fetch">Fetch API</option>
          <option value="axios">Axios</option>
        </select>
        <button
          onClick={convert}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Convert
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TextArea
          label="Curl Command"
          value={curl}
          onChange={setCurl}
          placeholder={placeholderText}
          rows={15}
        />
        <TextArea
          label={format === 'fetch' ? 'Fetch Code' : 'Axios Code'}
          value={output}
          onChange={setOutput}
          placeholder="JavaScript code will appear here..."
          readOnly
          rows={15}
        />
      </div>
    </div>
  );
}
