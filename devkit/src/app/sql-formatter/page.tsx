'use client';

import { useState, useCallback } from 'react';
import TextArea from '@/components/TextArea';

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN',
  'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN',
  'ON', 'AS', 'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'FROM',
  'CREATE', 'TABLE', 'ALTER', 'DROP', '', 'DATINDEX', 'VIEWABASE',
  'PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE', 'NOT NULL', 'NULL',
  'DEFAULT', 'CONSTRAINT', 'CHECK', 'CASCADE', 'RESTRICT',
  'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
  'UNION', 'ALL', 'EXCEPT', 'INTERSECT', 'INNER', 'OUTER',
  'ASC', 'DESC', 'NULLS', 'FIRST', 'LAST',
  'WITH', 'RECURSIVE', 'CTE', 'TEMPORARY', 'TEMP',
  'TRUNCATE', 'MERGE', 'OUTPUT', 'USING',
];

const capitalizeKeyword = (word: string): string => {
  const upper = word.toUpperCase();
  return SQL_KEYWORDS.includes(upper) ? upper : word;
};

const tokenizeSQL = (sql: string): string[] => {
  const tokens: string[] = [];
  let current = '';
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    
    if (inString) {
      if (char === stringChar) {
        inString = false;
        current += char;
      } else {
        current += char;
      }
      continue;
    }
    
    if (char === "'" || char === '"' || char === '`') {
      inString = true;
      stringChar = char;
      current += char;
      continue;
    }
    
    if (/\s/.test(char)) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }
    
    if (/[,;()]/.test(char)) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      tokens.push(char);
      continue;
    }
    
    current += char;
  }
  
  if (current) {
    tokens.push(current);
  }
  
  return tokens;
};

const formatSQL = (sql: string): string => {
  const tokens = tokenizeSQL(sql);
  const formatted: string[] = [];
  let indentLevel = 0;
  let i = 0;
  
  const addNewline = () => {
    if (formatted.length > 0 && !formatted[formatted.length - 1].endsWith('\n')) {
      formatted.push('\n');
    }
    formatted.push('  '.repeat(Math.max(0, indentLevel)));
  };
  
  while (i < tokens.length) {
    const token = tokens[i];
    
    if (token === ';') {
      formatted.push(';');
      i++;
      continue;
    }
    
    if (token === ')') {
      indentLevel = Math.max(0, indentLevel - 1);
      addNewline();
      formatted.push(')');
      i++;
      continue;
    }
    
    const nextToken = tokens[i + 1];
    const prevToken = formatted.length > 0 ? formatted[formatted.length - 1] : '';
    
    if (['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP'].some(kw => 
      token.toUpperCase().startsWith(kw))) {
      addNewline();
    }
    
    if (token === '(') {
      formatted.push('(');
      indentLevel++;
      i++;
      continue;
    }
    
    if (token === ',') {
      formatted.push(', ');
      i++;
      continue;
    }
    
    if (nextToken === '=' || 
        (nextToken && ['<', '>', '!', '+', '-', '*', '/', '%'].includes(nextToken))) {
      formatted.push(capitalizeKeyword(token));
      continue;
    }
    
    if (token.toUpperCase() === 'ON' && nextToken && nextToken.toUpperCase() === 'JOIN') {
      formatted.push('ON');
      i++;
      continue;
    }
    
    if (prevToken && !prevToken.endsWith('\n') && !prevToken.endsWith('  ')) {
      if (token !== '(' && token !== ')') {
        formatted.push(' ');
      }
    }
    
    formatted.push(capitalizeKeyword(token));
    i++;
  }
  
  let result = formatted.join('');
  
  // Clean up extra whitespace
  result = result.replace(/:\s+/g, ': ');
  result = result.replace(/\s+/g, ' ');
  result = result.replace(/\s*([,;()])\s*/g, '$1');
  result = result.replace(/([a-zA-Z0-9])(\()/g, '$1 $2');
  result = result.replace(/(\))([a-zA-Z0-9])/g, '$1 $2');
  
  // Add newlines before keywords
  const keywordsNewline = ['FROM', 'WHERE', 'AND', 'OR', 'GROUP BY', 'HAVING', 'ORDER BY', 
                           'LIMIT', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 
                           'FULL OUTER JOIN', 'UNION', 'VALUES', 'SET'];
  
  keywordsNewline.forEach(kw => {
    const regex = new RegExp(`\\s+${kw}\\b`, 'gi');
    result = result.replace(regex, `\n${kw}`);
  });
  
  return result.trim();
};

const highlightSQL = (sql: string): string => {
  let highlighted = sql
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>');
  
  highlighted = highlighted
    .replace(/('(?:[^'\\]|\\.)*')/g, '<span class="text-green-400">$1</span>')
    .replace(/\b(SELECT|FROM|WHERE|AND|OR|NOT|IN|LIKE|BETWEEN|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|ON|AS|ORDER BY|GROUP BY|HAVING|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|INDEX|VIEW|DATABASE|PRIMARY KEY|FOREIGN KEY|UNIQUE|NOT NULL|NULL|DEFAULT|CONSTRAINT|CHECK|CASCADE|RESTRICT|DISTINCT|COUNT|SUM|AVG|MIN|MAX|CASE|WHEN|THEN|ELSE|END|UNION|ALL|EXCEPT|INTERSECT|ASC|DESC|NULLS|FIRST|LAST|WITH|RECURSIVE|CTE|TEMPORARY|TEMP|TRUNCATE|MERGE|OUTPUT|USING)\b/gi, 
      '<span class="text-blue-400 font-semibold">$1</span>');
  
  return highlighted;
};

export default function SqlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const format = useCallback(() => {
    try {
      if (!input.trim()) {
        setOutput('');
        setError('');
        return;
      }

      const formatted = formatSQL(input);
      setOutput(formatted);
      setError('');
    } catch (err) {
      setError(`Formatting failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [input]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output);
  }, [output]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          SQL Formatter
        </h1>
        <p className="text-gray-400">
          Format and beautify SQL queries with proper indentation and syntax highlighting.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={format}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          Format SQL
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TextArea
          label="SQL Input"
          value={input}
          onChange={(val) => {
            setInput(val);
            setError('');
          }}
          placeholder="SELECT * FROM users WHERE id = 1;"
          rows={15}
        />
        <div className="w-full">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-zinc-300">
              Formatted SQL
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 
                           bg-white/5 rounded-lg hover:bg-white/10 hover:text-white transition-all"
              >
                Copy
              </button>
            </div>
          </div>
          <div className="relative">
            <pre className="w-full px-4 py-3 rounded-xl bg-zinc-900/50 border border-white/10 
                            text-zinc-100 font-mono text-sm overflow-auto whitespace-pre-wrap
                            focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {output ? (
                <code 
                  className="sql-code"
                  dangerouslySetInnerHTML={{ __html: highlightSQL(output) }}
                />
              ) : (
                <span className="text-zinc-600">Formatted SQL will appear here...</span>
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
