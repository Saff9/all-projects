import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Zap, Trophy, Clock, Activity, Terminal, TrendingUp, Award, Loader2 } from 'lucide-react';
import Card from '../ui/Card';
import StatDisplay from '../ui/StatDisplay';
import GlitchText from '../ui/GlitchText';

// Stores
import useUserStore from '../../stores/userStore';
import usePVPStore from '../../stores/pvpStore';
import useAuthStore from '../../stores/authStore';

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Stores
  const { user: authUser } = useAuthStore();
  const {
    profile,
    balance,
    totalEarned,
    totalSpent,
    botnets,
    firewall,
    pvp,
    passiveIncome,
  } = useUserStore();

  const { hackHistory, fetchHistory } = usePVPStore();

  // Fetch hack history when history tab is active
  useEffect(() => {
    if (activeTab === 'history') {
      setIsLoadingHistory(true);
      fetchHistory().finally(() => setIsLoadingHistory(false));
    }
  }, [activeTab, fetchHistory]);

  const rankColors = {
    'Script Kiddie': 'from-gray-500 to-gray-600',
    'Code Breaker': 'from-blue-500 to-blue-600',
    'Net Runner': 'from-purple-500 to-purple-600',
    'Cyber Punk': 'from-pink-500 to-pink-600',
    'Elite Hacker': 'from-yellow-500 to-yellow-600',
    'Glitch Master': 'from-primary to-primary-dark',
  };

  // Determine rank based on total earned
  const getRank = (earned) => {
    if (earned >= 100000) return 'Glitch Master';
    if (earned >= 50000) return 'Elite Hacker';
    if (earned >= 20000) return 'Cyber Punk';
    if (earned >= 10000) return 'Net Runner';
    if (earned >= 5000) return 'Code Breaker';
    return 'Script Kiddie';
  };

  const rank = getRank(totalEarned);
  const username = profile?.username || authUser?.username || 'Hacker';
  const joinDate = profile?.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString() 
    : new Date().toLocaleDateString();

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'history', label: 'History' },
  ];

  // Calculate total stolen and lost from PVP data
  const totalStolen = pvp?.totalHacked || 0;
  const totalLost = pvp?.totalLost || 0;
  const virusLevel = pvp?.virusLevel || 1;

  return (
    <div className="space-y-4">
      {/* Profile header */}
      <div className="text-center py-4">
        <motion.div
          className="relative w-20 h-20 mx-auto mb-3 rounded-full bg-surface border-4 border-primary/50 flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
        >
          {profile?.photoUrl ? (
            <img 
              src={profile.photoUrl} 
              alt={username}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <User className="w-10 h-10 text-primary" />
          )}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full border-2 border-background flex items-center justify-center">
            <div className="w-2 h-2 bg-background rounded-full" />
          </div>
        </motion.div>
        
        <GlitchText text={`@${username}`} size="xl" color="primary" />
        
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-gradient-to-r ${rankColors[rank] || 'from-gray-500 to-gray-600'} text-white text-xs font-mono font-semibold uppercase`}>
          <Award className="w-3 h-3" />
          {rank}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 p-1 bg-surface rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded font-mono text-xs uppercase tracking-wider transition-colors ${
              activeTab === tab.id 
                ? 'bg-primary text-background font-semibold' 
                : 'text-primary/60 hover:text-primary hover:bg-primary/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Main stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatDisplay
              label="Total Mined"
              value={Math.floor(totalEarned)}
              icon={Zap}
              suffix="$BITZ"
              size="md"
            />
            <StatDisplay
              label="Total Stolen"
              value={Math.floor(totalStolen)}
              icon={Trophy}
              suffix="$BITZ"
              size="md"
            />
          </div>

          {/* Defense stats */}
          <Card title="Defense Stats" icon={Shield}>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-surface-light/50 rounded-lg">
                <p className="text-xs text-primary/50 font-mono uppercase mb-1">Firewall</p>
                <p className="font-mono text-2xl font-bold text-primary">
                  Lv.{firewall?.level || 1}
                </p>
              </div>
              <div className="text-center p-3 bg-surface-light/50 rounded-lg">
                <p className="text-xs text-primary/50 font-mono uppercase mb-1">Virus</p>
                <p className="font-mono text-2xl font-bold text-primary">
                  Lv.{virusLevel}
                </p>
              </div>
            </div>
          </Card>

          {/* Account info */}
          <Card title="Account Info" icon={Terminal}>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-primary/50">Member Since</span>
                <span className="text-primary">{joinDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary/50">Total Lost</span>
                <span className="text-alert">{Math.floor(totalLost)} $BITZ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary/50">Net Profit</span>
                <span className="text-primary">
                  {Math.floor(totalEarned + totalStolen - totalLost).toLocaleString()} $BITZ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-primary/50">Total Spent</span>
                <span className="text-primary/70">
                  {Math.floor(totalSpent).toLocaleString()} $BITZ
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Botnet inventory */}
          <Card title="Botnet Inventory" icon={Activity}>
            {botnets && botnets.length > 0 ? (
              <div className="space-y-3">
                {botnets.map((botnet, index) => (
                  <motion.div
                    key={botnet.id}
                    className="flex items-center justify-between p-3 bg-surface-light/50 rounded-lg border border-primary/10"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-mono text-sm text-primary font-semibold">{botnet.name}</p>
                        <p className="font-mono text-xs text-primary/50">
                          +{botnet.income?.toFixed(1) || 0} $BITZ/sec each
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg font-bold text-primary">x{botnet.owned}</p>
                      <p className="font-mono text-xs text-primary/50">
                        +{((botnet.income || 0) * botnet.owned).toFixed(1)}/sec
                      </p>
                    </div>
                  </motion.div>
                ))}

                {/* Total income */}
                <div className="mt-4 pt-3 border-t border-primary/20">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-sm text-primary/70">Total Passive Income</span>
                    <span className="font-mono text-lg font-bold text-primary">
                      {passiveIncome.toFixed(1)} $BITZ/sec
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-primary/50">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-mono text-sm">No botnets owned</p>
                <p className="font-mono text-xs mt-1">Visit the Black Market to purchase upgrades</p>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card title="Recent Activity" icon={Clock}>
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : hackHistory && hackHistory.length > 0 ? (
              <div className="space-y-2">
                {hackHistory.map((entry, index) => (
                  <motion.div
                    key={entry.id || index}
                    className="flex items-center gap-3 p-2 rounded-lg bg-surface-light/30 border border-primary/5"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {/* Icon based on type */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      entry.type === 'outgoing'
                        ? entry.success ? 'bg-primary/20' : 'bg-alert/20'
                        : entry.type === 'incoming'
                          ? 'bg-alert/20'
                          : 'bg-primary/20'
                    }`}>
                      {entry.type === 'outgoing' ? (
                        entry.success ? (
                          <TrendingUp className="w-4 h-4 text-primary" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-alert" />
                        )
                      ) : entry.type === 'incoming' ? (
                        <Shield className="w-4 h-4 text-alert" />
                      ) : (
                        <Activity className="w-4 h-4 text-primary" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm text-primary truncate">
                        {entry.type === 'outgoing' && (
                          <>
                            {entry.success ? 'Hacked' : 'Failed hack on'} {entry.targetUsername}
                            {entry.success && <span className="text-primary"> +{entry.amountStolen}</span>}
                          </>
                        )}
                        {entry.type === 'incoming' && (
                          <>
                            Hacked by {entry.attackerUsername}
                            <span className="text-alert"> -{entry.amountStolen}</span>
                          </>
                        )}
                      </p>
                      <p className="font-mono text-xs text-primary/40">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-primary/50">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-mono text-sm">No activity yet</p>
                <p className="font-mono text-xs mt-1">Start hacking to see your history</p>
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default ProfileScreen;
