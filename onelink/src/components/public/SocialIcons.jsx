import { motion } from 'framer-motion';

const socialConfig = {
  instagram: {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    label: 'Instagram',
    color: 'hover:text-pink-500',
    bgColor: 'hover:bg-pink-50 dark:hover:bg-pink-900/20',
  },
  twitter: {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    label: 'X (Twitter)',
    color: 'hover:text-gray-900 dark:hover:text-white',
    bgColor: 'hover:bg-gray-100 dark:hover:bg-gray-800',
  },
  youtube: {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    label: 'YouTube',
    color: 'hover:text-red-500',
    bgColor: 'hover:bg-red-50 dark:hover:bg-red-900/20',
  },
  tiktok: {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.93.01 5.87-.02 8.79-.05 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.08-5.91 3.24-1.72.16-3.5-.25-4.96-1.22-1.94-1.28-3.24-3.46-3.38-5.78-.02-.53-.03-1.06-.01-1.58.14-2.25 1.29-4.39 3.1-5.7 1.82-1.35 4.24-1.77 6.41-1.15.02 1.49.01 2.98.02 4.47-1.02-.31-2.19-.22-3.04.46-.65.44-1.11 1.12-1.3 1.89-.22.78-.12 1.65.27 2.38.38.68 1.01 1.21 1.75 1.47.91.32 1.96.26 2.81-.2.87-.48 1.51-1.33 1.75-2.27.14-.56.08-1.14.1-1.7.01-4.44 0-8.88.02-13.31z" />
      </svg>
    ),
    label: 'TikTok',
    color: 'hover:text-gray-900 dark:hover:text-white',
    bgColor: 'hover:bg-gray-100 dark:hover:bg-gray-800',
  },
  linkedin: {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    label: 'LinkedIn',
    color: 'hover:text-blue-600',
    bgColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
  },
  github: {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
    label: 'GitHub',
    color: 'hover:text-gray-900 dark:hover:text-white',
    bgColor: 'hover:bg-gray-100 dark:hover:bg-gray-800',
  },
  facebook: {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    label: 'Facebook',
    color: 'hover:text-blue-500',
    bgColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
  },
  email: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Email',
    color: 'hover:text-primary-500',
    bgColor: 'hover:bg-primary-50 dark:hover:bg-primary-900/20',
  },
  website: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    label: 'Website',
    color: 'hover:text-primary-500',
    bgColor: 'hover:bg-primary-50 dark:hover:bg-primary-900/20',
  },
  snapchat: {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.017 0C5.396 0 .017 5.396.017 12.017c0 6.62 5.396 12.017 12 12.017 6.62 0 12.017-5.396 12.017-12.017C24.034 5.396 18.638 0 12.017 0zm6.955 17.596c-.243.59-.86.915-1.68.915-.324 0-.648-.048-.972-.144-.486-.144-.972-.288-1.458-.288-.324 0-.648.048-.972.144-.486.144-.972.288-1.458.288-.324 0-.648-.048-.972-.144-.486-.144-.972-.288-1.458-.288-.324 0-.648.048-.972.144-.486.144-.972.288-1.458.288-.324 0-.648-.048-.972-.144-.486-.144-.972-.288-1.458-.288-.324 0-.648.048-.972.144-.486.144-.972.288-1.458.288-.648 0-1.296-.288-1.68-.915-.384-.623-.384-1.39.048-1.967 1.296-1.727 1.944-3.646 1.944-5.565 0-2.59 1.296-4.845 3.406-5.903.384-.192.768-.384 1.152-.432.048 0 .096-.048.144-.048.048 0 .096 0 .144.048.384.048.768.24 1.152.432 2.11 1.058 3.406 3.313 3.406 5.903 0 1.919.648 3.838 1.944 5.565.432.576.432 1.344.048 1.967z" />
      </svg>
    ),
    label: 'Snapchat',
    color: 'hover:text-yellow-500',
    bgColor: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20',
  },
  discord: {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0698.0698 0 00-.0321.0277C.5334 9.0458-.319 13.5599.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
      </svg>
    ),
    label: 'Discord',
    color: 'hover:text-indigo-500',
    bgColor: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
  },
};

const SocialIcons = ({
  links = {},
  size = 'md',
  variant = 'default',
  className = '',
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const variants = {
    default: 'bg-gray-100 dark:bg-gray-800',
    outline: 'border-2 border-gray-200 dark:border-gray-700',
    ghost: 'bg-transparent',
    filled: 'bg-gray-900 dark:bg-white text-white dark:text-gray-900',
  };

  // Filter out null/undefined links
  const activeLinks = Object.entries(links).filter(([_, url]) => url);

  if (activeLinks.length === 0) return null;

  const getSocialUrl = (platform, value) => {
    if (!value) return '#';
    
    // If it's already a full URL, return as is
    if (value.startsWith('http')) return value;
    
    // Otherwise, construct the URL
    switch (platform) {
      case 'instagram':
        return `https://instagram.com/${value.replace('@', '')}`;
      case 'twitter':
        return `https://twitter.com/${value.replace('@', '')}`;
      case 'youtube':
        return value.includes('channel') || value.includes('c/') 
          ? `https://youtube.com/${value}` 
          : `https://youtube.com/@${value}`;
      case 'tiktok':
        return `https://tiktok.com/@${value.replace('@', '')}`;
      case 'linkedin':
        return value.startsWith('in/') 
          ? `https://linkedin.com/${value}` 
          : `https://linkedin.com/in/${value}`;
      case 'github':
        return `https://github.com/${value}`;
      case 'facebook':
        return `https://facebook.com/${value}`;
      case 'email':
        return `mailto:${value}`;
      case 'discord':
        return `https://discord.gg/${value}`;
      case 'snapchat':
        return `https://snapchat.com/add/${value}`;
      default:
        return value;
    }
  };

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
      {activeLinks.map(([platform, url], index) => {
        const config = socialConfig[platform];
        if (!config) return null;

        return (
          <motion.a
            key={platform}
            href={getSocialUrl(platform, url)}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              ${sizes[size]}
              rounded-full
              flex items-center justify-center
              text-gray-600 dark:text-gray-400
              transition-all duration-200
              ${variants[variant]}
              ${config.color}
              ${variant !== 'filled' ? config.bgColor : ''}
            `}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title={config.label}
            aria-label={config.label}
          >
            {config.icon}
          </motion.a>
        );
      })}
    </div>
  );
};

// Social Icons Row (horizontal layout)
export const SocialIconsRow = ({ links, className = '' }) => {
  return (
    <SocialIcons
      links={links}
      variant="ghost"
      size="md"
      className={className}
    />
  );
};

// Social Icons Grid (grid layout)
export const SocialIconsGrid = ({ links, className = '' }) => {
  return (
    <div className={`grid grid-cols-4 gap-3 ${className}`}>
      {Object.entries(links).filter(([_, url]) => url).map(([platform, url], index) => {
        const config = socialConfig[platform];
        if (!config) return null;

        return (
          <motion.a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <span className={`text-gray-600 dark:text-gray-400 ${config.color}`}>
              {config.icon}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {config.label}
            </span>
          </motion.a>
        );
      })}
    </div>
  );
};

export default SocialIcons;