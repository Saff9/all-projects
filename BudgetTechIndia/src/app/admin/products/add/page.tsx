'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { scrapeAmazonProduct } from '@/utils/amazonScraper';
import { convertToAffiliateUrl } from '@/utils/amazonAutoAffiliate';

export default function AdminAddProductPage() {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('bluetooth-earbuds');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [brand, setBrand] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [expiryDays, setExpiryDays] = useState(7);
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [status, setStatus] = useState<{ success?: boolean; message?: string }>({});
  const router = useRouter();

  const handleAutoScrape = async () => {
    if (!url.trim()) return;
    setScraping(true);
    setStatus({});

    try {
      const scraped = await scrapeAmazonProduct(url);
      if (scraped) {
        setName(scraped.name || '');
        setBrand(scraped.brand || '');
        setCategory(scraped.category || 'bluetooth-earbuds');
        setPrice(scraped.price ? String(scraped.price) : '');
        setMrp(scraped.mrp ? String(scraped.mrp) : '');
        setImageUrl(scraped.imageUrl || '');
        setDescription(scraped.description || '');
        setStatus({ success: true, message: 'Amazon metadata auto-scraped successfully!' });
      }
    } catch (err: any) {
      setStatus({ success: false, message: 'Could not auto-scrape. Please enter details manually.' });
    } finally {
      setScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({});

    try {
      const affiliateRes = convertToAffiliateUrl(url, 'budgettechpro-21');
      const affiliateUrl = affiliateRes.success && affiliateRes.affiliateUrl ? affiliateRes.affiliateUrl : url;

      const res = await fetch('/api/webhook/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: password || 'budgettech_bot_secret_2026',
          name,
          category,
          price: Number(price),
          mrp: Number(mrp),
          brand,
          imageUrl,
          affiliateUrl,
          description,
          expiryDays: Number(expiryDays),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus({ success: true, message: 'Product deal published to Neon DB successfully!' });
        setTimeout(() => router.push('/admin'), 1500);
      } else {
        setStatus({ success: false, message: data.error || 'Failed to publish deal' });
      }
    } catch (err: any) {
      setStatus({ success: false, message: err.message || 'Error publishing deal' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#FFB800] mb-8 font-semibold transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>

      <div className="p-8 sm:p-10 rounded-3xl bg-[#0B0F19] border border-white/10 shadow-2xl">
        <h1 className="text-2xl font-black text-white mb-2">Publish New Tech Deal</h1>
        <p className="text-xs text-slate-400 mb-8">
          Paste any Amazon URL or short link (`link.amazon/...`, `amzn.to/...`) for instant auto-scraping.
        </p>

        {status.message && (
          <div className={`mb-6 p-4 rounded-xl text-xs flex items-center gap-2 border ${
            status.success 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            {status.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{status.message}</span>
          </div>
        )}

        {/* Auto Scraper Link Input */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 mb-8 space-y-3">
          <label className="block text-xs font-bold text-[#FFB800] uppercase tracking-wider">
            Amazon Product Link / Short URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://link.amazon/B0eDWoblr or https://www.amazon.in/dp/..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB800] text-sm"
            />
            <button
              type="button"
              onClick={handleAutoScrape}
              disabled={scraping || !url}
              className="px-5 py-3 rounded-xl bg-[#FFB800] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {scraping ? 'Scraping...' : 'Auto Fetch'}
            </button>
          </div>
        </div>

        {/* Full Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Product Title
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="boAt Airdopes 141 TWS Earbuds"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB800] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#06080F] border border-white/10 text-white focus:outline-none focus:border-[#FFB800] text-sm"
              >
                <option value="bluetooth-earbuds">Bluetooth Earbuds</option>
                <option value="power-banks">Power Banks</option>
                <option value="smartwatches">Smartwatches</option>
                <option value="fast-chargers-cables">Fast Chargers & Cables</option>
                <option value="accessories">Laptop Accessories</option>
                <option value="books">Books & Self-Mastery</option>
                <option value="budget-gadgets-under-999">Gadgets Under ₹999</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Deal Price (₹)
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="999"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB800] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                MRP (₹)
              </label>
              <input
                type="number"
                required
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                placeholder="2990"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB800] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Brand
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="boAt"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB800] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://m.media-amazon.com/images/..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB800] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Short Description / Key Features
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="42 hours total playtime, ENx noise cancellation, 8mm dynamic drivers..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB800] text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Auto-Purge Expiration (Days)
              </label>
              <input
                type="number"
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number(e.target.value))}
                min={1}
                max={30}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#FFB800] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Webhook Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Optional (defaults to env)"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB800] text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FFB800] via-[#FF9E00] to-[#FF7A00] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Saving Deal to Neon DB...' : 'Publish Deal to Site'}
          </button>
        </form>

      </div>
    </div>
  );
}
