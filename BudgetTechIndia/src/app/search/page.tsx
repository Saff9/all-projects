'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/products/ProductCard';
import productsData from '@/data/products.json';
import { Search, Sparkles, Filter } from 'lucide-react';

function SearchComponent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const allProducts = (productsData as any).products || [];

  const filteredProducts = allProducts.filter((p: any) => {
    const matchesQuery = 
      !query.trim() ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.brand?.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      p.description?.toLowerCase().includes(query.toLowerCase());

    const matchesCat = 
      categoryFilter === 'all' || 
      p.category === categoryFilter;

    return matchesQuery && matchesCat;
  });

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Search <span className="gold-gradient-text">Gadget Deals</span>
          </h1>
          <p className="text-sm text-slate-400">
            Find the best budget tech under ₹2000 in India by keyword, brand, or category.
          </p>
        </div>

        {/* Search Bar & Filter Controls */}
        <div className="max-w-3xl mx-auto mb-12 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FFB800]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search earbuds, power banks, smartwatches, brands..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#0B0F19] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB800] text-sm shadow-xl"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            {['all', 'bluetooth-earbuds', 'power-banks', 'smartwatches', 'fast-chargers-cables', 'accessories', 'books'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  categoryFilter === cat 
                    ? 'bg-[#FFB800] text-black shadow-md' 
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                }`}
              >
                {cat === 'all' ? 'All Gadgets' : cat.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00F5A0]" />
            Found {filteredProducts.length} Results {query ? `for "${query}"` : ''}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((prod: any) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#0B0F19] rounded-3xl border border-white/5">
            <p className="text-base text-slate-300 font-bold mb-2">No matching products found</p>
            <p className="text-xs text-slate-500">Try searching for keywords like &ldquo;boat&rdquo;, &ldquo;earbuds&rdquo;, &ldquo;power bank&rdquo;, or &ldquo;watch&rdquo;.</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-400">Loading search...</div>}>
      <SearchComponent />
    </Suspense>
  );
}
