'use client';

import Link from 'next/link';
import { memo, useState, useCallback, useMemo } from 'react';
import { Tool, categories } from '@/utils/tools';
import {
  ArrowRight,
  Flame,
  Braces,
  Key,
  Code,
  Link as LinkIcon,
  Terminal,
  Clock,
  Search,
  GitCompare,
  Hash,
  Fingerprint,
  Lock,
  Palette,
  Layers,
  FileText,
  Type,
  List,
  Binary,
  Globe,
  Shield,
  Calendar,
  Database,
  FileCode,
  FileDigit,
  QrCode,
  Zap,
  Star,
  ExternalLink,
  Copy,
  Check,
  TrendingUp,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';

interface ToolCardProps {
  tool: Tool;
  index?: number;
  showQuickActions?: boolean;
  showStats?: boolean;
  onFavoriteToggle?: (toolId: string) => void;
}

const iconMap: Record<string, LucideIcon> = {
  Braces,
  Key,
  Code,
  Link: LinkIcon,
  Terminal,
  Clock,
  Search,
  GitCompare,
  Hash,
  Fingerprint,
  Lock,
  Palette,
  Layers,
  FileText,
  Type,
  List,
  Binary,
  Globe,
  Shield,
  Calendar,
  Database,
  FileCode,
  FileDigit,
  QrCode,
  Zap,
};

// Category colors for badges
const categoryColors: Record<string, { bg: string; text: string }> = {
  json: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  web: { bg: 'bg-green-500/20', text: 'text-green-400' },
  dev: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  frontend: { bg: 'bg-pink-500/20', text: 'text-pink-400' },
  productivity: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  security: { bg: 'bg-red-500/20', text: 'text-red-400' },
  converter: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
};

// Simple deterministic hash function for popularity
function getDeterministicHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % 50 + 20;
}

// Usage stats simulation
const usageStats: Record<string, number> = {
  'json-formatter': 95,
  'jwt-decoder': 89,
  'base64': 85,
  'url-encoder': 82,
  'password-generator': 78,
  'regex-tester': 75,
  'hash-generator': 72,
  'sql-formatter': 68,
  'cron-parser': 65,
  'yaml-converter': 62,
  'csv-json': 58,
  'timestamp': 55,
  'uuid-generator': 52,
  'color-picker': 48,
  'case-converter': 45,
};

function ToolCardComponent({
  tool,
  index = 0,
  showQuickActions = true,
  showStats = true,
  onFavoriteToggle,
}: ToolCardProps) {
  const { favorites, toggleFavorite: contextToggleFavorite } = useFavorites();
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const isFav = useMemo(() => favorites.includes(tool.id), [favorites, tool.id]);
  const category = useMemo(() => categories.find((c) => c.id === tool.category), [tool.category]);
  const IconComponent = useMemo(() => iconMap[tool.icon] || Braces, [tool.icon]);
  const usageScore = useMemo(() => usageStats[tool.id] ?? getDeterministicHash(tool.id), [tool.id]);

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      contextToggleFavorite(tool.id);
      onFavoriteToggle?.(tool.id);
    },
    [tool.id, contextToggleFavorite, onFavoriteToggle]
  );

  const handleQuickCopy = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(window.location.origin + tool.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [tool.path]);

  return (
    <Link
      href={tool.path}
      className="group relative block animate-fade-in tilt-card"
      style={{ animationDelay: `${index * 0.05}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative p-6 rounded-2xl glass card-3d overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all duration-500">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-cyan-500/10 transition-all duration-500" />
        <div
          className={`absolute -inset-1 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${
            category?.gradient || ''
          }`}
        />

        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 z-10 p-2 rounded-lg transition-all ${
            isFav
              ? 'bg-yellow-500/20 text-yellow-400 opacity-100'
              : 'bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-yellow-400 opacity-0 group-hover:opacity-100'
          }`}
          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {showQuickActions && isHovered && (
          <div className="absolute top-3 left-3 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleQuickCopy}
              className="p-2 rounded-lg bg-white/10 text-zinc-400 hover:text-white hover:bg-white/20 transition-all"
              aria-label="Copy link"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(tool.path, '_blank');
              }}
              className="p-2 rounded-lg bg-white/10 text-zinc-400 hover:text-white hover:bg-white/20 transition-all"
              aria-label="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="relative flex items-start gap-4">
          <div
            className={`relative flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${category?.bgColor || 'bg-zinc-800'} shadow-lg hover-3d`}
          >
            <div className={`absolute inset-0 rounded-xl ${category?.gradient || ''} opacity-30`} />
            <IconComponent className="w-7 h-7 text-white relative z-10 drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300" />
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors text-lg">
              {tool.name}
            </h3>
            <p className="mt-1.5 text-sm text-zinc-400 line-clamp-2 leading-relaxed">
              {tool.description}
            </p>

            <div className="mt-4 flex items-center gap-2.5 flex-wrap">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium badge ${
                  categoryColors[tool.category]
                    ? `${categoryColors[tool.category].bg} ${categoryColors[tool.category].text}`
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {category?.name}
              </span>

              {tool.new && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                  NEW
                </span>
              )}

              {showStats && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800/60 text-zinc-500 border border-zinc-700/50">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {usageScore}%
                </span>
              )}

              <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-blue-400 group-hover:translate-x-1 group-hover:scale-110 transition-all ml-auto opacity-0 group-hover:opacity-100" />
            </div>
          </div>
        </div>

        {tool.popular && (
          <div className="absolute top-3 right-14">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shadow-lg">
              <Flame className="w-3.5 h-3.5" />
              Popular
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default memo(ToolCardComponent);
