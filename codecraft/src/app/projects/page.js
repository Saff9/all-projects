// src/app/projects/page.js
import { getAllPosts } from '@/lib/posts';
import ArticleCard from '@/components/ArticleCard';
import { FaCode } from 'react-icons/fa';

export default function ProjectsListPage() {
  const projects = getAllPosts('projects');

  return (
    <div className="min-h-screen relative overflow-hidden bg-craft-deep">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-craft-mint/10 via-craft-glow/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <header className="mb-16 text-center md:text-left border-b border-craft-border pb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-craft-surface border border-craft-border shadow-sm mb-6">
            <FaCode className="text-craft-mint" />
            <span className="text-xs font-bold uppercase tracking-wider text-craft-mint">Open Source</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-craft-text">
            Featured <span className="bg-gradient-to-r from-craft-mint via-craft-glow to-craft-primary bg-clip-text text-transparent">Projects</span>
          </h1>
          <p className="text-craft-muted text-lg sm:text-xl max-w-2xl font-light leading-relaxed mx-auto md:mx-0">
            Explore cutting-edge open-source tools, modular frameworks, and production-ready libraries built by our community.
          </p>
        </header>

        {projects.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center max-w-lg mx-auto">
            <p className="text-craft-muted text-lg font-light">No project pages yet. Create your first MDX file in <code className="text-craft-mint font-mono bg-craft-deep px-2 py-1 rounded border border-craft-border">content/projects</code>!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {projects.map(proj => (
              <ArticleCard key={proj.slug} post={proj} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
