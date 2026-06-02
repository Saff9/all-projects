import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Check, QrCode, Twitter, Facebook, Linkedin } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

const ShareButton = ({
  url,
  title = 'Check out my profile',
  text = 'Check out my OneLink profile',
  showQR = true,
  variant = 'default',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareOptions = [
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-gray-900 hover:bg-gray-800',
      onClick: () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
      },
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
      },
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      onClick: () => {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(linkedinUrl, '_blank', 'width=600,height=400');
      },
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          setIsOpen(true);
        }
      }
    } else {
      setIsOpen(true);
    }
  };

  const variants = {
    default: 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
    primary: 'bg-primary-500 hover:bg-primary-600 text-white',
    outline: 'border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300',
    ghost: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
  };

  return (
    <>
      <motion.button
        onClick={handleNativeShare}
        className={`
          inline-flex items-center gap-2 px-4 py-2
          rounded-full font-medium
          transition-all duration-200
          ${variants[variant]}
          ${className}
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label="Share profile"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </motion.button>

      {/* Share Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Share Profile"
        size="sm"
      >
        <div className="space-y-6">
          {/* Social Share Buttons */}
          <div className="flex justify-center gap-3">
            {shareOptions.map((option) => {
              const Icon = option.icon;
              return (
                <motion.button
                  key={option.name}
                  onClick={option.onClick}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors ${option.color}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Share on ${option.name}`}
                >
                  <Icon className="w-5 h-5" />
                </motion.button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">or</span>
            </div>
          </div>

          {/* Copy Link */}
          <div className="flex gap-2">
            <div className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400 truncate">
              {url}
            </div>
            <Button
              variant={copied ? 'success' : 'outline'}
              onClick={handleCopyLink}
              icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>

          {/* QR Code Option */}
          {showQR && (
            <Button
              variant="ghost"
              onClick={() => {
                setIsOpen(false);
                // Open QR modal - this would be handled by parent component
              }}
              icon={<QrCode className="w-4 h-4" />}
              fullWidth
            >
              Show QR Code
            </Button>
          )}
        </div>
      </Modal>
    </>
  );
};

// Floating Share Button
export const FloatingShareButton = ({
  url,
  title,
  text,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (error) {
        if (error.name !== 'AbortError') {
          setIsOpen(true);
        }
      }
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      <motion.button
        onClick={handleShare}
        className={`
          fixed bottom-6 right-6 z-40
          w-14 h-14 rounded-full
          bg-primary-500 hover:bg-primary-600
          text-white shadow-lg shadow-primary-500/30
          flex items-center justify-center
          transition-colors
          ${className}
        `}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
        aria-label="Share profile"
      >
        <Share2 className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center p-6 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                Share Profile
              </h3>
              
              <div className="flex justify-center gap-4 mb-4">
                {[
                  { name: 'Twitter', icon: Twitter, color: 'bg-gray-900' },
                  { name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
                  { name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700' },
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.name}
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${option.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>

              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(url);
                  setIsOpen(false);
                }}
                className="w-full py-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Copy Link
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Icon Only Share Button
export const IconShareButton = ({
  url,
  title,
  text,
  className = '',
}) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <motion.button
      onClick={handleShare}
      className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Share"
    >
      <Share2 className="w-5 h-5" />
    </motion.button>
  );
};

export default ShareButton;