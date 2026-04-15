// src/app/search/page.js
'use client';
import { useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import ArticleCard from '@/components/ArticleCard';
import { FaSearch, FaRegLightbulb } from 'react-icons/fa';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [allPosts, setAllPosts] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch('/api/content-index')
      .then(res => res.json())
      .then(setAllPosts)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!query.trim() || allPosts.length === 0) {
      setResults([]);
      return;
    }

    const fuse = new Fuse(allPosts, {
      keys: ['frontmatter.title', 'frontmatter.description', 'content'],
      threshold: 0.3,
      includeScore: true,
    });

    const searchResults = fuse.search(query).map(({ item }) => item);
    setResults(searchResults);
  }, [query, allPosts]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-craft-deep">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-craft-primary/10 via-craft-glow/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <header className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 text-craft-text">
            Search <span className="bg-gradient-to-r from-craft-primary via-craft-glow to-craft-mint bg-clip-text text-transparent">Everything</span>
          </h1>
          <p className="text-craft-muted text-lg font-light mb-10 leading-relaxed">
            Instant AI-ready semantic search across all deep dives, architectural notes, and open-source projects.
          </p>

          <div className="relative group max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-craft-muted group-focus-within:text-craft-primary transition-colors">
              <FaSearch className="text-lg" />
            </div>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search articles, tags, frameworks, or concepts..."
              className="w-full bg-craft-surface border border-craft-border rounded-2xl pl-16 pr-6 py-5 text-craft-text placeholder-craft-muted focus:outline-none focus:border-craft-primary focus:ring-2 focus:ring-craft-primary/20 transition-all shadow-sm font-medium text-lg"
              autoFocus
            />
          </div>
        </header>

        {query && results.length === 0 ? (
          <div className="glass-panel rounded-3xl p-16 text-center max-w-lg mx-auto animate-fade-in border-craft-border">
            <FaRegLightbulb className="text-4xl text-craft-muted mx-auto mb-4 animate-pulse" />
            <p className="text-craft-text font-bold text-xl mb-2">No results found</p>
            <p className="text-craft-muted text-base font-light leading-relaxed">We couldn’t find anything matching “{query}”. Try searching for different keywords or tags.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {results.map(post => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
