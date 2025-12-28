'use client';

import { useState } from 'react';
import {
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  Sparkles,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { ToolItem } from '@/lib/tools-data';

interface ToolContentSectionProps {
  tool: ToolItem;
}

export default function ToolContentSection({ tool }: ToolContentSectionProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800 space-y-12">
      {/* 1. How to Use Section */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              How to Use the {tool.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Follow these simple steps to get instant, accurate results
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tool.howToUseSteps.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
            >
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                {index + 1}
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {step}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Key Features Grid */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-200/50 dark:border-teal-800/50">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Key Features &amp; Capabilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Designed for accuracy, speed, and privacy
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {tool.features.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80"
            >
              <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Pro Tips & Best Practices Callout */}
      {tool.proTips && tool.proTips.length > 0 && (
        <section className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent rounded-2xl p-6 sm:p-8 border border-amber-300/30 dark:border-amber-700/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              SEO &amp; Developer Pro Tips
            </h3>
          </div>
          <ul className="space-y-3">
            {tool.proTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                <span className="text-amber-500 font-bold">•</span>
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 4. Frequently Asked Questions (FAQ Accordion with Schema support) */}
      {tool.faqs && tool.faqs.length > 0 && (
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/50">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Everything you need to know about {tool.name}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {tool.faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/70 transition-colors"
                  >
                    <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 pr-4">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-4 sm:p-5 pt-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80">
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
