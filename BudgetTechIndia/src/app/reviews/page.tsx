import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { TrendingUp, Star, ArrowRight, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'In-Depth Tech Product Reviews & Ratings (2026)',
  description: 'Unbiased, hands-on reviews of budget TWS earbuds, smartwatches, power banks, and accessories in India.',
  openGraph: {
    title: 'Product Reviews | BudgetTechIndia',
    description: 'Hands-on testing and review scorecards for tech under ₹2000.',
    url: 'https://budget-tech-india.vercel.app/reviews',
  },
};

const REVIEWS = [
  {
    slug: 'boat-bassheads-100-review',
    title: 'boAt BassHeads 100 Wired Earphones Review: Still The King of ₹399?',
    desc: 'An honest review of the legendary BassHeads 100 hawk design, dynamic 10mm bass punch, and long-term durability.',
    rating: 4.5,
    author: 'Saffan',
    category: 'Earphones',
    date: 'August 2026',
  },
  {
    slug: 'mi-power-bank-review',
    title: 'Mi 20000mAh Power Bank 3i Review: Ultimate Travel Battery?',
    desc: 'Testing charging efficiency, triple output ports, and actual recharging times on Xiaomi 20000mAh 18W power bank.',
    rating: 4.6,
    author: 'BudgetTech Team',
    category: 'Power Banks',
    date: 'August 2026',
  },
  {
    slug: 'oneplus-buds-z2-review',
    title: 'OnePlus Buds Z2 Review: 40dB ANC & Dolby Atmos Tested',
    desc: 'Deep dive into noise cancellation strength, microphone voice isolation, and sound signature.',
    rating: 4.7,
    author: 'Saffan',
    category: 'TWS Earbuds',
    date: 'August 2026',
  },
  {
    slug: 'noise-colorfit-pro-4-review',
    title: 'Noise ColorFit Pro 4 Review: 1.72" 60Hz Smooth Display Champion',
    desc: 'Evaluating Bluetooth Tru Sync calling, 60Hz refresh rate fluidity, and digital crown navigation.',
    rating: 4.4,
    author: 'BudgetTech Team',
    category: 'Smartwatches',
    date: 'August 2026',
  },
];

export default function ReviewsIndexPage() {
  return (
    <div className="py-12">
      <JsonLd
        type="breadcrumbs"
        data={{
          items: [
            { name: 'Home', url: '/' },
            { name: 'Reviews', url: '/reviews' },
          ],
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F5A0]/10 text-[#00F5A0] border border-[#00F5A0]/20 text-xs font-bold mb-4">
            <TrendingUp className="w-3.5 h-3.5" /> Hands-on Testing
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
            In-Depth Tech <span className="cyan-gradient-text">Reviews</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Real performance analysis, audio frequency response, battery life graphs, and honest verdict breakdowns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {REVIEWS.map((rev) => (
            <div
              key={rev.slug}
              className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-2.5 py-0.5 rounded-md bg-white/5 text-[#00F5A0] text-xs font-bold uppercase tracking-wider">
                    {rev.category}
                  </span>
                  <div className="flex items-center gap-1 text-[#FFD700] text-xs font-bold">
                    <Star className="w-4 h-4 fill-[#FFD700]" />
                    <span>{rev.rating} / 5.0</span>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-white group-hover:text-[#FFB800] transition-colors leading-snug mb-3">
                  <Link href={`/reviews/${rev.slug}`}>
                    {rev.title}
                  </Link>
                </h2>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                  {rev.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400">By {rev.author} • {rev.date}</span>
                <Link
                  href={`/reviews/${rev.slug}`}
                  className="font-bold text-[#FFB800] hover:underline flex items-center gap-1"
                >
                  Read Review <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
