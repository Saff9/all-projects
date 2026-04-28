'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Info } from 'lucide-react';

interface ParsedUA {
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  deviceType: string;
  engine: string;
  raw: string;
}

const sampleUAs = [
  { name: 'Chrome on Windows', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
  { name: 'Chrome on macOS', ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
  { name: 'Firefox on Windows', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0' },
  { name: 'Safari on macOS', ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15' },
  { name: 'Safari on iPhone', ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1' },
  { name: 'Chrome on Android', ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.210 Mobile Safari/537.36' },
  { name: 'Edge on Windows', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0' },
  { name: 'Bot/Crawler', ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
];

const parseUserAgent = (ua: string): ParsedUA => {
  const result: ParsedUA = {
    browser: 'Unknown',
    browserVersion: 'Unknown',
    os: 'Unknown',
    osVersion: 'Unknown',
    device: 'Unknown',
    deviceType: 'Desktop',
    engine: 'Unknown',
    raw: ua,
  };

  // Detect Browser
  if (ua.includes('Edg/')) {
    result.browser = 'Microsoft Edge';
    const match = ua.match(/Edg\/(\d+)/);
    result.browserVersion = match ? match[1] : 'Unknown';
    result.engine = 'Blink';
  } else if (ua.includes('Chrome/')) {
    result.browser = 'Google Chrome';
    const match = ua.match(/Chrome\/(\d+)/);
    result.browserVersion = match ? match[1] : 'Unknown';
    result.engine = 'Blink';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    result.browser = 'Safari';
    const match = ua.match(/Version\/(\d+)/);
    result.browserVersion = match ? match[1] : 'Unknown';
    result.engine = 'WebKit';
  } else if (ua.includes('Firefox/') || ua.includes('Gecko/')) {
    result.browser = 'Mozilla Firefox';
    const match = ua.match(/Firefox\/(\d+)/);
    result.browserVersion = match ? match[1] : 'Unknown';
    result.engine = 'Gecko';
  } else if (ua.includes('MSIE') || ua.includes('Trident/')) {
    result.browser = 'Internet Explorer';
    const match = ua.match(/(?:MSIE |rv:)(\d+)/);
    result.browserVersion = match ? match[1] : 'Unknown';
    result.engine = 'Trident';
  }

  // Detect OS
  if (ua.includes('Windows NT 10.0')) {
    result.os = 'Windows';
    result.osVersion = '10/11';
  } else if (ua.includes('Windows NT 6.3')) {
    result.os = 'Windows';
    result.osVersion = '8.1';
  } else if (ua.includes('Windows NT 6.2')) {
    result.os = 'Windows';
    result.osVersion = '8';
  } else if (ua.includes('Windows NT 6.1')) {
    result.os = 'Windows';
    result.osVersion = '7';
  } else if (ua.includes('Mac OS X 10_15')) {
    result.os = 'macOS';
    result.osVersion = 'Catalina';
  } else if (ua.includes('Mac OS X 10_14')) {
    result.os = 'macOS';
    result.osVersion = 'Mojave';
  } else if (ua.includes('Mac OS X')) {
    result.os = 'macOS';
    result.osVersion = 'Unknown';
  } else if (ua.includes('Android 14')) {
    result.os = 'Android';
    result.osVersion = '14';
  } else if (ua.includes('Android 13')) {
    result.os = 'Android';
    result.osVersion = '13';
  } else if (ua.includes('Android')) {
    result.os = 'Android';
    const match = ua.match(/Android (\d+)/);
    result.osVersion = match ? match[1] : 'Unknown';
  } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
    result.os = 'iOS';
    const match = ua.match(/OS (\d+)_/);
    result.osVersion = match ? `${match[1]}.x` : 'Unknown';
  } else if (ua.includes('Linux')) {
    result.os = 'Linux';
    result.osVersion = 'Unknown';
  }

  // Detect Device
  if (ua.includes('Mobile')) {
    result.deviceType = 'Mobile';
    if (ua.includes('iPhone')) {
      result.device = 'iPhone';
    } else if (ua.includes('iPad')) {
      result.device = 'iPad';
      result.deviceType = 'Tablet';
    } else if (ua.includes('Pixel')) {
      const match = ua.match(/Pixel (\d+)/);
      result.device = match ? `Google Pixel ${match[1]}` : 'Google Pixel';
    } else if (ua.includes('SM-')) {
      result.device = 'Samsung Galaxy';
    } else {
      result.device = 'Unknown Smartphone';
    }
  } else if (ua.includes('Tablet') || ua.includes('iPad')) {
    result.deviceType = 'Tablet';
    result.device = 'iPad';
  } else {
    result.deviceType = 'Desktop';
    result.device = result.os === 'macOS' ? 'Mac' : result.os === 'Windows' ? 'PC' : 'Computer';
  }

  // Detect Bot
  if (ua.includes('bot') || ua.includes('crawler') || ua.includes('spider')) {
    result.deviceType = 'Bot';
    result.device = 'Crawler/Bot';
  }

  return result;
};

export default function UserAgentParser() {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<ParsedUA | null>(null);
  const [copied, setCopied] = useState(false);

  const handleParse = useCallback(() => {
    if (!input.trim()) {
      setParsed(null);
      return;
    }
    setParsed(parseUserAgent(input));
  }, [input]);

  const loadSample = (sample: string) => {
    setInput(sample);
  };

  const copyResult = useCallback(() => {
    if (parsed) {
      const text = `Browser: ${parsed.browser} ${parsed.browserVersion}
OS: ${parsed.os} ${parsed.osVersion}
Device: ${parsed.device} (${parsed.deviceType})
Engine: ${parsed.engine}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [parsed]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          User Agent Parser
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Parse User-Agent strings to extract browser, OS, and device information.
        </p>
      </div>

      {/* Sample UAs */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Sample User Agents</h3>
        <div className="flex flex-wrap gap-2">
          {sampleUAs.map((sample) => (
            <button
              key={sample.name}
              onClick={() => loadSample(sample.ua)}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          User Agent String
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste a User-Agent string here..."
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        <button
          onClick={handleParse}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Parse User Agent
        </button>
      </div>

      {/* Results */}
      {parsed && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Parsed Result</h3>
            <button
              onClick={copyResult}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Result'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Browser</p>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{parsed.browser}</p>
              <p className="text-sm text-gray-500">Version: {parsed.browserVersion}</p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-green-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Operating System</p>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{parsed.os}</p>
              <p className="text-sm text-gray-500">Version: {parsed.osVersion}</p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-purple-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Device</p>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{parsed.device}</p>
              <p className="text-sm text-gray-500">Type: {parsed.deviceType}</p>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-orange-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Engine</p>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{parsed.engine}</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl md:col-span-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Raw User Agent</p>
              <code className="text-sm text-gray-700 dark:text-gray-300 break-all">{parsed.raw}</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
