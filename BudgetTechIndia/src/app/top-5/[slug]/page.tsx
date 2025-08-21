import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { ProductCard } from '@/components/products/ProductCard';
import { getAllNeonProducts } from '@/utils/neondb';
import productsData from '@/data/products.json';
import { Award, Star, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const TOP_5_DETAILS: Record<string, { title: string; desc: string; category: string }> = {
  'best-budget-earbuds-2026': {
    title: 'Top 5 Best TWS Earbuds Under ₹1,000 in India (2026)',
    desc: 'Tested and ranked for deep bass, crystal clear calling mics, low gaming latency, and 40+ hours total battery life.',
    category: 'bluetooth-earbuds',
  },
  'top-smartwatches-under-2000': {
    title: 'Top 5 Best Bluetooth Calling Smartwatches Under ₹2,000',
    desc: 'Side-by-side comparison of Bluetooth calling range, 550+ nits display clarity, battery life, and health tracker precision.',
    category: 'smartwatches',
  },
  'best-fast-chargers-2026': {
    title: 'Top 5 Best Power Banks & Fast Chargers Under ₹1,500',
    desc: 'High-capacity 20000mAh and 10000mAh fast-charging power banks with Power Delivery and integrated cables.',
    category: 'power-banks',
  },
};

export async function generateStaticParams() {
  return Object.keys(TOP_5_DETAILS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const guide = TOP_5_DETAILS[params.slug];
  if (!guide) return { title: 'Guide Not Found' };

  return {
    title: guide.title,
    description: guide.desc,
    openGraph: {
      title: guide.title,
      description: guide.desc,
      url: `https://budget-tech-india.vercel.app/top-5/${params.slug}`,
    },
    alternates: {
      canonical: `https://budget-tech-india.vercel.app/top-5/${params.slug}`,
    },
  };
}

export default async function Top5DetailPage({ params }: { params: { slug: string } }) {
  const guide = TOP_5_DETAILS[params.slug];
  if (!guide) notFound();

  let allProducts: any[] = [];
  try {
    const neonProds = await getAllNeonProducts();
    if (neonProds && neonProds.length > 0) {
      allProducts = neonProds;
    } else {
      allProducts = (productsData as any).products || [];
    }
  } catch (e) {
    allProducts = (productsData as any).products || [];
  }

  const categoryProducts = allProducts.filter((p) => p.category === guide.category).slice(0, 5);

  return (
    <div className="py-12">
      <JsonLd
        type="breadcrumbs"
        data={{
          items: [
            { name: 'Home', url: '/' },
            { name: 'Top 5 Guides', url: '/top-5' },
            { name: guide.title, url: `/top-5/${params.slug}` },
          ],
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#0B0F19] to-[#06080F] border border-white/5 relative overflow-hidden mb-12 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/20 text-xs font-bold mb-4">
            <Award className="w-3.5 h-3.5" /> Official 2026 Rankings
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
            {guide.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
            {guide.desc}
          </p>
        </div>

        {/* Ranked Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {categoryProducts.map((prod, idx) => (
            <div key={prod.id} className="relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-tr from-[#FFB800] to-[#FF7A00] text-black font-black text-xs flex items-center justify-center z-20 shadow-lg border-2 border-[#06080F]">
                #{idx + 1}
              </div>
              <ProductCard product={prod} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
