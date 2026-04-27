'use client';

import { useState, useCallback, useEffect } from 'react';
import TextArea from '@/components/TextArea';

// Common regex patterns library
const regexLibrary = {
  // Basic
  email: { pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', desc: 'Email address' },
  url: { pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)', desc: 'URL' },
  phone: { pattern: '^[+]?[(]?[0-9]{1,3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$', desc: 'Phone number' },
  ipv4: { pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$', desc: 'IPv4 address' },
  ipv6: { pattern: '^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$', desc: 'IPv6 address' },
  
  // Date/Time
  date_iso: { pattern: '^\\d{4}-\\d{2}-\\d{2}$', desc: 'ISO Date (YYYY-MM-DD)' },
  date_us: { pattern: '^\\d{1,2}\\/\\d{1,2}\\/\\d{2,4}$', desc: 'US Date (MM/DD/YYYY)' },
  time_24: { pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$', desc: '24-hour Time' },
  datetime_iso: { pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d+)?(Z|[+-]\\d{2}:\\d{2})?$', desc: 'ISO DateTime' },
  
  // Text
  alphanumeric: { pattern: '^[a-zA-Z0-9]+$', desc: 'Alphanumeric only' },
  alphanumeric_spaces: { pattern: '^[a-zA-Z0-9\\s]+$', desc: 'Alphanumeric with spaces' },
  letters_only: { pattern: '^[a-zA-Z]+$', desc: 'Letters only' },
  hex_color: { pattern: '^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$', desc: 'Hex color' },
  slug: { pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$', desc: 'URL slug' },
  
  // Code
  hex_number: { pattern: '^0x[a-fA-F0-9]+$', desc: 'Hex number' },
  octal_number: { pattern: '^0[0-7]+$', desc: 'Octal number' },
  variable_name: { pattern: '^[a-zA-Z_$][a-zA-Z0-9_$]*$', desc: 'Variable name' },
  
  // Web
  html_tag: { pattern: '<[^>]+>', desc: 'HTML tag' },
  css_hex_color: { pattern: '#[0-9a-fA-F]{3,6}', desc: 'CSS hex color' },
  css_class: { pattern: '\\.[a-zA-Z_-][a-zA-Z0-9_-]*', desc: 'CSS class selector' },
  uuid: { pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$', desc: 'UUID' },
  
  // Financial
  credit_card: { pattern: '^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$', desc: 'Credit card' },
  money: { pattern: '^\\$?\\d{1,3}(,\\d{3})*(\\.\\d{2})?$', desc: 'Money amount' },
};

// Test string presets
const testPresets = {
  emails: 'Contact us at support@example.com or sales@company.org for help. Invalid: @example.com, test@',
  dates: 'Dates: 2024-01-15, 01/15/2024, 2024-12-31, 31/12/2024, not a date',
  urls: 'Visit https://www.example.com/page or http://example.org for more info. Also: ftp://files.example.com',
  mixed: 'User John (john@example.com) registered on 2024-01-15. His website: https://john.dev',
  code: 'const variableName = 0xFF; // Valid variables: _private, $value, CONSTANT; Invalid: 123abc',
};

// Regex explainer
const explainRegex = (pattern: string): string => {
  const explanations: Record<string, string> = {
    '^': 'Start of string',
    '$': 'End of string',
    '.': 'Any single character',
    '*': 'Zero or more',
    '+': 'One or more',
    '?': 'Zero or one',
    '\\d': 'Digit (0-9)',
    '\\D': 'Non-digit',
    '\\w': 'Word character (a-z, A-Z, 0-9, _)',
    '\\W': 'Non-word character',
    '\\s': 'Whitespace',
    '\\S': 'Non-whitespace',
    '\\b': 'Word boundary',
    '\\B': 'Non-word boundary',
    '\\n': 'Newline',
    '\\t': 'Tab',
    '[abc]': 'Any of a, b, or c',
    '[^abc]': 'Any except a, b, or c',
    '[a-z]': 'Character range a-z',
    '(abc)': 'Capturing group',
    '(?:abc)': 'Non-capturing group',
    'a|b': 'a or b',
    '{n}': 'Exactly n times',
    '{n,}': 'n or more times',
    '{n,m}': 'Between n and m times',
  };

  let explanation = 'Pattern breakdown:\n';
  const tokens = pattern.match(/(\\^[.$*+?|()\\[\\]{}\\\\]|\\d+|\\[\\^?[^\\]]+\\]|\\?|<[^>]+>|[^.^.$*+?|()\\[\\]{}]+)/g) || [];
  
  tokens.forEach(token => {
    if (explanations[token]) {
      explanation += `  ${token} → ${explanations[token]}\n`;
    } else if (token.startsWith('\\') && explanations[token]) {
      explanation += `  ${token} → ${explanations[token]}\n`;
    }
  });

  return explanation || 'Hover over regex syntax to see explanations';
};

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('');
  const [matches, setMatches] = useState<Array<{ match: string; index: number; groups?: string[] }>>([]);
  const [error, setError] = useState('');
  const [highlightedText, setHighlightedText] = useState<React.ReactNode[]>([]);
  const [savedPatterns, setSavedPatterns] = useState<Array<{ name: string; pattern: string; flags: string }>>([]);
  const [patternName, setPatternName] = useState('');
  const [showCheatsheet, setShowCheatsheet] = useState(false);
  const [replacement, setReplacement] = useState('');
  const [replacedText, setReplacedText] = useState('');
  const [activeTab, setActiveTab] = useState<'match' | 'replace'>('match');

  // Load saved patterns from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('regex-saved-patterns');
    if (saved) {
      setSavedPatterns(JSON.parse(saved));
    }
  }, []);

  const testRegex = useCallback(() => {
    try {
      if (!pattern || !text) {
        setMatches([]);
        setError('');
        setHighlightedText([text]);
        return;
      }

      const regex = new RegExp(pattern, flags);
      const results: Array<{ match: string; index: number; groups?: string[] }> = [];
      
      if (flags.includes('g')) {
        let match;
        while ((match = regex.exec(text)) !== null) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
          if (match[0] === '') regex.lastIndex++;
        }
      } else {
        const match = regex.exec(text);
        if (match) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      }

      setMatches(results);
      setError('');

      // Build highlighted text with colors
      const colors = ['bg-yellow-300 dark:bg-yellow-600', 'bg-green-300 dark:bg-green-600', 'bg-blue-300 dark:bg-blue-600', 'bg-purple-300 dark:bg-purple-600', 'bg-pink-300 dark:bg-pink-600'];
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      results.forEach((result, i) => {
        if (result.index > lastIndex) {
          parts.push(<span key={`text-${i}`}>{text.slice(lastIndex, result.index)}</span>);
        }
        parts.push(
          <mark key={`match-${i}`} className={`${colors[i % colors.length]} px-1 rounded mx-0.5`}>
            {result.match}
          </mark>
        );
        lastIndex = result.index + result.match.length;
      });
      if (lastIndex < text.length) {
        parts.push(<span key="text-end">{text.slice(lastIndex)}</span>);
      }
      setHighlightedText(parts.length > 0 ? parts : [text]);
    } catch (err) {
      setError(`Invalid regex: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setMatches([]);
      setHighlightedText([text]);
    }
  }, [pattern, flags, text]);

  const performReplace = useCallback(() => {
    try {
      if (!pattern || !text) {
        setReplacedText(text);
        return;
      }
      const regex = new RegExp(pattern, flags);
      setReplacedText(text.replace(regex, replacement));
    } catch (err) {
      setError(`Replace error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [pattern, flags, text, replacement]);

  useEffect(() => {
    testRegex();
  }, [testRegex]);

  const flagOptions = [
    { flag: 'g', label: 'g', desc: 'Global' },
    { flag: 'i', label: 'i', desc: 'Ignore case' },
    { flag: 'm', label: 'm', desc: 'Multiline' },
    { flag: 's', label: 's', desc: 'Dot all' },
    { flag: 'u', label: 'u', desc: 'Unicode' },
    { flag: 'y', label: 'y', desc: 'Sticky' },
  ];

  const toggleFlag = (flag: string) => {
    setFlags(prev => 
      prev.includes(flag) 
        ? prev.replace(flag, '') 
        : prev + flag
    );
  };

  const savePattern = () => {
    if (!patternName.trim()) {
      alert('Please enter a name for this pattern');
      return;
    }
    const newPatterns = [...savedPatterns, { name: patternName, pattern, flags }];
    setSavedPatterns(newPatterns);
    localStorage.setItem('regex-saved-patterns', JSON.stringify(newPatterns));
    setPatternName('');
  };

  const loadPattern = (saved: { pattern: string; flags: string }) => {
    setPattern(saved.pattern);
    setFlags(saved.flags);
  };

  const deletePattern = (index: number) => {
    const newPatterns = savedPatterns.filter((_, i) => i !== index);
    setSavedPatterns(newPatterns);
    localStorage.setItem('regex-saved-patterns', JSON.stringify(newPatterns));
  };

  const loadFromLibrary = (key: keyof typeof regexLibrary) => {
    setPattern(regexLibrary[key].pattern);
  };

  const loadPreset = (key: keyof typeof testPresets) => {
    setText(testPresets[key]);
  };

  const copyMatch = (match: string) => {
    navigator.clipboard.writeText(match);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Regex Tester
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test regular expressions with live matching and capture groups.
        </p>
      </div>

      {/* Pattern Input */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Regular Expression
        </label>
        <div className="flex gap-2">
          <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-l-lg text-gray-500 font-mono">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern..."
            className="flex-1 px-4 py-2 border-y border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
          />
          <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 font-mono">/</span>
          <input
            type="text"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="flags"
            className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
          />
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2">
          {flagOptions.map(({ flag, label, desc }) => (
            <button
              key={flag}
              onClick={() => toggleFlag(flag)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                flags.includes(flag)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title={desc}
            >
              {label}
            </button>
          ))}
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2 self-center" />
          <select
            onChange={(e) => loadFromLibrary(e.target.value as keyof typeof regexLibrary)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">Load Pattern...</option>
            {Object.entries(regexLibrary).map(([key, { desc }]) => (
              <option key={key} value={key}>{desc}</option>
            ))}
          </select>
          <button
            onClick={() => setShowCheatsheet(!showCheatsheet)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              showCheatsheet
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Cheat Sheet
          </button>
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}

        {/* Saved Patterns */}
        {savedPatterns.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Saved Patterns</h4>
            <div className="flex flex-wrap gap-2">
              {savedPatterns.map((saved, i) => (
                <div key={i} className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <button
                    onClick={() => loadPattern(saved)}
                    className="text-xs text-gray-700 dark:text-gray-300 font-mono hover:text-blue-600"
                  >
                    {saved.name}
                  </button>
                  <button
                    onClick={() => deletePattern(i)}
                    className="text-xs text-gray-500 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Pattern */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
          <input
            type="text"
            value={patternName}
            onChange={(e) => setPatternName(e.target.value)}
            placeholder="Pattern name..."
            className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button
            onClick={savePattern}
            className="px-4 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Save Pattern
          </button>
        </div>
      </div>

      {/* Cheatsheet Modal */}
      {showCheatsheet && (
        <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 mb-6">
          <h3 className="text-sm font-medium text-purple-800 dark:text-purple-400 mb-3">Regex Cheat Sheet</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Anchors</h4>
              <div className="space-y-1 text-gray-700 dark:text-gray-300 font-mono text-xs">
                <div><code>^</code> Start of string</div>
                <div><code>$</code> End of string</div>
                <div><code>\b</code> Word boundary</div>
                <div><code>\B</code> Non-word boundary</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Character Classes</h4>
              <div className="space-y-1 text-gray-700 dark:text-gray-300 font-mono text-xs">
                <div><code>.</code> Any character</div>
                <div><code>\d</code> Digit</div>
                <div><code>\w</code> Word char</div>
                <div><code>\s</code> Whitespace</div>
                <div><code>[abc]</code> Any of a, b, c</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Quantifiers</h4>
              <div className="space-y-1 text-gray-700 dark:text-gray-300 font-mono text-xs">
                <div><code>*</code> 0 or more</div>
                <div><code>+</code> 1 or more</div>
                <div><code>?</code> 0 or 1</div>
                <div><code>{'{3}'}</code> Exactly 3</div>
                <div><code>{'{3,}'}</code> 3 or more</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Groups</h4>
              <div className="space-y-1 text-gray-700 dark:text-gray-300 font-mono text-xs">
                <div><code>(abc)</code> Capture group</div>
                <div><code>(?:abc)</code> Non-capturing</div>
                <div><code>a|b</code> Alternation</div>
                <div><code>[a-z]</code> Range</div>
                <div><code>[^a-z]</code> Negation</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Presets */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-sm text-gray-600 dark:text-gray-400 self-center">Test with:</span>
        {Object.keys(testPresets).map((key) => (
          <button
            key={key}
            onClick={() => loadPreset(key as keyof typeof testPresets)}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('match')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'match'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Match
        </button>
        <button
          onClick={() => setActiveTab('replace')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'replace'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Replace
        </button>
      </div>

      {activeTab === 'match' ? (
        <>
          <TextArea
            label="Test Text"
            value={text}
            onChange={setText}
            placeholder="Enter text to test against the regex..."
            rows={10}
          />

          {text && (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Highlighted Matches
              </label>
              <pre className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg font-mono text-sm whitespace-pre-wrap break-all">
                {highlightedText}
              </pre>
            </div>
          )}

          {matches.length > 0 && (
            <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 mt-6">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-400 mb-3">
                Matches ({matches.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-auto">
                {matches.map((match, i) => (
                  <div key={i} className="p-3 bg-white dark:bg-gray-800 rounded-lg flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">#{i + 1}</span>
                        <button
                          onClick={() => copyMatch(match.match)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Copy
                        </button>
                      </div>
                      <code className="text-blue-600 dark:text-blue-400 font-mono">{match.match}</code>
                      <span className="text-xs text-gray-500 ml-2">at index {match.index}</span>
                    </div>
                    {match.groups && match.groups.length > 0 && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Groups: {match.groups.map((g, j) => (
                          <span key={j} className="mr-3">
                            <span className="text-gray-400">${j + 1}:</span> <code className="text-green-600">{g || '(empty)'}</code>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {pattern && text && matches.length === 0 && !error && (
            <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 mt-6">
              <p className="text-yellow-800 dark:text-yellow-400">No matches found</p>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <TextArea
            label="Test Text"
            value={text}
            onChange={setText}
            placeholder="Enter text to test and replace..."
            rows={10}
          />
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Replacement Text
            </label>
            <input
              type="text"
              value={replacement}
              onChange={(e) => {
                setReplacement(e.target.value);
                performReplace();
              }}
              placeholder="Enter replacement text (use $1, $2 for groups)..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
            />
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Result
            </label>
            <pre className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg font-mono text-sm whitespace-pre-wrap break-all">
              {replacedText || text}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
