import React from 'react';
import type { Metadata } from 'next';
import { Mail, MessageSquare, MapPin, Send } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Contact Us - BudgetTechIndia',
  description: 'Get in touch with the BudgetTechIndia team for reviews, partnerships, or product inquiries.',
};

export default function ContactPage() {
  return (
    <div className="py-16">
      <JsonLd
        type="breadcrumbs"
        data={{
          items: [
            { name: 'Home', url: '/' },
            { name: 'Contact', url: '/contact' },
          ],
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">
            Get in <span className="gold-gradient-text">Touch</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Have a product you&apos;d like us to review, a business inquiry, or feedback? Send us a message below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          <div className="p-6 rounded-2xl bg-[#0B0F19] border border-white/5 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#FFB800]/10 text-[#FFB800] flex items-center justify-center mx-auto mb-4">
              <Mail className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-white mb-1">Email Support</div>
            <a href="mailto:contact@budgettechindia.com" className="text-xs text-[#FFB800] hover:underline">
              contact@budgettechindia.com
            </a>
          </div>

          <div className="p-6 rounded-2xl bg-[#0B0F19] border border-white/5 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#00F5A0]/10 text-[#00F5A0] flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-white mb-1">Social Media</div>
            <a href="https://x.com/saff9" target="_blank" rel="noopener noreferrer" className="text-xs text-[#00F5A0] hover:underline">
              @saff9
            </a>
          </div>

          <div className="p-6 rounded-2xl bg-[#0B0F19] border border-white/5 text-center">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-white mb-1">Location</div>
            <span className="text-xs text-slate-400">
              India
            </span>
          </div>

        </div>

        {/* Contact Form */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0B0F19] border border-white/5 shadow-2xl">
          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB800] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB800] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Subject
              </label>
              <input
                type="text"
                required
                placeholder="Product review recommendation"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB800] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Message
              </label>
              <textarea
                rows={5}
                required
                placeholder="Write your message here..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#FFB800] text-sm"
              />
            </div>

            <button
              type="submit"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#FFB800] to-[#FF7A00] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-transform"
            >
              <Send className="w-4 h-4" /> Send Message
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
