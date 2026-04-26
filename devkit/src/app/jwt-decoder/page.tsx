'use client';

import { useState, useCallback, useEffect } from 'react';
import TextArea from '@/components/TextArea';

interface DecodedJWT {
  header: Record<string, unknown> | null;
  payload: Record<string, unknown> | null;
  signature: string | null;
  error?: string;
}

// Sample JWT tokens
const sampleTokens = {
  basic: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  expired: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxNTE2MjM5MDIwfQ.7p8v_UGegHQB2eFvKa8Xq9_1z7R3z6Xq9W2Z8Xq9W2Z8',
  withRoles: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsIm5hbWUiOiJKYW5lIFNtaXRoIiwicm9sZXMiOlsiYWRtaW4iLCJ1c2VyIl0sImlhdCI6MTcwMDAwMDAwMH0.Typed_signature_here',
  complex: 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImtleS1pZCIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhdXRoMHkxMjMiLCJub20iOiJKb2huIERvZSIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInRlbmFudCI6InRlbmFudC1pZCIsImFkbWluIjp0cnVlLCJyZWFsbV9yb2xlcyI6WyJ1c2VyIiwiYWRtaW4iLCJtb2RlcmF0b3IiXSwiaXNzIjoiaHR0cHM6Ly9hdXRoLWRvbWluLmNvbSIsImF1ZCI6Imh0dHBzOi8vYXBpLmRvbWluLmNvbSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDAwMDAwLCJqdGkiOiJqdGktaWQiLCJub25jZSI6Im5vbmNlLWlkIn0.signature_part_here',
};

