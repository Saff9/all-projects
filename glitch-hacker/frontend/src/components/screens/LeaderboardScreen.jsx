import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Trophy, RefreshCw, Loader2 } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useUserStore } from '../stores/userStore';
import { useAuthStore } from '../stores/authStore';
import GlitchText from '../ui/GlitchText';
import Button from '../ui/Button';

const LeaderboardScreen = observer(() => {
  const userStore = useUserStore();
  const authStore = useAuthStore();
  const { leaderboard, leaderboardLoading, fetchLeaderboard } = userStore;
  const currentUser = authStore.user;

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleRefresh = () => {
    fetchLeaderboard();
  };

  const handleRetry = () => {
    fetchLeaderboard();
  };

  // Get medal for top 3
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <span className="text-2xl">🥇</span>;
      case 2:
        return <span className="text-2xl">🥈</span>;
      case 3:
        return <span className="text-2xl">🥉</span>;
      default:
        return <span className="text-cyan-400 font-mono text-lg">#{rank}</span>;
    }
  };

  // Get rank color
  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500/20 to-yellow-900/10 border-yellow-500/50';
      case 2:
        return 'from-gray-300/20 to-gray-600/10 border-gray-400/50';
      case 3:
        return 'from-orange-600/20 to-orange-900/10 border-orange-500/50';
      default:
        return 'from-cyan-900/20 to-transparent border-cyan-500/30';
    }
  };

  // Format number with commas
  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Find current user's rank
  const currentUserRank = leaderboard?.find(
    (entry) => entry.telegramId === currentUser?.telegram_id
  )?.rank || '???';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-fuchsia-900/30 to-black px-4 pt-16 pb-6">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-2"
          >
            <Trophy className="w-8 h-8 text-yellow-400" />
            <GlitchText
              text="TOP HACKERS"
              className="text-3xl font-bold text-white"
              variant="purple"
            />
            <Trophy className="w-8 h-8 text-yellow-400" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-cyan-400/80 text-sm font-mono"
          >
            Ranked by Total $BITZ Hacked
          </motion.p>
        </div>

        {/* Current User Stats */}
        {currentUser && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 bg-gradient-to-r from-fuchsia-900/30 to-cyan-900/30 rounded-lg border border-cyan-500/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-fuchsia-500 to-cyan-500 flex items-center justify-center text-2xl">
                  {currentUser.photo_url ? (
                    <img
                      src={currentUser.photo_url}
                      alt="avatar"
                      className="w-full h-full rounded-lg object-cover"
                    />
                  ) : (
                    <span className="text-white">🎭</span>
                  )}
                </div>
                <div>
                  <p className="text-white font-bold">{currentUser.username || 'Anonymous'}</p>
                  <p className="text-cyan-400 text-xs font-mono">Your Rank: #{currentUserRank}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-fuchsia-400 font-mono text-sm">
                  ${formatNumber(currentUser.total_hacked || 0)}
                </p>
                <p className="text-cyan-400/60 text-xs">Total Hacked</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="px-4 py-4 flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={leaderboardLoading}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-900/30 hover:bg-cyan-800/40 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${leaderboardLoading ? 'animate-spin' : ''}`} />
          {leaderboardLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Leaderboard List */}
      <div className="px-4 pb-6">
        {leaderboardLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
            <p className="text-cyan-400/60 font-mono">Loading leaderboard...</p>
          </div>
        ) : leaderboard && leaderboard.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 text-cyan-500/60 text-xs font-mono uppercase">
              <div className="col-span-2 text-center">Rank</div>
              <div className="col-span-5">Username</div>
              <div className="col-span-3 text-right">Hacked</div>
              <div className="col-span-2 text-right">Wins</div>
            </div>

            {/* Leaderboard Entries */}
            {leaderboard.map((entry) => {
              const isCurrentUser = entry.telegramId === currentUser?.telegram_id;

              return (
                <motion.div
                  key={entry.telegramId}
                  variants={itemVariants}
                  className={`grid grid-cols-12 gap-2 p-3 rounded-lg border bg-gradient-to-r ${getRankColor(entry.rank)} ${
                    isCurrentUser
                      ? 'border-fuchsia-500 shadow-lg shadow-fuchsia-500/20'
                      : ''
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-2 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Username */}
                  <div className="col-span-5 flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-600 to-fuchsia-600 flex items-center justify-center text-xs flex-shrink-0">
                      {entry.photoUrl ? (
                        <img
                          src={entry.photoUrl}
                          alt=""
                          className="w-full h-full rounded object-cover"
                        />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm truncate">
                        {isCurrentUser ? '⭐ You' : (entry.username || 'Anonymous')}
                      </p>
                      <p className="text-cyan-400/50 text-xs">
                        Lvl {entry.level || 1}
                      </p>
                    </div>
                  </div>

                  {/* Total Hacked */}
                  <div className="col-span-3 flex flex-col items-end justify-center">
                    <p className="text-fuchsia-400 font-mono text-sm">
                      ${formatNumber(entry.totalHacked || 0)}
                    </p>
                    <p className="text-cyan-400/50 text-xs">BITZ</p>
                  </div>

                  {/* Wins */}
                  <div className="col-span-2 flex flex-col items-end justify-center">
                    <p className="text-green-400 font-mono text-sm">
                      {entry.successfulHacks || 0}
                    </p>
                    <p className="text-cyan-400/50 text-xs">wins</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Terminal className="w-16 h-16 text-cyan-600/50 mb-4" />
            <p className="text-white font-bold mb-2">No Data Available</p>
            <p className="text-cyan-400/60 text-sm font-mono mb-6">
              No hackers have made their mark yet.<br />
              Be the first to hack!
            </p>
            <Button onClick={handleRetry} variant="primary">
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});

export default LeaderboardScreen;
