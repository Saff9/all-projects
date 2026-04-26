'use client';

import { useState, useCallback } from 'react';
import BackButton from '@/components/BackButton';
import Breadcrumbs from '@/components/Breadcrumbs';
import TextArea from '@/components/TextArea';
import { sanitizeJson } from '@/utils/security';
import { CheckCircle, XCircle, AlertTriangle, FileCheck, RefreshCw, Save, Download } from 'lucide-react';

// Simple JSON Schema validator (subset of draft-07)
interface Schema {
  type?: string;
  properties?: Record<string, Schema>;
  required?: string[];
  items?: Schema;
  enum?: unknown[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  allOf?: Schema[];
  anyOf?: Schema[];
  oneOf?: Schema[];
  not?: Schema;
  default?: unknown;
  description?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validateType(value: unknown, type: string): boolean {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'integer':
      return typeof value === 'number' && Number.isInteger(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'null':
      return value === null;
    case 'any':
      return true;
    default:
      return false;
  }
}

function validateSchema(data: unknown, schema: Schema): ValidationResult {
  const errors: string[] = [];

  function validate(value: unknown, path: string, currentSchema: Schema): void {
    // Type validation
    if (currentSchema.type) {
      if (!validateType(value, currentSchema.type)) {
        errors.push(`${path}: expected ${currentSchema.type}, got ${typeof value}`);
        return;
      }
    }

    if (value === null || value === undefined) {
      return;
    }

    // Object validation
    if (currentSchema.type === 'object' && typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      
      if (currentSchema.required) {
        for (const required of currentSchema.required) {
          if (!(required in obj)) {
            errors.push(`${path}: missing required property "${required}"`);
          }
        }
      }

      if (currentSchema.properties) {
        for (const [key, propSchema] of Object.entries(currentSchema.properties)) {
          if (key in obj) {
            validate(obj[key], `${path}.${key}`, propSchema);
          }
        }
      }
    }

    // Array validation
    if (currentSchema.type === 'array' && Array.isArray(value)) {
      if (currentSchema.items) {
        value.forEach((item, index) => {
          validate(item, `${path}[${index}]`, currentSchema.items!);
        });
      }
    }

    // Number validations
    if (currentSchema.type === 'number' || currentSchema.type === 'integer') {
      if (currentSchema.minimum !== undefined && (value as number) < currentSchema.minimum) {
        errors.push(`${path}: value ${value} is less than minimum ${currentSchema.minimum}`);
      }
      if (currentSchema.maximum !== undefined && (value as number) > currentSchema.maximum) {
        errors.push(`${path}: value ${value} is greater than maximum ${currentSchema.maximum}`);
      }
    }

    // String validations
    if (typeof value === 'string') {
      if (currentSchema.minLength !== undefined && value.length < currentSchema.minLength) {
        errors.push(`${path}: string length ${value.length} is less than minimum ${currentSchema.minLength}`);
      }
      if (currentSchema.maxLength !== undefined && value.length > currentSchema.maxLength) {
        errors.push(`${path}: string length ${value.length} is greater than maximum ${currentSchema.maxLength}`);
      }
      if (currentSchema.pattern) {
        try {
          const regex = new RegExp(currentSchema.pattern);
          if (!regex.test(value)) {
            errors.push(`${path}: string "${value}" does not match pattern ${currentSchema.pattern}`);
          }
        } catch {
          errors.push(`${path}: invalid regex pattern ${currentSchema.pattern}`);
        }
      }
    }

    // Enum validation
    if (currentSchema.enum && !currentSchema.enum.includes(value)) {
      errors.push(`${path}: value must be one of [${currentSchema.enum.join(', ')}]`);
    }

    // allOf, anyOf, oneOf, not
    if (currentSchema.allOf) {
      currentSchema.allOf.forEach((subSchema, i) => {
        const result = validateSchema(value, subSchema);
        if (!result.valid) {
          errors.push(...result.errors.map(e => `${path}.allOf[${i}]${e.slice(path.length)}`));
        }
      });
    }
  }

  validate(data, 'root', schema);
  return { valid: errors.length === 0, errors };
}

// Sample schema and data
const SAMPLE_SCHEMA: Schema = {
  type: 'object',
  required: ['name', 'email', 'age'],
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
    },
    email: {
      type: 'string',
      pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
    },
    age: {
      type: 'integer',
      minimum: 0,
      maximum: 150,
    },
    hobbies: {
      type: 'array',
      items: { type: 'string' },
    },
  },
};

const SAMPLE_DATA = {
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  hobbies: ['reading', 'coding'],
};

