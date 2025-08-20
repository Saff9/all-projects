import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/products/ProductCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { getAllNeonProducts } from '@/utils/neondb';
import productsData from '@/data/products.json';
import { Headphones, BatteryCharging, Watch, Zap, Laptop, Sparkles, HelpCircle, CheckCircle2 } from 'lucide-react';

const CATEGORY_MAP: Record<string, { name: string; title: string; desc: string; icon: any; buyingTips: string[] }> = {
  'bluetooth-earbuds': {
    name: 'Bluetooth Earbuds',
    title: 'Best Bluetooth Earbuds & TWS Under ₹2,000 in India (2026)',
    desc: 'Compare the highest rated true wireless earbuds (TWS) and neckbands with low latency, active noise cancellation, and 40+ hours battery life.',
    icon: Headphones,
    buyingTips: [
      'Look for minimum 10mm to 13mm dynamic drivers for balanced bass in budget TWS.',
      'Ensure Bluetooth 5.2 or 5.3 is supported for stable low latency connections (<50ms).',
      'Dual mic or quad mic with ENC is essential for clear calls on commutes.',
    ],
  },
  'power-banks': {
    name: 'Power Banks',
    title: 'Best 10000mAh & 20000mAh Power Banks Under ₹1,500 in India',
    desc: 'Tested high-capacity fast charging power banks with 22.5W Power Delivery and integrated cables from Ambrane, Mi, and URBN.',
    icon: BatteryCharging,
    buyingTips: [
      'Choose minimum 20W or 22.5W Power Delivery (PD 3.0) for fast charging.',
      'Check for 12-layer multi-protection circuits against short-circuits.',
      'Integrated Type-C cords eliminate carrying loose cables.',
    ],
  },
  'smartwatches': {
    name: 'Smartwatches',
    title: 'Best Bluetooth Calling Smartwatches Under ₹2,000 in India',
    desc: 'Feature-packed smartwatches with vibrant AMOLED/HD displays, clear Bluetooth calling, and health monitoring sensors.',
    icon: Watch,
    buyingTips: [
      'Prioritize displays with 550+ nits brightness for outdoor legibility.',
      'Single-chip BT calling consumes up to 40% less battery than dual-chip.',
      'Verify IP68 water resistance rating for workouts.',
    ],
  },
  'fast-chargers-cables': {
    name: 'Fast Chargers & Cables',
    title: 'Best Fast Chargers, GaN Adapters & Type-C Cables Under ₹1,000',
    desc: 'Durable braided fast charging cables and multi-port GaN power adapters for iPhone, Android, and laptops.',
    icon: Zap,
    buyingTips: [
      'GaN technology keeps multi-port chargers 50% cooler and compact.',
      'Ensure cables have reinforced nylon braiding with 10,000+ bend lifespan.',
    ],
  },
  'laptop-accessories': {
    name: 'Laptop Accessories',
    title: 'Best Budget Laptop Accessories Under ₹1,000 in India',
    desc: 'Ergonomic aluminum laptop stands, wireless mice, keyboards, and USB hubs to upgrade your work setup.',
    icon: Laptop,
    buyingTips: [
      'Aluminum laptop stands provide passive heat dissipation.',
      'Optical wireless mice with 1000+ DPI provide smooth navigation.',
    ],
  },
  'budget-gadgets-under-999': {
    name: 'Gadgets Under ₹999',
    title: 'Top Extreme-Value Tech Gadgets Under ₹999 in India',
    desc: 'Super affordable tech gifts, cables, earphones, and desk accessories under ₹999 that punch well above their weight.',
    icon: Sparkles,
    buyingTips: [
      'Look for established brand warranty support.',
      'Always verify customer return windows on Amazon India.',
    ],
  },
  'work-from-home-essentials': {
    name: 'Work From Home Essentials',
    title: 'Best Work From Home & Desk Setup Tech Under ₹2,000',
    desc: 'Essential productivity gadgets including desk mats, cable organizers, mice, and laptop stands.',
    icon: Laptop,
    buyingTips: [
      'Ergonomic alignment reduces neck strain during long hours.',
      'Multi-device charging hubs reduce desktop clutter.',
    ],
  },
  'books': {
    name: 'Books & Self-Mastery',
    title: 'Best Tech, Psychology & Strategy Books in India',
    desc: 'Curated psychological masterworks, tech guides, and strategy books on Amazon India.',
    icon: Sparkles,
    buyingTips: [
      'Timeless strategic masterworks provide enduring mental models.',
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(CATEGORY_MAP).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const cat = CATEGORY_MAP[params.slug];
  if (!cat) return { title: 'Category Not Found' };

  return {
    title: cat.title,
    description: cat.desc,
    openGraph: {
      title: cat.title,
      description: cat.desc,
      url: `https://budget-tech-india.vercel.app/categories/${params.slug}`,
      type: 'website',
    },
    alternates: {
      canonical: `https://budget-tech-india.vercel.app/categories/${params.slug}`,
    },
  };
}

export const revalidate = 60; // ISR

export default async function CategoryDetailPage({ params }: { params: { slug: string } }) {
  const cat = CATEGORY_MAP[params.slug];
  if (!cat) notFound();

  const Icon = cat.icon;

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

  const categoryProducts = allProducts.filter((p) => {
    if (p.category === params.slug) return true;
    if (params.slug === 'laptop-accessories' && p.category === 'accessories') return true;
    if (params.slug === 'budget-gadgets-under-999' && p.price < 1000) return true;
    return false;
  });

  return (
    <div className="py-12">
      <JsonLd
        type="breadcrumbs"
        data={{
          items: [
            { name: 'Home', url: '/' },
            { name: 'Categories', url: '/categories' },
            { name: cat.name, url: `/categories/${params.slug}` },
          ],
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Category Hero Banner */}
        <div className="card-surface p-8 sm:p-12 relative overflow-hidden mb-10 shadow-2xl">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#F59E0B] text-xs font-bold mb-4">
              <Icon className="w-3.5 h-3.5" /> Category Guide
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              {cat.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-6">
              {cat.desc}
            </p>

            {/* Buying Advice */}
            {cat.buyingTips && (
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="text-xs uppercase font-extrabold text-[#10B981] tracking-wider flex items-center gap-1.5 mb-2">
                  <HelpCircle className="w-3.5 h-3.5" /> What to Look For Before Buying:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  {cat.buyingTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white">
              Verified Deals in {cat.name} ({categoryProducts.length})
            </h2>
            <span className="text-xs text-[#10B981] font-semibold">Live Amazon Prices</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
