// src/components/NewsSection.tsx
"use client";

import { useState, useEffect } from "react";

interface NewsItem {
  id: number;
  title: string;
  link: string;
  description?: string;
  source?: string;
  pub_date?: string;
  fetched_at?: string;
}

export default function NewsSection({ news }: { news: NewsItem[] }) {
  const [visibleNews, setVisibleNews] = useState(3);
  const [isAnimating, setIsAnimating] = useState(false);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const loadMore = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setVisibleNews(prev => Math.min(prev + 3, news.length));
      setIsAnimating(false);
    }, 300);
  };

  const getSourceColor = (source?: string) => {
    const colors: Record<string, string> = {
      'NTA': 'bg-blue-100 text-blue-700',
      'JEE': 'bg-purple-100 text-purple-700',
      'News': 'bg-green-100 text-green-700',
      'Update': 'bg-orange-100 text-orange-700',
      'Official': 'bg-red-100 text-red-700'
    };
    const sourceKey = source?.split(' ')[0] || 'News';
    return colors[sourceKey] || 'bg-gray-100 text-gray-700';
  };

  return (
    <section id="news" className="max-w-7xl mx-auto px-4 py-12 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-tl from-orange-400/10 to-pink-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-2 h-8 bg-gradient-to-b from-[#f7941d] to-[#d97c0c] rounded-full shadow-lg" />
            <div className="absolute inset-0 w-2 h-8 bg-[#f7941d] rounded-full blur-md animate-pulse" />
          </div>
          <h2 className="font-heading font-bold text-3xl text-[#003580]">Latest JEE 2026 News & Updates</h2>
          <div className="flex items-center gap-2">
            <span className="relative">
              <span className="bg-red-500 text-white text-xs font-heading font-bold px-3 py-1 rounded-full animate-pulse inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                LIVE
              </span>
            </span>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {news.length} Updates
        </div>
      </div>

      {news.length === 0 ? (
        <div className="glass-effect rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl animate-spin">🔄</span>
          </div>
          <p className="text-gray-600 font-sans mb-3">News feed loading... Please check back shortly.</p>
          <a
            href="https://nta.ac.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#003580] text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:bg-[#0055a5]"
          >
            Visit official NTA website
            <span className="text-sm">→</span>
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Featured News Card */}
          {news[0] && (
            <a
              href={news[0].link}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 card-hover relative overflow-hidden fade-in"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#f7941d]/10 to-transparent rounded-full -mr-16 -mt-16" />
              <div className="flex items-start justify-between gap-4 mb-3">
                <span className={`${getSourceColor(news[0].source)} text-xs font-heading font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm`}>
                  {news[0].source || "Featured"}
                </span>
                <span className="text-xs text-gray-400 font-sans flex items-center gap-1">
                  🕒 {formatDate(news[0].pub_date)}
                </span>
              </div>
              <h3 className="font-heading font-bold text-lg md:text-xl text-gray-800 mb-2 leading-tight">
                {news[0].title}
              </h3>
              {news[0].description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2 font-sans">{news[0].description}</p>
              )}
              <span className="inline-flex items-center gap-1 text-sm text-[#0066cc] font-semibold hover:text-[#0055a5] transition-colors">
                Read Full Story
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </a>
          )}

          {/* Grid of News Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-animation">
            {news.slice(1, visibleNews).map((item, index) => (
              <a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl border border-gray-200 p-4 card-hover block relative overflow-hidden fade-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-400/5 to-transparent rounded-full -mr-10 -mt-10" />
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={`${getSourceColor(item.source)} text-[10px] font-heading font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0`}>
                    {item.source || "News"}
                  </span>
                  <span className="text-[10px] text-gray-400 font-sans shrink-0 flex items-center gap-1">
                    🕒 {formatDate(item.pub_date)}
                  </span>
                </div>
                <h3 className="font-heading font-semibold text-sm text-gray-800 line-clamp-2 leading-snug mb-2 group-hover:text-[#003580] transition-colors">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2 font-sans">{item.description}</p>
                )}
                <span className="text-xs text-[#0066cc] inline-flex items-center gap-1 font-medium group-hover:text-[#0055a5] transition-all">
                  Read more
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </a>
            ))}
          </div>

          {/* Load More Button */}
          {visibleNews < news.length && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                disabled={isAnimating}
                className="px-6 py-2.5 bg-gradient-to-r from-[#003580] to-[#0055a5] text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isAnimating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Load More Updates
                    <span>({news.length - visibleNews} remaining)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
