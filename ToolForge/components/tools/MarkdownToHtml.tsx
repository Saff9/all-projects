'use client';

import { useState, useMemo } from 'react';
import { FileText, Copy, Check, Download, Eye, Code, Bold, Italic, List, Link as LinkIcon, Heading } from 'lucide-react';

export default function MarkdownToHtml() {
  const [markdown, setMarkdown] = useState(`# Welcome to ToolForge 🚀

ToolForge provides **free, client-side web utilities** for developers, SEO specialists, and creators.

## Key Features
- **100% Private**: No server storage.
- **Zero Latency**: Real-time evaluation.
- **Modern UI**: Dark mode & high contrast.

### Sample Code
\`\`\`javascript
function calculateSEO(keyword) {
  return \`Optimized for \${keyword}!\`;
}
\`\`\`

> "Good SEO is about delivering real value to human searchers."

Visit [ToolForge Suite](https://toolforge-seo.vercel.app) to get started!
`);
  const [tab, setTab] = useState<'preview' | 'html'>('preview');
  const [copied, setCopied] = useState(false);

  // Client-side pure regex markdown to html parser
  const htmlOutput = useMemo(() => {
    let text = markdown;

    // Headers
    text = text.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-slate-900 dark:text-white mt-4 mb-2">$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-slate-900 dark:text-white mt-5 mb-2">$1</h2>');
    text = text.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-black text-slate-900 dark:text-white mt-6 mb-3">$1</h1>');

    // Blockquote
    text = text.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-indigo-500 pl-4 py-1.5 my-3 italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-r">$1</blockquote>');

    // Code blocks
    text = text.replace(/```([a-z]*)\n([\s\S]*?)```/gim, '<pre class="bg-slate-950 text-emerald-400 p-4 rounded-xl text-xs font-mono my-3 overflow-x-auto"><code>$2</code></pre>');
    text = text.replace(/`([^`]+)`/gim, '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-xs">$1</code>');

    // Bold / Italic
    text = text.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>');
    text = text.replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>');

    // Links
    text = text.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 underline font-medium">$1</a>');

    // Lists
    text = text.replace(/^\- (.*$)/gim, '<li class="ml-5 list-disc text-sm my-1">$1</li>');

    // Paragraphs
    text = text.replace(/\n\n/gim, '</p><p class="my-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">');

    return `<div class="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300">\n<p class="my-2 leading-relaxed">${text}</p>\n</div>`;
  }, [markdown]);

  const insertText = (prefix: string, suffix: string = '') => {
    setMarkdown((prev) => `${prev}\n${prefix}sample text${suffix}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(tab === 'html' ? htmlOutput : markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([htmlOutput], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'article.html';
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => insertText('## ')}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
            title="Heading"
          >
            <Heading className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertText('**', '**')}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertText('*', '*')}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertText('- ')}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
            title="List Item"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertText('[Link Title](', ')')}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
            title="Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download HTML
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
      </div>

      {/* Editor & Preview Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Markdown Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Markdown Input</span>
            <span className="text-[11px] font-normal text-slate-400">{markdown.length} chars</span>
          </label>
          <textarea
            rows={18}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-mono border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Live Preview / HTML Tab */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-medium">
              <button
                onClick={() => setTab('preview')}
                className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                  tab === 'preview'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Live Preview
              </button>
              <button
                onClick={() => setTab('html')}
                className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                  tab === 'html'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Code className="w-3.5 h-3.5" /> HTML Output
              </button>
            </div>
          </div>

          {tab === 'preview' ? (
            <div
              dangerouslySetInnerHTML={{ __html: htmlOutput }}
              className="h-[365px] overflow-y-auto p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
            />
          ) : (
            <textarea
              readOnly
              rows={18}
              value={htmlOutput}
              className="w-full p-4 rounded-2xl bg-slate-950 text-emerald-400 text-xs font-mono border border-slate-800 focus:outline-none resize-none leading-relaxed"
            />
          )}
        </div>
      </div>
    </div>
  );
}
