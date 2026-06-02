import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Copy, Check } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const QRCodeModal = ({
  isOpen,
  onClose,
  profileUrl,
  profileName,
  logoUrl,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && profileUrl) {
      // Generate QR code using a QR code API
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(profileUrl)}&bgcolor=ffffff&color=000000&margin=1`;
      setQrCodeUrl(qrApiUrl);
    }
  }, [isOpen, profileUrl]);

  const handleDownload = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${profileName || 'profile'}-qrcode.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download QR code:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileName}'s Profile`,
          text: `Check out ${profileName}'s profile on OneLink`,
          url: profileUrl,
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="QR Code"
      description="Scan to view profile"
      size="sm"
      className="text-center"
    >
      <div className="space-y-6">
        {/* QR Code */}
        <div className="flex justify-center">
          <motion.div
            className="p-4 bg-white rounded-2xl shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-48 h-48"
              />
            ) : (
              <div className="w-48 h-48 bg-gray-100 animate-pulse rounded-lg" />
            )}
          </motion.div>
        </div>

        {/* Profile URL */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {profileUrl}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            onClick={handleDownload}
            icon={<Download className="w-4 h-4" />}
            fullWidth
          >
            Download QR Code
          </Button>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCopyLink}
              icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              fullWidth
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleShare}
              icon={<Share2 className="w-4 h-4" />}
              fullWidth
            >
              Share
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// QR Code Display Component (for embedding)
export const QRCodeDisplay = ({
  url,
  size = 150,
  className = '',
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    if (url) {
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=000000&margin=1`;
      setQrCodeUrl(qrApiUrl);
    }
  }, [url, size]);

  if (!qrCodeUrl) return null;

  return (
    <motion.div
      className={`inline-block p-3 bg-white rounded-xl shadow-md ${className}`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <img
        src={qrCodeUrl}
        alt="QR Code"
        className="block"
        style={{ width: size, height: size }}
      />
    </motion.div>
  );
};

// QR Code with Logo
export const QRCodeWithLogo = ({
  url,
  logoUrl,
  size = 200,
  className = '',
}) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <QRCodeDisplay url={url} size={size} />
      {logoUrl && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-lg shadow-md flex items-center justify-center overflow-hidden"
        >
          <img
            src={logoUrl}
            alt="Logo"
            className="w-8 h-8 object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default QRCodeModal;