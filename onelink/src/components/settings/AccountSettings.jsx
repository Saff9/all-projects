import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  Lock, 
  Key, 
  Shield, 
  Eye, 
  EyeOff,
  Loader2,
  Check,
  AlertCircle,
  ExternalLink,
  Smartphone,
  LogOut,
  AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * AccountSettings Component
 * Manage account settings including email, password, and security
 */
const AccountSettings = ({
  user,
  onUpdateEmail,
  onUpdatePassword,
  onEnable2FA,
  onSignOut,
  className = ''
}) => {
  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  // Handle email update
  const handleEmailUpdate = async (e) => {
    e.preventDefault()
    if (!email || !currentPassword) {
      toast.error('Please fill in all fields')
      return
    }

    setIsUpdatingEmail(true)
    try {
      await onUpdateEmail(email, currentPassword)
      toast.success('Email updated successfully')
      setShowEmailForm(false)
      setCurrentPassword('')
    } catch (error) {
      console.error('Error updating email:', error)
      toast.error(error.message || 'Failed to update email')
    } finally {
      setIsUpdatingEmail(false)
    }
  }

  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setIsUpdatingPassword(true)
    try {
      await onUpdatePassword(currentPassword, newPassword)
      toast.success('Password updated successfully')
      setShowPasswordForm(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Error updating password:', error)
      toast.error(error.message || 'Failed to update password')
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  // Handle 2FA toggle
  const handle2FAToggle = async () => {
    try {
      await onEnable2FA(!is2FAEnabled)
      setIs2FAEnabled(!is2FAEnabled)
      toast.success(is2FAEnabled ? '2FA disabled' : '2FA enabled')
    } catch (error) {
      console.error('Error toggling 2FA:', error)
      toast.error(error.message || 'Failed to update 2FA settings')
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-secondary-100 dark:bg-secondary-900/30 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Account Settings
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your account security and credentials
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Email Section */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email Address</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>
            {!showEmailForm && (
              <button
                onClick={() => setShowEmailForm(true)}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700"
              >
                Change
              </button>
            )}
          </div>

          {showEmailForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handleEmailUpdate}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="new@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailForm(false)
                    setEmail(user?.email || '')
                    setCurrentPassword('')
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingEmail}
                  className="btn-primary flex items-center gap-2"
                >
                  {isUpdatingEmail && <Loader2 className="w-4 h-4 animate-spin" />}
                  Update Email
                </button>
              </div>
            </motion.form>
          )}
        </div>

        {/* Password Section */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Password</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last changed: Never
                </p>
              </div>
            </div>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700"
              >
                Change
              </button>
            )}
          </div>

          {showPasswordForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handlePasswordUpdate}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter new password"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false)
                    setCurrentPassword('')
                    setNewPassword('')
                    setConfirmPassword('')
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="btn-primary flex items-center gap-2"
                >
                  {isUpdatingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                  Update Password
                </button>
              </div>
            </motion.form>
          )}
        </div>

        {/* Two-Factor Authentication */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add an extra layer of security
                </p>
              </div>
            </div>
            <button
              onClick={handle2FAToggle}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                is2FAEnabled ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  is2FAEnabled ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Sign Out */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Sign Out</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sign out from all devices
                </p>
              </div>
            </div>
            <button
              onClick={onSignOut}
              className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountSettings
