import Link from 'next/link';
import { Wrench, Heart, Shield, Globe, Terminal, Sparkles, CheckCircle2 } from 'lucide-react';
import Logo from './Logo';
import { TOOLS, CATEGORIES } from '@/lib/tools-data';

export default function Footer() {
  const seoTools = TOOLS.filter((t) => t.category === 'seo-tools');
  const devTools = TOOLS.filter((t) => t.category === 'developer-utilities');
  const designTools = TOOLS.filter((t) => t.category === 'design-css');
  const textTools = TOOLS.filter((t) => t.category === 'text-content');

  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400">
      {/* Top Value Banner */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">100% Client-Side Privacy</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Zero data sent to remote servers. All calculations happen in your browser.</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-200/50 dark:border-teal-800/50">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Zero Latency &amp; Ads-Free</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Blazing fast execution with no intrusive popups or paywalls.</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Always Free &amp; Updated</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Maintained for developers, marketers, creators, and engineers.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Internal Links Grid (Crucial for Crawl Budget & SEO Link Juice) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1 space-y-4">
            <Logo />
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              High-performance web utilities, SEO analyzers, developer tools, and CSS generators designed for instantaneous execution and privacy.
            </p>
            <div className="text-xs text-slate-400 dark:text-slate-500 space-y-1">
              <p>Powered by Next.js &amp; Vercel Edge</p>
              <p>Core Web Vitals: 100/100</p>
            </div>
          </div>

          {/* SEO Tools Silo */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3 flex items-center gap-1.5">
              <Link href="/categories/seo-tools" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                SEO &amp; Webmaster
              </Link>
            </h3>
            <ul className="space-y-2 text-xs">
              {seoTools.map((tool) => (
                <li key={tool.id}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer Tools Silo */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3 flex items-center gap-1.5">
              <Link href="/categories/developer-utilities" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                Developer Utilities
              </Link>
            </h3>
            <ul className="space-y-2 text-xs">
              {devTools.map((tool) => (
                <li key={tool.id}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* UI & CSS Tools Silo */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3 flex items-center gap-1.5">
              <Link href="/categories/design-css" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                UI &amp; CSS Tools
              </Link>
            </h3>
            <ul className="space-y-2 text-xs">
              {designTools.map((tool) => (
                <li key={tool.id}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Text & Content Silo */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3 flex items-center gap-1.5">
              <Link href="/categories/text-content" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                Text &amp; Content
              </Link>
            </h3>
            <ul className="space-y-2 text-xs">
              {textTools.map((tool) => (
                <li key={tool.id}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
              <li className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <Link
                  href="/privacy-policy"
                  className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 font-medium"
                >
                  Privacy Policy &amp; Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} ToolForge Suite. All rights reserved. Free for commercial &amp; personal use.</p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/saff9/ToolForge"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 font-medium transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </a>
            <Link href="/privacy-policy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/sitemap.xml" className="hover:underline">
              XML Sitemap
            </Link>
            <Link href="/robots.txt" className="hover:underline">
              Robots.txt
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
