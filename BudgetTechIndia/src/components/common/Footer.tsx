import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart, Zap, ShoppingBag } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#04060A] border-t border-white/5 pt-16 pb-12 mt-20 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/5">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#F59E0B] to-[#FBBF24] p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-[#07090E] rounded-[10px] flex items-center justify-center font-bold text-[#F59E0B]">
                  <ShoppingBag className="w-4 h-4 text-[#F59E0B]" />
                </div>
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                BudgetTech<span className="text-[#F59E0B]">India</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-400 max-w-sm">
              Your trusted source for honest reviews, specs comparisons, and curated tech gadget deals under ₹2,000 in India.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" /> Tested & Verified
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                <Zap className="w-3.5 h-3.5" /> Daily Deal Sync
              </span>
            </div>
          </div>

          {/* Col 2: Top Categories */}
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-wider mb-4">Top Categories</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/categories/bluetooth-earbuds" className="hover:text-[#F59E0B] transition-colors">Bluetooth Earbuds</Link></li>
              <li><Link href="/categories/power-banks" className="hover:text-[#F59E0B] transition-colors">Fast Power Banks</Link></li>
              <li><Link href="/categories/smartwatches" className="hover:text-[#F59E0B] transition-colors">Calling Smartwatches</Link></li>
              <li><Link href="/categories/fast-chargers-cables" className="hover:text-[#F59E0B] transition-colors">GaN Fast Chargers</Link></li>
              <li><Link href="/categories/laptop-accessories" className="hover:text-[#F59E0B] transition-colors">Laptop Accessories</Link></li>
            </ul>
          </div>

          {/* Col 3: Best Ranked Lists */}
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-wider mb-4">Ranked Guides</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/top-5/best-budget-earbuds-2026" className="hover:text-[#F59E0B] transition-colors">Best Earbuds Under ₹1000</Link></li>
              <li><Link href="/top-5/top-smartwatches-under-2000" className="hover:text-[#F59E0B] transition-colors">Best Watches Under ₹2000</Link></li>
              <li><Link href="/top-5/best-fast-chargers-2026" className="hover:text-[#F59E0B] transition-colors">Best GaN Fast Chargers</Link></li>
              <li><Link href="/reviews" className="hover:text-[#F59E0B] transition-colors">All Product Reviews</Link></li>
              <li><Link href="/blog" className="hover:text-[#F59E0B] transition-colors">Tech Buying Guides</Link></li>
            </ul>
          </div>

          {/* Col 4: Trust & Legal */}
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-wider mb-4">Company & Legal</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/about" className="hover:text-[#F59E0B] transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-[#F59E0B] transition-colors">Contact & Support</Link></li>
              <li><Link href="/affiliate-disclosure" className="hover:text-[#F59E0B] transition-colors">Affiliate Disclosure</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-[#F59E0B] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-conditions" className="hover:text-[#F59E0B] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Amazon Affiliate Disclaimer Box */}
        <div className="py-6 border-b border-white/5 text-[11px] leading-relaxed text-slate-500">
          <p>
            <strong className="text-slate-400">Amazon Associates Disclosure:</strong> BudgetTechIndia is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.in. When you purchase through our links, we may earn an affiliate commission at zero additional cost to you. Product prices and availability are accurate as of the date/time indicated and are subject to change.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} BudgetTechIndia. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-500">
            Curated with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for budget tech shoppers in India.
          </p>
        </div>
      </div>
    </footer>
  );
};
