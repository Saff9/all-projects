'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Wrench,
  Search,
  Menu,
  X,
  Sparkles,
  Command,
  Sun,
  Moon,
  ChevronDown,
  Layers,
  Code2,
  Palette,
  FileText,
  SearchCode,
  Heart,
} from 'lucide-react';
import Logo from './Logo';
import SearchModal from './SearchModal';
import LanguageSelector from './LanguageSelector';
import SponsorModal from './SponsorModal';
import { CATEGORIES } from '@/lib/tools-data';

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSponsorOpen, setIsSponsorOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Dark mode initializer
  useEffect(() => {
    const isDark =
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Scroll listener for sticky blur effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          isScrolled
            ? 'bg-white/85 dark:bg-[#070b14]/85 backdrop-blur-md shadow-sm border-b border-slate-200/80 dark:border-slate-800/80'
            : 'bg-white/60 dark:bg-[#070b14]/60 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-800/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Handcrafted Logo */}
          <Logo />

          {/* Center Category Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              href="/categories/seo-tools"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.includes('seo-tools')
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              SEO &amp; Webmaster
            </Link>
            <Link
              href="/categories/developer-utilities"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.includes('developer-utilities')
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              Developer &amp; Data
            </Link>
            <Link
              href="/categories/design-css"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.includes('design-css')
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              UI &amp; CSS Tools
            </Link>
            <Link
              href="/categories/text-content"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.includes('text-content')
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              Text &amp; Content
            </Link>
          </nav>

          {/* Right Action Icons & Search Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors border border-slate-200/80 dark:border-slate-700/80"
              title="Search tools (Ctrl+K / Cmd+K)"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden md:inline">Quick search...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded border border-slate-300 dark:border-slate-700 shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* Sponsor / Donate Trigger Button */}
            <button
              onClick={() => setIsSponsorOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-md shadow-pink-500/20 transition-all hover:scale-105"
              title="Sponsor ToolForge (Razorpay / Crypto)"
            >
              <Heart className="w-3.5 h-3.5 fill-current animate-pulse" />
              <span className="hidden sm:inline">Sponsor</span>
            </button>

            {/* Language & Region Selector */}
            <LanguageSelector />

            {/* GitHub Repository Link */}
            <a
              href="https://github.com/saff9/ToolForge"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 flex items-center justify-center"
              aria-label="ToolForge GitHub Repository"
              title="Star ToolForge on GitHub"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-2 animate-in slide-in-from-top-2">
            <Link
              href="/categories/seo-tools"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <SearchCode className="w-4 h-4 text-blue-500" />
              SEO &amp; Webmaster Tools
            </Link>
            <Link
              href="/categories/developer-utilities"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Code2 className="w-4 h-4 text-emerald-500" />
              Developer &amp; Data Utilities
            </Link>
            <Link
              href="/categories/design-css"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Palette className="w-4 h-4 text-purple-500" />
              UI/UX &amp; CSS Tools
            </Link>
            <Link
              href="/categories/text-content"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <FileText className="w-4 h-4 text-amber-500" />
              Text &amp; Content Intelligence
            </Link>
          </div>
        )}
      </header>

      {/* Global Cmd+K Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Sponsor Modal (Razorpay + Crypto) */}
      <SponsorModal isOpen={isSponsorOpen} onClose={() => setIsSponsorOpen(false)} />
    </>
  );
}
