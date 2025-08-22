'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { JsonLd } from '../seo/JsonLd';

const FAQS = [
  {
    q: 'Are all products listed on BudgetTechIndia under ₹2,000?',
    a: 'Yes, absolutely. Every single product, TWS earbud, power bank, smartwatch, and tech accessory featured on BudgetTechIndia is strictly capped under ₹2,000 (with many options under ₹999 and ₹499) to provide maximum value for money.',
  },
  {
    q: 'How do you test and evaluate budget tech products?',
    a: 'We evaluate products based on actual driver acoustics, verified battery discharge cycles, Bluetooth latency, call microphone clarity, and customer durability feedback across thousands of Amazon India buyers.',
  },
  {
    q: 'Are these official Amazon India deals and products?',
    a: 'Yes. All purchase buttons redirect directly to official Amazon.in product listings with genuine brand warranties, Amazon Fulfilled shipping, and 7-day replacement policies.',
  },
  {
    q: 'How often are product prices and discounts updated?',
    a: 'Our automated sync engine runs daily to track live price drops, lightning deals, and coupon discounts on Amazon India so you never miss a verified deal.',
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 bg-[#07090E]">
      <JsonLd
        type="faq"
        data={{
          faqs: FAQS.map((f) => ({ question: f.q, answer: f.a })),
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#F59E0B]">
            <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Everything You Need to Know
          </h2>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="card-surface overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-[#F59E0B] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#F59E0B]' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-3 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
