'use client';

import { useState, useMemo } from 'react';
import BackButton from '@/components/BackButton';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Copy, Check, Search, Star, Heart, Zap, Code, ArrowLeft, ArrowRight } from 'lucide-react';

interface UnicodeCategory {
  name: string;
  range: [number, number];
  icon: React.ComponentType<{ className?: string }>;
  emojis?: boolean;
}

const UNICODE_CATEGORIES: UnicodeCategory[] = [
  { name: 'Emojis', range: [0x1F600, 0x1F64F], icon: Star },
  { name: 'Dingbats', range: [0x2700, 0x27BF], icon: Zap },
  { name: 'Hearts', range: [0x2764, 0x2764], icon: Heart },
  { name: 'Arrows', range: [0x2190, 0x21FF], icon: ArrowRight },
  { name: 'Math Symbols', range: [0x2200, 0x22FF], icon: Code },
  { name: 'Currency', range: [0x20A0, 0x20CF], icon: Code },
  { name: 'Box Drawing', range: [0x2500, 0x257F], icon: Code },
  { name: 'Block Elements', range: [0x2580, 0x259F], icon: Code },
];

const COMMON_CHARS = [
  { char: '©', name: 'Copyright' },
  { char: '®', name: 'Registered' },
  { char: '™', name: 'Trademark' },
  { char: '€', name: 'Euro' },
  { char: '£', name: 'Pound' },
  { char: '¥', name: 'Yen' },
  { char: '¢', name: 'Cent' },
  { char: '∞', name: 'Infinity' },
  { char: '±', name: 'Plus-Minus' },
  { char: '×', name: 'Multiply' },
  { char: '÷', name: 'Divide' },
  { char: '≠', name: 'Not Equal' },
  { char: '≤', name: 'Less or Equal' },
  { char: '≥', name: 'Greater or Equal' },
  { char: '≈', name: 'Approximately' },
  { char: '√', name: 'Square Root' },
  { char: '∑', name: 'Sum' },
  { char: '∏', name: 'Product' },
  { char: 'π', name: 'Pi' },
  { char: '∂', name: 'Partial' },
  { char: '∇', name: 'Nabla' },
  { char: '∈', name: 'Element Of' },
  { char: '∉', name: 'Not Element Of' },
  { char: '∋', name: 'Contains' },
  { char: '⊂', name: 'Subset' },
  { char: '⊃', name: 'Superset' },
  { char: '∪', name: 'Union' },
  { char: '∩', name: 'Intersection' },
  { char: '∀', name: 'For All' },
  { char: '∃', name: 'Exists' },
  { char: '∅', name: 'Empty Set' },
  { char: 'ℕ', name: 'Natural Numbers' },
  { char: 'ℤ', name: 'Integers' },
  { char: 'ℚ', name: 'Rationals' },
  { char: 'ℝ', name: 'Reals' },
  { char: 'ℂ', name: 'Complex' },
  { char: '←', name: 'Left Arrow' },
  { char: '→', name: 'Right Arrow' },
  { char: '↑', name: 'Up Arrow' },
  { char: '↓', name: 'Down Arrow' },
  { char: '↔', name: 'Left-Right Arrow' },
  { char: '↕', name: 'Up-Down Arrow' },
  { char: '⇒', name: 'Implies' },
  { char: '⇔', name: 'If and Only If' },
  { char: '♠', name: 'Spade' },
  { char: '♣', name: 'Club' },
  { char: '♥', name: 'Heart' },
  { char: '♦', name: 'Diamond' },
  { char: '⚠', name: 'Warning' },
  { char: '✓', name: 'Check' },
  { char: '✗', name: 'Cross' },
];

export default function UnicodePicker() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [copiedChar, setCopiedChar] = useState('');
  const [page, setPage] = useState(0);
  const charsPerPage = 64;

  const filteredChars = useMemo(() => {
    let chars: { char: string; code: number; name: string }[] = [];

    if (selectedCategory) {
      const category = UNICODE_CATEGORIES.find(c => c.name === selectedCategory);
      if (category) {
        for (let code = category.range[0]; code <= category.range[1]; code++) {
          chars.push({
            char: String.fromCharCode(code),
            code,
            name: `U+${code.toString(16).toUpperCase().padStart(4, '0')}`,
          });
        }
      }
    } else {
      // Generate all common characters
      chars = COMMON_CHARS.map((c, i) => ({
        char: c.char,
        code: c.char.charCodeAt(0),
        name: c.name,
      }));
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      chars = chars.filter(
        c => c.name.toLowerCase().includes(query) || c.char.toLowerCase().includes(query)
      );
    }

    return chars;
  }, [search, selectedCategory]);

  const paginatedChars = useMemo(() => {
    const start = page * charsPerPage;
    return filteredChars.slice(start, start + charsPerPage);
  }, [filteredChars, page]);

  const totalPages = Math.ceil(filteredChars.length / charsPerPage);

  const copyChar = async (char: string, name: string) => {
    await navigator.clipboard.writeText(char);
    setCopiedChar(char);
    setTimeout(() => setCopiedChar(''), 1500);
  };

  const getCategoryIcon = (name: string) => {
    const category = UNICODE_CATEGORIES.find(c => c.name === name);
    return category?.icon || Code;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Breadcrumbs />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Code className="w-8 h-8 text-purple-400" />
            Unicode Character Picker
          </h1>
          <p className="text-gray-400">
            Browse and copy Unicode characters, emojis, and symbols
          </p>
        </div>
        <BackButton />
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search characters by name or symbol..."
            className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category Sidebar */}
        <div className="space-y-2">
          <button
            onClick={() => {
              setSelectedCategory(null);
              setPage(0);
            }}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === null
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            All Common
          </button>
          {UNICODE_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.name}
                onClick={() => {
                  setSelectedCategory(category.name);
                  setPage(0);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  selectedCategory === category.name
                    ? 'bg-purple-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Character Grid */}
        <div className="lg:col-span-3">
          <div className="glass rounded-xl p-6">
            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-zinc-400">
                {filteredChars.length} characters found
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="p-2 bg-zinc-800 text-zinc-400 rounded-lg disabled:opacity-50 hover:bg-zinc-700"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-zinc-400">
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="p-2 bg-zinc-800 text-zinc-400 rounded-lg disabled:opacity-50 hover:bg-zinc-700"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Character Grid */}
            <div className="grid grid-cols-8 gap-2">
              {paginatedChars.map((item) => (
                <button
                  key={item.code}
                  onClick={() => copyChar(item.char, item.name)}
                  className="aspect-square flex flex-col items-center justify-center p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all hover:scale-110 group relative"
                  title={`${item.name} - U+${item.code.toString(16).toUpperCase().padStart(4, '0')}`}
                >
                  <span className="text-2xl">{item.char}</span>
                  <span className="text-[8px] text-zinc-600 group-hover:text-zinc-400 mt-1">
                    {item.code.toString(16).toUpperCase()}
                  </span>
                  {copiedChar === item.char && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-500/80 rounded-lg">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {filteredChars.length === 0 && (
              <div className="text-center py-12 text-zinc-500">
                No characters found matching your search
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
