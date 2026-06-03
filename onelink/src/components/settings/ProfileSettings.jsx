import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Image, 
  Save, 
  Loader2,
  Check,
  AlertCircle,
  Camera,
  Trash2,
  ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'
import ThumbnailUploader from '../profile/ThumbnailUploader'

/**
 * ProfileSettings Component
 * Manage profile information
 */
const ProfileSettings = ({
  profile,
  onSave,
  loading = false,
  className = ''
}) => {
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    bio: '',
    avatarURL: null,
    coverImageURL: null
  })
  const [isSaving, setIsSaving] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState(null)
  const [checkingUsername, setCheckingUsername] = useState(false)

  // Initialize form data
  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        username: profile.username || '',
        bio: profile.bio || '',
        avatarURL: profile.avatarURL || null,
        coverImageURL: profile.coverImageURL || null
      })
    }
  }, [profile])

  // Handle input change
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Check username availability
    if (field === 'username' && value.length >= 3) {
      checkUsernameAvailability(value)
    } else if (field === 'username') {
      setUsernameAvailable(null)
    }
  }

  // Check username availability (mock - would connect to API)
  const checkUsernameAvailability = async (username) => {
    setCheckingUsername(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      // Mock: username is available unless it's 'admin' or 'user'
      setUsernameAvailable(username !== 'admin' && username !== 'user')
    } catch (error) {
      setUsernameAvailable(null)
    } finally {
      setCheckingUsername(false)
    }
  }

  // Handle save
  const handleSave = async () => {
    if (usernameAvailable === false) {
      toast.error('Username is not available')
      return
    }

    setIsSaving(true)
    try {
      await onSave(formData)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
          <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Profile Settings
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your public profile information
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Avatar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Profile Picture
          </label>
          <div className="flex items-start gap-4">
            <ThumbnailUploader
              value={formData.avatarURL}
              onChange={(avatarURL) => handleChange('avatarURL', avatarURL)}
              aspectRatio="square"
              className="flex-shrink-0"
            />
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Recommended size: 400x400 pixels. Square images work best.
              </p>
              {formData.avatarURL && (
                <button
                  onClick={() => handleChange('avatarURL', null)}
                  className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Display Name *
          </label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => handleChange('displayName', e.target.value)}
            className="input-field"
            placeholder="Your display name"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            This is the name shown on your profile
          </p>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Username *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">onelink.app/</span>
            </div>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              className="input-field pl-32"
              placeholder="username"
              required
            />
            {checkingUsername && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              </div>
            )}
            {!checkingUsername && usernameAvailable !== null && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {usernameAvailable ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            )}
          </div>
          {usernameAvailable === false && (
            <p className="text-xs text-red-500 mt-1">
              This username is not available
            </p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            className="input-field h-24 resize-none"
            placeholder="Tell your visitors about yourself"
            maxLength={150}
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {formData.bio.length}/150 characters
          </p>
        </div>

        {/* Profile Preview */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Profile Preview
          </h4>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
              {formData.avatarURL?.url || formData.avatarURL ? (
                <img 
                  src={formData.avatarURL?.url || formData.avatarURL} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                  {formData.displayName?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formData.displayName || 'Your Name'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{formData.username || 'username'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {formData.bio || 'Your bio will appear here'}
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSave}
            disabled={isSaving || usernameAvailable === false}
            className="btn-primary flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileSettings
