import { motion } from 'framer-motion';
import { Link as LinkIcon, Heart, ExternalLink } from 'lucide-react';

/**
 * ProfileFooter Component
 * "Powered by OneLink" footer for public profile pages
 * 
 * @param {string} variant - Footer variant: 'default', 'minimal', 'branded'
 * @param {boolean} showHeart - Show heart animation
 * @param {string} className - Additional CSS classes
 */
const ProfileFooter = ({
  variant = 'default',
  showHeart = false,
  className = '',
}) => {
  const currentYear = new Date().getFullYear();

  // Minimal variant - just text
  if (variant === 'minimal') {
    return (
      <motion.div
        className={`text-center py-6 ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <a
          href="https://onelink.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <LinkIcon className="w-3 h-3" />
          <span>OneLink</span>
        </a>
      </motion.div>
    );
  }

  // Branded variant - with logo and tagline
  if (variant === 'branded') {
    return (
      <motion.div
        className={`mt-12 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-full">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <LinkIcon className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Powered by OneLink
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            Create your own link-in-bio page for free
          </p>
        </div>
      </motion.div>
    );
  }

  // Default variant - standard footer
  return (
    <motion.footer
      className={`mt-12 py-6 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="text-center">
        {/* Main Link */}
        <a
          href="https://onelink.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors group"
        >
          <LinkIcon className="w-4 h-4 group-hover:rotate-45 transition-transform" />
          <span>Powered by OneLink</span>
          {showHeart && (
            <motion.span
              className="inline-flex items-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Heart className="w-3 h-3 text-red-400 fill-red-400" />
            </motion.span>
          )}
        </a>

        {/* Subtext */}
        <p className="mt-1 text-xs text-gray-300 dark:text-gray-600">
          Create your free link-in-bio
        </p>
      </div>
    </motion.footer>
  );
};

/**
 * ProfileFooterWithLinks Component
 * Footer with additional navigation links
 */
export const ProfileFooterWithLinks = ({
  links = [],
  className = '',
}) => {
  const defaultLinks = [
    { label: 'Create Your Page', href: 'https://onelink.app' },
    { label: 'Features', href: 'https://onelink.app/features' },
    { label: 'Pricing', href: 'https://onelink.app/pricing' },
  ];

  const footerLinks = links.length > 0 ? links : defaultLinks;

  return (
    <motion.footer
      className={`mt-12 py-6 border-t border-gray-100 dark:border-gray-800 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="max-w-md mx-auto px-4">
        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors flex items-center gap-1"
            >
              {link.label}
              <ExternalLink className="w-3 h-3" />
            </a>
          ))}
        </div>

        {/* Branding */}
        <div className="text-center">
          <a
            href="https://onelink.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary-500 transition-colors"
          >
            <LinkIcon className="w-4 h-4" />
            <span>Powered by OneLink</span>
          </a>
        </div>
      </div>
    </motion.footer>
  );
};

/**
 * ProfileFooterCompact Component
 * Compact footer for minimal designs
 */
export const ProfileFooterCompact = ({
  className = '',
}) => {
  return (
    <motion.div
      className={`py-4 text-center ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <a
        href="https://onelink.app"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[10px] text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
      >
        Made with OneLink
      </a>
    </motion.div>
  );
};

/**
 * ProfileFooterDark Component
 * Dark themed footer for dark templates
 */
export const ProfileFooterDark = ({
  className = '',
}) => {
  return (
    <motion.footer
      className={`mt-12 py-6 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="text-center">
        <a
          href="https://onelink.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
        >
          <div className="w-5 h-5 rounded bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
            <LinkIcon className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
            Get your free OneLink
          </span>
        </a>
      </div>
    </motion.footer>
  );
};

/**
 * ProfileFooterGradient Component
 * Gradient themed footer for gradient templates
 */
export const ProfileFooterGradient = ({
  className = '',
}) => {
  return (
    <motion.footer
      className={`mt-10 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="text-center">
        <a
          href="https://onelink.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white/80 transition-colors"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Powered by OneLink</span>
        </a>
      </div>
    </motion.footer>
  );
};

export default ProfileFooter;