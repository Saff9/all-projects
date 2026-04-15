// src/components/ArticleCard.js
import Link from 'next/link';
import readingTime from 'reading-time';
import { FaStar, FaCalendarAlt, FaClock, FaArrowRight } from 'react-icons/fa';

export default function ArticleCard({ post }) {
  const stats = readingTime(post.content);
  const isProject = post.type === 'projects';

  return (
    <Link
      href={`/${post.type}/${post.slug}`}
      className="group block glass-panel glass-panel-hover rounded-2xl p-7 flex flex-col justify-between relative overflow-hidden"
    >
      <div>
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-xl sm:text-2xl font-bold text-craft-text group-hover:text-craft-primary transition-colors duration-200 tracking-tight leading-snug">
            {post.frontmatter.title}
          </h3>
          {isProject && post.frontmatter.githubRepo && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-xs font-bold shrink-0 shadow-sm">
              <FaStar className="text-yellow-400 animate-spin-slow" />
              <span>GitHub</span>
            </div>
          )}
        </div>

        <p className="text-craft-muted mt-3 line-clamp-2 text-base leading-relaxed group-hover:text-craft-text/80 transition-colors">
          {post.frontmatter.description}
        </p>

        <div className="flex flex-wrap gap-2 mt-5">
          {(post.frontmatter.tags || []).map(tag => (
            <span 
              key={tag} 
              className="bg-craft-deep text-craft-mint border border-craft-mint/20 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide shadow-sm"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-8 pt-4 border-t border-craft-border text-xs text-craft-muted font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-mono">
            <FaCalendarAlt className="text-craft-primary/70" />
            {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric',
            })}
          </span>
          <span className="flex items-center gap-1.5 font-mono">
            <FaClock className="text-craft-mint/70" />
            {stats.text}
          </span>
        </div>
        <span className="flex items-center gap-1 text-craft-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 font-bold">
          Read <FaArrowRight className="text-xs" />
        </span>
      </div>
    </Link>
  );
}
