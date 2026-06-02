import { motion } from 'framer-motion';
import { MapPin, Calendar, Award } from 'lucide-react';
import { Avatar, Badge } from '../ui';

const ProfileHeader = ({
  profile,
  showStats = true,
  showVerified = true,
  layout = 'center',
  className = '',
}) => {
  const {
    displayName,
    username,
    bio,
    avatarURL,
    location,
    joinedDate,
    isVerified,
    stats = {},
  } = profile || {};

  const layouts = {
    center: 'text-center items-center',
    left: 'text-left items-start',
  };

  return (
    <motion.div
      className={`flex flex-col ${layouts[layout]} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Avatar */}
      <div className="relative mb-4">
        <Avatar
          src={avatarURL}
          name={displayName}
          size="2xl"
          className="ring-4 ring-white dark:ring-gray-800 shadow-xl"
        />
        
        {/* Verified Badge */}
        {showVerified && isVerified && (
          <motion.div
            className="absolute -bottom-1 -right-1 p-1.5 bg-primary-500 rounded-full ring-4 ring-white dark:ring-gray-900"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            <Award className="w-4 h-4 text-white" />
          </motion.div>
        )}
      </div>

      {/* Name & Username */}
      <div className="flex flex-col items-center gap-1 mb-3">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {displayName || 'Anonymous'}
          </h1>
          {showVerified && isVerified && (
            <Badge variant="primary" size="xs">
              Verified
            </Badge>
          )}
        </div>
        
        {username && (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            @{username}
          </p>
        )}
      </div>

      {/* Bio */}
      {bio && (
        <p className="text-gray-600 dark:text-gray-300 text-center max-w-xs mb-4 leading-relaxed">
          {bio}
        </p>
      )}

      {/* Meta Info */}
      {(location || joinedDate) && (
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {location}
            </span>
          )}
          {joinedDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Joined {new Date(joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          )}
        </div>
      )}

      {/* Stats */}
      {showStats && (stats.totalViews || stats.totalClicks || stats.linkCount) && (
        <div className="flex items-center gap-6">
          {stats.totalViews !== undefined && (
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stats.totalViews)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Views</p>
            </div>
          )}
          {stats.totalClicks !== undefined && (
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatNumber(stats.totalClicks)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Clicks</p>
            </div>
          )}
          {stats.linkCount !== undefined && (
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.linkCount}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Links</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

// Helper function to format numbers
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Compact Profile Header Variant
export const CompactProfileHeader = ({
  profile,
  className = '',
}) => {
  const { displayName, username, bio, avatarURL, isVerified } = profile || {};

  return (
    <motion.div
      className={`flex items-center gap-3 ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Avatar
        src={avatarURL}
        name={displayName}
        size="lg"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-900 dark:text-white truncate">
            {displayName || 'Anonymous'}
          </h2>
          {isVerified && (
            <Award className="w-4 h-4 text-primary-500 flex-shrink-0" />
          )}
        </div>
        {username && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            @{username}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// Large Profile Header (for profile pages)
export const LargeProfileHeader = ({
  profile,
  coverImage,
  className = '',
}) => {
  const {
    displayName,
    username,
    bio,
    avatarURL,
    location,
    isVerified,
    stats = {},
  } = profile || {};

  return (
    <div className={className}>
      {/* Cover Image */}
      {coverImage && (
        <div className="h-32 sm:h-48 rounded-2xl overflow-hidden mb-4">
          <img
            src={coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Profile Info */}
      <div className="relative">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
          {/* Avatar */}
          <div className="relative -mt-16 sm:-mt-12">
            <Avatar
              src={avatarURL}
              name={displayName}
              size="2xl"
              className="ring-4 ring-white dark:ring-gray-900 shadow-xl"
            />
            {isVerified && (
              <motion.div
                className="absolute -bottom-1 -right-1 p-1.5 bg-primary-500 rounded-full ring-4 ring-white dark:ring-gray-900"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                <Award className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left pb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
              {displayName || 'Anonymous'}
              {isVerified && (
                <Badge variant="primary" size="xs">Verified</Badge>
              )}
            </h1>
            {username && (
              <p className="text-gray-500 dark:text-gray-400">
                @{username}
              </p>
            )}
          </div>
        </div>

        {/* Bio & Stats */}
        <div className="mt-4">
          {bio && (
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {bio}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {location}
              </span>
            )}
            <div className="flex items-center gap-4">
              <span><strong className="text-gray-900 dark:text-white">{stats.totalViews || 0}</strong> views</span>
              <span><strong className="text-gray-900 dark:text-white">{stats.totalClicks || 0}</strong> clicks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;