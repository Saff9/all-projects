// src/app/admin/page.js
import { kv } from '@vercel/kv';
import { FaUserShield, FaUsers, FaExclamationTriangle } from 'react-icons/fa';

export const runtime = 'nodejs';

export default async function AdminPage({ searchParams }) {
  if (searchParams.key !== process.env.ADMIN_SECRET) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-craft-deep">
        <div className="glass-panel rounded-3xl p-12 text-center max-w-md w-full border-red-500/20 shadow-sm border-craft-border">
          <FaUserShield className="text-5xl text-red-400 mx-auto mb-6 animate-pulse" />
          <h1 className="text-2xl font-bold text-craft-text mb-3">Access Denied</h1>
          <p className="text-craft-muted text-sm font-light leading-relaxed mb-6">
            You need valid admin credentials to access this dashboard.
          </p>
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-xs font-mono break-all">
            Add ?key=YOUR_SECRET to the URL
          </div>
        </div>
      </div>
    );
  }

  let subscribers = [];
  try {
    const keys = await kv.keys('sub:*');
    const values = await Promise.all(keys.map(k => kv.get(k)));
    subscribers = values.map(v => v.email).filter(Boolean);
  } catch (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-craft-deep">
        <div className="glass-panel rounded-3xl p-12 text-center max-w-md w-full border-yellow-500/20 shadow-sm border-craft-border">
          <FaExclamationTriangle className="text-5xl text-yellow-400 mx-auto mb-6 animate-pulse" />
          <h1 className="text-2xl font-bold text-craft-text mb-3">KV Store Error</h1>
          <p className="text-craft-muted text-sm font-light leading-relaxed">
            Failed to fetch subscribers. Please ensure Vercel KV is correctly configured in your environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-craft-deep">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-craft-mint/10 via-craft-primary/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <header className="mb-16 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-craft-border pb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-craft-surface border border-craft-border shadow-sm mb-4">
              <FaUsers className="text-craft-mint" />
              <span className="text-xs font-bold uppercase tracking-wider text-craft-mint">Admin Dashboard</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-craft-text tracking-tight">
              Subscribers ({subscribers.length})
            </h1>
          </div>
        </header>

        {subscribers.length === 0 ? (
          <div className="glass-panel rounded-3xl p-16 text-center max-w-lg mx-auto shadow-sm border-craft-border">
            <p className="text-craft-muted text-lg font-light">No subscribers yet.</p>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-8 border-craft-border shadow-sm max-w-2xl mx-auto">
            <ul className="divide-y divide-craft-border">
              {subscribers.map((email, i) => (
                <li key={i} className="py-4 px-6 hover:bg-craft-surface/50 transition-colors rounded-xl flex items-center justify-between font-medium text-craft-text">
                  <span>{email}</span>
                  <span className="text-xs font-mono text-craft-muted bg-craft-deep px-3 py-1 rounded-lg border border-craft-border">Active</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
