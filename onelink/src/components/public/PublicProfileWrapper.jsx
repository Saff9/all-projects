import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  Loader2, 
  Share2, 
  QrCode, 
  Mail,
  MoreHorizontal 
} from 'lucide-react';

import { getVisitorData, getProfileUrl } from '../../utils/helpers';
import { updateMetaTags, generateProfileSEO, injectStructuredData, resetMetaTags } from '../../utils/seo';
import TemplateRenderer, { getTemplateDefaultSettings } from '../templates/TemplateRenderer';
import AnimatedBackground, { backgroundPresets } from './AnimatedBackground';
import ProfileStats from './ProfileStats';
import ContactForm, { ContactFormButton } from './ContactForm';
import ProfileFooter from './ProfileFooter';
import QRCodeModal from './QRCodeModal';
import ShareButton from './ShareButton';
import toast from 'react-hot-toast';

const PublicProfileWrapper = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  
  // State
  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Frontend API call to backend (Clerk protected or public)
      const response = await fetch(`/api/profiles/username/${username}`);
      const profileData = await response.json();
      
      if (!profileData || response.status !== 200) {
        setError('Profile not found');
        setLoading(false);
        return;
      }

      if (!profileData.isPublished) {
        setError('This profile is not publicly available');
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Get links
      const linksResponse = await fetch(`/api/links/${profileData.id}`);
      const profileLinks = await linksResponse.json();
      setLinks(profileLinks.filter(link => link.isActive));

    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Track profile view
  const trackProfileView = async (profileId) => {
    try {
      const visitorData = getVisitorData();
      await fetch(`/api/analytics/${profileId}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'view',
          visitorData,
          date: new Date().toISOString().split('T')[0],
          hour: new Date().getHours(),
        }),
      });
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  };

  // Handle link click
  const handleLinkClick = useCallback(async (link) => {
    if (!profile) return;

    try {
      const visitorData = getVisitorData();
      await fetch(`/api/analytics/${profile.id}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'click',
          linkId: link.id,
          linkTitle: link.title,
          visitorData,
          date: new Date().toISOString().split('T')[0],
          hour: new Date().getHours(),
        }),
      });
    } catch (err) {
      console.error('Error tracking click:', err);
    }
    
    // Open link
    window.open(link.url, '_blank');
  }, [profile]);

  // Handle contact form submission
  const handleContactSubmit = async (formData) => {
    console.log('Contact form submitted:', formData);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading profile...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {error === 'Profile not found' ? 'Profile Not Found' : 'Unable to Load Profile'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {error === 'Profile not found' 
              ? `The profile "@${username}" doesn't exist or has been removed.`
              : error || 'Something went wrong while loading this profile.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
            >
              Go Home
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              Create Your Own
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const templateId = profile.templateId || 'minimal';
  const themeSettings = profile.themeSettings || getTemplateDefaultSettings(templateId);
  const profileUrl = getProfileUrl(username);

  const getAnimationType = () => {
    const animationMap = {
      particles: 'particles',
      gradient: 'gradient',
      waves: 'waves',
      stars: 'stars',
      mesh: 'mesh',
      none: 'none',
    };
    return animationMap[themeSettings.animationType] || 'none';
  };

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground
        type={getAnimationType()}
        colors={{
          primary: themeSettings.primaryColor,
          secondary: themeSettings.secondaryColor,
          background: themeSettings.backgroundColor,
        }}
      />

      <div className="relative z-10">
        <div className="fixed top-4 right-4 z-20 flex items-center gap-2">
          <ShareButton
            url={profileUrl}
            title={`${profile.displayName} - OneLink`}
            description={profile.bio}
            variant="icon"
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg"
          />

          <motion.button
            onClick={() => setShowQRModal(true)}
            className="p-2.5 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <QrCode className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </motion.button>

          {profile.socialLinks?.email && (
            <ContactFormButton
              onClick={() => setShowContactForm(true)}
              variant="icon"
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg"
            />
          )}
        </div>

        <TemplateRenderer
          templateId={templateId}
          profile={{
            ...profile,
            username,
          }}
          links={links}
          onLinkClick={handleLinkClick}
          themeSettings={themeSettings}
        />

        {profile.stats && (
          <div className="max-w-md mx-auto px-4 pb-4">
            <ProfileStats
              stats={profile.stats}
              variant="compact"
              className="justify-center opacity-60"
            />
          </div>
        )}

        <ProfileFooter variant="minimal" className="pb-8" />
      </div>

      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        url={profileUrl}
        profileName={profile.displayName}
      />

      <ContactForm
        isOpen={showContactForm}
        onClose={() => setShowContactForm(false)}
        onSubmit={handleContactSubmit}
        toEmail={profile.socialLinks?.email}
        profile={profile}
      />
    </div>
  );
};

export const PublicProfileWrapperWithSEO = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadProfileForSEO = async () => {
      try {
        const response = await fetch(`/api/profiles/username/${username}`);
        const profileData = await response.json();
        setProfile(profileData);
      } catch (err) {
        console.error('Error loading profile for SEO:', err);
      }
    };
    loadProfileForSEO();
  }, [username]);

  useEffect(() => {
    if (profile) {
      const seoOptions = generateProfileSEO(profile, username);
      updateMetaTags(seoOptions);
      const structuredData = generateProfileStructuredData(profile, username);
      injectStructuredData(structuredData);
    }

    return () => {
      resetMetaTags();
    };
  }, [profile, username]);

  return <PublicProfileWrapper />;
};

export default PublicProfileWrapper;

