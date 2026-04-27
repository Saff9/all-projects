'use client';

import { useState, useCallback, useEffect } from 'react';

type NumberBase = 'decimal' | 'binary' | 'hex' | 'octal';

interface BaseConfig {
  name: string;
  base: number;
  prefix: string;
  placeholder: string;
}

const BASES: Record<NumberBase, BaseConfig> = {
  decimal: { name: 'Decimal', base: 10, prefix: '', placeholder: 'Enter decimal number...' },
  binary: { name: 'Binary', base: 2, prefix: '0b', placeholder: 'Enter binary number (0-1)...' },
  hex: { name: 'Hexadecimal', base: 16, prefix: '0x', placeholder: 'Enter hex number (0-9, A-F)...' },
  octal: { name: 'Octal', base: 8, prefix: '0o', placeholder: 'Enter octal number (0-7)...' },
};

function isValidNumber(value: string, base: NumberBase): boolean {
  if (!value.trim()) return true;

  const cleanValue = value.replace(/^0x|^0b|^0o/i, '').replace(/_/g, '');
  
  switch (base) {
    case 'binary':
      return /^[01]+$/.test(cleanValue);
    case 'octal':
      return /^[0-7]+$/.test(cleanValue);
    case 'decimal':
      return /^-?\d+$/.test(cleanValue);
    case 'hex':
      return /^[0-9A-Fa-f]+$/.test(cleanValue);
    default:
      return false;
  }
}

function convertNumber(value: string, fromBase: NumberBase, toBase: NumberBase): string {
  if (!value.trim()) return '';

  // Parse the input number
  const cleanValue = value.replace(/^0x|^0b|^0o/i, '').replace(/_/g, '');
  const fromRadix = BASES[fromBase].base;
  
  let decimalValue: number;
  if (fromBase === 'decimal') {
    decimalValue = parseInt(cleanValue, 10);
  } else {
    decimalValue = parseInt(cleanValue, fromRadix);
  }

  if (isNaN(decimalValue)) return '';

  // Convert to target base
  const toRadix = BASES[toBase].base;
  const prefix = BASES[toBase].prefix;

  if (decimalValue === 0) return '0';

  const isNegative = decimalValue < 0;
  const absValue = Math.abs(decimalValue);

  let result = '';
  let num = absValue;

  while (num > 0) {
    const remainder = num % toRadix;
    result = remainder.toString(toRadix).toUpperCase() + result;
    num = Math.floor(num / toRadix);
  }

  return (isNegative ? '-' : '') + prefix + result;
}

export default function NumberBaseConverter() {
  const [values, setValues] = useState<Record<NumberBase, string>>({
    decimal: '',
    binary: '',
    hex: '',
    octal: '',
  });
  const [errors, setErrors] = useState<Record<NumberBase, boolean>>({
    decimal: false,
    binary: false,
    hex: false,
    octal: false,
  });

  const updateValue = useCallback((base: NumberBase, value: string) => {
    setValues(prev => ({ ...prev, [base]: value }));
  }, []);

  // Validate and convert
  useEffect(() => {
    const newValues: Record<NumberBase, string> = { decimal: '', binary: '', hex: '', octal: '' };
    const newErrors: Record<NumberBase, boolean> = { decimal: false, binary: false, hex: false, octal: false };

    // Find the base with input
    const activeBase = (Object.keys(values) as NumberBase[]).find(base => 
      values[base].trim() !== ''
    ) as NumberBase | undefined;

    if (activeBase) {
      const inputValue = values[activeBase];
      const isValid = isValidNumber(inputValue, activeBase);
      newErrors[activeBase] = !isValid;

      if (isValid) {
        // Convert to all other bases
        (Object.keys(BASES) as NumberBase[]).forEach(base => {
          newValues[base] = convertNumber(inputValue, activeBase, base);
        });
      }
    }

    setValues(newValues);
    setErrors(newErrors);
  }, [values]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearAll = () => {
    setValues({ decimal: '', binary: '', hex: '', octal: '' });
    setErrors({ decimal: false, binary: false, hex: false, octal: false });
  };

  const formatWithSeparator = (value: string, base: NumberBase): string => {
    if (!value || base === 'binary') return value;
    
    const cleanValue = value.replace(/^-/, '');
    let formatted = '';
    const chunkSize = base === 'hex' ? 4 : 3;
    
    for (let i = cleanValue.length; i > 0; i -= chunkSize) {
      const start = Math.max(0, i - chunkSize);
      const chunk = cleanValue.substring(start, i);
      formatted = chunk + (formatted ? '_' + formatted : '');
    }
    
    return value.startsWith('-') ? '-' + formatted : formatted;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Number Base Converter
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Convert between decimal, binary, hexadecimal, and octal numbers.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            onClick={clearAll}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {(Object.keys(BASES) as NumberBase[]).map((base) => {
            const config = BASES[base];
            const hasError = errors[base];
            const formattedValue = formatWithSeparator(values[base], base);

            return (
              <div
                key={base}
                className={`p-4 rounded-xl border ${
                  hasError
                    ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {config.name}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Base {config.base}
                    </p>
                  </div>
                  
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formattedValue}
                      onChange={(e) => {
                        const cleanValue = e.target.value.replace(/_/g, '');
                        updateValue(base, cleanValue);
                      }}
                      placeholder={config.placeholder}
                      className={`w-full px-4 py-2.5 rounded-lg font-mono text-sm bg-gray-50 dark:bg-gray-900 border ${
                        hasError
                          ? 'border-red-300 dark:border-red-600 text-red-900 dark:text-red-100'
                          : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
                      }`}
                    />
                  </div>

                  <button
                    onClick={() => copyToClipboard(values[base])}
                    disabled={!values[base]}
                    className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Copy
                  </button>
                </div>

                {hasError && (
                  <p className="text-xs text-red-500 mt-2 ml-36">
                    Invalid {config.name.toLowerCase()} number
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Reference */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Quick Reference</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-white dark:bg-gray-700 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 mb-1">Decimal (10)</p>
              <p className="font-mono text-gray-900 dark:text-white">0-9</p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-700 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 mb-1">Binary (2)</p>
              <p className="font-mono text-gray-900 dark:text-white">0-1</p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-700 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 mb-1">Octal (8)</p>
              <p className="font-mono text-gray-900 dark:text-white">0-7</p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-700 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400 mb-1">Hex (16)</p>
              <p className="font-mono text-gray-900 dark:text-white">0-9, A-F</p>
            </div>
          </div>
        </div>

        {/* Example */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Example</h4>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <p><span className="font-medium">Decimal:</span> 255</p>
            <p><span className="font-medium">Binary:</span> 11111111</p>
            <p><span className="font-medium">Octal:</span> 377</p>
            <p><span className="font-medium">Hex:</span> FF</p>
          </div>
        </div>
      </div>
    </div>
  );
}
