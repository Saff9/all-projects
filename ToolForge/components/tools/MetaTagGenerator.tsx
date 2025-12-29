'use client';

import { useState } from 'react';
import { Copy, Check, Eye, Code, Share2, Sparkles, RefreshCw } from 'lucide-react';

export default function MetaTagGenerator() {
  const [title, setTitle] = useState('ToolForge - Free Online Web Utilities & SEO Suite');
  const [description, setDescription] = useState(
    'Supercharge your productivity with 20+ free, client-side web utilities, SEO analyzers, and CSS tools. 100% private and instant.'
  );
  const [canonicalUrl, setCanonicalUrl] = useState('https://toolforge-seo.vercel.app');
  const [siteName, setSiteName] = useState('ToolForge');
  const [ogImage, setOgImage] = useState('https://toolforge-seo.vercel.app/og-image.png');
  const [author, setAuthor] = useState('ToolForge Team');
  const [twitterCard, setTwitterCard] = useState<'summary_large_image' | 'summary'>('summary_large_image');
  const [robotsIndex, setRobotsIndex] = useState(true);
  const [robotsFollow, setRobotsFollow] = useState(true);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'google' | 'facebook' | 'twitter'>('google');

  const titleLength = title.length;
  const descLength = description.length;

  const robotsContent = `${robotsIndex ? 'index' : 'noindex'}, ${robotsFollow ? 'follow' : 'nofollow'}`;

  const htmlCode = `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}">
<meta name="description" content="${description}">
<meta name="author" content="${author}">
<meta name="robots" content="${robotsContent}">
<link rel="canonical" href="${canonicalUrl}">

<!-- Open Graph / Facebook / LinkedIn -->
<meta property="og:type" content="website">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${ogImage}">
<meta property="og:site_name" content="${siteName}">

<!-- Twitter / X -->
<meta property="twitter:card" content="${twitterCard}">
<meta property="twitter:url" content="${canonicalUrl}">
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${description}">
<meta property="twitter:image" content="${ogImage}">`;

  const nextJsCode = `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${title}',
  description: '${description}',
  alternates: {
    canonical: '${canonicalUrl}',
  },
  robots: {
    index: ${robotsIndex},
    follow: ${robotsFollow},
  },
  openGraph: {
    title: '${title}',
    description: '${description}',
    url: '${canonicalUrl}',
    siteName: '${siteName}',
    images: [
      {
        url: '${ogImage}',
        width: 1200,
        height: 630,
        alt: '${title}',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: '${twitterCard}',
    title: '${title}',
    description: '${description}',
    images: ['${ogImage}'],
  },
};`;

  const handleCopy = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Form Controls */}
      <div className="lg:col-span-6 space-y-5">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Meta Information
          </h2>

          {/* Page Title */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Page Title <span className="text-red-500">*</span>
              </label>
              <span
                className={`text-xs font-medium ${
                  titleLength > 60
                    ? 'text-amber-500 font-bold'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {titleLength} / 60 chars {titleLength > 60 && '(May Truncate)'}
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="e.g. Free Online Image Converter - Fast & Secure"
            />
          </div>

          {/* Meta Description */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Meta Description <span className="text-red-500">*</span>
              </label>
              <span
                className={`text-xs font-medium ${
                  descLength > 160
                    ? 'text-amber-500 font-bold'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {descLength} / 160 chars {descLength > 160 && '(May Truncate)'}
              </span>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              placeholder="A compelling 150-160 character summary of your page..."
            />
          </div>

          {/* Canonical URL & Site Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Canonical URL
              </label>
              <input
                type="url"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Site Name
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* OG Image URL & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Social Share Image (OG Image URL)
              </label>
              <input
                type="url"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="https://example.com/og-image.jpg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Author / Publisher
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Twitter Card & Robots Directives */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Twitter Card Format
              </label>
              <select
                value={twitterCard}
                onChange={(e) => setTwitterCard(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="summary_large_image">Summary with Large Image</option>
                <option value="summary">Standard Summary Card</option>
              </select>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={robotsIndex}
                  onChange={(e) => setRobotsIndex(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                Index
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={robotsFollow}
                  onChange={(e) => setRobotsFollow(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                Follow
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Live Previews & Code Output */}
      <div className="lg:col-span-6 space-y-6">
        {/* Live Visual Card Previews */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-teal-500" />
              Live Visual Preview
            </h3>
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-medium">
              <button
                onClick={() => setPreviewTab('google')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  previewTab === 'google'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Google
              </button>
              <button
                onClick={() => setPreviewTab('facebook')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  previewTab === 'facebook'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Facebook/OG
              </button>
              <button
                onClick={() => setPreviewTab('twitter')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  previewTab === 'twitter'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                X / Twitter
              </button>
            </div>
          </div>

          {/* Google Preview */}
          {previewTab === 'google' && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 font-sans">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
                  G
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-sm">
                  {canonicalUrl}
                </div>
              </div>
              <h4 className="text-base font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer line-clamp-1">
                {title || 'Page Title Example'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                {description || 'This is how your meta description will appear in Google search results.'}
              </p>
            </div>
          )}

          {/* Facebook / OpenGraph Preview */}
          {previewTab === 'facebook' && (
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <div className="h-44 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs overflow-hidden relative">
                {ogImage ? (
                  <div
                    className="w-full h-full bg-cover bg-center flex items-center justify-center bg-indigo-900/20 text-indigo-400 font-medium"
                    style={{ backgroundImage: `url(${ogImage})` }}
                  >
                    <span className="bg-black/50 px-2 py-1 rounded text-white text-xs backdrop-blur-xs">
                      1200 x 630 Preview
                    </span>
                  </div>
                ) : (
                  <span>OG Image Placeholder (1200x630)</span>
                )}
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-400">
                  {new URL(canonicalUrl || 'https://example.com').hostname}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1 mt-0.5">
                  {title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {description}
                </p>
              </div>
            </div>
          )}

          {/* Twitter Card Preview */}
          {previewTab === 'twitter' && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black text-white p-3 space-y-2">
              <div className="h-40 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 text-xs overflow-hidden relative">
                {ogImage ? (
                  <div
                    className="w-full h-full bg-cover bg-center flex items-center justify-center"
                    style={{ backgroundImage: `url(${ogImage})` }}
                  >
                    <span className="bg-black/60 px-2 py-1 rounded text-white text-xs">
                      Twitter Card Image
                    </span>
                  </div>
                ) : (
                  <span>Twitter Card Image</span>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-400 truncate">
                  {new URL(canonicalUrl || 'https://example.com').hostname}
                </p>
                <h4 className="text-sm font-bold text-white line-clamp-1">{title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2">{description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Code Output Tabs */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-500" />
              Generated Code
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(htmlCode, 'html')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
              >
                {copiedType === 'html' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedType === 'html' ? 'Copied HTML!' : 'Copy HTML Meta'}
              </button>
              <button
                onClick={() => handleCopy(nextJsCode, 'nextjs')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 transition-colors"
              >
                {copiedType === 'nextjs' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedType === 'nextjs' ? 'Copied Next.js!' : 'Next.js Metadata'}
              </button>
            </div>
          </div>

          <div className="relative">
            <pre className="p-4 rounded-xl bg-slate-950 text-slate-300 text-xs overflow-x-auto max-h-64 font-mono leading-relaxed border border-slate-800">
              <code>{htmlCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
