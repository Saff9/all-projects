'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  Headphones, 
  BatteryCharging, 
  Watch, 
  Zap, 
  Laptop, 
  Sparkles, 
  Award,
  ShoppingBag
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Bluetooth Earbuds', slug: 'bluetooth-earbuds', icon: Headphones, desc: 'TWS under ₹2,000 with ANC & low latency' },
  { name: 'Power Banks', slug: 'power-banks', icon: BatteryCharging, desc: '10000mAh & 20000mAh fast-charging packs' },
  { name: 'Smartwatches', slug: 'smartwatches', icon: Watch, desc: 'BT calling & AMOLED displays under ₹2k' },
  { name: 'Fast Chargers & Cables', slug: 'fast-chargers-cables', icon: Zap, desc: 'GaN adapters & durable braided cords' },
  { name: 'Laptop Accessories', slug: 'laptop-accessories', icon: Laptop, desc: 'Stands, hubs, wireless mice & keyboards' },
  { name: 'Gadgets Under ₹999', slug: 'budget-gadgets-under-999', icon: Sparkles, desc: 'Extreme-value budget tech gifts' },
];

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setCategoriesOpen(false);
  }, [pathname]);

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-200 ${
      scrolled 
        ? 'bg-[#07090E]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3' 
        : 'bg-[#07090E]/80 backdrop-blur-md border-b border-white/5 py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F59E0B] to-[#FBBF24] p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center justify-center group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#07090E] rounded-[10px] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-[#F59E0B]" />
              </div>
            </div>
            <div className="flex items-center tracking-tight font-black text-lg sm:text-xl">
              <span className="text-white">Budget</span>
              <span className="text-gradient-gold ml-1">Tech</span>
              <span className="ml-1.5 px-2 py-0.5 text-[10px] uppercase font-black tracking-widest rounded bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                India
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                pathname === '/' ? 'text-[#F59E0B] bg-white/5' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Home
            </Link>

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                onMouseEnter={() => setCategoriesOpen(true)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                  pathname.startsWith('/categories') ? 'text-[#F59E0B] bg-white/5' : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoriesOpen ? 'rotate-180 text-[#F59E0B]' : ''}`} />
              </button>

              {/* Mega Dropdown */}
              {categoriesOpen && (
                <div
                  onMouseLeave={() => setCategoriesOpen(false)}
                  className="absolute top-full left-0 w-96 p-4 rounded-2xl bg-[#0D111A] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_20px_rgba(245,158,11,0.15)] animate-in fade-in slide-in-from-top-2 duration-150 grid grid-cols-1 gap-2"
                >
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-3 pt-1 pb-2 border-b border-white/5 flex items-center justify-between">
                    <span>Curated Product Hubs</span>
                    <Link href="/categories" className="text-[#F59E0B] hover:underline">View All</Link>
                  </div>
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <Link
                        key={cat.slug}
                        href={`/categories/${cat.slug}`}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group/item"
                      >
                        <div className="p-2 rounded-lg bg-white/5 group-hover/item:bg-[#F59E0B]/10 text-slate-300 group-hover/item:text-[#F59E0B] transition-colors shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover/item:text-[#F59E0B] transition-colors">
                            {cat.name}
                          </div>
                          <div className="text-[11px] text-slate-400 leading-tight">
                            {cat.desc}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              href="/top-5"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                pathname.startsWith('/top-5') ? 'text-[#F59E0B] bg-white/5' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Top 5 Lists</span>
            </Link>

            <Link
              href="/reviews"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                pathname.startsWith('/reviews') ? 'text-[#F59E0B] bg-white/5' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Reviews
            </Link>

            <Link
              href="/blog"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                pathname.startsWith('/blog') ? 'text-[#F59E0B] bg-white/5' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Buying Guides
            </Link>
          </nav>

          {/* Right Action: Instant Search & Mobile Toggle */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/search"
              aria-label="Search all products"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-[#F59E0B] border border-white/5 transition-all flex items-center gap-2 text-xs font-semibold"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="p-2.5 rounded-xl bg-white/5 text-slate-300 hover:text-white border border-white/5 lg:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 pb-5 border-t border-white/10 animate-in fade-in duration-150 space-y-2">
            <Link
              href="/"
              className="block px-3.5 py-2 rounded-xl text-xs font-bold text-white hover:bg-white/5"
            >
              Home
            </Link>
            <Link
              href="/categories"
              className="block px-3.5 py-2 rounded-xl text-xs font-bold text-white hover:bg-white/5"
            >
              All Categories
            </Link>
            <Link
              href="/top-5"
              className="block px-3.5 py-2 rounded-xl text-xs font-bold text-[#F59E0B] hover:bg-white/5"
            >
              🏆 Top 5 Ranked Lists
            </Link>
            <Link
              href="/reviews"
              className="block px-3.5 py-2 rounded-xl text-xs font-bold text-white hover:bg-white/5"
            >
              Editorial Reviews
            </Link>
            <Link
              href="/blog"
              className="block px-3.5 py-2 rounded-xl text-xs font-bold text-white hover:bg-white/5"
            >
              Buying Guides
            </Link>
            <Link
              href="/search"
              className="block px-3.5 py-2 rounded-xl text-xs font-bold text-[#10B981] hover:bg-white/5"
            >
              🔍 Search All Products
            </Link>
          </div>
        )}

      </div>
    </header>
  );
};
