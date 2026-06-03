import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Globe, 
  Shield,
  Save,
  Loader2,
  AlertCircle,
  Sparkles,
  Link as LinkIcon,
  QrCode,
  ExternalLink,
  Search
} from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * PrivacySettings Component
 * Manage privacy and visibility settings
 */
const PrivacySettings = ({
  settings = {},
  profile,
  onSave,
  className = ''
}) => {
  const [privacy, setPrivacy] = useState({
    isPublic: settings?.isPublic ?? true,
    allowSearch: settings?.allowSearch ?? true,
    showAnalytics: settings?.showAnalytics ?? false,
    showEmail: settings?.showEmail ?? false,
    showViews: settings?.showViews ?? true,
    allowDownload: settings?.allowDownload ?? false,
    showVerifiedBadge: settings?.showVerifiedBadge ?? false
  })
  const [customDomain, setCustomDomain] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isVerifyingDomain, setIsVerifyingDomain] = useState(false)

  // Toggle privacy setting
  const handleToggle = (key) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Handle save
  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(privacy)
      toast.success('Privacy settings saved')
    } catch (error) {
      console.error('Error saving privacy:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle custom domain setup (placeholder)
  const handleCustomDomain = async () => {
    if (!customDomain) {
      toast.error('Please enter a domain')
      return
    }

    setIsVerifyingDomain(true)
    try {
      // Simulate domain verification
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Domain verification initiated. Check your DNS settings.')
    } catch (error) {
      toast.error('Failed to verify domain')
    } finally {
      setIsVerifyingDomain(false)
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-success-100 dark:bg-success-900/30 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-success-600 dark:text-success-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Privacy Settings
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Control who can see your profile and content
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Visibility */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                {privacy.isPublic ? (
                  <Globe className="w-5 h-5 text-green-500" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Public Profile</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {privacy.isPublic 
                    ? 'Anyone can view your profile' 
                    : 'Only you can view your profile'}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('isPublic')}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                privacy.isPublic
                  ? 'bg-primary-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  privacy.isPublic ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          {!privacy.isPublic && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Your profile will be private. You can still share it with specific people using a direct link.
              </p>
            </div>
          )}
        </div>

        {/* Search Engine Indexing */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Search Engine Indexing</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Allow search engines to index your profile
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('allowSearch')}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                privacy.allowSearch
                  ? 'bg-primary-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  privacy.allowSearch ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Profile Options */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Profile Options
          </h4>
          
          {[
            {
              key: 'showViews',
              label: 'Show View Count',
              description: 'Display total views on your profile',
              icon: Eye
            },
            {
              key: 'showEmail',
              label: 'Show Email',
              description: 'Display your email on your profile',
              icon: EyeOff
            },
            {
              key: 'allowDownload',
              label: 'Allow QR Code Download',
              description: 'Allow visitors to download your QR code',
              icon: QrCode
            }
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {item.label}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle(item.key)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  privacy[item.key]
                    ? 'bg-primary-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    privacy[item.key] ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Custom Domain (Pro Feature) */}
        <div className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl border border-primary-200 dark:border-primary-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                Custom Domain
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Use your own domain name for your OneLink profile
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="yourdomain.com"
                  className="input-field flex-1"
                />
                <button
                  onClick={handleCustomDomain}
                  disabled={isVerifyingDomain}
                  className="btn-primary flex items-center gap-2"
                >
                  {isVerifyingDomain ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4" />
                  )}
                  Connect
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Pro feature - Upgrade to use custom domains
              </p>
            </div>
          </div>
        </div>

        {/* Profile Link */}
        {profile?.username && (
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Your Profile Link
                  </p>
                  <p className="text-sm text-primary-500">
                    onelink.app/{profile.username}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://onelink.app/${profile.username}`)
                  toast.success('Link copied to clipboard')
                }}
                className="px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}

export default PrivacySettings
