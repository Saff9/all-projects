'use client';

import { useState, useCallback, useEffect } from 'react';

// Common passwords blacklist
const commonPasswords = [
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', 'master',
  'dragon', 'letmein', 'login', 'princess', 'sunshine', 'password123',
  'admin', 'welcome', 'iloveyou', 'shadow', 'superman', 'michael',
  'football', 'baseball', 'soccer', 'hockey', 'batman', 'trustno1',
  'hunter', 'harley', 'ranger', 'thomas', 'robert', 'jordan', 'daniel',
  'andrew', 'joshua', 'matthew', 'jennifer', 'jessica', 'michelle',
  'amanda', 'ashley', 'nicole', 'computer', 'internet', 'starwars'
];

// Words for passphrase generation
const wordList = [
  'apple', 'brave', 'cloud', 'delta', 'eagle', 'focus', 'grape', 'house',
  'image', 'juice', 'knife', 'lemon', 'mango', 'noble', 'ocean', 'piano',
  'queen', 'river', 'solar', 'tiger', 'ultra', 'vivid', 'water', 'xenon',
  'yacht', 'zebra', 'arrow', 'blaze', 'crown', 'dream', 'ember', 'frost',
  'globe', 'heart', 'index', 'jewel', 'karma', 'light', 'magic', 'night',
  'orbit', 'pixel', 'quest', 'radio', 'storm', 'token', 'unity', 'vapor',
  'watch', 'xray', 'yield', 'zone', 'amber', 'brick', 'chalk', 'drift',
  'flame', 'giant', 'haven', 'ivory', 'jolly', 'kite', 'lunar', 'metal',
  'naïve', 'oxide', 'pearl', 'quartz', 'ridge', 'spark', 'trail', 'urban',
  'vocal', 'whisk', 'young', 'zone'
];

// Pronounceable patterns
const pronounceablePatterns = [
  'CVC', 'CVCV', 'CVCCV', 'CVCVC', 'CVCVCV', 'CVCCVC',
  'CVCVCVC', 'CVCCVCV', 'CVCVCVCV'
];

