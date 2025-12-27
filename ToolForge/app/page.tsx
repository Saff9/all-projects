'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Code2,
  Palette,
  FileText,
  SearchCode,
  CheckCircle2,
  TrendingUp,
  Activity,
  Rocket,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { TOOLS, CATEGORIES, ToolItem } from '@/lib/tools-data';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTools = useMemo(() => {
    return TOOLS.filter((tool) => {
      const matchesCategory =
        selectedCategory === 'all' || tool.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.shortDescription.toLowerCase().includes(q) ||
        tool.primaryKeyword.toLowerCase().includes(q) ||
        tool.secondaryKeywords.some((k) => k.toLowerCase().includes(q)) ||
        tool.features.some((f) => f.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const trendingTools = useMemo(() => {
    return TOOLS.filter((t) =>
      ['website-seo-audit-checker', 'astro-seo-generator', 'meta-tag-generator', 'json-validator-formatter', 'wcag-contrast-checker'].includes(t.slug)
    );
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. Hero Section */}
      <section className="relative text-center pt-8 sm:pt-16 pb-6 max-w-4xl mx-auto space-y-6">
        {/* Glow ambient background pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/80 dark:bg-indigo-950/80 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-semibold shadow-xs backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
          <span>2026 Developer &amp; Webmaster Suite • Astro-Grade 100/100 Speed</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
          Free Online Web Utilities, <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400">
            SEO &amp; Developer Suite
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Supercharge your workflow with {TOOLS.length}+ lightning-fast, client-side tools. Zero trackers, no sign-ups, and 100% private browser computation.
        </p>

        {/* Live Search Bar */}
        <div className="max-w-2xl mx-auto pt-3">
          <div className="relative flex items-center glass-panel rounded-2xl shadow-xl shadow-indigo-500/5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 21+ tools (e.g. astro seo, audit, meta tags, json, contrast, regex)..."
              className="w-full pl-12 pr-24 py-4 rounded-2xl bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm sm:text-base focus:outline-none"
            />
            <div className="absolute right-3 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-semibold px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                >
                  Clear
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-105'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500'
            }`}
          >
            All Tools ({TOOLS.length})
          </button>
          <button
            onClick={() => setSelectedCategory('seo-tools')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedCategory === 'seo-tools'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500'
            }`}
          >
            SEO &amp; Webmaster ({TOOLS.filter(t => t.category === 'seo-tools').length})
          </button>
          <button
            onClick={() => setSelectedCategory('developer-utilities')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedCategory === 'developer-utilities'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 scale-105'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500'
            }`}
          >
            Developer &amp; Data ({TOOLS.filter(t => t.category === 'developer-utilities').length})
          </button>
          <button
            onClick={() => setSelectedCategory('design-css')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedCategory === 'design-css'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 scale-105'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500'
            }`}
          >
            UI/UX &amp; CSS ({TOOLS.filter(t => t.category === 'design-css').length})
          </button>
          <button
            onClick={() => setSelectedCategory('text-content')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedCategory === 'text-content'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/25 scale-105'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500'
            }`}
          >
            Text &amp; Content ({TOOLS.filter(t => t.category === 'text-content').length})
          </button>
        </div>
      </section>

      {/* 2. Trending & High-Intent Featured Strip */}
      <section className="space-y-4 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Featured &amp; Trending Tools
          </h2>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">100% Free</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {trendingTools.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.slug}`}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all card-glow-hover group flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 inline-block">
                  {tool.categoryName.split(' ')[0]}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {tool.name}
                </h3>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 group-hover:text-indigo-500 pt-2">
                <span>Launch</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Main Tools Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {selectedCategory === 'all'
                ? 'All Webmaster & Developer Tools'
                : CATEGORIES[selectedCategory]?.title || 'Tools'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Showing {filteredTools.length} of {TOOLS.length} utilities
            </p>
          </div>
        </div>

        {filteredTools.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <Search className="w-10 h-10 text-slate-400 mx-auto" />
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              No tools matching &quot;{searchQuery}&quot;
            </div>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Try searching for &quot;meta tags&quot;, &quot;astro seo&quot;, &quot;json&quot;, &quot;wcag contrast&quot;, or &quot;slug&quot;.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Reset Search Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => {
              const cat = CATEGORIES[tool.category];
              return (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 hover:border-indigo-500/60 dark:hover:border-indigo-500/60 card-glow-hover group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Badge & Category */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {tool.categoryName}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                        {tool.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {tool.shortDescription}
                      </p>
                    </div>

                    {/* Feature bullet preview pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tool.features.slice(0, 2).map((feat, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800/80 truncate max-w-full"
                        >
                          ✦ {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <span>Open Utility</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Why ToolForge Platform Architecture Section (SEO Pillar) */}
      <section className="bg-gradient-to-br from-indigo-900/10 via-purple-900/5 to-teal-900/10 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-teal-950/30 p-8 sm:p-12 rounded-3xl border border-indigo-100 dark:border-indigo-900/50 space-y-8">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <Rocket className="w-3.5 h-3.5" /> High Performance Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Engineered for Extreme Speed, Privacy, and Zero Latency
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Every tool runs completely client-side in your web browser. Here is why developers and digital creators trust ToolForge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">100% Client-Side Privacy</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Your data, JSON payloads, passwords, and tokens never touch our servers. All calculations and transformations happen in your local browser sandbox.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Sub-10ms Instant Response</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              No server round-trips or API rate limits. Real-time typing listeners ensure instant formatting, validation, and visual rendering without lag.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Astro &amp; Next.js Ready</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Generate metadata, robots directives, and schemas pre-formatted for Next.js App Router, Astro 5, and standard HTML5 workflows.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
