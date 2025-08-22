'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, Flame, Bell } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      setSubscribed(true);
    }
  };

  return (
    <section className="py-16 bg-[#07090E]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-surface p-8 sm:p-12 text-center relative overflow-hidden border border-[#F59E0B]/30 shadow-2xl">
          
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold">
              <Bell className="w-3.5 h-3.5" /> Deal Drop Alerts
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Never Miss a Tech Price Drop Under ₹2,000
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Get notified the moment flagship earbuds, power banks, or smartwatches hit their lowest recorded price on Amazon India.
            </p>

            {subscribed ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>You are subscribed! We will notify you when deals drop.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md mx-auto">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#07090E] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#F59E0B] transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary py-3.5 px-6 rounded-xl text-xs"
                >
                  <Flame className="w-3.5 h-3.5 fill-black" /> Get Alerts
                </button>
              </form>
            )}

            <div className="text-[11px] text-slate-500 pt-1">
              🔒 No spam. Only handpicked verified Amazon deals. Unsubscribe anytime.
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
