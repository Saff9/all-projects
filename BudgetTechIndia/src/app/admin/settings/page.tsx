'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Database, Key, Globe } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#FFB800] mb-8 font-semibold transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>

      <div className="p-8 sm:p-10 rounded-3xl bg-[#0B0F19] border border-white/10 shadow-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">System & Security Settings</h1>
          <p className="text-xs text-slate-400">Environment configurations and security protocols.</p>
        </div>

        <div className="grid gap-6">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#00F5A0]/10 text-[#00F5A0]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Neon DB Serverless PostgreSQL</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connected via <code className="text-[#FFB800]">@neondatabase/serverless</code>. Automatic 7-day TTL retention and in-memory sub-millisecond query caching are active.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#FFB800]/10 text-[#FFB800]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Webhook API Security</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bot webhooks authenticate requests via <code className="text-[#FFB800]">WEBHOOK_PASSWORD</code>. Requests without a matching password or header are rejected with 401 Unauthorized.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Vercel Production Domain</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Configured with <code className="text-[#FFB800]">https://budget-tech-india.vercel.app</code> for all canonical tags, JSON-LD schemas, and XML sitemaps.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
