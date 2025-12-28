'use client';

import { useState } from 'react';
import { Rocket, Copy, Check, Eye, Code, Sparkles, Terminal } from 'lucide-react';

export default function AstroSeoGenerator() {
  const [title, setTitle] = useState('My High-Speed Blog - Built with Astro 5');
  const [description, setDescription] = useState(
    'A lightning-fast modern blog built with Astro.js, featuring zero JS by default and perfect 100/100 Core Web Vitals.'
  );
  const [canonicalUrl, setCanonicalUrl] = useState('https://my-astro-site.com/blog/my-post');
  const [siteName, setSiteName] = useState('My Astro Site');
  const [ogImage, setOgImage] = useState('https://my-astro-site.com/og-cover.png');
  const [author, setAuthor] = useState('Sarah Jenkins');
  const [twitterHandle, setTwitterHandle] = useState('@sarah_dev');
  const [format, setFormat] = useState<'astro-seo' | 'native' | 'layout'>('astro-seo');
  const [previewTab, setPreviewTab] = useState<'google' | 'facebook' | 'twitter'>('google');
  const [copied, setCopied] = useState(false);

  const titleLength = title.length;
  const descLength = description.length;

  // 1. astro-seo package format
  const astroSeoCode = `---
import { SEO } from 'astro-seo';
---

<SEO
  title="${title}"
  description="${description}"
  canonical="${canonicalUrl}"
  openGraph={{
    basic: {
      title: "${title}",
      type: "website",
      image: "${ogImage}",
      url: "${canonicalUrl}",
    },
    optional: {
      siteName: "${siteName}",
      description: "${description}",
    },
  }}
  twitter={{
    card: "summary_large_image",
    site: "${twitterHandle}",
    creator: "${twitterHandle}",
    title: "${title}",
    description: "${description}",
    image: "${ogImage}",
  }}
  extend={{
    link: [{ rel: "icon", href: "/favicon.ico" }],
    meta: [
      { name: "author", content: "${author}" },
      { name: "robots", content: "index, follow" },
    ],
  }}
/>`;

  // 2. Native Astro <head> format
  const nativeAstroCode = `<!-- Global Metadata -->
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="canonical" href="${canonicalUrl}" />

<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}" />
<meta name="description" content="${description}" />
<meta name="author" content="${author}" />
<meta name="robots" content="index, follow" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${canonicalUrl}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:site_name" content="${siteName}" />

<!-- Twitter / X -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="${canonicalUrl}" />
<meta property="twitter:title" content="${title}" />
<meta property="twitter:description" content="${description}" />
<meta property="twitter:image" content="${ogImage}" />
<meta name="twitter:creator" content="${twitterHandle}" />`;

  // 3. Dynamic BaseLayout.astro format
  const layoutAstroCode = `---
// src/layouts/BaseLayout.astro
export interface Props {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
}

const {
  title = "${title}",
  description = "${description}",
  image = "${ogImage}",
  canonical = Astro.url.href,
} = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="canonical" href={canonical} />
    
    <title>{title}</title>
    <meta name="description" content={description} />
    
    <!-- OpenGraph -->
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={image} />
    <meta property="og:url" content={canonical} />
  </head>
  <body>
    <slot />
  </body>
</html>`;

  const activeCode =
    format === 'astro-seo'
      ? astroSeoCode
      : format === 'native'
      ? nativeAstroCode
      : layoutAstroCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Form Controls Column */}
      <div className="lg:col-span-6 space-y-5">
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Rocket className="w-4 h-4 text-indigo-500" />
              Astro Page Metadata
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              Astro 4 &amp; 5 Ready
            </span>
          </div>

          {/* Title */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Page Title</span>
              <span className={titleLength > 60 ? 'text-amber-500 font-bold' : 'text-slate-400'}>
                {titleLength}/60 chars
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Meta Description</span>
              <span className={descLength > 160 ? 'text-amber-500 font-bold' : 'text-slate-400'}>
                {descLength}/160 chars
              </span>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none resize-none"
            />
          </div>

          {/* Canonical & Site Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Canonical URL
              </label>
              <input
                type="url"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
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
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>
          </div>

          {/* OG Image & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                OpenGraph Image URL (1200x630)
              </label>
              <input
                type="url"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Twitter Handle / Creator
              </label>
              <input
                type="text"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Code Generation & Visual Preview Column */}
      <div className="lg:col-span-6 space-y-6">
        {/* Output Format Picker */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-500" />
              Generated Astro Code
            </h3>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
            <button
              onClick={() => setFormat('astro-seo')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                format === 'astro-seo'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              &lt;SEO /&gt; Component
            </button>
            <button
              onClick={() => setFormat('native')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                format === 'native'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Native HTML Tags
            </button>
            <button
              onClick={() => setFormat('layout')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                format === 'layout'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              BaseLayout.astro
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 text-xs font-mono overflow-x-auto max-h-72 border border-slate-800 leading-relaxed">
            <code>{activeCode}</code>
          </pre>

          {format === 'astro-seo' && (
            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300">
              <span className="flex items-center gap-1.5 font-mono">
                <Terminal className="w-3.5 h-3.5" /> npx astro add astro-seo
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Package Install</span>
            </div>
          )}
        </div>

        {/* Live Snippet Preview */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-teal-500" />
              Live SERP Preview
            </h4>
            <span className="text-[10px] text-slate-400">Google Desktop</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-sans">
            <div className="text-xs text-slate-500 truncate mb-0.5">{canonicalUrl}</div>
            <h5 className="text-base text-[#1a0dab] dark:text-[#8ab4f8] hover:underline font-normal line-clamp-1">
              {title}
            </h5>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
