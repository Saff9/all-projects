import React from 'react';
import type { Metadata } from 'next';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'All Product Categories - Best Tech Under ₹2000',
  description: 'Explore all budget gadget categories including TWS Earbuds, Power Banks, Smartwatches, Fast Chargers, and Laptop Accessories in India.',
  openGraph: {
    title: 'Product Categories | BudgetTechIndia',
    description: 'Find top-rated budget gadgets sorted by category in India.',
    url: 'https://budget-tech-india.vercel.app/categories',
  },
};

export default function CategoriesPage() {
  return (
    <div className="py-12">
      <JsonLd
        type="breadcrumbs"
        data={{
          items: [
            { name: 'Home', url: '/' },
            { name: 'Categories', url: '/categories' },
          ],
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
            All Tech <span className="gold-gradient-text">Categories</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Select a category below to explore our rigorously tested and curated recommendations with real-time deal pricing on Amazon India.
          </p>
        </div>

        <CategoryGrid />
      </div>
    </div>
  );
}
