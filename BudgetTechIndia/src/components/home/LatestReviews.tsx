import React from 'react';
import Link from 'next/link';
import { Star, ArrowRight, Award, CheckCircle2 } from 'lucide-react';

const REVIEWS = [
  {
    title: 'boAt Bassheads 100 Wired Earphones Review',
    slug: 'boat-bassheads-100-review',
    category: 'Earphones',
    score: '8.8',
    verdict: 'Best ultra-budget bass-heavy wired earphones with in-line microphone under ₹400.',
    pros: ['Punchy 10mm dynamic bass', 'Tangle-resistant hawk-style cable', 'Reliable calling mic'],
    price: '₹349',
    imageUrl: 'https://m.media-amazon.com/images/I/71u-s5y98cL._SL1500_.jpg',
  },
  {
    title: 'Mi Power Bank 3i 10000mAh Long-Term Review',
    slug: 'mi-power-bank-review',
    category: 'Power Banks',
    score: '9.3',
    verdict: 'The gold standard for reliable 18W fast charging and durable aluminum shell casing.',
    pros: ['18W Dual Type-C output', '12-layer circuit protection', 'Compact pocketable format'],
    price: '₹1,299',
    imageUrl: 'https://m.media-amazon.com/images/I/71lVowl36bL._SL1500_.jpg',
  },
  {
    title: 'OnePlus Buds Z2 ANC In-Depth Lab Test',
    slug: 'oneplus-buds-z2-review',
    category: 'Bluetooth Earbuds',
    score: '9.1',
    verdict: 'Flagship-grade active noise cancellation and 11mm bass drivers under ₹2,000.',
    pros: ['40dB Active Noise Cancellation', 'Flash Charge (10 mins = 5 hrs)', 'Dolby Atmos support'],
    price: '₹1,999',
    imageUrl: 'https://m.media-amazon.com/images/I/61K-84k5wEL._SL1500_.jpg',
  },
  {
    title: 'Noise ColorFit Pro 4 Smartwatch Review',
    slug: 'noise-colorfit-pro-4-review',
    category: 'Smartwatches',
    score: '8.9',
    verdict: 'Stunning 60Hz smooth display with crisp Bluetooth calling and digital crown controls.',
    pros: ['1.72" TFT 60Hz display', 'InstaCharge 7-day battery', '100 sports modes'],
    price: '₹1,799',
    imageUrl: 'https://m.media-amazon.com/images/I/61I2a7J9FBL._SL1500_.jpg',
  },
];

export const LatestReviews: React.FC = () => {
  return (
    <section className="py-16 bg-[#07090E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#10B981] mb-2">
              <Award className="w-3.5 h-3.5" /> Hands-On Testing
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Latest Editorial Reviews
            </h2>
          </div>
          <Link
            href="/reviews"
            className="text-xs font-bold text-[#F59E0B] hover:underline flex items-center gap-1 self-start md:self-auto"
          >
            View All Reviews <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {REVIEWS.map((rev) => (
            <div
              key={rev.slug}
              className="card-surface p-6 flex flex-col sm:flex-row gap-6 justify-between group"
            >
              {/* Product Image Frame */}
              <div className="w-full sm:w-36 h-36 bg-black/40 rounded-2xl border border-white/5 p-4 flex items-center justify-center shrink-0 relative overflow-hidden">
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#F59E0B] text-black font-black text-[10px]">
                  {rev.score} / 10
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={rev.imageUrl}
                  alt={rev.title}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Review Content */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-[10px] uppercase font-bold text-[#10B981]">
                      {rev.category}
                    </span>
                    <span className="font-extrabold text-white text-sm">
                      {rev.price}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white group-hover:text-[#F59E0B] transition-colors leading-snug mb-2">
                    <Link href={`/reviews/${rev.slug}`}>
                      {rev.title}
                    </Link>
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
                    {rev.verdict}
                  </p>

                  <div className="space-y-1 mb-4">
                    {rev.pros.slice(0, 2).map((pro, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                        <CheckCircle2 className="w-3 h-3 text-[#10B981] shrink-0" />
                        <span>{pro}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={`/reviews/${rev.slug}`}
                  className="text-xs font-bold text-[#F59E0B] group-hover:text-white flex items-center gap-1 transition-colors"
                >
                  Read Full Verdict <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
