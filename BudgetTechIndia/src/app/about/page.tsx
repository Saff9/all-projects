import React from 'react';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { ShieldCheck, Zap, Award, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us - BudgetTechIndia',
  description: 'Learn how BudgetTechIndia tests and curates the best budget gadgets under ₹2000 in India.',
};

export default function AboutPage() {
  return (
    <div className="py-16">
      <JsonLd
        type="breadcrumbs"
        data={{
          items: [
            { name: 'Home', url: '/' },
            { name: 'About Us', url: '/about' },
          ],
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#FFB800] block mb-2">
            Our Mission
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-6">
            Empowering Smart Tech Purchases in India
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            BudgetTechIndia was born out of a simple belief: you don&apos;t need to spend ₹10,000 to get incredible sound, long battery life, or reliable everyday tech.
          </p>
        </div>

        <div className="space-y-10 text-slate-300 leading-relaxed">
          <div className="p-8 rounded-3xl bg-[#0B0F19] border border-white/5 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#00F5A0]" /> Our Testing Philosophy
            </h2>
            <p className="text-sm">
              We never recommend a gadget based solely on marketing claims. We evaluate driver sizing, frequency response, micro-USB vs Type-C charging speeds, Bluetooth stability, and real-world degradation over weeks of testing.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#0B0F19] border border-white/5 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-[#FFB800]" /> Editorial Independence
            </h2>
            <p className="text-sm">
              We participate in the Amazon Associates affiliate program, which allows us to operate independently without accepting paid manufacturer biases. If a product fails our build or audio standards, we do not recommend it.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
