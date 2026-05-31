import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import Button from '../ui/Button';

const WelcomeBanner = ({
  displayName,
  username,
  isNewUser = false,
  profileExists = false,
  className = '',
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative overflow-hidden
        bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500
        rounded-2xl p-6 md:p-8
        text-white
        shadow-lg shadow-primary-500/25
        ${className}
      `}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          {/* Greeting */}
          <p className="text-white/80 text-sm mb-1">
            {getGreeting()} 👋
          </p>
          
          {/* Name */}
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {displayName || 'Welcome to OneLink'}
          </h1>
          
          {/* Message */}
          {isNewUser ? (
            <p className="text-white/90 max-w-lg">
              <Sparkles className="w-4 h-4 inline mr-1" />
              Welcome aboard! Let's set up your profile and create your first link-in-bio page.
            </p>
          ) : profileExists ? (
            <p className="text-white/90 max-w-lg">
              Your profile is live at{' '}
              <a
                href={`/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:no-underline inline-flex items-center gap-1"
              >
                onelink.app/{username}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </p>
          ) : (
            <p className="text-white/90 max-w-lg">
              You haven't created your profile yet. Let's get started!
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          {isNewUser || !profileExists ? (
            <Link to="/editor">
              <Button
                variant="secondary"
                className="bg-white text-primary-600 hover:bg-gray-100"
              >
                Create Profile
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <div className="flex gap-3">
              <Link to="/editor">
                <Button
                  variant="secondary"
                  className="bg-white/20 text-white hover:bg-white/30 border border-white/30"
                >
                  Edit Profile
                </Button>
              </Link>
              <a
                href={`/${username}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="secondary"
                  className="bg-white text-primary-600 hover:bg-gray-100"
                >
                  View Live
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        className="absolute top-4 right-4 w-2 h-2 bg-white/50 rounded-full"
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-8 right-8 w-1.5 h-1.5 bg-white/30 rounded-full"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
      />
    </motion.div>
  );
};

// Compact version for smaller spaces
export const CompactWelcomeBanner = ({
  displayName,
  className = '',
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 ${className}`}
    >
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {getGreeting()}
      </p>
      <p className="text-lg font-semibold text-gray-900 dark:text-white">
        {displayName || 'Welcome'}
      </p>
    </motion.div>
  );
};

export default WelcomeBanner;