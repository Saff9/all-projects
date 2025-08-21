import React from 'react';
import type { Metadata } from 'next';
import { HeroSection } from '@/components/home/HeroSection';
import { TopPicks } from '@/components/home/TopPicks';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { LatestReviews } from '@/components/home/LatestReviews';
import { FaqSection } from '@/components/home/FaqSection';
import { Newsletter } from '@/components/home/Newsletter';
import { JsonLd } from '@/components/seo/JsonLd';
import { getAllNeonProducts } from '@/utils/neondb';
import productsData from '@/data/products.json';
import Link from 'next/link';
import { Award, ArrowRight, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'BudgetTechIndia - Best Budget Tech Products Under ₹2000 in India (2026)',
  description: 'Honest reviews, in-depth lab testing, and curated daily price drops on the best TWS earbuds, power banks, smartwatches, and tech accessories under ₹2000 in India.',
  alternates: {
    canonical: 'https://budget-tech-india.vercel.app/',
  },
};

export const revalidate = 60; // ISR 60 seconds

export default async function HomePage() {
  let products: any[] = [];
  try {
    const neonProds = await getAllNeonProducts();
    if (neonProds && neonProds.length > 0) {
      products = neonProds;
    } else {
      products = (productsData as any).products || [];
    }
  } catch (e) {
    products = (productsData as any).products || [];
  }

  const TOP_5_GUIDES = [
    {
      title: 'Top 5 Best Budget Earbuds Under ₹1,000 in India (2026)',
      slug: 'best-budget-earbuds-2026',
      badge: 'Gold Pick: boAt Airdopes 141',
      desc: 'Ranked comparison of latency, 13mm bass drivers, mic clarity, and battery endurance.',
      count: '5 Tested',
    },
    {
      title: 'Top 5 Bluetooth Calling Smartwatches Under ₹2,000',
      slug: 'top-smartwatches-under-2000',
      badge: 'Gold Pick: Noise Pulse 2 Max',
      desc: 'Tested for sunlight legibility, sensor accuracy, build resilience, and battery longevity.',
      count: '5 Tested',
    },
    {
      title: 'Top 5 Fast Chargers & GaN Power Adapters Under ₹1,000',
      slug: 'best-fast-chargers-2026',
      badge: 'Gold Pick: Portronics Adapto 22',
      desc: 'Thermal performance and multi-device fast charging tests for iPhone and Android.',
      count: '5 Tested',
    },
  ];

  return (
    <div className="space-y-0">
      <JsonLd type="website" data={{}} />
      <JsonLd type="organization" data={{}} />

      {/* Hero Section */}
      <HeroSection />

      {/* Trending Deals & Top Picks */}
      <TopPicks products={products} />

      {/* Featured Categories Showcase */}
      <CategoryGrid />

      {/* Ranked Top 5 Comparison Lists Showcase */}
      <section className="py-16 bg-[#07090E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#F59E0B] mb-2">
                <Award className="w-3.5 h-3.5" /> Curated Rankings
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Top 5 Ranked Buying Guides
              </h2>
            </div>
            <Link
              href="/top-5"
              className="text-xs font-bold text-[#F59E0B] hover:underline flex items-center gap-1 self-start md:self-auto"
            >
              View All Ranked Guides <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TOP_5_GUIDES.map((guide) => (
              <Link
                key={guide.slug}
                href={`/top-5/${guide.slug}`}
                className="card-surface p-6 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="px-2.5 py-1 rounded-md bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 text-[11px] font-bold">
                      {guide.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{guide.count}</span>
                  </div>

                  <h3 className="text-lg font-black text-white group-hover:text-[#F59E0B] transition-colors leading-snug mb-3">
                    {guide.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {guide.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-[#10B981]">
                  <span>View Ranked Showdown</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Hands-On Reviews */}
      <LatestReviews />

      {/* FAQ Section */}
      <FaqSection />

      {/* Newsletter Subscription Card */}
      <Newsletter />

      {/* Affiliate Transparency Disclosure Banner */}
      <section className="py-8 bg-[#0D111A] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-slate-400 max-w-3xl">
            <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
            <span>
              <strong>Affiliate Disclosure:</strong> BudgetTechIndia is an independent publication. When you purchase through links on our site, we may earn an affiliate commission from Amazon India at zero additional cost to you.
            </span>
          </div>
        </div>
      </section>

    </div>
  );
}
