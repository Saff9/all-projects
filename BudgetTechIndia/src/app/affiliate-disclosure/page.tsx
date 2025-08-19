import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { ShieldCheck, ShoppingCart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Amazon Affiliate Disclosure - BudgetTechIndia',
  description: 'Amazon Associates Program compliance statement and affiliate disclosure for BudgetTechIndia.',
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="py-16">
      <JsonLd
        type="breadcrumbs"
        data={{
          items: [
            { name: 'Home', url: '/' },
            { name: 'Affiliate Disclosure', url: '/affiliate-disclosure' },
          ],
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-slate-300 leading-relaxed space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFB800]/10 text-[#FFB800] text-xs font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Full Transparency
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
            Amazon Associates Affiliate Disclosure
          </h1>
          <p className="text-xs text-slate-400">Last updated: August 2026</p>
        </div>

        <div className="p-8 rounded-3xl bg-[#0B0F19] border border-white/5 space-y-6 text-sm">
          <section className="p-6 rounded-2xl bg-[#FFB800]/5 border border-[#FFB800]/20 text-white font-medium">
            <p>
              &ldquo;BudgetTechIndia is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.in.&rdquo;
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-2">What Does This Mean For You?</h2>
            <p>
              When you click on our recommended product links and complete a purchase on Amazon India, Amazon pays us a small commission. 
            </p>
            <p className="mt-2 text-[#00F5A0] font-semibold">
              This does NOT increase the price you pay by even 1 single rupee. The price remains 100% identical (or cheaper if we find exclusive discounts and coupons).
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white mb-2">Editorial Integrity</h2>
            <p>
              Our product selections and ratings are based strictly on build quality, audio performance, real customer reviews, and battery endurance testing. We never accept payment from brands to artificially rank their products.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
