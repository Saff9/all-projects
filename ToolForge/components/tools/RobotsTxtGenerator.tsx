'use client';

import { useState } from 'react';
import { Copy, Check, ShieldAlert, Plus, Trash2, CheckCircle2, XCircle, Download } from 'lucide-react';

export default function RobotsTxtGenerator() {
  const [sitemapUrl, setSitemapUrl] = useState('https://toolforge-seo.vercel.app/sitemap.xml');
  const [crawlDelay, setCrawlDelay] = useState<string>('');
  const [disallowPaths, setDisallowPaths] = useState<string[]>(['/api/', '/admin/']);
  const [allowPaths, setAllowPaths] = useState<string[]>(['/']);
  const [blockAiBots, setBlockAiBots] = useState(false);
  const [testUrl, setTestUrl] = useState('/api/users');
  const [copied, setCopied] = useState(false);

  // Framework Presets
  const applyPreset = (preset: 'nextjs' | 'astro' | 'wordpress' | 'allowAll' | 'blockAll') => {
    switch (preset) {
      case 'nextjs':
        setDisallowPaths(['/api/']);
        setAllowPaths(['/']);
        break;
      case 'astro':
        setDisallowPaths(['/drafts/', '/admin/']);
        setAllowPaths(['/']);
        break;
      case 'wordpress':
        setDisallowPaths(['/wp-admin/', '/wp-includes/']);
        setAllowPaths(['/wp-admin/admin-ajax.php']);
        break;
      case 'allowAll':
        setDisallowPaths([]);
        setAllowPaths(['/']);
        break;
      case 'blockAll':
        setDisallowPaths(['/']);
        setAllowPaths([]);
        break;
    }
  };

  // Generate robots.txt content
  const generateRobotsTxt = () => {
    let lines = ['User-agent: *'];
    allowPaths.forEach((p) => {
      if (p.trim()) lines.push(`Allow: ${p.trim()}`);
    });
    disallowPaths.forEach((p) => {
      if (p.trim()) lines.push(`Disallow: ${p.trim()}`);
    });
    if (crawlDelay) {
      lines.push(`Crawl-delay: ${crawlDelay}`);
    }

    if (blockAiBots) {
      lines.push('');
      lines.push('# Block AI Scraping Crawlers');
      const aiBots = ['GPTBot', 'ChatGPT-User', 'CCBot', 'Claude-Web', 'anthropic-ai', 'ByteSpider'];
      aiBots.forEach((bot) => {
        lines.push(`User-agent: ${bot}`);
        lines.push('Disallow: /');
      });
    }

    if (sitemapUrl) {
      lines.push('');
      lines.push(`Sitemap: ${sitemapUrl}`);
    }

    return lines.join('\n');
  };

  const robotsOutput = generateRobotsTxt();

  // Test URL logic
  const isUrlAllowed = (path: string) => {
    if (!path.startsWith('/')) path = '/' + path;
    for (const dis of disallowPaths) {
      if (dis && path.startsWith(dis)) return false;
    }
    return true;
  };

  const testResult = isUrlAllowed(testUrl);

  const handleCopy = () => {
    navigator.clipboard.writeText(robotsOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([robotsOutput], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'robots.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Form Setup */}
      <div className="lg:col-span-6 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          {/* Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Quick Framework Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                onClick={() => applyPreset('nextjs')}
                className="py-1.5 px-2 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                Next.js
              </button>
              <button
                onClick={() => applyPreset('astro')}
                className="py-1.5 px-2 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60"
              >
                Astro
              </button>
              <button
                onClick={() => applyPreset('wordpress')}
                className="py-1.5 px-2 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                WordPress
              </button>
              <button
                onClick={() => applyPreset('allowAll')}
                className="py-1.5 px-2 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                Allow All
              </button>
              <button
                onClick={() => applyPreset('blockAll')}
                className="py-1.5 px-2 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-red-500"
              >
                Block All
              </button>
            </div>
          </div>

          {/* Disallow Paths */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Disallow Paths (Blocked from Crawlers)
              </label>
              <button
                onClick={() => setDisallowPaths([...disallowPaths, '/'])}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add Path
              </button>
            </div>
            <div className="space-y-2">
              {disallowPaths.map((p, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={p}
                    onChange={(e) => {
                      const updated = [...disallowPaths];
                      updated[idx] = e.target.value;
                      setDisallowPaths(updated);
                    }}
                    placeholder="/private/"
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                  <button
                    onClick={() => setDisallowPaths(disallowPaths.filter((_, i) => i !== idx))}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* XML Sitemap URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Sitemap URL
            </label>
            <input
              type="url"
              value={sitemapUrl}
              onChange={(e) => setSitemapUrl(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
              placeholder="https://example.com/sitemap.xml"
            />
          </div>

          {/* AI Bots Block Toggle */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Block AI Scraping Crawlers
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Disallow GPTBot, Claude-Web, CCBot, ByteSpider
              </span>
            </div>
            <input
              type="checkbox"
              checked={blockAiBots}
              onChange={(e) => setBlockAiBots(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          {/* Live Path Tester */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Live Path Access Tester
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="/api/checkout"
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
              <div
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold ${
                  testResult
                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800'
                }`}
              >
                {testResult ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {testResult ? 'ALLOWED' : 'BLOCKED'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Robots.txt Output */}
      <div className="lg:col-span-6 space-y-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-500" />
              Generated robots.txt File
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy robots.txt'}
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 text-xs overflow-x-auto min-h-[320px] font-mono leading-relaxed border border-slate-800">
            <code>{robotsOutput}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
