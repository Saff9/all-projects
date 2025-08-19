'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  PlusCircle, 
  Settings, 
  Database, 
  Zap, 
  ShieldCheck, 
  Flame, 
  RefreshCw,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { getAllNeonProducts, purgeExpiredProducts } from '@/utils/neondb';
import productsData from '@/data/products.json';

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purging, setPurging] = useState(false);
  const [purgeMsg, setPurgeMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    const isLogged = sessionStorage.getItem('bti_admin_logged_in');
    if (!isLogged) {
      router.push('/admin/login');
      return;
    }

    async function loadData() {
      try {
        const prods = await getAllNeonProducts();
        if (prods && prods.length > 0) {
          setProducts(prods);
        } else {
          setProducts((productsData as any).products || []);
        }
      } catch (e) {
        setProducts((productsData as any).products || []);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handlePurge = async () => {
    setPurging(true);
    setPurgeMsg('');
    try {
      const count = await purgeExpiredProducts();
      setPurgeMsg(`Successfully purged ${count} expired product(s) older than 7 days.`);
      const prods = await getAllNeonProducts();
      setProducts(prods);
    } catch (e: any) {
      setPurgeMsg('Purge completed.');
    } finally {
      setPurging(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('bti_admin_logged_in');
    router.push('/admin/login');
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#FFB800] block mb-1">
            Admin Suite
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Dashboard Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/add"
            className="px-4 py-2.5 rounded-xl bg-[#FFB800] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:scale-105 transition-transform"
          >
            <PlusCircle className="w-4 h-4" /> Add New Deal
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-rose-400 font-bold text-xs flex items-center gap-2 border border-white/10"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="p-6 rounded-2xl bg-[#0B0F19] border border-white/5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Active Products</span>
            <Package className="w-4 h-4 text-[#FFB800]" />
          </div>
          <div className="text-3xl font-black text-white">{products.length}</div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0B0F19] border border-white/5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Database Engine</span>
            <Database className="w-4 h-4 text-[#00F5A0]" />
          </div>
          <div className="text-sm font-black text-[#00F5A0] mt-2">Neon PostgreSQL</div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0B0F19] border border-white/5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Auto-Purge Retention</span>
            <RefreshCw className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white">7 Days</div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0B0F19] border border-white/5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Amazon Affiliate Tag</span>
            <Zap className="w-4 h-4 text-[#FFB800]" />
          </div>
          <div className="text-sm font-black text-white mt-2">budgettechpro-21</div>
        </div>
      </div>

      {/* Quick Database Actions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0B0F19] border border-white/5 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white mb-1">7-Day Automatic Database Maintenance</h3>
            <p className="text-xs text-slate-400">Purge deals and links older than 7 days from Neon DB.</p>
          </div>
          <button
            onClick={handlePurge}
            disabled={purging}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${purging ? 'animate-spin' : ''}`} />
            {purging ? 'Purging...' : 'Run Auto-Purge Now'}
          </button>
        </div>
        {purgeMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            {purgeMsg}
          </div>
        )}
      </div>

      {/* Recent Products Table */}
      <div className="rounded-3xl bg-[#0B0F19] border border-white/5 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Active Product Deals</h3>
          <span className="text-xs text-slate-400">{products.length} Total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] text-slate-400 font-bold uppercase tracking-wider border-b border-white/5">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Deal Price</th>
                <th className="p-4">MRP</th>
                <th className="p-4">Affiliate Tag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <td className="p-4 font-bold text-white max-w-xs truncate">{p.name}</td>
                  <td className="p-4 text-[#00F5A0]">{p.category}</td>
                  <td className="p-4 font-bold text-white">₹{p.price}</td>
                  <td className="p-4 text-slate-500">₹{p.mrp}</td>
                  <td className="p-4">
                    <a
                      href={p.affiliateUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#FFB800] hover:underline flex items-center gap-1"
                    >
                      Amazon Link <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
