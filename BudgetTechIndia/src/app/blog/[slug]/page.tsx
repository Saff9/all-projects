import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import { BookOpen, Clock, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';

const BLOG_DATA: Record<string, any> = {
  'best-power-banks-guide': {
    title: 'How to Choose the Best Power Bank in India: 10000mAh vs 20000mAh',
    desc: 'Understanding Power Delivery (PD), Quick Charge 3.0, airline safety regulations, and actual usable mAh capacities.',
    date: 'August 2026',
    readTime: '6 min read',
    content: [
      {
        heading: '1. Why Stated Capacity vs Actual Usable Capacity Differs',
        body: 'Power bank lithium battery cells operate at 3.7 Volts. When charging your phone via USB (5V or 9V PD), voltage conversion loss occurs. A 10000mAh power bank yields roughly 6500–7000mAh of actual charging power.',
      },
      {
        heading: '2. Power Delivery (PD) & Fast Charging Protocols',
        body: 'Always look for minimum 20W or 22.5W Power Delivery (PD 3.0) and Quick Charge (QC 3.0). This ensures your iPhone or Android charges from 0% to 50% in under 30 minutes.',
      },
      {
        heading: '3. Integrated Cables vs Separate Wires',
        body: 'Modern power banks like the Ambrane 20000mAh with built-in Type-C cables eliminate the frustration of forgetting charging cords while traveling.',
      },
    ],
  },
  'wfh-setup-under-5000': {
    title: 'Complete Work From Home Desk Setup Under ₹5,000 in India',
    desc: 'Ergonomic aluminum laptop stands, wireless mice, keyboard, desk mat, and GaN multi-port charging hubs.',
    date: 'August 2026',
    readTime: '8 min read',
    content: [
      {
        heading: '1. Ergonomics First: Adjustable Aluminum Laptop Stand',
        body: 'Elevating your laptop screen to eye level prevents chronic neck strain. The Portronics My Buddy K provides 7 height adjustment angles for under ₹500.',
      },
      {
        heading: '2. Reliable Input Devices: Logitech B170 Wireless Mouse',
        body: 'With a 12-month battery life and smooth optical tracking, a dedicated wireless mouse drastically improves productivity over standard trackpads.',
      },
      {
        heading: '3. Clean Cable Management & Multi-Port Charging',
        body: 'A single 65W GaN adapter can power your phone, earbuds, and secondary devices simultaneously, keeping desk clutter to a minimum.',
      },
    ],
  },
  'budget-tech-gifts-guide': {
    title: 'Best Budget Tech Gifts Under ₹1,000 for Friends and Family',
    desc: 'Cool, practical, and long-lasting gadget gift ideas that won’t break the bank.',
    date: 'August 2026',
    readTime: '5 min read',
    content: [
      {
        heading: '1. boAt Airdopes 141 TWS Earbuds (₹999)',
        body: 'With 42 hours of battery life and ENx noise cancellation for calls, this is universally appreciated by music lovers and students.',
      },
      {
        heading: '2. Ambrane 10000mAh Metallic Fast Charging Power Bank (₹899)',
        body: 'Sleek metal finish, dual USB + Type-C ports, and pocket-sized portability make it an essential daily carry item.',
      },
      {
        heading: '3. Psychological Mastery Books: The Laws of Human Nature (₹699)',
        body: 'Robert Greene’s modern masterpiece provides priceless strategies for self-understanding, interpersonal dynamics, and career mastery.',
      },
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(BLOG_DATA).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = BLOG_DATA[params.slug];
  if (!post) return { title: 'Guide Not Found' };

  return {
    title: post.title,
    description: post.desc,
    openGraph: {
      title: post.title,
      description: post.desc,
      url: `https://budget-tech-india.vercel.app/blog/${params.slug}`,
    },
    alternates: {
      canonical: `https://budget-tech-india.vercel.app/blog/${params.slug}`,
    },
  };
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = BLOG_DATA[params.slug];
  if (!post) notFound();

  return (
    <div className="py-12">
      <JsonLd
        type="breadcrumbs"
        data={{
          items: [
            { name: 'Home', url: '/' },
            { name: 'Guides', url: '/blog' },
            { name: post.title, url: `/blog/${params.slug}` },
          ],
        }}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#FFB800] mb-8 font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Guides
        </Link>

        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
            <span>{post.date}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {post.readTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
            {post.title}
          </h1>

          <p className="text-base text-slate-300 leading-relaxed border-l-2 border-[#FFB800] pl-4 italic">
            {post.desc}
          </p>
        </div>

        <div className="space-y-8 text-slate-300 text-sm sm:text-base leading-relaxed mb-16">
          {post.content.map((sec: any, i: number) => (
            <div key={i} className="p-6 rounded-2xl bg-[#0B0F19] border border-white/5">
              <h2 className="text-lg font-bold text-white mb-3 text-[#FFB800]">
                {sec.heading}
              </h2>
              <p>{sec.body}</p>
            </div>
          ))}
        </div>

        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#FFB800]/10 via-white/[0.02] to-transparent border border-[#FFB800]/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Looking for Curated Gadgets?</h3>
            <p className="text-xs text-slate-400">Explore handpicked verified deals under ₹2,000.</p>
          </div>
          <Link
            href="/categories"
            className="px-6 py-3 rounded-xl bg-[#FFB800] text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 whitespace-nowrap"
          >
            Explore Deals <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
