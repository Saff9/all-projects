import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { Star, CheckCircle2, XCircle, ShoppingCart, ArrowUpRight, ArrowLeft } from 'lucide-react';

const REVIEW_DATA: Record<string, any> = {
  'boat-bassheads-100-review': {
    title: 'boAt BassHeads 100 Review: Still The King of ₹399 in 2026?',
    desc: 'Deep dive into sound profile, build quality, and microphone clarity of boAt BassHeads 100 wired earphones.',
    rating: 4.5,
    author: 'Saffan',
    date: 'August 2026',
    price: 399,
    mrp: 999,
    buyUrl: 'https://www.amazon.in/dp/B07BCH6JQK?tag=budgettechpro-21',
    pros: ['Punchy bass for Bollywood & EDM', 'Hawk-inspired iconic design', 'Comfortable angled earbuds', 'Durable tangle-resistant cable'],
    cons: ['Wired connection only', 'Highs can sometimes sound slightly sharp at 100% volume'],
    verdict: 'If you want reliable, punchy sound with zero latency and zero charging headaches under ₹400, the boAt BassHeads 100 remains undefeated.',
  },
  'mi-power-bank-review': {
    title: 'Mi 20000mAh Power Bank 3i Review: Ultimate Travel Battery?',
    desc: 'Testing charging efficiency, triple output ports, and actual recharging times on Xiaomi 20000mAh 18W power bank.',
    rating: 4.6,
    author: 'BudgetTech Team',
    date: 'August 2026',
    price: 1999,
    mrp: 3199,
    buyUrl: 'https://www.amazon.in/dp/B08HV83HL3?tag=budgettechpro-21',
    pros: ['Huge 20000mAh real capacity', 'Triple output ports for multiple devices', '18W fast two-way charging', '12-layer advanced circuit protection'],
    cons: ['Takes 6-7 hours to fully charge from 0%', 'Heavy to carry in pockets'],
    verdict: 'An indispensable power reservoir for college students, travelers, and power users who need reliable multi-device backup.',
  },
  'oneplus-buds-z2-review': {
    title: 'OnePlus Buds Z2 Review: 40dB ANC & Dolby Atmos Tested',
    desc: 'Deep dive into active noise cancellation, microphone voice isolation, and sound signature.',
    rating: 4.7,
    author: 'Saffan',
    date: 'August 2026',
    price: 1999,
    mrp: 4999,
    buyUrl: 'https://www.amazon.in/dp/B097C56421?tag=budgettechpro-21',
    pros: ['Impressive 40dB active noise cancellation', 'Rich bass with Dolby Atmos support', 'IP55 water & sweat resistance', 'Fast Warp charging'],
    cons: ['Best audio features require OnePlus devices'],
    verdict: 'One of the most premium listening experiences with true ANC available at budget prices.',
  },
  'noise-colorfit-pro-4-review': {
    title: 'Noise ColorFit Pro 4 Review: 1.72" 60Hz Smooth Display Champion',
    desc: 'Evaluating Bluetooth Tru Sync calling, 60Hz refresh rate fluidity, and digital crown navigation.',
    rating: 4.4,
    author: 'BudgetTech Team',
    date: 'August 2026',
    price: 1799,
    mrp: 5999,
    buyUrl: 'https://www.amazon.in/dp/B0B5L21SGR?tag=budgettechpro-21',
    pros: ['Buttery smooth 60Hz refresh rate display', 'Clear Bluetooth calling through built-in speaker', 'Fully functional digital crown dial', '100 sports modes'],
    cons: ['Battery life drops to 2-3 days with frequent calling enabled'],
    verdict: 'The sharpest, smoothest display in the budget smartwatch segment with snappy Bluetooth calling.',
  },
};

export async function generateStaticParams() {
  return Object.keys(REVIEW_DATA).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const rev = REVIEW_DATA[params.slug];
  if (!rev) return { title: 'Review Not Found' };

  return {
    title: rev.title,
    description: rev.desc,
    openGraph: {
      title: rev.title,
      description: rev.desc,
      url: `https://budget-tech-india.vercel.app/reviews/${params.slug}`,
    },
    alternates: {
      canonical: `https://budget-tech-india.vercel.app/reviews/${params.slug}`,
    },
  };
}

export default async function ReviewDetailPage({ params }: { params: { slug: string } }) {
  const rev = REVIEW_DATA[params.slug];
  if (!rev) notFound();

  return (
    <div className="py-12">
      <JsonLd
        type="breadcrumbs"
        data={{
          items: [
            { name: 'Home', url: '/' },
            { name: 'Reviews', url: '/reviews' },
            { name: rev.title, url: `/reviews/${params.slug}` },
          ],
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link
          href="/reviews"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#FFB800] mb-8 font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Reviews
        </Link>

        {/* Article Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-[#00F5A0]/10 text-[#00F5A0] text-xs font-bold uppercase tracking-wider">
              Review
            </span>
            <span className="text-xs text-slate-400">By {rev.author} • {rev.date}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
            {rev.title}
          </h1>

          {/* Quick Score Card */}
          <div className="p-6 rounded-2xl bg-[#0B0F19] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FFB800] to-[#FF7A00] text-black font-black text-2xl flex items-center justify-center shadow-lg">
                {rev.rating}
              </div>
              <div>
                <div className="text-sm font-bold text-white">Overall Verdict: Excellent</div>
                <div className="text-xs text-slate-400">Tested in real-world everyday usage</div>
              </div>
            </div>

            <a
              href={rev.buyUrl}
              target="_blank"
              rel="nofollow sponsored"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#FFB800] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-transform"
            >
              <ShoppingCart className="w-4 h-4" /> Check Price (₹{rev.price})
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Pros & Cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
            <h3 className="text-sm font-bold text-[#00F5A0] uppercase tracking-wider mb-4">
              The Good (Pros)
            </h3>
            <ul className="space-y-2.5">
              {rev.pros.map((p: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#00F5A0] shrink-0 mt-0.5" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20">
            <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-4">
              The Bad (Cons)
            </h3>
            <ul className="space-y-2.5">
              {rev.cons.map((c: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Verdict Box */}
        <div className="p-8 rounded-3xl bg-[#0B0F19] border border-[#FFB800]/30 mb-12">
          <h3 className="text-lg font-black text-white mb-3">Our Final Take</h3>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            {rev.verdict}
          </p>
          <a
            href={rev.buyUrl}
            target="_blank"
            rel="nofollow sponsored"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFB800] to-[#FF7A00] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg"
          >
            Buy on Amazon at Lowest Price <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
}
