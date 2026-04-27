'use client';

import { memo, useState, useMemo, useCallback } from 'react';
import ToolCard from '@/components/ToolCard';
import { tools, categories, Tool } from '@/utils/tools';
import {
  Zap,
  Shield,
  Lock,
  Sparkles,
  Github,
  Star,
  ArrowRight,
  Terminal,
  Cpu,
  Palette,
  Globe,
  Braces,
  Heart,
  Clock,
  Trash2,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import { useFavorites } from '@/context/FavoritesContext';

// Lazy load heavy icons for performance
const categoryIcons: Record<string, typeof Zap> = {
  json: Braces,
  web: Globe,
  dev: Terminal,
  frontend: Palette,
  productivity: Zap,
  security: Shield,
};

// Memoized stat items
const statItems = [
  { value: '50+', label: 'Developer Tools' },
  { value: '100%', label: 'Client-Side' },
  { value: '0', label: 'Data Collected' },
  { value: '∞', label: 'Free Forever' },
] as const;

// Memoized feature badges
const featureBadges = [
  { icon: Lock, text: '100% Private' },
  { icon: Shield, text: 'No Data Collection' },
  { icon: Zap, text: 'Lightning Fast' },
  { icon: Terminal, text: 'Open Source' },
] as const;

function HomeContent() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [filterQuery, setFilterQuery] = useState('');
  const { favorites, getRecentlyUsedTools, clearRecentlyUsed } = useFavorites();

  // Memoize expensive computations
  const totalTools = useMemo(() => tools.length, []);
  const popularTools = useMemo(() => tools.filter((t) => t.popular), []);

  const favoriteTools = useMemo(() => {
    return tools.filter((tool) => favorites.includes(tool.id));
  }, [favorites]);

  const recentTools = useMemo(() => {
    const recent = getRecentlyUsedTools();
    return recent
      .map((item) => tools.find((t) => t.id === item.toolId))
      .filter((t): t is Tool => t !== undefined);
  }, [getRecentlyUsedTools]);

  const filteredTools = useMemo(() => {
    let filtered = tools;

    if (activeCategory !== 'all') {
      filtered = filtered.filter((tool) => tool.category === activeCategory);
    }

    if (filterQuery.trim()) {
      const query = filterQuery.toLowerCase();
      filtered = filtered.filter(
        (tool) =>
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeCategory, filterQuery]);

  // Memoize handlers
  const handleCategoryClick = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
  }, []);

  const handleClearRecentlyUsed = useCallback(() => {
    clearRecentlyUsed();
  }, [clearRecentlyUsed]);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-zinc-300">{totalTools}+ Professional Developer Tools</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in stagger-1">
            <span className="text-white">Your Ultimate</span>
            <br />
            <span className="gradient-text">Developer Toolkit</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-8 animate-fade-in stagger-2">
            Free, privacy-focused tools for developers. Format JSON, decode JWTs,
            test regex, generate passwords, and more. All processing happens in your browser.
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-10 animate-fade-in stagger-3">
            {featureBadges.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover-3d"
              >
                <Icon className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-zinc-300">{text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in stagger-4">
            <Link
              href="#tools"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all btn-lift btn-3d"
            >
              <Terminal className="w-5 h-5" />
              Explore Tools
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://github.com/Saff9/devkit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 text-white font-semibold rounded-xl border border-white/10 hover:bg-white/10 transition-all hover-3d"
            >
              <Github className="w-5 h-5" />
              Star on GitHub
              <span className="flex items-center gap-1 px-2 py-0.5 text-sm bg-yellow-500/20 text-yellow-400 rounded-full">
                <Star className="w-3 h-3 fill-current" />
                <span>1.2k</span>
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {statItems.map((stat, index) => (
          <div
            key={stat.label}
            className="text-center p-6 rounded-2xl glass card-3d"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-zinc-500">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Recently Used Section */}
      {recentTools.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Recently Used</h2>
                <p className="text-sm text-zinc-500">Your recently accessed tools</p>
              </div>
            </div>
            <button
              onClick={handleClearRecentlyUsed}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentTools.slice(0, 6).map((tool, index) => (
              <ToolCard key={tool.id} tool={tool} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Favorites Section */}
      {favoriteTools.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Favorites</h2>
              <p className="text-sm text-zinc-500">
                {favoriteTools.length} {favoriteTools.length === 1 ? 'tool' : 'tools'} saved
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteTools.map((tool, index) => (
              <ToolCard key={tool.id} tool={tool} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Popular Tools Section */}
      {popularTools.length > 0 && favoriteTools.length === 0 && recentTools.length === 0 && (
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Popular Tools</h2>
              <p className="text-sm text-zinc-500">Most used by developers</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularTools.slice(0, 6).map((tool, index) => (
              <ToolCard key={tool.id} tool={tool} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* All Tools Section */}
      <section id="tools">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">All Tools</h2>
            <p className="text-sm text-zinc-500">Browse by category</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search tools..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => handleCategoryClick('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Tools grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} />
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-500">No tools found matching your criteria</p>
          </div>
        )}
      </section>

      {/* Categories Overview */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Categories</h2>
            <p className="text-sm text-zinc-500">Explore by tool type</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => {
            const count = useMemo(() => tools.filter((t) => t.category === category.id).length, [category.id]);
            const IconComponent = categoryIcons[category.id] || Zap;
            return (
              <div
                key={category.id}
                className="group p-6 rounded-2xl glass card-3d text-center cursor-pointer"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => handleCategoryClick(category.id)}
              >
                <div
                  className={`w-12 h-12 mx-auto rounded-xl ${category.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">{category.name}</h3>
                <p className="text-sm text-zinc-500">{count} tools</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">DevKit</span>
            </div>
            <p className="text-zinc-400 max-w-md mb-6">
              A collection of free, privacy-focused developer tools. Built with ❤️ for the
              developer community.
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com/Saff9/devkit"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Github className="w-5 h-5 text-zinc-400" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  All Tools
                </Link>
              </li>
              <li>
                <Link
                  href="/json-formatter"
                  className="hover:text-white transition-colors"
                >
                  JSON Formatter
                </Link>
              </li>
              <li>
                <Link
                  href="/jwt-decoder"
                  className="hover:text-white transition-colors"
                >
                  JWT Decoder
                </Link>
              </li>
              <li>
                <Link
                  href="/regex-tester"
                  className="hover:text-white transition-colors"
                >
                  Regex Tester
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <a
                  href="https://github.com/Saff9/devkit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Changelog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Report Issue
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-500">
            © 2026 DevKit. Open source under MIT License.
          </p>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default memo(HomeContent);
