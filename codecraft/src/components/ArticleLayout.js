// src/components/ArticleLayout.js
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import readingTime from 'reading-time';
import ShareBar from './ShareBar';
import AudioReader from './AudioReader';
import Link from 'next/link';

export default function ArticleLayout({ post, children }) {
  const stats = readingTime(post.content);
  const url = `/${post.type}/${post.slug}`;
  const fullUrl = `https://codecraft.vercel.app${url}`;

  return (
    <article className="max-w-4xl mx-auto px-4 py-12 md:py-20 relative">
      <header className="mb-16 pb-10 border-b border-craft-border text-center md:text-left">
        <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
          {(post.frontmatter.tags || []).map(tag => (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className="bg-craft-surface text-craft-mint border border-craft-border px-4 py-1.5 rounded-xl text-xs font-bold tracking-wide hover:border-craft-mint transition-all duration-200 shadow-sm"
            >
              #{tag}
            </Link>
          ))}
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-craft-text tracking-tight leading-[1.15] mb-6">
          {post.frontmatter.title}
        </h1>

        <p className="text-craft-muted text-lg sm:text-xl max-w-2xl leading-relaxed font-light mb-8 mx-auto md:mx-0">
          {post.frontmatter.description}
        </p>

        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 py-4 px-6 bg-craft-surface border border-craft-border rounded-2xl text-sm text-craft-muted shadow-sm font-mono">
          <span className="flex items-center gap-2 font-medium">
            <FaCalendarAlt className="text-craft-primary" /> 
            {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </span>
          <span className="flex items-center gap-2 font-medium">
            <FaClock className="text-craft-mint" /> 
            {stats.text}
          </span>
          <div className="h-4 w-[1px] bg-craft-border hidden sm:block" />
          <AudioReader text={post.content} />
        </div>
      </header>

      {/* MDX content */}
      <div className="prose prose-invert max-w-none">
        {children}
      </div>

      <footer className="mt-20 pt-10 border-t border-craft-border flex flex-col sm:flex-row items-center justify-between gap-6 bg-craft-surface border border-craft-border p-8 rounded-3xl shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-craft-text mb-1">Loved this article?</h3>
          <p className="text-sm text-craft-muted font-light">Share this knowledge with your fellow developers.</p>
        </div>
        <ShareBar title={post.frontmatter.title} url={fullUrl} />
      </footer>
    </article>
  );
}
