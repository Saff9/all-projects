import { motion } from 'framer-motion';
import { Link, ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const TopLinks = ({
  links = [],
  maxItems = 5,
  showChange = true,
  className = '',
}) => {
  const sortedLinks = [...links].sort((a, b) => b.clicks - a.clicks).slice(0, maxItems);
  const maxClicks = sortedLinks[0]?.clicks || 1;

  return (
    <motion.div
      className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Top Performing Links
        </h3>
        <Link className="w-5 h-5 text-gray-400" />
      </div>

      {sortedLinks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No link data available
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedLinks.map((link, index) => {
            const percentage = Math.round((link.clicks / maxClicks) * 100);
            const ChangeIcon = link.change > 0 ? TrendingUp : link.change < 0 ? TrendingDown : Minus;
            
            return (
              <motion.div
                key={link.id || index}
                className="group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  {/* Rank */}
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${index === 0 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                    ${index === 1 ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' : ''}
                    ${index === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                    ${index > 2 ? 'bg-gray-50 text-gray-500 dark:bg-gray-800/50 dark:text-gray-500' : ''}
                  `}>
                    {index + 1}
                  </div>

                  {/* Link Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {link.title}
                      </p>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 hover:text-primary-500" />
                      </a>
                    </div>
                  </div>

                  {/* Clicks */}
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {link.clicks.toLocaleString()}
                    </p>
                    {showChange && link.change !== undefined && (
                      <div className={`flex items-center gap-0.5 text-xs ${
                        link.change > 0 ? 'text-success-500' : 
                        link.change < 0 ? 'text-error-500' : 
                        'text-gray-400'
                      }`}>
                        <ChangeIcon className="w-3 h-3" />
                        <span>{Math.abs(link.change)}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden ml-9">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

// Top Links Compact Version
export const TopLinksCompact = ({
  links = [],
  maxItems = 3,
  className = '',
}) => {
  const sortedLinks = [...links].sort((a, b) => b.clicks - a.clicks).slice(0, maxItems);

  return (
    <div className={`space-y-2 ${className}`}>
      {sortedLinks.map((link, index) => (
        <motion.div
          key={link.id || index}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <span className="w-5 text-xs text-gray-400 font-medium">
            #{index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 dark:text-white truncate">
              {link.title}
            </p>
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {link.clicks}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

// Top Links Grid
export const TopLinksGrid = ({
  links = [],
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-2 gap-4 ${className}`}>
      {links.slice(0, 4).map((link, index) => (
        <motion.div
          key={link.id || index}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-400">
                {link.title?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {link.title}
              </p>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {link.clicks}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                clicks
              </p>
            </div>
            {link.change !== undefined && (
              <div className={`flex items-center gap-1 text-sm ${
                link.change >= 0 ? 'text-success-500' : 'text-error-500'
              }`}>
                {link.change >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{Math.abs(link.change)}%</span>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Link Performance Card
export const LinkPerformanceCard = ({
  link,
  rank,
  className = '',
}) => {
  return (
    <motion.div
      className={`bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start gap-3">
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
          ${rank === 1 ? 'bg-yellow-100 text-yellow-600' : ''}
          ${rank === 2 ? 'bg-gray-100 text-gray-600' : ''}
          ${rank === 3 ? 'bg-orange-100 text-orange-600' : ''}
          ${rank > 3 ? 'bg-gray-50 text-gray-500' : ''}
        `}>
          {rank}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-white truncate">
            {link.title}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {link.url}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {link.clicks}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Clicks</p>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {link.views || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Views</p>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {link.ctr || 0}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">CTR</p>
        </div>
      </div>
    </motion.div>
  );
};

export default TopLinks;