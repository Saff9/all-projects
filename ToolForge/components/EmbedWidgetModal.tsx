'use client';

import { useState } from 'react';
import { Code, Copy, Check, X, Sparkles, ExternalLink } from 'lucide-react';
import { ToolItem } from '@/lib/tools-data';
import { getBaseUrl } from '@/lib/seo-utils';

interface EmbedWidgetModalProps {
  tool: ToolItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmbedWidgetModal({ tool, isOpen, onClose }: EmbedWidgetModalProps) {
  const [copied, setCopied] = useState(false);
  const [height, setHeight] = useState(650);

  if (!isOpen) return null;

  const baseUrl = getBaseUrl();
  const toolUrl = `${baseUrl}/tools/${tool.slug}`;

  const embedCode = `<!-- ToolForge Free Embed Widget -->
<iframe
  src="${toolUrl}"
  width="100%"
  height="${height}"
  style="border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;"
  title="${tool.name}"
  loading="lazy"
></iframe>
<div style="font-size: 11px; color: #64748b; margin-top: 4px; text-align: right;">
  Powered by <a href="${baseUrl}" target="_blank" rel="noopener" style="color: #4f46e5; font-weight: 600; text-decoration: none;">ToolForge Free Utilities</a>
</div>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden space-y-5 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Code className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Embed &quot;{tool.name}&quot; on Your Website
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Copy and paste this snippet into your blog post, documentation, or CMS (WordPress, Webflow, Notion, Ghost) to provide your audience with this free interactive tool.
        </p>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Widget Height</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{height}px</span>
          </div>
          <input
            type="range"
            min={450}
            max={900}
            step={50}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="relative">
          <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto max-h-48 border border-slate-800 leading-relaxed">
            <code>{embedCode}</code>
          </pre>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Snippet!' : 'Copy Embed Code'}
          </button>
        </div>
      </div>
    </div>
  );
}
