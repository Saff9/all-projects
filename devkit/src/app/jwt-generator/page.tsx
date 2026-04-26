'use client';

import { useState, useCallback } from 'react';
import BackButton from '@/components/BackButton';
import Breadcrumbs from '@/components/Breadcrumbs';
import TextArea from '@/components/TextArea';
import { sanitizeString } from '@/utils/security';
import { Copy, Check, RefreshCw, Shield } from 'lucide-react';

interface JWTClaims {
  iss?: string;
  sub?: string;
  aud?: string;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: string | number | boolean | undefined | (string | number | boolean)[];
}

export default function JwtGenerator() {
  const [header, setHeader] = useState('{"alg":"HS256","typ":"JWT"}');
  const [claims, setClaims] = useState<JWTClaims>({
    iss: 'devkit.app',
    sub: 'user123',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  });
  const [secret, setSecret] = useState('your-256-bit-secret');
  const [generatedToken, setGeneratedToken] = useState('');
  const [algorithm, setAlgorithm] = useState<'HS256' | 'HS384' | 'HS512'>('HS256');
  const [copied, setCopied] = useState(false);

  // Base64 URL encode
  const base64UrlEncode = (str: string): string => {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  // Simple HMAC implementation (for demo purposes)
  const createHmac = async (data: string, secret: string, algo: string): Promise<string> => {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: { name: algo === 'HS256' ? 'SHA-256' : algo === 'HS384' ? 'SHA-384' : 'SHA-512' } },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    return base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
  };

  const generateToken = useCallback(async () => {
    try {
      const headerObj = JSON.parse(header);
      const headerEncoded = base64UrlEncode(JSON.stringify(headerObj));
      
      // Update iat and exp if needed
      const claimsWithDefaults = {
        ...claims,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const claimsEncoded = base64UrlEncode(JSON.stringify(claimsWithDefaults));
      
      const algoMap: Record<string, string> = {
        'HS256': 'SHA-256',
        'HS384': 'SHA-384',
        'HS512': 'SHA-512',
      };
      
      const signature = await createHmac(
        `${headerEncoded}.${claimsEncoded}`,
        secret,
        algoMap[algorithm]
      );
      
      setGeneratedToken(`${headerEncoded}.${claimsEncoded}.${signature}`);
    } catch (err) {
      console.error('Error generating token:', err);
    }
  }, [header, claims, secret, algorithm]);

  const updateClaim = (key: string, value: string) => {
    if (key === 'exp' || key === 'iat' || key === 'nbf') {
      setClaims(prev => ({ ...prev, [key]: parseInt(value) || 0 }));
    } else {
      setClaims(prev => ({ ...prev, [key]: value }));
    }
  };

  const addCustomClaim = () => {
    const key = prompt('Enter custom claim key:');
    if (key) {
      setClaims(prev => ({ ...prev, [key]: '' }));
    }
  };

  const removeClaim = (key: string) => {
    const { [key]: _, ...rest } = claims;
    setClaims(rest);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSampleToken = () => {
    setClaims({
      iss: 'devkit.app',
      sub: 'user@example.com',
      name: 'John Doe',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      roles: ['user', 'admin'],
    });
    setSecret('devkit-secret-key');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Breadcrumbs />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-400" />
            JWT Token Generator
          </h1>
          <p className="text-gray-400">
            Create and sign JWT tokens with custom claims
          </p>
        </div>
        <BackButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Configuration */}
        <div className="space-y-6">
          {/* Algorithm Selection */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Algorithm</h3>
            <div className="flex gap-2">
              {(['HS256', 'HS384', 'HS512'] as const).map((algo) => (
                <button
                  key={algo}
                  onClick={() => setAlgorithm(algo)}
                  className={`px-4 py-2 rounded-lg font-mono text-sm transition-colors ${
                    algorithm === algo
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {algo}
                </button>
              ))}
            </div>
          </div>

          {/* Secret Key */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Secret Key</h3>
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(sanitizeString(e.target.value, 100))}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter your secret key"
            />
            <p className="text-xs text-zinc-500 mt-2">
              Keep this secret safe. It's used to sign the token.
            </p>
          </div>

          {/* Claims */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Claims</h3>
              <button
                onClick={addCustomClaim}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add Claim
              </button>
            </div>
            
            <div className="space-y-3">
              {Object.entries(claims).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={key}
                    readOnly
                    className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-400 text-sm font-mono"
                  />
                  <input
                    type={key === 'exp' || key === 'iat' || key === 'nbf' ? 'number' : 'text'}
                    value={value as string | number}
                    onChange={(e) => updateClaim(key, e.target.value)}
                    className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  {key !== 'iss' && key !== 'sub' && (
                    <button
                      onClick={() => removeClaim(key)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateToken}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Generate Token
          </button>
        </div>

        {/* Right Column - Output */}
        <div className="space-y-6">
          {/* Generated Token */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Generated Token</h3>
            {generatedToken ? (
              <div>
                <div className="relative">
                  <textarea
                    value={generatedToken}
                    readOnly
                    className="w-full h-48 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono text-sm break-all resize-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="absolute top-2 right-2 p-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                    aria-label="Copy token"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Token Parts */}
                <div className="mt-4 space-y-2">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <span className="text-xs text-blue-400 font-mono">HEADER</span>
                    <pre className="text-xs text-white font-mono mt-1 overflow-x-auto">
                      {JSON.stringify(JSON.parse(atob(generatedToken.split('.')[0].replace(/-/g, '+').replace(/_/g, '/'))), null, 2)}
                    </pre>
                  </div>
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <span className="text-xs text-purple-400 font-mono">PAYLOAD</span>
                    <pre className="text-xs text-white font-mono mt-1 overflow-x-auto">
                      {JSON.stringify(JSON.parse(atob(generatedToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))), null, 2)}
                    </pre>
                  </div>
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <span className="text-xs text-green-400 font-mono">VERIFY SIGNATURE</span>
                    <p className="text-xs text-zinc-400 mt-1">
                      HMAC SHA{algorithm.slice(-3)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-zinc-500">
                Click "Generate Token" to create a JWT
              </div>
            )}
          </div>

          {/* Sample Button */}
          <button
            onClick={loadSampleToken}
            className="w-full py-3 bg-zinc-800 text-zinc-400 rounded-xl hover:bg-zinc-700 transition-colors"
          >
            Load Sample Claims
          </button>
        </div>
      </div>
    </div>
  );
}
