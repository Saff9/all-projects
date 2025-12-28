'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Share2,
  Code,
  Bookmark,
  Check,
  Copy,
} from 'lucide-react';
import { ToolItem, CATEGORIES } from '@/lib/tools-data';
import EmbedWidgetModal from './EmbedWidgetModal';

interface ToolHeaderProps {
  tool: ToolItem;
}

export default function ToolHeader({ tool }: ToolHeaderProps) {
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const categoryInfo = CATEGORIES[tool.category];

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Check out this free ${tool.name} tool on ToolForge:`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Free online ${tool.name}: ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const copyPageLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <>
      <div className="mb-8">
        {/* SEO Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4 flex-wrap">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link
            href={`/categories/${tool.category}`}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {categoryInfo ? categoryInfo.name : tool.categoryName}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 dark:text-slate-200 font-medium truncate max-w-xs sm:max-w-sm">
            {tool.name}
          </span>
        </nav>

        {/* Category Badge, Trust Badges & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/categories/${tool.category}`}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 hover:bg-indigo-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {tool.categoryName}
            </Link>
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Private (Local)
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Instant Realtime
            </span>
          </div>

          {/* Social Share & Embed Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEmbedOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Get iframe embed snippet for your blog"
            >
              <Code className="w-3.5 h-3.5 text-indigo-500" />
              <span>&lt;/&gt; Embed</span>
            </button>

            <button
              onClick={shareOnTwitter}
              className="p-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Share on X / Twitter"
            >
              𝕏
            </button>

            <button
              onClick={shareOnWhatsApp}
              className="p-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Share on WhatsApp"
            >
              💬
            </button>

            <button
              onClick={copyPageLink}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
              title="Copy URL"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Main H1 Title (Primary Keyword Optimized) */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
          {tool.name}
        </h1>

        {/* Subtitle / Description */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          {tool.shortDescription}
        </p>
      </div>

      {/* Embed Modal */}
      <EmbedWidgetModal
        tool={tool}
        isOpen={isEmbedOpen}
        onClose={() => setIsEmbedOpen(false)}
      />
    </>
  );
}
