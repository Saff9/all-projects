// src/app/for-you/page.js
'use client';
import { useEffect, useState } from 'react';
import ArticleCard from '@/components/ArticleCard';
import { FaCompass, FaSpinner, FaMagic } from 'react-icons/fa';

export default function ForYouPage() {
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getRecommendations() {
      try {
        const res = await fetch('/api/content-index');
        const posts = await res.json();

        const readSlugs = JSON.parse(localStorage.getItem('readArticles') || '[]');
        const readPosts = posts.filter(p => readSlugs.includes(p.slug));
        const readTags = readPosts.flatMap(p => p.frontmatter.tags || []);

        const scored = posts
          .filter(p => !readSlugs.includes(p.slug))
          .map(p => ({
            ...p,
            score: (p.frontmatter.tags || []).filter(t => readTags.includes(t)).length,
          }));

        scored.sort((a, b) => b.score - a.score || new Date(b.frontmatter.date) - new Date(a.frontmatter.date));
        setRecommended(scored.slice(0, 8));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    getRecommendations();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-craft-deep">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-craft-glow/10 via-craft-mint/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <header className="mb-16 text-center md:text-left border-b border-craft-border pb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-craft-surface border border-craft-border shadow-sm mb-6">
            <FaMagic className="text-craft-glow" />
            <span className="text-xs font-bold uppercase tracking-wider text-craft-glow">Personalised Algorithm</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-craft-text">
            Curated <span className="bg-gradient-to-r from-craft-glow via-craft-mint to-craft-primary bg-clip-text text-transparent">For You</span>
          </h1>
          <p className="text-craft-muted text-lg sm:text-xl max-w-2xl font-light leading-relaxed mx-auto md:mx-0">
            A tailor-made feed calculated from your reading history, preferred architectural tags, and engagement streak.
          </p>
        </header>

        {loading ? (
          <div className="glass-panel rounded-3xl p-16 text-center max-w-md mx-auto flex flex-col items-center justify-center gap-4 shadow-sm border-craft-border">
            <FaSpinner className="text-4xl text-craft-primary animate-spin" />
            <p className="text-craft-text font-bold text-lg">Analyzing Reading Signals...</p>
            <p className="text-craft-muted text-sm font-light">Synthesizing your personalized knowledge stream.</p>
          </div>
        ) : recommended.length === 0 ? (
          <div className="glass-panel rounded-3xl p-16 text-center max-w-lg mx-auto shadow-sm border-craft-border">
            <FaCompass className="text-5xl text-craft-muted mx-auto mb-6 animate-pulse" />
            <p className="text-craft-text font-bold text-xl mb-3">Your Feed is Waiting</p>
            <p className="text-craft-muted text-base font-light leading-relaxed">
              Explore and read a few articles or project pages. Our algorithm will learn your technical preferences and curate matching deep dives here.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {recommended.map(post => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