export default function JwtDecoder() {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState<DecodedJWT>({ header: null, payload: null, signature: null });
  const [multipleTokens, setMultipleTokens] = useState<string[]>([]);
  const [showMultiple, setShowMultiple] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{
    exp?: string;
    nbf?: string;
    iat?: string;
    isValid: boolean;
    message: string;
  }>({ isValid: false, message: '' });

  const decodeBase64 = useCallback((str: string) => {
    try {
      const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(base64);
      return JSON.parse(json);
    } catch {
      return null;
    }
  }, []);

  const decodeJWT = useCallback((token: string): DecodedJWT => {
    try {
      if (!token.trim()) {
        return { header: null, payload: null, signature: null };
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        return { header: null, payload: null, signature: null, error: 'Invalid JWT format. Expected 3 parts separated by dots.' };
      }

      const header = decodeBase64(parts[0]);
      const payload = decodeBase64(parts[1]);
      const signature = parts[2];

      if (!header || !payload) {
        return { header: null, payload: null, signature: null, error: 'Failed to decode header or payload' };
      }

      return { header, payload, signature, error: undefined };
    } catch (err) {
      return { 
        header: null, 
        payload: null, 
        signature: null, 
        error: `Failed to decode JWT: ${err instanceof Error ? err.message : 'Unknown error'}` 
      };
    }
  }, [decodeBase64]);

  const validateClaims = useCallback((payload: Record<string, unknown> | null) => {
    if (!payload) {
      setValidationStatus({ isValid: false, message: 'No payload to validate' });
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const issues: string[] = [];
    let isValid = true;

    // Check exp (expiration)
    if (payload.exp !== undefined) {
      const exp = Number(payload.exp);
      if (exp < now) {
        issues.push(`Token expired at ${new Date(exp * 1000).toISOString()}`);
        isValid = false;
      } else {
        issues.push(`Expires at ${new Date(exp * 1000).toISOString()}`);
      }
    }

    // Check nbf (not before)
    if (payload.nbf !== undefined) {
      const nbf = Number(payload.nbf);
      if (nbf > now) {
        issues.push(`Not valid until ${new Date(nbf * 1000).toISOString()}`);
        isValid = false;
      } else {
        issues.push(`Valid since ${new Date(nbf * 1000).toISOString()}`);
      }
    }

    // Check iat (issued at)
    if (payload.iat !== undefined) {
      const iat = Number(payload.iat);
      issues.push(`Issued at ${new Date(iat * 1000).toISOString()}`);
    }

    setValidationStatus({
      exp: payload.exp ? new Date(Number(payload.exp) * 1000).toISOString() : undefined,
      nbf: payload.nbf ? new Date(Number(payload.nbf) * 1000).toISOString() : undefined,
      iat: payload.iat ? new Date(Number(payload.iat) * 1000).toISOString() : undefined,
      isValid,
      message: issues.join('\n')
    });
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
    const result = decodeJWT(value);
    setDecoded(result);
    if (!result.error && result.payload) {
      validateClaims(result.payload);
    } else {
      setValidationStatus({ isValid: false, message: result.error || '' });
    }
  };

  const loadSample = (key: keyof typeof sampleTokens) => {
    setInput(sampleTokens[key]);
  };

  const copyPart = (part: 'header' | 'payload' | 'signature') => {
    const data = decoded[part];
    if (data) {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    }
  };

  const copyRaw = (part: 'header' | 'payload' | 'signature') => {
    if (part === 'header') {
      const parts = input.split('.');
      navigator.clipboard.writeText(parts[0] || '');
    } else if (part === 'payload') {
      const parts = input.split('.');
      navigator.clipboard.writeText(parts[1] || '');
    } else {
      navigator.clipboard.writeText(decoded.signature || '');
    }
  };

  const formatJSON = (obj: Record<string, unknown> | null) => {
    if (!obj) return '';
    return JSON.stringify(obj, null, 2);
  };

  // Handle multiple JWTs
  const handleMultipleInput = (value: string) => {
    setMultipleTokens(value.split('\n').filter(t => t.trim()));
  };

  const decodeMultiple = () => {
    // This would show decoded tokens in a list
    const decodedList = multipleTokens.map(token => ({
      token: token.substring(0, 50) + '...',
      ...decodeJWT(token)
    }));
    return decodedList;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          JWT Decoder
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Decode and inspect JWT tokens. Paste your token to see the header and payload.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <select
          onChange={(e) => loadSample(e.target.value as keyof typeof sampleTokens)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">Load Sample Token...</option>
          <option value="basic">Basic Token</option>
          <option value="expired">Expired Token</option>
          <option value="withRoles">Token with Roles</option>
          <option value="complex">Complex Token</option>
        </select>
        <button
          onClick={() => setShowMultiple(!showMultiple)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            showMultiple 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Multiple Tokens
        </button>
      </div>

      {showMultiple ? (
        <div className="space-y-6">
          <TextArea
            label="Multiple JWT Tokens (one per line)"
            value={multipleTokens.join('\n')}
            onChange={handleMultipleInput}
            placeholder="Paste multiple JWT tokens here..."
            rows={10}
          />
          {multipleTokens.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Decoded Tokens</h3>
              {decodeMultiple().map((decoded, i) => (
                <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-500 font-mono mb-2">{decoded.token}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-400">Header</span>
                      <pre className="text-xs font-mono text-gray-900 dark:text-white">
                        {formatJSON(decoded.header) || 'N/A'}
                      </pre>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Payload</span>
                      <pre className="text-xs font-mono text-gray-900 dark:text-white">
                        {formatJSON(decoded.payload) || 'N/A'}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TextArea
            label="JWT Token"
            value={input}
            onChange={handleInputChange}
            placeholder="Paste your JWT token here (eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
            error={decoded.error}
            rows={10}
          />

          <div className="space-y-4">
            {/* Claims Validation */}
            {decoded.payload && (
              <div className={`p-4 rounded-lg border ${
                validationStatus.isValid 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
              }`}>
                <h3 className={`text-sm font-medium mb-2 ${
                  validationStatus.isValid 
                    ? 'text-green-800 dark:text-green-400' 
                    : 'text-yellow-800 dark:text-yellow-400'
                }`}>
                  Claims Validation
                </h3>
                <div className="text-xs space-y-1 text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap">
                  {validationStatus.message || 'No time-based claims found'}
                </div>
              </div>
            )}

            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Header (Algorithm & Type)
                </label>
                <div className="flex gap-1">
                  <button
                    onClick={() => copyPart('header')}
                    className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    title="Copy as JSON"
                  >
                    Copy JSON
                  </button>
                  <button
                    onClick={() => copyRaw('header')}
                    className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    title="Copy raw base64"
                  >
                    Copy Raw
                  </button>
                </div>
              </div>
              <pre className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm overflow-auto max-h-40">
                {formatJSON(decoded.header) || 'No header decoded'}
              </pre>
            </div>

            {/* Payload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Payload (Data)
                </label>
                <div className="flex gap-1">
                  <button
                    onClick={() => copyPart('payload')}
                    className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    title="Copy as JSON"
                  >
                    Copy JSON
                  </button>
                  <button
                    onClick={() => copyRaw('payload')}
                    className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    title="Copy raw base64"
                  >
                    Copy Raw
                  </button>
                </div>
              </div>
              <pre className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm overflow-auto max-h-60">
                {formatJSON(decoded.payload) || 'No payload decoded'}
              </pre>
            </div>

            {decoded.signature && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Signature
                  </label>
                  <button
                    onClick={() => copyRaw('signature')}
                    className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    title="Copy signature"
                  >
                    Copy
                  </button>
                </div>
                <div className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-mono text-sm break-all">
                  {decoded.signature}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Note: Signature verification requires a secret key. This tool only decodes the token.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
