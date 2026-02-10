import React from 'react';
import { Mail, Github, Twitter, MessageSquare, Cpu, Globe, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-black border-t border-white/5 pt-24 pb-12">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tighter text-white">Apex AI</span>
            </a>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Building the foundations of logical intelligence. Designed for the builders of the next era.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" aria-label="GitHub" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Discord" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Capabilities</h4>
            <ul className="space-y-4">
              {['Logic-V3', 'Reasoning Engine', 'Multi-modal', 'Code Generation', 'Agentic Workflows'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-muted-foreground text-sm hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Resources</h4>
            <ul className="space-y-4">
              {['Documentation', 'API Reference', 'Status', 'Pricing', 'Research Papers'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-muted-foreground text-sm hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Company</h4>
            <ul className="space-y-4">
              {['About', 'Careers', 'Privacy Policy', 'Terms of Service', 'Security'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-muted-foreground text-sm hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-xs">
            © {currentYear} Apex AI Research Lab. Built with logic.
          </p>
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors">
              <Globe className="w-3 h-3" />
              English (US)
            </button>
            <a href="#top" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors">
              Back to top
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
