'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Star, 
  ShoppingCart, 
  ArrowUpRight, 
  ShieldCheck, 
  Flame,
  Check
} from 'lucide-react';

export interface ProductProps {
  id: string;
  name: string;
  slug?: string;
  category: string;
  brand?: string;
  price: number;
  mrp: number;
  imageUrl?: string;
  affiliateUrl: string;
  rating?: number;
  reviewCount?: number;
  features?: Record<string, string>;
  pros?: string[];
  cons?: string[];
  description?: string;
}

export const ProductCard: React.FC<{ product: ProductProps }> = ({ product }) => {
  const [imgSrc, setImgSrc] = useState(product.imageUrl || '/images/placeholder-product.svg');

  const discount = product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  const productUrl = `/products/${product.slug || product.id}`;

  return (
    <div className="card-surface p-5 flex flex-col justify-between group overflow-hidden relative">
      
      {/* Top Header: Discount Badge & Brand */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {discount > 0 ? (
          <span className="badge-discount">
            {discount}% OFF
          </span>
        ) : (
          <span className="badge-verified">
            <Flame className="w-3 h-3" /> Hot Deal
          </span>
        )}

        {product.brand && (
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white/5 px-2.5 py-0.5 rounded-md border border-white/5">
            {product.brand}
          </span>
        )}
      </div>

      {/* Product Image Frame */}
      <Link 
        href={productUrl}
        className="relative w-full h-44 my-2 flex items-center justify-center p-3 bg-black/30 rounded-xl overflow-hidden border border-white/5"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={product.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgSrc('/images/placeholder-product.svg')}
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between pt-3">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[11px] font-bold text-[#10B981] uppercase tracking-wider">
              {product.category.replace(/-/g, ' ')}
            </span>
            <div className="flex items-center gap-1 text-slate-300">
              <Star className="w-3.5 h-3.5 fill-[#FBBF24] text-[#FBBF24]" />
              <span className="font-bold text-white">{product.rating || 4.4}</span>
              {product.reviewCount && (
                <span className="text-[10px] text-slate-500">({product.reviewCount > 1000 ? `${(product.reviewCount/1000).toFixed(1)}k` : product.reviewCount})</span>
              )}
            </div>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-bold text-white group-hover:text-[#F59E0B] transition-colors line-clamp-2 leading-snug mb-3">
            <Link href={productUrl}>
              {product.name}
            </Link>
          </h3>

          {/* Feature Highlights */}
          {product.features && Object.keys(product.features).length > 0 && (
            <div className="mb-4 space-y-1">
              {Object.entries(product.features).slice(0, 2).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                  <Check className="w-3 h-3 text-[#10B981] shrink-0" />
                  <span className="line-clamp-1">{String(val)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Amazon CTA */}
        <div className="pt-3 border-t border-white/5 mt-auto space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.mrp > product.price && (
                <span className="text-xs line-through text-slate-500">
                  ₹{product.mrp.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {discount > 0 && (
              <span className="text-[10px] font-bold text-[#10B981]">
                Save ₹{(product.mrp - product.price).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={productUrl}
              className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center border border-white/10 transition-colors"
            >
              Specs
            </Link>
            <a
              href={product.affiliateUrl}
              target="_blank"
              rel="nofollow sponsored"
              className="btn-primary py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Buy
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
