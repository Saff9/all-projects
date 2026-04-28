'use client';

import Link from 'next/link';
import { memo, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Menu,
  X,
  Zap,
  Github,
  Star,
  Command,
  Sun,
  Moon,
  Keyboard,
  Heart,
  Clock,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';
import { useFavorites, useTheme } from '@/context/FavoritesContext';
import { tools, categories, Tool } from '@/utils/tools';
import Logo from '@/components/icons/Logo';

interface HeaderProps {
  onSearchOpen?: () => void;
}

export default memo(function Header({ onSearchOpen }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Tool[]>([]);
  const [copiedShortcut, setCopiedShortcut] = useState<string | null>(null);

  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut for opening search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const results = tools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.category.toLowerCase().includes(query)
      );
      setSearchResults(results.slice(0, 8));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleCopyShortcut = async (shortcut: string) => {
    await navigator.clipboard.writeText(shortcut);
    setCopiedShortcut(shortcut);
    setTimeout(() => setCopiedShortcut(null), 2000);
  };

  const shortcuts = [
    { key: 'K', modifiers: ['⌘'], action: 'Open search', description: 'Search for tools' },
    { key: '/', modifiers: ['⌘'], action: 'Clear', description: 'Clear input' },
    { key: 'C', modifiers: ['⌘'], action: 'Copy', description: 'Copy to clipboard' },
    { key: 'S', modifiers: ['⌘'], action: 'Swap', description: 'Swap panels' },
    { key: 'V', modifiers: ['⌘'], action: 'Paste', description: 'Paste from clipboard' },
    { key: 'Esc', modifiers: [], action: 'Close', description: 'Close modal' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-zinc-950/80 backdrop-blur-xl border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group hover-3d">
            <div className="animate-float-3d">
              <Logo size={40} />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                DevKit
              </span>
              <span className="text-[10px] text-zinc-500 -mt-1">Developer Tools</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              Home
            </Link>
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              data-search-button
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
              <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-white/10 rounded">
                <Command className="w-3 h-3" />
                <span>K</span>
              </kbd>
            </button>
            <button
              onClick={() => setShowShortcuts(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <Keyboard className="w-4 h-4" />
              <span className="hidden lg:inline">Shortcuts</span>
            </button>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-zinc-400" />
              ) : (
                <Sun className="w-5 h-5 text-zinc-400" />
              )}
            </button>

            <a
              href="https://github.com/Saff9/devkit"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <Github className="w-4 h-4" />
              <span className="hidden lg:inline">Star on GitHub</span>
              <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                <Star className="w-3 h-3 fill-current" />
                <span>1.2k</span>
              </span>
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-zinc-400" />
              ) : (
                <Menu className="w-5 h-5 text-zinc-400" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/5">
            <nav className="flex flex-col gap-1">
              <Link
                href="/"
                className="px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <button
                onClick={() => {
                  setShowSearch(true);
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
              >
                <Search className="w-4 h-4" />
                Search Tools
              </button>
              <button
                onClick={() => {
                  setShowShortcuts(true);
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
              >
                <Keyboard className="w-4 h-4" />
                Keyboard Shortcuts
              </button>
              <a
                href="https://github.com/Saff9/devkit"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </nav>
          </div>
        )}
      </div>

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSearch(false)}
          />
          <div className="relative w-full max-w-2xl glass rounded-2xl overflow-hidden animate-slide-up">
            <div className="flex items-center gap-3 p-4 border-b border-white/5">
              <Search className="w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none"
                autoFocus
              />
              <kbd className="px-2 py-1 text-xs bg-white/10 rounded">ESC</kbd>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 ? (
              <div className="max-h-96 overflow-y-auto p-2">
                {searchResults.map((tool) => {
                  const category = categories.find((c) => c.id === tool.category);
                  return (
                    <Link
                      key={tool.id}
                      href={tool.path}
                      onClick={() => setShowSearch(false)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          category?.bgColor || 'bg-zinc-800'
                        }`}
                      >
                        <span className="text-white font-medium">
                          {tool.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">
                          {tool.name}
                        </h4>
                        <p className="text-sm text-zinc-500 truncate">
                          {tool.description}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-600" />
                    </Link>
                  );
                })}
              </div>
            ) : searchQuery ? (
              <div className="p-4 text-sm text-zinc-500">
                No tools found for "{searchQuery}"
              </div>
            ) : (
              <div className="p-4">
                <p className="text-sm text-zinc-500 mb-3">Quick access</p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.slice(0, 6).map((category) => (
                    <Link
                      key={category.id}
                      href={`/?category=${category.id}`}
                      onClick={() => setShowSearch(false)}
                      className="flex items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg ${category.bgColor} flex items-center justify-center`}
                      >
                        <span className="text-white text-xs font-medium">
                          {category.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm text-zinc-400">{category.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowShortcuts(false)}
          />
          <div className="relative w-full max-w-lg glass rounded-2xl overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Keyboard className="w-5 h-5" />
                Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setShowShortcuts(false)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>

            <div className="p-4 space-y-2">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.action}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {shortcut.modifiers.map((mod, i) => (
                        <kbd
                          key={i}
                          className="px-2 py-1 text-xs bg-white/10 rounded min-w-[24px] text-center"
                        >
                          {mod}
                        </kbd>
                      ))}
                      <kbd className="px-2 py-1 text-xs bg-white/10 rounded min-w-[24px] text-center">
                        {shortcut.key}
                      </kbd>
                    </div>
                    <span className="text-sm text-zinc-400">
                      {shortcut.description}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleCopyShortcut(shortcut.modifiers.join('') + shortcut.key)
                    }
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Copy shortcut"
                  >
                    {copiedShortcut ===
                    shortcut.modifiers.join('') + shortcut.key ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/5">
              <p className="text-xs text-zinc-500 text-center">
                Press{' '}
                <kbd className="px-1.5 py-0.5 text-xs bg-white/10 rounded">
                  ⌘ K
                </kbd>{' '}
                to open search from anywhere
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
});
