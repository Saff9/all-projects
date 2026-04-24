'use client';

import { useState, useCallback } from 'react';
import TextArea from '@/components/TextArea';

type CaseType = 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant' | 'lower' | 'upper' | 'title';

export default function CaseConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const toCamelCase = (str: string) => {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '')
      .replace(/[-_]/g, '');
  };

  const toPascalCase = (str: string) => {
    return str
      .replace(new RegExp(/[-_]+/, 'g'), ' ')
      .replace(new RegExp(/[^\w\s]/, 'g'), '')
      .replace(
        /\s+(.)(\w*)/g,
        ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`
      )
      .replace(new RegExp(/\w/), s => s.toUpperCase());
  };

  const toSnakeCase = (str: string) => {
    return str
      .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
      ?.map(x => x.toLowerCase())
      .join('_') || str.toLowerCase().replace(/\s+/g, '_');
  };

  const toKebabCase = (str: string) => {
    return str
      .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
      ?.map(x => x.toLowerCase())
      .join('-') || str.toLowerCase().replace(/\s+/g, '-');
  };

  const toConstantCase = (str: string) => {
    return str
      .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
      ?.map(x => x.toUpperCase())
      .join('_') || str.toUpperCase().replace(/\s+/g, '_');
  };

  const toTitleCase = (str: string) => {
    return str
      .toLowerCase()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const convert = useCallback((type: CaseType) => {
    if (!input) return;

    let result = '';
    switch (type) {
      case 'camel':
        result = toCamelCase(input);
        break;
      case 'pascal':
        result = toPascalCase(input);
        break;
      case 'snake':
        result = toSnakeCase(input);
        break;
      case 'kebab':
        result = toKebabCase(input);
        break;
      case 'constant':
        result = toConstantCase(input);
        break;
      case 'lower':
        result = input.toLowerCase();
        break;
      case 'upper':
        result = input.toUpperCase();
        break;
      case 'title':
        result = toTitleCase(input);
        break;
    }
    setOutput(result);
  }, [input]);

  const cases: { type: CaseType; label: string; example: string }[] = [
    { type: 'camel', label: 'camelCase', example: 'helloWorld' },
    { type: 'pascal', label: 'PascalCase', example: 'HelloWorld' },
    { type: 'snake', label: 'snake_case', example: 'hello_world' },
    { type: 'kebab', label: 'kebab-case', example: 'hello-world' },
    { type: 'constant', label: 'CONSTANT_CASE', example: 'HELLO_WORLD' },
    { type: 'lower', label: 'lowercase', example: 'hello world' },
    { type: 'upper', label: 'UPPERCASE', example: 'HELLO WORLD' },
    { type: 'title', label: 'Title Case', example: 'Hello World' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Case Converter
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Convert text between different naming conventions.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        {cases.map(({ type, label, example }) => (
          <button
            key={type}
            onClick={() => convert(type)}
            className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-left"
          >
            <div className="font-medium text-gray-900 dark:text-white">{label}</div>
            <div className="text-xs text-gray-500">{example}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TextArea
          label="Input"
          value={input}
          onChange={setInput}
          placeholder="Enter text to convert..."
          rows={15}
        />
        <TextArea
          label="Output"
          value={output}
          onChange={setOutput}
          placeholder="Converted text will appear here..."
          readOnly
          rows={15}
        />
      </div>
    </div>
  );
}
