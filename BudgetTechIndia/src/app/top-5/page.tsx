import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { Award, ArrowRight, Star, Headphones, BatteryCharging, Watch, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Top 5 Ranked Tech Comparison Guides (2026)',
  description: 'Explore our comprehensive Top 5 ranked buying guides for TWS Earbuds, Power Banks, Smartwatches, and Fast Chargers under ₹2000 in India.',
  openGraph: {
    title: 'Top 5 Ranked Tech Guides | BudgetTechIndia',
    description: 'Expertly ranked tech gadgets tested for battery, audio, and performance.',
    url: 'https://budget-tech-india.vercel.app/top-5',
  },
};

const TOP_5_GUIDES = [
  {
    slug: 'best-budget-earbuds-2026',
    title: 'Top 5 Best TWS Earbuds Under ₹1,000 in India',
    desc: 'We tested the 5 top-selling budget earbuds for bass depth, mic clarity, latency, and real-world battery endurance.',
    icon: Headphones,
    winner: 'boAt Airdopes 141 (42H Playtime)',
    date: 'Updated August 2026',
  },
  {
    slug: 'top-smartwatches-under-2000',
    title: 'Top 5 Bluetooth Calling Smartwatches Under ₹2,000',
    desc: 'Comprehensive side-by-side comparison of Bluetooth calling range, display brightness, and health sensor accuracy.',
    icon: Watch,
    winner: 'Noise ColorFit Pulse 2 Max',
    date: 'Updated August 2026',
  },
  {
    slug: 'best-fast-chargers-2026',
    title: 'Top 5 Power Banks & Fast Chargers Under ₹1,500',
    desc: 'Tested 20000mAh and 10000mAh high-capacity power banks with 22.5W Power Delivery and integrated cables.',
    icon: BatteryCharging,
    winner: 'Ambrane 20000mAh Built-in Type-C',
    date: 'Updated August 2026',
  },
];

export default function Top5IndexPage() {
  return (
    <div className="py-12">
      <JsonLd
        type="breadcrumbs"
        data={{
          items: [
            { name: 'Home', url: '/' },
            { name: 'Top 5 Ranked Guides', url: '/top-5' },
          ],
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/20 text-xs font-bold mb-4">
            <Award className="w-3.5 h-3.5" /> Curated Rankings
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
            Top 5 <span className="gold-gradient-text">Ranked Guides</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Every list is ranked after extensive audio testing, battery discharge runs, and build analysis so you pick the best product on your budget.
          </p>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TOP_5_GUIDES.map((guide) => {
            const Icon = guide.icon;
            return (
              <div
                key={guide.slug}
                className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-6">
                    <div className="p-3 rounded-2xl bg-white/5 text-[#FFB800] group-hover:bg-[#FFB800] group-hover:text-black transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {guide.date}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white group-hover:text-[#FFB800] transition-colors leading-snug mb-3">
                    <Link href={`/top-5/${guide.slug}`}>
                      {guide.title}
                    </Link>
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                    {guide.desc}
                  </p>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 mb-6">
                    <div className="text-[10px] uppercase font-bold text-[#00F5A0] tracking-wider mb-1">
                      👑 Top Ranked Winner
                    </div>
                    <div className="text-xs font-bold text-white">
                      {guide.winner}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/top-5/${guide.slug}`}
                  className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-[#FFB800] hover:text-black text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-white/10 hover:border-transparent"
                >
                  View Ranked List <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
