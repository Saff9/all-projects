import React from 'react';
import { Globe, Loader2 } from 'lucide-react';

export interface SearchIndicatorProps {
  isSearching: boolean;
  query?: string;
  resultsCount?: number;
}

export const SearchIndicator: React.FC<SearchIndicatorProps> = ({
  isSearching,
  query,
  resultsCount
}) => {
  if (!isSearching && !resultsCount) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-400">
      {isSearching ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Searching{query ? ` "${query}"` : ''}...</span>
        </>
      ) : (
        <>
          <Globe className="w-3 h-3" />
          <span>Web search • {resultsCount} results</span>
        </>
      )}
    </div>
  );
};

export default SearchIndicator;
