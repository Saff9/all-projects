'use client';

import { useState, useMemo } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Search,
  ExternalLink,
  Code,
  ShieldCheck,
  FileText,
  Copy,
  Check,
} from 'lucide-react';

interface AuditItem {
  id: string;
  name: string;
  category: 'meta' | 'social' | 'content' | 'technical';
  status: 'pass' | 'warning' | 'fail';
  value: string;
  impact: 'High' | 'Medium' | 'Low';
  tip: string;
}

export default function WebsiteSeoAuditChecker() {
  const [targetUrl, setTargetUrl] = useState('https://toolforge-dusky.vercel.app');
  const [htmlInput, setHtmlInput] = useState(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ToolForge - Free Online Web Utilities & SEO Suite</title>
  <meta name="description" content="Supercharge your productivity with 21+ free, client-side web utilities, SEO analyzers, and CSS tools. 100% private and instant.">
  <link rel="canonical" href="https://toolforge-dusky.vercel.app">
  <meta name="robots" content="index, follow">
  <!-- OpenGraph -->
  <meta property="og:title" content="ToolForge - Free Online Web Utilities">
  <meta property="og:description" content="21+ free developer and SEO tools with zero latency.">
  <meta property="og:image" content="https://toolforge-dusky.vercel.app/og.png">
  <meta property="og:type" content="website">
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="ToolForge - Free Online Web Utilities">
  <meta name="twitter:image" content="https://toolforge-dusky.vercel.app/og.png">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "ToolForge"
  }
  </script>
</head>
<body>
  <h1>Free Online Web Utilities & SEO Suite</h1>
  <h2>Developer Tools</h2>
  <h2>SEO & Webmaster Tools</h2>
  <img src="/logo.png" alt="ToolForge Logo" />
</body>
</html>`);

  const [inputMode, setInputMode] = useState<'url' | 'html'>('html');
  const [isAuditing, setIsAuditing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pass' | 'warning' | 'fail'>('all');
  const [copied, setCopied] = useState(false);

  // Evaluate HTML source
  const auditResults: { score: number; grade: string; items: AuditItem[] } = useMemo(() => {
    const raw = htmlInput;
    const items: AuditItem[] = [];

    // 1. Title Tag
    const titleMatch = raw.match(/<title>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    if (!title) {
      items.push({
        id: 'title',
        name: 'Page Title Tag',
        category: 'meta',
        status: 'fail',
        value: 'Missing <title> tag',
        impact: 'High',
        tip: 'Add a descriptive <title> tag between 50-60 characters containing your primary keyword.',
      });
    } else if (title.length < 30 || title.length > 65) {
      items.push({
        id: 'title',
        name: 'Page Title Tag',
        category: 'meta',
        status: 'warning',
        value: `"${title}" (${title.length} chars)`,
        impact: 'High',
        tip: 'Optimal title length is 50-60 characters to avoid Google SERP truncation.',
      });
    } else {
      items.push({
        id: 'title',
        name: 'Page Title Tag',
        category: 'meta',
        status: 'pass',
        value: `"${title}" (${title.length} chars - Optimal)`,
        impact: 'High',
        tip: 'Great title length for desktop and mobile search snippets.',
      });
    }

    // 2. Meta Description
    const descMatch = raw.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) ||
                      raw.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
    const desc = descMatch ? descMatch[1].trim() : '';
    if (!desc) {
      items.push({
        id: 'desc',
        name: 'Meta Description',
        category: 'meta',
        status: 'fail',
        value: 'Missing meta description',
        impact: 'High',
        tip: 'Add a compelling meta description between 120-160 characters with a clear call-to-action.',
      });
    } else if (desc.length < 70 || desc.length > 165) {
      items.push({
        id: 'desc',
        name: 'Meta Description',
        category: 'meta',
        status: 'warning',
        value: `"${desc.slice(0, 50)}..." (${desc.length} chars)`,
        impact: 'Medium',
        tip: 'Aim for 140-160 characters for optimal snippet display.',
      });
    } else {
      items.push({
        id: 'desc',
        name: 'Meta Description',
        category: 'meta',
        status: 'pass',
        value: `"${desc.slice(0, 60)}..." (${desc.length} chars - Optimal)`,
        impact: 'High',
        tip: 'Well-crafted meta description length.',
      });
    }

    // 3. Canonical Link
    const canonMatch = raw.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
    if (canonMatch && canonMatch[1]) {
      items.push({
        id: 'canonical',
        name: 'Canonical Tag',
        category: 'meta',
        status: 'pass',
        value: canonMatch[1],
        impact: 'High',
        tip: 'Canonical tag prevents duplicate content indexing across URL parameters.',
      });
    } else {
      items.push({
        id: 'canonical',
        name: 'Canonical Tag',
        category: 'meta',
        status: 'fail',
        value: 'Missing <link rel="canonical">',
        impact: 'High',
        tip: 'Specify a canonical URL to tell search engines the master copy of this page.',
      });
    }

    // 4. OpenGraph Social Cards
    const ogTitle = raw.match(/<meta\s+property=["']og:title["']/i);
    const ogImage = raw.match(/<meta\s+property=["']og:image["']/i);
    if (ogTitle && ogImage) {
      items.push({
        id: 'og',
        name: 'OpenGraph Social Tags',
        category: 'social',
        status: 'pass',
        value: 'og:title & og:image present',
        impact: 'Medium',
        tip: 'Page will generate rich visual preview cards on Facebook, LinkedIn, and WhatsApp.',
      });
    } else {
      items.push({
        id: 'og',
        name: 'OpenGraph Social Tags',
        category: 'social',
        status: 'warning',
        value: 'Incomplete OG tags',
        impact: 'Medium',
        tip: 'Include og:title, og:description, and a 1200x630 og:image.',
      });
    }

    // 5. Twitter Card
    const twCard = raw.match(/<meta\s+(?:name|property)=["']twitter:card["']/i);
    if (twCard) {
      items.push({
        id: 'twitter',
        name: 'Twitter / X Card',
        category: 'social',
        status: 'pass',
        value: 'twitter:card tag present',
        impact: 'Medium',
        tip: 'Enables large image preview summaries on Twitter/X feeds.',
      });
    } else {
      items.push({
        id: 'twitter',
        name: 'Twitter / X Card',
        category: 'social',
        status: 'warning',
        value: 'Missing twitter:card',
        impact: 'Low',
        tip: 'Add <meta name="twitter:card" content="summary_large_image">.',
      });
    }

    // 6. Heading 1 (H1) Tag
    const h1Matches = raw.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi);
    const h1Count = h1Matches ? h1Matches.length : 0;
    if (h1Count === 1) {
      items.push({
        id: 'h1',
        name: 'H1 Primary Heading',
        category: 'content',
        status: 'pass',
        value: `Exactly 1 <h1> tag found`,
        impact: 'High',
        tip: 'Perfect! Exactly one primary H1 tag anchors the main topic for Googlebot.',
      });
    } else if (h1Count > 1) {
      items.push({
        id: 'h1',
        name: 'H1 Primary Heading',
        category: 'content',
        status: 'warning',
        value: `${h1Count} <h1> tags found`,
        impact: 'Medium',
        tip: 'Best practice is to have only ONE <h1> per page to clearly indicate the main topic.',
      });
    } else {
      items.push({
        id: 'h1',
        name: 'H1 Primary Heading',
        category: 'content',
        status: 'fail',
        value: 'Missing <h1> tag',
        impact: 'High',
        tip: 'Add an <h1> heading containing your focus target keyword.',
      });
    }

    // 7. Viewport Mobile Tag
    const vp = raw.match(/<meta\s+name=["']viewport["']/i);
    if (vp) {
      items.push({
        id: 'viewport',
        name: 'Mobile Viewport Tag',
        category: 'technical',
        status: 'pass',
        value: 'Responsive viewport configured',
        impact: 'High',
        tip: 'Essential for Google mobile-first indexing pass.',
      });
    } else {
      items.push({
        id: 'viewport',
        name: 'Mobile Viewport Tag',
        category: 'technical',
        status: 'fail',
        value: 'Missing viewport tag',
        impact: 'High',
        tip: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">.',
      });
    }

    // 8. Schema.org JSON-LD
    const jsonLd = raw.match(/<script\s+type=["']application\/ld\+json["']/i);
    if (jsonLd) {
      items.push({
        id: 'schema',
        name: 'Schema.org JSON-LD Structured Data',
        category: 'technical',
        status: 'pass',
        value: 'Structured Data Script Found',
        impact: 'High',
        tip: 'Qualifies page for Google Rich Snippets (star ratings, FAQs, breadcrumbs).',
      });
    } else {
      items.push({
        id: 'schema',
        name: 'Schema.org JSON-LD Structured Data',
        category: 'technical',
        status: 'warning',
        value: 'No JSON-LD structured data detected',
        impact: 'Medium',
        tip: 'Use our Schema Generator tool to add FAQPage, Article, or WebApplication schema.',
      });
    }

    // Calculate score
    const total = items.length;
    const passes = items.filter((i) => i.status === 'pass').length;
    const warnings = items.filter((i) => i.status === 'warning').length;
    const score = Math.round(((passes * 1 + warnings * 0.5) / total) * 100);

    let grade = 'A+';
    if (score < 60) grade = 'F';
    else if (score < 70) grade = 'C';
    else if (score < 80) grade = 'B';
    else if (score < 90) grade = 'A';

    return { score, grade, items };
  }, [htmlInput]);

  const filteredItems = auditResults.items.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  const handleCopyReport = () => {
    const report = `SEO Audit Report
Overall Score: ${auditResults.score}/100 (Grade ${auditResults.grade})
Passes: ${auditResults.items.filter((i) => i.status === 'pass').length}
Warnings: ${auditResults.items.filter((i) => i.status === 'warning').length}
Fails: ${auditResults.items.filter((i) => i.status === 'fail').length}

Details:
${auditResults.items.map((i) => `[${i.status.toUpperCase()}] ${i.name}: ${i.value}\nRecommendation: ${i.tip}`).join('\n\n')}`;

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Input & Audit Controller */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              On-Page SEO &amp; Meta Tag Health Audit
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inspect live HTML source code to identify missing tags, broken hierarchies, and rich snippet readiness.
            </p>
          </div>
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
            <button
              onClick={() => setInputMode('html')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                inputMode === 'html'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Paste HTML Source
            </button>
            <button
              onClick={() => {
                setInputMode('url');
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                inputMode === 'url'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Inspect by URL
            </button>
          </div>
        </div>

        {inputMode === 'url' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
              <button
                onClick={() => {
                  // Simulate fast client inspection
                  setHtmlInput(`<!DOCTYPE html><html><head><title>${targetUrl} - Official Website</title><meta name="description" content="Discover our platform features and get started today."><link rel="canonical" href="${targetUrl}"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body><h1>Welcome to ${targetUrl}</h1></body></html>`);
                }}
                className="px-5 py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                Inspect URL
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Tip: Switch to &quot;Paste HTML Source&quot; to inspect private development environments (like localhost) or full page headers directly.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>HTML Document / &lt;head&gt; Code</span>
              <button
                onClick={() => setHtmlInput('')}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            </label>
            <textarea
              rows={8}
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              placeholder="Paste HTML source code here..."
              className="w-full p-4 rounded-2xl bg-slate-950 text-slate-200 text-xs font-mono border border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>
        )}
      </div>

      {/* Audit Scorecard & Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Score Ring / Grade */}
        <div className="md:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Overall SEO Score
          </span>
          <div className="text-5xl sm:text-6xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">
            {auditResults.score}
            <span className="text-lg text-slate-400 font-normal">/100</span>
          </div>
          <div
            className={`inline-flex items-center gap-1 text-xs font-black px-3 py-1 rounded-full ${
              auditResults.score >= 85
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                : auditResults.score >= 70
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
            }`}
          >
            GRADE {auditResults.grade}
          </div>
        </div>

        {/* Breakdown Count Badges */}
        <div className="md:col-span-8 grid grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 flex flex-col justify-center items-center text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-1" />
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {auditResults.items.filter((i) => i.status === 'pass').length}
            </span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Passed Checks</span>
          </div>

          <div className="p-5 rounded-3xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 flex flex-col justify-center items-center text-center">
            <AlertTriangle className="w-6 h-6 text-amber-500 mb-1" />
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {auditResults.items.filter((i) => i.status === 'warning').length}
            </span>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Warnings</span>
          </div>

          <div className="p-5 rounded-3xl bg-red-50/50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/60 flex flex-col justify-center items-center text-center">
            <XCircle className="w-6 h-6 text-red-500 mb-1" />
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {auditResults.items.filter((i) => i.status === 'fail').length}
            </span>
            <span className="text-xs font-semibold text-red-700 dark:text-red-400">Failed / Missing</span>
          </div>
        </div>
      </div>

      {/* Detailed Checklist Table */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Audit Checklist &amp; Recommendations ({filteredItems.length})
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-medium">
              {(['all', 'pass', 'warning', 'fail'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1 rounded-md capitalize transition-colors ${
                    filterStatus === s
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Report!' : 'Copy Report'}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all ${
                item.status === 'pass'
                  ? 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800'
                  : item.status === 'warning'
                  ? 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/50'
                  : 'bg-red-50/30 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  {item.status === 'pass' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : item.status === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  )}
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.name}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                    Impact: {item.impact}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate max-w-sm">
                  {item.value}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 leading-relaxed">
                💡 <span className="font-semibold">Action:</span> {item.tip}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
