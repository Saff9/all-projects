// src/components/Navbar.js
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useReadingStreak } from '@/lib/useReadingStreak';
import { FaSearch, FaFire } from 'react-icons/fa';

export default function Navbar() {
  const streak = useReadingStreak();
  const pathname = usePathname();

  const navLinks = [
    { href: '/blog', label: 'Blog' },
    { href: '/projects', label: 'Projects' },
    { href: '/roadmap', label: 'Roadmap' },
    { href: '/for-you', label: 'For You' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-craft-deep/80 backdrop-blur-xl border-b border-craft-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link 
            href="/" 
            className="font-extrabold text-2xl tracking-tight text-craft-text hover:opacity-90 transition-opacity flex items-center gap-2.5"
          >
            <span className="w-3.5 h-3.5 rounded-full bg-craft-primary animate-pulse" />
            <span>Code Craft</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
              return (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    active ? 'text-craft-primary bg-craft-surface border border-craft-border' : 'text-craft-muted hover:text-craft-text hover:bg-craft-surface/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/search" 
            className="p-2.5 rounded-xl bg-craft-surface hover:bg-craft-border border border-craft-border text-craft-muted hover:text-craft-text transition-all duration-200 shadow-sm group"
            title="Search"
          >
            <FaSearch className="text-sm group-hover:scale-110 transition-transform" />
          </Link>
          {streak > 0 && (
            <div 
              className="flex items-center gap-2 px-3.5 py-1.5 bg-craft-surface border border-orange-500/30 rounded-xl text-orange-400 text-sm font-bold shadow-sm animate-pulse-glow"
              title="Reading streak"
            >
              <FaFire className="text-orange-500 animate-bounce text-sm shrink-0" />
              <span>{streak}d</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
