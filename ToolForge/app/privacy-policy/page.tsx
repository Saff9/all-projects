import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, Globe, CheckCircle2 } from 'lucide-react';
import { SITE_NAME, generateCanonicalUrl } from '@/lib/seo-utils';

export const metadata: Metadata = {
  title: `Privacy Policy & Terms of Service | ${SITE_NAME}`,
  description: `${SITE_NAME} is committed to 100% client-side privacy. No cookies, no user tracking, and no server data storage.`,
  alternates: {
    canonical: generateCanonicalUrl('/privacy-policy'),
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-12">
      {/* Header */}
      <div className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200/50 dark:border-emerald-800/50">
          <ShieldCheck className="w-4 h-4" /> 100% Privacy Guarantee
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Privacy Policy &amp; Terms of Service
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Last updated: August 31, 2026
        </p>
      </div>

      {/* Main Policy Blocks */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-500" />
            1. Zero Server-Side Data Storage
          </h2>
          <p>
            At {SITE_NAME}, we take your privacy with the utmost seriousness. All utility tools—including the JSON Validator, Regex Tester, Base64 Encoder/Decoder, Hash Generator, Meta Tag Generator, and Readability Analyzer—run <strong>exclusively client-side in your web browser</strong> using native JavaScript and Web Cryptography APIs.
          </p>
          <p>
            None of your input data, JSON objects, text snippets, passwords, or image files are ever uploaded, transmitted, logged, or saved on any remote servers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-teal-500" />
            2. Cookies and Tracking
          </h2>
          <p>
            {SITE_NAME} does not set tracking cookies or sell your browsing history to third-party data brokers. We may use privacy-preserving, anonymous pageview metrics to measure website performance and ensure high uptime.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
            3. Free Commercial and Personal Use
          </h2>
          <p>
            All tools and code snippets generated on {SITE_NAME} are 100% free for both personal and commercial use without attribution requirements. You may copy, modify, and distribute any generated HTML, CSS, JSON-LD schema, or regex patterns freely in your own projects.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            4. Disclaimer of Warranties
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {SITE_NAME} is provided &quot;as is&quot; without warranty of any kind, either expressed or implied. While we strive for 100% mathematical accuracy across all algorithms (including WCAG contrast calculations and cryptographic hashes), users are encouraged to verify outputs in production environments.
          </p>
        </section>
      </div>
    </div>
  );
}
