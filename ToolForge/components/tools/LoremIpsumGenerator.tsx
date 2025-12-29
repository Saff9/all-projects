'use client';

import { useState, useMemo } from 'react';
import { FileSignature, Copy, Check, RefreshCw, Code, FileText } from 'lucide-react';

const WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'curabitur', 'vel',
  'hendrerit', 'libero', 'eleifend', 'blandit', 'nunc', 'ornare', 'odio', 'ut', 'orci', 'gravida',
  'imperdiet', 'nullam', 'purus', 'lacinia', 'a', 'pretium', 'quis', 'congue', 'praesent', 'sagittis',
  'laoreet', 'auctor', 'mauris', 'non', 'velit', 'eros', 'dictum', 'proin', 'accumsan', 'sapien',
  'nec', 'massa', 'volutpat', 'venenatis', 'sed', 'eu', 'molestie', 'lacus', 'quisque', 'porttitor',
  'ligula', 'malesuada', 'sollicitudin', 'est', 'eget', 'feugiat', 'quam', 'pulvinar', 'phasellus'
];

export default function LoremIpsumGenerator() {
  const [unit, setUnit] = useState<'paragraphs' | 'sentences' | 'words' | 'lists'>('paragraphs');
  const [quantity, setQuantity] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [wrapHtml, setWrapHtml] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateSentence = (isFirst: boolean) => {
    const len = Math.floor(Math.random() * 8) + 8;
    const words: string[] = [];
    if (isFirst && startWithLorem) {
      words.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet,', 'consectetur', 'adipiscing', 'elit.');
      return words.join(' ');
    }
    for (let i = 0; i < len; i++) {
      const w = WORDS[Math.floor(Math.random() * WORDS.length)];
      words.push(i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w);
    }
    return words.join(' ') + '.';
  };

  const generateParagraph = (isFirst: boolean) => {
    const sentenceCount = Math.floor(Math.random() * 3) + 4;
    const sentences: string[] = [];
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence(isFirst && i === 0));
    }
    return sentences.join(' ');
  };

  const output = useMemo(() => {
    if (unit === 'words') {
      const list: string[] = [];
      if (startWithLorem) {
        list.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet');
      }
      while (list.length < quantity) {
        list.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
      }
      const text = list.slice(0, quantity).join(' ');
      return wrapHtml ? `<p>${text}</p>` : text;
    }

    if (unit === 'sentences') {
      const sentences: string[] = [];
      for (let i = 0; i < quantity; i++) {
        sentences.push(generateSentence(i === 0));
      }
      return wrapHtml ? sentences.map((s) => `<p>${s}</p>`).join('\n') : sentences.join(' ');
    }

    if (unit === 'lists') {
      const items: string[] = [];
      for (let i = 0; i < quantity; i++) {
        items.push(generateSentence(false).replace('.', ''));
      }
      if (wrapHtml) {
        return `<ul>\n${items.map((it) => `  <li>${it}</li>`).join('\n')}\n</ul>`;
      }
      return items.map((it) => `• ${it}`).join('\n');
    }

    // Paragraphs
    const paras: string[] = [];
    for (let i = 0; i < quantity; i++) {
      paras.push(generateParagraph(i === 0));
    }
    if (wrapHtml) {
      return paras.map((p) => `<p>${p}</p>`).join('\n\n');
    }
    return paras.join('\n\n');
  }, [unit, quantity, startWithLorem, wrapHtml]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Configuration Column */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          {/* Unit selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Generate Unit
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['paragraphs', 'sentences', 'words', 'lists'] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border capitalize transition-colors ${
                    unit === u
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Count / Quantity</span>
              <span className="font-mono">{quantity} {unit}</span>
            </div>
            <input
              type="range"
              min={1}
              max={unit === 'words' ? 250 : 20}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={startWithLorem}
                onChange={(e) => setStartWithLorem(e.target.checked)}
                className="rounded text-indigo-600 w-4 h-4"
              />
              Start with &quot;Lorem ipsum dolor sit amet...&quot;
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={wrapHtml}
                onChange={(e) => setWrapHtml(e.target.checked)}
                className="rounded text-indigo-600 w-4 h-4"
              />
              Wrap in HTML tags (&lt;p&gt;, &lt;ul&gt;, &lt;li&gt;)
            </label>
          </div>
        </div>
      </div>

      {/* Output Column */}
      <div className="lg:col-span-7 space-y-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSignature className="w-4 h-4 text-indigo-500" />
              Generated Dummy Text
            </h3>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Text!' : 'Copy to Clipboard'}
            </button>
          </div>

          <textarea
            readOnly
            rows={14}
            value={output}
            className={`w-full p-4 rounded-xl text-xs leading-relaxed border focus:outline-none resize-none ${
              wrapHtml
                ? 'bg-slate-950 text-emerald-400 font-mono border-slate-800'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 font-sans border-slate-200 dark:border-slate-700'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
