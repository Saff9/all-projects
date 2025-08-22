'use client';

import React, { useState } from 'react';
import { ProductProps, ProductCard } from '../products/ProductCard';
import { Flame, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const TopPicks: React.FC<{ products: ProductProps[] }> = ({ products }) => {
  const [filter, setFilter] = useState<'all' | 'under-999' | 'bluetooth-earbuds' | 'power-banks' | 'smartwatches'>('all');

  const filtered = products.filter((p) => {
    if (filter === 'under-999') return p.price < 1000;
    if (filter === 'all') return true;
    return p.category === filter;
  }).slice(0, 8);

  return (
    <section className="py-16 bg-[#07090E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#F59E0B] mb-2">
              <Flame className="w-3.5 h-3.5 fill-[#F59E0B]" /> Handpicked Deals Under ₹2,000
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Trending Deals Today
            </h2>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: 'All Deals', val: 'all' },
              { label: 'Under ₹999', val: 'under-999' },
              { label: 'Earbuds', val: 'bluetooth-earbuds' },
              { label: 'Power Banks', val: 'power-banks' },
              { label: 'Smartwatches', val: 'smartwatches' },
            ].map((tab) => (
              <button
                key={tab.val}
                onClick={() => setFilter(tab.val as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filter === tab.val
                    ? 'bg-[#F59E0B] text-black shadow-md'
                    : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {filtered.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>

        {/* Explore Categories CTA */}
        <div className="text-center">
          <Link
            href="/categories"
            className="btn-secondary px-8 py-3.5 text-xs uppercase font-extrabold tracking-wider"
          >
            Explore All 50+ Budget Deals <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};
