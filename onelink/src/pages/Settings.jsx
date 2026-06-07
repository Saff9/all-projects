import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Shield, 
  Bell, 
  CreditCard, 
  LogOut,
  Moon,
  Sun,
  Palette,
  Globe,
  Loader2,
  ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'

// Import settings components
import { 
  ProfileSettings,
  AccountSettings,
  NotificationSettings,
  PrivacySettings,
  DangerZone 
} from '../components/settings'

// Import hooks
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { useTheme } from '../hooks/useTheme'
import { analyticsApi } from '../lib/api'

function Settings() {
  const navigate = useNavigate()
  const { user, logout, updateEmail, updatePassword, deleteAccount } = useAuth()
  const { profile, updateProfile, loading: profileLoading } = useProfile()
  const { theme, toggleTheme } = useTheme()
  
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Error logging out:', error)
      toast.error('Failed to log out')
    }
  }

  // Handle update email
  const handleUpdateEmail = async (newEmail, password) => {
    // This would connect to Firebase Auth
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Email updated successfully')
    } catch (error) {
      throw new Error('Failed to update email')
    }
  }

  // Handle update password
  const handleUpdatePassword = async (currentPassword, newPassword) => {
    // This would connect to Firebase Auth
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Password updated successfully')
    } catch (error) {
      throw new Error('Failed to update password')
    }
  }

  // Handle enable 2FA
  const handleEnable2FA = async (enabled) => {
    // This would connect to Firebase Auth
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      throw new Error('Failed to update 2FA settings')
    }
  }

  // Handle profile save
  const handleProfileSave = async (profileData) => {
    setIsLoading(true)
    try {
      await updateProfile(profileData)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Handle notification save
  const handleNotificationSave = async (notificationData) => {
    setIsLoading(true)
    try {
      await updateProfile({ notificationSettings: notificationData })
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Handle privacy save
  const handlePrivacySave = async (privacyData) => {
    setIsLoading(true)
    try {
      await updateProfile(privacyData)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Handle delete account
  const handleDeleteAccount = async () => {
    try {
      await deleteAccount()
      navigate('/')
    } catch (error) {
      throw error
    }
  }

  // Handle export data
  const handleExportData = async () => {
    try {
      const data = await analyticsService.exportAnalytics(profile?.id, 'json')
      return JSON.parse(data)
    } catch (error) {
      throw new Error('Failed to export data')
    }
  }

  // Settings tabs configuration
  const tabs = [
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: User,
      description: 'Manage your profile information'
    },
    { 
      id: 'account', 
      label: 'Account', 
      icon: Shield,
      description: 'Security and login settings'
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell,
      description: 'Control how you get notified'
    },
    { 
      id: 'privacy', 
      label: 'Privacy', 
      icon: Globe,
      description: 'Control who can see your content'
    },
    { 
      id: 'appearance', 
      label: 'Appearance', 
      icon: Palette,
      description: 'Customize the look and feel'
    },
    { 
      id: 'billing', 
      label: 'Billing', 
      icon: CreditCard,
      description: 'Manage your subscription'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-white">Settings</h1>
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 transition-colors"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-8"
        >
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 flex-shrink-0" />
                    <div className="hidden sm:block">
                      <p className="font-medium">{tab.label}</p>
                      <p className="text-xs text-slate-500">{tab.description}</p>
                    </div>
                  </button>
                ))}
                
                {/* Danger Zone */}
                <button
                  onClick={() => setActiveTab('danger')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeTab === 'danger'
                      ? 'bg-red-500/20 text-red-400'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Shield className="w-5 h-5 flex-shrink-0" />
                  <div className="hidden sm:block">
                    <p className="font-medium">Danger Zone</p>
                    <p className="text-xs text-slate-500">Delete account or export data</p>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 p-6">
                    <ProfileSettings
                      profile={profile}
                      onSave={handleProfileSave}
                      loading={profileLoading}
                    />
                  </div>
                )}

                {/* Account Tab */}
                {activeTab === 'account' && (
                  <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 p-6">
                    <AccountSettings
                      user={user}
                      onUpdateEmail={handleUpdateEmail}
                      onUpdatePassword={handleUpdatePassword}
                      onEnable2FA={handleEnable2FA}
                      onSignOut={handleLogout}
                    />
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 p-6">
                    <NotificationSettings
                      settings={profile?.notificationSettings}
                      onSave={handleNotificationSave}
                    />
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 p-6">
                    <PrivacySettings
                      settings={profile?.privacySettings}
                      profile={profile}
                      onSave={handlePrivacySave}
                    />
                  </div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                  <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                        <Palette className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Appearance Settings
                        </h3>
                        <p className="text-sm text-slate-400">
                          Customize the look and feel
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Theme Selection */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-3">
                          Theme
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => theme !== 'light' && toggleTheme()}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              theme === 'light'
                                ? 'border-blue-500 bg-blue-500/20'
                                : 'border-slate-600 hover:border-slate-500'
                            }`}
                          >
                            <Sun className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                            <p className="text-sm font-medium text-white">Light</p>
                          </button>
                          <button
                            onClick={() => theme !== 'dark' && toggleTheme()}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              theme === 'dark'
                                ? 'border-blue-500 bg-blue-500/20'
                                : 'border-slate-600 hover:border-slate-500'
                            }`}
                          >
                            <Moon className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                            <p className="text-sm font-medium text-white">Dark</p>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Billing Tab */}
                {activeTab === 'billing' && (
                  <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Billing & Subscription
                        </h3>
                        <p className="text-sm text-slate-400">
                          Manage your subscription plan
                        </p>
                      </div>
                    </div>

                    {/* Current Plan */}
                    <div className="p-4 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-400">Current Plan</p>
                          <p className="text-2xl font-bold text-white">Free Plan</p>
                          <p className="text-sm text-slate-400">Basic features for individuals</p>
                        </div>
                        <button className="btn-primary">
                          Upgrade to Pro
                        </button>
                      </div>
                    </div>

                    {/* Plan Features */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-white">Plan Features</h4>
                      {[
                        'Up to 5 links',
                        'Basic analytics',
                        '5 social links',
                        'Standard support'
                      ].map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 text-slate-400">
                          <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                            <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Danger Zone Tab */}
                {activeTab === 'danger' && (
                  <div className="bg-slate-800 rounded-2xl shadow-sm border border-slate-700 p-6">
                    <DangerZone
                      onDeleteAccount={handleDeleteAccount}
                      onExportData={handleExportData}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default Settings
