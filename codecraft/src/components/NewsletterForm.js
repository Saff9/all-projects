// src/components/NewsletterForm.js
'use client';
import { useState } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaPaperPlane } from 'react-icons/fa';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('subscribed');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full bg-craft-deep border border-craft-border rounded-xl px-5 py-3.5 text-craft-text placeholder-craft-muted focus:outline-none focus:border-craft-primary focus:ring-2 focus:ring-craft-primary/20 transition-all shadow-sm font-medium text-base"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex items-center justify-center gap-2 bg-craft-primary hover:bg-craft-primary/90 text-white font-bold px-8 py-3.5 rounded-xl shadow-sm hover:shadow-md disabled:opacity-50 transition-all duration-200 cursor-pointer shrink-0"
        >
          {status === 'loading' ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Joining...</span>
            </>
          ) : (
            <>
              <FaPaperPlane className="text-sm" />
              <span>Subscribe</span>
            </>
          )}
        </button>
      </form>
      
      {status === 'subscribed' && (
        <div className="flex items-center justify-center gap-2 mt-4 text-craft-mint font-semibold text-sm animate-fade-in">
          <FaCheckCircle className="text-base animate-bounce" />
          <span>Awesome! You’ve successfully subscribed.</span>
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center justify-center gap-2 mt-4 text-red-400 font-semibold text-sm animate-fade-in">
          <FaExclamationCircle className="text-base" />
          <span>Unable to subscribe. Please verify your email address.</span>
        </div>
      )}
    </div>
  );
}