export default function JsonSchemaValidator() {
  const [schema, setSchema] = useState(JSON.stringify(SAMPLE_SCHEMA, null, 2));
  const [data, setData] = useState(JSON.stringify(SAMPLE_DATA, null, 2));
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [schemaError, setSchemaError] = useState('');
  const [dataError, setDataError] = useState('');

  const validate = useCallback(() => {
    setResult(null);
    setSchemaError('');
    setDataError('');

    let parsedSchema: Schema;
    let parsedData: unknown;

    try {
      parsedSchema = JSON.parse(sanitizeJson(schema));
    } catch (err) {
      setSchemaError(`Invalid schema: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return;
    }

    try {
      parsedData = JSON.parse(sanitizeJson(data));
    } catch (err) {
      setDataError(`Invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return;
    }

    const validationResult = validateSchema(parsedData, parsedSchema);
    setResult(validationResult);
  }, [schema, data]);

  const loadSample = () => {
    setSchema(JSON.stringify(SAMPLE_SCHEMA, null, 2));
    setData(JSON.stringify(SAMPLE_DATA, null, 2));
  };

  const formatJson = (target: 'schema' | 'data') => {
    try {
      const parsed = target === 'schema' 
        ? JSON.parse(sanitizeJson(schema))
        : JSON.parse(sanitizeJson(data));
      if (target === 'schema') {
        setSchema(JSON.stringify(parsed, null, 2));
      } else {
        setData(JSON.stringify(parsed, null, 2));
      }
    } catch {
      // Ignore formatting errors
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Breadcrumbs />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <FileCheck className="w-8 h-8 text-teal-400" />
            JSON Schema Validator
          </h1>
          <p className="text-gray-400">
            Validate JSON against a JSON Schema
          </p>
        </div>
        <BackButton />
      </div>

      {/* Validate Button */}
      <div className="mb-6">
        <button
          onClick={validate}
          className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Validate
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schema Input */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-b border-zinc-700">
            <span className="text-sm font-medium text-white">JSON Schema</span>
            <div className="flex gap-2">
              <button
                onClick={loadSample}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Load Sample
              </button>
              <button
                onClick={() => formatJson('schema')}
                className="text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Format
              </button>
            </div>
          </div>
          <TextArea
            value={schema}
            onChange={(val) => setSchema(val)}
            placeholder="Paste your JSON Schema here..."
            rows={15}
            error={schemaError}
          />
        </div>

        {/* JSON Data Input */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-b border-zinc-700">
            <span className="text-sm font-medium text-white">JSON Data</span>
            <button
              onClick={() => formatJson('data')}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Format
            </button>
          </div>
          <TextArea
            value={data}
            onChange={(val) => setData(val)}
            placeholder="Paste your JSON data here..."
            rows={15}
            error={dataError}
          />
        </div>
      </div>

      {/* Validation Result */}
      {result && (
        <div className="mt-6 glass rounded-xl overflow-hidden">
          <div className={`px-4 py-3 border-b ${
            result.valid ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-center gap-2">
              {result.valid ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="font-medium text-green-400">Valid JSON</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-400" />
                  <span className="font-medium text-red-400">Validation Failed</span>
                </>
              )}
            </div>
          </div>
          
          {result.errors.length > 0 && (
            <div className="p-4 space-y-2">
              {result.errors.map((error, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-3 bg-red-500/5 border border-red-500/20 rounded-lg"
                >
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                  <span className="text-sm text-red-300 font-mono">{error}</span>
                </div>
              ))}
            </div>
          )}

          {result.valid && (
            <div className="p-4 text-sm text-zinc-400">
              The JSON data conforms to the specified schema.
            </div>
          )}
        </div>
      )}

      {/* Schema Reference */}
      <div className="mt-6 glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Supported Keywords</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-zinc-400 mb-2">Types</h4>
            <ul className="space-y-1 text-zinc-500">
              <li><code className="text-blue-400">string</code></li>
              <li><code className="text-blue-400">number</code></li>
              <li><code className="text-blue-400">integer</code></li>
              <li><code className="text-blue-400">boolean</code></li>
              <li><code className="text-blue-400">array</code></li>
              <li><code className="text-blue-400">object</code></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-zinc-400 mb-2">String</h4>
            <ul className="space-y-1 text-zinc-500">
              <li><code className="text-blue-400">minLength</code></li>
              <li><code className="text-blue-400">maxLength</code></li>
              <li><code className="text-blue-400">pattern</code></li>
              <li><code className="text-blue-400">enum</code></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-zinc-400 mb-2">Number</h4>
            <ul className="space-y-1 text-zinc-500">
              <li><code className="text-blue-400">minimum</code></li>
              <li><code className="text-blue-400">maximum</code></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-zinc-400 mb-2">Object</h4>
            <ul className="space-y-1 text-zinc-500">
              <li><code className="text-blue-400">required</code></li>
              <li><code className="text-blue-400">properties</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
