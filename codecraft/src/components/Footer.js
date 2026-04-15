// src/components/Footer.js
import NewsletterForm from './NewsletterForm';
import Link from 'next/link';
import { FaHeart } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-craft-border bg-craft-deep relative overflow-hidden pt-16 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Newsletter Callout Card */}
        <div className="glass-panel rounded-3xl p-8 sm:p-12 mb-16 max-w-3xl mx-auto text-center relative overflow-hidden group border-craft-border shadow-sm">
          <h3 className="text-3xl font-extrabold text-craft-text mb-3 tracking-tight">Stay in the Loop</h3>
          <p className="text-craft-muted text-base max-w-lg mx-auto mb-8 font-light leading-relaxed">
            Get early access to our latest developer stories, deep architectural dives, and open-source discoveries.
          </p>
          <NewsletterForm />
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-craft-border pt-8 text-sm text-craft-muted font-medium">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold text-craft-text hover:text-craft-primary transition-colors flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-craft-primary animate-pulse" />
              <span>Code Craft</span>
            </Link>
            <Link href="/blog" className="hover:text-craft-text transition-colors">Blog</Link>
            <Link href="/projects" className="hover:text-craft-text transition-colors">Projects</Link>
            <Link href="/roadmap" className="hover:text-craft-text transition-colors">Roadmap</Link>
          </div>
          <p className="flex items-center gap-1.5 font-light">
            © {new Date().getFullYear()} Code Craft. Built with <FaHeart className="text-red-500 animate-pulse text-xs" /> for open‑source.
          </p>
        </div>
      </div>
    </footer>
  );
}
