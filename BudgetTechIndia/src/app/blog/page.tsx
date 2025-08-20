import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { BookOpen, ArrowRight, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tech Guides & Buying Advice (2026)',
  description: 'Learn how to choose the right budget gadgets, optimize your desk setup, and maintain battery life with expert tech guides.',
  openGraph: {
    title: 'Buying Guides & Tech Blog | BudgetTechIndia',
    description: 'Expert buying guides and gadget tips.',
    url: 'https://budget-tech-india.vercel.app/blog',
  },
};

const POSTS = [
  {
    slug: 'best-power-banks-guide',
    title: 'How to Choose the Best Power Bank in India: 10000mAh vs 20000mAh',
    desc: 'Understanding Power Delivery (PD), Quick Charge 3.0, airline safety regulations, and actual usable mAh capacities.',
    date: 'August 2026',
    readTime: '6 min read',
  },
  {
    slug: 'wfh-setup-under-5000',
    title: 'Complete Work From Home Desk Setup Under ₹5,000 in India',
    desc: 'Ergonomic aluminum laptop stands, wireless mice, keyboard, desk mat, and GaN multi-port charging hubs.',
    date: 'August 2026',
    readTime: '8 min read',
  },
  {
    slug: 'budget-tech-gifts-guide',
    title: 'Best Budget Tech Gifts Under ₹1,000 for Friends and Family',
    desc: 'Cool, practical, and long-lasting gadget gift ideas that won’t break the bank.',
    date: 'August 2026',
    readTime: '5 min read',
  },
];

export default function BlogIndexPage() {
  return (
    <div className="py-12">
      <JsonLd
        type="breadcrumbs"
        data={{
          items: [
            { name: 'Home', url: '/' },
            { name: 'Blog', url: '/blog' },
          ],
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold mb-4">
            <BookOpen className="w-3.5 h-3.5" /> Expert Advice
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
            Tech Buying <span className="gold-gradient-text">Guides</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Actionable buying guides, optimization tutorials, and expert tips to maximize every rupee you spend on tech.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {POSTS.map((post) => (
            <div
              key={post.slug}
              className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {post.readTime}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-white group-hover:text-[#FFB800] transition-colors leading-snug mb-3">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                  {post.desc}
                </p>
              </div>

              <Link
                href={`/blog/${post.slug}`}
                className="text-xs font-bold text-[#FFB800] hover:underline flex items-center gap-1.5 pt-4 border-t border-white/5"
              >
                Read Full Guide <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
