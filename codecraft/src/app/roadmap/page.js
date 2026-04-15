// src/app/roadmap/page.js
import { FaCheckCircle, FaTools, FaMapSigns } from 'react-icons/fa';

export default function RoadmapPage() {
  const completed = [
    'Custom colour palette & dark mode',
    'MDX blog + project pages',
    'Newsletter with MX validation',
    'AI‑ready SEO (sitemap, JSON‑LD, llms.txt)',
    'Terminal easter egg',
  ];

  const upcoming = [
    'More recommendation signals (inspired by X algorithm)',
    'Webmentions',
    'Article series / collections',
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-craft-deep">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-craft-mint/10 via-craft-primary/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <header className="mb-16 text-center border-b border-craft-border pb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-craft-surface border border-craft-border shadow-sm mb-6">
            <FaMapSigns className="text-craft-mint" />
            <span className="text-xs font-bold uppercase tracking-wider text-craft-mint">Platform Evolution</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-craft-text">
            Engineering <span className="bg-gradient-to-r from-craft-mint via-craft-glow to-craft-primary bg-clip-text text-transparent">Roadmap</span>
          </h1>
          <p className="text-craft-muted text-lg sm:text-xl max-w-2xl font-light leading-relaxed mx-auto">
            A transparent overview of our completed milestones and upcoming architectural enhancements.
          </p>
        </header>

        <div className="space-y-12 max-w-2xl mx-auto">
          {/* Completed Milestones */}
          <div>
            <h2 className="text-xl font-bold text-craft-mint mb-6 flex items-center gap-2.5 font-mono">
              <FaCheckCircle /> Completed Milestones
            </h2>
            <div className="space-y-4">
              {completed.map((item, index) => (
                <div 
                  key={index}
                  className="glass-panel rounded-2xl p-6 flex items-center gap-4 border-l-4 border-l-craft-mint bg-craft-surface hover:bg-craft-surface/80 transition-colors shadow-sm"
                >
                  <FaCheckCircle className="text-craft-mint shrink-0 text-lg" />
                  <span className="text-craft-text font-medium text-base">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Features */}
          <div>
            <h2 className="text-xl font-bold text-craft-glow mb-6 flex items-center gap-2.5 font-mono">
              <FaTools /> In Active Development
            </h2>
            <div className="space-y-4">
              {upcoming.map((item, index) => (
                <div 
                  key={index}
                  className="glass-panel rounded-2xl p-6 flex items-center gap-4 border-l-4 border-l-craft-glow bg-craft-surface hover:bg-craft-surface/80 transition-colors shadow-sm"
                >
                  <FaTools className="text-craft-glow shrink-0 text-lg animate-pulse" />
                  <span className="text-craft-text font-medium text-base">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
