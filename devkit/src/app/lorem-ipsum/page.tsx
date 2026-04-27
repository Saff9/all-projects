'use client';

import { useState, useCallback } from 'react';
import { Type, Copy, RefreshCw, Settings2 } from 'lucide-react';

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
];

export default function LoremIpsum() {
  const [paragraphs, setParagraphs] = useState(3);
  const [sentencesPerParagraph, setSentencesPerParagraph] = useState(5);
  const [wordsPerSentence, setWordsPerSentence] = useState(8);
  const [output, setOutput] = useState('');
  const [format, setFormat] = useState<'plain' | 'html'>('plain');

  const generateSentence = useCallback(() => {
    const words: string[] = [];
    const count = Math.max(4, wordsPerSentence + Math.floor(Math.random() * 4) - 2);
    
    for (let i = 0; i < count; i++) {
      const word = LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
      words.push(i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word);
    }
    
    return words.join(' ') + '.';
  }, [wordsPerSentence]);

  const generateParagraph = useCallback(() => {
    const sentences: string[] = [];
    for (let i = 0; i < sentencesPerParagraph; i++) {
      sentences.push(generateSentence());
    }
    return sentences.join(' ');
  }, [sentencesPerParagraph, generateSentence]);

  const generate = useCallback(() => {
    const paras: string[] = [];
    for (let i = 0; i < paragraphs; i++) {
      paras.push(generateParagraph());
    }
    
    if (format === 'html') {
      setOutput(paras.map(p => `<p>${p}</p>`).join('\n\n'));
    } else {
      setOutput(paras.join('\n\n'));
    }
  }, [paragraphs, generateParagraph, format]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
            <Type className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Lorem Ipsum Generator</h1>
            <p className="text-zinc-400">Generate placeholder text for your designs</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl glass space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">Settings</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Paragraphs: {paragraphs}
              </label>
              <input
                type="range"
                min={1}
                max={20}
                value={paragraphs}
                onChange={(e) => setParagraphs(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Sentences per paragraph: {sentencesPerParagraph}
              </label>
              <input
                type="range"
                min={1}
                max={20}
                value={sentencesPerParagraph}
                onChange={(e) => setSentencesPerParagraph(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Words per sentence: {wordsPerSentence}
              </label>
              <input
                type="range"
                min={4}
                max={20}
                value={wordsPerSentence}
                onChange={(e) => setWordsPerSentence(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Format
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFormat('plain')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    format === 'plain'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  Plain Text
                </button>
                <button
                  onClick={() => setFormat('html')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    format === 'html'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  HTML
                </button>
              </div>
            </div>

            <button
              onClick={generate}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all btn-lift"
            >
              <RefreshCw className="w-5 h-5" />
              Generate
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-2xl glass h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Generated Text</h3>
              {output && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 bg-white/5 rounded-lg hover:bg-white/10 hover:text-white transition-all"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              )}
            </div>
            
            {output ? (
              <div className="prose prose-invert max-w-none">
                {format === 'html' ? (
                  <pre className="whitespace-pre-wrap text-zinc-300 font-mono text-sm">{output}</pre>
                ) : (
                  <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {output}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-zinc-500">
                <div className="text-center">
                  <Type className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Click Generate to create text</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
