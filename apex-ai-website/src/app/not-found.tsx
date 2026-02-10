import React from 'react';
import { ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/5 border border-white/10">
          <Search className="w-10 h-10 text-white/40" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Node Not Found</h1>
        <p className="text-muted-foreground mb-12 leading-relaxed">
          The requested path does not exist in our current knowledge graph.
        </p>
        <a
          href="/"
          className="w-full py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/90 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Hub
        </a>
      </div>
    </div>
  );
}
