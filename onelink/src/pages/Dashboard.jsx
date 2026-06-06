import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Eye, 
  MousePointer, 
  TrendingUp,
  ExternalLink,
  Settings,
  LogOut
} from 'lucide-react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useProfile } from '../hooks/useProfile';
import { useLinks } from '../hooks/useLinks';
import { formatCompactNumber } from '../utils/helpers';
import toast from 'react-hot-toast';

// Dashboard Components
import { 
  StatsCard, 
  StatsCardGrid,
  QuickActions,
  WelcomeBanner,
  ProfileCompletion,
  QuickTips,
  RecentLinks
} from '../components/dashboard'

// UI Components
import { 
  Card, 
  Loading 
} from '../components/ui'

function Dashboard() {
  const { user, signOut } = useUser();
  const { isSignedIn } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: links = [], isLoading: linksLoading } = useLinks(profile?.id);
  const loading = profileLoading || linksLoading;

  const stats = {
    views: { 
      current: profile?.stats?.totalViews || 0, 
      previous: Math.max(0, (profile?.stats?.totalViews || 0) - 50) 
    },
    clicks: { 
      current: profile?.stats?.totalClicks || 0, 
      previous: Math.max(0, (profile?.stats?.totalClicks || 0) - 20) 
    },
    links: links.length
  };

  const handleLogout = () => {
    signOut();
    toast.success('Logged out successfully');
  };

  const handleEditLink = (link) => {
    window.location.href = `/editor?link=${link.id}`;
  };

  const handleDeleteLink = (linkId) => {
    if (window.confirm('Delete this link?')) {
      toast.success('Link deleted');
    }
  };

  const handleToggleLink = (link) => {
    toast.success(link.isActive ? 'Deactivated' : 'Activated');
  };

  // Calculate profile completion
  const getProfileCompletion = () => {
    if (!profile) return 0;
    
    let completed = 0;
    const total = 5;
    
    if (profile.displayName) completed++;
    if (profile.bio) completed++;
    if (profile.avatarURL) completed++;
    if (links.length > 0) completed++;
    if (profile.isPublished) completed++;
    
    return Math.round((completed / total) * 100);
  };

  // Get completion tasks
  const getCompletionTasks = () => {
    return [
      { id: 'profile', label: 'Add profile photo', completed: !!profile?.avatarURL, href: '/editor#profile' },
      { id: 'bio', label: 'Write a bio', completed: !!profile?.bio, href: '/editor#bio' },
      { id: 'links', label: 'Add your first link', completed: links.length > 0, href: '/editor#links' },
      { id: 'theme', label: 'Customize your theme', completed: !!profile?.themeSettings?.primaryColor, href: '/editor#theme' },
      { id: 'publish', label: 'Publish your profile', completed: !!profile?.isPublished, href: '/editor#publish' },
    ];
  };

  if (loading) {
    return <Loading fullScreen text="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg" />
                <span className="text-xl font-bold text-white">OneLink</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/settings"
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <Link to="/settings" className="flex items-center space-x-2">
                <img
                  src={user?.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Welcome Banner */}
          <WelcomeBanner
            displayName={profile?.displayName || user?.fullName}
            username={profile?.username}
            isNewUser={!profile}
            profileExists={!!profile}
          />

          {/* Stats Grid */}
          <StatsCardGrid>
            <StatsCard
              title="Total Views"
              value={formatCompactNumber(stats.views.current)}
              change={`${stats.views.current > stats.views.previous ? '+' : ''}${stats.views.current - stats.views.previous}`}
              changeType={stats.views.current > stats.views.previous ? 'increase' : 'neutral'}
              subtitle="vs last week"
              icon={<Eye className="w-6 h-6" />}
              iconColor="primary"
            />
            <StatsCard
              title="Total Clicks"
              value={formatCompactNumber(stats.clicks.current)}
              change={`${stats.clicks.current > stats.clicks.previous ? '+' : ''}${stats.clicks.current - stats.clicks.previous}`}
              changeType={stats.clicks.current > stats.clicks.previous ? 'increase' : 'neutral'}
              subtitle="vs last week"
              icon={<MousePointer className="w-6 h-6" />}
              iconColor="secondary"
            />
            <StatsCard
              title="Active Links"
              value={links.filter(l => l.isActive).length}
              icon={<TrendingUp className="w-6 h-6" />}
              iconColor="accent"
              onClick={() => window.location.href = '/editor#links'}
            />
            <StatsCard
              title="Click Rate"
              value={stats.views.current > 0 
                ? `${((stats.clicks.current / stats.views.current) * 100).toFixed(1)}%` 
                : '0%'
              }
              icon={<TrendingUp className="w-6 h-6" />}
              iconColor="success"
            />
          </StatsCardGrid>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Quick Actions
                </h2>
                <QuickActions />
              </Card>

              {/* Recent Links */}
              <RecentLinks
                links={links}
                onEdit={handleEditLink}
                onDelete={handleDeleteLink}
                onToggle={handleToggleLink}
                showAddButton
                maxItems={5}
              />
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Profile Completion */}
              <ProfileCompletion
                completionPercentage={getProfileCompletion()}
                tasks={getCompletionTasks()}
              />

              {/* Quick Tips */}
              <QuickTips />

              {/* Profile Preview Card */}
              {profile && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Your Profile
                  </h3>
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={profile.avatarURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                      alt="Profile"
                      className="w-16 h-16 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">
                        {profile.displayName || 'No name set'}
                      </p>
                      <p className="text-sm text-slate-400 truncate">
                        onelink.app/{profile.username}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to="/editor"
                      className="flex-1 btn-outline text-center"
                    >
                      Edit
                    </Link>
                    <a
                      href={`/${profile.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 btn-primary text-center flex items-center justify-center gap-2"
                    >
                      View
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default Dashboard;

