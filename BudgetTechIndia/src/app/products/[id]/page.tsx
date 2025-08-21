import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { ProductCard } from '@/components/products/ProductCard';
import { getAllNeonProducts } from '@/utils/neondb';
import productsData from '@/data/products.json';
import { 
  Star, 
  ShoppingCart, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Zap,
  ArrowLeft,
  Flame,
  Award
} from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const allProds = (productsData as any).products || [];
  const prod = allProds.find((p: any) => p.slug === params.id || p.id === params.id);
  if (!prod) return { title: 'Product Not Found' };

  return {
    title: `${prod.name} Review & Lowest Deal Price (2026)`,
    description: `Comprehensive testing, frequency response, battery endurance, and current verified Amazon discount for ${prod.name} in India.`,
    openGraph: {
      title: `${prod.name} Review & Price in India`,
      description: prod.description || `Special deal on ${prod.name} on Amazon India.`,
      url: `https://budget-tech-india.vercel.app/products/${params.id}`,
      images: [{ url: prod.imageUrl || '/images/placeholder-product.svg' }],
    },
    alternates: {
      canonical: `https://budget-tech-india.vercel.app/products/${params.id}`,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
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

  const product = allProducts.find((p) => p.slug === params.id || p.id === params.id);
  if (!product) {
    notFound();
  }

  const discount = product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return (
    <div className="py-10">
      <JsonLd type="product" data={product} />
      <JsonLd
        type="breadcrumbs"
        data={{
          items: [
            { name: 'Home', url: '/' },
            { name: 'Categories', url: '/categories' },
            { name: product.category, url: `/categories/${product.category}` },
            { name: product.name, url: `/products/${product.slug || product.id}` },
          ],
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <Link
          href={`/categories/${product.category}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#F59E0B] mb-8 font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to {product.category.replace(/-/g, ' ')}
        </Link>

        {/* Main Product Showcase Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 card-surface p-6 sm:p-10 mb-12 shadow-2xl">
          
          {/* Col 1: High-res Gallery Frame */}
          <div className="lg:col-span-5 flex items-center justify-center p-8 bg-black/40 rounded-2xl border border-white/5 relative group overflow-hidden">
            {discount > 0 ? (
              <span className="absolute top-4 left-4 badge-discount">
                {discount}% OFF
              </span>
            ) : (
              <span className="absolute top-4 left-4 badge-verified">
                Verified Deal
              </span>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl || '/images/placeholder-product.svg'}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="max-h-[340px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Col 2: Product Overview, Price & Amazon Buy Box */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-bold uppercase tracking-wider border border-[#10B981]/20">
                  {product.category.replace(/-/g, ' ')}
                </span>
                {product.brand && (
                  <span className="px-3 py-1 rounded-full bg-white/5 text-slate-300 text-xs font-semibold border border-white/5">
                    {product.brand}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight mb-4">
                {product.name}
              </h1>

              {/* Rating & Review Breakdown */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#FBBF24]">
                  <Star className="w-4 h-4 fill-[#FBBF24]" />
                  <span className="font-extrabold text-sm text-white">{product.rating || 4.4}</span>
                </div>
                <span className="text-xs text-slate-400">
                  Tested and verified by BudgetTechIndia editorial team
                </span>
              </div>

              {/* Verified Deal Price Box */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 mb-6 space-y-2">
                <div className="text-xs uppercase font-bold text-slate-400">Verified Amazon Price</div>

                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-5xl font-black text-white">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.mrp > product.price && (
                    <span className="text-base line-through text-slate-500">
                      ₹{product.mrp.toLocaleString('en-IN')}
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="text-xs font-bold text-[#10B981]">
                      Save ₹{(product.mrp - product.price).toLocaleString('en-IN')} ({discount}%)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Direct Amazon Buy Action */}
            <div className="space-y-4 pt-2">
              <a
                href={product.affiliateUrl}
                target="_blank"
                rel="nofollow sponsored"
                className="w-full py-4 px-6 rounded-2xl btn-primary text-sm flex items-center justify-center gap-3 shadow-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                Check Lowest Price on Amazon India
                <ArrowUpRight className="w-4 h-4" />
              </a>

              <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-slate-400 pt-2">
                <div className="p-2.5 rounded-xl bg-white/[0.02] flex items-center justify-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Amazon Fulfilled</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>100% Original</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] flex items-center justify-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                  <span>7-Day Replacement</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Technical Specifications & Pros/Cons */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Specs Table */}
          <div className="lg:col-span-7 card-surface p-6 sm:p-8">
            <h2 className="text-base font-extrabold uppercase tracking-wider text-white mb-6 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#F59E0B]" /> Technical Specifications
            </h2>
            {product.features && Object.keys(product.features).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(product.features).map(([key, val]) => (
                  <div key={key} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="text-[11px] text-slate-400 font-medium">{key}</div>
                    <div className="text-sm text-white font-bold">{String(val)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Standard budget tech specifications apply.</p>
            )}
          </div>

          {/* Pros & Cons */}
          <div className="lg:col-span-5 space-y-6">
            {product.pros && product.pros.length > 0 && (
              <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="text-xs uppercase font-extrabold text-[#10B981] tracking-wider mb-3">
                  Highlights & Pros
                </div>
                <ul className="space-y-2">
                  {product.pros.map((pro: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.cons && product.cons.length > 0 && (
              <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20">
                <div className="text-xs uppercase font-extrabold text-rose-400 tracking-wider mb-3">
                  Drawbacks to Note
                </div>
                <ul className="space-y-2">
                  {product.cons.map((con: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>

        {/* Related Category Deals */}
        {relatedProducts.length > 0 && (
          <div className="pt-8 border-t border-white/5">
            <h2 className="text-xl sm:text-2xl font-black text-white mb-6">
              Similar Verified Deals in {product.category.replace(/-/g, ' ')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
