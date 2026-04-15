// src/app/page.js
import { getAllPosts } from '@/lib/posts';
import ArticleCard from '@/components/ArticleCard';
import RandomButton from '@/components/RandomButton';
import HeroGraphic from '@/components/HeroGraphic';
import Link from 'next/link';
import { FaArrowRight, FaCode, FaRobot, FaRocket } from 'react-icons/fa';

export default function HomePage() {
  const recentBlog = getAllPosts('blog').slice(0, 4);
  const recentProjects = getAllPosts('projects').slice(0, 4);

  const allSlugs = [
    ...getAllPosts('blog').map(p => `/blog/${p.slug}`),
    ...getAllPosts('projects').map(p => `/projects/${p.slug}`),
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-craft-deep">
      {/* Subtle top mesh glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-tr from-craft-primary/10 via-craft-glow/10 to-craft-mint/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <header className="grid md:grid-cols-12 gap-12 items-center mb-24">
          <div className="md:col-span-7 space-y-8 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-craft-surface border border-craft-border shadow-sm animate-float">
              <span className="w-2 h-2 rounded-full bg-craft-primary animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-craft-text">Next-Gen Technical Architecture</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-craft-text">
              Crafting the <br />
              <span className="bg-gradient-to-r from-craft-primary via-craft-glow to-craft-mint bg-clip-text text-transparent">
                Future of Code
              </span>
            </h1>

            <p className="text-craft-muted text-lg sm:text-xl max-w-xl mx-auto md:mx-0 leading-relaxed font-light">
              Open‑source discoveries &amp; pristine developer stories. Every article is engineered for maximum SEO ranking and AI citation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-5 pt-4">
              <RandomButton slugs={allSlugs} />
              <Link 
                href="/projects" 
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-craft-surface hover:bg-craft-border border border-craft-border text-craft-text font-bold text-base transition-all duration-200 shadow-sm group"
              >
                <span>Explore Projects</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform text-craft-primary" />
              </Link>
            </div>
          </div>

          {/* Right side: Modern Abstract Lobe SVG Graphic */}
          <div className="md:col-span-5 relative flex justify-center items-center">
            <HeroGraphic />
          </div>
        </header>

        {/* Latest Blog Posts Section */}
        <section className="mb-24 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4 border-b border-craft-border pb-6">
            <div>
              <div className="flex items-center gap-2 text-craft-primary font-bold text-sm mb-2 uppercase tracking-wider font-mono">
                <FaRocket /> Fresh Perspectives
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-craft-text tracking-tight">Latest Blog Posts</h2>
            </div>
            <Link 
              href="/blog" 
              className="inline-flex items-center gap-2 text-craft-primary hover:text-craft-primary/80 font-bold text-base transition-colors group"
            >
              <span>View all articles</span>
              <FaArrowRight className="group-hover:translate-x-1 transition-transform text-sm" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {recentBlog.map(post => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        </section>

        {/* Featured Projects Section */}
        <section className="mb-12 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4 border-b border-craft-border pb-6">
            <div>
              <div className="flex items-center gap-2 text-craft-mint font-bold text-sm mb-2 uppercase tracking-wider font-mono">
                <FaCode /> Open Source Showcase
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-craft-text tracking-tight">Featured Projects</h2>
            </div>
            <Link 
              href="/projects" 
              className="inline-flex items-center gap-2 text-craft-primary hover:text-craft-primary/80 font-bold text-base transition-colors group"
            >
              <span>Explore all projects</span>
              <FaArrowRight className="group-hover:translate-x-1 transition-transform text-sm" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {recentProjects.map(proj => (
              <ArticleCard key={proj.slug} post={proj} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
