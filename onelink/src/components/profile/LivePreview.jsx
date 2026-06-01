import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  RefreshCw,
  Maximize2,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react'
import { LinkButton, ProfileHeader, SocialIcons, ProfileFooter } from '../public'
import { TemplateRenderer } from '../templates'

// Device presets
const DEVICES = {
  desktop: {
    name: 'Desktop',
    icon: Monitor,
    width: '100%',
    maxWidth: '1200px',
    height: '600px',
    borderRadius: '12px'
  },
  tablet: {
    name: 'Tablet',
    icon: Tablet,
    width: '768px',
    maxWidth: '768px',
    height: '1024px',
    borderRadius: '24px'
  },
  mobile: {
    name: 'Mobile',
    icon: Smartphone,
    width: '375px',
    maxWidth: '375px',
    height: '812px',
    borderRadius: '40px'
  }
}

/**
 * LivePreview Component
 * Shows a live preview of the profile with device switching
 */
const LivePreview = ({
  profile = {},
  links = [],
  theme = {},
  template = 'minimal',
  className = '',
  showControls = true,
  defaultDevice = 'mobile',
  onDeviceChange,
  onRefresh,
  isRefreshing = false
}) => {
  const [activeDevice, setActiveDevice] = useState(defaultDevice)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  const device = DEVICES[activeDevice]
  const DeviceIcon = device.icon

  // Handle device change
  const handleDeviceChange = (deviceKey) => {
    setActiveDevice(deviceKey)
    onDeviceChange?.(deviceKey)
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  // Preview container styles
  const containerStyles = {
    width: device.width,
    maxWidth: device.maxWidth,
    height: isFullscreen ? '100vh' : device.height,
    borderRadius: device.borderRadius
  }

  // Default profile data
  const previewProfile = {
    displayName: profile?.displayName || 'Your Name',
    username: profile?.username || 'username',
    bio: profile?.bio || 'Your bio goes here. Tell visitors who you are and what you do.',
    avatarURL: profile?.avatarURL || null,
    ...profile
  }

  // Default theme settings
  const previewTheme = {
    primaryColor: theme?.primaryColor || '#3b82f6',
    secondaryColor: theme?.secondaryColor || '#6366f1',
    backgroundColor: theme?.backgroundColor || '#ffffff',
    textColor: theme?.textColor || '#1f2937',
    buttonStyle: theme?.buttonStyle || 'rounded',
    fontFamily: theme?.fontFamily || 'Inter',
    animationType: theme?.animationType || 'none',
    ...theme
  }

  // Filter active links
  const activeLinks = links?.filter(link => link.isActive !== false) || []

  return (
    <div className={`${className}`}>
      {/* Controls */}
      {showControls && (
        <div className="flex items-center justify-between mb-4">
          {/* Device Switcher */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {Object.entries(DEVICES).map(([key, dev]) => {
              const Icon = dev.icon
              return (
                <button
                  key={key}
                  onClick={() => handleDeviceChange(key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    activeDevice === key
                      ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{dev.name}</span>
                </button>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                title="Refresh preview"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
            
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={showPreview ? 'Hide preview' : 'Show preview'}
            >
              {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Toggle fullscreen"
            >
              <Maximize2 className="w-5 h-5" />
            </button>

            {profile?.username && (
              <a
                href={`/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Open live profile"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Preview Container */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`relative mx-auto ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900/80 flex items-center justify-center p-8' : ''}`}
          >
            {/* Device Frame */}
            <div
              className="relative bg-white dark:bg-gray-900 shadow-2xl overflow-hidden mx-auto"
              style={containerStyles}
            >
              {/* Browser Chrome (for desktop) */}
              {activeDevice === 'desktop' && (
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-white dark:bg-gray-700 rounded-md px-3 py-1 text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-center">
                      onelink.app/{previewProfile.username}
                    </div>
                  </div>
                </div>
              )}

              {/* Phone Notch (for mobile) */}
              {activeDevice === 'mobile' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-10" />
              )}

              {/* Profile Content */}
              <div 
                className="h-full overflow-y-auto overflow-x-hidden"
                style={{ 
                  backgroundColor: previewTheme.backgroundColor,
                  color: previewTheme.textColor
                }}
              >
                {/* Use Template Renderer if available */}
                {template ? (
                  <TemplateRenderer
                    template={template}
                    profile={previewProfile}
                    links={activeLinks}
                    theme={previewTheme}
                  />
                ) : (
                  // Default preview
                  <div className="min-h-full flex flex-col">
                    {/* Profile Header */}
                    <div className="flex-shrink-0 pt-8 pb-4 px-4">
                      <ProfileHeader
                        profile={previewProfile}
                        theme={previewTheme}
                      />
                    </div>

                    {/* Social Icons */}
                    {previewProfile.socialLinks && (
                      <div className="flex-shrink-0 py-4">
                        <SocialIcons
                          socialLinks={previewProfile.socialLinks}
                          theme={previewTheme}
                        />
                      </div>
                    )}

                    {/* Links */}
                    <div className="flex-1 px-4 py-4 space-y-3">
                      {activeLinks.length > 0 ? (
                        activeLinks.map((link, index) => (
                          <LinkButton
                            key={link.id || index}
                            link={link}
                            theme={previewTheme}
                            isPreview={true}
                          />
                        ))
                      ) : (
                        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                          <p className="text-sm">No links added yet</p>
                          <p className="text-xs mt-1">Add links to see them here</p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex-shrink-0 py-4">
                      <ProfileFooter theme={previewTheme} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Close Fullscreen Button */}
            {isFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Info */}
      {showPreview && (
        <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <DeviceIcon className="w-4 h-4" />
            {device.name} View
          </span>
          <span>•</span>
          <span>{activeLinks.length} links</span>
          <span>•</span>
          <span className="text-primary-500">Live Preview</span>
        </div>
      )}
    </div>
  )
}

/**
 * LivePreviewCompact - Smaller preview for sidebar
 */
export const LivePreviewCompact = ({
  profile = {},
  links = [],
  theme = {},
  className = ''
}) => {
  const previewProfile = {
    displayName: profile?.displayName || 'Your Name',
    bio: profile?.bio || 'Your bio',
    avatarURL: profile?.avatarURL,
    ...profile
  }

  const previewTheme = {
    primaryColor: theme?.primaryColor || '#3b82f6',
    backgroundColor: theme?.backgroundColor || '#ffffff',
    textColor: theme?.textColor || '#1f2937',
    ...theme
  }

  const activeLinks = links?.filter(link => link.isActive !== false) || []

  return (
    <div 
      className={`rounded-xl overflow-hidden shadow-lg ${className}`}
      style={{ 
        backgroundColor: previewTheme.backgroundColor,
        maxHeight: '400px'
      }}
    >
      <div className="p-4 text-center" style={{ color: previewTheme.textColor }}>
        {/* Avatar */}
        <div className="w-16 h-16 mx-auto rounded-full bg-gray-200 dark:bg-gray-700 mb-3 overflow-hidden">
          {previewProfile.avatarURL ? (
            <img 
              src={previewProfile.avatarURL} 
              alt={previewProfile.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
              {previewProfile.displayName?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
        </div>

        {/* Name & Bio */}
        <h3 className="font-semibold text-sm mb-1">{previewProfile.displayName}</h3>
        <p className="text-xs opacity-70 mb-3 line-clamp-2">{previewProfile.bio}</p>

        {/* Links Preview */}
        <div className="space-y-2">
          {activeLinks.slice(0, 3).map((link, index) => (
            <div
              key={link.id || index}
              className="py-2 px-3 rounded-lg text-xs font-medium"
              style={{ 
                backgroundColor: previewTheme.primaryColor,
                color: '#ffffff'
              }}
            >
              {link.title}
            </div>
          ))}
          {activeLinks.length > 3 && (
            <p className="text-xs opacity-50">+{activeLinks.length - 3} more</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default LivePreview
