import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Terms of Service - BudgetTechIndia',
  description: 'Terms and conditions governing the use of BudgetTechIndia.',
};

export default function TermsPage() {
  return (
    <div className="py-16">
      <JsonLd
        type="breadcrumbs"
        data={{
          items: [
            { name: 'Home', url: '/' },
            { name: 'Terms of Service', url: '/terms-conditions' },
          ],
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-slate-300 leading-relaxed space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Terms of Service</h1>
          <p className="text-xs text-slate-400">Last updated: August 2026</p>
        </div>

        <div className="p-8 rounded-3xl bg-[#0B0F19] border border-white/5 space-y-6 text-sm">
          <section>
            <h2 className="text-base font-bold text-white mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing and using BudgetTechIndia, you agree to comply with and be bound by these terms and conditions.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-2">2. Accuracy of Information & Pricing</h2>
            <p>
              While we strive to maintain 100% accurate price quotes and technical specifications, product pricing, deals, and stock availability on Amazon India change frequently and the final checkout price on Amazon.in will always prevail.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-2">3. Intellectual Property</h2>
            <p>
              All original content, editorial reviews, comparison scorecards, and logo graphics on BudgetTechIndia are protected by copyright laws.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