const consonants = 'bcdfghjklmnpqrstvwxyz';
const vowels = 'aeiou';

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState<'weak' | 'medium' | 'strong'>('medium');
  const [mode, setMode] = useState<'random' | 'passphrase' | 'pin' | 'pronounceable'>('random');
  const [wordCount, setWordCount] = useState(4);
  const [pinLength, setPinLength] = useState(6);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [separator, setSeparator] = useState('-');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('password-generator-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setOptions(settings.options || options);
      setMode(settings.mode || 'random');
      setLength(settings.length || 16);
      setWordCount(settings.wordCount || 4);
      setPinLength(settings.pinLength || 6);
      setSeparator(settings.separator || '-');
    }
    const savedHistory = localStorage.getItem('password-generator-history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: Partial<typeof options>) => {
    const currentSettings = {
      options: { ...options, ...newSettings },
      mode,
      length,
      wordCount,
      pinLength,
      separator
    };
    localStorage.setItem('password-generator-settings', JSON.stringify(currentSettings));
  }, [options, mode, length, wordCount, pinLength, separator]);

  const generateRandomPassword = useCallback(() => {
    const chars = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    };

    let validChars = '';
    if (options.uppercase) validChars += chars.uppercase;
    if (options.lowercase) validChars += chars.lowercase;
    if (options.numbers) validChars += chars.numbers;
    if (options.symbols) validChars += chars.symbols;

    if (validChars === '') {
      setPassword('');
      return '';
    }

    let result = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      result += validChars[array[i] % validChars.length];
    }

    // Check against blacklist
    if (commonPasswords.includes(result.toLowerCase())) {
      return generateRandomPassword();
    }

    return result;
  }, [length, options]);

  const generatePassphrase = useCallback(() => {
    const selectedWords = [];
    const array = new Uint32Array(wordCount);
    crypto.getRandomValues(array);

    for (let i = 0; i < wordCount; i++) {
      selectedWords.push(wordList[array[i] % wordList.length]);
    }

    let result = selectedWords.join(separator);

    // Optionally add numbers
    if (includeNumbers) {
      const num = crypto.getRandomValues(new Uint32Array(1))[0] % 100;
      result += `${separator}${num}`;
    }

    // Optionally add symbols
    if (includeSymbols) {
      const symbols = '!@#$%&*?';
      const symIndex = crypto.getRandomValues(new Uint32Array(1))[0] % symbols.length;
      result += symbols[symIndex];
    }

    return result;
  }, [wordCount, separator, includeNumbers, includeSymbols]);

  const generatePIN = useCallback(() => {
    const digits = '0123456789';
    let result = '';
    const array = new Uint32Array(pinLength);
    crypto.getRandomValues(array);

    for (let i = 0; i < pinLength; i++) {
      result += digits[array[i] % digits.length];
    }

    // Avoid common patterns
    if (/^(.)\1+$/.test(result) || result === '123456' || result === '654321') {
      return generatePIN();
    }

    return result;
  }, [pinLength]);

  const generatePronounceable = useCallback(() => {
    const patterns = pronounceablePatterns;
    const pattern = patterns[crypto.getRandomValues(new Uint32Array(1))[0] % patterns.length];
    let result = '';
    const array = new Uint32Array(pattern.length);
    crypto.getRandomValues(array);

    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] === 'C') {
        const idx = array[i] % consonants.length;
        const char = consonants[idx];
        result += options.uppercase && i === 0 ? char.toUpperCase() : char;
      } else {
        result += vowels[crypto.getRandomValues(new Uint32Array(1))[0] % vowels.length];
      }
    }

    // Optionally add numbers
    if (includeNumbers) {
      result += crypto.getRandomValues(new Uint32Array(1))[0] % 100;
    }

    // Optionally add symbols
    if (includeSymbols) {
      const symbols = '!@#$%^&*?';
      result += symbols[crypto.getRandomValues(new Uint32Array(1))[0] % symbols.length];
    }

    return result;
  }, [options.uppercase, includeNumbers, includeSymbols]);

  const generatePassword = useCallback(() => {
    let newPassword = '';
    switch (mode) {
      case 'passphrase':
        newPassword = generatePassphrase();
        break;
      case 'pin':
        newPassword = generatePIN();
        break;
      case 'pronounceable':
        newPassword = generatePronounceable();
        break;
      default:
        newPassword = generateRandomPassword();
    }
    setPassword(newPassword);
    
    // Add to history
    const newHistory = [newPassword, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('password-generator-history', JSON.stringify(newHistory));
  }, [mode, generatePassphrase, generatePIN, generatePronounceable, generateRandomPassword, history]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  useEffect(() => {
    let score = 0;
    if (length >= 12) score++;
    if (length >= 16) score++;
    if (options.uppercase) score++;
    if (options.lowercase) score++;
    if (options.numbers) score++;
    if (options.symbols) score++;

    if (mode === 'passphrase') {
      score = wordCount >= 4 ? 3 : wordCount >= 3 ? 2 : 1;
      if (includeNumbers) score++;
      if (includeSymbols) score++;
    }

    if (mode === 'pin') {
      score = pinLength >= 6 ? 3 : pinLength >= 4 ? 2 : 1;
    }

    if (score <= 3) setStrength('weak');
    else if (score <= 5) setStrength('medium');
    else setStrength('strong');
  }, [length, options, mode, wordCount, pinLength, includeNumbers, includeSymbols]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => {
      const newOptions = { ...prev, [key]: !prev[key] };
      saveSettings(newOptions);
      return newOptions;
    });
  };

  const strengthColors = {
    weak: 'bg-red-500',
    medium: 'bg-yellow-500',
    strong: 'bg-green-500',
  };

  const strengthWidth = {
    weak: '33%',
    medium: '66%',
    strong: '100%',
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Password Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate secure random passwords with customizable options.
        </p>
      </div>

      {/* Mode Selection */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: 'random', label: 'Random' },
          { key: 'passphrase', label: 'Passphrase' },
          { key: 'pin', label: 'PIN' },
          { key: 'pronounceable', label: 'Pronounceable' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => {
              setMode(key as typeof mode);
              saveSettings({});
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              mode === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <input
            type="text"
            value={password}
            readOnly
            className="flex-1 px-4 py-3 text-xl font-mono bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
          />
          <button
            onClick={copyToClipboard}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={generatePassword}
            className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Strength:</span>
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${strengthColors[strength]} transition-all duration-300`}
              style={{ width: strengthWidth[strength] }}
            />
          </div>
          <span className={`text-sm font-medium capitalize ${
            strength === 'weak' ? 'text-red-500' : 
            strength === 'medium' ? 'text-yellow-500' : 'text-green-500'
          }`}>
            {strength}
          </span>
        </div>
      </div>

      {/* Mode-specific Options */}
      <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
        {mode === 'random' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Length: {length}
            </label>
            <input
              type="range"
              min={4}
              max={64}
              value={length}
              onChange={(e) => {
                setLength(parseInt(e.target.value));
                saveSettings({});
              }}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>4</span>
              <span>64</span>
            </div>
          </div>
        )}

        {mode === 'passphrase' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Word Count: {wordCount}
              </label>
              <input
                type="range"
                min={3}
                max={8}
                value={wordCount}
                onChange={(e) => {
                  setWordCount(parseInt(e.target.value));
                  saveSettings({});
                }}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>3</span>
                <span>8</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Separator
              </label>
              <select
                value={separator}
                onChange={(e) => {
                  setSeparator(e.target.value);
                  saveSettings({});
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="-">Hyphen (-)</option>
                <option value="_">Underscore (_)</option>
                <option value=".">Period (.)</option>
                <option value=" ">Space</option>
                <option value="">None</option>
              </select>
            </div>
          </>
        )}

        {mode === 'pin' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              PIN Length: {pinLength}
            </label>
            <input
              type="range"
              min={4}
              max={12}
              value={pinLength}
              onChange={(e) => {
                setPinLength(parseInt(e.target.value));
                saveSettings({});
              }}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>4</span>
              <span>12</span>
            </div>
          </div>
        )}

        {(mode === 'passphrase' || mode === 'pronounceable') && (
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => {
                  setIncludeNumbers(e.target.checked);
                  saveSettings({});
                }}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Include Numbers</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(e) => {
                  setIncludeSymbols(e.target.checked);
                  saveSettings({});
                }}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Include Symbols</span>
            </label>
          </div>
        )}

        {mode === 'random' && (
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'uppercase', label: 'Uppercase (A-Z)' },
              { key: 'lowercase', label: 'Lowercase (a-z)' },
              { key: 'numbers', label: 'Numbers (0-9)' },
              { key: 'symbols', label: 'Symbols (!@#$%)' },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={options[key as keyof typeof options]}
                  onChange={() => toggleOption(key as keyof typeof options)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 1 && (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Passwords</h3>
          <div className="flex flex-wrap gap-2">
            {history.slice(1).map((pwd, i) => (
              <button
                key={i}
                onClick={() => {
                  setPassword(pwd);
                  navigator.clipboard.writeText(pwd);
                }}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 font-mono"
                title="Click to copy"
              >
                {pwd.substring(0, 8)}...
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
